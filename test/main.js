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


    (async() => { //args : ['--ignore-certificate-errors']
    //const browser = await puppeteer.launch({headless:false}); // , args: ['--start-fullscreen']

    const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: false, // doesn't matter
    args: [
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list '
    ]
    })
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto('http://dev.sell.smartstore.naver.com/#/login', {waitUntil: 'networkidle2'});

    await page.type('#loginId', 'qa2test555@naver.com');
    await page.type('#loginPassword', 'qatest123');

    console.log(req.body.name + ' in myaction');

    await page.screenshot({path: 'screenshot1.png'});
    await page.click('#loginButton');

    await page.screenshot({path: 'login.png'});

//    await page.waitForSelector('button[ng-click="vm.closeModal()"]');
//    await page.click('button[ng-click="vm.closeModal()"]');

    // 스토어 홈
    await page.waitForSelector('#seller-lnb > div > div:nth-child(1) > ul > li:nth-child(1) > a', { timeout: 30000 });
    await page.click('#seller-lnb > div > div:nth-child(1) > ul > li:nth-child(1) > a');

    // 상품등록 메뉴 클릭
    await page.waitForSelector('#seller-lnb > div > div:nth-child(1) > ul > li.ng-scope.active > ul > li:nth-child(2) > a', { timeout: 30000 });
    await page.click('#seller-lnb > div > div:nth-child(1) > ul > li.ng-scope.active > ul > li:nth-child(2) > a');

    // 상품명
    console.log(req.body.tProductName);
    await page.waitForSelector('input[name="product.name"]', { timeout: 30000 });
    await page.type('input[name="product.name"]', req.body.tProductName);

    await page.screenshot({path: '2.상품명.png'});

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
    await page.screenshot({path: '3.판매설정.png'});

    // 할인설정
    if(req.body.chkProductSale != undefined)
    {
        console.log('할인설정 ON');
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
        await page.click('#error_immediateDiscountPolicy_all_value > div:nth-child(1) > div > div.input-group-btn.open > ul > li:nth-child('+nIdex+')');

//        await page.evaluate(() => {
//            document.querySelector('#error_immediateDiscountPolicy_all_value > div:nth-child(1) > div > div.input-group-btn.open > ul > li:nth-child('+nIdex+')').click();
//        });

        await page.screenshot({path: '4.할인설정.png'});
    }

    // 재고 수량
    await page.waitForSelector('#stock'); // 재고수량
    await page.type('#stock', req.body.nProductAmount); // 재고수량

    // 옵션 영역 펼치기
    if(req.body.chkSelectOption != undefined
       || req.body.chkInputOption != undefined)
    {
        await page.waitForSelector('div[server-field-errors="product.detailAttribute.optionInfo.*"]', { timeout: 3000 });
        await page.evaluate(() => {
            document.querySelector('div[server-field-errors="product.detailAttribute.optionInfo.*"]').click();
        });
         console.log("옵션 영역 on");
    }

    // 선택형 옵션 chkSelectOption
    if(req.body.chkSelectOption != undefined)
    {
        console.log("선택형 옵션 on");
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

        await page.screenshot({path: '5.선택형옵션.png'});
     }

    // 직접입력형 옵션 chkSelectOption
    if(req.body.chkInputOption != undefined)
    {
        console.log("직접입력형 옵션 on");

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
        await page.screenshot({path: '5.직접입력형옵션.png'});
    }

    // 옵션 영역 닫음
    if(req.body.chkSelectOption != undefined
       || req.body.chkInputOption != undefined)
    {
        // 옵션 영역 펼치기
        await page.waitForSelector('div[server-field-errors="product.detailAttribute.optionInfo.*"]', { timeout: 3000 });
        await page.evaluate(() => {
            document.querySelector('div[server-field-errors="product.detailAttribute.optionInfo.*"]').click();
        });
         console.log("옵션 영역 off");
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
    if(req.body.chkProductMajorInfo != undefined)
    {
        console.log("상품주요정보 on");

        // 상품주요정보
        await page.waitForSelector('#_prod-attr-section');
        await page.click('#_prod-attr-section');

        await page.waitForSelector('input[name="product.detailAttribute.naverShoppingSearchInfo.modelName"]');
        await page.type('input[name="product.detailAttribute.naverShoppingSearchInfo.modelName"]', '모델명 테스트');

        await page.waitForSelector('ncp-brand-manufacturer-input[model-type="brand"]')
        await page.type('ncp-brand-manufacturer-input[model-type="brand"]', '브랜드 테스트');

        await page.waitForSelector('ncp-brand-manufacturer-input[model-type="manufacturer"]')
        await page.type('ncp-brand-manufacturer-input[model-type="manufacturer"]', '제조사 테스트');

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

        await page.screenshot({path: '6.상품주요정보.png'});
    }

    // 상품정보제공고시
    if(req.body.chkProductInfoNotice != undefined)
    {
        console.log("상품제공고시 on");

        // 상품정보 제공고시 영역 열기
        await page.waitForSelector('div[server-field-errors="product.detailAttribute.productInfoProvidedNotice.*"]');
        await page.evaluate(() => {
            document.querySelector('div[server-field-errors="product.detailAttribute.productInfoProvidedNotice.*"]').click();
        });
        // 소재
        await page.waitForSelector('#prd');
        await page.type('#prd', req.body.tProductMaterial);

        // 치수명
        await page.waitForSelector('#prd_size');
        await page.type('#prd_size', req.body.tProductSize);

        // 색상
        await page.waitForSelector('#prd_col');
        await page.type('#prd_col', req.body.tProductColor);

        // 제조자
//        await page.waitForSelector('ncp-brand-manufacturer-input[model-type="manufacturer"]');
//        await page.evaluate(() => {
//            document.querySelector('ncp-brand-manufacturer-input[model-type="manufacturer"]').click();
//        });
//        await page.type('ncp-brand-manufacturer-input[model-type="manufacturer"]',req.body.tProductManufacturer);

        // 세탁방법 및 취급시 주의사항
        await page.waitForSelector('#prd_caution');
        await page.type('#prd_caution',req.body.tProductPrecautions);

        // 제조년월
        await page.waitForSelector('input[ng-click="vm.dateHandle(true, true)"]');
        await page.evaluate(() => {
            document.querySelector('input[ng-click="vm.dateHandle(true, true)"]').click();
        });
        await page.waitForSelector('div[ng-show="vm.noticeType !== \'GIFT_CARD\'"] > div > input');
        await page.type('div[ng-show="vm.noticeType !== \'GIFT_CARD\'"] > div > input',req.body.tManuYearMonth);

        // 품질보증기준
        await page.waitForSelector('#prd_quality');
        await page.type('#prd_quality', req.body.tQualityStandards);

        // AS 책임자
        await page.waitForSelector('#prd_as');
        await page.type('#prd_as', req.body.tAsManager);
    }

    // 배송
    if(req.body.chkDelivery != undefined)
    {
        // 배송영역 펼침
        // 추가상품 영역 열기
        await page.waitForSelector('div[server-field-errors="product.deliveryInfo.*"]');
        await page.evaluate(() => {
            document.querySelector('div[server-field-errors="product.deliveryInfo.*"]').click();
        });

        // radIsDelivery(delivery, none_delivery) 배송여부
        if(req.body.radIsDelivery == "none_delivery")
        {
            // 배송없음
            await page.waitForSelector('#rdelivery_no');
            await page.evaluate(() => {
            document.querySelector('#rdelivery_no').click();
            });
        }
        else
        {
            // 배송 있음
            await page.waitForSelector('#rdelivery');
            await page.evaluate(() => {
            document.querySelector('#rdelivery').click();
            });

            // radDeliveryProperty(normal, today) 배송속성
            if(req.body.radDeliveryProperty == "today")
            {
                // [오늘출발] 클릭
                await page.waitForSelector('#TODAY');
                await page.evaluate(() => {
                document.querySelector('#TODAY').click();
                });

                // [출발시간 기준 설정] 클릭
                await page.waitForSelector('div[ncp-message-container="#error_limitDeliveryTime"] > button');
                await page.evaluate(() => {
                document.querySelector('div[ncp-message-container="#error_limitDeliveryTime"] > button').click();
                });

                // 13시 선택
                await page.waitForSelector('div[data-value="13"]');
                await page.evaluate(() => {
                document.querySelector('div[data-value="13"]').click();
                });

                // [저장] 클릭
                await page.waitForSelector('button[ng-click="vm.save()"]');
                await page.evaluate(() => {
                document.querySelector('button[ng-click="vm.save()"]').click();
                });

                // [확인] 클릭
                await page.waitForSelector('button[ng-click="ok()"]')
                await page.evaluate(() => {
                document.querySelector('button[ng-click="ok()"]').click();
                });
            }


            // radDeliveryType(deliveryParcelRegistaration, deliveryDirect) 배송방법
            if(req.body.radDeliveryType == "deliveryDirect")
            {
                await page.waitForSelector('#DIRECT');
                await page.evaluate(() => {
                document.querySelector('#DIRECT').click();
                });
            }


            // chkReceiveVisit 방문수령
            if(req.body.chkReceiveVisit != undefined)
            {
                await page.waitForSelector('input[name="visit_receipt"]');
                await page.evaluate(() => {
                document.querySelector('input[name="visit_receipt"]').click();
                });

                // [판매자 주소록]
                await page.waitForSelector('button[ng-click="vm.setVisitAddress()"]');
                await page.evaluate(() => {
                    document.querySelector('button[ng-click="vm.setVisitAddress()"]').click();
                });

                // 주소 선택
                await page.waitForSelector('a[ng-click="vm.close(address);"] > p');
                await page.evaluate(() => {
                    document.querySelector('a[ng-click="vm.close(address);"] > p').click();
                });
            }

            // chkQuickService 퀵서비스
            if(req.body.chkQuickService != undefined)
            {
                await page.waitForSelector('input[name="quickService"]');
                await page.evaluate(() => {
                    document.querySelector('input[name="quickService"]').click();
                });
            }

            // radIsDeliveryBundle(possible, impossible) 묶음배송여부
            if(req.body.radIsDeliveryBundle == "impossible")
            {
                await page.waitForSelector('#rset_2');
                await page.evaluate(() => {
                    document.querySelector('#rset_2').click();
                });
            }
            else
            {
                await page.waitForSelector('#rset_1');
                await page.evaluate(() => {
                    document.querySelector('#rset_1').click();
                });
            }

            // selDeliveryChargeType(charged, free, conditionalFree, perQuantity, perSectionTwo, perSectionThree) 상품별 배송비
            // 상품별 배송비 셀렉트 박스 열기
            await page.waitForSelector('div[ng-form="_DELIVERY_FEE"] > div > div > div > div > div> div> div> div');
            await page.evaluate(() => {
                document.querySelector('div[ng-form="_DELIVERY_FEE"] > div > div > div > div > div> div> div> div').click();
            });

            // 상품별 배송비 선택
            switch(req.body.selDeliveryChargeType)
            {
                case 'charged' :
                    await page.waitForSelector('div[data-value="PAID"]');
                    await page.evaluate(() => {
                        document.querySelector('div[data-value="PAID"]').click();
                    });
                    break;
                case 'free' :
                    await page.waitForSelector('div[data-value="FREE"]');
                    await page.evaluate(() => {
                        document.querySelector('div[data-value="FREE"]').click();
                    });
                    break;
                 case 'conditionalFree' :
                    await page.waitForSelector('div[data-value="CONDITIONAL_FREE"]');
                    await page.evaluate(() => {
                        document.querySelector('div[data-value="CONDITIONAL_FREE"]').click();
                    });
                    break;
                case 'per_quantity' :
                    await page.waitForSelector('div[data-value="UNIT_QUANTITY_PAID"]');
                    await page.evaluate(() => {
                        document.querySelector('div[data-value="UNIT_QUANTITY_PAID"]').click();
                    });
                    break;
                case 'per_sectionTwo' :
                    await page.waitForSelector('div[data-value="RANGE_QUANTITY_PAID"]');
                    await page.evaluate(() => {
                        document.querySelector('div[data-value="RANGE_QUANTITY_PAID"]').click();
                    });

                    // 2구간 라디오 버튼 클릭
                    await page.waitForSelector('input[name="isThirdBase"][value="false"]');
                    await page.evaluate(() => {
                        document.querySelector('input[name="isThirdBase"][value="false"]').click();
                    });
                    break;
                case 'per_sectionThree' :
                    await page.waitForSelector('div[data-value="RANGE_QUANTITY_PAID"]');
                    await page.evaluate(() => {
                        document.querySelector('div[data-value="RANGE_QUANTITY_PAID"]').click();
                    });

                    // 3구간 라디오 버튼 클릭
                    await page.waitForSelector('input[name="isThirdBase"][value="true"]');
                    await page.evaluate(() => {
                        document.querySelector('input[name="isThirdBase"][value="true"]').click();
                    });
                    break;
                default :
                    console.log("추가상품 정렬순서 오류");
                    break;
            }

            // 기본 배송비 입력
            if(req.body.selDeliveryChargeType != 'free')
            {
                // 기본 배송비
                await page.waitForSelector('#basic_price');
                await page.type('#basic_price', '3000');

                console.log(req.body.selDeliveryChargeType);

                // 배송비 조건
                switch(req.body.selDeliveryChargeType)
                {
                    case 'conditionalFree' :
                        await page.waitForSelector('#delivery_condition');
                        await page.type('#delivery_condition', '50000');
                        break;
                    case 'per_quantity' :
                        await page.waitForSelector('#delivery_condition2');
                        await page.type('#delivery_condition2', '5');
                        break;
                    case 'per_sectionTwo' :
                        // ~x 까지 추가배송비 없음
                        await page.waitForSelector('input[ncp-message-container="#error-freeSectionLastQuantity"]');
                        await page.type('input[ncp-message-container="#error-freeSectionLastQuantity"]', '5');

                        // x 초과 구매 시 추가배송비
                        await page.waitForSelector('div[ng-form="_DELIVERY_FEE"] > div:nth-child(2) > div:nth-child(3) > div > div:nth-child(6) > div > div> div > input');
                        await page.type('div[ng-form="_DELIVERY_FEE"] > div:nth-child(2) > div:nth-child(3) > div > div:nth-child(6) > div > div> div > input', '3000');
                        break;
                    case 'per_sectionThree' :
                        // ~x 까지 추가배송비 없음
                        await page.waitForSelector('input[ncp-message-container="#error-freeSectionLastQuantity"]');
                        await page.type('input[ncp-message-container="#error-freeSectionLastQuantity"]', '5');

                        // ~x까지 추가배송비
                        await page.waitForSelector('input[ng-model="vm.modelData.deliveryFee.secondSectionLastQuantity"]');
                        await page.type('input[ng-model="vm.modelData.deliveryFee.secondSectionLastQuantity"]', '10');

                        // 추가배송비 금액
                        await page.waitForSelector('div[ng-form="_DELIVERY_FEE"] > div:nth-child(2) > div:nth-child(3) > div > div:nth-child(4) > div > div > div > input');
                        await page.type('div[ng-form="_DELIVERY_FEE"] > div:nth-child(2) > div:nth-child(3) > div > div:nth-child(4) > div > div > div > input', '3000');

                        // x 초과 구매 시 추가배송비
                        await page.waitForSelector('input[ng-model="vm.modelData.deliveryFee.thirdExtraFee"]');
                        await page.type('input[ng-model="vm.modelData.deliveryFee.thirdExtraFee"]', '6000');
                        break;
                    default :
                        break;
                }


            // 결제방식(착불(default), 선결제)
            if(req.body.chkPaymentAdvance != undefined)
            {
                if(req.body.chkPaymentCollect != undefined) // 착불+선결제
                {
                    await page.waitForSelector('input[value="COLLECT_OR_PREPAID"]');
                    await page.evaluate(() => {
                        document.querySelector('input[value="COLLECT_OR_PREPAID"]').click();
                    });
                }
                else // 선결제
                {
                    await page.waitForSelector('input[value="PREPAID"]');
                    await page.evaluate(() => {
                        document.querySelector('input[value="PREPAID"]').click();
                    });
                }
            }
            else
            {
                await page.waitForSelector('input[value="COLLECT"]');
                await page.evaluate(() => {
                     document.querySelector('input[value="COLLECT"]').click();
                });
            }

            // tRegionCharge 지역별 차등 배송비
            if(req.body.tRegionCharge != undefined)
            {
                await page.waitForSelector('#delivery_price');
                await page.type('#delivery_price', req.body.tRegionCharge);
            }

            // radInstallCosts(exist, none(default)) 별도 설치비
            if(req.body.radInstallCosts == "exist")
            {
                await page.waitForSelector('#install1');
                await page.evaluate(() => {
                     document.querySelector('#install1').click();
                 });
            }
            }
        }

        await page.waitFor(300000);
    }

    // 반품/교환
    if(req.body.chkReturnChange != undefined)
    {
        // 반품/교환 영역 열기
        await page.waitForSelector('div[ncp-click="vm.returnDeliveryMenu()"]');
        await page.evaluate(() => {
            document.querySelector('div[ncp-click="vm.returnDeliveryMenu()"]').click();
        });
        console.log("반품/교환 on");

        // 반품배송비(편도)
        await page.waitForSelector('#return_price');
        await page.type('#return_price',req.body.nDeliveryChargeReturn);

        // 교환배송비(왕복)
        await page.waitForSelector('#exchange_price');
        await page.type('#exchange_price',req.body.nDeliveryChargeChange);
    }


    // A/S
    if(req.body.chkAs != undefined)
    {
        console.log("A/S, 특이사항 on");

        // A/S 영역 열기
        await page.waitForSelector('div[ncp-click="vm.openMenuToggle();"]');
        await page.evaluate(() => {
            document.querySelector('div[ncp-click="vm.openMenuToggle();"]').click();
        });

        // A/S 전화번호
        await page.waitForSelector('#as_number');
        await page.type('#as_number',req.body.tAsNumber);

        // A/S 안내
        await page.waitForSelector('#as_info');
        await page.type('#as_info',req.body.tAsDescription);
    }

    // 추가상품
    // selAdditionalProductNum 추가상품 개수
    // selAdditionalProductOrder 정렬순서(orderRegistr, orderAbc, orderHighPrice, orderLowPrice)
    if(req.body.chkAdditionalProduct != undefined)
    {
        // 추가상품 영역 열기
        await page.waitForSelector('div[server-field-errors="product.detailAttribute.supplementProductInfo.*"]');
        await page.evaluate(() => {
            document.querySelector('div[server-field-errors="product.detailAttribute.supplementProductInfo.*"]').click();
        });

        console.log("추가상품 on");

        // 추가상품 - 정렬순서
        console.log(req.body.selAdditionalProductOrder);
        switch(req.body.selAdditionalProductOrder)
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
            case 'ordeorHighPrice' :
                await page.waitForSelector('div[data-value="HIGH_PRICE"]');
                await page.evaluate(() => {
                    document.querySelector('div[data-value="HIGH_PRICE"]').click();
                });
                break;
            default :
                console.log("추가상품 정렬순서 오류");
                break;
        }

        console.log(req.body.selAdditionalProductNum);

        // 추가상품 -  옵션명 개수
        await page.waitForSelector('div[data-value="1"].item');
        await page.evaluate(() => {
            document.querySelector('div[data-value="1"].item').click();
        });

        switch(req.body.selAdditionalProductNum){
        case '1':
            // 옵션 개수 - 1개 선택
            await page.waitForSelector('div[ng-show="vm.isConfig"] > div > div > div > div > div > div:nth-child(2)> div> div:nth-child(1)');
            await page.evaluate(() => {
                document.querySelector('div[ng-show="vm.isConfig"] > div > div > div > div > div > div:nth-child(2)> div> div:nth-child(1)').click();
            });

            // 개별 옵션 입력
            await page.waitForSelector('#supple_group_name0');
            await page.type('#supple_group_name0', '케이스');
            await page.type('#supple_names0', 'RED,BLUE,YELLOW');

            // 옵션목록 적용
            await page.waitForSelector('a[ng-click="vm.submitToGrid()"]');
            await page.click('a[ng-click="vm.submitToGrid()"]');

            // 옵션목록 전체 선택
            await page.waitForSelector('#center > div > div.ag-header > div.ag-header-viewport > div > div > div:nth-child(1) > div > label > input');
            await page.evaluate(() => {
                document.querySelector('#center > div > div.ag-header > div.ag-header-viewport > div > div > div:nth-child(1) > div > label > input').click();
            });

            // 개별 옵션 재고수량 입력 후, 적용
            await page.waitForSelector('input[ng-model="vm.bulkStockQuantity"]')
            await page.type('input[ng-model="vm.bulkStockQuantity"]', '10');
            await page.waitForSelector('a[ng-click="vm.modifySelectedRowByBulk()"]');
            await page.click('a[ng-click="vm.modifySelectedRowByBulk()"]');
            break;
        case '2':
            // 옵션 개수 - 2개 선택
            await page.waitForSelector('div[ng-show="vm.isConfig"] > div > div > div > div > div > div:nth-child(2)> div> div:nth-child(2)');
            await page.evaluate(() => {
                document.querySelector('div[ng-show="vm.isConfig"] > div > div > div > div > div > div:nth-child(2)> div> div:nth-child(2)').click();
            });

            // 개별 옵션 입력
            await page.waitForSelector('#supple_group_name1');
            await page.type('#supple_group_name0', '케이스');
            await page.type('#supple_names0', 'RED,BLUE,YELLOW');
            await page.type('#supple_group_name1', '이어폰');
            await page.type('#supple_names1', 'BLACK,WHITE');

            // 옵션목록 적용
            await page.waitForSelector('a[ng-click="vm.submitToGrid()"]');
            await page.click('a[ng-click="vm.submitToGrid()"]');

            // 옵션목록 전체 선택
            await page.waitForSelector('#center > div > div.ag-header > div.ag-header-viewport > div > div > div:nth-child(1) > div > label > input');
            await page.evaluate(() => {
                document.querySelector('#center > div > div.ag-header > div.ag-header-viewport > div > div > div:nth-child(1) > div > label > input').click();
            });

            // 개별 옵션 재고수량 입력 후, 적용
            await page.waitForSelector('input[ng-model="vm.bulkStockQuantity"]')
            await page.type('input[ng-model="vm.bulkStockQuantity"]', '10');
            await page.waitForSelector('a[ng-click="vm.modifySelectedRowByBulk()"]');
            await page.click('a[ng-click="vm.modifySelectedRowByBulk()"]');
            break;
        case '3':
            // 옵션 개수 - 3개 선택
            await page.waitForSelector('div[ng-show="vm.isConfig"] > div > div > div > div > div > div:nth-child(2)> div> div:nth-child(3)');
            await page.evaluate(() => {
                document.querySelector('div[ng-show="vm.isConfig"] > div > div > div > div > div > div:nth-child(2)> div> div:nth-child(3)').click();
            });

            // 개별 옵션 입력
            await page.waitForSelector('#supple_group_name2');
            await page.type('#supple_group_name0', '케이스');
            await page.type('#supple_names0', 'RED,BLUE,YELLOW');
            await page.type('#supple_group_name1', '이어폰');
            await page.type('#supple_names1', 'BLACK,WHITE');
            await page.type('#supple_group_name2', '마이크');
            await page.type('#supple_names2', 'BLACK,WHITE');

            // 옵션목록 적용
            await page.waitForSelector('a[ng-click="vm.submitToGrid()"]');
            await page.click('a[ng-click="vm.submitToGrid()"]');

            // 옵션목록 전체 선택
            await page.waitForSelector('#center > div > div.ag-header > div.ag-header-viewport > div > div > div:nth-child(1) > div > label > input');
            await page.evaluate(() => {
                document.querySelector('#center > div > div.ag-header > div.ag-header-viewport > div > div > div:nth-child(1) > div > label > input').click();
            });

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

        await page.screenshot({path: '추가상품.png'});
     }

    // 구매/혜택조건
    if(req.body.chkBenefitCondition != undefined
      || req.body.chkBuyCondition != undefined )
    {
        console.log("구매혜택/조건 on");

        // 구매혜택/조건 열기
        await page.waitForSelector('#productForm > ng-include > ui-view:nth-child(18) > div> div');
        await page.evaluate(() => {
            document.querySelector('#productForm > ng-include > ui-view:nth-child(18) > div> div').click();
        });

        // nBuyConditionMin 최소구매수량
        await page.waitForSelector('#prd_min');
        await page.type('#prd_min',req.body.nBuyConditionMin);

        // nBuyConditionMaxPer 최대구매수량(1회)
         console.log('최대구매수량(1회)' + req.body.nBuyConditionMaxPer);
        await page.waitForSelector('input[ng-model="vm.viewData.isUseMaxPurchaseQuantityPerOrder"]');
        await page.evaluate(() => {
            document.querySelector('input[ng-model="vm.viewData.isUseMaxPurchaseQuantityPerOrder"]').click();
        });
        await page.waitForSelector('input[ng-model="vm.product.detailAttribute.purchaseQuantityInfo.maxPurchaseQuantityPerOrder"]');
        await page.type('input[ng-model="vm.product.detailAttribute.purchaseQuantityInfo.maxPurchaseQuantityPerOrder"]', req.body.nBuyConditionMaxPer);

        // nBuyConditionMaxPerson 최대구매수량(1인)
        console.log('최대구매수량(1인)' + req.body.nBuyConditionMaxPerson);
        await page.waitForSelector('input[ng-model="vm.viewData.isUseMaxPurchaseQuantityPerId"]');
        await page.evaluate(() => {
            document.querySelector('input[ng-model="vm.viewData.isUseMaxPurchaseQuantityPerId"]').click();
        });
        await page.waitForSelector('input[ng-model="vm.product.detailAttribute.purchaseQuantityInfo.maxPurchaseQuantityPerId"]');
        await page.type('input[ng-model="vm.product.detailAttribute.purchaseQuantityInfo.maxPurchaseQuantityPerId"]', req.body.nBuyConditionMaxPerson);

        // 상품 구매 시 지급 체크박스 클릭
        await page.waitForSelector('input[ng-model="vm.viewData.isUsePurchasePointPolicy"]');
        await page.evaluate(() => {
            document.querySelector('input[ng-model="vm.viewData.isUsePurchasePointPolicy"]').click();
        });

        // nPointBuy 지급 포인트
        await page.waitForSelector('#error_purchasePointPolicy_value > div:nth-child(1) > div > div.seller-input-wrap.ng-scope > input');
        await page.type('#error_purchasePointPolicy_value > div:nth-child(1) > div > div.seller-input-wrap.ng-scope > input', req.body.nPointBuy);

        // selPointBuyType(won, percent) 지급 포인트 단위
        var nIdex = (req.body.selPointBuyType == 'won' ? 2 : 1);
        console.log(req.body.selPointBuyType);
        console.log('인덱스 : ' + nIdex);
        //await page.evaluate(({nIdex}) => {
        //    document.querySelector('#error_purchasePointPolicy_value > div:nth-child(1) > div > div.input-group-btn.open > ul > li:nth-child(' + nIdex + ')').click();
        //}, {nIdex});

        await page.waitForSelector('#error_purchasePointPolicy_value > div > div > div:nth-child(3)');
        await page.evaluate(() => {
            document.querySelector('#error_purchasePointPolicy_value > div > div > div:nth-child(3)').click();
        });

        await page.waitForSelector('#error_purchasePointPolicy_value > div:nth-child(1) > div > div.input-group-btn.open > ul > li:nth-child('+nIdex+')');
        await page.click('#error_purchasePointPolicy_value > div:nth-child(1) > div > div.input-group-btn.open > ul > li:nth-child('+nIdex+')');

        // 상품리뷰 작성시 지급 체크박스 클릭
        await page.waitForSelector('input[ng-model="vm.viewData.isUseReviewPointPolicy"]');
        await page.evaluate(() => {
            document.querySelector('input[ng-model="vm.viewData.isUseReviewPointPolicy"]').click();
        });

        // nPointTextReview 텍스트 리뷰 포인트
        await page.waitForSelector('#prd_textReview');
        await page.type('#prd_textReview',req.body.nPointTextReview);

        // nPointPhotoReview 포토/동영상 리뷰 포인트
        await page.waitForSelector('#prd_photoVideoReview');
        await page.type('#prd_photoVideoReview', req.body.nPointPhotoReview);

        // nPoint1MTextReview 한달사용 텍스트 리뷰 포인트
        await page.waitForSelector('#prd_afterUseTextReview');
        await page.type('#prd_afterUseTextReview', req.body.nPoint1MTextReview);

        // nPoint1MPhotoReview 한달사용 포토/동영상 리뷰 포인트
        await page.waitForSelector('#prd_afterUsePhotoVideoReview');
        await page.type('#prd_afterUsePhotoVideoReview', req.body.nPoint1MPhotoReview);

        // nPointTokJJim 톡톡친구/스토어찜 고객리뷰 포인트
        await page.waitForSelector('#prd_storeMemberReview');
        await page.type('#prd_storeMemberReview', req.body.nPointTokJJim);

        await page.waitFor(500000);
    }

    //res.send('Product registration succeeded..!');

    await page.evaluate(() => console.log(`url is ${location.href}`));
    browser.close();
    })();
      res.send('Product Name is "' + req.body.tProductName + '".');
    });
}
