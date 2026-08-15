# Testing & Deployment Checklist

## Local setup

1. Clone the repository.
2. Install dependencies in the root/client/server as documented in `README.md`.
3. Copy `server/.env.example` to `server/.env`.
4. Set `MONGODB_URI` to the MongoDB Atlas connection string.
5. Set a private `JWT_SECRET` (never commit it).
6. Set `CLIENT_URL=http://localhost:5173` for local development.
7. Add `HF_TOKEN` only if the AI Repair Advisor is required.
8. Run the client and server development commands from the README.

## Smoke test

### Authentication
- [ ] Admin demo login works.
- [ ] Technician demo login works.
- [ ] Customer signup works.
- [ ] Customer can log in after restarting the server.
- [ ] Invalid password is rejected.
- [ ] Deactivated users cannot log in.

### Roles
- [ ] Customer cannot access admin/technician APIs.
- [ ] Technician cannot record payments or delete repairs.
- [ ] Admin can manage staff.
- [ ] Staff list contains staff, not customers.
- [ ] Customer list contains newly registered customers even with zero repairs.

### Repairs
- [ ] Admin can create a repair.
- [ ] Technician assignment accepts only valid technician users.
- [ ] Status changes create history entries.
- [ ] Diagnosis and estimates save correctly.
- [ ] Repair photos upload correctly when Cloudinary is configured.
- [ ] Customer dashboard shows only that customer's repairs.
- [ ] Public tracking is read-only.
- [ ] Customer approval/rejection requires a logged-in customer who owns that repair and only works while status is `Waiting for Approval`.

### Payments
- [ ] Negative payment amounts are rejected by the UI/API.
- [ ] Payment status changes correctly between Unpaid, Partially Paid and Paid.
- [ ] Final cost cannot be negative.

### AI
- [ ] Missing `HF_TOKEN` produces a clear configuration message.
- [ ] The default model is `Qwen/Qwen2.5-7B-Instruct`.
- [ ] AI failures return a friendly error instead of crashing the server.

## Production requirements

- Use MongoDB Atlas or another persistent MongoDB deployment.
- Set a strong random `JWT_SECRET`.
- Set `CLIENT_URL` to the exact deployed frontend origin.
- Keep all secrets in the hosting provider's environment variables.
- Never commit `.env`, API keys, passwords, or database credentials.
- Configure Cloudinary for persistent image storage instead of relying on local uploads.
- Configure SMTP if customer email notifications are required.
- Use HTTPS in production.
- Run `npm install` after pulling changes and run a production build before deployment.

## Important design note

Public repair tracking is intentionally read-only. Decisions about estimates are authenticated and tied to the logged-in customer's email so a person who only knows a ticket number cannot approve or reject someone else's repair.
