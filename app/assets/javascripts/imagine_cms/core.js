jQuery(document).ready(function () {
  window.CodemirrorInstances = [];
  jQuery('textarea.codemirror-html').each(function () {
    var cm = CodeMirror.fromTextArea(this, {
      mode: 'application/x-erb-imagine',
      lineNumbers: true
    });
    window.CodemirrorInstances.push(cm);
  })
});




/********************************
 * date picker functions        *
 ********************************/

function getElementPosition(sourceObj) {
    if (sourceObj.style.left && sourceObj.style.top) {
        // for the W3C-compliant crowd
        return [parseInt(sourceObj.style.left), parseInt(sourceObj.style.top)];
    } else {
        // for the other awful browsers...
        x = sourceObj.offsetLeft;
        y = sourceObj.offsetTop;
        temp = sourceObj;
        while (temp = temp.offsetParent) {
            x += temp.offsetLeft;
            y += temp.offsetTop;
        }
        
        return [x, y];
    }
}

function showDatePicker(object, method_prefix) {
    // anchor picker to the icon
    var coords = getElementPosition($('date_picker_' + object + '_' + method_prefix + 'icon'));
    var el = $('date_picker_' + object + '_' + method_prefix + 'main');
    el.hide();
    el.style.position = 'absolute';
    el.show();
}

function hideDatePicker(object, method_prefix) {
    $('date_picker_' + object + '_' + method_prefix + 'main').hide();
}

function dpPrevMonth(object, method_prefix, min_year) {
    try {
        if ($(object + '_' + method_prefix + '_month_sel').value > 1) {
            $(object + '_' + method_prefix + '_month_sel').value--;
        } else if ($(object + '_' + method_prefix + '_year_sel').value > min_year) {
            $(object + '_' + method_prefix + '_month_sel').value = 12;
            $(object + '_' + method_prefix + '_year_sel').value--;
        }
    } catch (e) {}
}

function dpNextMonth(object, method_prefix, max_year) {
    try {
        if ($(object + '_' + method_prefix + '_month_sel').value < 12) {
            $(object + '_' + method_prefix + '_month_sel').value++;
        } else if ($(object + '_' + method_prefix + '_year_sel').value < max_year) {
            $(object + '_' + method_prefix + '_month_sel').value = 1;
            $(object + '_' + method_prefix + '_year_sel').value++;
        }
    } catch (e) {}
}


/********************************
 * column browser interface     *
 ********************************/

var cbNumColumns = 0;
var cbColWidth = 200;
var cbColHeight = 240;

function cbAddColumn() {
    jQuery('#columnBrowser').append('<div id="columnBrowserLevel' + cbNumColumns + '" class="cb_column">Loading...</div>');
    jQuery('#columnBrowserContainer').scrollLeft(jQuery('#columnBrowserContainer')[0].scrollWidth);
    cbNumColumns++;
    jQuery('#columnBrowser').css({ width: '' + ((cbColWidth+1) * cbNumColumns) + 'px' });
}

function getScrollbarPosition(el) {
    el = $(el);
    return { x: el.scrollLeft, y: el.scrollTop };
}

function setScrollbarPosition(el, coords) {
    el = $(el);
    el.scrollLeft = coords.x;
    el.scrollTop = coords.y;
}

function cbSelectItem(el, currentLevel, urlForNextLevel) {
    var el = jQuery(el);
    // coords = getScrollbarPosition(el.parentNode);
    
    // remove all higher levels
    for (var i = currentLevel + 1; i <= cbNumColumns; i++) {
        jQuery('#columnBrowserLevel' + i).remove();
    }
    cbNumColumns = currentLevel + 1;

    // unselect all other same-level divs and select target
    // prefix = 'cb_item_';
    el.siblings().removeClass('cb_item_selected');
    el.addClass('cb_item_selected');

    // display children
    cbAddColumn();
    ajaxLoadInto('columnBrowserLevel' + (currentLevel+1), urlForNextLevel);

    // setScrollbarPosition(el.parentNode, coords);
}


/********************************
 * cms support                  *
 ********************************/

function disableEnterKey(e) {
    // get event if not passed
    if (!e) var e = window.event;
    
    var numCharCode;
    
    // get character code of key pressed
    if (e.keyCode) {
        numCharCode = e.keyCode;
    } else if (e.which) {
        numCharCode = e.which;
    }
    
    if (numCharCode == 13) {
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
        return false;
    }
}

// support for autocompletes
var attrlist = [];
var taglist = [];

