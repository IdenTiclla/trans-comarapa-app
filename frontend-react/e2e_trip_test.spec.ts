import { test, expect } from '@playwright/test';

test('create a new trip successfully locally via form', async ({ page }) => {
  // Wait until API finishes responding
  await page.goto('http://localhost:3001/login');
  
  await page.fill('input[type="email"]', 'secretary1@transcomarapa.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');

  // Verify successful login
  await expect(page).toHaveURL('http://localhost:3001/dashboards/dashboard-secretary');
  
  // Go to new trip page
  await page.goto('http://localhost:3001/trips/new');
  
  await page.waitForLoadState('networkidle');
  
  // Fill required fields
  await page.selectOption('select#route_id', { index: 1 });
  
  // Enter a valid future date
  const future = new Date();
  future.setDate(future.getDate() + 5);
  const futureDate = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`;
  
  await page.fill('input#departure_date', futureDate);
  await page.fill('input#departure_time', '18:00');
  
  await page.selectOption('select#bus_id', { index: 1 });

  // Wait 1s and click "Crear Viaje"
  await page.waitForTimeout(1000);
  
  // Create Trip
  await page.click('button[type="submit"]');

  // Assert success toast appears
  await expect(page.locator('text=Viaje creado exitosamente')).toBeVisible({ timeout: 10000 });
});
