'use strict';

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const puppeteer = require('puppeteer');

module.exports = app => {
     app.get('/', (req,res) => {
        res.render('index.html')
     });

     app.get('/about', (req,res) => {
        console.log('in about.html');
        res.render('about.html');
    });

    app.post('/myaction', urlencodedParser, (req, res) => {
      console.log(req.body.name + ' in myaction');

    (async() => {
    const browser = await puppeteer.launch({headless : false, args : ['--ignore-certificate-errors']}); // , args: ['--start-fullscreen']
    const page = await browser.newPage();

//    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto('http://dev.sell.smartstore.naver.com/#/login', {waitUntil: 'networkidle2'});
    await page.type('#loginId', 'qa1test574@naver.com');
    await page.type('#loginPassword', 'qatest123');

    console.log(req.body.name + ' in myaction');
    await page.click('#loginButton');
    await page.screenshot({path: 'example1.png'});
    //await page.waitForNavigation( { waitUntil : 'networkidle2' } );
    await page.waitForSelector('#seller-lnb');

    // 스토어 홈
    await page.screenshot({path: 'example2.png'});
    await page.click('#seller-lnb > div > div:nth-child(1) > ul > li:nth-child(1) > a');

    // 상품등록 메뉴 클릭
    await page.waitForSelector('#seller-lnb > div > div:nth-child(1) > ul > li.ng-scope.active > ul > li:nth-child(1) > a');
    await page.click('#seller-lnb > div > div:nth-child(1) > ul > li.ng-scope.active > ul > li:nth-child(2) > a');

    // 상품이미지 - 대표이미지
    await page.waitForSelector('#representImage > div > div.seller-product-img.add-img > div > ul > li > div > a');
    await page.click('#representImage > div > div.seller-product-img.add-img > div > ul > li > div > a');

    // 상품이미지 - 내사진 - file upload
    await page.waitForSelector('input[type="file"]', { timeout: 3000 });
    const input = await page.$('input[type="file"]');
    await input.uploadFile(__dirname + '\\..\\images\\product_image.jpg');

    // 상세설명
//    await page.waitForSelector('[class="btn btn-primary btn-lg ng-binding"]');
//    await page.click('[class="btn btn-primary btn-lg ng-binding"]');
//    const pages = await browser.pages(); // get all open pages by the browser
//    const popup = pages[pages.length - 1]; // the popup should be the last page opened
//
//    await popup.waitForSelector('[class="__se_pop_close btn_close_pop"]');
//    await popup.click('[class="__se_pop_close btn_close_pop"]');
//
//    await popup.waitForSelector('[title=구분선]');
//    await popup.click('[title=구분선]');
//    await popup.click('#se_top_publish_btn');

    await page.waitFor(1000);

    await page.screenshot({path: 'example3.png'});

    res.send('Product registration succeeded..!');

    await page.evaluate(() => console.log(`url is ${location.href}`));
    browser.close();
})();
//      res.send('You sent the name "' + req.body.name + '".');
    });
}
