'use strict';

// wait and click
module.exports.click = async(page, selector) => {
    try{
        await page.waitForSelector(selector, { timeout: 10000 });
        await page.evaluate((selector) => {
            document.querySelector(selector).click();
        }, selector);
    }
    catch(error){
        console.log('click error : ' + error);
    }
};

// wait and type
module.exports.type = async(page, selector, contents) => {
    try{
        await page.waitForSelector(selector, { timeout: 10000 });
        await page.type(selector, contents);
    }
    catch(error){
        console.log('type error : ' + error);
    }
};

// upload file
module.exports.uploadFile = async(page, selector, filepath) => {
    try{
        await page.waitForSelector(selector, { timeout: 10000 });
        const input = await page.$(selector);
        await input.uploadFile(filepath);
    }
    catch(error){
        console.log('uploadFile error : ' + error);
    }
};

// clear and type
module.exports.clearAndType = async(page, selector, contents) => {
    try{
        await page.waitForSelector(selector, { timeout: 10000 });
        const input = await page.$(selector);
        await input.click();
        await input.focus();
        await page.keyboard.down( 'Control' );
        await page.keyboard.press( 'A' );
        await page.keyboard.up( 'Control' );
        await page.keyboard.press( 'Backspace' );
        await page.type(selector, contents);
    }
    catch(error){
        console.log('clearAndType error : ' + error);
    }
};

// is exists element
module.exports.isElementExists = async(page, selector) => {
    let isExists = false;
    try{
        const element = await page.$(selector);
        if(element)
            isExists = true;
    }
    catch(error){
        console.log('isExistsElement error : ' + error);
    }
    return isExists;
};

// get a element's text
module.exports.getText = async(page, selector) => {
    let text;
    try{
        await page.waitForSelector(selector, { timeout: 10000 });

        var element = await page.$(selector);
        var valueHandle = await element.getProperty('textContent');
        text = await valueHandle.jsonValue();
    }
    catch(error){
        console.log('getText error : ' + error);

    }
    return text;
};

// get a element's value
module.exports.getValue = async(page, selector) => {
    let value;
    try{
        await page.waitForSelector(selector, { timeout: 10000 });

        var element = await page.$(selector);
        var valueHandle = await element.getProperty('value');
        value = await valueHandle.jsonValue();
    }
    catch(error){
        console.log('getValue error : ' + error);
    }
    return value;
};

// get a element's value
module.exports.getInnerText = async(page, selector) => {
    let value;
    try{
        await page.waitForSelector(selector, { timeout: 10000 });

        var element = await page.$(selector);
        var valueHandle = await element.getProperty('innerText');
        value = await valueHandle.jsonValue();
    }
    catch(error){
        console.log('getValue error : ' + error);
    }
    return value;
};


//clickAndWaitForNewPage(selector): Element 클릭 후, 링크 연결된 팝업/새탭이 로딩완료 되기까지 대기한다. 팝업/새탭페이지 반환 (마지막에 열린 페이지)
module.exports.clickAndGetNewPage = async (browser, page, selector) => {
    let newPage;
    try{
        await page.waitForSelector(selector, { timeout: 10000 });

        let navigation = new Promise(response => browser.on('targetcreated', response));

        await page.evaluate((selector) => {
            document.querySelector(selector).click();
        }, selector);

        //await page.click(selector);
        await navigation;
        let pages = await browser.pages();
        newPage = pages[pages.length - 1];
    } catch(error){
        console.log('새탭 열기 실패: ' + error)
    }
    return newPage;
}
