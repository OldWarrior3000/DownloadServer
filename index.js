const express = require('express')
const puppeteer = require('puppeteer-extra')
var bodyParser = require('body-parser')
const app = express()
const port = 8080

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({
    blockTrackers: true
}))

var jsonParser = bodyParser.json()

app.post('/download', jsonParser, async (req, res) => {
    const requestBody = req.body;

    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page.goto(requestBody.Url);
    const content = await page.content();
    await browser.close();    

    res.status(200)
        .send({
            "Content": content            
        });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})