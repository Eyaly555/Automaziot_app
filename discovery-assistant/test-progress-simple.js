import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true
    });

    const page = await browser.newPage();

    // Enable console logging
    page.on('console', msg => {
        console.log(`Browser: ${msg.text()}`);
    });

    console.log('\n=== TESTING INITIAL PROGRESS BUG ===\n');

    // Clear localStorage
    await page.evaluateOnNewDocument(() => {
        localStorage.clear();
    });

    await page.goto('http://localhost:5176');
    await new Promise(r => setTimeout(r, 2000));

    // Create a fresh meeting
    await page.evaluate(() => {
        const meeting = {
            meetingId: 'test123',
            clientName: 'Bug Test Client',
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

    // Reload to apply changes
    await page.reload();
    await new Promise(r => setTimeout(r, 2000));

    // Check the displayed progress
    const progressInfo = await page.evaluate(() => {
        const results = {};

        // Look for "X מתוך 9"
        const allText = document.body.textContent;
        const match = allText.match(/(\d+)\s*מתוך\s*9/);
        if (match) {
            results.completedModules = parseInt(match[1]);
            results.progressText = match[0];
        }

        // Look for percentage
        const percentMatch = allText.match(/(\d+)%/);
        if (percentMatch) {
            results.overallPercentage = parseInt(percentMatch[1]);
        }

        // Check localStorage data
        const data = localStorage.getItem('discovery-assistant-storage');
        if (data) {
            const store = JSON.parse(data);
            const meeting = store.state?.currentMeeting;
            if (meeting) {
                results.modules = {};
                Object.entries(meeting.modules).forEach(([name, data]) => {
                    results.modules[name] = {
                        isEmpty: !data || Object.keys(data).length === 0,
                        keyCount: data ? Object.keys(data).length : 0
                    };
                });
            }
        }

        return results;
    });

    console.log('\n=== RESULTS ===\n');

    if (progressInfo.completedModules !== undefined) {
        if (progressInfo.completedModules > 0) {
            console.log(`❌ BUG FOUND: UI shows ${progressInfo.completedModules} modules completed with empty data!`);
        } else {
            console.log(`✅ CORRECT: UI shows 0 modules completed`);
        }
    }

    if (progressInfo.overallPercentage !== undefined) {
        if (progressInfo.overallPercentage > 0) {
            console.log(`❌ BUG FOUND: Overall progress shows ${progressInfo.overallPercentage}% with empty modules!`);
        } else {
            console.log(`✅ CORRECT: Overall progress shows 0%`);
        }
    }

    console.log('\nModule Status:');
    if (progressInfo.modules) {
        Object.entries(progressInfo.modules).forEach(([name, info]) => {
            console.log(`  ${name}: ${info.isEmpty ? '✅ Empty' : `❌ Has ${info.keyCount} keys`}`);
        });
    }

    console.log('\n=== TEST COMPLETE ===');
    console.log('Browser left open for manual inspection.');

})().catch(console.error);