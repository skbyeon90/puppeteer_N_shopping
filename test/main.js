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
    //console.log(req.body.name + ' in myaction');

    // 옵션
    // 선택형 옵션 chkSelectOption
    if(req.body.chkSelectOption != undefined)
    {
        // radOptionType(radOptionTypeSolo, radOptionTypeMix) 선택형 옵션 유형
        // selSelectOptionNum(1,2,3) 옵션명 개수
        // selSelectOptionOrder(orderRegistr, orderAbc, orderHighPrice, orderLowPrice) 정렬순서
    }

    // 직접입력형 옵션 chkSelectOption
    if(req.body.chkInputOption != undefined)
    {
        // selInputOptionNum 옵션명 개수
    }

    // 상세설명
    // tProductDescription


    // 상품주요정보
    // selProductOrigin(domestic, imported, etc) 원산지
    // selProductStatus(new, used) 상품상태
    // chkCustomMade 주문제작
    // chkReturnCancel 반품/취소 안내 및 동의
    // radIsBuyChildren(possible, impossible) 미성년가 구매 가능여부

    // 상품정보제공고시
    // tProductMaterial 소재
    // tProductColor 색상
    // tProductSize 치수명
    // tProductManufacturer 제조자
    // tProductPrecautions 세탁방법 및 취급시 주의사항
    // tManuYearMonth 제조년월
    // tQualityStandards 품질보증기준
    // tAsManager AS 책임자

    // 배송
    // radIsDelivery(exist, none) 배송여부
    // radDeliveryProperty(normal, today) 배송속성
    // radDeliveryType(deliveryParcelRegistaration, deliveryDirect) 배송방법
    // chkRecieveVisit 방문수령
    // chkQuickService 퀵서비스
    // radIsDeliveryBundle(possible, impossible) 묶음배송여부
    // selDeliveryChargeType(charged, free, conditionalFree, perQuantity, perSectionTwo, perSectionThree) 상품별 배송비
    // chkPaymentCollect 결제방식-착불
    // chkPaymentAdvance 결제방식-선결제
    // tRegionCharge 지역별 차등 배송비
    // radInstallCosts(exist, none) 별도 설치비

    // 반품/교환
    // nDeliveryChargeReturn 반품배송비(편도)
    // nDeliveryChargeChange 교환배송비(왕복)

    // A/S
    // tAsNumber A/S 전화번호
    // tAsDescription A/S 안내

    // 추가상품
    // selAdditionalProductNum 추가상품 개수
    // selAdditionalProductOrder 정렬순서(orderRegistr, orderAbc, orderHighPrice, orderLowPrice)

    // 구매/혜택조건
    // nBuyConditionMin 최소구매수량
    // nBuyConditionMaxPer 최대구매수량(1회)
    // nBuyConditionMaxPerson 최대구매수량(1인)
    // nPointBuy 지급 포인트
    // selPointBuyType(won, percent) 지급 포인트 단위
    // nPointTextReview 텍스트 리뷰 포인트
    // nPointPhotoReview 포토/동영상 리뷰 포인트
    // nPoint1MTextReview 한달사용 텍스트 리뷰 포인트
    // nPoint1MPhotoReview 한달사용 포토/동영상 리뷰 포인트
    // nPointTokJJim 톡톡친구/스토어찜 고객리뷰 포인트


    // page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    (async() => {
    const browser = await puppeteer.launch({headless : false, args : ['--ignore-certificate-errors']}); // , args: ['--start-fullscreen']
    const page = await browser.newPage();

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

    // 상품명
    console.log(req.body.tProductName);
    await page.waitForSelector('input[name="product.name"]', { timeout: 3000 });
    await page.type('input[name="product.name"]', req.body.tProductName);

    // 판매가
    await page.waitForSelector('input[name="product.salePrice"]', { timeout: 3000 });
    await page.type('input[name="product.salePrice"]', req.body.nProductPrice);
    console.log('1');
    await page.waitForSelector('#' + req.body.selProductTax, { timeout: 3000 });
    console.log('#' + req.body.selProductTax);
    await page.click('#' + req.body.selProductTax); // 부가세
    console.log('3');
    if(req.body.chkProductSale != undefined) // 할인설정
    {
        await page.click('#r3_1_total');
        await page.waitForSelector('input[name="product.customerBenefit.immediateDiscountPolicy.discountMethod.value"]', { timeout: 3000 });
        await page.type('input[name="product.customerBenefit.immediateDiscountPolicy.discountMethod.value"]', req.body.nProductPrice);

        await page.click('.caret'); // 할인 단위
        var nIdex = (req.body.selSaleType == 'won' ? 1 : 2);
        await page.click('#error_immediateDiscountPolicy_all_value > div:nth-child(1) > div > div.input-group-btn.open > ul > li:nth-child('+nIdex+')');
    }
    await page.waitFor(3000);


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
      res.send('You sent the name "' + req.body.name + '".');
    });
}
