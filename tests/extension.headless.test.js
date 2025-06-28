const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

function startServer(html) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    });
    server.listen(0, () => resolve(server));
  });
}

jest.setTimeout(30000);

describe('extension in headless chrome', () => {
  let browser;
  let server;
  beforeAll(async () => {
    const html = '<!DOCTYPE html><html><body id="jira"><nav class="aui-nav-breadcrumbs"><ol><li>Home</li></ol></nav></body></html>';
    server = await startServer(html);
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    const extensionPath = path.join(__dirname, '..');
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/chromium-browser',
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
  });

  afterAll(async () => {
    await browser.close();
    server.close();
  });

  test('button appears on test page', async () => {
    const port = server.address().port;
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}/browse/TEST-1`, { waitUntil: 'networkidle0' });
    const button = await page.waitForSelector('button.copy-jira-id-button', { timeout: 5000 });
    const text = await page.evaluate(el => el.textContent, button);
    expect(text).toBe('COPY JIRA ID');
  });
});
