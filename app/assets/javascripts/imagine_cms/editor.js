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

      if (editor) {
        if (editor._imagineCmsContentChanged) textarea.value = editor.getContent();
      } else {
        textarea.value = element.innerHTML;
      }
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

  function visibleInlineToolbar() {
    var toolbars = document.querySelectorAll(
      ".tox.tox-hugerte-inline, .tox.tox-tinymce-inline"
    );

    return Array.prototype.find.call(toolbars, function (toolbar) {
      var style = window.getComputedStyle(toolbar);
      var bounds = toolbar.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && bounds.width > 0;
    });
  }

  function alignActiveToolbar() {
    if (!activeEditor) return;

    var toolbar = visibleInlineToolbar();
    var activeElement = activeEditor.getElement();
    if (!toolbar || !activeElement) return;

    var regions = Array.prototype.map.call(
      document.querySelectorAll(".imagine-cms-rte"),
      function (region) { return region.getBoundingClientRect(); }
    ).filter(function (bounds) {
      return bounds.width > 0 && bounds.height > 0;
    });
    if (regions.length === 0) return;

    var left = Math.min.apply(null, regions.map(function (bounds) { return bounds.left; }));
    var right = Math.max.apply(null, regions.map(function (bounds) { return bounds.right; }));
    var activeBounds = activeElement.getBoundingClientRect();
    var toolbarPosition = window.getComputedStyle(toolbar).position;
    var documentOffset = toolbarPosition === "fixed" ? 0 : window.scrollX;

    toolbar.style.setProperty(
      "--imagine-cms-rte-toolbar-left",
      Math.round(left + documentOffset) + "px"
    );
    toolbar.style.setProperty(
      "--imagine-cms-rte-toolbar-width",
      Math.round(right - left) + "px"
    );
    toolbar.classList.add("imagine-cms-rte-toolbar");
    toolbar.classList.toggle(
      "imagine-cms-rte-toolbar--right",
      activeBounds.left > left + ((right - left) / 2)
    );
  }

  function nudgeToolbarLayout() {
    window.clearTimeout(resizeNudgeTimer);
    resizeNudgeTimer = window.setTimeout(function () {
      // HugeRTE decides which toolbar groups fit when it handles resize.
      // Apply our cross-column width first so the initial focus is measured
      // against the final toolbar size rather than the editor column width.
      alignActiveToolbar();
      window.dispatchEvent(new Event("resize"));
      window.requestAnimationFrame(function () {
        alignActiveToolbar();
        window.dispatchEvent(new Event("resize"));
        window.requestAnimationFrame(alignActiveToolbar);
      });
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
      window.addEventListener("resize", function () {
        window.requestAnimationFrame(alignActiveToolbar);
      });
    }
  }

  function buildToolbar(pageId) {
    var base = "undo redo | blocks | bold italic underline strikethrough removeformat | " +
      "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
      "cmslink table cmsimage filelink code";

    return base;
  }

  function selectedLink(editor) {
    return editor.dom.getParent(editor.selection.getStart(), "a[href]", editor.getBody());
  }

  function optionalAttribute(element, name) {
    return element ? (element.getAttribute(name) || "") : "";
  }

  function linkRelForTarget(existingRel, target) {
    var rels = (existingRel || "").split(/\s+/).filter(Boolean);
    var noopenerIndex = rels.indexOf("noopener");

    if (target === "_blank" && noopenerIndex === -1) rels.push("noopener");
    if (target !== "_blank" && noopenerIndex !== -1) rels.splice(noopenerIndex, 1);

    return rels.join(" ");
  }

  function openLinkDialog(editor) {
    var anchor = selectedLink(editor);
    var selectedText = editor.selection.getContent({ format: "text" });
    var initialText = anchor ? (anchor.textContent || "") : selectedText;
    var initialHref = optionalAttribute(anchor, "data-mce-href") ||
      optionalAttribute(anchor, "href");

    editor.windowManager.open({
      title: "Insert/Edit Link",
      size: "normal",
      body: {
        type: "panel",
        items: [
          { name: "url", type: "urlinput", filetype: "file", label: "URL" },
          { name: "text", type: "input", label: "Text to display" },
          { name: "title", type: "input", label: "Title" },
          {
            name: "target",
            type: "selectbox",
            label: "Open link in...",
            items: [
              { text: "Current window", value: "" },
              { text: "New window", value: "_blank" }
            ]
          },
          { name: "linkClass", type: "input", label: "Class" }
        ]
      },
      buttons: [
        { type: "cancel", name: "cancel", text: "Cancel" },
        { type: "submit", name: "save", text: "Save", primary: true }
      ],
      initialData: {
        url: { value: initialHref, meta: { original: { value: initialHref } } },
        text: initialText,
        title: optionalAttribute(anchor, "title"),
        target: optionalAttribute(anchor, "target"),
        linkClass: optionalAttribute(anchor, "class")
      },
      onSubmit: function (dialog) {
        var data = dialog.getData();
        var href = data.url && data.url.value ? data.url.value : "";

        editor.undoManager.transact(function () {
          if (!href) {
            if (anchor) {
              editor.selection.select(anchor);
              editor.execCommand("unlink");
            }
            return;
          }

          var attributes = {
            href: href,
            title: data.title || null,
            target: data.target || null,
            rel: linkRelForTarget(optionalAttribute(anchor, "rel"), data.target) || null,
            class: data.linkClass.trim() || null
          };

          if (anchor) {
            if (data.text !== initialText) anchor.textContent = data.text || href;
            editor.dom.setAttribs(anchor, attributes);
            editor.selection.select(anchor);
          } else if (data.text !== initialText || editor.selection.isCollapsed()) {
            editor.insertContent(
              editor.dom.createHTML("a", attributes, editor.dom.encode(data.text || href))
            );
          } else {
            editor.execCommand("mceInsertLink", false, attributes);
          }
        });

        editor.focus();
        dialog.close();
      }
    });
  }

  function cmsProtectedPatterns() {
    return [
      /<#[\s\S]*?#>/g,
      /<%[\s\S]*?%>/g
    ];
  }

  function encodeCmsToken(value) {
    return encodeURIComponent(value)
      .replace(/_/g, "%5F")
      .replace(/'/g, "%27");
  }

  function decodeCmsToken(value) {
    return decodeURIComponent(value);
  }

  function cmsTokenSentinel(token) {
    return "__IMAGINE_CMS_TOKEN_" + encodeCmsToken(token) + "__";
  }

  function cmsTokenSentinelPattern() {
    return /__IMAGINE_CMS_TOKEN_([A-Za-z0-9%.!~*()-]+)__/g;
  }

  function cmsTokenElement(token, block) {
    var element = document.createElement(block ? "div" : "span");

    element.className = "imagine-cms-protected-token";
    element.setAttribute("data-imagine-cms-token", encodeCmsToken(token));
    element.setAttribute("contenteditable", "false");
    element.textContent = token;
    return element;
  }

  function renderCmsProtectedTokens(content) {
    if (typeof content !== "string") return content;

    var container = document.createElement("div");
    var markedContent = content.replace(
      /<#[\s\S]*?#>|<%[\s\S]*?%>/g,
      cmsTokenSentinel
    );

    container.innerHTML = markedContent;
    var walker = document.createTreeWalker(
      container,
      window.NodeFilter.SHOW_TEXT
    );
    var textNodes = [];
    var textNode;

    while ((textNode = walker.nextNode())) {
      if (textNode.nodeValue.indexOf("__IMAGINE_CMS_TOKEN_") !== -1) {
        textNodes.push(textNode);
      }
    }

    textNodes.forEach(function (node) {
      var value = node.nodeValue;
      var pattern = cmsTokenSentinelPattern();
      var standalone = node.parentNode === container &&
        value.replace(pattern, "").trim() === "";
      var fragment = document.createDocumentFragment();
      var lastIndex = 0;
      var match;

      pattern.lastIndex = 0;
      while ((match = pattern.exec(value))) {
        if (match.index > lastIndex) {
          fragment.appendChild(document.createTextNode(
            value.slice(lastIndex, match.index)
          ));
        }
        fragment.appendChild(cmsTokenElement(
          decodeCmsToken(match[1]),
          standalone
        ));
        lastIndex = pattern.lastIndex;
      }
      if (lastIndex < value.length) {
        fragment.appendChild(document.createTextNode(value.slice(lastIndex)));
      }

      node.parentNode.replaceChild(fragment, node);
    });

    return container.innerHTML;
  }

  function restoreCmsProtectedTokens(content) {
    if (typeof content !== "string") return content;

    var container = document.createElement("div");
    var markerPrefix = "IMAGINE_CMS_PROTECTED_" +
      Math.random().toString(36).slice(2) + "_";
    var replacements = [];

    container.innerHTML = content;
    Array.prototype.forEach.call(
      container.querySelectorAll(".imagine-cms-protected-token[data-imagine-cms-token]"),
      function (element, index) {
        var token;

        try {
          token = decodeCmsToken(element.getAttribute("data-imagine-cms-token"));
        } catch (_error) {
          return;
        }

        var marker = markerPrefix + index;
        replacements.push({ marker: marker, token: token });
        element.parentNode.replaceChild(document.createComment(marker), element);
      }
    );

    var restored = container.innerHTML;
    replacements.forEach(function (replacement) {
      restored = restored.replace(
        "<!--" + replacement.marker + "-->",
        replacement.token
      );
    });
    restored = restored.replace(
      cmsTokenSentinelPattern(),
      function (_sentinel, encodedToken) {
        return decodeCmsToken(encodedToken);
      }
    );
    return restored;
  }

  function initEditors() {
    var regions = Array.prototype.slice.call(document.querySelectorAll(".imagine-cms-rte"));
    if (regions.length === 0 || !window.hugerte) return;

    regions.forEach(function (region) {
      if (!region.id) region.id = "imagine-cms-rte-" + Math.random().toString(36).slice(2);
    });

    // Read sticky offset from config, fall back to default
    var config = window.ImagineCmsConfig || {};
    var stickyOffset = config.toolbarStickyOffset || 52;
    
    // Apply mobile offset if configured and on mobile viewport
    if (config.toolbarStickyOffsetMobile && window.innerWidth < 768) {
      stickyOffset = config.toolbarStickyOffsetMobile;
    }

    hugerte.init({
      selector: ".imagine-cms-rte",
      inline: true,
      // ui_mode: "split" fixes scroll-container popups, but breaks our sticky CMS toolbar.
      promotion: false,
      branding: false,
      menubar: false,
      toolbar_mode: "sliding",
      toolbar_sticky: true,
      toolbar_sticky_offset: stickyOffset,
      plugins: "autolink code image link lists quickbars searchreplace table",
      toolbar: buildToolbar(),
      quickbars_selection_toolbar: false,
      quickbars_insert_toolbar: false,
      extended_valid_elements: "*[*]",
      valid_children: "+body[style|script],+div[style|script]",
      convert_urls: false,
      entity_encoding: "raw",
      protect: cmsProtectedPatterns(),
      setup: function (editor) {
        // HugeRTE emits SetContent for the browser-parsed inline DOM before
        // Init. Keep the hidden textarea authoritative until raw CMS source
        // has been loaded through the protected parser.
        var hydrating = true;

        editor.on("BeforeSetContent", function (event) {
          event.content = renderCmsProtectedTokens(event.content);
        });
        editor.on("GetContent", function (event) {
          event.content = restoreCmsProtectedTokens(event.content);
        });
        editor.on("focus", function () {
          activeEditor = editor;
          nudgeToolbarLayout();
        });
        editor.on("init", function () {
          bindScrollNudges(editor.getElement());

          // Inline mode starts from browser-parsed DOM, which has already escaped
          // CMS placeholders and ERB. Rehydrate from the textarea's canonical
          // source so HugeRTE can protect those tokens before parsing them.
          var textarea = document.getElementById(editor.getElement().dataset.textareaId);
          if (textarea) {
            editor.setContent(textarea.value);
          }
          hydrating = false;
          editor._imagineCmsContentChanged = false;
        });
        editor.on("change input undo redo setcontent", function () {
          if (hydrating) return;

          setDirty(true);
          editor._imagineCmsContentChanged = true;
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
        editor.ui.registry.addToggleButton("cmslink", {
          icon: "link",
          tooltip: "Insert/edit link",
          onAction: function () {
            openLinkDialog(editor);
          },
          onSetup: function (button) {
            function updateState() {
              button.setActive(!!selectedLink(editor));
              button.setEnabled(editor.selection.isEditable());
            }

            editor.on("NodeChange", updateState);
            updateState();
            return function () {
              editor.off("NodeChange", updateState);
            };
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
