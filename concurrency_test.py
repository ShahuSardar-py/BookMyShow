"""
Concurrent Seat Booking Test Script
Tests optimistic locking by having multiple users book the same seat simultaneously
"""

import time
import threading
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import json

# Configuration
BASE_URL = "http://localhost:3000"
API_URL = "http://localhost:5000"
NUM_CONCURRENT_USERS = 3
TARGET_THEATER = "Cineplex Plaza"
TARGET_SEAT_ROW = "A"
TARGET_SEAT_NUMBER = "5"

# Results tracking
results = {
    'success': [],
    'failed': [],
    'errors': [],
    'timestamp': datetime.now().isoformat()
}
results_lock = threading.Lock()


def log_result(user_id, status, message, details=None):
    """Thread-safe logging of test results"""
    with results_lock:
        log_entry = {
            'user_id': user_id,
            'status': status,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        
        print(f"[{user_id}] {status}: {message}")
        
        if status == 'success':
            results['success'].append(log_entry)
        elif status == 'failed':
            results['failed'].append(log_entry)
        else:
            results['errors'].append(log_entry)


def create_driver(user_id):
    """Create a Chrome WebDriver instance"""
    chrome_options = Options()
    # Use headless mode for faster testing (comment out to see browser)
    # chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument(f"--user-data-dir=/tmp/chrome-user-{user_id}")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.set_page_load_timeout(10)
        return driver
    except Exception as e:
        log_result(user_id, 'error', f'Failed to create driver: {str(e)}')
        return None


def login_user(driver, user_id, username, password):
    """Login user to the application"""
    try:
        driver.get(BASE_URL)
        log_result(user_id, 'info', 'Navigated to login page')
        
        # Wait for and fill username
        username_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="text"]'))
        )
        username_input.clear()
        username_input.send_keys(username)
        log_result(user_id, 'info', f'Entered username: {username}')
        
        # Fill password
        time.sleep(0.5)
        password_inputs = driver.find_elements(By.CSS_SELECTOR, 'input[type="password"]')
        password_inputs[0].clear()
        password_inputs[0].send_keys(password)
        log_result(user_id, 'info', 'Entered password')
        
        # Click login button
        login_btn = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
        login_btn.click()
        log_result(user_id, 'info', 'Clicked login button')
        
        # Wait for theater list to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'theater-card'))
        )
        log_result(user_id, 'success', 'Login successful')
        return True
        
    except Exception as e:
        log_result(user_id, 'error', f'Login failed: {str(e)}')
        return False


def select_theater(driver, user_id, theater_name):
    """Select a theater"""
    try:
        # Find theater card with matching name
        theater_cards = driver.find_elements(By.CLASS_NAME, 'theater-card')
        
        for card in theater_cards:
            if theater_name in card.text:
                card.click()
                log_result(user_id, 'info', f'Selected theater: {theater_name}')
                
                # Wait for seat grid to load
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CLASS_NAME, 'seat-grid'))
                )
                log_result(user_id, 'success', 'Theater selected, seat grid loaded')
                return True
        
        log_result(user_id, 'error', f'Theater "{theater_name}" not found')
        return False
        
    except Exception as e:
        log_result(user_id, 'error', f'Failed to select theater: {str(e)}')
        return False


def select_seat(driver, user_id, row, seat_number):
    """Select a specific seat"""
    try:
        # Wait for seats to be interactive
        time.sleep(0.5)
        
        # Find seat button with data attributes
        seat_selector = f'button[data-row="{row}"][data-seat="{seat_number}"]'
        seat_button = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, seat_selector))
        )
        
        # Check if seat is available
        if 'available' not in seat_button.get_attribute('class'):
            log_result(user_id, 'failed', f'Seat {row}{seat_number} is not available')
            return False
        
        # Click the seat
        seat_button.click()
        log_result(user_id, 'success', f'Clicked seat {row}{seat_number}')
        
        # Wait for seat to be selected (visual feedback)
        time.sleep(0.5)
        return True
        
    except Exception as e:
        log_result(user_id, 'error', f'Failed to select seat: {str(e)}')
        return False


def proceed_to_checkout(driver, user_id):
    """Proceed to checkout after seat selection"""
    try:
        # Find and click the checkout button
        checkout_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, 'button:contains("Proceed")'))
        )
        checkout_btn.click()
        log_result(user_id, 'info', 'Clicked proceed to checkout')
        
        # Wait for checkout page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'checkout-form'))
        )
        log_result(user_id, 'success', 'Proceeded to checkout')
        return True
        
    except Exception as e:
        log_result(user_id, 'error', f'Failed to proceed to checkout: {str(e)}')
        return False


