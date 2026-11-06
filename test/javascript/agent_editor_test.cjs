const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the actual adapter against representative form controls. This covers
// the user-visible value submitted after Apply, including Rails hidden defaults.
const source = fs.readFileSync(path.join(__dirname, '../../app/assets/javascripts/imagine_cms/agent.js'), 'utf8');
const start = source.indexOf('    function applyToEditor(changes)');
const end = source.indexOf('    function idle()', start);
assert.ok(start >= 0 && end > start);
function apply(controls, value) {
  let dirty = false;
  const ImagineCms = { Editor: { setDirty: value => { dirty = value; } } };
  const context = {
    document: { querySelectorAll: () => controls, querySelector: () => null },
    window: { ImagineCms }, ImagineCms,
    Event: class { constructor(type) { this.type = type; } },
    CustomEvent: class { constructor(type) { this.type = type; } }
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  context.applyToEditor([{ source_id: 'obj-page_list-news-setting', content: value }]);
  assert.equal(dirty, true);
}
function control(type, value, checked = false) {
  return { type, value, checked, id: 'field', name: 'page_objects[obj-page_list-news-setting]', dispatchEvent() {} };
}
function submitted(controls) {
  return controls.filter(c => !['checkbox', 'radio'].includes(c.type) || c.checked).at(-1)?.value;
}
test('Apply clears a checked checkbox and preserves the hidden false fallback', () => {
  const controls = [control('hidden', 'false'), control('checkbox', 'true', true)];
  apply(controls, 'false');
  assert.equal(controls[0].value, 'false');
  assert.equal(controls[1].value, 'true');
  assert.equal(controls[1].checked, false);
  assert.equal(submitted(controls), 'false');
});
test('Apply checks a checkbox without corrupting its hidden fallback', () => {
  const controls = [control('hidden', 'false'), control('checkbox', 'true')];
  apply(controls, 'true');
  assert.equal(controls[0].value, 'false');
  assert.equal(submitted(controls), 'true');
});
test('Apply switches a radio selection while preserving option values', () => {
  const controls = [control('radio', 'list'), control('radio', 'calendar', true)];
  apply(controls, 'list');
  assert.equal(controls[0].checked, true);
  assert.equal(controls[1].checked, false);
  assert.equal(controls[1].value, 'calendar');
  assert.equal(submitted(controls), 'list');
});
test('Apply continues to replace ordinary string fields', () => {
  const controls = [control('text', 'old')];
  apply(controls, 'new');
  assert.equal(submitted(controls), 'new');
});

const discardStart = source.indexOf('    async function discardWorkingChanges()');
const discardEnd = source.indexOf('    function idle()', discardStart);
assert.ok(discardStart >= 0 && discardEnd > discardStart);
function discardHarness(request, confirmed = true) {
  const original = { sources: [{ id: 'obj-text-main', content: 'Original' }] };
  const state = { context: original, working: { 'obj-text-main': 'Unsaved draft' }, generation: 2 };
  const rendered = [];
  const context = { state, window: { confirm: () => confirmed }, request,
    replaceWorkingView: html => rendered.push(html), idle() {} };
  vm.createContext(context);
  vm.runInContext(source.slice(discardStart, discardEnd), context);
  return { state, original, rendered, discard: context.discardWorkingChanges };
}
test('Discard changes refreshes saved sources before the next proposal', async () => {
  const fresh = { sources: [{ id: 'obj-text-main', content: 'Current saved content' }], preview: '<p>Current saved content</p>' };
  const harness = discardHarness(async operation => {
    assert.equal(operation, 'context');
    return fresh;
  });
  await harness.discard();
  assert.equal(harness.state.context, fresh);
  assert.equal(Object.keys(harness.state.working).length, 0);
  assert.equal(harness.state.generation, 3);
  assert.deepEqual(harness.rendered, [fresh.preview]);
});
test('failed discard refresh retains the draft and its original context', async () => {
  const harness = discardHarness(async () => { throw new Error('Offline'); });
  await assert.rejects(harness.discard(), /Offline/);
  assert.equal(harness.state.context, harness.original);
  assert.equal(harness.state.working['obj-text-main'], 'Unsaved draft');
  assert.equal(harness.state.generation, 2);
  assert.equal(harness.rendered.length, 0);
});
test('canceling Discard changes leaves the draft alone', async () => {
  const harness = discardHarness(async () => { assert.fail('must not fetch'); }, false);
  await harness.discard();
  assert.equal(harness.state.context, harness.original);
  assert.equal(harness.state.working['obj-text-main'], 'Unsaved draft');
});

const saveStart = source.indexOf('    async function saveWorkingChanges()');
const saveEnd = source.indexOf('    function idle()', saveStart);
assert.ok(saveStart >= 0 && saveEnd > saveStart);
function saveHarness(requestUrl) {
  const state = { working: { 'obj-text-main': '<p>Applied</p>' } };
  const navigation = [];
  const context = { pageId: '42', state, readWorking: () => ({ ...state.working }), requestUrl,
    window: { location: { assign: url => navigation.push(url) } } };
  vm.createContext(context);
  vm.runInContext(source.slice(saveStart, saveEnd), context);
  return { state, navigation, save: context.saveWorkingChanges };
}
test('preview Save uses the regular content action and navigates to its saved revision', async () => {
  const harness = saveHarness(async (url, input) => {
    assert.equal(url, '/manage/cms_pages/42/edit_page_content');
    assert.equal(input.page_objects['obj-text-main'], '<p>Applied</p>');
    return { saved: true, version: 9, redirect_to: '/news/story/version/9' };
  });
  await harness.save();
  assert.equal(Object.keys(harness.state.working).length, 0);
  assert.deepEqual(harness.navigation, ['/news/story/version/9']);
});
test('failed Save preserves the working content and does not navigate', async () => {
  const harness = saveHarness(async () => { throw new Error('Save failed'); });
  await assert.rejects(harness.save(), /Save failed/);
  assert.equal(harness.state.working['obj-text-main'], '<p>Applied</p>');
  assert.equal(harness.navigation.length, 0);
});
