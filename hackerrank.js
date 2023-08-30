let minimist = require('minimist');
let fs = require('fs');
let puppeteer = require('puppeteer');

let args = minimist(process.argv);

// let browserPromise = puppeteer.launch({headless: false});
// browserPromise.then(function(browser) {
//     let pagePromise = browser.pages();
//     pagePromise.then(function(pages) {
//         let responsePromise = pages[0].goto(args.url);
//         responsePromise.then(function(response) {
//             let closePromise = browser.close();
//             closePromise.then(function() {
//                 console.log("Browser is closed");
//             })
//         })
//     })
// })

async function init() {


let configJSON = fs.readFileSync(args.config, "utf-8");
let configJSO = JSON.parse(configJSON);

let browser = await puppeteer.launch(
    {headless: false,
        args: [
            '--start-maximized'
        ],
    defaultViewport: null
    });
let pages = await browser.pages();
let page = pages[0];
await page.goto(args.url);

await page.waitForSelector("a[data-event-action='Login']");
await page.click("a[data-event-action='Login']");

await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
await page.click("a[href='https://www.hackerrank.com/login']");

await page.waitForSelector("input[name='username']");
await page.type("input[name='username']", configJSO.email, {delay: 30});

await page.waitForSelector("input[name='password']");
await page.type("input[name='password']", configJSO.password, {delay: 30});

await page.waitFor(2000);

await page.waitForSelector("button[data-analytics='LoginPassword']");
await page.click("button[data-analytics='LoginPassword']");


await page.waitForSelector("a[data-analytics='NavBarContests']");
await page.click("a[data-analytics='NavBarContests']");

await page.waitForSelector("a[href='/administration/contests/']");
await page.click("a[href='/administration/contests/']");


    await page.waitForSelector("a.backbone.block-center");
    let curls = await page.$$eval("a.backbone.block-center", function(atags) {
        let urls = [];
        for(let i=0; i<atags.length; i++) {
            let url = atags[i].getAttribute("href");
            urls.push(url);

        }
        return urls
    })
    console.log(curls);

    for(let i=0;i<curls.length; i++) {
        let npage = await browser.newPage();
        await npage.goto(args.url + curls[i]);
       
        

     
    await npage.waitForSelector("li[data-tab='moderators']");
    await npage.click("li[data-tab='moderators']");
    await npage.waitFor(2000);
    await npage.waitForSelector("button#confirmBtn");
    await npage.click("button#confirmBtn");

    await npage.waitForSelector("input#moderator");
    await npage.type("input#moderator", configJSO.moderator, {delay: 30});

    await npage.keyboard.press("Enter");
    
       npage.close();
       page.waitFor(2000);
    }
    page.close();
}
init();
