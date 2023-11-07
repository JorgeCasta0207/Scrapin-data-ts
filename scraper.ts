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


  const data = await page.$$eval('table.programFilterList tbody tr', (rows) => {
    return rows.map( row => {
      if(row.classList.contains('odd') || row.classList.contains('even')){
        const tds = row.querySelectorAll('td');
        return {
          name: tds[1].innerText,
          area: tds[2].innerText,
          campus: tds[3].innerText,
          length: tds[5].innerText,
        }
      } else {
        return null;
      }
    })
    .filter((row) => row);
  });

  console.log({data});

  await writeFile('./data/courseDetails.JSON', JSON.stringify(data), 'utf-8', (err) => {
    if(err) throw err;
    console.log('Data Has Been Saved :)');
  });

  console.log(`All done, check the screenshots. ✨`)
  await browser.close()
})