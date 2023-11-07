const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const { writeFile } = require('fs');

const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer');
const AdBlocker = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(
  AdBlocker({
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY
  })
)

const url = 'https://www.modbee.com/news/local/';



puppeteer.launch({ headless: false }).then(async browser => {
  const page = await browser.newPage()
  page.setDefaultNavigationTimeout(2 * 60 * 1000);
  await page.setViewport({ width: 800, height: 600 });


  await page.goto(url);

  await page.evaluate(() => {
    const link = document.querySelector('h3.h1 a[href="https://www.modbee.com/news/local/article281504428.html#storylink=mainstage_lead"]');
    if (link instanceof HTMLAnchorElement) {
      link.click();
    } else {
      console.error('Not an anchor element...');
    }
  })

  // await page.waitForNavigation({ waitUntil: 'load'});
  

  await page.screenshot({ path: 'Test-page.jpg', fullPage: true });
  console.log('All Done Pimp!✅');

  await browser.close();

})