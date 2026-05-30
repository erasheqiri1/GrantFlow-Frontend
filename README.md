# GrantFlow — Frontend

> React 19 client for the GrantFlow grant management platform.

![React](https://img.shields.io/badge/React-19.2.6-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-latest-646CFF?logo=vite&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?logo=reactquery&logoColor=white)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Authentication](#authentication)

---

## Overview

GrantFlow Frontend provides role-specific interfaces for four user types: Applicants, Org Admins, Commissioners, and Super Admins. Authentication is handled via JWT with automatic token refresh, and all API calls are centralized through Axios interceptors.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.6 | UI framework |
| React Router | v7.15 | Client-side routing |
| TanStack Query | v5.100 | Server state management and caching |
| Zustand | v5.0 | Global client state |
| Axios | v1.16 | HTTP client with interceptors |
| React Hook Form | v7.76 | Form handling and validation |
| Tailwind CSS | — | Styling |
| Vite | — | Build tool and dev server |

---

## Prerequisites

- Node.js 18+
- npm 9+
- GrantFlow Backend running at `http://localhost:8000`

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/GrantFlow-Frontend.git
cd GrantFlow-Frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Start the development server

```bash
npm run frontend
```

The app runs at **`http://localhost:5173`**.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL of the GrantFlow Backend API | `http://localhost:8000` |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run frontend` | Start Vite dev server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
src/
├── api/                    # Axios service functions per resource
│   ├── auth.js
│   ├── grants.js
│   ├── applications.js
│   └── ...
├── assets/                 # Static assets (images, icons)
├── components/
│   ├── layout/             # ProtectedRoute, role-specific headers
│   ├── Pagination.jsx
│   └── ChatWidget.jsx
├── context/
│   └── AuthContext.jsx     # Auth state + useAuth() hook
├── pages/
│   ├── applicant/          # GrantsPage, GrantDetailPage, MyApplicationsPage
│   │                       # ApplicationDetailPage, ApplyPage, ProfilePage
│   ├── commissioner/       # CommissionerDashboard, CommissionerApplicationsPage
│   ├── org-admin/          # OrgDashboard, GrantsManagePage, GrantFormPage
│   │                       # ApplicationsReviewPage, PaymentsPage, TeamPage
│   ├── super-admin/        # SuperAdminDashboard, PendingOrgsPage, UsersListPage
│   │                       # AuditLogsPage, ManagePermissionsPage, AddSuperAdminPage
│   └── auth/               # LoginPage, RegisterPage, OrgRegisterPage
│                           # AcceptInvitePage, ForgotPasswordPage
│                           # ResetPasswordPage, VerifyEmailPage
├── store/                  # Zustand global state slices
└── styles/                 # Tailwind CSS configuration
```

---

## Authentication

- JWT access and refresh tokens managed in `AuthContext`
- Axios request interceptor attaches `Authorization: Bearer <token>` to every request
- Axios response interceptor detects `401` responses, pauses the request queue, silently refreshes the token, then retries all queued requests
- `ProtectedRoute` checks role and authentication state before rendering any page

---

## Backend

See [GrantFlow-Backend](https://github.com/<your-org>/GrantFlow-Backend) for full system documentation, architecture diagrams, API reference, and setup instructions.
