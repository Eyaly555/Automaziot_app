// Comprehensive Progress Bug Detection Script
// This script tests if modules show incorrect progress when no user input exists

import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true,
        args: ['--window-size=1400,900']
    });

    const page = await browser.newPage();

    // Enable console logging
    page.on('console', msg => {
        if (msg.type() === 'log' || msg.type() === 'error') {
            console.log(`BROWSER ${msg.type().toUpperCase()}: ${msg.text()}`);
        }
    });

    console.log('\n=== PHASE 1: TESTING FRESH START ===\n');

    // Clear all localStorage data
    await page.evaluateOnNewDocument(() => {
        localStorage.clear();
    });

    await page.goto('http://localhost:5176');
    await page.waitForTimeout(2000);

    // Check if there's any existing meeting
    const hasExistingMeeting = await page.evaluate(() => {
        const data = localStorage.getItem('discovery-assistant-storage');
        if (!data) return false;
        const store = JSON.parse(data);
        return store.state && store.state.currentMeeting !== null;
    });

    if (hasExistingMeeting) {
        console.log('⚠️ WARNING: Found existing meeting after clear!');
    } else {
        console.log('✅ No existing meetings found (correct)');
    }

    console.log('\n=== PHASE 2: CREATE NEW MEETING ===\n');

    // Create a new meeting programmatically
    await page.evaluate(() => {
        const store = window.localStorage.getItem('discovery-assistant-storage');
        const parsedStore = store ? JSON.parse(store) : { state: { meetings: [], currentMeeting: null }, version: 0 };

        const newMeeting = {
            meetingId: Math.random().toString(36).substr(2, 9),
            clientName: 'Test Client - Bug Detection',
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

        parsedStore.state.currentMeeting = newMeeting;
        parsedStore.state.meetings.push(newMeeting);

        window.localStorage.setItem('discovery-assistant-storage', JSON.stringify(parsedStore));
    });

    // Reload to apply the new meeting
    await page.reload();
    await page.waitForTimeout(2000);

    console.log('\n=== PHASE 3: CHECK INITIAL PROGRESS ===\n');

    // Check the progress calculation in detail
    const progressDetails = await page.evaluate(() => {
        const data = localStorage.getItem('discovery-assistant-storage');
        if (!data) return { error: 'No data in localStorage' };

        const store = JSON.parse(data);
        const meeting = store.state.currentMeeting;
        if (!meeting) return { error: 'No current meeting' };

        // Manually check each module for data
        const moduleChecks = {};
        Object.entries(meeting.modules).forEach(([moduleName, moduleData]) => {
            const hasData = moduleData && Object.keys(moduleData).length > 0;
            const values = moduleData ? Object.values(moduleData) : [];

            moduleChecks[moduleName] = {
                hasKeys: moduleData && Object.keys(moduleData).length > 0,
                keyCount: moduleData ? Object.keys(moduleData).length : 0,
                keys: moduleData ? Object.keys(moduleData) : [],
                hasNonEmptyValues: values.some(v => {
                    if (v === null || v === undefined || v === '') return false;
                    if (Array.isArray(v)) return v.length > 0;
                    if (typeof v === 'object') return Object.keys(v).length > 0;
                    if (typeof v === 'boolean') return v === true;
                    if (typeof v === 'number') return v > 0;
                    return true;
                }),
                rawData: moduleData
            };
        });

        return {
            meeting: {
                clientName: meeting.clientName,
                moduleCount: Object.keys(meeting.modules).length
            },
            modules: moduleChecks
        };
    });

    console.log('Module Data Analysis:');
    console.log('====================');

    let hasInitialDataBug = false;

    Object.entries(progressDetails.modules).forEach(([moduleName, info]) => {
        if (info.hasKeys || info.hasNonEmptyValues) {
            console.log(`❌ ${moduleName}: HAS DATA (Bug!)`, {
                keyCount: info.keyCount,
                keys: info.keys,
                hasValues: info.hasNonEmptyValues
            });
            hasInitialDataBug = true;
        } else {
            console.log(`✅ ${moduleName}: Empty (Correct)`);
        }
    });

    // Check what's displayed in the UI
    console.log('\n=== PHASE 4: CHECK UI DISPLAY ===\n');

    try {
        // Look for the progress text
        const progressText = await page.evaluate(() => {
            // Find element containing "מתוך 9"
            const elements = Array.from(document.querySelectorAll('*'));
            for (const el of elements) {
                if (el.textContent && el.textContent.includes('מתוך 9')) {
                    return el.textContent.trim();
                }
            }
            return null;
        });

        if (progressText) {
            console.log(`Found progress text: "${progressText}"`);

            // Extract the number before "מתוך 9"
            const match = progressText.match(/(\d+)\s*מתוך\s*9/);
            if (match) {
                const completedModules = parseInt(match[1]);
                if (completedModules > 0) {
                    console.log(`❌ BUG DETECTED: Shows ${completedModules} completed modules with no user input!`);
                    hasInitialDataBug = true;
                } else {
                    console.log(`✅ Correct: Shows 0 completed modules`);
                }
            }
        } else {
            console.log('⚠️ Could not find progress text in UI');
        }

        // Check overall progress percentage
        const overallProgress = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            for (const el of elements) {
                if (el.textContent && el.textContent.match(/^\d+%$/)) {
                    const parent = el.closest('[class*="התקדמות כללית"]');
                    if (parent) {
                        return el.textContent;
                    }
                }
            }
            // Try another approach
            const progressBars = document.querySelectorAll('[role="progressbar"], .progress-bar, [class*="progress"]');
            for (const bar of progressBars) {
                const value = bar.getAttribute('aria-valuenow') || bar.getAttribute('value');
                if (value) return `${value}%`;
            }
            return null;
        });

        if (overallProgress) {
            console.log(`Overall progress shown: ${overallProgress}`);
            const progressNum = parseInt(overallProgress);
            if (progressNum > 0) {
                console.log(`❌ BUG: Overall progress is ${progressNum}% with no user input!`);
                hasInitialDataBug = true;
            } else {
                console.log(`✅ Correct: Overall progress is 0%`);
            }
        }

    } catch (error) {
        console.log('Error checking UI:', error);
    }

    console.log('\n=== PHASE 5: TEST USER INPUT ===\n');

    // Navigate to a module and add some data
    await page.click('text=סקירה כללית');
    await page.waitForTimeout(2000);

    // Fill in some actual data
    const inputFilled = await page.evaluate(() => {
        const input = document.querySelector('input[type="text"], input[type="number"]');
        if (input) {
            input.value = 'Test Value';
            input.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
        return false;
    });

    if (inputFilled) {
        console.log('✅ Added user input to module');

        // Go back and check if progress increased
        await page.goBack();
        await page.waitForTimeout(2000);

        const afterInputProgress = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            for (const el of elements) {
                if (el.textContent && el.textContent.includes('מתוך 9')) {
                    return el.textContent.trim();
                }
            }
            return null;
        });

        console.log(`Progress after user input: ${afterInputProgress}`);
    }

    console.log('\n=== FINAL REPORT ===\n');

    if (hasInitialDataBug) {
        console.log('🚨 CRITICAL BUG FOUND: Application shows progress without any user input!');
        console.log('This needs to be fixed before production deployment.');
        console.log('\nProbable causes:');
        console.log('1. Modules are initialized with non-empty objects');
        console.log('2. Progress calculation counts empty objects as completed');
        console.log('3. hasUserInput function not properly filtering empty data');
    } else {
        console.log('✅ No initial progress bug detected - modules start empty as expected');
    }

    // Keep browser open for manual inspection
    console.log('\nBrowser kept open for manual inspection. Close manually when done.');

})().catch(console.error);