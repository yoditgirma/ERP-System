# ERP System Documentation

Welcome to the ERP System documentation.

This documentation is intended for developers, interns, and contributors who want to understand, maintain, or extend the system.

---

# Project Overview

The ERP System is a web-based Enterprise Resource Planning (ERP) application designed to manage different business operations in one centralized platform.

The system follows a modern full-stack architecture:

- Frontend: React + Vite + Tailwind CSS
- Backend: Django REST Framework
- Database: PostgreSQL
- Authentication: JWT

The project is built to be modular so additional ERP modules can be added without affecting the existing system.

---

# Documentation Structure

```
docs/
│
├── README.md
│
├── getting-started/
│   ├── installation.md
│   ├── project-structure.md
│
├── backend/
│   ├── architecture.md
│   ├── database.md
│   ├── authentication.md
│   ├── api.md
│
├── frontend/
│   ├── pages.md
│   ├── routing.md
│   ├── components.md
│
├── modules/
│   ├── dashboard.md
│   ├── user-management.md
│   ├── roles-permissions.md
│   ├── password-reset.md
│
├── deployment/
│   ├── environment.md
│   ├── production.md
│
└── contributing.md
```

---

# Current Features

- User Authentication
- JWT Authorization
- Role-Based Access Control (RBAC)
- Dashboard
- User Management
- Password Reset
- Audit Logging

---

# Technology Stack

## Backend

- Python
- Django
- Django REST Framework
- PostgreSQL
- Simple JWT

## Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- TanStack Query

---

# Project Status

| Module | Status |
|---------|--------|
| Authentication | Complete |
| Dashboard | Complete |
| User Management | Complete |
| RBAC | Complete |
| Password Reset | Complete |

---

# Before You Start

If you're new to the project, read the documentation in this order:

1. Installation
2. Project Structure
3. Architecture
4. Database
5. Authentication
6. API Documentation
7. Modules

Following this order will help you understand the system much faster.
