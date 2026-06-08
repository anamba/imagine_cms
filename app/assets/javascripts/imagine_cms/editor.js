(function (window, document) {
  "use strict";

  var ImagineCms = window.ImagineCms = window.ImagineCms || {};
  var activeEditor = null;
  var dirty = false;
  var unloadHandler = null;
  var resizeNudgeTimer = null;

  function csrfToken() {
    var meta = document.querySelector("meta[name='csrf-token']");
    return meta ? meta.getAttribute("content") : "";
  }

  function setDirty(value) {
    dirty = value;
  }

  function warnAboutUnsavedChanges(event) {
    if (!dirty) return;

    var message = "This page is asking you to confirm that you want to leave - data you have entered may not be saved.";
    event.preventDefault();
    event.returnValue = message;
    return message;
  }

  function syncEditors() {
    if (window.hugerte && hugerte.triggerSave) hugerte.triggerSave();

    Array.prototype.forEach.call(document.querySelectorAll(".imagine-cms-rte"), function (element) {
      var textarea = document.getElementById(element.dataset.textareaId);
      var editor = editorForElement(element);
      if (!textarea) return;

      textarea.value = editor ? editor.getContent() : element.innerHTML;
    });
  }

  function editorForElement(element) {
    if (!window.hugerte || !element) return null;
    return hugerte.get(element.id);
  }

  function currentEditor() {
    if (activeEditor) return activeEditor;
    if (window.hugerte && hugerte.activeEditor) return hugerte.activeEditor;

    var element = document.querySelector(".imagine-cms-rte");
    return editorForElement(element);
  }

  function selectedHtml(editor) {
    if (!editor || !editor.selection) return "";
    return editor.selection.getContent({ format: "html" });
  }

  function selectedText(editor) {
    if (!editor || !editor.selection) return "";
    return editor.selection.getContent({ format: "text" });
  }

  function insertHtml(html) {
    var editor = currentEditor();
    if (!editor) return false;

    editor.focus();
    editor.insertContent(html);
    setDirty(true);
    return true;
  }

  function nudgeToolbarLayout() {
    window.clearTimeout(resizeNudgeTimer);
    resizeNudgeTimer = window.setTimeout(function () {
      window.dispatchEvent(new Event("resize"));
    }, 30);
  }

  function isScrollable(element) {
    var style = window.getComputedStyle(element);
    return /(auto|scroll|overlay)/.test(style.overflow + style.overflowX + style.overflowY);
  }

  function bindScrollNudges(element) {
    var current = element.parentElement;

    while (current && current !== document.body) {
      if (isScrollable(current) && !current.dataset.imagineCmsResizeNudge) {
        current.dataset.imagineCmsResizeNudge = "true";
        current.addEventListener("scroll", nudgeToolbarLayout, { passive: true });
      }
      current = current.parentElement;
    }

    if (!document.documentElement.dataset.imagineCmsResizeNudge) {
      document.documentElement.dataset.imagineCmsResizeNudge = "true";
      window.addEventListener("scroll", nudgeToolbarLayout, { passive: true });
    }
  }

  function buildToolbar(pageId) {
    var base = "undo redo | blocks | bold italic underline strikethrough removeformat | " +
      "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
      "link table cmsimage filelink code";

    return base;
  }

  function initEditors() {
    var regions = Array.prototype.slice.call(document.querySelectorAll(".imagine-cms-rte"));
    if (regions.length === 0 || !window.hugerte) return;

    regions.forEach(function (region) {
      if (!region.id) region.id = "imagine-cms-rte-" + Math.random().toString(36).slice(2);
    });

    hugerte.init({
      selector: ".imagine-cms-rte",
      inline: true,
      // ui_mode: "split" fixes scroll-container popups, but breaks our sticky CMS toolbar.
      promotion: false,
      branding: false,
      menubar: false,
      toolbar_mode: "sliding",
      toolbar_sticky: true,
      toolbar_sticky_offset: 52,
      plugins: "autolink code image link lists quickbars searchreplace table",
      toolbar: buildToolbar(),
      quickbars_selection_toolbar: "bold italic underline | link | blocks | bullist numlist",
      quickbars_insert_toolbar: "cmsimage filelink table",
      extended_valid_elements: "*[*]",
      valid_children: "+body[style|script],+div[style|script]",
      convert_urls: false,
      entity_encoding: "raw",
      setup: function (editor) {
        editor.on("focus", function () {
          activeEditor = editor;
          nudgeToolbarLayout();
        });
        editor.on("init", function () {
          bindScrollNudges(editor.getElement());
        });
        editor.on("change input undo redo setcontent", function () {
          setDirty(true);
          var textarea = document.getElementById(editor.getElement().dataset.textareaId);
          if (textarea) {
            textarea.value = editor.getContent();
            textarea.dispatchEvent(new CustomEvent("imagine-cms:content-change", { bubbles: true }));
          }
        });
        editor.ui.registry.addButton("cmsimage", {
          text: "Image",
          tooltip: "Insert image",
          onAction: function () {
            if (window.insertImage) window.insertImage(editor.getElement().dataset.uploadImageUrl);
          }
        });
        editor.ui.registry.addButton("filelink", {
          text: "File",
          tooltip: "Create download link",
          onAction: function () {
            if (window.insertFile) window.insertFile(editor.getElement().dataset.uploadFileUrl);
          }
        });
      }
    });
  }

  function initEditForm() {
    var form = document.getElementById("page_content_form");
    if (!form) return;

    unloadHandler = warnAboutUnsavedChanges;
    window.addEventListener("beforeunload", unloadHandler);

    form.addEventListener("submit", function () {
      syncEditors();
      setDirty(false);
      window.removeEventListener("beforeunload", unloadHandler);
    });

    document.addEventListener("keydown", function (event) {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        syncEditors();
        setDirty(false);
        window.removeEventListener("beforeunload", unloadHandler);
        form.submit();
      }
    });
  }

  function cancelEdit(url) {
    if (!dirty || window.confirm("Are you sure you want to throw away any changes to this page since your last save?")) {
      setDirty(false);
      if (unloadHandler) window.removeEventListener("beforeunload", unloadHandler);
      window.location.href = url;
    }
  }

  function submitEditForm() {
    var form = document.getElementById("page_content_form");
    if (!form) return;

    syncEditors();
    setDirty(false);
    if (unloadHandler) window.removeEventListener("beforeunload", unloadHandler);
    form.submit();
  }

  ImagineCms.Editor = {
    init: function () {
      initEditors();
      initEditForm();
    },
    sync: syncEditors,
    insertHtml: insertHtml,
    getSelectedHtml: function () { return selectedHtml(currentEditor()); },
    getSelectedText: function () { return selectedText(currentEditor()); },
    submitEditForm: submitEditForm,
    cancelEdit: cancelEdit,
    setDirty: setDirty,
    csrfToken: csrfToken
  };
})(window, document);
