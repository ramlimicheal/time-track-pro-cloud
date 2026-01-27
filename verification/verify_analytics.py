from playwright.sync_api import sync_playwright
import time

def test_analytics(page):
    print("Navigating to test page...")
    page.goto("http://localhost:8080/test")

    print("Waiting for title...")
    page.wait_for_selector("text=Timesheet Analytics Test", timeout=10000)

    print("Waiting for charts...")
    time.sleep(2)

    print("Taking screenshot...")
    page.screenshot(path="/home/jules/verification/verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_analytics(page)
            print("Success!")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
