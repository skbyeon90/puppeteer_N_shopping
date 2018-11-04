'use strict';

const puppeteer = require('puppeteer');
var config = require('./config.json');
const assert = require('chai').assert;

let browser;
let page;

before('before test : 브라우저, 페이지 객체 초기화', async() =>{
    browser = await puppeteer.launch({headless : false, args : ['--ignore-certificate-errors']}); // , args: ['--start-fullscreen']
    page = await browser.newPage();
});

after('테스트 종료 & 브라우저 닫기', async () => {
   browser.close()
});

async function getValue(selector) {
  let value = await page.evaluate((sel) => {
    return document.querySelector(sel).value
  }, selector)
  return value
}

describe('네이버 클라우드 파일 및 폴더 업로드 테스트', async() => {
    
    it('1. 네이버 클라우드 페이지 접속 후, 로그인', async() => {
        await page.goto('https://qa.photo.cloud.naver.com/v2/', {waitUntil: 'networkidle2'});
        await page.type('#id', config.user.id);
        await page.type('#pw', config.user.password);
        await page.click('input[title="로그인"]');

        // 서비스 안내 레이어 닫기
        await page.waitForSelector('.pro_up > a');
        await page.click('.pro_up > a');
        
        assert.strictEqual(page.url(), 'https://qa.photo.cloud.naver.com/v2/');
        
    }).timeout(20000);

    it('2. 클라우드 폴더 목록> "내 문서" 폴더로 이동.', async() => {
        await page.click('a[data-nclickcode="lef.folder"]');
        await page.waitForSelector('label[title="내 문서"]');
        await page.click('label[title="내 문서"]');
        
        // 내 문서 폴더 이동여부 확인
        var isDocumentFocus = await page.$('label[title="내 문서"][class~="focusout"]');
        assert.isNull(isDocumentFocus, "내 문서 폴더로 이동 실패!");
        
        // 서비스 안내 레이어 닫기
        await page.waitForSelector('.clse_s._ajax_layerclose');
        await page.click('.clse_s._ajax_layerclose');
    }).timeout(20000);
    
    it('3. 파일 업로드', async() => {
        // [올리기 버튼] 클릭
        await page.waitForSelector('._new_upload > button');
        await page.click('._new_upload > button');

        // 파일 업로드
        await page.waitForSelector('.imp_li > input[title="파일 올리기"]');
        var file_input = await page.$('.imp_li > input[title="파일 올리기"]');
        await file_input.uploadFile(__dirname + config.uploadInfo.filePath);

        // 파일 업로드 보안 안내 레이어> 확인
        await page.waitForSelector('button[data-type="start"]');
        await page.focus('button[data-type="start"]'); // Chrome 알람 권한 요청 창이 노출되며 포커싱을 뺏어 우선 버튼에 포커싱 처리함. 
                                                       // 기본 얼럿 제어 방법으로 제어 안됨.(리서치 필요)
        await page.click('button[data-type="start"]');

        // 파일 업로드 여부 확인
        var isExistsFile = await page.$('li[title="'+ config.uploadInfo.fileName +'"]');
        assert.isNull(isExistsFile, "파일 업로드 실패!");
        
        // 업로드한 파일 삭제
        await page.waitForSelector('li[title="'+ config.uploadInfo.fileName +'"] > div > input');
        await page.click('li[title="'+ config.uploadInfo.fileName +'"] > div > input');
        await page.click('._delete');
        await page.waitForSelector('._confirm\\#ok');
        await page.click('._confirm\\#ok');
        
        isExistsFile = await page.$('li[title="'+ config.uploadInfo.fileName +'"]');
        assert.isNotNull(isExistsFile, "파일 삭제 실패!");
    }).timeout(20000);

    it('4. 폴더 업로드', async() => {
        // [올리기 버튼] 클릭
        await page.waitForSelector('._new_upload > button');
        await page.click('._new_upload > button');
        
        // 폴더 업로드
        await page.waitForSelector('.imp_li > input[title="폴더 올리기"]');
        var folder_input = await page.$('.imp_li > input[title="폴더 올리기"]');
        await folder_input.uploadFile(__dirname + config.uploadInfo.folderPath);

        // '폴더 내 전체 파일 업로드' 얼럿 제어
        page.on('dialog', async dialog => {
        console.log(dialog.message());
        await dialog.accept();
        })

        // 폴더 업로드 보안 안내 레이어> 확인
        await page.waitForSelector('button[data-type="start"]');
        await page.focus('button[data-type="start"]'); // Chrome 알람 권한 요청 창이 노출되며 포커싱을 뺏어 우선 버튼에 포커싱 처리함. 
                                                       // 기본 얼럿 제어 방법으로 제어 안됨.(리서치 필요)
        await page.click('button[data-type="start"]');

        // 폴더 업로드 여부 확인
        var isExistsFolder = await page.$('li[title="'+ config.uploadInfo.folderName +'"]');
        assert.isNull(isExistsFolder, "폴더 업로드 실패!");
        
        // 업로드한 폴더 삭제
        await page.waitForSelector('li[title="'+ config.uploadInfo.folderName +'"] > div > input');
        await page.click('li[title="'+ config.uploadInfo.folderName +'"] > div > input');
        await page.click('._delete');
        await page.waitForSelector('._confirm\\#ok');
        await page.click('._confirm\\#ok');
        
        // 폴더 삭제 여부 확인
        isExistsFolder = await page.$('li[title="'+ config.uploadInfo.folderName +'"]');
        assert.isNotNull(isExistsFolder, "폴더 삭제 실패!");
    }).timeout(20000);
});