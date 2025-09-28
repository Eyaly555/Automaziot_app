import { test, expect } from '@playwright/test';

test.describe('Full User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:5176');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('fresh meeting starts with zero progress', async ({ page }) => {
    await page.goto('http://localhost:5176');

    // Create a new meeting
    await page.evaluate(() => {
      const meeting = {
        meetingId: 'e2e-test',
        clientName: 'E2E Test Client',
        date: new Date().toISOString(),
        timer: 0,
        modules: {
          overview: {},
          leadsAndSales: {},
          customerService: {},
          operations: {},
          reporting: {},
          aiAgents: {},
          systems: {},
          roi: {},
          planning: {}
        },
        painPoints: [],
        notes: ''
      };

      const store = {
        state: {
          currentMeeting: meeting,
          meetings: [meeting],
          timerInterval: null
        },
        version: 0
      };

      localStorage.setItem('discovery-assistant-storage', JSON.stringify(store));
    });

    await page.reload();
    await page.waitForTimeout(1000);

    // Check for "0 מתוך 9" text
    const progressText = await page.textContent('text=/מתוך 9/');
    expect(progressText).toContain('0 מתוך 9');

    // Check overall percentage
    const percentageElements = await page.$$('text=/^\\d+%$/');
    for (const element of percentageElements) {
      const text = await element.textContent();
      if (text === '0%') {
        // Found 0% - this is correct
        break;
      }
    }
  });

  test('progress increases only with user input', async ({ page }) => {
    await page.goto('http://localhost:5176');

    // Create meeting with test data
    await page.evaluate(() => {
      const meeting = {
        meetingId: 'progress-test',
        clientName: 'Progress Test Client',
        date: new Date().toISOString(),
        timer: 0,
        modules: {
          overview: {},
          leadsAndSales: {},
          customerService: {},
          operations: {},
          reporting: {},
          aiAgents: {},
          systems: {},
          roi: {},
          planning: {}
        },
        painPoints: [],
        notes: ''
      };

      localStorage.setItem('discovery-assistant-storage', JSON.stringify({
        state: { currentMeeting: meeting, meetings: [meeting], timerInterval: null },
        version: 0
      }));
    });

    await page.reload();

    // Navigate to Overview module
    await page.click('text=סקירה כללית');
    await page.waitForTimeout(1000);

    // Fill in actual data
    const businessTypeInput = page.locator('input[placeholder*="סוג העסק"]').first();
    if (await businessTypeInput.count() > 0) {
      await businessTypeInput.fill('SaaS Company');
    }

    const employeesInput = page.locator('input[type="number"]').first();
    if (await employeesInput.count() > 0) {
      await employeesInput.fill('50');
    }

    // Go back to dashboard
    await page.goBack();
    await page.waitForTimeout(1000);

    // Check that progress is no longer 0
    const progressAfterInput = await page.textContent('text=/מתוך 9/');
    expect(progressAfterInput).not.toContain('0 מתוך 9');
  });

  test('modules show correct completion status', async ({ page }) => {
    await page.goto('http://localhost:5176');

    // Create meeting with some completed data
    await page.evaluate(() => {
      const meeting = {
        meetingId: 'status-test',
        clientName: 'Status Test Client',
        date: new Date().toISOString(),
        timer: 0,
        modules: {
          overview: {
            businessType: 'SaaS',
            employees: 100,
            mainChallenge: 'Scaling',
            processes: ['Sales', 'Support'],
            currentSystems: ['CRM', 'ERP'],
            mainGoals: ['Growth']
          },
          leadsAndSales: {},
          customerService: {},
          operations: {},
          reporting: {},
          aiAgents: {},
          systems: {},
          roi: {},
          planning: {}
        },
        painPoints: [],
        notes: ''
      };

      localStorage.setItem('discovery-assistant-storage', JSON.stringify({
        state: { currentMeeting: meeting, meetings: [meeting], timerInterval: null },
        version: 0
      }));
    });

    await page.reload();
    await page.waitForTimeout(1000);

    // Check that at least one module shows as completed or in progress
    const statusTexts = await page.$$('text=/הושלם|בתהליך/');
    expect(statusTexts.length).toBeGreaterThan(0);
  });

  test('data persists after page refresh', async ({ page }) => {
    await page.goto('http://localhost:5176');

    // Create meeting with data
    await page.evaluate(() => {
      const meeting = {
        meetingId: 'persist-test',
        clientName: 'Persistence Test',
        date: new Date().toISOString(),
        timer: 0,
        modules: {
          overview: { businessType: 'Test Type' },
          leadsAndSales: {},
          customerService: {},
          operations: {},
          reporting: {},
          aiAgents: {},
          systems: {},
          roi: {},
          planning: {}
        },
        painPoints: [],
        notes: 'Test notes'
      };

      localStorage.setItem('discovery-assistant-storage', JSON.stringify({
        state: { currentMeeting: meeting, meetings: [meeting], timerInterval: null },
        version: 0
      }));
    });

    // Refresh page
    await page.reload();

    // Check that client name is still displayed
    await expect(page.locator('text=Persistence Test')).toBeVisible();

    // Navigate to overview module
    await page.click('text=סקירה כללית');
    await page.waitForTimeout(1000);

    // Check that the data is still there
    const businessTypeValue = await page.inputValue('input[placeholder*="סוג העסק"]');
    expect(businessTypeValue).toBe('Test Type');
  });

  test('pain points can be added and tracked', async ({ page }) => {
    await page.goto('http://localhost:5176');

    // Create meeting
    await page.evaluate(() => {
      const meeting = {
        meetingId: 'pain-test',
        clientName: 'Pain Points Test',
        date: new Date().toISOString(),
        timer: 0,
        modules: {
          overview: {},
          leadsAndSales: {},
          customerService: {},
          operations: {},
          reporting: {},
          aiAgents: {},
          systems: {},
          roi: {},
          planning: {}
        },
        painPoints: [
          {
            id: '1',
            module: 'overview',
            severity: 'high',
            description: 'Slow lead response time'
          }
        ],
        notes: ''
      };

      localStorage.setItem('discovery-assistant-storage', JSON.stringify({
        state: { currentMeeting: meeting, meetings: [meeting], timerInterval: null },
        version: 0
      }));
    });

    await page.reload();

    // Check that pain points count is displayed
    const painPointsCard = page.locator('text=/כאבים שזוהו/').locator('..');
    const painPointsCount = await painPointsCard.locator('text=/^\\d+$/').textContent();
    expect(parseInt(painPointsCount || '0')).toBeGreaterThan(0);
  });
});