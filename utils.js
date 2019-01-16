'use strict';


// wait and click
module.exports.click = async(page, selector) => {
    try{
        await page.waitForSelector(selector, { timeout: 100000 });
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
        await page.waitForSelector(selector, { timeout: 100000 });
        await page.type(selector, contents);
    }
    catch(error){
        console.log('type error : ' + error);
    }
};

// upload file
module.exports.uploadFile = async(page, selector, filepath) => {
    try{
        await page.waitForSelector(selector, { timeout: 100000 });
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
        await page.waitForSelector(selector, { timeout: 100000 });
        const input = await page.$(selector);
        await input.click();
        await input.focus();
        await input.click({clickCount: 3});
        await input.press('Backspace');
        await input.type(contents);
    }
    catch(error){
        console.log('clearAndType error : ' + error);
    }
};

// is exists element
module.exports.isExistsElement = async(page, selector) => {
    var isExists = false;
    try{
        const isExistChecked = await page.$(selector);
        if(isExistChecked)
            isExists = true;
    }
    catch(error){
        console.log('isExistsElement error : ' + error);
    }
    return isExists;
};