var dialogStack = [];
function setImagineDialogContent(target, html) {
    target.innerHTML = html;
    Array.prototype.slice.call(target.querySelectorAll('script')).forEach(function (oldScript) {
        var newScript = document.createElement('script');
        Array.prototype.slice.call(oldScript.attributes).forEach(function (attr) {
            newScript.setAttribute(attr.name, attr.value);
        });
        newScript.appendChild(document.createTextNode(oldScript.textContent));
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

function ajaxLoadInto(targetId, url, options) {
    options = options || {};
    var target = document.getElementById(targetId);
    if (!target) return Promise.resolve(null);

    target.innerHTML = options.loading || 'Loading...';

    return fetch(url, { credentials: 'same-origin' })
        .then(function (response) { return response.text(); })
        .then(function (html) {
            setImagineDialogContent(target, html);
            return target;
        });
}

function showDojoDialog(id, titleText) {
    var dlg = document.getElementById(id);
    if (!dlg && window.dojo && dojo.widget) {
        dlg = dojo.widget.byId(id);
        if (!dlg) dlg = dojo.widget.createWidget(id);
        if (!dlg) return false;
        dlg.closeWindow = function () { hideDojoDialog(id); };
        dlg.show();
        if (dialogStack.length > 0) dojo.widget.byId(dialogStack[dialogStack.length-1]).hide();
        dialogStack.push(id);
        return true;
    }

    if (!dlg) return false;
    if (typeof(titleText) != 'undefined') {
        var title = dlg.querySelector('[data-imagine-dialog-title]');
        if (title) title.textContent = titleText;
    }

    if (dialogStack.length > 0) {
        var previous = document.getElementById(dialogStack[dialogStack.length-1]);
        if (previous) previous.hidden = true;
    }
    dlg.hidden = false;
    document.documentElement.classList.add('imagine-cms-dialog-open');
    dialogStack.push(id);
}

function hideDojoDialog(id) {
    dialogStack.pop();

    if (window.dojo && dojo.widget && dojo.widget.byId(id)) {
        dojo.widget.byId(id).hide();
    } else {
        var dlg = document.getElementById(id);
        if (dlg) dlg.hidden = true;
    }

    if (dialogStack.length > 0) {
        if (window.dojo && dojo.widget && dojo.widget.byId(dialogStack[dialogStack.length-1])) {
            dojo.widget.byId(dialogStack[dialogStack.length-1]).show();
        } else {
            var previous = document.getElementById(dialogStack[dialogStack.length-1]);
            if (previous) previous.hidden = false;
        }
    } else {
        document.documentElement.classList.remove('imagine-cms-dialog-open');
    }
}

function editProperties(url, titleText) {
    ajaxLoadInto('properties_dialog_content', url).then(function (target) {
        if (!target) return;
        var form = target.querySelector('form');
        if (!form) return;

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var submitButton = form.querySelector('[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.value = 'Saving...';
            }

            fetch(form.action, {
                method: form.method || 'POST',
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-Token': ImagineCms.Editor.csrfToken(),
                    'Accept': 'text/javascript, text/html, */*'
                },
                body: new FormData(form)
            })
                .then(function (response) { return response.text(); })
                .then(function (script) {
                    if (script) (0, eval)(script);
                })
                .catch(function (error) {
                    var errors = document.getElementById('save_errors');
                    if (errors) errors.innerHTML = error.message;
                })
                .finally(function () {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.value = 'Save';
                    }
                });
        });
    });
    showDojoDialog('properties_dialog', titleText);
}

function cancelEditProperties() {
    hideDojoDialog('properties_dialog');
}

function insertImage(url) {
    if (window.dojo && dojo.widget) {
        var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
        imageNode = dojo.withGlobal(curInst.window, "getSelectedElement", dojo.html.selection);
        if (!imageNode) {
            imageNode = dojo.withGlobal(curInst.window, "getAncestorElement", dojo.html.selection, ['img']);
        }
        if (imageNode) {
            dojo.require("dojo.widget.Editor2Plugin.InsertImageDialog");
            w = dojo.widget.createWidget("Editor2InsertImageDialog");
            w.show();
            return true;
        }
    }

    ajaxLoadInto('insert_image_dialog_content', url);
    showDojoDialog('insert_image_dialog');
    try { if (cropper) cropper.remove(); } catch (e) {}
}

function cancelInsertImage() {
    hideDojoDialog('insert_image_dialog');
    try { if (cropper) cropper.remove(); } catch (e) {}
}

function insertFile(url) {
    var html = '';
    if (window.dojo && dojo.widget) {
        var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
        curInst.saveSelection(); //save selection (none-activeX IE)
        html = dojo.withGlobal(curInst.window, "getSelectedText", dojo.html.selection);
    } else if (window.ImagineCms && ImagineCms.Editor) {
        html = ImagineCms.Editor.getSelectedText();
    }

    if (html == null || html.length == 0) {
        alert("Please select some text to create a file link.");
        return false; //do not show the dialog
    }

    ajaxLoadInto('insert_file_dialog_content', url);
    showDojoDialog('insert_file_dialog');
}

