const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const core = fs.readFileSync(path.join(__dirname, '../../app/assets/javascripts/imagine_cms/core.js'), 'utf8');
const start = core.indexOf("// Non-remote method links");
const end = core.indexOf("document.addEventListener('submit'", start);
assert.ok(start >= 0 && end > start);
const source = core.slice(start, end);

function click({ confirmed = true, remote = false, origin = 'https://example.test' } = {}) {
  let handler, submitted = false, prevented = false, prompted = false;
  const fields = [];
  const link = { href: origin + '/manage/delete_page/1', dataset: { method: 'post', confirm: 'Delete?' } };
  const document = {
    addEventListener: (_name, callback) => { handler = callback; },
    querySelector: selector => ({ content: selector.includes('csrf-param') ? 'authenticity_token' : 'token' }),
    createElement: tag => tag === 'form' ? {
      style: {}, appendChild: field => fields.push(field), submit: () => { submitted = true; }
    } : {},
    body: { appendChild: form => { assert.equal(form.method, 'post'); assert.equal(form.action, link.href); } }
  };
  vm.runInNewContext(source, { document, URL, window: {
    location: { origin: 'https://example.test' }, confirm: () => { prompted = true; return confirmed; }
  } });
  handler({ target: { closest: selector => {
    assert.equal(selector, 'a[data-method]:not([data-remote])');
    return remote ? null : link;
  } }, preventDefault: () => { prevented = true; } });
  return { submitted, prevented, prompted, fields };
}

test('method link confirms and submits POST with CSRF protection', () => {
  const result = click();
  assert.ok(result.submitted && result.prevented && result.prompted);
  assert.deepEqual(result.fields.map(field => [field.name, field.value]), [['_method', 'post'], ['authenticity_token', 'token']]);
});
test('cancelled confirmation does not submit', () => assert.equal(click({ confirmed: false }).submitted, false));
test('remote links stay with the CMS handler', () => {
  const result = click({ remote: true });
  assert.equal(result.prevented, false);
  assert.equal(result.submitted, false);
});
test('cross-origin links do not receive the CSRF token', () => {
  assert.equal(click({ origin: 'https://other.test' }).fields.length, 1);
});
