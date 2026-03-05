/**
 * Concurrent Seat Booking Test - Node.js Version using Puppeteer
 * 
 * This script tests optimistic locking by simulating multiple users
 * attempting to book the same seat simultaneously
 * 
 * Usage: node concurrency_test_puppeteer.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:5000',
  numConcurrentUsers: 3,
  targetTheater: 'Cineplex Plaza',
  targetSeatRow: 'A',
  targetSeatNumber: '5',
  headless: false, // Set to true to hide browser windows
  slowMo: 50, // Slow down actions by Xms to see what's happening
};

// Test results storage
const results = {
  success: [],
  failed: [],
  errors: [],
  startTime: new Date().toISOString(),
  config: CONFIG
};

const resultsLock = {
  addSuccess: (userId, message, details) => {
    results.success.push({
      userId,
      status: 'success',
      message,
      details,
      timestamp: new Date().toISOString()
    });
    console.log(`✅ [User ${userId}] ${message}`);
  },
  
  addFailed: (userId, message, details) => {
    results.failed.push({
      userId,
      status: 'failed',
      message,
      details,
      timestamp: new Date().toISOString()
    });
    console.log(`⚠️  [User ${userId}] ${message}`);
  },
  
  addError: (userId, message, details) => {
    results.errors.push({
      userId,
      status: 'error',
      message,
      details,
      timestamp: new Date().toISOString()
    });
    console.log(`❌ [User ${userId}] ${message}`);
  }
};

/**
 * Log with timestamp
 */