function cancelInsertFile() {
    hideDojoDialog('insert_file_dialog');
}

function selectThumbnail(url) {
    ajaxLoadInto('select_thumbnail_dialog_content', url);
    showDojoDialog('select_thumbnail_dialog');
}

function cancelSelectThumbnail() {
    hideDojoDialog('select_thumbnail_dialog');
}

if (!window.gallerySize) window.gallerySize = {};
function changeGalleryImage(galleryName, index) {
    var target = galleryName + '_image_' + index;
    var caption = galleryName + '_caption_' + index;
    var targetElement = document.getElementById(target);
    if (!targetElement) return false;

    for (var i = 0; i < gallerySize[galleryName]; i++) {
        var el = document.getElementById(galleryName + '_image_' + i);
        if (el) {
            el.style.display = el.id == target ? '' : 'none';
        }

        el = document.getElementById(galleryName + '_thumb_' + i);
        if (el) {
            if (i == index) {
                el.oldOnmouseover = el.onmouseover;
                el.oldOnmouseout = el.onmouseout;
                el.onmouseover = null;
                el.onmouseout = null;
                el.classList.add('current');
            } else {
                el.classList.remove('current');
                if (!el.onmouseover) el.onmouseover = el.oldOnmouseover;
                if (!el.onmouseout) el.onmouseout = el.oldOnmouseout;
            }
        }
    }

    targetElement.style.display = '';

    var captionSource = document.getElementById(caption);
    var captionTarget = document.getElementById(galleryName + '_caption');
    if (!captionTarget) return true;
    if(captionSource && captionSource.innerHTML != '') {
        captionTarget.style.display = 'block';
        captionTarget.innerHTML = captionSource.innerHTML;
    } else {
        captionTarget.style.display = 'none';
    }

    var prevIndex = index == 0 ? gallerySize[galleryName] - 1 : index-1;
    var nextIndex = index == gallerySize[galleryName] - 1 ? 0 : index+1;
    document.getElementById(galleryName + '_prev_button').onclick = function () { changeGalleryImage(galleryName, prevIndex) };
    document.getElementById(galleryName + '_next_button').onclick = function () { changeGalleryImage(galleryName, nextIndex) };
}

var galleryTimeouts = [];
function advanceGallerySlideshow(galleryName, delay) {
    document.getElementById(galleryName + '_next_button').onclick();
    galleryTimeouts[galleryName] = setTimeout(function() { advanceGallerySlideshow(galleryName, delay); }, delay);
}


var overflowAutoDivs = [];
function changeOverflowAutoToHidden() {
    var divs = [];
    Array.prototype.forEach.call(document.querySelectorAll('div'), function (div) {
        if (div.style.overflow == 'auto') {
            divs.push(div);
            div.style.overflow = 'hidden';
        }
    });
    overflowAutoDivs.push(divs);
}

function changeOverflowHiddenToAuto() {
    Array.prototype.forEach.call(overflowAutoDivs.pop() || [], function (div) {
        div.style.overflow = 'auto';
    });
}


var pageBrowserFieldID = null;
function showPageBrowser(field_id) {
    pageBrowserFieldID = field_id;
    path = document.getElementById(field_id).value;

    ajaxLoadInto('page_browser', '/manage/cms_pages/select_page?path=' + encodeURIComponent(path));
    document.getElementById('page_browser_selection').value = path;
    showDojoDialog('page_browser_dialog');
}

function closePageBrowser() {
    hideDojoDialog('page_browser_dialog');
    document.getElementById(pageBrowserFieldID).value = document.getElementById('page_browser_selection').value;
}

// first level of this hash is parent_key below
var cmsPageObjects = {};

