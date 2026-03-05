# 🧪 Selenium Concurrency Testing Guide

## Overview

This guide explains how to run the Selenium concurrency test script that simulates multiple users trying to book the same seat simultaneously. This tests your application's optimistic locking mechanism.

---

## ✅ Prerequisites

### 1. Python Installation
Ensure Python 3.8+ is installed:
```powershell
python --version
```

If not installed, download from: https://www.python.org/downloads/

### 2. Required Python Packages
Install Selenium and dependencies:
```powershell
pip install selenium
pip install webdriver-manager
```

### 3. ChromeDriver
Selenium needs ChromeDriver to control Chrome. Two options:

**Option A: Automatic (Recommended)**
```powershell
pip install webdriver-manager
```

**Option B: Manual**
1. Download ChromeDriver from: https://chromedriver.chromium.org/
2. Place in your PATH or project directory
3. Update script path if needed

### 4. Google Chrome
Install Chrome browser: https://www.google.com/chrome/

### 5. Application Running
Your Theater Booking app must be running:
- Backend: `http://localhost:5000` (node server.js)
- Frontend: `http://localhost:3000` (npm start)

---

## 📋 Setup Steps

### Step 1: Start Backend Server
```powershell
cd C:\Users\RuchirAdnaik\Desktop\bookmyshow\server
node server.js
```
✅ Wait for: `Server running on port 5000`

### Step 2: Start Frontend Application
Open a new terminal:
```powershell
cd C:\Users\RuchirAdnaik\Desktop\bookmyshow\client
npm start
```
✅ Wait for: Application opens on `http://localhost:3000`

### Step 3: Verify Database is Ready
Ensure demo accounts exist:
```powershell
cd C:\Users\RuchirAdnaik\Desktop\bookmyshow\server
node fix_demo_passwords.js
```

Demo accounts:
- admin_user / password123
- john_doe / password123
- jane_smith / password123

---

## 🚀 Running the Test Script

### Method 1: Command Line (Windows PowerShell)

```powershell
cd C:\Users\RuchirAdnaik\Desktop\bookmyshow
python concurrency_test.py
```

### Method 2: Command Prompt (cmd)

```cmd
cd C:\Users\RuchirAdnaik\Desktop\bookmyshow
python concurrency_test.py
```

### Method 3: Python IDE
- Open `concurrency_test.py` in VS Code or any Python IDE
- Click "Run" or press F5

---

## 🎯 What the Test Does

1. **Launches 3 browser instances simultaneously**
   - User 1: admin_user
   - User 2: john_doe  
   - User 3: jane_smith

2. **Each user:**
   - Logs into the application
   - Selects the same theater (Cineplex Plaza)
   - Attempts to book the same seat (Row A, Seat 5)
   - Proceeds to checkout
   - Completes payment

3. **Expected Result:**
   - ✅ Only 1 user successfully books the seat
   - ⚠️ Other 2 users get error: "Seat no longer available"
   - This confirms **optimistic locking is working**

---

## 📊 Understanding the Results

### Success Scenario (Optimistic Lock Working)
```
TEST PASSED: Optimistic locking is working correctly!
- Only 1 user successfully booked the seat
- 2 users were blocked due to version conflict
```

### Failure Scenario (Bug Found)
```
TEST FAILED: Multiple users booked the same seat!
- Optimistic locking did not prevent double-booking
```

---

## 🔧 Customizing the Test

Edit `concurrency_test.py` to modify test parameters:

```python
# Configuration (Lines 16-22)
BASE_URL = "http://localhost:3000"              # Frontend URL
API_URL = "http://localhost:5000"               # Backend URL
NUM_CONCURRENT_USERS = 3                        # Number of users (2-5)
TARGET_THEATER = "Cineplex Plaza"               # Theater name
TARGET_SEAT_ROW = "A"                           # Seat row (A-J)
TARGET_SEAT_NUMBER = "5"                        # Seat number (1-10)
```

### Example: Test With 5 Users
```python
NUM_CONCURRENT_USERS = 5
```

### Example: Test Different Seat
```python
TARGET_SEAT_ROW = "C"
TARGET_SEAT_NUMBER = "7"
```

---

## 📋 Output Files

