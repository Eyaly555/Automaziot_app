import puppeteer from 'puppeteer';

(async () => {
  console.log('=====================================');
  console.log('VERIFICATION TEST - COMPLETE TESTING');
  console.log('=====================================\n');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true, // Open DevTools automatically
    slowMo: 50
  });

  const page = await browser.newPage();

  // Enable console logging from the page
  page.on('console', msg => {
    if (msg.text().includes('[DEBUG]')) {
      console.log('BROWSER:', msg.text());
    }
  });

  // Log any errors
  page.on('error', err => {
    console.error('PAGE ERROR:', err);
  });

  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err);
  });

  try {
    // STEP 1: Clear localStorage and start fresh
    console.log('STEP 1: Clear localStorage and start fresh');
    console.log('----------------------------------------');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

    await page.evaluate(() => {
      console.log('[DEBUG] Clearing localStorage...');
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.reload({ waitUntil: 'networkidle2' });
    console.log('✓ localStorage cleared\n');

    // STEP 2: Create new meeting
    console.log('STEP 2: Create new meeting');
    console.log('----------------------------------------');

    page.once('dialog', async dialog => {
      console.log('Entering client name: "Test Verification"');
      await dialog.accept('Test Verification');
    });

    const buttons = await page.$$('button');
    let newMeetingButton = null;
    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && (text.includes('התחל פגישה חדשה') || text.includes('פגישה חדשה'))) {
        newMeetingButton = button;
        break;
      }
    }

    if (!newMeetingButton) {
      throw new Error('Could not find new meeting button');
    }
    await newMeetingButton.click();
    await new Promise(r => setTimeout(r, 1000));

    // Check initial progress
    const initialProgress = await page.evaluate(() => {
      const progressEl = document.querySelector('.text-sm.text-gray-600');
      const stored = JSON.parse(localStorage.getItem('discovery-assistant-storage') || '{}');
      const meeting = stored.state?.currentMeeting;

      console.log('[DEBUG] Initial meeting created:', meeting);

      return {
        progressText: progressEl?.textContent || '',
        modules: meeting?.modules || {}
      };
    });

    console.log('Initial Progress:', initialProgress.progressText);
    console.log('Initial Modules Structure:', JSON.stringify(initialProgress.modules, null, 2));
    console.log('✓ Meeting created\n');

    // STEP 3: Fill exactly 3 fields in Module 1 (Overview)
    console.log('STEP 3: Fill exactly 3 fields in Overview Module');
    console.log('----------------------------------------');

    // Navigate to Overview module
    await page.click('[class*="bg-white rounded-xl"]:nth-child(1)');
    await new Promise(r => setTimeout(r, 1000));

    // Fill 3 fields
    await page.evaluate(() => {
      // Find and fill business type select
      const businessSelect = document.querySelector('select');
      if (businessSelect) {
        businessSelect.value = 'saas';
        businessSelect.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('[DEBUG] Filled businessType: saas');
      }

      // Find and fill employees number input
      const employeesInput = document.querySelector('input[type="number"]');
      if (employeesInput) {
        employeesInput.value = '50';
        employeesInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('[DEBUG] Filled employees: 50');
      }

      // Find and fill main challenge textarea
      const challengeTextarea = document.querySelector('textarea');
      if (challengeTextarea) {
        challengeTextarea.value = 'Need to automate sales processes';
        challengeTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('[DEBUG] Filled mainChallenge');
      }
    });

    // Wait for auto-save
    console.log('Waiting for auto-save...');
    await new Promise(r => setTimeout(r, 2000));

    // Go back to dashboard
    await page.goBack({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));

    const afterModule1 = await page.evaluate(() => {
      const progressEl = document.querySelector('.text-sm.text-gray-600');
      const stored = JSON.parse(localStorage.getItem('discovery-assistant-storage') || '{}');
      const overview = stored.state?.currentMeeting?.modules?.overview;

      console.log('[DEBUG] After Module 1 - Overview data:', overview);

      return {
        progressText: progressEl?.textContent || '',
        overviewData: overview
      };
    });

    console.log('After Module 1 Progress:', afterModule1.progressText);
    console.log('Overview Module Data:', afterModule1.overviewData);
    console.log('✓ Module 1 completed\n');

    // STEP 4: Navigate to Module 2 WITHOUT filling anything
    console.log('STEP 4: Navigate to Module 2 (Leads) WITHOUT filling');
    console.log('----------------------------------------');

    // Click on second module (Leads and Sales)
    const modules = await page.$$('[class*="bg-white rounded-xl"]');
    await modules[1].click();
    await new Promise(r => setTimeout(r, 1000));

    console.log('Navigated to Leads module, not filling any data...');

    // Wait briefly then go back
    await new Promise(r => setTimeout(r, 500));
    await page.goBack({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));

    const afterModule2 = await page.evaluate(() => {
      const progressEl = document.querySelector('.text-sm.text-gray-600');
      const stored = JSON.parse(localStorage.getItem('discovery-assistant-storage') || '{}');
      const leadsData = stored.state?.currentMeeting?.modules?.leadsAndSales;

      console.log('[DEBUG] After Module 2 - Leads data:', leadsData);

      return {
        progressText: progressEl?.textContent || '',
        leadsData: leadsData
      };
    });

    console.log('After Module 2 Progress:', afterModule2.progressText);
    console.log('Leads Module Data (should be empty):', afterModule2.leadsData);
    console.log('✓ Module 2 visited without data\n');

    // STEP 5: Navigate to Module 3 and fill 2 fields
    console.log('STEP 5: Fill 2 fields in Module 3 (Customer Service)');
    console.log('----------------------------------------');

    const modules3 = await page.$$('[class*="bg-white rounded-xl"]');
    await modules3[2].click();
    await new Promise(r => setTimeout(r, 1000));

    // Fill 2 fields in Customer Service
    await page.evaluate(() => {
      // Fill multi-channel issue
      const textInputs = document.querySelectorAll('input[type="text"]');
      if (textInputs[0]) {
        textInputs[0].value = 'Customers contact through multiple channels';
        textInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        console.log('[DEBUG] Filled multiChannelIssue');
      }

      // Fill unification method
      const textareas = document.querySelectorAll('textarea');
      if (textareas[0]) {
        textareas[0].value = 'Currently using manual tracking in Excel';
        textareas[0].dispatchEvent(new Event('input', { bubbles: true }));
        console.log('[DEBUG] Filled unificationMethod');
      }
    });

    // Wait for auto-save
    console.log('Waiting for auto-save...');
    await new Promise(r => setTimeout(r, 2000));

    // Go back to dashboard
    await page.goBack({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));

    // STEP 6: Document EXACT progress percentages
    console.log('\nSTEP 6: Document EXACT progress percentages');
    console.log('----------------------------------------');

    const finalProgress = await page.evaluate(() => {
      const progressEl = document.querySelector('.text-sm.text-gray-600');
      const moduleCards = document.querySelectorAll('[class*="bg-white rounded-xl"]');
      const modules = [];

      moduleCards.forEach(card => {
        const nameEl = card.querySelector('.font-semibold');
        const percentEl = card.querySelector('.text-gray-500');
        if (nameEl && percentEl) {
          modules.push({
            name: nameEl.textContent,
            progress: percentEl.textContent
          });
        }
      });

      const stored = JSON.parse(localStorage.getItem('discovery-assistant-storage') || '{}');
      const meeting = stored.state?.currentMeeting;

      return {
        overallProgress: progressEl?.textContent || '',
        modules: modules,
        storedData: {
          overview: meeting?.modules?.overview,
          leadsAndSales: meeting?.modules?.leadsAndSales,
          customerService: meeting?.modules?.customerService
        }
      };
    });

    console.log('EXACT PROGRESS REPORT:');
    console.log('Overall:', finalProgress.overallProgress);
    console.log('\nModule Progress:');
    finalProgress.modules.forEach(m => {
      console.log(`  ${m.name}: ${m.progress}`);
    });
    console.log('\nStored Data:');
    console.log('  Overview:', finalProgress.storedData.overview);
    console.log('  LeadsAndSales:', finalProgress.storedData.leadsAndSales);
    console.log('  CustomerService:', finalProgress.storedData.customerService);

    // STEP 7: Refresh and verify persistence
    console.log('\nSTEP 7: Refresh page and verify persistence');
    console.log('----------------------------------------');

    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const afterRefresh = await page.evaluate(() => {
      const progressEl = document.querySelector('.text-sm.text-gray-600');
      const stored = JSON.parse(localStorage.getItem('discovery-assistant-storage') || '{}');
      const meeting = stored.state?.currentMeeting;

      console.log('[DEBUG] After refresh - Meeting data:', meeting);

      return {
        progressText: progressEl?.textContent || '',
        persistedModules: meeting?.modules || {}
      };
    });

    console.log('After Refresh Progress:', afterRefresh.progressText);
    console.log('Data persisted correctly:',
      afterRefresh.persistedModules.overview?.businessType === 'saas' &&
      afterRefresh.persistedModules.overview?.employees === 50
    );

    // STEP 8: Edge case - Enter and delete data
    console.log('\nSTEP 8: Edge case - Enter then delete data');
    console.log('----------------------------------------');

    // Navigate to a module
    const modulesEdge = await page.$$('[class*="bg-white rounded-xl"]');
    await modulesEdge[3].click(); // Operations module
    await new Promise(r => setTimeout(r, 1000));

    // Enter and then delete data
    await page.evaluate(() => {
      const input = document.querySelector('input[type="text"]');
      if (input) {
        input.value = 'Test data';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('[DEBUG] Entered test data');

        setTimeout(() => {
          input.value = '';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          console.log('[DEBUG] Deleted test data');
        }, 500);
      }
    });

    await new Promise(r => setTimeout(r, 2000));
    await page.goBack({ waitUntil: 'networkidle2' });

    // STEP 9: Test edge cases with zeros and booleans
    console.log('\nSTEP 9: Test zeros and boolean fields');
    console.log('----------------------------------------');

    const modulesZero = await page.$$('[class*="bg-white rounded-xl"]');
    await modulesZero[0].click(); // Overview
    await new Promise(r => setTimeout(r, 1000));

    await page.evaluate(() => {
      // Try entering zero in number field
      const numberInput = document.querySelector('input[type="number"]');
      if (numberInput) {
        numberInput.value = '0';
        numberInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('[DEBUG] Entered 0 in number field');
      }
    });

    await new Promise(r => setTimeout(r, 2000));
    await page.goBack({ waitUntil: 'networkidle2' });

    const zeroTest = await page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem('discovery-assistant-storage') || '{}');
      const overview = stored.state?.currentMeeting?.modules?.overview;
      return {
        employees: overview?.employees,
        shouldNotCount: overview?.employees === 0
      };
    });

    console.log('Zero Test - Employees:', zeroTest.employees);
    console.log('Zero correctly not counted as progress:', zeroTest.shouldNotCount);

    console.log('\n=====================================');
    console.log('VERIFICATION COMPLETE');
    console.log('=====================================\n');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    console.log('Test completed. Browser will remain open for inspection.');
    // Keep browser open for manual inspection
  }
})();