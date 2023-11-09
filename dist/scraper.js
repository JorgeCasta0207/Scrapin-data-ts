const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const { writeFile } = require('fs');
const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer');
const AdBlocker = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdBlocker({
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY
}));
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
        const articleLinks = await page.$$eval('article.package h3 a', links => links.map(link => link.getAttribute('href')));
        const articleContents = [];
        for (let link of articleLinks) {
            console.log('Navigating to:', link);
            await page.goto(link);
            console.log('Scraping content from:', link);
            const content = await page.evaluate(() => {
                const paragraphs = Array.from(document.querySelectorAll('article.paper.story-body p'));
                return paragraphs.map(p => p.textContent);
            });
            articleContents.push({ link, content });
        }
        const date = new Date().toISOString().replace(/:/g, '-');
        const fileName = `Modbee_${date}.json`;
        await writeFile(`./data/${fileName}`, JSON.stringify(articleContents), 'utf-8', (err) => {
            if (err)
                throw err;
            console.log('All Article Data Saved✅');
        });
    }
    finally {
        await browser.close();
    }
}
main().catch(err => {
    console.error(err.stack || err);
    process.exit(1);
});
