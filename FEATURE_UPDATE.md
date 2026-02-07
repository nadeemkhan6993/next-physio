# Feature Update - Patient Case Management

## ✅ Implemented Features

### 1. **City-Based Physiotherapist Selection for Patients**

**What it does:**
- When a patient creates a case and selects a city, they can now see and choose from physiotherapists available in that city
- Shows detailed information about each physiotherapist including:
  - Name and degrees
  - Specialties
  - Years of practice (since when they've been practicing)
  - Gender
- Patient can choose a specific physiotherapist OR select "No Preference (Auto-assign)"

**How it works:**
1. Patient fills out case details
2. Selects their city
3. System fetches and displays all physiotherapists serving that city
4. Patient can either:
   - Choose a specific physiotherapist (assigns immediately)
   - Select "No Preference" and optionally set gender preference

**City Validation:**
- Backend validates that selected physiotherapist actually serves the case city
- Returns error if there's a mismatch
- Automatically sets case status to `in_progress` when physiotherapist is assigned

---

### 2. **Create New Case Button**

**What it does:**
- Patients with active or closed cases can now create new cases anytime
- "Create New Case" button appears at the top-right when viewing an active case
- Allows patients to start a new treatment even while one is ongoing

**How it works:**
1. Patient viewing active case sees "+ Create New Case" button
2. Clicking it shows the case creation form
3. Patient can fill out new case or cancel to go back
4. Form resets after successful submission

**Use Cases:**
- Patient wants treatment for a new issue
- Patient recovered and needs help with different problem
- Patient wants second opinion from different physiotherapist

---

### 3. **Enhanced Physiotherapist Self-Assignment** (Already Working)

**Verification:**
- ✅ Physiotherapists see "Available Cases" filtered by their service cities
- ✅ Can pick cases in cities they serve
- ✅ Backend validates city matching on assignment
- ✅ Assignment fails if cities don't match

---

## Technical Details

### Files Modified:

1. **`app/components/PatientDashboard.tsx`**
   - Added `showCreateForm` state to toggle between viewing case and creating new one
   - Added physiotherapist selection UI with radio-style cards
   - Shows list of available physiotherapists when city is selected
   - Added "Create New Case" button in active case view
   - Cancel button to go back from form to active case view

2. **`app/api/cases/route.ts`** (POST endpoint)
   - Added city validation when patient selects specific physiotherapist
   - Returns error if physiotherapist doesn't serve selected city
   - Sets case status to `in_progress` when physiotherapist is assigned
   - Better error handling for invalid physiotherapist selection

### API Validations:

**Case Creation (`POST /api/cases`):**
```typescript
if (preferredPhysiotherapistId) {
  // Verify physiotherapist exists and is valid
  // Verify physiotherapist serves the case city
  // Assign and set status to 'in_progress'
}
```

**Case Assignment (`POST /api/cases/[id]/assign`):**
```typescript
// Already validated:
// - Physiotherapist must serve the case city
// - Returns error with list of served cities if mismatch
```

---

## User Experience

### Patient Flow:

1. **Creating First Case:**
   ```
   Dashboard → Fill issue details → Select city → 
   Choose physiotherapist (optional) → Submit → 
   Case created (assigned or open)
   ```

2. **Creating New Case (with existing case):**
   ```
   View Active Case → Click "+ Create New Case" → 
   Fill new issue → Select city → Choose physio → Submit →
   New case created
   ```

3. **Physiotherapist Selection:**
   ```
   - Select city
   - See list of available physiotherapists
   - Click on any card to select them
   - Or click "No Preference" for auto-assignment
   - Submit case
   ```

### Physiotherapist Flow:

1. **Finding Cases:**
   ```
   Dashboard → "Available Cases" tab → 
   See unmapped cases in their cities → 
   Click "Pick Case" → Assigned
   ```

---

## Testing

### To Test:

1. **Patient selecting physiotherapist:**
   ```bash
   npm run dev
   ```
   - Login as patient (e.g., `alice@example.com`)
   - Create new case if none exists
   - Select a city (e.g., Mumbai)
   - Observe list of physiotherapists
   - Select one and submit
   - Case should be assigned immediately with status "in_progress"

2. **Create New Case button:**
   - Login as patient with active case
   - See "+ Create New Case" button at top-right
   - Click it → Form appears
   - Fill and submit → New case created
   - Click "Cancel" → Returns to active case view

3. **City validation:**
   - Try to select physiotherapist who doesn't serve selected city
   - Should see error: "Selected physiotherapist does not serve {city}"

4. **Physiotherapist self-assignment:**
   - Login as physiotherapist (e.g., `john.doe@physio.com`)
   - Go to "Available Cases" tab
   - Should only see cases in cities they serve (Mumbai, Navi Mumbai)
   - Pick a case → Should assign successfully

---

## Database Impact

### Case Model Fields Used:
- `city` - Required field for matching
- `physiotherapistId` - Set when patient selects or physio assigns
- `status` - Set to 'in_progress' when assigned, 'open' otherwise
- `preferredGender` - Optional, only used when no specific physio selected

### Query Performance:
- API filters physiotherapists by city: `{ citiesAvailable: city }`
- Unmapped cases query: `{ city: { $in: cities }, physiotherapistId: null }`
- Both use existing indexes on User and Case models

---

## Security & Validation

✅ **Backend validates:**
- Patient ID exists and is valid patient
- Physiotherapist ID exists and is valid physiotherapist  
- City matching between case and physiotherapist's served cities
- Case is not already assigned

✅ **Frontend validates:**
- Required fields (issue details, city)
- City selection required before showing physiotherapists
- Clear error messages for validation failures

---

## Future Enhancements (Optional)

- Add physiotherapist ratings/reviews display in selection list
- Show physiotherapist availability/busy status
- Add distance/location-based sorting
- Implement favorite physiotherapists feature
- Add chat/messaging during case assignment
- Email notifications when case is assigned

---

## Notes

- All existing functionality preserved
- No breaking changes to API contracts
- Works with existing MongoDB schema
- Compatible with admin assignment feature
- Follows existing code patterns and conventions
