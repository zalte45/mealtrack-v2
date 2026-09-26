const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });

  try {
    console.log('Testing Login...');
    await page.goto('http://localhost:3000/login');
    await page.type('input[type="email"]', 'owner@mealtrack.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForNavigation();
    const url = page.url();
    if (!url.includes('/dashboard')) {
      throw new Error(`Expected redirect to /dashboard, but got ${url}`);
    }
    console.log('Login Success. URL:', url);

    const routes = [
      '/dashboard',
      '/counter',
      '/customers',
      '/subscriptions',
      '/history',
      '/reports',
      '/settings'
    ];

    for (const route of routes) {
      console.log(`Testing ${route}...`);
      await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle0' });
      const h1 = await page.$eval('h1', el => el.textContent).catch(() => 'No H1');
      console.log(`  Loaded ${route}. H1: ${h1}`);
      await new Promise(r => setTimeout(r, 1000));
    }

    if (errors.length > 0) {
      console.log('--- ERRORS FOUND ---');
      errors.forEach(e => console.log(e));
    } else {
      console.log('--- NO ERRORS FOUND. ALL TESTS PASSED. ---');
    }

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
})();
