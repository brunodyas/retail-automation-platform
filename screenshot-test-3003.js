const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const pages = [
  { url: 'http://localhost:3003', name: '3003-homepage' },
  { url: 'http://localhost:3003/projects', name: '3003-projects' },
  { url: 'http://localhost:3003/freelancers', name: '3003-freelancers' },
  { url: 'http://localhost:3003/login', name: '3003-login' }
];

async function captureScreenshots() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }
  
  for (const page of pages) {
    console.log(`\nNavigating to ${page.url}...`);
    const tab = await browser.newPage();
    await tab.setViewport({ width: 1920, height: 1080 });
    
    try {
      const startTime = Date.now();
      await tab.goto(page.url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      const loadTime = Date.now() - startTime;
      
      // Wait a bit more to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const screenshotPath = path.join(screenshotsDir, `${page.name}.png`);
      await tab.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      console.log(`✓ Screenshot saved: ${screenshotPath} (loaded in ${loadTime}ms)`);
    } catch (error) {
      console.error(`✗ Failed to capture ${page.name}:`, error.message);
    }
    
    await tab.close();
  }
  
  await browser.close();
  console.log('\n✓ All screenshots captured!');
}

captureScreenshots().catch(console.error);