function log(userId, type, message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] [User ${userId}] ${type}: ${message}`);
}

/**
 * Test flow for a single user
 */
async function testUserBooking(userId, username, password) {
  let browser;
  let page;
  
  try {
    log(userId, 'INFO', `Starting test for ${username}`);
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: CONFIG.headless,
      slowMo: CONFIG.slowMo
    });
    
    page = await browser.newPage();
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(10000);
    
    // ===== STEP 1: Login =====
    log(userId, 'INFO', 'Navigating to login page');
    await page.goto(CONFIG.baseUrl);
    
    // Wait for login form
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    
    // Fill username
    log(userId, 'INFO', `Entering username: ${username}`);
    await page.type('input[type="text"]', username);
    
    // Fill password
    log(userId, 'INFO', 'Entering password');
    await page.type('input[type="password"]', password);
    
    // Click login button
    log(userId, 'INFO', 'Clicking login button');
    await page.click('button[type="submit"]');
    
    // Wait for theater list to appear
    await page.waitForSelector('.theater-card', { timeout: 5000 });
    resultsLock.addSuccess(userId, 'Login successful');
    
    // ===== STEP 2: Select Theater =====
    log(userId, 'INFO', `Selecting theater: ${CONFIG.targetTheater}`);
    
    // Get all theater cards
    const theaterFound = await page.evaluate((theaterName) => {
      const cards = document.querySelectorAll('.theater-card');
      for (const card of cards) {
        if (card.textContent.includes(theaterName)) {
          card.click();
          return true;
        }
      }
      return false;
    }, CONFIG.targetTheater);
    
    if (!theaterFound) {
      resultsLock.addError(userId, `Theater "${CONFIG.targetTheater}" not found`);
      return;
    }
    
    // Wait for seat grid
    await page.waitForSelector('.seat-grid', { timeout: 5000 });
    resultsLock.addSuccess(userId, `Theater selected, seat grid loaded`);
    
    // Add synchronization point - wait for all users to reach here
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // ===== STEP 3: Select Seat (Concurrent) =====
    log(userId, 'INFO', `Selecting seat ${CONFIG.targetSeatRow}${CONFIG.targetSeatNumber}`);
    
    // Wait a bit more to synchronize all users before clicking
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    
    // Click the seat
    const seatSelector = `.seat[data-row="${CONFIG.targetSeatRow}"][data-seat="${CONFIG.targetSeatNumber}"]`;
    
    try {
      await page.click(seatSelector);
      resultsLock.addSuccess(userId, `Seat ${CONFIG.targetSeatRow}${CONFIG.targetSeatNumber} clicked`);
    } catch (e) {
      resultsLock.addError(userId, `Could not click seat: ${e.message}`);
      return;
    }
    
    // Wait for seat to be selected
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // ===== STEP 4: Proceed to Checkout =====
    log(userId, 'INFO', 'Looking for checkout button');
    
    const checkoutBtn = await page.$('button:contains("Proceed")') || 
                       await page.$('button') && await page.evaluate(() => {
                         const buttons = document.querySelectorAll('button');
                         return Array.from(buttons).find(b => 
                           b.textContent.toLowerCase().includes('proceed')
                         );
                       });
    
    if (checkoutBtn) {
      log(userId, 'INFO', 'Clicking checkout button');
      await page.click('button:contains("Proceed")').catch(() => {
        // Fallback method
        return page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          const btn = Array.from(buttons).find(b => 
            b.textContent.toLowerCase().includes('proceed')
          );
          if (btn) btn.click();
        });
      });
      
      // Wait for checkout form
      await page.waitForSelector('.checkout-form', { timeout: 3000 }).catch(() => {
        log(userId, 'WARN', 'Checkout form not found (seat might be taken)');
      });
      
      resultsLock.addSuccess(userId, 'Proceeded to checkout');
    }
    
    // ===== STEP 5: Complete Payment =====
    log(userId, 'INFO', 'Looking for payment button');
    
    // Find and click payment button
    const paymentBtn = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      return Array.from(buttons).find(b => 
        b.textContent.toLowerCase().includes('pay') ||
        b.textContent.toLowerCase().includes('confirm')
      ) !== undefined;
    });
    
    if (paymentBtn) {
      log(userId, 'INFO', 'Clicking payment button');
      await page.click('button:contains("Pay")').catch(() => {
        return page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          const btn = Array.from(buttons).find(b => 
            b.textContent.toLowerCase().includes('pay')
          );
          if (btn) btn.click();
        });
      });
      
      // Wait for result
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check for success or error message
      const result = await page.evaluate(() => {
        const successMsg = document.querySelector('.success-message, .alert-success');
        const errorMsg = document.querySelector('.error-message, .alert-error');
        
        return {
          success: successMsg ? successMsg.textContent : null,
          error: errorMsg ? errorMsg.textContent : null
        };
      });
      
      if (result.success && result.success.toLowerCase().includes('success')) {
        resultsLock.addSuccess(userId, 'Booking SUCCESSFUL - Payment completed');
      } else if (result.error && result.error.toLowerCase().includes('available')) {
        resultsLock.addFailed(userId, 
          'Booking FAILED - Seat no longer available (Optimistic lock worked!)',
          result.error
        );
      } else {
        resultsLock.addError(userId, 'Could not determine payment result');
      }
    }
    
  } catch (error) {
    resultsLock.addError(userId, `Test failed: ${error.message}`);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
    log(userId, 'INFO', 'Browser closed');
  }
}

/**
 * Run all concurrent tests
 */
async function runConcurrentTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🎬 CONCURRENT SEAT BOOKING TEST (Puppeteer)');
  console.log('='.repeat(80));
  console.log(`Testing URL: ${CONFIG.baseUrl}`);
  console.log(`Number of concurrent users: ${CONFIG.numConcurrentUsers}`);
  console.log(`Target theater: ${CONFIG.targetTheater}`);
  console.log(`Target seat: ${CONFIG.targetSeatRow}${CONFIG.targetSeatNumber}`);
  console.log('='.repeat(80) + '\n');
  
  // Demo users
  const demoUsers = [
    { username: 'admin_user', password: 'password123' },
    { username: 'john_doe', password: 'password123' },
    { username: 'jane_smith', password: 'password123' }
  ];
  
  const testUsers = demoUsers.slice(0, CONFIG.numConcurrentUsers);
  const startTime = Date.now();
  
  // Start all user tests concurrently
  const promises = testUsers.map((user, index) =>
    testUserBooking(index + 1, user.username, user.password)
  );
  
  // Wait for all tests to complete
  await Promise.all(promises);
  
  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
  results.endTime = new Date().toISOString();
  results.elapsedSeconds = parseFloat(elapsedTime);
  
  // ===== PRINT RESULTS =====
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(80));
  console.log(`Total time: ${elapsedTime} seconds`);
  console.log(`Successful bookings: ${results.success.length}`);
  console.log(`Failed bookings (blocked by optimistic lock): ${results.failed.length}`);
  console.log(`Errors: ${results.errors.length}`);
  console.log('='.repeat(80) + '\n');
  
  // Print successful bookings
  if (results.success.length > 0) {
    console.log('✅ SUCCESSFUL BOOKINGS:');
    results.success.forEach(entry => {
      console.log(`   - User ${entry.userId}: ${entry.message}`);
    });
  }
  
  // Print failed bookings
  if (results.failed.length > 0) {
    console.log('\n⚠️  BLOCKED BOOKINGS (Optimistic Lock Worked):');
    results.failed.forEach(entry => {
      console.log(`   - User ${entry.userId}: ${entry.message}`);
    });
  }
  
  // Print errors
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(entry => {
      console.log(`   - User ${entry.userId}: ${entry.message}`);
    });
  }
  
  // Test conclusion
  console.log('\n' + '='.repeat(80));
  if (results.success.length === 1 && results.failed.length > 0) {
    console.log('✅ TEST PASSED: Optimistic locking is working correctly!');
    console.log(`   Only 1 user successfully booked the seat`);
    console.log(`   ${results.failed.length} users were blocked due to version conflict`);
  } else if (results.success.length > 1) {
    console.log('❌ TEST FAILED: Multiple users booked the same seat!');
    console.log('   Optimistic locking did not prevent double-booking');
  } else {
    console.log('⚠️  TEST INCONCLUSIVE: Check errors above');
  }
  console.log('='.repeat(80) + '\n');
  
  // Save results to file
  const resultsFile = path.join(__dirname, 'test_results_puppeteer.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`✓ Detailed results saved to: ${resultsFile}\n`);
}

// Check prerequisites
async function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...\n');
  
  try {
    const response = await fetch(`${CONFIG.apiUrl}/api/health`);
    if (response.ok) {
      console.log('✅ Backend server is running on port 5000');
    }
  } catch {
    console.log('❌ Backend server not responding on port 5000');
    console.log('   Start with: node server.js\n');
  }
  
  // Note: Can't easily check if frontend is running without a request
  console.log('⚠️  Make sure frontend is running on port 3000');
  console.log('   Start with: npm start\n');
}

// Main execution
(async () => {
  try {
    await checkPrerequisites();
    await runConcurrentTests();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();
