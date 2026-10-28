// Run with: node test/gallery_upload_test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const template = fs.readFileSync(path.join(root, 'app/views/manage/cms_pages/_upload_image.html.erb'), 'utf8');
const script = template.slice(template.lastIndexOf('<script>') + 8, template.lastIndexOf('</script>'));

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function dialog() {
  const elements = {};
  for (const id of ['upload-image-form', 'upload-gallery-form', 'upload-image-next-button',
    'upload-image-finish-button', 'file_data', 'gallery_file_data', 'upload-gallery-next-button',
    'next_clicked', 'dirname', 'mainform_gallery', 'insert_image_dialog_content', 'gallery-upload-status']) {
    elements[id] = {
      dataset: {}, value: 'Next', disabled: false, files: [{}], textContent: '',
      action: '/' + id, events: {},
      addEventListener(type, callback) { this.events[type] = callback; }
    };
  }
  const requests = [];
  const rendered = [];
  vm.runInNewContext(script, {
    document: { getElementById: id => elements[id] },
    FormData: function (form) { this.form = form; },
    fetch(url, options) {
      const request = deferred();
      requests.push({ url, options, ...request });
      return request.promise;
    },
    ImagineCms: { Editor: { csrfToken: () => 'csrf-token' } },
    setImagineDialogContent: (target, html) => rendered.push({ target, html }),
    setTimeout
  });
  return {
    elements, requests, rendered,
    button: elements['upload-gallery-next-button'],
    status: elements['gallery-upload-status'],
    submit: () => elements['upload-gallery-form'].events.submit({ preventDefault() {} })
  };
}
const response = (extra = {}) => ({ ok: true, json: async () => ({ filename: 'gallery_1' }), text: async () => '<h3>Gallery Setup</h3>', ...extra });
const tick = () => new Promise(resolve => setImmediate(resolve));

async function run() {
  const active = dialog();
  const uploading = active.submit();
  assert.strictEqual(active.button.disabled, true);
  assert.strictEqual(active.button.value, 'Uploading...');
  assert.match(active.status.textContent, /Please wait/);
  await active.submit();
  assert.strictEqual(active.requests.length, 1, 'repeat submit must not upload twice');
  active.requests[0].resolve(response());
  await tick();
  assert.strictEqual(active.requests.length, 2);
  assert.strictEqual(active.requests[1].options.method, 'POST');
  assert.strictEqual(active.requests[1].options.headers['X-CSRF-Token'], 'csrf-token');
  assert.strictEqual(active.elements.dirname.value, 'gallery_1');
  assert.strictEqual(active.button.disabled, true, 'remain disabled through gallery setup');
  await active.submit();
  assert.strictEqual(active.requests.length, 2);
  active.requests[1].resolve(response());
  await uploading;
  assert.strictEqual(active.rendered.length, 1);

  const empty = dialog();
  empty.elements.gallery_file_data.files = [];
  await empty.submit();
  assert.strictEqual(empty.requests.length, 0);
  assert.strictEqual(empty.button.disabled, false);
  assert.match(empty.status.textContent, /Select a ZIP/);

  for (const fail of [
    req => req.reject(new Error('Network unavailable')),
    req => req.resolve(response({ ok: false })),
    req => req.resolve(response({ json: async () => { throw new Error('Invalid JSON'); } })),
    req => req.resolve(response({ json: async () => ({}) }))
  ]) {
    const failed = dialog();
    const pending = failed.submit();
    fail(failed.requests[0]);
    await pending;
    assert.strictEqual(failed.button.disabled, false);
    assert.strictEqual(failed.button.value, 'Next');
    assert.ok(failed.status.textContent);
    assert.strictEqual(failed.rendered.length, 0);
    const retry = failed.submit();
    assert.strictEqual(failed.requests.length, 2, 'failure must allow retry');
    failed.requests[1].resolve(response({ ok: false }));
    await retry;
  }

  const setupFailure = dialog();
  const preparing = setupFailure.submit();
  setupFailure.requests[0].resolve(response());
  await tick();
  setupFailure.requests[1].resolve(response({ ok: false }));
  await preparing;
  assert.strictEqual(setupFailure.rendered.length, 0, 'do not render a failed setup response');
  assert.strictEqual(setupFailure.button.disabled, false);
  assert.match(setupFailure.status.textContent, /setup failed/);

  // Render the link attributes with Rails in gallery_upload_test.rb, then exercise
  // the actual delegated click handler here with those data attributes.
  const core = fs.readFileSync(path.join(root, 'app/assets/javascripts/imagine_cms/core.js'), 'utf8');
  const click = core.slice(core.indexOf("document.addEventListener('click', function (event) {"), core.indexOf("document.addEventListener('submit', function (event) {"));
  let handler, sent;
  vm.runInNewContext(click, {
    document: { addEventListener: (type, callback) => { handler = callback; } },
    imagineCmsRemoteRequest: (url, options) => { sent = options; }
  });
  handler({
    target: { closest: selector => selector === 'a[data-remote]' ? {
      href: '/manage/cms_pages/1/delete_gallery?gallery_id=gallery_1',
      dataset: { method: 'post', remote: 'true', update: 'delete_gallery_container' }
    } : null },
    preventDefault() {}
  });
  assert.strictEqual(sent.method, 'post');
  console.log('Gallery upload and delete JavaScript regression checks passed');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
