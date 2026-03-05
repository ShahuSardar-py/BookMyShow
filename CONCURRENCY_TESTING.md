# 🧪 Concurrency Testing - Complete Documentation

## 📁 Files Created

Your project now has complete concurrency testing capabilities:

### 1. **Test Scripts**
- `concurrency_test.py` - Python Selenium test (⭐ Recommended)
- `concurrency_test_puppeteer.js` - Node.js Puppeteer alternative

### 2. **Documentation**
- `CONCURRENCY_TESTING_QUICK_START.md` - ⚡ Start here (5-min setup)
- `SELENIUM_TEST_GUIDE.md` - Detailed Python testing guide
- This file (overview)

---

## ⚡ 60-Second Quick Start

```powershell
# Terminal 1: Start backend
cd server
node server.js

# Terminal 2: Start frontend  
cd client
npm start

# Terminal 3: Install and run test
pip install selenium webdriver-manager
python concurrency_test.py
```

✅ That's it! You'll see results in ~30 seconds.

---

## 🎯 What the Tests Do

### The Test Scenario
```
Imagine 3 customers trying to buy the last ticket for Seat A5:

⏱️ Time: 10:00:00.000ms
   👤 Customer 1 (admin_user): Clicks Seat A5
   👤 Customer 2 (john_doe): Clicks Seat A5
   👤 Customer 3 (jane_smith): Clicks Seat A5
   ↓ (all at EXACTLY the same time)
   
⏱️ Time: 10:00:00.001ms
   ✅ Customer 1: "Booking confirmed! Seat booked."
   ❌ Customer 2: "Sorry, seat no longer available"
   ❌ Customer 3: "Sorry, seat no longer available"
```

### Why This Matters
- Tests your system's **race condition prevention**
- Validates **optimistic locking** is working
- Ensures **no double-bookings** can happen
- Proves system is **production-ready**

---

## 📊 Test Results Explained

### ✅ SUCCESS Result
```
✅ TEST PASSED: Optimistic locking is working correctly!
   Only 1 user successfully booked the seat
   2 users were blocked due to version conflict
```
**Meaning:** Your system works! Only one user got the seat despite all trying simultaneously.

### ❌ FAILURE Result
```
❌ TEST FAILED: Multiple users booked the same seat!
   Optimistic locking did not prevent double-booking
```
**Meaning:** Bug found! You need to check your database logic.

### ⚠️ ERROR Result
```
⚠️ TEST INCONCLUSIVE: Check errors above
   Login failed / Theater not found / Seat not found
```
**Meaning:** Test couldn't run properly. Check prerequisites.

---

## 🚀 Complete Step-by-Step Guide

### Step 1: Prepare Your System (do this once)
```powershell
# Make sure backend and frontend are working
cd C:\Users\RuchirAdnaik\Desktop\bookmyshow\server
node server.js
```
✅ Wait for: `Server running on port 5000`

In new terminal:
```powershell
cd C:\Users\RuchirAdnaik\Desktop\bookmyshow\client
npm start
```
✅ Browser opens to `http://localhost:3000`

### Step 2: Install Test Dependencies

**Option A: Python Selenium** (Recommended)
```powershell
pip install selenium webdriver-manager
```

**Option B: Node.js Puppeteer**
```powershell
cd server
npm install puppeteer
```

### Step 3: Run the Test

**Python:**
```powershell
cd C:\Users\RuchirAdnaik\Desktop\bookmyshow
python concurrency_test.py
```

**Node.js:**
```powershell
cd C:\Users\RuchirAdnaik\Desktop\bookmyshow
node concurrency_test_puppeteer.js
```

### Step 4: Review Results

**Console Output:** Shows real-time progress
```
[User 1] INFO: Navigated to login page
[User 1] SUCCESS: Login successful
[User 2] INFO: Navigated to login page
[User 2] SUCCESS: Login successful
[User 3] INFO: Navigated to login page
[User 3] SUCCESS: Login successful
[User 1] SUCCESS: Booking SUCCESSFUL - Payment completed
[User 2] FAILED: Booking FAILED - Seat no longer available
[User 3] FAILED: Booking FAILED - Seat no longer available
```

**JSON Results File:**
```powershell
# Python
type test_results.json

# Node.js
type test_results_puppeteer.json
```

---

## 🔧 Customization Options

### Change Number of Concurrent Users

**Python - Edit `concurrency_test.py` line 17:**
```python
NUM_CONCURRENT_USERS = 5  # Change from 3 to 5 users
```

**Node.js - Edit `concurrency_test_puppeteer.js` line 8:**
```javascript
numConcurrentUsers: 5,  // Change from 3 to 5 users
```

### Change Target Seat

**Python - Edit `concurrency_test.py` lines 19-21:**
```python
TARGET_SEAT_ROW = "B"       # Change from "A" to "B"
TARGET_SEAT_NUMBER = "7"    # Change from "5" to "7"
```

**Node.js - Edit `concurrency_test_puppeteer.js` lines 10-11:**
```javascript
targetSeatRow: 'B',         // Change row
targetSeatNumber: '7',      // Change seat
```

### Show Browser Windows

**Python - Edit `concurrency_test.py` line 146:**
```python
# chrome_options.add_argument("--headless")  # Uncomment this line
```

**Node.js - Edit `concurrency_test_puppeteer.js` line 6:**
```javascript
headless: true,  // Set to false to see browsers
```

---

## 📈 Advanced Testing Scenarios

### Test 1: Basic Concurrency (Default)
- 3 users, same seat
- Expected: 1 success, 2 failures
- Time: ~30 seconds

### Test 2: Increased Load
- 5-10 users, same seat
- Expected: 1 success, 4-9 failures
- Useful to: Find performance limits

