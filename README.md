# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Folder and File Structure
```
2026-animal-health-fe/
├── public/
│   └── favicon.ico                 # Application favicon
├── src/
│   ├── assets/
│   │   ├── icons/                  # SVG/PNG icons (vaccines, pets, etc.)
│   │   ├── images/                 # Static images and UI illustrations
│   │   └── logos/                  # Official clinic logos
│   ├── components/
│   │   ├── cards/
│   │   │   ├── AppointmentCard.jsx       # Card for displaying appointments
│   │   │   ├── PetCard.jsx               # Card for displaying pets
│   │   │   ├── TreatmentCard.jsx         # Card for displaying treatments
│   │   │   └── VaccineCard.jsx           # Card for displaying vaccines
│   │   ├── common/
│   │   │   ├── Button.jsx                # Reusable button component
│   │   │   ├── Input.jsx                 # Reusable input component
│   │   │   ├── Loader.jsx                # Loading/spinner component
│   │   │   ├── Modal.jsx                 # Generic modal component
│   │   │   ├── Pagination.jsx            # Pagination component
│   │   │   └── Select.jsx                # Reusable select component
│   │   ├── forms/
│   │   │   ├── AppointmentForm.jsx       # Form for creating/editing appointments
│   │   │   ├── ConsultationForm.jsx      # Form for veterinary consultations
│   │   │   ├── LaboratoryForm.jsx        # Form with a multi-select dropdown for tests
│   │   │   ├── MedicationForm.jsx        # Form with autocomplete
│   │   │   └── PetForm.jsx               # Form for creating/editing pets
│   │   ├── layout/
│   │   │   ├── ClientLayout.jsx          # Container with sidebar/navbar for clients
│   │   │   ├── Footer.jsx                # Footer component
│   │   │   ├── Navbar.jsx                # Navigation bar
│   │   │   ├── Sidebar.jsx               # Sidebar
│   │   │   └── VeterinarianLayout.jsx    # Container adapted for veterinarians
│   │   ├── modals/
│   │   │   ├── AppointmentModal.jsx      # Modal for managing appointments
│   │   │   ├── ConfirmDeleteModal.jsx    # Delete confirmation modal
│   │   │   └── UploadPdfModal.jsx        # Modal for attaching lab PDFs
│   │   └── tables/
│   │       ├── AppointmentsTable.jsx     # Appointments table
│   │       ├── MedicationsTable.jsx      # Prescribed medications table
│   │       ├── PetsTable.jsx             # Pets table
│   │       ├── ReportsTable.jsx          # Reports table
│   │       └── TreatmentsTable.jsx       # Treatments table
│   ├── constants/
│   │   ├── apiRoutes.js                  # API routes
│   │   ├── appointmentStatus.js          # Appointment statuses
│   │   ├── laboratoryStatus.js           # Lab statuses (PENDING, COMPLETED)
│   │   └── userRoles.js                  # User roles (CLIENT, VETERINARIAN)
│   ├── hooks/                            # Custom hooks with React Query
│   │   ├── useAppointments.js            # Appointment management logic
│   │   ├── useAuth.js                    # Authentication logic
│   │   ├── useLaboratory.js              # Logic for lab reports and file uploads
│   │   ├── usePets.js                    # Logic for pet management
│   │   └── useTreatments.js              # Logic for medications and treatment logs
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx                 # Single login screen
│   │   │   ├── RegisterClient.jsx        # Client registration
│   │   │   └── Unauthorized.jsx          # Access denied page
│   │   ├── client/
│   │   │   ├── Dashboard.jsx             # Daily summary and alerts
│   │   │   ├── ai/
│   │   │   │   └── Recommendations.jsx   # AI recommendations with disclaimer
│   │   │   ├── appointments/
│   │   │   │   ├── AppointmentCalendar.jsx # Appointment calendar
│   │   │   │   └── AppointmentHistory.jsx  # Appointment history
│   │   │   ├── medications/
│   │   │   │   └── TreatmentReminders.jsx  # Medication Reminder Log
│   │   │   └── pets/
│   │   │       ├── PetDetails.jsx          # Complete pet history
│   │   │       └── PetList.jsx             # List of pets
│   │   ├── veterinarian/
│   │   │   ├── DashboardVet.jsx            # Dashboard for veterinarians
│   │   │   ├── consultations/
│   │   │   │   └── CreateConsultation.jsx  # Consultation panel + AI alerts
│   │   │   ├── laboratory/
│   │   │   │   └── LabManagement.jsx       # Lab order management
│   │   │   └── reports/
│   │   │       └── ClinicalReports.jsx     # Clinical reports with filters
│   │   └── shared/                         # Pages shared across roles
│   ├── routes/
│   │   ├── AppRouter.jsx                   # Main router (React Router)
│   │   ├── ProtectedRoute.jsx              # Active session validator (JWT)
│   │   └── RoleGuard.jsx                   # Role-based filtering (CLIENT vs VET)
│   ├── services/                           # API services with Axios
│   │   ├── api.js                          # Axios base configuration + interceptors
│   │   ├── aiService.js                    # AI services
│   │   ├── authService.js                  # Authentication services
│   │   ├── laboratoryService.js            # Laboratory services
│   │   └── petService.js                   # Pet services
│   ├── stores/                             # Global state with Zustand
│   │   ├── useAuthStore.js                 # Authentication store (user, token, role)
│   │   └── useThemeStore.js                # Theme store (light/dark mode)
│   ├── styles/
│   │   └── index.css                       # Tailwind CSS configuration
│   ├── App.jsx                             # Root component
│   └── main.jsx                            # Entry point (renders App)
├── .gitignore
├── eslint.config.js                        # ESLint configuration
├── index.html                              # Main HTML
├── package.json                            # Project dependencies
├── tailwind.config.js                      # Tailwind CSS configuration
└── vite.config.js                          # Vite configuration
```

### Description by Module

- **`src/components/`**: Reusable components organized by type (cards, forms, layout, modals, tables)
- **`src/pages/`**: Views organized by role (client, veterinarian) and functionality (auth, shared)
- **`src/services/`**: Axios configuration and API services integrated with FastAPI
- **`src/stores/`**: Global state using Zustand (authentication and theme)
- **`src/hooks/`**: Custom logic integrating React Query and services
- **`src/constants/`**: API constants, states, and roles
- **`src/routes/`**: Route definitions with role-based access control and guards

## Technologies

**React + Vite** principal Framework

**react-router-dom** Routing  npm install react-router-dom

**axios** API Usage npm install axios

**react-hook-form** Forms Management npm install react-hook-form

**zod** Form Validation npm install zod

**date-fns** Date Management npm install date-fns

**react-toastify** Notifications npm install react-toastify

**react-pdf** PDF Viewer npm install react-pdf
**lucide-react** Icons npm install lucide-react

**Tailwind css** Styles npm install tailwindcss @tailwindcss/vite

**API REST**

**JavaScript**

**Firebase** Authentication

## Requirements

- Node.js 20+
- Python 3.10+
- Firebase project with Firestore enabled
- Firebase Admin service account JSON

## Configuration

Use [.env.example](.env.example) as the environment variable reference.

The backend refuses to start in production without `SECRET_KEY`. The Firebase credential file must remain outside version control.

Profile photo uploads also require the exact Firebase Storage bucket name:

```env
FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
```

Copy the bucket name shown in the Firebase Console under Storage.

## Frontend

```powershell
npm install
npm run dev
```

Default URL: `http://localhost:5173`

## Verification

```powershell
npm run lint
npm run test
npm run build
```
