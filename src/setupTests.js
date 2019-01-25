import path from 'path';
import mkdirp from 'mkdirp';

const screenshotsPath = path.resolve(__dirname, '../testReports/screenshots');

const toFilename = (s: string) => s.replace(/[^a-z0-9.-]+/gi, '_');

export const takeScreenshot = (testName: string, pageInstance = page) => {
  mkdirp.sync(screenshotsPath);
  const filePath = path.join(
    screenshotsPath,
    toFilename(`${new Date().toISOString()}_${testName}.png`),
  );
  return pageInstance.screenshot({
    path: filePath,
  });
};

export const registerScreenshotReporter = () => {
  /**
   * jasmine reporter does not support async.
   * So we store the screenshot promise and wait for it before each test
   */
  let screenshotPromise: Promise<any> = Promise.resolve();
  beforeEach(() => screenshotPromise);
  afterAll(() => screenshotPromise);

  /**
   * Take a screenshot on Failed test.
   * Jest standard reporters run in a separate process so they don't have
   * access to the page instance. Using jasmine reporter allows us to
   * have access to the test result, test name and page instance at the same time.
   */
  (jasmine as any).getEnv().addReporter({
    specDone: async (result: any) => {
      if (result.status === 'failed') {
        screenshotPromise = screenshotPromise
          .catch()
          .then(() => takeScreenshot(result.fullName));
      }
    },
  });
};