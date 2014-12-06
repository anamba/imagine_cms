jQuery(document).ready(function () {
  jQuery('textarea.codemirror-html').each(function () {
    var cm = CodeMirror.fromTextArea(this, {
      mode: 'htmlmixed',
      lineNumbers: true
    });
  })
});




/*
 * legacy prototype stuff only beyond this point
 */

// Fixes gallery reordering (Scriptaculous Sortable)
Position.includeScrollOffsets = true;


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
var cbColWidth = '200px';
var cbColHeight = '240px';
var cbBorderWidth = '1px';
var cbColWidthFull = 202;

function cbAddColumn() {
    var currentWidth = parseInt($('columnBrowser').style.width, 10);
    // if (currentWidth < ((cbNumColumns+1) * cbColWidthFull)) {
      $('columnBrowser').style.width = '' + ((cbNumColumns+1) * cbColWidthFull) + 'px';
      $('columnBrowserContainer').scrollLeft = $('columnBrowserContainer').scrollWidth;
    // }
    $('columnBrowser').innerHTML += "<div id=\"columnBrowserLevel" + cbNumColumns + "\" style=\"width: " + cbColWidth + "; height: " + cbColHeight + "; overflow: auto; float: left; border-width: " + cbBorderWidth + " " + cbBorderWidth + " " + cbBorderWidth + " " + (cbNumColumns == 0 ? cbBorderWidth : '0') + "; border-style: solid; border-color: gray;\">Loading...</div>";
    cbNumColumns++;
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
    var el = $(el);
    coords = getScrollbarPosition(el.parentNode);
    
    // remove all higher levels and unselect all other same-level divs
    for (var i = currentLevel + 1; i <= cbNumColumns; i++) {
        d = $('columnBrowserLevel' + i);
        if (d) d.parentNode.removeChild(d);
    }
    cbNumColumns = currentLevel + 1;
    
    prefix = 'cb_item_';
    $A(el.parentNode.childNodes).each(function (d) {
        if (d.id && d.id.substring(0, prefix.length) == prefix) {
            d.className = 'cb_item';
        }
    })
    
    // select and expand current dept div
    el.className = 'cb_item cb_item_selected';
    
    cbAddColumn();
    el = $(el.id);
    new Ajax.Updater('columnBrowserLevel' + (currentLevel+1), urlForNextLevel, {method: 'GET', asynchronous:true, evalScripts:true});
    
    setScrollbarPosition(el.parentNode, coords);
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
function showDojoDialog(id, titleText) {
    // if (!is.ie) changeOverflowAutoToHidden();
    
    dlg = dojo.widget.byId(id);
    if (!dlg) dlg = dojo.widget.createWidget(id);
    if (!dlg) return false;
    
    dlg.closeWindow = function () { hideDojoDialog(id); };
    dlg.show();
    
    if (typeof(titleText) != 'undefined') {
        try {
            document.getElementById('propertiesDialog').getElementsByTagName('div')[0].getElementsByTagName('div')[4].innerHTML = titleText;
        } catch (e) {}
    }
    
    if (dialogStack.length > 0) dojo.widget.byId(dialogStack[dialogStack.length-1]).hide();
    dialogStack.push(id);
}

function hideDojoDialog(id) {
    dialogStack.pop();
    
    dojo.widget.byId(id).hide();
    if (!is.ie) changeOverflowHiddenToAuto();
    
    if (dialogStack.length > 0) {
        dojo.widget.byId(dialogStack[dialogStack.length-1]).show();
    }
}

function editProperties(url, titleText) {
    $('properties_dialog_content').innerHTML = 'Loading...';
    new Ajax.Updater('properties_dialog_content', url, {method:'get', asynchronous:true, evalScripts:true});
    
    showDojoDialog('properties_dialog', titleText);
}

function cancelEditProperties() {
    hideDojoDialog('properties_dialog');
}

function insertImage(url) {
    var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
    imageNode = dojo.withGlobal(curInst.window, "getSelectedElement", dojo.html.selection);
    if (!imageNode) {
        imageNode = dojo.withGlobal(curInst.window, "getAncestorElement", dojo.html.selection, ['img']);
    }
    if (imageNode) {
        dojo.require("dojo.widget.Editor2Plugin.InsertImageDialog");
        w = dojo.widget.createWidget("Editor2InsertImageDialog");
        w.show();
    } else {
        $('insert_image_dialog_content').innerHTML = 'Loading...';
        new Ajax.Updater('insert_image_dialog_content', url, {method:'get', asynchronous:true, evalScripts:true});
        showDojoDialog('insert_image_dialog');
    }
    try { if (cropper) cropper.remove(); } catch (e) {}
}

function cancelInsertImage() {
    hideDojoDialog('insert_image_dialog');
    try { if (cropper) cropper.remove(); } catch (e) {}
}

function insertFile(url) {
    var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
    curInst.saveSelection(); //save selection (none-activeX IE)
    var html = dojo.withGlobal(curInst.window, "getSelectedText", dojo.html.selection);
    if (html == null || html.length == 0) {
        alert("Please select some text to create a file link.");
        return false; //do not show the dialog
    }
    
    $('insert_file_dialog_content').innerHTML = 'Loading...';
    new Ajax.Updater('insert_file_dialog_content', url, {method:'get', asynchronous:true, evalScripts:true});
    showDojoDialog('insert_file_dialog');
}

function cancelInsertFile() {
    hideDojoDialog('insert_file_dialog');
}

function selectThumbnail(url) {
    $('select_thumbnail_dialog_content').innerHTML = 'Loading...';
    new Ajax.Updater('select_thumbnail_dialog_content', url, {asynchronous:true, evalScripts:true});
    showDojoDialog('select_thumbnail_dialog');
}

function cancelSelectThumbnail() {
    hideDojoDialog('select_thumbnail_dialog');
}

var gallerySize = [];
function changeGalleryImage(galleryName, index) {
    var target = galleryName + '_image_' + index;
    var caption = galleryName + '_caption_' + index;
    if (!$(target)) return false;

    var queue = Effect.Queues.get('global');
    queue.each(function(e) { e.cancel() });

    for (var i = 0; i < gallerySize[galleryName]; i++) {
        el = $(galleryName + '_image_' + i);
        if (el.id != target && el.style.display != 'none') Effect.Fade(el, { duration: 0.6 });

        el = $(galleryName + '_thumb_' + i);
        if (el) {
            if (i == index) {
                el.oldOnmouseover = el.onmouseover;
                el.oldOnmouseout = el.onmouseout;
                el.onmouseover = null;
                el.onmouseout = null;
                el.addClassName('current');
            } else {
                el.removeClassName('current');
                if (!el.onmouseover) el.onmouseover = el.oldOnmouseover;
                if (!el.onmouseout) el.onmouseout = el.oldOnmouseout;
            }
        }
    }

    Effect.Appear(target, { duration: 0.6 });

    if($(caption).innerHTML != '') {
        $(galleryName + '_caption').style.display = 'block';
        $(galleryName + '_caption').innerHTML = $(caption).innerHTML;
    } else {
        $(galleryName + '_caption').style.display = 'none';
    }

    prevIndex = index == 0 ? gallerySize[galleryName] - 1 : index-1;
    nextIndex = index == gallerySize[galleryName] - 1 ? 0 : index+1;
    $(galleryName + '_prev_button').onclick = function () { changeGalleryImage(galleryName, prevIndex) };
    $(galleryName + '_next_button').onclick = function () { changeGalleryImage(galleryName, nextIndex) };
}

var galleryTimeouts = [];
function advanceGallerySlideshow(galleryName, delay) {
    $(galleryName + '_next_button').onclick();
    galleryTimeouts[galleryName] = setTimeout(function() { advanceGallerySlideshow(galleryName, delay); }, delay);
}


var overflowAutoDivs = [];
function changeOverflowAutoToHidden() {
    var divs = [];
    $$('div').each(function (div) {
        if (div.style.overflow == 'auto') {
            divs.push(div);
            div.style.overflow = 'hidden';
        }
    });
    overflowAutoDivs.push(divs);
}

function changeOverflowHiddenToAuto() {
    $A(overflowAutoDivs.pop).each(function (div) {
        div.style.overflow = 'auto';
    });
}


var pageBrowserFieldID = null;
function showPageBrowser(field_id) {
    pageBrowserFieldID = field_id;
    path = $(field_id).value;
    
    $('page_browser').innerHTML = 'Loading...'
    new Ajax.Updater('page_browser', '/manage/cms/select_page?path=' + path, {asynchronous:true, evalScripts:true});
    $('page_browser_selection').value = path;
    showDojoDialog('page_browser_dialog');
}

function closePageBrowser() {
    hideDojoDialog('page_browser_dialog');
    $(pageBrowserFieldID).value = $('page_browser_selection').value;
}


var cmsPageObjects = [];
function scanForPageObjects(page_id, parent_key, version) {
    found = [];
    
    var regex = /<%=\s*insert_object\(?\s*['"]([-\w\s\d]+)['"],\s*:(\w+)\s*(.*?)\)?\s*%>/gm;
    if (!$('page_objects_' + parent_key).value) return;
    
    var matches = $('page_objects_' + parent_key).value.match(regex);
    $A(matches).each(function (match) {
        // regex2 should be exactly the same as regex. Global regexes have a lastIndex which is not reset.
        var regex2 = /<%=\s*insert_object\(?\s*['"]([-\w\s\d]+)['"],\s*:(\w+)\s*(.*?)\)?\s*%>/gm;
        if (regex2.test(match)) {
            name = match.replace(regex2, "$1");
            type = match.replace(regex2, "$2");
            opts = match.replace(regex2, "$3");
            found[name] = type;
        }
    });
    
    // remove the cruft
    $H(cmsPageObjects).each(function(pair) {
        if (cmsPageObjects[pair.key] != found[pair.key]) {
            type = cmsPageObjects[pair.key];
            obj_key = type + '_container_obj-' + pair.value + '-' + pair.key.replace(/[^\w]/g, '_');
            if ($(obj_key)) {
                $(obj_key).parentNode.removeChild($(obj_key));
            }
            cmsPageObjects[pair.key] = null;
        }
    });
    
    // bring in the new
    $H(found).each(function (obj) {
        name = obj.key
        type = obj.value
        if (!cmsPageObjects[name]) {
            cmsPageObjects[name] = type;
            new Ajax.Request('/manage/cms/insert_page_object_config/' + page_id + '?version= ' + version +
                             '&name=' + name + '&type=' + type + '&parent_key=' + parent_key,
                             { method:'get', asynchronous: true, evalScripts: true });
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
