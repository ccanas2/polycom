const csv = require('csv-parser')
const fs = require('fs')
const puppeteer = require('puppeteer');
const readline = require('readline-sync');


function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function factoryReset(ip, password) {
  const browser = await puppeteer.launch({ headless: true, ignoreHTTPSErrors: true });
  const page = await browser.newPage();


  await page.goto("https://" + ip);

  await page.setViewport({
    width: 1200,
    height: 800
  });
  await page.waitForSelector('input');
  await page.type('input[type="password"]', password);
  await page.click('input[class="button gray medium"]', 'MouseButton')

  await page.waitForSelector('li.menu-item');
  await timeout(2500);
  await page.click('li#topMenuItem6', 'MouseButton');
  await page.click('li[src="phoneBackupRestore.htm"]', 'MouseButton');


  await page.waitForSelector('div#section');
  await timeout(500);
  await page.click('div#section > p.section > strong > span[textid="88"]', 'MouseButton');
  await timeout(500);
  await page.click('input[name="RestoreToFacrotyBtn"]', 'MouseButton');
  await timeout(500);
  await page.click('div.popup > div.btn-popup-actions > button#popupbtn0', 'MouseButton');


  console.log(`Success! ${ip} has been factory reset`);
  await timeout(3000);
  browser.close();
}

async function reboot(ip, password) {
  const browser = await puppeteer.launch({ headless: true, ignoreHTTPSErrors: true });
  const page = await browser.newPage();


  await page.goto("https://" + ip);

  await page.setViewport({
    width: 1200,
    height: 800
  });

  await page.waitForSelector('input');
  await page.type('input[type="password"]', password);
  await page.click('input[class="button gray medium"]', 'MouseButton')

  await page.waitForSelector('li.menu-item');
  await timeout(2500);
  await page.click('li#topMenuItem6', 'MouseButton');
  await page.click('li[src="rebootPhone.htm"]', 'MouseButton');

  await timeout(500);
  await page.click('div.popup > div.btn-popup-actions > button#popupbtn0', 'MouseButton');


  console.log(`Success! ${ip} is rebooting.`);
  await timeout(1000);
  browser.close();
}

async function provisionZoom(ip, password) {
  const browser = await puppeteer.launch({ headless: true, ignoreHTTPSErrors: true });
  const page = await browser.newPage();


  await page.goto("https://" + ip);

  await page.setViewport({
    width: 1200,
    height: 800
  });

  await page.waitForSelector('input');
  await page.type('input[type="password"]', password);
  await page.click('input[class="button gray medium"]', 'MouseButton')

  await page.waitForSelector('li.menu-item');
  await timeout(2500);
  await page.click('li#topMenuItem4', 'MouseButton');
  await page.click('li[src="provConf.htm"]', 'MouseButton');

  await timeout(500);
  await page.select('select[name="445"]', '3')
  await page.type('input[paramname="device.prov.serverName"]','https://provpp.zoom.us/api/v2/pbx/provisioning/Polycom/vvx500')

  await page.click('input[name="451"]', 'MouseButton');
  for(let i = 0; i<8; i++){
    await page.keyboard.press('Backspace');
  }

  await page.click('input[name="437"]', 'MouseButton');
  for(let i = 0; i<4; i++){
    await page.keyboard.press('Backspace');
  }

  await page.click('div#section > p.section > strong > span[textid="361"]', 'MouseButton');
  await timeout(500);
  await page.select('select[name="168"]', '2')

  await page.click('div#buttonContent > button > span[textid="574"]', 'MouseButton');
  await page.click('div.btn-popup-actions > button#popupbtn0', 'MouseButton');

  console.log(`Success! ${ip} is provisioned for Zoom.`);
  await timeout(1500);
  browser.close(); 
}

async function rebootAll() {

  let devices = [];

  console.log('Initiating Reboot...');

  fs.createReadStream('devices.csv')
    .pipe(csv())
    .on('data', (row) => {
      devices.push(row);
    })
    .on('end', async () => {
      console.log("CSV was read for rebootAll");
      for (let device of devices) {
        try {
          console.log(`Rebooting ${device.ipAddress}`);
          await reboot(device.ipAddress, device.password)
        }
        catch (err) {
          console.log(`ERROR: Could not reboot ${device.ipAddress}`);
        }
      }
    });


}

async function factoryResetAll() {

  let devices = [];

  console.log('Initiating Factory Reset...');

  fs.createReadStream('devices.csv')
    .pipe(csv())
    .on('data', (row) => {
      devices.push(row);
    })
    .on('end', async () => {
      console.log("CSV was read for factoryResetAll");
      for (let device of devices) {
        try {
          console.log(`Factory resetting ${device.ipAddress}`);
          await factoryReset(device.ipAddress, device.password)
        }
        catch (err) {
          console.log(`ERROR: Could not factory reset ${device.ipAddress}`);
        }
      }
    });


}

async function provisionZoomAll() {

  let devices = [];

  console.log('Initiating Zoom Manual Provisioning...');

  fs.createReadStream('devices.csv')
    .pipe(csv())
    .on('data', (row) => {
      devices.push(row);
    })
    .on('end', async () => {
      console.log("CSV was read for ProvisionZoomAll");
      for (let device of devices) {
        try {
          console.log(`Zoom provisioning ${device.ipAddress}`);
          await provisionZoom(device.ipAddress, device.password)
        }
        catch (err) {
          console.log(`ERROR: Could not Zoom provision ${device.ipAddress}`);
        }
      }
    });


}

async function main() {
  console.log('Polycom VVX 500');

  let choice = 0;

  const choices = [
    'Factory Reset All',
    'Reboot All',
    'Manual Zoom Provision All'
  ];

  while (choice != -1) {
    choice = readline.keyInSelect(choices, 'Select an option', { cancel: 'Exit' });

    switch (choice) {
      case -1:
        // Exit
        console.log('Goodbye...');
        break;
      case 0:

        await factoryResetAll();
        choice = -1
        break;
      case 1:

        await rebootAll();
        choice = -1
        break;
      case 2:

        await provisionZoomAll();
        choice = -1
        break;
      default:
        console.log('Invalid choice! Please try again.');
    }
  }
}

main();