After running the test, two files are created:

### 1. Console Output
Displays real-time progress and results

### 2. `test_results.json`
Detailed results in JSON format:
```json
{
  "success": [
    {
      "user_id": 1,
      "status": "success",
      "message": "Booking SUCCESSFUL - Payment completed",
      "timestamp": "2026-03-05T10:30:45.123456"
    }
  ],
  "failed": [
    {
      "user_id": 2,
      "status": "failed",
      "message": "Booking FAILED - Seat no longer available",
      "details": "Seat A5 is no longer available"
    }
  ],
  "errors": []
}
```

---

## 🐛 Troubleshooting

### Issue: "ChromeDriver not found"
**Solution:** Install webdriver-manager
```powershell
pip install webdriver-manager
```

### Issue: "Connection refused on localhost:3000"
**Solution:** Start frontend application
```powershell
cd client
npm start
```

### Issue: "Connection refused on localhost:5000"
**Solution:** Start backend server
```powershell
cd server
node server.js
```

### Issue: "Login failed"
**Solution:** Reinitialize demo accounts
```powershell
cd server
node fix_demo_passwords.js
```

### Issue: "Seat not found"
**Possible solutions:**
1. Check theater exists: `TARGET_THEATER = "Cineplex Plaza"` (exact match)
2. Check seat row valid: A-J (for 10x10 grid)
3. Check seat number valid: 1-10
4. Theater names: "Cineplex Plaza", "Galaxy Cinemas", "Metro Theatre"

### Issue: "Script runs but no browser windows appear"
**Solution:** Browser is running headless (background mode).
To see the browsers:
1. Comment out line: `# chrome_options.add_argument("--headless")`
2. Run again
3. You'll see 3 browser windows open simultaneously

---

## 📈 Advanced Testing

### Test Concurrency With More Users
Modify the script to support more than 3 users:

```python
# Add more demo users to test
demo_users = [
    ('admin_user', 'password123'),
    ('john_doe', 'password123'),
    ('jane_smith', 'password123'),
    ('new_user_1', 'pass123'),      # Add more if registered
    ('new_user_2', 'pass123'),
]

NUM_CONCURRENT_USERS = 5
```

### Test Different Seat Pressure
Create multiple test runs with increasing users to find limits:

```python
for num_users in [2, 3, 5, 10]:
    NUM_CONCURRENT_USERS = num_users
    run_concurrent_tests()
```

### Load Test
Generate test data and run repeated tests:
```python
for attempt in range(5):
    print(f"\n🔄 Test Run #{attempt + 1}")
    run_concurrent_tests()
    time.sleep(5)
```

---

## ✅ Verification Checklist

Before running the test:
- [ ] Python installed (python --version)
- [ ] Selenium installed (pip show selenium)
- [ ] Chrome installed
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Demo accounts initialized
- [ ] Target theater exists

---

## 📝 Test Report Template

Save this template and fill in after each test:

```markdown
# Concurrency Test Report
Date: [Date]
Time: [Start time]

## Test Configuration
- Concurrent Users: [Number]
- Target Theater: [Name]
- Target Seat: [Row][Number]
- Duration: [Seconds]

## Results
- Successful Bookings: [Count]
- Blocked Bookings: [Count]
- Errors: [Count]

## Conclusion
[ ] Optimistic locking working
[ ] Double-booking prevented
[ ] All users handled correctly
[ ] No database errors

## Issues Found
- [List any issues]

## Notes
[Additional observations]
```

---

## 🎓 How Optimistic Locking Works (In Your App)

1. **User A reads seat** version=1
2. **User B reads seat** version=1
3. **User A UPDATE:** SET status='booked', version=2 WHERE version=1 ✅ SUCCESS
4. **User B UPDATE:** SET status='booked', version=2 WHERE version=1 ❌ FAILED (version changed)
5. **User B receives:** "Seat no longer available"

This test verifies this exact flow works correctly under concurrent load!

---

## 📞 Support

If tests fail:
1. Check `test_results.json` for detailed error messages
2. Review console output for specific failures
3. Verify all prerequisites are met
4. Try with fewer concurrent users (start with 2)
5. Check application logs in backend terminal

---

**Good luck with your testing! 🚀**
