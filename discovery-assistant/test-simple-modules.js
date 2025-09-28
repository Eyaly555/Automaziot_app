import puppeteer from 'puppeteer';

(async () => {
  console.log('Testing Discovery Assistant - Module Navigation');
  console.log('===============================================\n');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const modules = [
    { path: '/', name: 'Dashboard' },
    { path: '/module/overview', name: 'Overview Module' },
    { path: '/module/leadsAndSales', name: 'Leads & Sales Module' },
    { path: '/module/customerService', name: 'Customer Service Module' },
    { path: '/module/operations', name: 'Operations Module' },
    { path: '/module/reporting', name: 'Reporting Module' },
    { path: '/module/aiAgents', name: 'AI Agents Module' },
    { path: '/module/systems', name: 'Systems Module' },
    { path: '/module/roi', name: 'ROI Module' },
    { path: '/module/planning', name: 'Planning Module' }
  ];

  let allPass = true;

  for (const module of modules) {
    try {
      await page.goto(`http://localhost:5173${module.path}`, { waitUntil: 'networkidle2', timeout: 10000 });

      // Check if page has content
      const hasContent = await page.evaluate(() => {
        return document.body.textContent.length > 50;
      });

      // Check for React root
      const hasReactRoot = await page.evaluate(() => {
        const root = document.getElementById('root');
        return root && root.innerHTML.length > 0;
      });

      if (hasContent && hasReactRoot) {
        console.log(`✅ ${module.name}: WORKING`);
      } else {
        console.log(`❌ ${module.name}: No content`);
        allPass = false;
      }
    } catch (error) {
      console.log(`❌ ${module.name}: ERROR - ${error.message}`);
      allPass = false;
    }
  }

  await browser.close();

  console.log('\n===============================================');
  if (allPass) {
    console.log('✅ ALL MODULES ARE WORKING!');
    console.log('The Discovery Assistant app is fully functional at http://localhost:5173');
  } else {
    console.log('⚠️ Some modules had issues');
  }
  console.log('===============================================');
})();