### Test 3: Different Seats
- 3 users booking different seats simultaneously
- Expected: All 3 succeed
- Validates: Locking is per-seat, not global

### Test 4: Repeated Cycles
- Run test 10 times in a row
- Expected: Same results each time
- Validates: Consistency and stability

### Example: Run 10 Cycles (Python)
```python
import subprocess
import time

for i in range(10):
    print(f"\n🔄 Running test cycle {i+1}/10...")
    subprocess.run(['python', 'concurrency_test.py'])
    time.sleep(3)  # Wait between cycles
```

---

## 📋 Test Checklist

Before running tests, verify:

- [ ] Python installed (for Selenium): `python --version`
- [ ] Node.js installed (for Puppeteer): `node --version`
- [ ] Backend running on port 5000: `http://localhost:5000/api/health`
- [ ] Frontend running on port 3000: `http://localhost:3000`
- [ ] Database initialized: `node server/fix_demo_passwords.js`
- [ ] Test script file exists: `concurrency_test.py` or `concurrency_test_puppeteer.js`
- [ ] All demo accounts working (login test manually)

---

## 🐛 Troubleshooting

### Python Issues

| Error | Fix |
|-------|-----|
| `ModuleNotFoundError: selenium` | `pip install selenium webdriver-manager` |
| `ChromeDriver not found` | `pip install webdriver-manager` |
| `Connection refused` | Check if backend/frontend running |
| `Login failed` | Run `node server/fix_demo_passwords.js` |

### Node.js Issues

| Error | Fix |
|-------|-----|
| `Cannot find module 'puppeteer'` | `npm install puppeteer` |
| `Connection refused` | Check if backend/frontend running |
| `Timeout waiting for selector` | Check UI structure matches test |

### General Issues

| Error | Fix |
|-------|-----|
| Browser windows won't appear | Results run headless - check JSON file |
| Test runs but no results | Check `test_results.json` or `test_results_puppeteer.json` |
| Seat not found | Verify theater and seat row/number are valid |
| All users succeed | Bug - double-booking allowed (check database SET up) |

---

## 📊 Expected Results by Configuration

### Configuration: 3 Users, Same Seat
```
✅ User 1: Success (books first)
⚠️ User 2: Failure (OptimisticLock)
⚠️ User 3: Failure (OptimisticLock)
Result: TEST PASSED ✅
```

### Configuration: 5 Users, Same Seat
```
✅ User 1: Success (books first)
⚠️ Users 2-5: Failure (OptimisticLock)
Result: TEST PASSED ✅
```

### Configuration: 3 Users, Different Seats (A5, B5, C5)
```
✅ User 1: Success (books A5)
✅ User 2: Success (books B5)
✅ User 3: Success (books C5)
Result: TEST PASSED ✅
```

---

## 🎓 How Optimistic Locking Works in Your App

### The Database Level
```sql
-- Read stage
SELECT id, status, version FROM seats WHERE id = 5;
-- Result: {id: 5, status: 'available', version: 1}

-- Update attempt by User 1
UPDATE seats SET status = 'booked', version = 2 
WHERE id = 5 AND version = 1;
-- Result: ✅ 1 row affected (version was 1, so update succeeded)

-- Update attempt by User 2
UPDATE seats SET status = 'booked', version = 2 
WHERE id = 5 AND version = 1;
-- Result: ❌ 0 rows affected (version is now 2, not 1!)

-- User 2 gets error: "Seat no longer available"
```

This test **verifies this exact flow works** under concurrent load!

---

## 📈 Performance Metrics

After running tests, you'll see:
- **Total Time**: How long test took (typically 30-60 seconds)
- **Successful Bookings**: Should be exactly 1
- **Failed Bookings**: Should be NUM_USERS - 1
- **Errors**: Should be 0

Example:
```
Total time: 45.32 seconds
Successful bookings: 1 ✅
Failed bookings: 2 ✅
Errors: 0 ✅
```

---

## 🎯 Next Steps

1. **Run your first test:**
   ```powershell
   python concurrency_test.py
   ```

2. **Verify results:**
   ```powershell
   type test_results.json
   ```

3. **Share with team:**
   - Email the `test_results.json` file
   - Include timestamp: `results.timestamp`
   - Include config: `results.config`

4. **Schedule regular tests:**
   - Run after each major code change
   - Run before production deployment
   - Use in CI/CD pipeline

---

## 📝 Sample Test Report

```markdown
# Concurrency Test Report - 2026-03-05

## Configuration
- Concurrent Users: 3
- Target Theater: Cineplex Plaza
- Target Seat: A5
- Test Duration: 45 seconds

## Results
- Successful Bookings: 1
- Blocked by Optimistic Lock: 2
- Errors: 0

## Conclusion
✅ PASSED - Optimistic locking is working correctly

## Details
- User 1 (admin_user): Successfully booked seat
- User 2 (john_doe): Blocked - seat no longer available
- User 3 (jane_smith): Blocked - seat no longer available

## Test Date
2026-03-05T10:30:45.123Z
```

---

## 💡 Pro Tips

✅ **Use Python Selenium** - More reliable, better error messages
✅ **Start with 3 users** - Good for basic testing
✅ **View results in real-time** - Watch browser windows during test
✅ **Save results files** - Keep for regression testing
✅ **Test different seats** - Verify locking is per-seat
✅ **Run multiple times** - Ensure consistency

---

## 📞 Support

For issues or questions, check:
1. This file (complete reference)
2. `CONCURRENCY_TESTING_QUICK_START.md` (fastest start)
3. `SELENIUM_TEST_GUIDE.md` (detailed Python guide)
4. Your test results JSON file (specific errors)

---

**You're all set! Run your first concurrency test now! 🚀**

```powershell
python concurrency_test.py
```