def complete_payment(driver, user_id):
    """Complete payment"""
    try:
        # Find and click payment button
        payment_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, 'button:contains("Pay")'))
        )
        payment_btn.click()
        log_result(user_id, 'info', 'Clicked payment button')
        
        # Wait for success message or error
        time.sleep(2)
        
        # Check for success message
        try:
            success_msg = driver.find_element(By.CLASS_NAME, 'success-message')
            if success_msg and 'success' in success_msg.text.lower():
                log_result(user_id, 'success', 'Booking SUCCESSFUL - Payment completed')
                return True
        except:
            pass
        
        # Check for error message (another user might have booked the seat)
        try:
            error_msg = driver.find_element(By.CLASS_NAME, 'error-message')
            if error_msg and 'available' in error_msg.text.lower():
                log_result(user_id, 'failed', 'Booking FAILED - Seat no longer available (Optimistic lock worked!)', 
                          details=error_msg.text)
                return False
        except:
            pass
        
        log_result(user_id, 'error', 'Could not determine booking result')
        return False
        
    except Exception as e:
        log_result(user_id, 'error', f'Payment failed: {str(e)}')
        return False


def test_user_booking(user_id, username, password):
    """Main test flow for a single user"""
    driver = None
    
    try:
        log_result(user_id, 'info', f'Starting test for user {username}')
        
        # Create browser instance
        driver = create_driver(user_id)
        if not driver:
            return
        
        # Login
        if not login_user(driver, user_id, username, password):
            return
        
        # Select theater
        if not select_theater(driver, user_id, TARGET_THEATER):
            return
        
        # Select seat (this is where concurrency is tested)
        if not select_seat(driver, user_id, TARGET_SEAT_ROW, TARGET_SEAT_NUMBER):
            return
        
        # Proceed to checkout
        if not proceed_to_checkout(driver, user_id):
            log_result(user_id, 'error', 'Could not proceed to checkout (seat might be taken)')
            return
        
        # Complete payment
        complete_payment(driver, user_id)
        
    except Exception as e:
        log_result(user_id, 'error', f'Unexpected error: {str(e)}')
    
    finally:
        if driver:
            try:
                driver.quit()
                log_result(user_id, 'info', 'Browser closed')
            except:
                pass


def run_concurrent_tests():
    """Run concurrent booking tests with multiple users"""
    print("\n" + "="*80)
    print("🎬 CONCURRENT SEAT BOOKING TEST")
    print("="*80)
    print(f"Testing URL: {BASE_URL}")
    print(f"Number of concurrent users: {NUM_CONCURRENT_USERS}")
    print(f"Target theater: {TARGET_THEATER}")
    print(f"Target seat: {TARGET_SEAT_ROW}{TARGET_SEAT_NUMBER}")
    print("="*80 + "\n")
    
    # Demo users
    demo_users = [
        ('admin_user', 'password123'),
        ('john_doe', 'password123'),
        ('jane_smith', 'password123')
    ]
    
    threads = []
    test_users = demo_users[:NUM_CONCURRENT_USERS]
    
    # Synchronization barrier to ensure threads start at approximately the same time
    start_event = threading.Event()
    
    def user_test_wrapper(user_id, username, password):
        # Wait for all threads to be ready
        start_event.wait()
        # Add small random delay to simulate real user behavior
        time.sleep(0.1 * user_id)
        test_user_booking(user_id, username, password)
    
    start_time = time.time()
    
    # Create and start threads
    for i, (username, password) in enumerate(test_users):
        thread = threading.Thread(
            target=user_test_wrapper,
            args=(i+1, username, password),
            name=f"User-{i+1}"
        )
        threads.append(thread)
        thread.start()
    
    # Signal all threads to start their booking attempts
    time.sleep(0.5)
    start_event.set()
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join()
    
    elapsed_time = time.time() - start_time
    
    # Print results
    print("\n" + "="*80)
    print("TEST RESULTS")
    print("="*80)
    print(f"Total time: {elapsed_time:.2f} seconds")
    print(f"Successful bookings: {len(results['success'])}")
    print(f"Failed bookings (by optimistic lock): {len(results['failed'])}")
    print(f"Errors: {len(results['errors'])}")
    print("="*80 + "\n")
    
    # Print details
    if results['success']:
        print("✅ SUCCESSFUL BOOKINGS:")
        for entry in results['success']:
            print(f"   - {entry['user_id']}: {entry['message']}")
    
    if results['failed']:
        print("\n⚠️  BLOCKED BOOKINGS (Optimistic Lock Worked):")
        for entry in results['failed']:
            print(f"   - {entry['user_id']}: {entry['message']}")
    
    if results['errors']:
        print("\n❌ ERRORS:")
        for entry in results['errors']:
            print(f"   - {entry['user_id']}: {entry['message']}")
    
    # Summary
    print("\n" + "="*80)
    if len(results['success']) == 1 and len(results['failed']) > 0:
        print("✅ TEST PASSED: Optimistic locking is working correctly!")
        print(f"   Only 1 user successfully booked the seat")
        print(f"   {len(results['failed'])} users were blocked due to version conflict")
    elif len(results['success']) > 1:
        print("❌ TEST FAILED: Multiple users booked the same seat!")
        print("   Optimistic locking did not prevent double-booking")
    else:
        print("⚠️  TEST INCONCLUSIVE: Check errors above")
    print("="*80 + "\n")
    
    # Save detailed results to JSON
    with open('test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    print("Detailed results saved to: test_results.json\n")


if __name__ == '__main__':
    run_concurrent_tests()
