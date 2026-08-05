# 🔧 FixTrack - Full-Stack Local Repair Job Tracker (MERN Stack)

> A modern, digital SaaS job tracking and workflow management application designed specifically for local repair shops (laptops, mobile phones, electronics, bikes, and home appliances).

---

## 🌟 Overview & Problem Solved

Traditional local repair shops manage repair jobs through paper receipts, WhatsApp chats, or manual spreadsheets. This causes significant operational friction:
1. Customers call repeatedly to ask for repair status updates.
2. Cost estimate increases require tedious back-and-forth messaging.
3. Paper receipts get lost or damaged.
4. Shop owners lack clear visibility over revenue, technician workloads, and active repair bottlenecks.

**FixTrack** solves this by digitizing the repair workflow:
- **Digital Job Creation**: Auto-generates unique tracking IDs (e.g., `REP-2026-00124`).
- **No-Login Customer Tracking Portal**: Customers track live repair status, view technician diagnosis, and approve/reject revised cost estimates via a simple link (`/track/REP-2026-XXXXX`).
- **Role-Based Workspaces**: Dedicated dashboards for Shop Admins and Technicians.
- **Automated Notifications & Audit Trails**: Email notifications on status changes, image upload support, printable SaaS invoices, and revenue analytics.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide Icons, React Hot Toast.
- **Backend**: Node.js, Express.js (MVC Architecture), MongoDB, Mongoose ORM.
- **Authentication**: JSON Web Tokens (JWT) + Password hashing with `bcryptjs`.
- **Media Uploads**: Cloudinary SDK (with local disk storage fallback).
- **Notifications**: Nodemailer SMTP service (with console logger fallback).

---

## 🔐 Key User Roles & Workflows

1. **Shop Admin**:
   - Access to full 9-KPI dashboard and Recharts time-series visualizations.
   - Create and assign repair jobs.
   - Manage technicians, staff accounts, customer database, and payments.
   - Print SaaS-style job invoices (`window.print()`).
2. **Technician**:
   - Dedicated workbench workspace displaying assigned jobs.
   - Add/edit workbench diagnosis, upload device condition photos, update repair costs.
   - Transition job statuses (`Received` ➔ `Diagnosing` ➔ `Waiting for Approval` ➔ `Approved` ➔ `Repairing` ➔ `Ready for Pickup` ➔ `Completed`).
3. **Customer**:
   - **No account creation required**.
   - Accessible via direct URL: `/track/REP-2026-XXXXX`.
   - View live workflow pipeline, diagnosis notes, device photos, and shop contact details.
   - Interactive `[Approve Repair]` and `[Reject Repair]` buttons for cost authorization requests.

---

## 📊 Database Schema (Mongoose Models)

```
User (admin / technician)
 ├── name, email, phone, password (select: false)
 └── role, specialization, active

Repair
 ├── repairId (Indexed, Unique, e.g. REP-2026-00124)
 ├── customer: { name, phone, email }
 ├── device: { type, brand, model, serialNumber, color }
 ├── reportedProblem, diagnosis, notes
 ├── assignedTechnician (Ref: User)
 ├── status (Received | Diagnosing | Waiting for Approval | Approved | Repairing | Ready for Pickup | Completed)
 ├── priority (Low | Medium | High | Urgent)
 ├── estimatedCost, finalCost, amountPaid, paymentStatus, paymentMethod
 ├── estimatedCompletionDate
 ├── photos: [{ url, public_id, caption, uploadedAt }]
 └── customerDecision: { decision: 'Approved' | 'Rejected', timestamp, note }

RepairHistory
 ├── repair (Ref: Repair)
 ├── previousStatus, newStatus
 ├── changedBy: { name, role, userId }
 └── note, timestamp

Notification
 ├── recipient: { name, email, phone }
 ├── repair (Ref: Repair)
 └── type, message, status, read
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB running locally (`mongodb://127.0.0.1:27017/repair_tracker`) OR MongoDB Atlas URI. *(Note: Built-in `mongodb-memory-server` fallback included for zero-config testing).*

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Create a `.env` file inside `server/` (copied from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/repair_tracker
JWT_SECRET=super_secret_jwt_key_repair_tracker_2026_xyz
JWT_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@repairshop.com
FROM_NAME="FixTrack Repair Services"
```

### 3. Seed Database with Sample Data
```bash
npm run seed
```
*Seeds initial Admin (`admin@repairshop.com` / `admin123`), 2 Technicians (`tech.alex@repairshop.com` / `tech123`), customers, and sample repair tickets.*

### 4. Start Backend Express API
```bash
npm run dev
# Server running at http://localhost:5000
```

### 5. Install & Start Frontend (React + Vite)
In a new terminal tab:
```bash
cd client
npm install
npm run dev
# Frontend running at http://localhost:3000
```

---

## 📮 API Endpoints Summary

### Auth Routes
- `POST /api/auth/login` - Authenticate admin or technician
- `GET /api/auth/me` - Get current session user

### Repair Job Routes
- `POST /api/repairs` - Create repair ticket (Auto-generates `repairId`)
- `GET /api/repairs` - List repairs with search, multi-filters, and pagination
- `GET /api/repairs/:id` - Fetch single repair details with history
- `GET /api/repairs/track/:repairId` - Public customer tracking endpoint
- `PATCH /api/repairs/:id/status` - Update status workflow stage
- `POST /api/repairs/:id/diagnosis` - Add technician diagnosis notes
- `POST /api/repairs/track/:repairId/decision` - Public customer estimate approval/rejection
- `POST /api/repairs/:id/photos` - Upload device condition photos
- `POST /api/repairs/:id/payment` - Record payment receipt

### Dashboard Routes
- `GET /api/dashboard/stats` - 9 KPI stats & Recharts time-series data

---

## 👤 GitHub Details
- **GitHub Username**: `Punya-265`
- **Email**: `punyabindlish26@gmail.com`
- **Repository URL**: `https://github.com/Punya-265/local-repair-job-tracker.git`
