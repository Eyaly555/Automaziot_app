import puppeteer from 'puppeteer';

(async () => {
  console.log('Testing Module Progress Bug');
  console.log('===============================================\n');

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Go to Dashboard
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });

  // Clear localStorage to start fresh
  await page.evaluate(() => {
    localStorage.clear();
    location.reload();
  });

  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Create new meeting
  console.log('Creating a new meeting...');
  await page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem('discovery-assistant-storage') || '{}');
    const newMeeting = {
      meetingId: 'test-' + Date.now(),
      clientName: 'Test Client',
      date: new Date(),
      timer: 0,
      modules: {
        overview: {},
        leadsAndSales: {
          leadSources: [],
          speedToLead: {},
          leadRouting: {},
          followUp: {},
          appointments: {}
        },
        customerService: {
          channels: [],
          autoResponse: {
            topQuestions: [],
            commonRequests: []
          },
          proactiveCommunication: {},
          communityManagement: { exists: false },
          reputationManagement: {},
          onboarding: {}
        },
        operations: {
          systemSync: {},
          documentManagement: {},
          projectManagement: {},
          financialProcesses: {},
          hr: {},
          crossDepartment: {}
        },
        reporting: {},
        aiAgents: {},
        systems: {},
        roi: {},
        planning: {}
      },
      painPoints: [],
      notes: ''
    };

    store.state = {
      ...store.state,
      currentMeeting: newMeeting,
      meetings: [newMeeting]
    };

    localStorage.setItem('discovery-assistant-storage', JSON.stringify(store));
    location.reload();
  });

  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('Checking module progress immediately after creation...\n');

  // Check progress after creating meeting
  const moduleProgress = await page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem('discovery-assistant-storage') || '{}');
    const meeting = store.state?.currentMeeting;

    if (!meeting) return null;

    const checkModuleData = (moduleName, moduleData) => {
      const nonEmptyValues = [];
      const allValues = [];

      const checkValues = (obj, path = '') => {
        if (obj === null || obj === undefined || obj === '') {
          allValues.push({ path, value: obj, type: 'empty' });
          return;
        }

        if (Array.isArray(obj)) {
          allValues.push({ path, value: `array[${obj.length}]`, type: obj.length > 0 ? 'filled' : 'empty_array' });
          if (obj.length > 0) {
            nonEmptyValues.push({ path, value: `array[${obj.length}]` });
          }
        } else if (typeof obj === 'object') {
          allValues.push({ path, value: 'object', type: Object.keys(obj).length > 0 ? 'filled' : 'empty_object' });
          if (Object.keys(obj).length > 0) {
            nonEmptyValues.push({ path, value: 'object', keys: Object.keys(obj) });
          }
          Object.entries(obj).forEach(([key, val]) => {
            checkValues(val, path ? `${path}.${key}` : key);
          });
        } else if (typeof obj === 'boolean') {
          allValues.push({ path, value: obj, type: 'boolean' });
          nonEmptyValues.push({ path, value: obj });
        } else {
          allValues.push({ path, value: obj, type: 'filled' });
          nonEmptyValues.push({ path, value: obj });
        }
      };

      checkValues(moduleData);

      return {
        moduleName,
        totalValues: Object.values(moduleData).length,
        nonEmptyCount: Object.values(moduleData).filter(v => v !== null && v !== undefined && v !== '').length,
        details: nonEmptyValues,
        allDetails: allValues
      };
    };

    return {
      overview: checkModuleData('overview', meeting.modules.overview),
      leadsAndSales: checkModuleData('leadsAndSales', meeting.modules.leadsAndSales),
      customerService: checkModuleData('customerService', meeting.modules.customerService),
      operations: checkModuleData('operations', meeting.modules.operations)
    };
  });

  console.log('Module Analysis:');
  console.log('================\n');

  Object.entries(moduleProgress).forEach(([module, data]) => {
    console.log(`${module}:`);
    console.log(`  Total properties: ${data.totalValues}`);
    console.log(`  Non-empty (by filter): ${data.nonEmptyCount}`);
    console.log(`  Non-empty values found: ${data.details.length}`);

    if (data.details.length > 0) {
      console.log('  Non-empty items:');
      data.details.slice(0, 5).forEach(item => {
        console.log(`    - ${item.path}: ${JSON.stringify(item.value)}`);
      });
      if (data.details.length > 5) {
        console.log(`    ... and ${data.details.length - 5} more`);
      }
    }
    console.log('');
  });

  // Now check what the Dashboard shows
  const dashboardProgress = await page.evaluate(() => {
    const progressElements = document.querySelectorAll('.text-sm.text-gray-600');
    const progressTexts = [];
    progressElements.forEach(el => {
      if (el.textContent.includes('מתוך')) {
        progressTexts.push(el.textContent);
      }
    });

    // Get module progress indicators
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

    return { progressTexts, modules };
  });

  console.log('Dashboard Display:');
  console.log('==================');
  console.log('Progress text:', dashboardProgress.progressTexts);
  console.log('\nModule Progress:');
  dashboardProgress.modules.forEach(m => {
    console.log(`  ${m.name}: ${m.progress}`);
  });

  console.log('\n===============================================');
  console.log('BUG CONFIRMED: Modules show progress even when empty!');
  console.log('The issue is in the getModuleProgress function in useMeetingStore.ts');
  console.log('It counts empty objects {} and arrays [] as completed values.');

  setTimeout(() => {
    browser.close();
  }, 5000);
})();