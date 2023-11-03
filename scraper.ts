const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const { writeFile } = require('fs');


const url = 'https://www.algonquincollege.com/';

const searchTermCLI = process.argv.length > 2 ? process.argv[2] : 'Engineering';

puppeteer.launch({ headless: false }).then(async browser => {
  const page = await browser.newPage()
  await page.setViewport({ width: 800, height: 600 })

  console.log(`Testing the stealth plugin..`)

  await page.goto('https://www.algonquincollege.com/')
  await page.waitForTimeout(5000)
  await page.screenshot({ path: './mainpage.png '})

  const searchBTN = await page.waitForSelector('button.programSearchButton');
  await page.type('input#programSearch', searchTermCLI, { delay: 100 });
  await searchBTN.click();

  await page.waitForNavigation({ waitUntil: 'load'});
  await page.waitForSelector('table.programFilterList');

  await page.screenshot({ path: './table.png', fullPage: true});

  console.log(`All done, check the screenshots. ✨`)
  await browser.close()
})