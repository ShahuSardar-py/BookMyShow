# ⚡ Concurrency Testing - Quick Start

## Choose Your Testing Method

Two options available in your project:

### 🐍 Option 1: Python Selenium (Recommended)
- More stable and reliable
- Better error reporting
- Works with latest browsers

### 🟢 Option 2: Node.js Puppeteer
- Integrated with your project
- Matches your tech stack
- Easier setup if you're familiar with Node.js

---

## 🚀 Quick Setup (5 minutes)

### Prerequisites
1. **Backend Running**
   ```powershell
   cd server
   node server.js
   ```

2. **Frontend Running** (new terminal)
   ```powershell
   cd client
   npm start
   ```

3. **Database Initialized**
   ```powershell
   cd server
   node fix_demo_passwords.js
   ```

---

## 🧪 Run Tests

### Method 1: Python Selenium (Fastest Setup)

**Step 1: Install Python packages**
```powershell
pip install selenium webdriver-manager
```

**Step 2: Run test**
```powershell
python concurrency_test.py
```

**Expected Output:**
```
✅ TEST PASSED: Optimistic locking is working correctly!
   Only 1 user successfully booked the seat
   2 users were blocked due to version conflict
```

**See test results:**
```powershell
type test_results.json
```

---

### Method 2: Node.js Puppeteer (Integrated)

**Step 1: Install Puppeteer**
```powershell
cd server
npm install puppeteer
```

**Step 2: Run test** (from project root)
```powershell
node concurrency_test_puppeteer.js
```

**Expected Output:**
```
✅ TEST PASSED: Optimistic locking is working correctly!
   Only 1 user successfully booked the seat
   2 users were blocked due to version conflict
```

**See test results:**
```powershell
type test_results_puppeteer.json
```

---

## 📊 What Happens During Test

```
⏱️ Start
├─ User 1: Login (admin_user) ✅
├─ User 2: Login (john_doe) ✅
├─ User 3: Login (jane_smith) ✅
│
├─ All 3 select same theater ✅
│
├─ 🔄 CONCURRENT BOOKING ATTEMPT (this is the test!)
│  ├─ User 1: Click Seat A5
│  ├─ User 2: Click Seat A5  (at same time!)
│  ├─ User 3: Click Seat A5  (at same time!)
│
├─ User 1: Seat locked ✅ (reserves first)
├─ User 2: Error! Seat taken ⚠️  (optimistic lock prevented double-book)
├─ User 3: Error! Seat taken ⚠️  (optimistic lock prevented double-book)
│
⏱️ End → Results shown
```

---

## 🎯 Customize Tests

### More Users (Python)
Edit `concurrency_test.py`:
```python
NUM_CONCURRENT_USERS = 5  # Change from 3 to 5
```

### Different Seat (Python)
Edit `concurrency_test.py`:
```python
TARGET_SEAT_ROW = "C"       # Change row
TARGET_SEAT_NUMBER = "7"    # Change seat number
```

### Different Theater (Python)
Available theaters:
- "Cineplex Plaza" (100 seats: A1-J10)
- "Galaxy Cinemas" (120 seats: A1-L10)
- "Metro Theatre" (80 seats: A1-J8)

Edit `concurrency_test.py`:
```python
TARGET_THEATER = "Galaxy Cinemas"
```

---

## 📈 Run Multiple Test Cycles

### Python
Create `batch_test.py`:
```python
import subprocess
import time

for cycle in range(5):
    print(f"\n🔄 Test Cycle {cycle + 1}/5")
    subprocess.run(['python', 'concurrency_test.py'])
    time.sleep(5)
```

Run it:
```powershell
python batch_test.py
```

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| `ModuleNotFoundError: No module named 'selenium'` | `pip install selenium webdriver-manager` |
| `Connection refused localhost:3000` | Start frontend: `npm start` |
| `Connection refused localhost:5000` | Start backend: `node server.js` |
| `Login failed` | Run: `node server/fix_demo_passwords.js` |
| `Theater not found` | Check theater name matches exactly |
| `Seat not found` | Verify row (A-J) and seat (1-10) exist |

---

## 📊 Results Interpretation

### PASS (Optimistic Locking Working) ✅
```
✅✅✅ 1 user books successfully
✅✅✅ 2 users get "Seat unavailable" error
✅✅✅ Double-booking prevented!
```

### FAIL (Bug in Locking) ❌
```
❌ Multiple users booked same seat
❌ Optimistic locking not working
❌ Need to check server logic
```

### ERROR (Test Issue)
```
⚠️ Login failed
⚠️ Theater/seat not found
⚠️ Check prerequisites
```

---

## 💡 Advanced Testing

### Load Test (Python)
Push the system harder:
```python
NUM_CONCURRENT_USERS = 10  # Start with 10 users
```

### Stress Test (Node.js)
Quick concurrent attempts:
```bash
node concurrency_test_puppeteer.js
node concurrency_test_puppeteer.js  # Run again immediately
node concurrency_test_puppeteer.js  # Run again
```

### Different Seats (Python)
Test that different seats can be booked simultaneously:
```python
# Modify script to test seats A5, B5, C5
NUM_CONCURRENT_USERS = 3
# Modify select_seat() to vary seat by user_id
```

---

## 📝 Save Test Report

**Python:**
```powershell
cp test_results.json test_results_$(Get-Date -Format yyyyMMdd_HHmmss).json
```

**Node.js:**
```powershell
cp test_results_puppeteer.json results_$(Get-Date -Format yyyyMMdd_HHmmss).json
```

---

## ⚙️ System Specifications

### Tested With
- Python 3.8+
- Node.js 16+
- Chrome/Chromium 90+
- Selenium 4.0+
- Puppeteer 10+

### Concurrent Users Tested
- ✅ 2 users
- ✅ 3 users (default)
- ✅ 5 users
- ⚠️ 10+ users (may need more power)

---

## 🎓 Understanding Optimistic Locking

Your application uses optimistic locking with a `version` column:

```
1️⃣ User reads: Seat {id:5, status:'available', version:1}
2️⃣ User attempts UPDATE: SET status='booked', version=2 WHERE id=5 AND version=1

   ✅ If version still = 1: UPDATE succeeds, booking confirmed
   ❌ If version ≠ 1: UPDATE fails, another user beat you, try again

This test ensures step ❌ is working correctly → preventing double-booking!
```

---

## 📞 Getting Help

Check these files for more details:
1. [SELENIUM_TEST_GUIDE.md](SELENIUM_TEST_GUIDE.md) - Detailed Python guide
2. [SYSTEM_FIXED.md](SYSTEM_FIXED.md) - System setup info
3. [QUICK_START.md](QUICK_START.md) - General app setup

---

## ✅ Complete Checklist

- [ ] Backend running (`node server.js`)
- [ ] Frontend running (`npm start`)
- [ ] Demo accounts initialized
- [ ] Python installed (OR Node.js Puppeteer setup done)
- [ ] Test script ready
- [ ] 3 concurrent users configured
- [ ] 1 seat target selected
- [ ] Ready to test!

**Now run your first test! 🚀**

```powershell
python concurrency_test.py
```

or

```powershell
node concurrency_test_puppeteer.js
```
