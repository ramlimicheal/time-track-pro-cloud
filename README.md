# Employee Timesheet Management System

A comprehensive employee timesheet and workforce management application built with React, TypeScript, Vite, and Supabase.

## Features

### For Employees
- Work timer with start/stop functionality
- Quick timesheet entry
- View work history (day/month/year views)
- Leave application submission
- Leave balance tracking
- Profile management
- Real-time activity tracking

### For Administrators
- Employee management (add, edit, delete)
- User role management
- Timesheet review and approval
- Leave application review
- Live employee activity monitoring
- Advanced analytics and reports
- Audit trail
- Department and overtime summaries
- Workforce insights and metrics

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Radix UI primitives

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

## Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── history/        # History view components
│   ├── layout/         # Layout components
│   ├── notifications/  # Notification components
│   ├── timesheet/      # Timesheet components
│   └── ui/             # Reusable UI components (shadcn)
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Key Features Breakdown

### Authentication & Authorization
- Role-based access control (Employee, Manager, Admin)
- Secure login system
- Profile management

### Time Tracking
- Real-time work timer
- Manual timesheet entry
- Historical time records
- Multiple view modes (day, month, year)

### Leave Management
- Leave application submission
- Leave balance tracking
- Admin approval workflow
- Leave history

### Analytics & Reporting
- Work hour analytics
- Department summaries
- Overtime tracking
- Performance insights
- Exportable reports

### Admin Tools
- Employee CRUD operations
- Timesheet approval system
- User management
- Audit trail
- Live activity monitoring

## Database Setup

This application uses Supabase for data persistence. You'll need to set up the following tables in your Supabase project:

- `employees` - Employee information
- `timesheets` - Time entry records
- `leave_applications` - Leave requests
- `users` - User authentication data
- Additional tables for audit trails and analytics

Refer to the Supabase documentation for migration setup.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For support, please contact your system administrator.
