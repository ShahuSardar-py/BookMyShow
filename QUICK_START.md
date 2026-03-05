# 🎬 Quick Start - Theater Booking System

## ✅ System Status: WORKING

### Demo Accounts
```
Admin:    admin_user / password123
User 1:   john_doe / password123
User 2:   jane_smith / password123
```

---

## 🚀 Start the System (2 Steps)

### Step 1: Backend (Terminal 1)
```powershell
cd c:\Users\RuchirAdnaik\Desktop\bookmyshow\server
node server.js
```
✅ Server running at: `http://localhost:5000`

### Step 2: Frontend (Terminal 2) - Optional
```powershell
cd c:\Users\RuchirAdnaik\Desktop\bookmyshow\client
npm start
```
✅ App running at: `http://localhost:3000`

---

## 🔐 Login Options

### Via Browser (Recommended)
1. Go to http://localhost:3000
2. Click "Admin" or "User" button
3. Done!

### Via API/PowerShell
```powershell
$body = '{"username":"admin_user","password":"password123"}'
Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/login' `
  -Method POST -ContentType 'application/json' -Body $body
```

### Create New Account
```powershell
$body = '{"username":"newuser","email":"user@example.com","password":"pass123"}'
Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/register' `
  -Method POST -ContentType 'application/json' -Body $body
```

---

## 📊 Available Test Cases

### Theater Operations
- View all theaters
- View available seats per theater
- Real-time seat status updates

### Booking Operations  
- Reserve a seat
- Book with payment
- Cancel reservation

### Admin Features
- View all bookings
- See booking analytics
- Add new theaters (via API)

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Login fails | Run: `node server/fix_demo_passwords.js` |
| Can't register | Check MySQL running: `Get-Process mysqld` |
| Server won't start | Kill existing: `Get-Process node \| Stop-Process -Force` |
| Port 5000 in use | Kill Node: `Get-Process node \| Stop-Process -Force` |

---

## 📁 Key Files

- `server.js` - Backend API
- `client/src/App.js` - Frontend main component
- `database.js` - MySQL connection
- `database/schema.sql` - Database structure

---

## 🎯 Next Steps

1. ✅ Open http://localhost:3000
2. ✅ Click demo button to login
3. ✅ Select a theater
4. ✅ Click seats to reserve
5. ✅ Complete payment
6. ✅ See booking confirmed

**Enjoy! 🍿**
