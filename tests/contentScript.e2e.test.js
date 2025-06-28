const fs = require('fs');
const path = require('path');

// Load the script text so we can execute it in the JSDOM environment
const scriptText = fs.readFileSync(path.join(__dirname, '..', 'contentScript.js'), 'utf8');

function loadScript(dom) {
  const scriptEl = dom.window.document.createElement('script');
  scriptEl.textContent = scriptText;
  dom.window.document.body.appendChild(scriptEl);
}

describe('contentScript end-to-end', () => {
  test('adds copy button using body id detection', () => {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM(`<!DOCTYPE html><body id="jira"><nav class="aui-nav-breadcrumbs"><ol><li>Home</li><li></li></ol></nav></body>`, {
      url: 'https://example.atlassian.net/browse/FOO-123',
      runScripts: 'dangerously'
    });

    loadScript(dom);

    const button = dom.window.document.querySelector('button.copy-jira-id-button');
    expect(button).not.toBeNull();
    expect(button.textContent).toBe('COPY JIRA ID');
  });

  test('adds copy button using meta tag detection', () => {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM(`<!DOCTYPE html><head><meta name="application-name" content="Jira"></head><body><nav class="aui-nav-breadcrumbs"><ol><li></li><li></li></ol></nav></body>`, {
      url: 'https://example.com/browse/BAR-987',
      runScripts: 'dangerously'
    });

    loadScript(dom);

    const button = dom.window.document.querySelector('button.copy-jira-id-button');
    expect(button).not.toBeNull();
  });
});
