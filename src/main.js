'use strict';

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var utils = require('../utils');
var assert = require( 'chai' ).assert;
var browser = undefined;
var page = undefined;

const puppeteer = require('puppeteer');

module.exports = app => {

     app.get('/', (req,res) => {
        res.render('register.html');
     });

     app.get('/about', (req,res) => {
        console.log('in about.html');
        res.render('about.html');
     });

     app.post('/', urlencodedParser, (req, res) => {
        //res.render('wait.html');
        (async() => {
            browser = await puppeteer.launch({
            headless: true,
            ignoreHTTPSErrors: false, // doesn't matter
            args: [
                '--ignore-certificate-errors',
                '--ignore-certificate-errors-spki-list '
            ]
            })
            page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 })

            //utils.setPage(page);

            page.on('console', msg => console.log('PAGE LOG:', msg.text()));

            //start coverage trace
            await Promise.all([
              page.coverage.startJSCoverage(),
              page.coverage.startCSSCoverage()
            ]);


            try{

                // 스마트스토어 페이지 진입
                await page.goto('http://dev.sell.smartstore.naver.com/#/login', {waitUntil: 'networkidle0'});

                // 판매자 로그인
                await utils.clearAndType(page, '#loginId', req.body.tID);
                await utils.clearAndType(page, '#loginPassword', 'qatest123');
                await utils.click(page, '#loginButton');

                // 상품등록 메뉴 진입
                await utils.click(page, '#seller-lnb > div > div:nth-child(1) > ul > li:nth-child(1) > a');
                await utils.click(page, '#seller-lnb > div > div:nth-child(1) > ul > li.ng-scope.active > ul > li:nth-child(2) > a');

                // 카테고리 선택
                await utils.click(page, '#r1_2_2');

                // 카테고리 선택 - 패션잡화
                await utils.click(page, '.seller-data-list.category-list.ng-scope > div > ul > li:nth-child(10) > a');

                // 카테고리 선택 - 벨트
                await utils.click(page, 'div[ng-show="vm.showLevel >= 2"] > ul > li:nth-child(6) > a');
                await utils.click(page, 'div[ng-show="vm.showLevel >= 2"] > ul > li:nth-child(6) > a ');

                // 카테고리 선택 - 멜빵
                await utils.click(page, 'div[ng-show="vm.showLevel >= 3"] > ul > li:nth-child(3) > a');

                // 카테고리가 제대로 선택되었는지 확인
                var category1 = await utils.getText(page, '.seller-data-list.category-list.ng-scope > div > ul > li:nth-child(10) > a');
                var category2 = await utils.getText(page, 'div[ng-show="vm.showLevel >= 2"] > ul > li:nth-child(6) > a');
                var category3 = await utils.getText(page, 'div[ng-show="vm.showLevel >= 3"] > ul > li:nth-child(3) > a');
                var categorySelected1 = category1 + '>' + category2 + '>' + category3;
                var categorySelected2 = await utils.getText(page, '.info-result.text-info.ng-scope > strong');
                assert.strictEqual(categorySelected1, categorySelected2);

                // 상품명
                await utils.clearAndType(page, 'input[name="product.name"]', req.body.tProductName);
                var strProductName = await utils.getValue(page, 'input[name="product.name"]');
                assert.strictEqual(req.body.tProductName, strProductName);

                // 판매가
                await utils.clearAndType(page, 'input[name="product.salePrice"]', req.body.nProductPrice);
                var strProductPrice = await utils.getValue(page, 'input[name="product.salePrice"]');
                assert.strictEqual(req.body.nProductPrice, strProductPrice);

                // 판매가 > 과세유형
                switch(req.body.selProductTax){
                    case 'tax':
                        await utils.click(page, '#taxType_TAX');
                        break;
                    case 'dutyfree':
                        await utils.click(page, '#taxType_DUTYFREE');
                        break;
                    case 'small':
                        await utils.click(page, '#taxType_SMALL');
                        break;
                    default:
                        console.log("tax error.");
                        break;
                 }

                // 판매가 > 할인설정
                if(req.body.chkProductSale != undefined)
                {
                    console.log('할인설정 ON');
                    await utils.click(page, '#r3_1_total');

                    // 할인가
                    await utils.clearAndType(page, 'input[name="product.customerBenefit.immediateDiscountPolicy.discountMethod.value"]', req.body.nSaleValue);
                    var strSaleValue = await utils.getValue(page, 'input[name="product.customerBenefit.immediateDiscountPolicy.discountMethod.value"]');
                    assert.strictEqual(req.body.nSaleValue, strSaleValue);

                    // 할인 단위 ( %, 원 )
                    try{
                        var nIdex = (req.body.selSaleType == 'won' ? 2 : 1);
                        await page.evaluate(({nIdex}) => {
                            document.querySelector('#error_immediateDiscountPolicy_all_value > div:nth-child(1) > div > div.input-group-btn > ul > li:nth-child('+nIdex+') > a').click();
                        }, {nIdex});
                        console.log('인덱스 : ' + nIdex);
                    }
                    catch(error){
                        console.log('click(index) error : ' + error);
                    }
                }

                // 재고 수량
                await utils.clearAndType(page, '#stock', req.body.nProductAmount);
                var strStockValue = await utils.getValue(page, '#stock');
                assert.strictEqual(req.body.nProductAmount, strStockValue);

                // 옵션 영역 펼치기
                if(req.body.chkSelectOption != undefined
                   || req.body.chkInputOption != undefined)
                {
                    await utils.click(page, 'div[server-field-errors="product.detailAttribute.optionInfo.*"]');
                    console.log("옵션 영역 on");
                }

                // 선택형 옵션 chkSelectOption
                if(req.body.chkSelectOption != undefined)
                {
                    console.log("선택형 옵션 on");
                    // 선택형 옵션 펼치기
                    await utils.click(page, '#option_choice_type_true');

                    // 선택형 옵션 -  옵션유형
                    var vOptType;
                    console.log(req.body.radOptionType);
                    if(req.body.radOptionType == 'radOptionTypeSolo')
                    {
                        await utils.click(page, 'input[value="SIMPLE"]'); // 단독형
                        vOptType = "SIMPLE";
                    }
                    else
                    {
                        await utils.click(page, 'input[value="COMBINATION"]'); // 조합형
                        vOptType = "COMBINATION";
                    }

                    // 선택형 옵션 - 정렬순서
                    console.log(req.body.selSelectOptionOrder);
                    switch(req.body.selSelectOptionOrder)
                    {
                        case 'orderRegistr' :
                            await utils.click(page, 'div[data-value="CREATE"]');
                            break;
                        case 'orderAbc' :
                            await utils.click(page, 'div[data-value="ABC"]');
                            break;
                         case 'orderLowPrice' :
                            await utils.click(page, 'div[data-value="LOW_PRICE"]');
                            break;
                        case 'ordeorderHighPricer' :
                            await utils.click(page, 'div[data-value="HIGH_PRICE"]');
                            break;
                        default :
                            console.log("선택형 옵션 정렬순서 오류");
                            break;
                    }

                    console.log(req.body.selSelectOptionNum);

                    // 선택형 옵션 -  옵션명 개수
                    await utils.click(page, 'div[data-value="1"].item');
                    switch(req.body.selSelectOptionNum){
                    case '1':
                        // 옵션 개수 - 1개 선택
                        await utils.click(page, 'div[ng-show="vm.isChoiceType"] > div > div > div > div > div  > div> div:nth-child(2)> div> div:nth-child(1)');

                        // 개별 옵션 입력
                        await utils.type(page, '#choice_option_name0', '컬러');
                        await utils.type(page, '#choice_option_value0', 'RED,BLUE,YELLOW');
                        break;
                    case '2':
                        // 옵션 개수 - 2개 선택
                        await utils.click(page, 'div[ng-show="vm.isChoiceType"] > div > div > div > div > div  > div> div:nth-child(2)> div> div:nth-child(2)');

                        // 개별 옵션 입력
                        await utils.type(page,'#choice_option_name0', '컬러');
                        await utils.type(page,'#choice_option_value0', 'RED,BLUE,YELLOW');
                        await utils.type(page,'#choice_option_name1', '사이즈');
                        await utils.type(page,'#choice_option_value1', 'S,M,L');
                        break;
                    case '3':
                        // 옵션 개수 - 3개 선택
                        await utils.click(page, 'div[ng-show="vm.isChoiceType"] > div > div > div > div > div  > div> div:nth-child(2)> div> div:nth-child(3)');

                        // 개별 옵션 입력
                        await utils.type(page,'#choice_option_name0', '컬러');
                        await utils.type(page,'#choice_option_value0', 'RED,BLUE,YELLOW');
                        await utils.type(page,'#choice_option_name1', '사이즈');
                        await utils.type(page,'#choice_option_value1', 'S,M,L');
                        await utils.type(page,'#choice_option_name2', '케이스');
                        await utils.type(page,'#choice_option_value2', 'WHITE,BLACK,BROWN');
                        break;
                    default:
                        console.log("선택형 옵션 - 개수 error");
                        break;
                    }

                    // [옵션목록 적용] 버튼 클릭
                    await utils.click(page, 'a[ng-click="vm.submitToGrid()"]');

                    // 조합형 옵션이면 재고수량 입력
                    if(vOptType == "COMBINATION")
                    {
                        // 옵션목록 전체 선택
                        await utils.click(page, '#center > div > div.ag-header > div.ag-header-viewport > div > div:nth-child(2) > div:nth-child(1) > div > label > input');

                        // 개별 옵션 재고수량 입력 후, 적용
                        await utils.type(page, 'input[ng-model="vm.bulkStockQuantity"]', '10');
                        await utils.click(page, 'a[ng-click="vm.modifySelectedRowByBulk()"]');
                    }
                 }

                // 직접입력형 옵션 chkSelectOption
                if(req.body.chkInputOption != undefined)
                {
                    console.log("직접입력형 옵션 on");

                    // 직접입력형 옵션 펼치기
                    await utils.click(page, '#option_direct_type_true ');

                    // 옵션 개수
                    switch(req.body.selInputOptionNum){
                    case '1':
                        // 옵션 개수 선택
                        await utils.click(page, 'div[ng-show="vm.isCustomType"] > div > div > div > div > div >div:nth-child(2) > div> div:nth-child(1)');

                        // 개별 옵션 입력
                        await utils.type(page, '#custom_option_name0', '컬러');
                        break;
                    case '2':
                        // 옵션 개수 선택
                        await utils.click(page, 'div[ng-show="vm.isCustomType"] > div > div > div > div > div >div:nth-child(2) > div> div:nth-child(2)');

                        // 개별 옵션 입력
                        await utils.type(page, '#custom_option_name0', '컬러');
                        await utils.type(page, '#custom_option_name1', '사이즈');
                        break;
                    case '3':
                        await utils.click(page, 'div[ng-show="vm.isCustomType"] > div > div > div > div > div >div:nth-child(2) > div> div:nth-child(3)');

                        // 개별 옵션 입력
                        await utils.type(page, '#custom_option_name0', '컬러');
                        await utils.type(page, '#custom_option_name1', '사이즈');
                        await utils.type(page, '#custom_option_name2', '케이스');
                        break;
                    case '4':
                        // 옵션 개수 선택
                        await utils.click(page, 'div[ng-show="vm.isCustomType"] > div > div > div > div > div >div:nth-child(2) > div> div:nth-child(4)');

                        // 개별 옵션 입력
                        await utils.type(page, '#custom_option_name0', '컬러');
                        await utils.type(page, '#custom_option_name1', '사이즈');
                        await utils.type(page, '#custom_option_name2', '케이스');
                        await utils.type(page, '#custom_option_name3', '이어폰');
                        break;
                    case '5':
                        // 옵션 개수 선택
                        await utils.click(page, 'div[ng-show="vm.isCustomType"] > div > div > div > div > div >div:nth-child(2) > div> div:nth-child(5)');

                        // 개별 옵션 입력
                        await utils.type(page, '#custom_option_name0', '컬러');
                        await utils.type(page, '#custom_option_name1', '사이즈');
                        await utils.type(page, '#custom_option_name2', '케이스');
                        await utils.type(page, '#custom_option_name3', '이어폰');
                        await utils.type(page, '#custom_option_name4', '마이크');
                        break;
                    default:
                        console.log("직접입력형 옵션 - 개수 error");
                        break;
                    }
                }

                // 옵션 영역 닫음
                if(req.body.chkSelectOption != undefined
                   || req.body.chkInputOption != undefined)
                {
                    // 옵션 영역 닫기
                    await utils.click(page, 'div[server-field-errors="product.detailAttribute.optionInfo.*"]');
                    console.log("옵션 영역 off");
                }

                // 상품이미지 - 대표이미지
                await utils.click(page, '#representImage > div > div.seller-product-img.add-img > div > ul > li > div > a');

                // 상품이미지 - 내사진 - file upload
                var filepath = __dirname + '\\..\\images\\product_image.jpg';
                await utils.uploadFile(page, 'input[type="file"]', filepath);

                // 상세설명
                await utils.click(page, 'a[ng-click="vm.changeEditorType(vm.constants.EDITOR_TYPE.NONE)"]');
                console.log(req.body.tProductDescription);
                await utils.type(page, '.content.write-html.ng-scope > div > textarea', req.body.tProductDescription);
                var strProductDescription = await utils.getValue(page, 'a[ng-click="vm.changeEditorType(vm.constants.EDITOR_TYPE.NONE)"]');
                //assert.strictEqual(req.body.tProductDescription, strProductDescription);


                // 상품주요정보
                if(req.body.chkProductMajorInfo != undefined)
                {
                    await utils.click(page, '#_prod-attr-section > div');

                    console.log("상품주요정보 on");

                    // 모델명
                    await utils.type(page, 'input[name="product.detailAttribute.naverShoppingSearchInfo.modelName"]', 'M');
                    var strModelName = await utils.getValue(page, 'input[name="product.detailAttribute.naverShoppingSearchInfo.modelName"]');
                    assert.strictEqual('M', strModelName);

                    // 상품주요정보 - 상품속성
                    await utils.click(page, 'div[data-value="10030583"]'); // 남녀공용
                    await utils.click(page, 'div[data-value="10197460"]'); // 가죽
                    await utils.click(page, 'div[data-value="10557684"]'); // 미디엄
                    await utils.click(page, 'div[data-value="10574836"]'); // 체크
                    await utils.click(page, 'ng-if[ng-if="categoryAttribute.attribute.attributeClassificationType === \'MULTI_SELECT\'"] > div > div > label > input'); // 체크

                    // 상품주요정보 - 원산지
                    console.log(req.body.selProductOrigin);
                    switch(req.body.selProductOrigin){
                        case 'domestic':
                            // 국내
                            await utils.click(page, '.selectize-dropdown-content > div[data-value="LOCAL"]');
                            break;
                        case 'imported':
                            // 수입산
                            await utils.click(page, '.selectize-dropdown-content > div[data-value="IMPORT"]');

                            // 원산지 > 북아메리카
                            await utils.click(page, '.selectize-dropdown-content > div[data-value="0204"]');

                            // 원산지 > 북아메리카 > 미국
                            await utils.click(page, '.selectize-dropdown-content > div[data-value="0204000"]');

                            // 수입사 입력
                            await utils.type(page, '.fix-area2 > div > div > input', '수입사 테스트');
                            break;
                        case 'etc':
                            // 기타
                            await utils.click(page, '.selectize-dropdown-content > div[data-value="ETC"]');
                            break;
                        default:
                            await utils.click(page, '.selectize-dropdown-content > div[data-value="LOCAL"]');
                            break;
                    }

                    // 상품주요정보 - 상품상태
                    if(req.body.selProductStatus == "used"){
                        console.log("중고");
                        await utils.click(page, 'label[for="saleType_OLD"]');
                    }

                    // 상품주요정보 - 주문제작 상품(현재 스펙변경된 상태라 주석처리)
    //                var customMade = false;
    //                if(req.body.chkCustomMade != undefined)
    //                {
    //                    customMade = true; // 배송 > 발송예정일 설정 위한 변수
    //
    //                    // 체크박스가 체크됐는지
    //                    var selectorCheckbox = 'input[ng-model="vm.product.detailAttribute.customMadeInfo.customMade"].ng-pristine.ng-untouched.ng-valid.ng-empty';
    //                    if(await utils.isElementExists(page, selectorCheckbox) == true)
    //                    {
    //                        console.log('주문제작 상품-체크안된 상태.');
    //                        await utils.click(page, selectorCheckbox);
    //                    }
    //                    else
    //                    {
    //                        console.log('주문제작 상품-체크된 상태.');
    //                    }
    //
    //                    // 반품/취소 제한 안내 및 동의
    //                    if(req.body.chkReturnCancel != undefined)
    //                    {
    //                        await utils.click(page, '#customMadeInfo_useReturnCancelNotification');
    //                        await utils.click(page, 'input[ng-model="vm.customMadeConfirmation"]');
    //                    }
    //                }

                    // 상품주요정보 - 미성년가 구매 가능여부 - (default : 가능)
                    if(req.body.radIsBuyChildren == "impossible")
                    {
                        console.log("미성년자 구매 불가능");
                        await utils.click(page, '#child2');
                    }
                }
                else // 상품주요정보 - 상품속성은 default로 입력
                {
                    await utils.click(page, '#_prod-attr-section > div');

                    console.log("상품주요정보 on");

                    // 상품주요정보 - 상품속성
                    await utils.click(page, 'div[data-value="10030583"]'); // 남녀공용
                    await utils.click(page, 'div[data-value="10197460"]'); // 가죽
                    await utils.click(page, 'div[data-value="10557684"]'); // 미디엄
                    await utils.click(page, 'div[data-value="10574836"]'); // 체크
                    await utils.click(page, 'ng-if[ng-if="categoryAttribute.attribute.attributeClassificationType === \'MULTI_SELECT\'"] > div > div > label > input'); // 체크
                }

                // 상품정보제공고시
                if(req.body.chkProductInfoNotice != undefined)
                {
                    console.log("상품제공고시 on");

                    // 상품정보 제공고시 영역 열기
                    await utils.click(page, 'div[server-field-errors="product.detailAttribute.productInfoProvidedNotice.*"]');

                    // 상품군
                    await utils.click(page, 'ui-view[name="provided-notice"] > div > fieldset > div > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div.selectize-input.items.ng-valid.ng-pristine.full.has-options.has-items');

                    // 상품군 - 의류 선택
                    await utils.click(page, 'div[data-value="WEAR"]');

                    // 제품소재
                    await utils.type(page, '#prd', req.body.tProductMaterial);
                    var strProductMaterial = await utils.getValue(page, '#prd');
                    //assert.strictEqual(req.body.tProductMaterial, strProductMaterial);

                    // 치수명
                    await utils.clearAndType(page, '#prd_size', req.body.tProductSize);
                    var strProductSize = await utils.getValue(page, '#prd_size');
                    assert.strictEqual(req.body.tProductSize, strProductSize);

                    // 색상
                    await utils.clearAndType(page, '#prd_col', req.body.tProductColor);
                    var strProductColor = await utils.getValue(page, '#prd_col');
                    assert.strictEqual(req.body.tProductColor, strProductColor);

                    // 제조자
                    await utils.clearAndType(page, '#productForm > ng-include > ui-view:nth-child(14) > div > fieldset > div > div > div:nth-child(3) > ng-include > div > div:nth-child(4) > div > ncp-brand-manufacturer-input > div > div > div > div > div > div.selectize-input.items.not-full.ng-valid.ng-pristine > input[type="text"]', req.body.tProductManufacturer);
                    var strManufacturer = await utils.getValue(page, '#productForm > ng-include > ui-view:nth-child(14) > div > fieldset > div > div > div:nth-child(3) > ng-include > div > div:nth-child(4) > div > ncp-brand-manufacturer-input > div > div > div > div > div > div.selectize-input.items.not-full.ng-valid.ng-pristine > input[type="text"]');
                    await utils.click(page, 'div[data-value="131746"]');
                    assert.strictEqual(req.body.tProductManufacturer, strManufacturer);

                    // 세탁방법 및 취급시 주의사항
                    await utils.clearAndType(page, '#prd_caution',req.body.tProductPrecautions);
                    var strProductCaution = await utils.getValue(page, '#prd_caution');
                    assert.strictEqual(req.body.tProductPrecautions, strProductCaution);

                    // 제조년월
                    await utils.click(page, 'input[ng-click="vm.dateHandle(true, true)"]');
                    await utils.clearAndType(page, 'div[ng-show="vm.noticeType !== \'GIFT_CARD\'"] > div > input', req.body.tManuYearMonth);
                    var strProductYearMonth = await utils.getValue(page, 'div[ng-show="vm.noticeType !== \'GIFT_CARD\'"] > div > input');
                    assert.strictEqual(req.body.tManuYearMonth, strProductYearMonth);

                    // 품질보증기준
                    await utils.clearAndType(page, '#prd_quality', req.body.tQualityStandards);
                    var strProductQuality = await utils.getValue(page, '#prd_quality');
                    assert.strictEqual(req.body.tQualityStandards, strProductQuality);

                    // AS 책임자
                    await utils.clearAndType(page, '#prd_as', req.body.tAsManager);
                    var strProductAS = await utils.getValue(page, '#prd_as');
                    assert.strictEqual(req.body.tAsManager, strProductAS);
                }

                // 배송
                if(req.body.chkDelivery != undefined)
                {
                    // 배송영역 펼침
                    console.log("배송 on");
                    await utils.click(page, 'div[server-field-errors="product.deliveryInfo.*"]');

                    // radIsDelivery(delivery, none_delivery) 배송여부
                    if(req.body.radIsDelivery == "none_delivery")
                    {
                        // 배송없음
                        await utils.click(page, '#rdelivery_no');
                    }
                    else
                    {
                        // 배송 있음
                        await utils.click(page, '#rdelivery');

                        // radDeliveryProperty(normal, today) 배송속성
                        if(req.body.radDeliveryProperty == "today") // 오늘출발
                        {
                            // [오늘출발] 클릭
                            await utils.click(page, '#TODAY');
                        }
                        else
                        {
                            // 현재 주문제작 스펙 변경된 상태
    //                        if(customMade == true) // 주문 제작 상품인 경우
    //                        {
    //                            // 발송예정일 설정
    //                            await await utils.click(page, 'div[ng-if="::vm.viewData.customMade === true || vm.formType === \'BULK\'"] > div')
    //                            await utils.click(page, 'div[data-value="SEVEN"]');
    //                        }
                        }

                        // 배송방법
                        if(req.body.radDeliveryType == "deliveryDirect") // 직접배송
                            await utils.click(page, '#DIRECT');
                        else
                            await utils.click(page, '#DELIVERY');

                        // chkReceiveVisit 방문수령
                        if(req.body.chkReceiveVisit != undefined)
                        {
                            console.log('방문수령');
                            // [방문수령]
                            var selectorCheckbox = 'input[name="visit_receipt"].ng-pristine.ng-untouched.ng-valid.ng-empty';
                            if(await utils.isElementExists(page, selectorCheckbox) == true)
                            {
                                console.log('방문수령-체크안된 상태.');

                                // 방문수령 체크박스 클릭
                                await utils.click(page, selectorCheckbox);

                                // [판매자 주소록] 버튼 클릭
                                await utils.click(page, 'button[ng-click="vm.setVisitAddress()"]');

                                // 주소 선택
                                await utils.click(page, 'a[ng-click="vm.close(address);"] > p');
                            }
                            else
                            {
                                console.log('방문수령-체크된 상태.');
                            }
                        }

                        // chkQuickService 퀵서비스
                        if(req.body.chkQuickService != undefined)
                        {
                            // 체크박스가 체크됐는지
                            var selectorCheckbox = 'input[name="quickService"].ng-pristine.ng-untouched.ng-valid.ng-empty';
                            if(await utils.isElementExists(page, selectorCheckbox) == true)
                            {
                                console.log('퀵서비스-체크안된 상태.');
                                await utils.click(page, selectorCheckbox);
                            }
                            else
                            {
                                console.log('퀵서비스-체크된 상태.');
                            }
                        }

                        // radIsDeliveryBundle(possible, impossible) 묶음배송여부
                        if(req.body.radIsDeliveryBundle == "impossible")
                            await utils.click(page, '#rset_2');
                        else
                            await utils.click(page, '#rset_1');

                        // selDeliveryChargeType(charged, free, conditionalFree, perQuantity, perSectionTwo, perSectionThree) 상품별 배송비
                        // 상품별 배송비 셀렉트 박스 열기

                        // 상품별 배송비 선택
                        switch(req.body.selDeliveryChargeType)
                        {
                            case 'charged' : // 유료
                                await utils.click(page, '.selectize-dropdown-content > div[data-value="PAID"]');
                                break;
                            case 'free' : // 무료
                                await utils.click(page, '.selectize-dropdown-content > div[data-value="FREE"]');
                                break;
                             case 'conditionalFree' : // 조건별 무료
                                await utils.click(page, '.selectize-dropdown-content > div[data-value="CONDITIONAL_FREE"]');
                                break;
                            case 'per_quantity' : // 수량별 무료
                                await utils.click(page, '.selectize-dropdown-content > div[data-value="UNIT_QUANTITY_PAID"]');
                                break;
                            case 'per_sectionTwo' : // 구간별(2구간)
                                await utils.click(page, '.selectize-dropdown-content > div[data-value="RANGE_QUANTITY_PAID"]');

                                // 2구간 라디오 버튼 클릭
                                await utils.click(page, 'input[name="isThirdBase"][value="false"]');
                                break;
                            case 'per_sectionThree' : // 구간별(3구간)
                                await utils.click(page, '.selectize-dropdown-content > div[data-value="RANGE_QUANTITY_PAID"]');

                                // 3구간 라디오 버튼 클릭
                                await utils.click(page, 'input[name="isThirdBase"][value="true"]');
                                break;
                            default :
                                console.log("배송비 유형 오류");
                                break;
                        }

                        // 배송비 입력
                        if(req.body.selDeliveryChargeType != 'free')
                        {
                            console.log(req.body.selDeliveryChargeType);

                            // 배송비 조건
                            switch(req.body.selDeliveryChargeType)
                            {
                                case 'conditionalFree' :
                                    await utils.clearAndType(page, '#delivery_condition', '50000');
                                    break;
                                case 'per_quantity' :
                                    await utils.clearAndType(page, '#delivery_condition2', '5');
                                    break;
                                case 'per_sectionTwo' :
                                    // ~x 까지 추가배송비 없음
                                    await utils.clearAndType(page, 'input[ncp-message-container="#error-freeSectionLastQuantity"]', '5');

                                    // x 초과 구매 시 추가배송비
                                    await utils.clearAndType(page, 'div[ng-form="_DELIVERY_FEE"] > div:nth-child(2) > div:nth-child(3) > div > div:nth-child(6) > div > div> div > input', '3000');
                                    break;
                                case 'per_sectionThree' :
                                    // ~x 까지 추가배송비 없음
                                    await utils.clearAndType(page, 'input[ncp-message-container="#error-freeSectionLastQuantity"]', '5');

                                    // ~x까지 추가배송비
                                   await utils.clearAndType(page, 'input[ng-model="vm.modelData.deliveryFee.secondSectionLastQuantity"]', '10');

                                    // 추가배송비 금액
                                    await utils.clearAndType(page, 'div[ng-form="_DELIVERY_FEE"] > div:nth-child(2) > div:nth-child(3) > div > div:nth-child(4) > div > div > div > input', '3000');

                                    // x 초과 구매 시 추가배송비
                                    await utils.clearAndType(page, 'input[ng-model="vm.modelData.deliveryFee.thirdExtraFee"]', '6000');
                                    break;
                                default :
                                    break;
                            }

                            // 기본 배송비
                            await utils.clearAndType(page, '#basic_price', '3000'); // 배송비 3000원
                            var strDelivery = await utils.getValue(page, '#basic_price');
                            //assert.strictEqual('3000', strDelivery);

                            // 결제방식(착불(default), 선결제)
                            if(req.body.chkPaymentAdvance != undefined)
                            {
                                if(req.body.chkPaymentCollect != undefined) // 착불+선결제
                                    await utils.click(page, 'input[value="COLLECT_OR_PREPAID"]');
                                else // 선결제
                                    await utils.click(page, 'input[value="PREPAID"]');
                            }
                            else
                                await utils.click(page, 'input[value="COLLECT"]');

                            // tRegionCharge 지역별 차등 배송비
                            if(req.body.tRegionCharge != undefined)
                            {
                                await utils.clearAndType(page, '#delivery_price', req.body.tRegionCharge);
                                var strRegionCharge = await utils.getValue(page, '#delivery_price');
                                assert.strictEqual(req.body.tRegionCharge, strRegionCharge);
                            }

                            // radInstallCosts(exist, none(default)) 별도 설치비
                            if(req.body.radInstallCosts == "exist")
                                await utils.click(page, '#install1');

                            // 반품/교환 영역 열기
                            await utils.click(page, 'div[ncp-click="vm.returnDeliveryMenu()"] > div');
                            console.log("반품/교환 on");


                            // 반품배송비(편도)
                            await utils.clearAndType(page, '#return_price',req.body.nDeliveryChargeReturn);
                            var strReturnPrice = await utils.getValue(page, '#return_price');
                            assert.strictEqual(req.body.nDeliveryChargeReturn, strReturnPrice);


                            // 교환배송비(왕복)
                            await utils.clearAndType(page, '#exchange_price',req.body.nDeliveryChargeChange);
                            var strExchangePrice = await utils.getValue(page, '#exchange_price');
                            assert.strictEqual(req.body.nDeliveryChargeChange, strExchangePrice);
                        }
                    }
                }
                else // 배송 데이터는 없지만, 주문제작상품으로 발송예정일을 설정해야 하는 경우
                {
                    // 현재 주문제작 스펙 변경된 상태
    //                if(customMade == true)
    //                {
    //                    // 배송영역 펼침
    //                    await utils.click(page, 'div[server-field-errors="product.deliveryInfo.*"]');
    //
    //                    // 발송예정일 설정
    //                    await utils.click(page, 'div[ng-if="::vm.viewData.customMade === true || vm.formType === \'BULK\'"] > div');
    //                    await utils.click(page, 'div[data-value="SEVEN"]');
    //                }
                }

                // A/S
                if(req.body.chkAs != undefined)
                {
                    console.log("A/S, 특이사항 on");

                    // A/S 영역 열기
                    await utils.click(page, 'div[ncp-click="vm.openMenuToggle();"]');

                    // A/S 전화번호
                    await utils.clearAndType(page, '#as_number',req.body.tAsNumber);
                    var strAsNumber = await utils.getValue(page, '#as_number');
                    assert.strictEqual(req.body.tAsNumber, strAsNumber);

                    // A/S 안내
                    await utils.clearAndType(page, '#as_info',req.body.tAsDescription);
                    var strAsDescription = await utils.getValue(page, '#as_info');
                    assert.strictEqual(req.body.tAsDescription, strAsDescription);
                }

                // 추가상품
                if(req.body.chkAdditionalProduct != undefined)
                {
                    // 추가상품 영역 열기
                    await utils.click(page, 'div[server-field-errors="product.detailAttribute.supplementProductInfo.*"]');
                    console.log("추가상품 on");

                    // 추가상품 - 정렬순서
                    console.log(req.body.selAdditionalProductOrder);
                    switch(req.body.selAdditionalProductOrder)
                    {
                        case 'orderRegistr' :
                            await utils.click(page, 'div[data-value="CREATE"]');
                            break;
                        case 'orderAbc' :
                           await utils.click(page, 'div[data-value="ABC"]');
                            break;
                         case 'orderLowPrice' :
                            await utils.click(page, 'div[data-value="LOW_PRICE"]');
                            break;
                        case 'ordeorHighPrice' :
                            await utils.click(page, 'div[data-value="HIGH_PRICE"]');
                            break;
                        default :
                            console.log("추가상품 정렬순서 오류");
                            break;
                    }

                    console.log(req.body.selAdditionalProductNum);

                    // 추가상품 -  추가상품 개수
                    await utils.click(page, 'div[data-value="1"].item');

                    switch(req.body.selAdditionalProductNum){
                    case '1':
                        // 추가상품 개수 - 1개 선택
                        await utils.click(page, 'div[ng-show="vm.isConfig"] > div > div > div > div > div > div:nth-child(2)> div> div:nth-child(1)');

                        // 개별 추가상품 입력
                        await utils.type(page, '#supple_group_name0', '케이스');
                        await utils.type(page, '#supple_names0', 'RED,BLUE,YELLOW');
                        await utils.type(page, '#supple_prices0', '0,50,100');
                        break;
                    case '2':
                        // 추가상품 개수 - 2개 선택
                        await utils.click(page, 'div[ng-show="vm.isConfig"] > div > div > div > div > div > div:nth-child(2)> div> div:nth-child(2)');

                        // 개별 추가상품 입력
                        await utils.type(page, '#supple_group_name0', '케이스');
                        await utils.type(page, '#supple_names0', 'RED,BLUE,YELLOW');
                        await utils.type(page, '#supple_prices0', '0,50,100');
                        await utils.type(page, '#supple_group_name1', '이어폰');
                        await utils.type(page, '#supple_names1', 'BLACK,WHITE');
                        await utils.type(page, '#supple_prices1', '0,50');
                        break;
                    case '3':
                        // 추가상품 개수 - 3개 선택
                        await utils.click(page, 'div[ng-show="vm.isConfig"] > div > div > div > div > div > div:nth-child(2)> div> div:nth-child(3)');

                        // 개별 추가상품 입력
                        await utils.type(page, '#supple_group_name0', '케이스');
                        await utils.type(page, '#supple_names0', 'RED,BLUE,YELLOW');
                        await utils.type(page, '#supple_prices0', '0,50,100');
                        await utils.type(page, '#supple_group_name1', '이어폰');
                        await utils.type(page, '#supple_names1', 'BLACK,WHITE');
                        await utils.type(page, '#supple_prices1', '0,50');
                        await utils.type(page, '#supple_group_name2', '마이크');
                        await utils.type(page, '#supple_names2', 'BLACK,WHITE');
                        await utils.type(page, '#supple_prices2', '0,50');
                    default:
                        console.log("선택형 옵션 - 개수 error");
                        break;
                    }

                    // [추가상품목록 적용]
                    await utils.click(page, 'a[ng-click="vm.submitToGrid()"]');

                    // 추가상품 목록 전체 선택
                    await utils.click(page, '#center > div > div.ag-header > div.ag-header-viewport > div > div > div:nth-child(1) > div > label > input');

                    // 개별 추가상품 재고수량 입력 후, 적용
                    await utils.type(page, 'input[ng-model="vm.bulkStockQuantity"]', '10');
                    await utils.click(page, 'a[ng-click="vm.modifySelectedRowByBulk()"]');
                 }

                // 구매/혜택조건
                if(req.body.chkBenefitCondition != undefined
                  || req.body.chkBuyCondition != undefined )
                {
                    console.log("구매혜택/조건 on");

                    // 구매혜택/조건 열기
                    await utils.click(page, '#productForm > ng-include > ui-view:nth-child(18) > div> div');

                    // nBuyConditionMin 최소구매수량
                    await utils.type(page, '#prd_min',req.body.nBuyConditionMin);
                    var strBuyConditionMin = await utils.getValue(page, '#prd_min');
                    assert.strictEqual(req.body.nBuyConditionMin, strBuyConditionMin);

                    // nBuyConditionMaxPer 최대구매수량(1회)
                    console.log('최대구매수량(1회)' + req.body.nBuyConditionMaxPer);
                    await utils.click(page, 'input[ng-model="vm.viewData.isUseMaxPurchaseQuantityPerOrder"]');
                    await utils.type(page, 'input[ng-model="vm.product.detailAttribute.purchaseQuantityInfo.maxPurchaseQuantityPerOrder"]', req.body.nBuyConditionMaxPer);
                    var strBuyConditionMaxPer = await utils.getValue(page, 'input[ng-model="vm.product.detailAttribute.purchaseQuantityInfo.maxPurchaseQuantityPerOrder"]');
                    assert.strictEqual(req.body.nBuyConditionMaxPer, strBuyConditionMaxPer);

                    // nBuyConditionMaxPerson 최대구매수량(1인)
                    console.log('최대구매수량(1인)' + req.body.nBuyConditionMaxPerson);
                    await utils.click(page, 'input[ng-model="vm.viewData.isUseMaxPurchaseQuantityPerId"]');
                    await utils.type(page, 'input[ng-model="vm.product.detailAttribute.purchaseQuantityInfo.maxPurchaseQuantityPerId"]', req.body.nBuyConditionMaxPerson);
                    var strBuyConditionMaxPerson = await utils.getValue(page, 'input[ng-model="vm.product.detailAttribute.purchaseQuantityInfo.maxPurchaseQuantityPerId"]');
                    assert.strictEqual(req.body.nBuyConditionMaxPerson, strBuyConditionMaxPerson);

                    // 상품 구매 시 지급 체크박스 클릭
                    await utils.click(page, 'input[ng-model="vm.viewData.isUsePurchasePointPolicy"]');

                    // nPointBuy 지급 포인트
                    await utils.type(page, '#error_purchasePointPolicy_value > div:nth-child(1) > div > div.seller-input-wrap.ng-scope > input', req.body.nPointBuy);
                    var strPointBuy = await utils.getValue(page, '#error_purchasePointPolicy_value > div:nth-child(1) > div > div.seller-input-wrap.ng-scope > input');
                    assert.strictEqual(req.body.nPointBuy, strPointBuy);

                    // selPointBuyType(won, percent) 지급 포인트 단위
                    try{
                        var nIdex = (req.body.selPointBuyType == 'won' ? 2 : 1);
                        console.log(req.body.selPointBuyType);
                        console.log('인덱스 : ' + nIdex);

                        await page.evaluate(({nIdex}) => {
                            document.querySelector('#error_purchasePointPolicy_value > div:nth-child(1) > div > div.input-group-btn > ul > li:nth-child(' + nIdex + ') > a').click();
                        }, {nIdex});
                    }
                    catch(error){
                        console.log('click(index) error : ' + error);
                    }

                    // 상품리뷰 작성시 지급 체크박스 클릭
                    await utils.click(page, 'input[ng-model="vm.viewData.isUseReviewPointPolicy"]');

                    // nPointTextReview 텍스트 리뷰 포인트
                    await utils.clearAndType(page, '#prd_textReview',req.body.nPointTextReview);
                    var strTextReview = await utils.getValue(page, '#prd_textReview');
                    assert.strictEqual(req.body.nPointTextReview, strTextReview);

                    // nPointPhotoReview 포토/동영상 리뷰 포인트
                    await utils.clearAndType(page, '#prd_photoVideoReview', req.body.nPointPhotoReview);
                    var strPhotoVideoReview = await utils.getValue(page, '#prd_photoVideoReview');
                    assert.strictEqual(req.body.nPointPhotoReview, strPhotoVideoReview);

                    // nPoint1MTextReview 한달사용 텍스트 리뷰 포인트
                    await utils.clearAndType(page, '#prd_afterUseTextReview', req.body.nPoint1MTextReview);
                    var strAfterTextReview = await utils.getValue(page, '#prd_afterUseTextReview');
                    assert.strictEqual(req.body.nPoint1MTextReview, strAfterTextReview);

                    // nPoint1MPhotoReview 한달사용 포토/동영상 리뷰 포인트
                    await utils.clearAndType(page, '#prd_afterUsePhotoVideoReview', req.body.nPoint1MPhotoReview);
                    var strAfterTextPhotoReview = await utils.getValue(page, '#prd_afterUsePhotoVideoReview');
                    assert.strictEqual(req.body.nPoint1MPhotoReview, strAfterTextPhotoReview);

                    // nPointTokJJim 톡톡친구/스토어찜 고객리뷰 포인트
                    await utils.clearAndType(page, '#prd_storeMemberReview', req.body.nPointTokJJim);
                    var strTokJJim = await utils.getValue(page, '#prd_storeMemberReview');
                    assert.strictEqual(req.body.nPointTokJJim, strTokJJim);
                }

                // [쇼핑윈도] 제외
                await utils.click(page, 'input[data-nclicks-code="ech.swin"]');

                // [상품등록]
                console.log('상품등록11111');
                await utils.click(page, 'button[data-nclicks-code="flt.save"][progress-button="vm.submit()"]');

                res.send('<script type="text/javascript">alert("상품등록 완료");history.back();</script>');
            }
            catch(error){
                res.send('<script type="text/javascript">alert("상품등록 실패(' + error + ')");history.back();</script>');
                console.log('상품등록 실패 : ' + error);
            }

            //stop coverage trace
            const [jsCoverage, cssCoverage] = await Promise.all([
              page.coverage.stopJSCoverage(),
              page.coverage.stopCSSCoverage(),
            ]);

            let totalBytes = 0;
            let usedBytes = 0;
            const coverage = [...jsCoverage, ...cssCoverage];
            for (const entry of coverage) {
              totalBytes += entry.text.length;
              for (const range of entry.ranges)
                usedBytes += range.end - range.start - 1;
            }

            const usedCode = ((usedBytes / totalBytes)* 100).toFixed(2);
            console.log('Code used by only', usedCode, '%');

            await page.evaluate(() => console.log(`url is ${location.href}`));

            browser.close();
        })();
        //res.send('상품등록중입니다. 잠시만 기다려주세요...');
    });
}
