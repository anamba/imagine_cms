const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../../app/assets/javascripts/imagine_cms/core.js'), 'utf8');

function harness() {
  const classes = new Set();
  const elements = {};
  for (const id of ['properties_dialog', 'page_browser_dialog', 'insert_image_dialog', 'insert_file_dialog', 'select_thumbnail_dialog', 'gallery_dialog', 'page_list_news']) {
    const title = { textContent: '' };
    elements[id] = { hidden: true, title, querySelector: () => title };
  }
  elements.link_field = { value: '' };
  elements.page_browser_selection = { value: '' };
  const requests = [], alerts = [];
  const context = {
    window: {},
    document: { addEventListener() {}, getElementById: id => elements[id],
      documentElement: { classList: { add: c => classes.add(c), remove: c => classes.delete(c) } } },
    jQuery: () => ({ ready() {} }),
    alert: message => alerts.push(message), encodeURIComponent
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  context.ajaxLoadInto = (id, url) => { requests.push([id, url]); };
  return { context, elements, classes, requests, alerts };
}

test('CMS dialogs open and close without a toolkit, preserving nested dialogs', () => {
  const { context: c, elements: e, classes } = harness();
  c.showImagineCmsDialog('properties_dialog', 'New page');
  assert.equal(e.properties_dialog.hidden, false);
  assert.equal(e.properties_dialog.title.textContent, 'New page');
  assert.ok(classes.has('imagine-cms-dialog-open'));
  c.showImagineCmsDialog('page_browser_dialog');
  assert.equal(e.properties_dialog.hidden, true);
  assert.equal(e.page_browser_dialog.hidden, false);
  c.hideImagineCmsDialog('page_browser_dialog');
  assert.equal(e.page_browser_dialog.hidden, true);
  assert.equal(e.properties_dialog.hidden, false);
  assert.ok(classes.has('imagine-cms-dialog-open'));
  c.hideImagineCmsDialog('properties_dialog');
  assert.equal(e.properties_dialog.hidden, true);
  assert.equal(classes.size, 0);
  assert.equal(c.showImagineCmsDialog('missing'), false);
});

test('image, thumbnail, gallery and page-list dialogs use CMS-owned elements', () => {
  const { context: c, elements: e, requests } = harness();
  c.insertImage('/images');
  assert.deepEqual(requests[0], ['insert_image_dialog_content', '/images']);
  assert.equal(e.insert_image_dialog.hidden, false);
  c.cancelInsertImage();
  c.selectThumbnail('/thumbnails');
  assert.deepEqual(requests[1], ['select_thumbnail_dialog_content', '/thumbnails']);
  c.cancelSelectThumbnail();
  for (const id of ['gallery_dialog', 'page_list_news']) {
    c.showImagineCmsDialog(id); assert.equal(e[id].hidden, false);
    c.hideImagineCmsDialog(id); assert.equal(e[id].hidden, true);
  }
});

test('file links use the HugeRTE selection and reject an empty selection', () => {
  const { context: c, elements: e, requests, alerts } = harness();
  c.insertFile('/files');
  assert.equal(requests.length, 0);
  assert.equal(alerts.length, 1);
  c.ImagineCms = c.window.ImagineCms = { Editor: { getSelectedText: () => 'Download' } };
  c.insertFile('/files');
  assert.deepEqual(requests[0], ['insert_file_dialog_content', '/files']);
  assert.equal(e.insert_file_dialog.hidden, false);
  c.cancelInsertFile();
  assert.equal(e.insert_file_dialog.hidden, true);
});

test('page browser returns the selected path to the requesting field', () => {
  const { context: c, elements: e } = harness();
  c.showPageBrowser('link_field');
  assert.equal(e.page_browser_dialog.hidden, false);
  e.page_browser_selection.value = 'about/contact';
  c.closePageBrowser();
  assert.equal(e.link_field.value, 'about/contact');
  assert.equal(e.page_browser_dialog.hidden, true);
});
