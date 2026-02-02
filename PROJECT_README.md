# PhysioConnect - Physiotherapy Management Platform

A comprehensive Next.js application for managing physiotherapy services with role-based dashboards for Admins, Physiotherapists, and Patients.

## Features

### 🔐 Authentication & Authorization
- **Role-based signup** with different forms for:
  - **Admin**: Email, password, and secret code (`ZBK897`)
  - **Physiotherapist**: Complete profile including degrees, specialities, cities, and more
  - **Patient**: Basic information with age and contact details
- Simple email/password login for all users
- Client-side session management with localStorage

### 👨‍💼 Admin Dashboard
- Overview statistics (total patients, physiotherapists, active/closed cases)
- View all physiotherapists with their profiles and assigned patients
- View all patients with their case information
- Browse all cases with full details and comments
- Monitor patient-physiotherapist mappings

### 👨‍⚕️ Physiotherapist Dashboard
- View assigned cases with patient details
- Real-time case management with comment system
- Request case closure when treatment is complete
- Browse available cases in their service cities
- Pick and assign themselves to unmapped patient cases
- Filter cases by status (open, pending closure)

### 🏥 Patient Dashboard
- Create new case with issue details and preferences
- Choose specific physiotherapist or set gender preference
- View active case with physiotherapist details
- Real-time communication through comments
- Receive case closure requests
- Provide ratings and reviews when closing cases
- View treatment history

## Tech Stack

- **Framework**: Next.js 16 (App Directory)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Data**: Mock data (ready for MongoDB integration)
- **State**: React Hooks + localStorage

## Project Structure

```
app/
├── api/                      # API Routes
│   ├── auth/                 # Authentication endpoints
│   │   ├── login/
│   │   └── signup/
│   ├── cases/                # Case management endpoints
│   │   ├── [id]/
│   │   │   ├── assign/
│   │   │   ├── close/
│   │   │   ├── comments/
│   │   │   └── request-closure/
│   │   ├── patient/[id]/
│   │   ├── physiotherapist/[id]/
│   │   └── unmapped/
│   ├── users/                # User endpoints
│   │   ├── physiotherapists/
│   │   └── patients/
│   └── admin/                # Admin endpoints
│       └── stats/
├── components/               # Reusable UI components
│   ├── AdminDashboard.tsx
│   ├── PhysiotherapistDashboard.tsx
│   ├── PatientDashboard.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── TextArea.tsx
│   ├── MultiSelect.tsx
│   └── CheckBox.tsx
├── lib/                      # Utilities & data
│   ├── mockData.ts          # Mock database
│   └── db.ts                # Database placeholder (for MongoDB)
├── types/                    # TypeScript definitions
│   └── index.ts
├── login/                    # Login page
├── signup/                   # Signup page
├── dashboard/                # Main dashboard router
└── page.tsx                  # Landing page
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd next-physio
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Test Accounts

Use these pre-configured accounts for testing:

**Admin:**
- Email: `admin@physio.com`
- Password: `admin123`
- Secret Code: `ZBK897`

**Physiotherapist:**
- Email: `john.doe@physio.com`
- Password: `physio123`

**Patient:**
- Email: `alice@example.com`
- Password: `patient123`

### Creating a New Account

1. Navigate to `/signup`
2. Select your role (Admin, Physiotherapist, or Patient)
3. Fill in the required fields based on your role
4. Submit the form
5. You'll be automatically redirected to your dashboard

### Workflow Examples

#### Patient Journey
1. Sign up as a patient
2. Create a new case with issue details
3. Select a city and preferences
4. Wait for physiotherapist assignment (or choose specific one)
5. Communicate via comments
6. Review and close case when treatment completes

#### Physiotherapist Journey
1. Sign up with professional details
2. View assigned cases or browse available cases
3. Pick unmapped cases in your cities
4. Add progress comments
5. Request case closure when ready
6. Wait for patient confirmation

#### Admin Journey
1. Login with admin credentials
2. Monitor platform statistics
3. View all users and cases
4. Track patient-physiotherapist mappings
5. Review case details and communications

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Cases
- `GET /api/cases` - Get all cases
- `POST /api/cases` - Create new case
- `GET /api/cases/patient/:id` - Get patient's cases
- `GET /api/cases/physiotherapist/:id` - Get physiotherapist's cases
- `GET /api/cases/unmapped?cities=...` - Get unassigned cases
- `POST /api/cases/:id/assign` - Assign physiotherapist to case
- `POST /api/cases/:id/comments` - Add comment to case
- `POST /api/cases/:id/request-closure` - Request case closure
- `POST /api/cases/:id/close` - Close case with review

### Users
- `GET /api/users/physiotherapists?city=...` - Get physiotherapists
- `GET /api/users/patients` - Get all patients

### Admin
- `GET /api/admin/stats` - Get platform statistics

## MongoDB Integration

The project is structured for easy MongoDB integration:

1. Install MongoDB driver:
```bash
npm install mongodb
```

2. Update `app/lib/db.ts` with your MongoDB connection
3. Replace mock data functions in API routes with database queries
4. Add password hashing with bcrypt
5. Implement proper session management (JWT/NextAuth)

## Future Enhancements

- [ ] MongoDB integration
- [ ] JWT-based authentication
- [ ] Email notifications
- [ ] File upload for medical documents
- [ ] Video consultation integration
- [ ] Payment gateway integration
- [ ] Advanced search and filtering
- [ ] Analytics and reporting
- [ ] Mobile responsive improvements
- [ ] PWA support

## Code Quality

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Configured with Next.js and TypeScript rules
- **Reusable Components**: DRY principle followed throughout
- **Clean Architecture**: Separation of concerns with clear folder structure
- **API Design**: RESTful endpoints with consistent response format

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npx tsc --noEmit # Type check without emitting files
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and type checks
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
