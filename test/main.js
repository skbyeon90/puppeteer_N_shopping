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

    // 상세설명
    // tProductDescription

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



    (async() => {
    const browser = await puppeteer.launch({headless:false, args : ['--ignore-certificate-errors']}); // , args: ['--start-fullscreen']
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto('http://dev.sell.smartstore.naver.com/#/login', {waitUntil: 'networkidle2'});

    await page.type('#loginId', 'qa1test574@naver.com');
    await page.type('#loginPassword', 'qatest123');

    console.log(req.body.name + ' in myaction');

    //await page.screenshot({path: 'screenshot1.png'});
    await page.click('#loginButton');
    //await page.waitForNavigation( { waitUntil : 'networkidle2' } );

    //await page.screenshot({path: 'screenshot123.png'});

    // 스토어 홈
    await page.waitForSelector('#seller-lnb > div > div:nth-child(1) > ul > li:nth-child(1) > a');
    await page.click('#seller-lnb > div > div:nth-child(1) > ul > li:nth-child(1) > a');

    // 상품등록 메뉴 클릭
    await page.waitForSelector('#seller-lnb > div > div:nth-child(1) > ul > li.ng-scope.active > ul > li:nth-child(2) > a');
    await page.click('#seller-lnb > div > div:nth-child(1) > ul > li.ng-scope.active > ul > li:nth-child(2) > a');

    // 상품명
    console.log(req.body.tProductName);
    await page.waitForSelector('input[name="product.name"]', { timeout: 3000 });
    await page.type('input[name="product.name"]', req.body.tProductName);

    // 판매가
    await page.waitForSelector('input[name="product.salePrice"]', { timeout: 3000 });
    await page.type('input[name="product.salePrice"]', req.body.nProductPrice);

    console.log(req.body.selProductTax);

    switch(req.body.selProductTax){
        case 'tax':
            await page.waitForSelector('#taxType_TAX', { timeout: 3000 });
            await page.evaluate(() => {
                document.querySelector('#taxType_TAX').click();
            });
            break;
        case 'dutyfree':
            await page.waitForSelector('#taxType_DUTYFREE', { timeout: 3000 });
            await page.evaluate(() => {
                document.querySelector('#taxType_DUTYFREE').click();
            });
            break;
        case 'small':
            await page.waitForSelector('#taxType_SMALL', { timeout: 3000 });
            await page.evaluate(() => {
                document.querySelector('#taxType_SMALL').click();
            });
            break;
        default:
            console.log("tax error.");
            break;
     }

    // 할인설정
    if(req.body.chkProductSale != undefined)
    {
        await page.waitForSelector('#r3_1_total');
        await page.evaluate(() => {
            document.querySelector('#r3_1_total').click();
        });
        await page.waitForSelector('input[name="product.customerBenefit.immediateDiscountPolicy.discountMethod.value"]', { timeout: 3000 });
        await page.type('input[name="product.customerBenefit.immediateDiscountPolicy.discountMethod.value"]', req.body.nSaleValue);

        console.log('할인 : ' + req.body.nSaleValue);

        await page.waitForSelector('#r3_1_total');
        await page.evaluate(() => {
            document.querySelector('.caret').click();
        });
        var nIdex = (req.body.selSaleType == 'won' ? 2 : 1);
        await page.click('#error_immediateDiscountPolicy_all_value > div:nth-child(1) > div > div.input-group-btn.open > ul > li:nth-child('+nIdex+')')
//        await page.evaluate(() => {
//            document.querySelector('#error_immediateDiscountPolicy_all_value > div:nth-child(1) > div > div.input-group-btn.open > ul > li:nth-child('+nIdex+')').click();
//        });
    }

    // 재고 수량
    await page.waitForSelector('#stock'); // 재고수량
    await page.type('#stock', req.body.nProductAmount); // 재고수량

    // 옵션
    if(req.body.chkSelectOption != undefined
       || req.body.chkInputOption != undefined)
    {
        // 옵션 영역 펼치기
        await page.waitForSelector('div[server-field-errors="product.detailAttribute.optionInfo.*"]', { timeout: 3000 });
        await page.evaluate(() => {
            document.querySelector('div[server-field-errors="product.detailAttribute.optionInfo.*').click();
        });
         console.log("logOption2");
    }

    // 선택형 옵션 chkSelectOption
    if(req.body.chkSelectOption != undefined)
    {
        console.log("select logOption1");
        // 선택형 옵션 펼치기
        await page.waitForSelector('#option_choice_type_true');
        await page.evaluate(() => {
            document.querySelector('#option_choice_type_true').click();
        });

        // 선택형 옵션 -  옵션유형
        console.log(req.body.radOptionType);
        if(req.body.radOptionType == 'radOptionTypeSolo')
            await page.click('input[value="SIMPLE"]'); // 단독형
        else
            await page.click('input[value="COMBINATION"]'); // 조합형

        // 선택형 옵션 - 정렬순서
        console.log(req.body.selSelectOptionOrder);
        switch(req.body.selSelectOptionOrder)
        {
            case 'orderRegistr' :
                await page.waitForSelector('div[data-value="CREATE"]');
                await page.evaluate(() => {
                    document.querySelector('div[data-value="CREATE"]').click();
                });
                break;
            case 'orderAbc' :
                await page.waitForSelector('div[data-value="ABC"]');
                await page.evaluate(() => {
                    document.querySelector('div[data-value="ABC"]').click();
                });
                break;
             case 'orderLowPrice' :
                await page.waitForSelector('div[data-value="LOW_PRICE"]');
                await page.evaluate(() => {
                    document.querySelector('div[data-value="LOW_PRICE"]').click();
                });
                break;
            case 'ordeorderHighPricer' :
                await page.waitForSelector('div[data-value="HIGH_PRICE"]');
                await page.evaluate(() => {
                    document.querySelector('div[data-value="HIGH_PRICE"]').click();
                });
                break;
            default :
                console.log("선택형 옵션 정렬순서 오류");
                break;
        }

        console.log(req.body.selSelectOptionNum);

        // 선택형 옵션 -  옵션명 개수
        await page.waitForSelector('div[data-value="1"].item');
        await page.evaluate(() => {
            document.querySelector('div[data-value="1"].item').click();
        });
        switch(req.body.selSelectOptionNum){
        case '1':
            // 옵션 개수 - 1개 선택
            await page.waitForSelector('div[ng-show="vm.isChoiceType"] > div > div > div > div > div  > div> div:nth-child(2)> div> div:nth-child(1)');
            await page.evaluate(() => {
                document.querySelector('div[ng-show="vm.isChoiceType"] > div > div > div > div > div  > div> div:nth-child(2)> div> div:nth-child(1)').click();
            });

            // 개별 옵션 입력
            await page.waitForSelector('#choice_option_name0');
            await page.type('#choice_option_name0', '컬러');
            await page.type('#choice_option_value0', 'RED,BLUE,YELLOW');

            // 옵션목록 적용
            await page.waitForSelector('a[ng-click="vm.submitToGrid()"]');
            await page.click('a[ng-click="vm.submitToGrid()"]');

            // 옵션목록 전체 선택
            await page.waitForSelector('#center > div > div.ag-header > div.ag-header-viewport > div > div:nth-child(2) > div:nth-child(1) > div > label > input');
            await page.evaluate(() => {
                document.querySelector('#center > div > div.ag-header > div.ag-header-viewport > div > div:nth-child(2) > div:nth-child(1) > div > label > input').click();
            });

            // 개별 옵션 재고수량 입력 후, 적용
            await page.waitForSelector('input[ng-model="vm.bulkStockQuantity"]')
            await page.type('input[ng-model="vm.bulkStockQuantity"]', '10');
            await page.waitForSelector('a[ng-click="vm.modifySelectedRowByBulk()"]');
            await page.click('a[ng-click="vm.modifySelectedRowByBulk()"]');
            break;
        case '2':
            // 옵션 개수 - 2개 선택
            await page.waitForSelector('div[ng-show="vm.isChoiceType"] > div > div > div > div > div  > div> div:nth-child(2)> div> div:nth-child(2)');
            await page.evaluate(() => {
                document.querySelector('div[ng-show="vm.isChoiceType"] > div > div > div > div > div  > div> div:nth-child(2)> div> div:nth-child(2)').click();
            });

            // 개별 옵션 입력
            await page.waitForSelector('#choice_option_name1');
            await page.type('#choice_option_name0', '컬러');
            await page.type('#choice_option_value0', 'RED,BLUE,YELLOW');
            await page.type('#choice_option_name1', '사이즈');
            await page.type('#choice_option_value1', 'S,M,L');

            // 옵션목록 적용
            await page.waitForSelector('a[ng-click="vm.submitToGrid()"]');
            await page.click('a[ng-click="vm.submitToGrid()"]');

            // 옵션목록 전체 선택
            await page.waitForSelector('#center > div > div.ag-header > div.ag-header-viewport > div > div:nth-child(2) > div:nth-child(1) > div > label > input');
            await page.click('#center > div > div.ag-header > div.ag-header-viewport > div > div:nth-child(2) > div:nth-child(1) > div > label > input');

            // 개별 옵션 재고수량 입력 후, 적용
            await page.waitForSelector('input[ng-model="vm.bulkStockQuantity"]')
            await page.type('input[ng-model="vm.bulkStockQuantity"]', '10');
            await page.waitForSelector('a[ng-click="vm.modifySelectedRowByBulk()"]');
            await page.click('a[ng-click="vm.modifySelectedRowByBulk()"]');
            break;
        case '3':
            // 옵션 개수 - 3개 선택
            await page.waitForSelector('div[ng-show="vm.isChoiceType"] > div > div > div > div > div  > div> div:nth-child(2)> div> div:nth-child(3)');
            await page.evaluate(() => {
                document.querySelector('div[ng-show="vm.isChoiceType"] > div > div > div > div > div  > div> div:nth-child(2)> div> div:nth-child(3)').click();
            });

            // 개별 옵션 입력
            await page.waitForSelector('#choice_option_name2');
            await page.type('#choice_option_name0', '컬러');
            await page.type('#choice_option_value0', 'RED,BLUE,YELLOW');
            await page.type('#choice_option_name1', '사이즈');
            await page.type('#choice_option_value1', 'S,M,L');
            await page.type('#choice_option_name2', '케이스');
            await page.type('#choice_option_value2', 'WHITE,BLACK,BROWN');

            // 옵션목록 적용
            await page.waitForSelector('a[ng-click="vm.submitToGrid()"]');
            await page.click('a[ng-click="vm.submitToGrid()"]');

            // 옵션목록 전체 선택
            await page.waitForSelector('#center > div > div.ag-header > div.ag-header-viewport > div > div:nth-child(2) > div:nth-child(1) > div > label > input');
            await page.click('#center > div > div.ag-header > div.ag-header-viewport > div > div:nth-child(2) > div:nth-child(1) > div > label > input');

            // 개별 옵션 재고수량 입력 후, 적용
            await page.waitForSelector('input[ng-model="vm.bulkStockQuantity"]')
            await page.type('input[ng-model="vm.bulkStockQuantity"]', '10');
            await page.waitForSelector('a[ng-click="vm.modifySelectedRowByBulk()"]');
            await page.click('a[ng-click="vm.modifySelectedRowByBulk()"]');
            break;
        default:
            console.log("선택형 옵션 - 개수 error");
            break;
        }
     }

    // 직접입력형 옵션 chkSelectOption
    if(req.body.chkInputOption != undefined)
    {
        // 직접입력형 옵션 펼치기
        await page.waitForSelector('#option_direct_type_true ');
        await page.evaluate(() => {
            document.querySelector('#option_direct_type_true ').click();
        });

        // 옵션 개수
        switch(req.body.selInputOptionNum){
        case '1':
            // 옵션 개수 선택
            await page.waitForSelector('div[ng-show="vm.isCustomType"] > div > div > div > div > div >div:nth-child(2) > div> div:nth-child(1)');
            await page.evaluate(() => {
                document.querySelector('div[ng-show="vm.isCustomType"] > div > div > div > div > div >div:nth-child(2) > div> div:nth-child(1)').click();
            });

            // 개별 옵션 입력
            await page.waitForSelector('#custom_option_name0');
            await page.type('#custom_option_name0', '컬러');
            break;
        case '2':
            // 옵션 개수 선택
            await page.waitForSelector('div[ng-show="vm.isCustomType"] > div > div > div > div > div >div:nth-child(2) > div> div:nth-child(2)');
            await page.evaluate(() => {
                document.querySelector('div[ng-show="vm.isCustomType"] > div > div > div > div > div >div:nth-child(2) > div> div:nth-child(2)').click();
            });

            // 개별 옵션 입력
            await page.waitForSelector('#custom_option_name1');
            await page.type('#custom_option_name0', '컬러');
            await page.type('#custom_option_name1', '사이즈');
            break;
        case '3':
            await page.waitForSelector('div[ng-show="vm.isCustomType"] > div > div > div > div > div >div:nth-child(2) > div> div:nth-child(3)');
            await page.evaluate(() => {
                document.querySelector('div[ng-show="vm.isCustomType"] > div > div > div > div > div >div:nth-child(2) > div> div:nth-child(3)').click();
            });

            // 개별 옵션 입력
            await page.waitForSelector('#custom_option_name2');
            await page.type('#custom_option_name0', '컬러');
            await page.type('#custom_option_name1', '사이즈');
            await page.type('#custom_option_name2', '케이스');
            break;
        case '4':
            // 옵션 개수 선택
            await page.waitForSelector('div[ng-show="vm.isCustomType"] > div > div > div > div > div >div:nth-child(2) > div> div:nth-child(4)');
            await page.evaluate(() => {
                document.querySelector('div[ng-show="vm.isCustomType"] > div > div > div > div > div >div:nth-child(2) > div> div:nth-child(4)').click();
            });

            // 개별 옵션 입력
            await page.waitForSelector('#custom_option_name3');
            await page.type('#custom_option_name0', '컬러');
            await page.type('#custom_option_name1', '사이즈');
            await page.type('#custom_option_name2', '케이스');
            await page.type('#custom_option_name3', '이어폰');
            break;
        case '5':
            // 옵션 개수 선택
            await page.waitForSelector('div[ng-show="vm.isCustomType"] > div > div > div > div > div >div:nth-child(2) > div> div:nth-child(5)');
            await page.evaluate(() => {
                document.querySelector('div[ng-show="vm.isCustomType"] > div > div > div > div > div >div:nth-child(2) > div> div:nth-child(5)').click();
            });

            // 개별 옵션 입력
            await page.waitForSelector('#custom_option_name4');
            await page.type('#custom_option_name0', '컬러');
            await page.type('#custom_option_name1', '사이즈');
            await page.type('#custom_option_name2', '케이스');
            await page.type('#custom_option_name3', '이어폰');
            await page.type('#custom_option_name4', '마이크');
            break;
        default:
            console.log("직접입력형 옵션 - 개수 error");
            break;
        }
    }

    // 상품이미지 - 대표이미지
//    await page.waitForSelector('#representImage > div > div.seller-product-img.add-img > div > ul > li > div > a');
//    await page.click('#representImage > div > div.seller-product-img.add-img > div > ul > li > div > a');
//
//    // 상품이미지 - 내사진 - file upload
//    await page.waitForSelector('input[type="file"]', { timeout: 3000 });
//    const input = await page.$('input[type="file"]');
//    await input.uploadFile(__dirname + '\\..\\images\\product_image.jpg');

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

    // 상품주요정보
    await page.waitForSelector('#_prod-attr-section');
    await page.click('#_prod-attr-section');

    await page.waitForSelector('input[name="product.detailAttribute.naverShoppingSearchInfo.modelName"]');
    await page.type('input[name="product.detailAttribute.naverShoppingSearchInfo.modelName"]', '모델명 테스트');

    await page.waitForSelector('input[placeholder="브랜드를 입력해주세요."]')
    await page.type('input[placeholder="브랜드를 입력해주세요."]', '브랜드 테스트');

    await page.waitForSelector('input[placeholder="제조사를 입력해주세요."]')
    await page.type('input[placeholder="제조사를 입력해주세요."]', '제조사 테스트');

    // 상품주요정보 - 상품속성
    // 출산/육아>기저귀>기능성기저귀>기저귀밴드
//    await page.waitForSelector('tr[ng-repeat="categoryAttribute.in.vm.categoryAttributeList[attributeGroupName]"] > td > ng-if> div> div> label')
//    await page.evaluate(() => {
//        document.querySelector('tr[ng-repeat="categoryAttribute.in.vm.categoryAttributeList[attributeGroupName]"] > td > ng-if> div> div> label').click();
//    });
    // 상품주요정보 - 원산지
    await page.click('div[data-value="LOCAL"].item');
    switch(req.body.selProductOrigin){
        case 'domestic':
            await page.waitForSelector('div[data-value="LOCAL"].option');
            await page.click('div[data-value="LOCAL"].option');
            break;
        case 'imported':
            await page.waitForSelector('div[data-value="IMPORT"].option');
            await page.click('div[data-value="IMPORT"].option');
            break;
        case 'etc':
            await page.waitForSelector('div[data-value="ETC"].option');
            await page.click('div[data-value="ETC"].option');
            break;
        default:
            await page.waitForSelector('div[data-value="LOCAL"].option');
            await page.click('div[data-value="LOCAL"].option');
            break;
    }

    // 상품주요정보 - 상품상태
    if(req.body.selProductStatus == "used"){
        console.log("중고");
        await page.waitForSelector('label[for="saleType_OLD"]');
        await page.click('label[for="saleType_OLD"]');
    }

    // 상품주요정보 - 주문제작 상품
    if(req.body.chkCustomMade != undefined)
    {
        console.log("주문제작");

        //await page.waitForSelector('input[ng-model="vm.product.detailAttribute.customMadeInfo.customMade"]');
        await page.evaluate(() => {
            document.querySelector('input[ng-model="vm.product.detailAttribute.customMadeInfo.customMade"]').click();
        });

        // 반품/취소 제한 안내 및 동의
        if(req.body.chkReturnCancel != undefined)
        {
            await page.waitForSelector('#customMadeInfo_useReturnCancelNotification');
            await page.evaluate(() => {
                document.querySelector('#customMadeInfo_useReturnCancelNotification').click();
            });

            await page.waitForSelector('input[ng-model="vm.customMadeConfirmation"]');
            await page.evaluate(() => {
                document.querySelector('input[ng-model="vm.customMadeConfirmation"]').click();
            });
        }
    }


    // 상품주요정보 - 미성년가 구매 가능여부 - (default : 가능)
    if(req.body.radIsBuyChildren == "impossible")
    {
        console.log("미성년자 구매 불가능");
        await page.waitForSelector('#child2');
        await page.evaluate(() => {
            document.querySelector('#child2').click();
        });
    }



    await page.waitFor(100000);

    //res.send('Product registration succeeded..!');

    await page.evaluate(() => console.log(`url is ${location.href}`));
    browser.close();
    })();
      res.send('Product Name is "' + req.body.tProductName + '".');
    });
}
