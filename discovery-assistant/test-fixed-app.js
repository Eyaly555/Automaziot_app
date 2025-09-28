import puppeteer from 'puppeteer';

(async () => {
  console.log('Testing Fixed Application');
  console.log('===============================================\n');

  const browser = await puppeteer.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  try {
    // Go to Dashboard
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

    // Clear localStorage to start completely fresh
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Reload to apply clear state
    await page.reload({ waitUntil: 'networkidle2' });

    console.log('1. Testing new meeting creation...');

    // Click "New Meeting" button
    await page.waitForSelector('button');
    const buttons = await page.$$('button');

    // Find the new meeting button (should be visible when no meeting exists)
    let newMeetingButton = null;
    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && (text.includes('פגישה חדשה') || text.includes('התחל פגישה חדשה'))) {
        newMeetingButton = button;
        break;
      }
    }

    if (newMeetingButton) {
      // Handle the prompt dialog for client name
      page.once('dialog', async dialog => {
        console.log('Entering client name...');
        await dialog.accept('Test Client Fixed');
      });

      await newMeetingButton.click();
      await new Promise(r => setTimeout(r, 1000));

      // Check the initial state after meeting creation
      console.log('2. Checking initial progress after meeting creation...\n');

      const initialProgress = await page.evaluate(() => {
        // Find the overall progress text
        const progressElements = document.querySelectorAll('.text-sm.text-gray-600');
        let progressText = '';
        progressElements.forEach(el => {
          if (el.textContent && el.textContent.includes('מתוך')) {
            progressText = el.textContent;
          }
        });

        // Get module cards and their progress
        const moduleCards = document.querySelectorAll('[class*="bg-white rounded-xl"]');
        const modules = [];

        moduleCards.forEach(card => {
          const nameEl = card.querySelector('.font-semibold');
          const percentEl = card.querySelector('.text-gray-500');
          const statusEl = card.querySelector('.font-medium');

          if (nameEl && percentEl) {
            modules.push({
              name: nameEl.textContent,
              progress: percentEl.textContent,
              status: statusEl ? statusEl.textContent : 'unknown'
            });
          }
        });

        return { progressText, modules };
      });

      console.log('Overall Progress:', initialProgress.progressText);
      console.log('\nModule Status:');
      initialProgress.modules.forEach(m => {
        console.log(`  ${m.name}: ${m.progress} (${m.status})`);
      });

      // Navigate to a module and check if it starts empty
      console.log('\n3. Testing module navigation...');

      const moduleCard = await page.$('[class*="bg-white rounded-xl"]');
      if (moduleCard) {
        await moduleCard.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        console.log('Navigated to first module');

        // Check if module has any pre-filled data
        const moduleData = await page.evaluate(() => {
          const inputs = document.querySelectorAll('input, textarea, select');
          const filledInputs = [];

          inputs.forEach(input => {
            if (input.value && input.value !== '' && input.value !== '0') {
              filledInputs.push({
                type: input.type,
                value: input.value,
                name: input.name || input.id
              });
            }
          });

          return filledInputs;
        });

        if (moduleData.length > 0) {
          console.log('WARNING: Module has pre-filled data:');
          moduleData.forEach(d => {
            console.log(`  - ${d.name || d.type}: ${d.value}`);
          });
        } else {
          console.log('✅ Module starts empty (no pre-filled data)');
        }

        // Go back to dashboard
        await page.goBack({ waitUntil: 'networkidle2' });
      }

      // Test adding actual data to a module
      console.log('\n4. Testing data entry and progress update...');

      // Navigate to Overview module
      const overviewCard = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('[class*="bg-white rounded-xl"]'));
        const overview = cards.find(c => c.textContent.includes('סקירה כללית'));
        if (overview) {
          overview.click();
          return true;
        }
        return false;
      });

      if (overviewCard) {
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Fill in some data
        const firstInput = await page.$('input[type="text"], textarea');
        if (firstInput) {
          await firstInput.type('Test Data Entry');
          console.log('Entered test data in Overview module');
        }

        // Wait for auto-save
        await new Promise(r => setTimeout(r, 2000));

        // Go back to dashboard
        await page.goBack({ waitUntil: 'networkidle2' });

        // Check if progress updated
        const updatedProgress = await page.evaluate(() => {
          const progressElements = document.querySelectorAll('.text-sm.text-gray-600');
          let progressText = '';
          progressElements.forEach(el => {
            if (el.textContent && el.textContent.includes('מתוך')) {
              progressText = el.textContent;
            }
          });
          return progressText;
        });

        console.log('Updated Progress:', updatedProgress);
      }

      // Final check of localStorage to see stored structure
      console.log('\n5. Checking stored data structure...');

      const storedData = await page.evaluate(() => {
        const stored = localStorage.getItem('discovery-assistant-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          const meeting = parsed.state?.currentMeeting;

          if (meeting) {
            const checkModule = (name, data) => {
              const isEmpty = (obj) => {
                if (!obj) return true;
                if (typeof obj !== 'object') return false;
                if (Array.isArray(obj)) return obj.length === 0;
                return Object.keys(obj).length === 0;
              };

              return {
                name,
                isEmpty: isEmpty(data),
                structure: JSON.stringify(data).substring(0, 100)
              };
            };

            return Object.entries(meeting.modules).map(([key, value]) =>
              checkModule(key, value)
            );
          }
        }
        return null;
      });

      if (storedData) {
        console.log('Module Storage Status:');
        storedData.forEach(m => {
          console.log(`  ${m.name}: ${m.isEmpty ? '✅ Empty' : '❌ Has data'}`);
          if (!m.isEmpty) {
            console.log(`    Data: ${m.structure}...`);
          }
        });
      }

      console.log('\n===============================================');
      console.log('Test Summary:');

      const issues = [];

      // Check for initial progress issue
      if (initialProgress.progressText && !initialProgress.progressText.includes('0 מתוך')) {
        issues.push('Initial progress shows non-zero completed modules');
      }

      // Check for module progress issues
      const modulesWithProgress = initialProgress.modules.filter(m =>
        m.progress !== '0%' && !m.status.includes('טרם התחיל')
      );
      if (modulesWithProgress.length > 0) {
        issues.push(`${modulesWithProgress.length} modules show progress without user input`);
      }

      if (issues.length === 0) {
        console.log('✅ ALL BUGS FIXED! Application behaves correctly.');
      } else {
        console.log('❌ Issues found:');
        issues.forEach(issue => console.log(`  - ${issue}`));
      }
    } else {
      console.log('ERROR: Could not find New Meeting button');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    setTimeout(() => {
      browser.close();
    }, 5000);
  }
})();