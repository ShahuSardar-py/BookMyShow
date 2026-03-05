# 🔧 Database Connection Troubleshooting Guide

## Problem
- Cannot login or register in the application
- MySQL authentication failing with: `Access denied for user 'root'@'localhost'`

## Solution Steps

### Option 1: Find the Correct MySQL Password ✅ RECOMMENDED

Run this command to find the correct password:
```powershell
mysql -u root -pYourPassword -e "SELECT 1;"
```

Replace `YourPassword` with your actual MySQL root password. Common passwords:
- `root`
- `password`
- `admin`
- `mysql`
- (empty - no password)

Once you find the correct password, run:
```powershell
node server/setup.js "YourPassword"
```

### Option 2: Check MySQL Services

```powershell
# Check if MySQL is running
Get-Service -Name MySQL* | Select-Object Name, Status

# Or start MySQL from PowerShell
net start MySQL80

# Or open Services app
services.msc
```

### Option 3: Reset MySQL Root Password on Windows

1. Stop MySQL Service:
```powershell
net stop MySQL80
```

2. Start MySQL without grant tables:
```powershell
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld" --skip-grant-tables
```

3. In new PowerShell window, connect and reset:
```powershell
mysql -u root

# Then in MySQL prompt, run:
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
```

4. Restart MySQL normally:
```powershell
net start MySQL80
```

### Option 4: Complete Fresh Setup

If the above doesn't work, uninstall and reinstall MySQL:

```powershell
# Uninstall MySQL
msiexec /x {product-code}

# Or use Control Panel > Programs > Uninstall a program
```

Then reinstall MySQL Community Server 8.0 with these credentials:
- User: `root`
- Password: `root`

## After Fixing Database Connection

Run this to initialize everything:
```powershell
cd c:\Users\RuchirAdnaik\Desktop\bookmyshow\server
node setup.js "root"
```

Expected output:
```
✓ Connected to MySQL

Executing 183 SQL statements...

[1/183] ✓ CREATE DATABASE IF NOT EXISTS theater_booking...
[2/183] ✓ USE theater_booking...
...
✓ Schema executed successfully

Verifying setup...
  Users:    3
  Theaters: 3
  Seats:    300

✓ Demo accounts:
  - admin_user (admin), password: 'password123'
  - john_doe (user), password: 'password123'
  - jane_smith (user), password: 'password123'

✓ Database setup completed!
```

## Then Restart the Server

```powershell
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend  
cd client
npm start
```

## Login with Demo Account

Go to http://localhost:3000 and click "Admin" or "User" demo button.

---

**Still having issues?**
1. Check that port 5000 is not in use: `Get-NetTcpConnection -LocalPort 5000`
2. Check that port 3000 is not in use: `Get-NetTcpConnection -LocalPort 3000`
3. Make sure MySQL port 3306 is accessible: `Test-NetConnection localhost -Port 3306`
