# MongoDB Connection Fix

## Problem
`mongodb+srv` SRV DNS lookup is being blocked by your network/firewall.

Error: `querySrv ECONNREFUSED _mongodb._tcp.physio.xvyjtfr.mongodb.net`

## Solution Options

### Option 1: Use Standard Connection String (RECOMMENDED)

Replace the `mongodb+srv://` URL with a direct connection string.

**Steps:**
1. Go to MongoDB Atlas: https://cloud.mongodb.com/
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Standard connection string" (not SRV)
5. Copy the connection string (it will look like below)

Replace in `.env.local`:
```env
# OLD (SRV - not working)
MONGODB_URI=mongodb+srv://nadeem:redmiwatch@physio.xvyjtfr.mongodb.net/physio?retryWrites=true&w=majority&appName=physio

# NEW (Standard - should work)
MONGODB_URI=mongodb://physio-shard-00-00.xvyjtfr.mongodb.net:27017,physio-shard-00-01.xvyjtfr.mongodb.net:27017,physio-shard-00-02.xvyjtfr.mongodb.net:27017/physio?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

**Note:** You need to get the exact standard connection string from MongoDB Atlas dashboard.

---

### Option 2: Fix Network DNS (Advanced)

If you want to keep using `mongodb+srv`:

1. **Windows DNS Flush:**
   ```powershell
   ipconfig /flushdns
   Clear-DnsClientCache
   ```

2. **Change Windows DNS to Google:**
   - Open Network Settings
   - Change adapter options
   - Right-click your network → Properties
   - Select IPv4 → Properties
   - Use these DNS servers:
     - Preferred: 8.8.8.8
     - Alternate: 8.8.4.4

3. **Restart your terminal and try again**

---

### Option 3: Whitelist Your IP in MongoDB Atlas

1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Click "Add Current IP Address"
4. Or add `0.0.0.0/0` (allows all - only for testing!)

---

## Quick Test

After changing `.env.local`, restart your dev server:

```bash
# Stop current server (Ctrl+C)
npm run dev
```

Try signing up - you should see:
```
✅ MongoDB connected successfully
```

## Current Code Improvements

I've already updated `app/lib/mongodb.ts` with:
- ✅ IPv4 enforcement (`family: 4`)
- ✅ Better timeout settings
- ✅ DNS result order preference
- ✅ Improved error logging

These changes help, but the **standard connection string** is the most reliable fix.
