import puppeteer from 'puppeteer';

(async () => {
  console.log('Testing ROI Module...');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Listen for console messages and errors
  page.on('console', msg => console.log('Console:', msg.type(), msg.text()));
  page.on('error', error => console.log('Error:', error.message));
  page.on('pageerror', error => console.log('Page Error:', error.message));

  try {
    console.log('Navigating to ROI module...');
    await page.goto('http://localhost:5173/module/roi', { waitUntil: 'networkidle2' });

    // Get page content
    const content = await page.evaluate(() => {
      return {
        title: document.title,
        bodyText: document.body.innerText.substring(0, 500),
        hasRoot: document.getElementById('root') !== null,
        rootHTML: document.getElementById('root')?.innerHTML.substring(0, 200),
        errorElement: document.querySelector('.error') ? document.querySelector('.error').textContent : null
      };
    });

    console.log('\n=== ROI Module Status ===');
    console.log('Title:', content.title);
    console.log('Has Root:', content.hasRoot);
    console.log('Body Text:', content.bodyText || '(empty)');
    console.log('Root HTML:', content.rootHTML || '(empty)');
    if (content.errorElement) {
      console.log('Error:', content.errorElement);
    }

    // Check for specific elements
    const elements = await page.evaluate(() => {
      return {
        hasHeader: document.querySelector('h1') !== null,
        hasInputs: document.querySelectorAll('input').length,
        hasTextareas: document.querySelectorAll('textarea').length,
        hasButtons: document.querySelectorAll('button').length
      };
    });

    console.log('\n=== Elements Found ===');
    console.log('Header:', elements.hasHeader);
    console.log('Inputs:', elements.hasInputs);
    console.log('Textareas:', elements.hasTextareas);
    console.log('Buttons:', elements.hasButtons);

  } catch (error) {
    console.log('Navigation error:', error.message);
  }

  await browser.close();
})();