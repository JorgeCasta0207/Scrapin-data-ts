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

const SBR_WS_ENDPOINT = 'wss://brd-customer-hl_c03c76ab-zone-scraping_browser:q6smmrswbvs0@brd.superproxy.io:9222';

async function main() {
    console.log('Connecting to Scraping Browser...');
    const browser = await puppeteer.connect({
        browserWSEndpoint: SBR_WS_ENDPOINT,
    });
    try {
        const page = await browser.newPage();
        console.log('Connected! Navigating to https://www.modbee.com/news/local/...');
        await page.goto('https://www.modbee.com/news/local/');

        const selector = '.digest'

        await page.waitForSelector(selector);
        const el = await page.$(selector);

        const text = await el.evaluate(e => e.innerHTML);
      


        console.log('Navigated! Scraping page content...');
        // const html = await page.content();
        console.log(text);

        await writeFile('./data/ModBee.JSON', JSON.stringify(text), 'utf-8', (err) => {
          if(err) throw err;
          console.log('HTML Data Saved Babbby!');
        });


    } finally {
        await browser.close();
    }
}

main().catch(err => {
    console.error(err.stack || err);
    process.exit(1);
});