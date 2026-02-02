# Quick Start Guide - PhysioConnect

## 🚀 What Has Been Built

A complete physiotherapy management platform with:

### ✅ Authentication System
- Multi-role signup (Admin, Physiotherapist, Patient)
- Login system
- Role-based form validation
- Admin secret code: `ZBK897`

### ✅ Three Dashboards

1. **Admin Dashboard**
   - Platform statistics
   - View all users (physiotherapists & patients)
   - View all cases
   - Track patient-physiotherapist mappings

2. **Physiotherapist Dashboard**
   - My Cases view
   - Available Cases (unmapped in their cities)
   - Add comments/updates
   - Request case closure
   - Pick new cases

3. **Patient Dashboard**
   - Create new case form
   - View active case
   - Communication with physiotherapist
   - Approve case closure with rating/review

### ✅ Complete API Layer
- 15+ API endpoints for authentication, case management, and user data
- RESTful design
- Consistent error handling
- Ready for MongoDB integration

### ✅ Reusable Components
- Input, Select, TextArea, MultiSelect
- Button, Card, CheckBox
- Clean, consistent styling with Tailwind CSS

## 📝 Test Credentials

### Admin
```
Email: admin@physio.com
Password: admin123
Secret Code: ZBK897
```

### Physiotherapist
```
Email: john.doe@physio.com
Password: physio123
(Cities: Mumbai, Navi Mumbai)

Email: sarah.smith@physio.com
Password: physio123
(Cities: Pune, Mumbai)
```

### Patient
```
Email: alice@example.com
Password: patient123

Email: bob@example.com
Password: patient123
```

## 🎯 How to Test

### 1. Start the Server
```bash
npm run dev
```
Visit: http://localhost:3000

### 2. Test Patient Flow
1. Login as `alice@example.com` / `patient123`
2. You'll see an active case with Dr. John Doe
3. Add a comment
4. View communication history

**OR** Login as `charlie@example.com` / `patient123`
- Create a new case
- Fill in issue details, city, preferences
- Submit and wait for physiotherapist

### 3. Test Physiotherapist Flow
1. Login as `john.doe@physio.com` / `physio123`
2. View "My Cases" - see assigned patients
3. Click on a case to view details
4. Add progress comments
5. Request case closure
6. Switch to "Available Cases" to see unmapped patients

### 4. Test Admin Flow
1. Login as `admin@physio.com` / `admin123`
2. View overview statistics
3. Click "Physiotherapists" to see all therapists and their patients
4. Click "Patients" to see patient profiles
5. Click "Cases" to see all case details and communication

### 5. Test Signup Flow
1. Go to `/signup`
2. Select "Patient"
3. Fill in: email, password, contact number, age
4. Submit → Auto redirected to dashboard

## 📁 Key Files

### Pages
- `/` - Landing page
- `/login` - Login page
- `/signup` - Role-based signup
- `/dashboard` - Main dashboard router

### Components
- `AdminDashboard.tsx` - Admin view
- `PhysiotherapistDashboard.tsx` - Physio view
- `PatientDashboard.tsx` - Patient view

### API Routes
All in `/app/api/`:
- `auth/login` & `auth/signup`
- `cases/*` - Case management
- `users/*` - User queries
- `admin/*` - Admin stats

### Data
- `app/lib/mockData.ts` - Mock database with sample users and cases

## 🔄 Case Lifecycle

1. **Patient creates case** → Status: `open`, no physiotherapist
2. **Physiotherapist picks case** → Status: `open`, physiotherapist assigned
3. **Treatment & comments** → Both parties add updates
4. **Physio requests closure** → Status: `pending_closure`
5. **Patient approves with review** → Status: `closed`

## 🎨 Features Highlights

### Smart Form Validation
- Email format validation
- Required field checks
- Role-specific validation (admin secret code, etc.)

### Real-time Updates
- Comment system with timestamps
- Status tracking
- User attribution

### City-based Matching
- Physiotherapists see cases in their service cities
- Patients can choose from local therapists

### Review System
- 1-5 star rating
- Written feedback
- Visible to admin

## 🔐 Security Notes

**Current Implementation** (for development):
- Passwords stored in plain text in mockData
- No JWT tokens
- localStorage for session

**For Production** (TODO):
- Hash passwords with bcrypt
- Implement JWT or NextAuth
- Add httpOnly cookies
- Server-side session validation

## 🗄️ MongoDB Integration Ready

All API routes are structured to easily swap mock data with MongoDB:

```typescript
// Current
import { mockUsers } from '@/app/lib/mockData';

// Future
import { connectDB } from '@/app/lib/db';
const users = await db.collection('users').find().toArray();
```

## 🚦 Next Steps

1. **Test all features** with provided credentials
2. **Customize styling** as needed
3. **Add MongoDB** connection
4. **Implement real authentication**
5. **Add email notifications**
6. **Deploy to Vercel**

## 💡 Tips

- All forms have validation
- Comments show user name and role
- Admin can see everything
- Physiotherapists only see cases in their cities
- Patients can only create one active case at a time

## ⚡ Performance

- Server components by default
- Client components only where needed (`"use client"`)
- Optimized re-renders
- Efficient data fetching

Enjoy testing PhysioConnect! 🎉
