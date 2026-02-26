# Ziptech Labs - Admin Setup Guide

## Creating Admin Accounts

### Method 1: Using the Script (Recommended)

Run the admin creation script:

```bash
cd server
npm run create-admin
```

Follow the prompts to enter:
- Admin Name
- Admin Email  
- Admin Password

The script will create an admin account with full platform access.

### Method 2: During Registration

You can also create admin accounts by registering with the `admin` role:

**API Request:**
```bash
POST http://localhost:5001/api/auth/register
Content-Type: application/json

{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "securepassword",
  "role": "admin"
}
```

**Using the Frontend:**
The registration form doesn't expose the role field by default. You would need to modify the Register component to add a role selector for testing purposes.

## User Roles

The platform supports three roles:

1. **founder** (default) - Regular users who set goals and participate in cohorts
2. **facilitator** - Can create cohorts, view analytics, manage meetings
3. **admin** - Full platform access, cross-cohort analytics, all facilitator permissions

## Testing the Application

### 1. Create Admin Account
```bash
cd server
npm run create-admin
```

### 2. Create Facilitator Account
Register a new user and manually update their role in MongoDB:
```bash
mongosh
use ziptech-labs
db.users.updateOne(
  { email: "facilitator@example.com" },
  { $set: { role: "facilitator" } }
)
```

Or register via API with role parameter.

### 3. Test Workflow

**As Facilitator:**
1. Login
2. Create a cohort
3. Note the invite code

**As Founder:**
1. Register/Login
2. Join cohort using invite code
3. Create goals (1 public, 1 private per week)
4. Submit check-ins
5. Support peers' goals

**As Admin:**
1. Login
2. View cross-cohort analytics
3. Export reports

## Troubleshooting

### "Not authorized, no token"
- Make sure you're logged in
- Check that the token is stored in localStorage
- Verify the Authorization header is being sent

### "You must join a cohort first"
- Founders must join a cohort before creating goals
- Get an invite code from a facilitator
- Use the "Join Cohort" button on the dashboard

### Goals not showing
- Ensure you're in a cohort
- Check that goals were created for the current week
- Verify the API is returning data (check browser console)