function scanForPageObjects(page_id, parent_key, version) {
  if (jQuery('#page_objects_' + parent_key).val().length == 0) return;

  var found = {};
  if (!cmsPageObjects[parent_key]) cmsPageObjects[parent_key] = {};

  // Match both raw ERB (<%=) and HTML-escaped form (&lt;%=) from textarea values
  var lAngle = '(?:&lt;|<)';
  var rAngle = '(?:&gt;|>)';

  var regex = new RegExp(lAngle + '%=\\s*insert_object\\(?\\s*[\'"]([-\\w\\s\\d]+)[\'"],\\s*:(\\w+)\\s*(.*?)\\)?\\s*%' + rAngle, 'gm');
  var matches = jQuery('#page_objects_' + parent_key).val().match(regex);
  if (matches) {
    jQuery.each(matches, function (index) {
      var match = this;
      var regex2 = new RegExp(lAngle + '%=\\s*insert_object\\(?\\s*[\'"]([-\\w\\s\\d]+)[\'"],\\s*:(\\w+)\\s*(.*?)\\)?\\s*%' + rAngle, 'gm');
      if (regex2.test(match)) {
        key = match.replace(regex2, "$1");
        val = match.replace(regex2, "$2");
        if (val == 'page_list') found[key] = val;
      }
    });
  }

  var regex = new RegExp(lAngle + '%=\\s*(?:page_list|pagelist)\\(?\\s*[\'"]([-\\w\\s\\d]+)[\'"](.*?)\\)?\\s*%' + rAngle, 'gm');
  var matches = jQuery('#page_objects_' + parent_key).val().match(regex);
  if (matches) {
    jQuery.each(matches, function (index) {
      var match = this;
      var regex2 = new RegExp(lAngle + '%=\\s*(?:page_list|pagelist)\\(?\\s*[\'"]([-\\w\\s\\d]+)[\'"](.*?)\\)?\\s*%' + rAngle, 'gm');
      if (regex2.test(match)) {
        key = match.replace(regex2, "$1");
        val = 'page_list'
        found[key] = val;
      }
    });
  }

  // remove the cruft
  jQuery.each(cmsPageObjects, function(key, val) {
    if (cmsPageObjects[parent_key][key] != found[key]) {
      obj_key = val + '_container_obj-' + val + '-' + key.replace(/[^\w]/g, '_');
      while (jQuery('#' + obj_key).length > 0) {
        jQuery('#' + obj_key).remove();
      }
      cmsPageObjects[parent_key][key] = null;
    }
  });
  
  // bring in the new
  jQuery.each(found, function (key, val) {
    if (!cmsPageObjects[parent_key][key]) {
      cmsPageObjects[parent_key][key] = val;
      jQuery.get('/manage/cms_pages/' + page_id + '/insert_page_object_config?version=' + version +
                 '&name=' + key + '&type=' + val + '&parent_key=' + parent_key);
    }
  });
}


function blockUserInput() {
    var dims = { width: document.body.scrollWidth, height: document.body.scrollHeight };
    $('preview_cover').show();
    $('preview_cover').style.position = 'absolute';
    $('preview_cover').style.left = '0px';
    $('preview_cover').style.top = '0px';
    $('preview_cover').style.width = dims.width + 'px';
    $('preview_cover').style.height = dims.height + 'px';
}


function insertAtCaret(obj, text) {
    if(document.selection) {
        obj.focus();
        var orig = obj.value.replace(/\r\n/g, "\n");
        var range = document.selection.createRange();
        
        if(range.parentElement() != obj) {
            return false;
        }
        
        range.text = text;
        
        var actual = tmp = obj.value.replace(/\r\n/g, "\n");
        
        for(var diff = 0; diff < orig.length; diff++) {
            if(orig.charAt(diff) != actual.charAt(diff)) break;
        }
        
        for(var index = 0, start = 0; 
            tmp.match(text) 
                && (tmp = tmp.replace(text, "")) 
                && index <= diff; 
            index = start + text.length
        ) {
            start = actual.indexOf(text, index);
        }
    } else if(obj.selectionStart) {
        var start = obj.selectionStart;
        var end   = obj.selectionEnd;
        
        obj.value = obj.value.substr(0, start) 
            + text 
            + obj.value.substr(end, obj.value.length);
    }
    
    if(start != null) {
        setCaretTo(obj, start + text.length);
    } else {
        obj.value += text;
    }
}

function setCaretTo(obj, pos) {
    if(obj.createTextRange) {
        var range = obj.createTextRange();
        range.move('character', pos);
        range.select();
    } else if(obj.selectionStart) {
        obj.focus();
        obj.setSelectionRange(pos, pos);
    }
}


// utility function to fix # of decimal places
function setPrecision(val, p, dontPad, addCommas) {
    if (typeof(p) == 'undefined') p = 2;
    if (typeof(dontPad) == 'undefined') dontPad = false;
    if (typeof(addCommas) == 'undefined') addCommas = true;
    
    if (val.toString() == 'NaN') return '';
    var m = Math.pow(10, p);
    var ret = parseInt(Math.round(val * m), 10) / m;
    var idx = (''+ret).indexOf('.');
    if (idx < 0) {
        ret += '.';
        idx = (''+ret).indexOf('.');
    }
    
    if (!dontPad && (''+ret).substring(idx).length <= p) {
        for (var i = (''+ret).substring(idx).length; i <= p; i++) {
            ret += '0';
        }
    }
    
    if (addCommas) {
        var pieces = (''+ret).split('.');
        if (p > 0) {
            ret = '.' + pieces[1];
        } else {
            ret = pieces[1];
        }
        for (var i = 0; i < pieces[0].length; i++) {
            if (i % 3 == 2) {
                ret = ',' + pieces[0].charAt(pieces[0].length - i - 1) + ret;
            } else {
                ret = pieces[0].charAt(pieces[0].length - i - 1) + ret;
            }
        }
        ret = ret.replace(/^,/, '');
    }
    
    return ret;
}
