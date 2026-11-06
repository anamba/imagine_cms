(function (window, document) {
  "use strict";
  var api = document.modelContext;
  if (window !== window.top || !api || typeof api.registerTool !== "function") return;
  var initialized = false;

  function start() {
    var toolbar = document.querySelector("[data-imagine-agent-page]");
    if (!toolbar || initialized) return;
    initialized = true;
    var pageId = toolbar.dataset.imagineAgentPage;
    var endpoint = "/manage/cms_pages/" + pageId + "/agent/";
    var editing = !!document.getElementById("page_content_form");
    var state = { working: {}, context: null, pending: null, retained: null, retainedHead: null, generation: 0, busy: false };
    var panel = document.createElement("section");
    panel.className = "imagine-cms-agent imagine-cms-toolbar";
    panel.setAttribute("aria-label", "Agent editing review");
    panel.innerHTML = '<div class="imagine-cms-toolbar__inner"><span role="status" aria-live="polite"></span><div data-agent-actions></div></div>';
    document.body.appendChild(panel);
    var status = panel.querySelector("[role=status]");
    var actions = panel.querySelector("[data-agent-actions]");

    function message(text) { status.textContent = text; }
    function button(label, handler, primary) {
      var element = document.createElement("button");
      element.type = "button";
      element.className = "imagine-cms-toolbar__button" + (primary ? " imagine-cms-toolbar__button--primary" : "");
      element.textContent = label;
      element.addEventListener("click", async function () {
        if (state.busy) return;
        state.busy = true;
        element.disabled = true;
        try { await handler(); } catch (error) { message(error.message); }
        finally { state.busy = false; element.disabled = false; }
      });
      actions.appendChild(element);
    }
    function csrf() {
      var meta = document.querySelector('meta[name="csrf-token"]');
      return state.context ? state.context.csrf_token : (meta ? meta.content : "");
    }
    async function request(operation, data) {
      var response = await fetch(endpoint + operation, {
        method: data === undefined ? "GET" : "POST", credentials: "same-origin",
        headers: { "Accept": "application/json", "Content-Type": "application/json", "X-CSRF-Token": csrf() },
        body: data === undefined ? undefined : JSON.stringify(data)
      });
      var result;
      try { result = await response.json(); } catch (_) { throw new Error("The CMS could not complete the request. Your unsaved changes are retained."); }
      if (!response.ok) throw new Error(result.error || "The request failed. Your unsaved changes are retained.");
      return result;
    }
    function readWorking() {
      if (editing && !state.retained) {
        if (window.ImagineCms && ImagineCms.Editor) ImagineCms.Editor.sync();
        new FormData(document.getElementById("page_content_form")).forEach(function (value, name) {
          var match = /^page_objects\[(obj-(?:text|string|page_list)-.+)\]$/.exec(name);
          if (match && typeof value === "string") state.working[match[1]] = value;
        });
      }
      return Object.assign({}, state.working);
    }
    function dirty() {
      if (!state.context) return false;
      return Object.keys(state.working).some(function (key) {
        var source = state.context.sources.find(function (item) { return item.id === key; });
        return state.working[key] !== String(source ? source.content || "" : "");
      });
    }
    function parsedBody(html) {
      var parsed = new DOMParser().parseFromString(html, "text/html");
      parsed.querySelectorAll("script, #imagine_cms-toolbar, #imagine-cms-toolbar-host, .imagine-cms-agent").forEach(function (node) { node.remove(); });
      return parsed.body;
    }
    function setHead(html) {
      var proposed = new DOMParser().parseFromString(html, "text/html");
      // Keep scripts and their runtime alive; replace visible document metadata
      // and styling. Script execution is not needed to preview editorial HTML.
      Array.from(document.head.children).forEach(function (node) {
        if (node.tagName !== "SCRIPT") node.remove();
      });
      Array.from(proposed.head.children).forEach(function (node) {
        if (node.tagName !== "SCRIPT") document.head.appendChild(document.importNode(node, true));
      });
    }
    function showPreview(html) {
      if (state.retained) restore();
      state.retained = document.createDocumentFragment();
      state.retainedHead = Array.from(document.head.childNodes);
      setHead(html);
      Array.from(document.body.childNodes).forEach(function (node) {
        if (node !== panel) state.retained.appendChild(node);
      });
      var body = parsedBody(html);
      while (body.firstChild) document.body.insertBefore(document.importNode(body.firstChild, true), panel), body.firstChild.remove();
      document.body.classList.add("imagine-cms-agent-preview");
    }
    function restore() {
      if (!state.retained) return;
      Array.from(document.body.childNodes).forEach(function (node) { if (node !== panel) node.remove(); });
      document.body.insertBefore(state.retained, panel);
      document.head.replaceChildren.apply(document.head, state.retainedHead);
      state.retainedHead = null;
      state.retained = null;
      document.body.classList.remove("imagine-cms-agent-preview");
    }
    function replaceWorkingView(html) {
      setHead(html);
      // Keep the authenticated toolbar and review controls alive across renders.
      var toolbarNode = document.getElementById("imagine_cms-toolbar");
      if (toolbarNode) toolbarNode.remove();
      Array.from(document.body.childNodes).forEach(function (node) { if (node !== panel) node.remove(); });
      if (toolbarNode) document.body.insertBefore(toolbarNode, panel);
      var body = parsedBody(html);
      while (body.firstChild) document.body.insertBefore(document.importNode(body.firstChild, true), panel), body.firstChild.remove();
    }
    function applyToEditor(changes) {
      changes.forEach(function (change) {
        var fields = Array.from(document.querySelectorAll("[name]")).filter(function (node) {
          return node.name === "page_objects[" + change.source_id + "]";
        });
        var field = fields[0];
        if (!field) throw new Error("This source is not available in the open editor. Switch to preview mode to edit it.");
        var region = document.querySelector('[data-textarea-id="' + field.id + '"]');
        var editor = region && window.hugerte ? hugerte.get(region.id) : null;
        if (editor) editor.undoManager.transact(function () { editor.setContent(change.content); });
        var choices = fields.filter(function (node) { return node.type === "checkbox" || node.type === "radio"; });
        if (choices.length) {
          choices.forEach(function (node) {
            node.checked = node.value === change.content;
            node.dispatchEvent(new Event("change", { bubbles: true }));
          });
        } else {
          field.value = change.content;
        }
        field.dispatchEvent(new CustomEvent("imagine-cms:content-change", { bubbles: true }));
      });
      if (window.ImagineCms && ImagineCms.Editor) ImagineCms.Editor.setDirty(true);
    }
    function idle() {
      actions.replaceChildren();
      message(dirty() ? "Applied changes are not saved." : "Agent editing ready.");
      if (!editing && dirty()) {
        button("Save", async function () {
          var result = await request("save", { working: readWorking(), base: state.context.base });
          state.context.base = result.base;
          state.context.sources = result.sources;
          state.working = {};
          replaceWorkingView(result.preview);
          idle();
          message("Page saved.");
        }, true);
        button("Discard changes", async function () {
          if (!window.confirm("Discard all unsaved page content changes?")) return;
          var result = await request("preview", { working: {} });
          state.working = {};
          state.generation++;
          replaceWorkingView(result.preview);
          idle();
        });
      }
    }
    async function propose(input) {
      if (state.pending || state.busy) throw new Error("Review the current proposal first, then request the next change.");
      if (editing && input.changes.some(function (change) {
        var source = state.context.sources.find(function (item) { return item.id === change.source_id; });
        return source && source.category === "immediate";
      })) throw new Error("Use preview mode to change page properties, templates, or snippets. Edit mode applies content to the open editor.");
      var working = readWorking();
      var generation = state.generation;
      state.busy = true;
      var result;
      try { result = await request("propose", Object.assign({}, input, { working: working, base: state.context.base })); }
      finally { state.busy = false; }
      if (generation !== state.generation || JSON.stringify(readWorking()) !== JSON.stringify(working)) {
        await request("discard", { proposal_id: result.id });
        throw new Error("Working content changed during preview. Request a fresh proposal.");
      }
      state.pending = result;
      showPreview(result.preview);
      actions.replaceChildren();
      message((result.warnings || []).concat([result.category === "staged" ? "Preview only. Apply adds this to unsaved page content." : "Preview only. Save change saves this source immediately."]).join(" "));
      button(result.category === "staged" ? "Apply" : "Save change", async function () {
        // Compare against canonical editor input, restored before endpoint acceptance.
        restore();
        var now = readWorking();
        if (editing && result.category === "staged") {
          result.changes.forEach(function (change) {
            if (!Array.from(document.querySelectorAll("[name]")).some(function (node) { return node.name === "page_objects[" + change.source_id + "]"; })) {
              throw new Error("Open this source in preview mode before applying.");
            }
          });
        }
        var accepted = await request("accept", { proposal_id: result.id, working: now });
        state.pending = null;
        state.generation++;
        if (accepted.saved) {
          state.context.base = accepted.base;
          state.context.sources = accepted.sources;
          if (!editing) replaceWorkingView(accepted.preview);
          else message("Source saved. Save or discard your page content before reloading the updated structure.");
        } else {
          state.working = accepted.working;
          if (editing) applyToEditor(accepted.changes);
          else replaceWorkingView(accepted.preview);
        }
        idle();
      }, true);
      button("Discard", async function () {
        await request("discard", { proposal_id: result.id });
        restore();
        state.pending = null;
        idle();
      });
      return { proposal_id: result.id, category: result.category, warnings: result.warnings,
        status: "Preview is shown on the page. Wait for the user to apply/save or discard." };
    }

    request("context").then(async function (context) {
      state.context = context;
      if (editing) state.context.sources = state.context.sources.filter(function (source) { return source.category === "staged"; });
      readWorking();
      if (editing) {
        window.ImagineCms.AgentEditing = { save: async function () {
          if (state.busy || state.pending) { message("Review or discard the proposal before saving."); return; }
          state.busy = true;
          try {
            var result = await request("save", { working: readWorking(), base: state.context.base });
            state.context.base = result.base;
            state.context.sources = result.sources;
            state.working = {};
            ImagineCms.Editor.setDirty(false);
            window.location.href = "/manage/cms_pages/" + pageId + "/edit_page_content?version=" + result.version;
          } catch (error) { message(error.message); }
          finally { state.busy = false; }
        } };
      }
      await api.registerTool({ name: "cms_read_page", description: "Read the current CMS page, editable sources, page-local/shared scope and save categories. Use current working content; identical text does not imply shared ownership.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true },
        execute: async function () {
          var working = readWorking();
          return { page_id: pageId, referenced_pages: state.context.referenced_pages, sources: state.context.sources.map(function (source) {
            return Object.assign({}, source, { content: Object.prototype.hasOwnProperty.call(working, source.id) ? working[source.id] : source.content });
          }) };
        } });
      await api.registerTool({ name: "cms_propose_change", description: "Propose CMS source changes for on-page human review. Never applies, saves or publishes. Stage page content/page-list configuration until Save; properties/templates/snippets save individually on user acceptance. Do not mix categories: recommend processing one first and deferring the other. State intended page-local/shared scope. Avoid introducing code with side effects; preserve existing Ruby unless the requested change requires modifying it.",
        inputSchema: { type: "object", properties: {
          requested_scope: { type: "string", enum: ["page-local", "shared"] },
          changes: { type: "array", minItems: 1, maxItems: 20, items: { type: "object", properties: {
            source_id: { type: "string" }, content: { type: "string" }
          }, required: ["source_id", "content"], additionalProperties: false } }
        }, required: ["requested_scope", "changes"], additionalProperties: false }, execute: propose });
      document.addEventListener("input", function () { state.generation++; });
      window.addEventListener("beforeunload", function (event) {
        if (!editing && dirty()) { event.preventDefault(); event.returnValue = ""; }
      });
      idle();
    }).catch(function (error) { message(error.message); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
  new MutationObserver(start).observe(document.documentElement, { childList: true, subtree: true });
})(window, document);
