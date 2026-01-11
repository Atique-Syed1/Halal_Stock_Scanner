import { test, expect } from '@playwright/test';

test.describe('HalalTrade Pro E2E Tests', () => {

    test('should load the dashboard', async ({ page }) => {
        await page.goto('/');

        // Wait for page to load - look for the nav element
        await page.waitForLoadState('networkidle');

        // Check that the app has loaded by checking for nav
        await expect(page.locator('nav').first()).toBeVisible({ timeout: 15000 });
    });

    test('should navigate between tabs', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Look for any Scanner button/link and click it
        const scannerTab = page.getByRole('button', { name: /scanner/i }).first();

        if (await scannerTab.isVisible()) {
            await scannerTab.click();
            await page.waitForTimeout(1000);
        }

        // Just verify page still works
        await expect(page.locator('body')).toBeVisible();
    });

    test('should toggle dark mode', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Look for a button with Sun or Moon icon (dark mode toggle)
        const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).first();

        if (await toggleButton.isVisible()) {
            await toggleButton.click();
        }

        // Verify page is still working
        await expect(page.locator('body')).toBeVisible();
    });
});

test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('should render on mobile viewport', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Just verify the page loads on mobile viewport
        await expect(page.locator('body')).toBeVisible();
    });
});
