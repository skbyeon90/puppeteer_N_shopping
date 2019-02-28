const timeout = 100000;
const puppeteer = require('puppeteer');

describe('크롤링', () => {
    let page;
    let browser;

     beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: true,
            ignoreHTTPSErrors: false, // doesn't matter
            args: [
                '--ignore-certificate-errors',
                '--ignore-certificate-errors-spki-list '
            ]
        });
      page =  (await browser.pages())[0];
     }, timeout);


    afterAll(async () => {
      await browser.close();
    }, timeout);


    test('베스트 100 크롤링하기', async () => {

       await page.setRequestInterception(true);
       page.on('request', (request) => {
           if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
               request.abort();
           } else {
               request.continue();
           }
       });
      await page.setViewport({width: 1640, height: 800});

      let urlList = ['https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000204',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000205',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000206',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000207',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000208',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000209',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000210',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000211',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000212',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000213',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000214',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000087',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000088',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000089',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000090',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000091',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000092',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000093',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000094',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000095',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000096',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000151',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000152',
      'https://search.shopping.naver.com/best100v2/detail.nhn?catId=50000153',
    ];
    for (let url of urlList) {
        await page.goto( url , {waitUntil: 'load'});

        let itemList = await page.$$('._itemSection');

        for (let item of itemList){

            let title = await item.$eval('p.cont', function (el){
              return el.innerText;
            })

            let price = await item.$eval('span.num', function(el){
              return el.innerText;
            })

            console.log(title, price + '원');
          }
      }
     }, 300000);
  }
);
