const puppeteer = require('puppeteer');
const setupJestScreenshot = require('jest-screenshot');

describe('booking test', () => {
    setupJestScreenshot();
    let originalTimeout;

    // 일부 이미지 처리에는 시간이 걸리 수 있으므로 기본 간격을 10초로 연장
    // 빠른 컴퓨터 or 서버에서 실행하는 경우에는 필요 없음
    beforeEach(function() {
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jest.DEFAULT_TIMEOUT_INTERVAL = 10000;
    })

    // 기본 간격 시간 jest 디폴트 타임으로 설정
    afterEach(function() {
        jest.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    })

    it('예약 서비스 홈 확인', async () => {
      // puppeteer 셋팅
      const browser = await puppeteer.launch({headless:false});
      const page = await browser.newPage();
      await page.setViewport({width: 1920, height: 1080});
      await page.goto('https://booking.naver.com/booking/3/bizes/70814', { waitUntil: 'networkidle0' });

      await browser.close();
    })
  })
