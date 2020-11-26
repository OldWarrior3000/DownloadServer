const express = require('express')
const puppeteer = require('puppeteer-extra')
var bodyParser = require('body-parser')
const randomUseragent = require('user-agents');

const app = express()

const port = 8080
const USER_AGENT = 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0';

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({
    blockTrackers: true
}))

var jsonParser = bodyParser.json()

app.post('/download', jsonParser, async (req, res) => {
    const requestBody = req.body;
    console.log("Downloading: " + requestBody.Url)
    const userAgent = new randomUseragent().toString();
    const UA = userAgent || USER_AGENT;
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.CHROME_BIN || null,
        args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage']
    });
    console.log("User agent: " + UA);

    const page = await browser.newPage();
    await page.setViewport({
        width: 1920 + Math.floor(Math.random() * 100),
        height: 3000 + Math.floor(Math.random() * 100),
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: false,
        isMobile: false,
    });
    await page.setUserAgent(UA);
    await page.setJavaScriptEnabled(true);
    await page.setDefaultNavigationTimeout(0);
    
    await page.setRequestInterception(true);
    //Skip images/styles/fonts loading for performance
    //No considerable performance benefit found
    // page.on('request', (req) => {
    //     if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
    //         req.abort();
    //     } else {
    //         req.continue();
    //     }
    // });

    await page.evaluateOnNewDocument(() => {
        // Pass webdriver check
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });
    });

    await page.evaluateOnNewDocument(() => {
        // Pass chrome check
        window.chrome = {
            runtime: {},
            // etc.
        };
    });

    await page.evaluateOnNewDocument(() => {
        //Pass notifications check
        const originalQuery = window.navigator.permissions.query;
        return window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );
    });

    await page.evaluateOnNewDocument(() => {
        // Overwrite the `plugins` property to use a custom getter.
        Object.defineProperty(navigator, 'plugins', {
            // This just needs to have `length > 0` for the current test,
            // but we could mock the plugins too if necessary.
            get: () => [1, 2, 3, 4, 5],
        });
    });

    await page.evaluateOnNewDocument(() => {
        // Overwrite the `languages` property to use a custom getter.
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
        });
    });

    await page.goto(requestBody.Url, { waitUntil: 'networkidle2', timeout: 0 });
    const content = await page.content();
    await browser.close();

    res.status(200)
        .send({
            "Content": content
        });

    res.end();
    console.log("Downloaded finished: " + requestBody.Url)
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})