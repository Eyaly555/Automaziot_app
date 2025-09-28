import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Listen for console messages
  page.on('console', msg => {
    console.log('Console:', msg.type(), msg.text());
  });

  // Listen for errors
  page.on('error', error => {
    console.log('Error:', error.message);
  });

  page.on('pageerror', error => {
    console.log('Page Error:', error.message);
  });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  // Get the page content
  const content = await page.content();
  console.log('\n=== Page Title ===');
  const title = await page.title();
  console.log(title);

  console.log('\n=== Checking if React loaded ===');
  const rootContent = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root ? root.innerHTML.substring(0, 200) : 'No root element';
  });
  console.log('Root element content:', rootContent);

  console.log('\n=== Checking for visible text ===');
  const visibleText = await page.evaluate(() => {
    return document.body.innerText.substring(0, 500);
  });
  console.log('Visible text:', visibleText);

  console.log('\n=== Checking for errors ===');
  const errors = await page.evaluate(() => {
    return window.errors || [];
  });
  console.log('Errors:', errors);

  await browser.close();
  console.log('\nDone!');
})();