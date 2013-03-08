/********************************
 * default settings, override   *
 * in application.js            *
 ********************************/

var defaultXMenuOffset = 0;
var defaultYMenuOffset = 0;
var defaultXOffset = 0;
var defaultYOffset = 0;
var showRolloverEffect = Effect.Appear;
var showRolloverEffectOptions = { duration: 0.2 };
var showRolloverMenuEffect = Effect.BlindDown;
var showRolloverMenuEffectOptions = { duration: 0.2 };
var hideRolloverDelay = 120;
var hideRolloverEffect = Effect.Fade;
var hideRolloverEffectOptions = { duration: 0.3 };
var hideRolloverMenuEffect = Effect.BlindUp;
var hideRolloverMenuEffectOptions = { duration: 0.2 };


/********************************
 * framework code follows       *
 ********************************/

var currentEffect = [];

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

/********************************
 * rollover/menu functions      *
 ********************************/

var hideRolloverTimeouts = [];
var hoveredButtons = [];

function showRollover(target, xMenuOffset, yMenuOffset, xOffset, yOffset) {
    try {
        if (hideRolloverTimeouts[target]) {
            clearTimeout(hideRolloverTimeouts[target]);
            hideRolloverTimeouts[target] = null;
            return;
        }
        
        if (hoveredButtons[target]) {
            return;
        }
        
        var el = $(target + '_hover');
        var sourceObj = $(target + '_std');
        
        var coords = getElementPosition(sourceObj);
        if (typeof(xMenuOffset) == 'undefined') xMenuOffset = defaultXMenuOffset;
        if (typeof(yMenuOffset) == 'undefined') yMenuOffset = defaultYMenuOffset;
        if (typeof(xOffset) == 'undefined') xOffset = defaultXOffset;
        if (typeof(yOffset) == 'undefined') yOffset = defaultYOffset;
        
        el.style.position = 'absolute';
        el.style.left = coords[0] + xOffset + 'px';
        el.style.top  = coords[1] + yOffset + 'px';
        el.style.margin = '0';
        el.style.zIndex = '100';
        
        if (currentEffect[el.id]) currentEffect[el.id].cancel();
        currentEffect[el.id] = showRolloverEffect(el.id, showRolloverEffectOptions);
        
        if (el = $(target + '_menu')) {
            el.style.display = 'none';
            el.style.position = 'absolute';
            el.style.left = (coords[0] + xMenuOffset) + 'px';
            el.style.top  = (coords[1] + yMenuOffset) + 'px';
            el.style.margin = '0';
            el.style.zIndex = '100';
            
            for (var i = 0; i < el.childNodes.length; i++) {
                if (el.childNodes[i].tagName == 'DIV') {
                    el.style.width  = el.childNodes[i].style.width;
                    el.style.height = el.childNodes[i].style.height;
                    break;
                }
            }
            if (currentEffect[el.id]) currentEffect[el.id].cancel();
            currentEffect[el.id] = showRolloverMenuEffect(el.id, showRolloverMenuEffectOptions);
        }
        
        hoveredButtons[target] = true;
    } catch (e) { }
}

function hideRollover(target) {
    try {
        hideRolloverTimeouts[target] = setTimeout('hideRolloverComplete("' + target + '");', hideRolloverDelay);
    } catch (e) {}
}

function hideRolloverComplete(target) {
    try {
        hideRolloverTimeouts[target] = null;
        
        if (el = $(target + '_hover')) {
            if (currentEffect[el.id]) currentEffect[el.id].cancel();
            currentEffect[el.id] = hideRolloverEffect(el.id, hideRolloverEffectOptions);
        }
        
        if (el = $(target + '_menu')) {
            if (currentEffect[el.id]) currentEffect[el.id].cancel();
            currentEffect[el.id] = hideRolloverMenuEffect(el.id, hideRolloverMenuEffectOptions);
        }
        
        hoveredButtons[target] = false;
    } catch (e) {}
}


var hideSimpleRolloverTimeouts = [];
function showSimpleRollover(target, xOffset, yOffset) {
    try {
        // if we were planning to hide this element in the future, no need for that now
        if (hideSimpleRolloverTimeouts[target]) {
            clearTimeout(hideSimpleRolloverTimeouts[target]);
            hideSimpleRolloverTimeouts[target] = null;
            return;
        }
        
        // if other elements are waiting to be hidden, get it over with now
        $H(hideSimpleRolloverTimeouts)._each(function (pair) {
            clearTimeout(pair[1]);
            hideSimpleRolloverComplete(pair[0]);
        });
    } catch (e) {}
    
    try {
        var el = document.getElementById(target + '_std');
        el.oldsrc = el.src;
        el.src = el.src.replace(/(_hover)?.gif$/, '_hover.gif');
        if (!(is.ie && is.mac)) showSimpleRolloverMenu(target, xOffset, yOffset);
    } catch (e) {}
}

function showSimpleRolloverMenu(target, xOffset, yOffset, useRelative) {
    try {
        if (hideSimpleRolloverTimeouts[target]) {
            clearTimeout(hideSimpleRolloverTimeouts[target]);
            hideSimpleRolloverTimeouts[target] = null;
            return;
        }
        
        var el = document.getElementById(target + '_std');
        if (el) {
            var coords = getElementPosition(el);
            
            if (typeof(xOffset) == 'undefined') xOffset = 0;
            if (typeof(yOffset) == 'undefined') yOffset = 30;
            if (typeof(useRelative) == 'undefined') useRelative = false;
            
            if (el = document.getElementById(target + '_menu')) {
                el.style.zIndex = 100;
                el.style.position = 'absolute';
                if (useRelative) {
                    el.style.left = xOffset + 'px';
                    el.style.top  = yOffset + 'px';
                } else {
                    el.style.left = (coords[0] + xOffset) + 'px';
                    el.style.top  = (coords[1] + yOffset) + 'px';
                }
                el.style.display = '';
            }
        }
    } catch (e) {}
}

function hideSimpleRollover(target) {
    try {
        hideSimpleRolloverTimeouts[target] = setTimeout('hideSimpleRolloverComplete("' + target + '")', 200);
    } catch (e) {}
}

function hideSimpleRolloverComplete(target) {
    try {
        var el = document.getElementById(target + '_std');
        if (el.oldsrc) el.src = el.oldsrc;
        hideSimpleRolloverMenuComplete(target);
    } catch (e) {}
}

function hideSimpleRolloverMenu(target) {
    try {
        hideSimpleRolloverTimeouts[target] = setTimeout('hideSimpleRolloverMenuComplete("' + target + '")', 200);
    } catch (e) {}
}

function hideSimpleRolloverMenuComplete(target) {
    try {
        hideSimpleRolloverTimeouts[target] = null;
        
        var el = document.getElementById(target + '_std');
        var coords = getElementPosition(el);
        
        if (el = document.getElementById(target + '_menu')) {
            el.style.display = 'none';
        }
    } catch (e) {}
}


/********************************
 * slideshow functions          *
 ********************************/

var currentSlideIndex = 0;
var maxSlideIndex = -1;

function getNumSlides() {
    if (maxSlideIndex > -1) return maxSlideIndex;
    maxSlideIndex = 0;
    
    while ($('img_slideshow' + maxSlideIndex)) maxSlideIndex++;
    return maxSlideIndex;
}

function nextSlide(delay, transition) {
    if (typeof(transition) == 'undefined') transition = 'SlideAppear';
    changeSlide(delay, transition, 1);
}

function prevSlide(delay, transition) {
    if (typeof(transition) == 'undefined') transition = 'SlideAppear';
    changeSlide(delay, transition, -1);
}

// controls elements named img_slideshowX
// uses a global named currentSlideIndex to keep track of its state
// uses a global named maxSlideIndex to cache the discovered maximum slide index
function changeSlide(delay, transition, increment) {
    try {
        if (typeof(delay) == 'undefined') delay = -1;
        if (typeof(transition) == 'undefined') transition = 'SlideAppear';
        
        // this element is used for positioning
        origimg = $('img_slideshow');
        
        nextSlideIndex = currentSlideIndex + increment;
        if (!$('img_slideshow' + nextSlideIndex)) {
            if (increment > 0) {
                nextSlideIndex = 0;
            } else {
                nextSlideIndex = getNumSlides() - 1;
            }
        }
        
        if ((curimg  = $('img_slideshow' + currentSlideIndex)) &&
            (nextimg = $('img_slideshow' + nextSlideIndex))) {
            // push old images back
            for (var i = 0; i < getNumSlides(); i++) {
                $('img_slideshow' + i).style.zIndex = ((increment > 0) ? i : (getNumSlides() - i));
            }
            nextimg.style.zIndex = '90';
            nextimg.style.margin = '0';
            
            // really shouldn't have to do this, but I just can't figure it out...
            curimg.style.zIndex  = '89';
            
            // drag the new image over the main image
            var coords = getElementPosition(origimg);
            nextimg.style.position = 'absolute';
            nextimg.style.left = coords[0] + 'px';
            nextimg.style.top  = coords[1] + 'px';
            
            eval('Effect.' + transition + '(nextimg.id, { duration: 1.8 });');
            setTimeout('$("' + curimg.id + '").style.display = "none"', 1900);
            if (delay > 0) setTimeout('changeSlide(' + delay + ', "' + transition + '", ' + increment + ');', delay);
            
            currentSlideIndex = nextSlideIndex;
        }
    } catch (e) {}
}

// positions slide navigation elements (named btn_slidenext and btn_slideprev)
// relative to img_slideshow (x and y are the relative offsets)
function positionSlideNav(x, y) {
    try {
        img = $('img_slideshow');
        nav = $('div_slidenav');
        
        // move the buttons to their proper places
        nav.style.zIndex = '95';
        nav.style.position = 'relative';
        nav.style.left = x + 'px';
        nav.style.top  = y + 'px';
    } catch (e) {}
}


/********************************
 * dialog/popup functions       *
 ********************************/

function openDialog(url, w, h, opts) {
    window.open(url, '_blank', (w && h ? 'width=' + w + ',height=' + h : '') + (typeof(opts) == 'undefined' ? '' : ',' + opts));
}

// resize the window to fit the content
function autoResize(masterDiv) {
    if (typeof(masterDiv) == 'undefined') {
        masterDiv = $('masterDiv');
    } else {
        masterDiv = $(masterDiv);
    }
    var max = Math.min(screen.height - 100, 800);
    var ht = Math.min(masterDiv.scrollHeight, max);
    
    if (typeof(window.innerWidth) == 'number') {
        //Non-IE
        myWidth = window.innerWidth;
        myHeight = window.innerHeight;
    } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
        //IE 6+ in 'standards compliant mode'
        myWidth = document.documentElement.clientWidth;
        myHeight = document.documentElement.clientHeight;
    } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
        //IE 4 compatible
        myWidth = document.body.clientWidth;
        myHeight = document.body.clientHeight;
    }
    
    resizeBy(0, ht - myHeight);
}


// the opposite... resize the content to fit the window
function autoResizeDiv(masterDiv, adjustment) {
    if (typeof(masterDiv) == 'undefined') {
        masterDiv = $('masterDiv');
    } else {
        masterDiv = $(masterDiv);
    }
    if (typeof(adjustment) == 'undefined') adjustment = 0;
    
    var max = Math.min(screen.height - 100, 800);
    var ht = Math.min(masterDiv.scrollHeight, max);
    
    if (typeof(window.innerWidth) == 'number') {
        //Non-IE
        myWidth = window.innerWidth;
        myHeight = window.innerHeight;
    } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
        //IE 6+ in 'standards compliant mode'
        myWidth = document.documentElement.clientWidth;
        myHeight = document.documentElement.clientHeight;
    } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
        //IE 4 compatible
        myWidth = document.body.clientWidth;
        myHeight = document.body.clientHeight;
    }
    
    masterDiv.style.height = myHeight - 200 + adjustment + 'px';
}


/********************************
 * date picker functions        *
 ********************************/

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
 * custom effects               *
 ********************************/

Effect.BlindRight = function(element) {
  element = $(element);
  var oldWidth = Element.getStyle(element, 'width');
  var elementDimensions = Element.getDimensions(element);
  return new Effect.Scale(element, 100, 
    Object.extend({
        scaleContent: false,
        scaleY: false,
        scaleFrom: 0,
        scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
        restoreAfterFinish: true,
        afterSetup: function(effect) { with(Element) {
          makeClipping(effect.element);
            setStyle(effect.element, {width: '0px'});
            show(effect.element);
          }}
    }, arguments[1] || {})
  );
}

Effect.SlideAppear = function(element) {
    element = $(element);
    new Effect.Appear(element, arguments[2] || arguments[1] || {});
    new Effect.BlindRight(element, arguments[1] || {});
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
    if (currentWidth < ((cbNumColumns+1) * cbColWidthFull)) $('columnBrowser').style.width = '' + ((cbNumColumns+1) * cbColWidthFull) + 'px';
    $('columnBrowser').innerHTML += "<div id=\"columnBrowserLevel" + cbNumColumns + "\" style=\"width: " + cbColWidth + "; height: " + cbColHeight + "; overflow: auto; float: left; border-width: " + cbBorderWidth + " " + cbBorderWidth + " " + cbBorderWidth + " " + (cbNumColumns == 0 ? cbBorderWidth : '0') + "; border-style: solid; border-color: gray;\">Loading...</div>";
    $('columnBrowserLevel' + cbNumColumns).scrollIntoView();
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
    new Ajax.Updater('columnBrowserLevel' + (currentLevel+1), urlForNextLevel, {asynchronous:true, evalScripts:true});
    
    setScrollbarPosition(el.parentNode, coords);
}


/********************************
 * text field hints             *
 ********************************/

function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
            oldonload();
            func();
        }
    }
}

function addUnloadEvent(func) {
    var oldonunload = window.onunload;
    if (typeof window.onunload != 'function') {
        window.onunload = func;
    } else {
        window.onunload = function() {
            oldonunload();
            func();
        }
    }
}

var textFieldHints = new Array();
function setupTextFieldHints() {
    textFieldHints.each(function (a) {
        $A(document.getElementsByName(a.name)).each(function (el) {
            var clearHint = function () {
                el.value = '';
                el.style.color = el.style.origColor ? el.style.origColor : 'black';
                el.onfocus = el.oldOnFocus;
                el.oldOnBlur = el.onblur;
                el.onblur = function () {
                    if (typeof(el.oldOnBlur) == 'function') el.oldOnBlur();
                    setHint();
                }
            };
            var setHint = function () {
                if (!el.value || el.value == a.hint) {
                    el.value = a.hint;
                    el.style.origColor = el.style.color;
                    el.style.color = 'gray';
                    if (typeof(el.oldOnBlur) != 'undefined') el.onblur = el.oldOnBlur;
                    el.oldOnFocus = el.onfocus;
                    el.onfocus = function () {
                        if (typeof(el.oldOnFocus) == 'function') el.oldOnFocus();
                        clearHint();
                    }
                }
            }
            setHint();
        })
    });
}
addLoadEvent(setupTextFieldHints);

function teardownTextFieldHints() {
    textFieldHints.each(function (a) {
        var el = document.getElementsByName(a.name)[0];
        if (el.value == a.hint) {
            el.value = '';
            el.style.color = el.origColor ? el.origColor : 'black';
            el.onfocus = null;
        }
    });
}

function addTextFieldHint(name, hint) {
    if (textFieldHints.select(function (a) { return a.name == name }).length == 0) {
        textFieldHints.push({ name: name, hint: hint });
    }
}


/********************************
 * horizontal tab interface     *
 ********************************/

function setPageVisibility() {
    var opts = $A($('page_select').options);
    opts.each(function (opt) {
        $(opt.value).hide();
    });
    $($F('page_select')).show();
}


/********************************
 * vertical tab interface       *
 ********************************/

function selectTab(tabName, tabArray, tabBtnPrefix, tabDivPrefix, hiddenTextFieldId) {
    tabArray._each(function (tab) {
        $(tabBtnPrefix + tab).className = 'tab_normal';
        $(tabDivPrefix + tab).style.display = 'none';
    })
    $('pmtbtn_' + tabName).className = 'tab_selected';
    $('pmtinfo_' + tabName).style.display = '';
    $(hiddenTextFieldId).value = tabName;
}


/********************************
 * cms support                  *
 ********************************/

// support for autocompletes
var attrlist = [];
var taglist = [];

var dialogStack = [];
function showDojoDialog(id, titleText) {
    if (!is.ie) changeOverflowAutoToHidden();
    
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
                el.style.borderColor = 'white';
                el.onmouseover = null;
                el.onmouseout = null;
            } else {
                el.style.borderColor = '#6B6B6B';
                el.onmouseover = function () { this.style.borderColor = 'white' };
                el.onmouseout = function () { this.style.borderColor = '#6B6B6B' };
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


// this doesn't seem to work... argh
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
    var matches = $A($('page_objects_' + parent_key).value.match(regex));
    
    matches.each(function (match) {
        if (regex.test(match)) {
            name = match.replace(regex, "$1");
            type = match.replace(regex, "$2");
            opts = match.replace(regex, "$3");
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


function setReportDates(interval) {
    startDateField = $('report_start_date');
    endDateField = $('report_end_date');
    today = startDate = endDate = new Date();
    
    switch (interval) {
        case 'yesterday':
            startDate = new Date('' + (today.getMonth()+1) + '/' + (today.getDate()-1) + '/' + today.getYear());
            endDate = startDate;
            break;
            
        case 'last_month':
            startDate = new Date('' + today.getMonth() + '/1/' + today.getYear());
            endDate = new Date('' + (today.getMonth()+1) + '/0/' + today.getYear());
            break;
            
        case 'last_quarter':
            startMonth = Math.floor(today.getMonth() / 3) * 3 - 3;
            startYear = today.getYear();
            if (startMonth < 0) {
                startMonth += 12;
                startYear--;
            }
            endMonth = startMonth + 3;
            endYear = startYear;
            if (endMonth > 11) {
                endMonth -= 12;
                endYear++;
            }
            startDate = new Date('' + (startMonth+1) + '/1/' + startYear);
            endDate = new Date('' + (endMonth+1) + '/0/' + endYear);
            break;
            
        case 'last_year':
            startDate = new Date('1/1/' + (today.getYear()-1));
            endDate = new Date('12/31/' + (today.getYear()-1));
            break;
            
        case 'today':
            startDate = new Date('' + (today.getMonth()+1 )+ '/' + today.getDate() + '/' + today.getYear());
            endDate = startDate;
            break;
            
        case 'this_month':
            startDate = new Date('' + (today.getMonth()+1) + '/1/' + today.getYear());
            endDate = new Date('' + (today.getMonth()+2) + '/0/' + today.getYear());
            break;
            
        case 'this_quarter':
            startMonth = Math.floor(today.getMonth() / 3) * 3;
            endMonth = startMonth + 3;
            endYear = startYear;
            if (endMonth > 11) {
                endMonth -= 12;
                endYear++;
            }
            startDate = new Date('' + (startMonth+1) + '/1/' + today.getYear());
            endDate = new Date('' + (endMonth+1) + '/0/' + endYear);
            break;
            
        case 'this_year':
            startDate = new Date('1/1/' + today.getYear());
            endDate = new Date('12/31/' + today.getYear());
            break;
        
        case 'all_time':
            startDate = new Date('1/1/' + (today.getYear()-5));
            endDate = new Date('12/31/' + (today.getYear()+50));
            break;
        
        default:
            // same as "today"
            startDate = new Date('' + (today.getMonth()+1 )+ '/' + today.getDate() + '/' + today.getYear());
            endDate = startDate;
            break;
    }
    
    startDateField.value = startDate.format('mm/dd/yyyy');
    endDateField.value = endDate.format('mm/dd/yyyy');
}



/*
    Date Format 1.1
    (c) 2007 Steven Levithan <stevenlevithan.com>
    MIT license
    With code by Scott Trenda (Z and o flags, and enhanced brevity)
*/

/*** dateFormat
    Accepts a date, a mask, or a date and a mask.
    Returns a formatted version of the given date.
    The date defaults to the current date/time.
    The mask defaults ``"ddd mmm d yyyy HH:MM:ss"``.
*/
var dateFormat = function () {
    var token        = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloZ]|"[^"]*"|'[^']*'/g,
        timezone     = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (value, length) {
            value = String(value);
            length = parseInt(length) || 2;
            while (value.length < length)
                value = "0" + value;
            return value;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask) {
        // Treat the first argument as a mask if it doesn't contain any numbers
        if (
            arguments.length == 1 &&
            (typeof date == "string" || date instanceof String) &&
            !/\d/.test(date)
        ) {
            mask = date;
            date = undefined;
        }

        date = date ? new Date(date) : new Date();
        if (isNaN(date))
            throw "invalid date";

        var dF = dateFormat;
        mask   = String(dF.masks[mask] || mask || dF.masks["default"]);

        var d = date.getDate(),
            D = date.getDay(),
            m = date.getMonth(),
            y = date.getFullYear()+1900,
            H = date.getHours(),
            M = date.getMinutes(),
            s = date.getSeconds(),
            L = date.getMilliseconds(),
            o = date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4)
            };

        return mask.replace(token, function ($0) {
            return ($0 in flags) ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":       "ddd mmm d yyyy HH:MM:ss",
    shortDate:       "m/d/yy",
    mediumDate:      "mmm d, yyyy",
    longDate:        "mmmm d, yyyy",
    fullDate:        "dddd, mmmm d, yyyy",
    shortTime:       "h:MM TT",
    mediumTime:      "h:MM:ss TT",
    longTime:        "h:MM:ss TT Z",
    isoDate:         "yyyy-mm-dd",
    isoTime:         "HH:MM:ss",
    isoDateTime:     "yyyy-mm-dd'T'HH:MM:ss",
    isoFullDateTime: "yyyy-mm-dd'T'HH:MM:ss.lo"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thr", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

// For convenience...
Date.prototype.format = function (mask) {
    return dateFormat(this, mask);
}


// Ultimate client-side JavaScript client sniff. Version 3.03
// (C) Netscape Communications 1999.  Permission granted to reuse and distribute.
// Revised 17 May 99 to add is.nav5up and is.ie5up (see below).
// Revised 21 Nov 00 to add is.gecko and is.ie5_5 Also Changed is.nav5 and is.nav5up to is.nav6 and is.nav6up
// Revised 22 Feb 01 to correct Javascript Detection for IE 5.x, Opera 4, 
//                      correct Opera 5 detection
//                      add support for winME and win2k
//                      synch with browser-type-oo.js
// Revised 26 Mar 01 to correct Opera detection
// Revised 02 Oct 01 to add IE6 detection

// Everything you always wanted to know about your JavaScript client
// but were afraid to ask ... "Is" is the constructor function for "is" object,
// which has properties indicating:
// (1) browser vendor:
//     is.nav, is.ie, is.opera, is.hotjava, is.webtv, is.TVNavigator, is.AOLTV
// (2) browser version number:
//     is.major (integer indicating major version number: 2, 3, 4 ...)
//     is.minor (float   indicating full  version number: 2.02, 3.01, 4.04 ...)
// (3) browser vendor AND major version number
//     is.nav2, is.nav3, is.nav4, is.nav4up, is.nav6, is.nav6up, is.gecko, is.ie3, 
//     is.ie4, is.ie4up, is.ie5, is.ie5up, is.ie5_5, is.ie5_5up, is.ie6, is.ie6up, is.hotjava3, is.hotjava3up
// (4) JavaScript version number:
//     is.js (float indicating full JavaScript version number: 1, 1.1, 1.2 ...)
// (5) OS platform and version:
//     is.win, is.win16, is.win32, is.win31, is.win95, is.winnt, is.win98, is.winme, is.win2k
//     is.os2
//     is.mac, is.mac68k, is.macppc
//     is.unix
//     is.sun, is.sun4, is.sun5, is.suni86
//     is.irix, is.irix5, is.irix6
//     is.hpux, is.hpux9, is.hpux10
//     is.aix, is.aix1, is.aix2, is.aix3, is.aix4
//     is.linux, is.sco, is.unixware, is.mpras, is.reliant
//     is.dec, is.sinix, is.freebsd, is.bsd
//     is.vms
//
// See http://www.it97.de/JavaScript/JS_tutorial/bstat/navobj.html and
// http://www.it97.de/JavaScript/JS_tutorial/bstat/Browseraol.html
// for detailed lists of userAgent strings.
//
// Note: you don't want your Nav4 or IE4 code to "turn off" or
// stop working when Nav5 and IE5 (or later) are released, so
// in conditional code forks, use is.nav4up ("Nav4 or greater")
// and is.ie4up ("IE4 or greater") instead of is.nav4 or is.ie4
// to check version in code which you want to work on future
// versions.


function Is ()
{   // convert all characters to lowercase to simplify testing
    var agt=navigator.userAgent.toLowerCase();

    // *** BROWSER VERSION ***
    // Note: On IE5, these return 4, so use is.ie5up to detect IE5.

    this.major = parseInt(navigator.appVersion);
    this.minor = parseFloat(navigator.appVersion);

    // Note: Opera and WebTV spoof Navigator.  We do strict client detection.
    // If you want to allow spoofing, take out the tests for opera and webtv.
    this.nav  = ((agt.indexOf('mozilla')!=-1) && (agt.indexOf('spoofer')==-1)
                && (agt.indexOf('compatible') == -1) && (agt.indexOf('opera')==-1)
                && (agt.indexOf('webtv')==-1) && (agt.indexOf('hotjava')==-1));
    this.nav2 = (this.nav && (this.major == 2));
    this.nav3 = (this.nav && (this.major == 3));
    this.nav4 = (this.nav && (this.major == 4));
    this.nav4up = (this.nav && (this.major >= 4));
    this.navonly      = (this.nav && ((agt.indexOf(";nav") != -1) ||
                          (agt.indexOf("; nav") != -1)) );
    this.nav6 = (this.nav && (this.major == 5));
    this.nav6up = (this.nav && (this.major >= 5));
    this.gecko = (agt.indexOf('gecko') != -1);


    this.ie     = ((agt.indexOf("msie") != -1) && (agt.indexOf("opera") == -1));
    this.ie3    = (this.ie && (this.major < 4));
    this.ie4    = (this.ie && (this.major == 4) && (agt.indexOf("msie 4")!=-1) );
    this.ie4up  = (this.ie  && (this.major >= 4));
    this.ie5    = (this.ie && (this.major == 4) && (agt.indexOf("msie 5.0")!=-1) );
    this.ie5_5  = (this.ie && (this.major == 4) && (agt.indexOf("msie 5.5") !=-1));
    this.ie5up  = (this.ie  && !this.ie3 && !this.ie4);
    this.ie5_5up =(this.ie && !this.ie3 && !this.ie4 && !this.ie5);
    this.ie6    = (this.ie && (this.major == 4) && (agt.indexOf("msie 6.")!=-1) );
    this.ie6up  = (this.ie  && !this.ie3 && !this.ie4 && !this.ie5 && !this.ie5_5);
    this.ie7    = (this.ie && (this.major == 4) && (agt.indexOf("msie 7.")!=-1) );
    this.ie7up  = (this.ie  && !this.ie3 && !this.ie4 && !this.ie5 && !this.ie5_5 && !this.ie6);

    // KNOWN BUG: On AOL4, returns false if IE3 is embedded browser
    // or if this is the first browser window opened.  Thus the
    // variables is.aol, is.aol3, and is.aol4 aren't 100% reliable.
    this.aol   = (agt.indexOf("aol") != -1);
    this.aol3  = (this.aol && this.ie3);
    this.aol4  = (this.aol && this.ie4);
    this.aol5  = (agt.indexOf("aol 5") != -1);
    this.aol6  = (agt.indexOf("aol 6") != -1);

    this.opera = (agt.indexOf("opera") != -1);
    this.opera2 = (agt.indexOf("opera 2") != -1 || agt.indexOf("opera/2") != -1);
    this.opera3 = (agt.indexOf("opera 3") != -1 || agt.indexOf("opera/3") != -1);
    this.opera4 = (agt.indexOf("opera 4") != -1 || agt.indexOf("opera/4") != -1);
    this.opera5 = (agt.indexOf("opera 5") != -1 || agt.indexOf("opera/5") != -1);
    this.opera5up = (this.opera && !this.opera2 && !this.opera3 && !this.opera4);

    this.webtv = (agt.indexOf("webtv") != -1); 

    this.TVNavigator = ((agt.indexOf("navio") != -1) || (agt.indexOf("navio_aoltv") != -1)); 
    this.AOLTV = this.TVNavigator;

    this.hotjava = (agt.indexOf("hotjava") != -1);
    this.hotjava3 = (this.hotjava && (this.major == 3));
    this.hotjava3up = (this.hotjava && (this.major >= 3));

    // *** JAVASCRIPT VERSION CHECK ***
    if (this.nav2 || this.ie3) this.js = 1.0;
    else if (this.nav3) this.js = 1.1;
    else if (this.opera5up) this.js = 1.3;
    else if (this.opera) this.js = 1.1;
    else if ((this.nav4 && (this.minor <= 4.05)) || this.ie4) this.js = 1.2;
    else if ((this.nav4 && (this.minor > 4.05)) || this.ie5) this.js = 1.3;
    else if (this.hotjava3up) this.js = 1.4;
    else if (this.nav6 || this.gecko) this.js = 1.5;
    // NOTE: In the future, update this code when newer versions of JS
    // are released. For now, we try to provide some upward compatibility
    // so that future versions of Nav and IE will show they are at
    // *least* JS 1.x capable. Always check for JS version compatibility
    // with > or >=.
    else if (this.nav6up) this.js = 1.5;
    // note ie5up on mac is 1.4
    else if (this.ie5up) this.js = 1.3

    // HACK: no idea for other browsers; always check for JS version with > or >=
    else this.js = 0.0;

    // *** PLATFORM ***
    this.win   = ( (agt.indexOf("win")!=-1) || (agt.indexOf("16bit")!=-1) );
    // NOTE: On Opera 3.0, the userAgent string includes "Windows 95/NT4" on all
    //        Win32, so you can't distinguish between Win95 and WinNT.
    this.win95 = ((agt.indexOf("win95")!=-1) || (agt.indexOf("windows 95")!=-1));

    // is this a 16 bit compiled version?
    this.win16 = ((agt.indexOf("win16")!=-1) || 
               (agt.indexOf("16bit")!=-1) || (agt.indexOf("windows 3.1")!=-1) || 
               (agt.indexOf("windows 16-bit")!=-1) );  

    this.win31 = ((agt.indexOf("windows 3.1")!=-1) || (agt.indexOf("win16")!=-1) ||
                    (agt.indexOf("windows 16-bit")!=-1));

    // NOTE: Reliable detection of Win98 may not be possible. It appears that:
    //       - On Nav 4.x and before you'll get plain "Windows" in userAgent.
    //       - On Mercury client, the 32-bit version will return "Win98", but
    //         the 16-bit version running on Win98 will still return "Win95".
    this.win98 = ((agt.indexOf("win98")!=-1) || (agt.indexOf("windows 98")!=-1));
    this.winnt = ((agt.indexOf("winnt")!=-1) || (agt.indexOf("windows nt")!=-1));
    this.win32 = (this.win95 || this.winnt || this.win98 || 
                    ((this.major >= 4) && (navigator.platform == "Win32")) ||
                    (agt.indexOf("win32")!=-1) || (agt.indexOf("32bit")!=-1));

    this.winme = ((agt.indexOf("win 9x 4.90")!=-1));
    this.win2k = ((agt.indexOf("windows nt 5.0")!=-1));

    this.os2   = ((agt.indexOf("os/2")!=-1) || 
                    (navigator.appVersion.indexOf("OS/2")!=-1) ||   
                    (agt.indexOf("ibm-webexplorer")!=-1));

    this.mac    = (agt.indexOf("mac")!=-1);
    // hack ie5 js version for mac
    if (this.mac && this.ie5up) this.js = 1.4;
    this.mac68k = (this.mac && ((agt.indexOf("68k")!=-1) || 
                               (agt.indexOf("68000")!=-1)));
    this.macppc = (this.mac && ((agt.indexOf("ppc")!=-1) || 
                                (agt.indexOf("powerpc")!=-1)));

    this.sun   = (agt.indexOf("sunos")!=-1);
    this.sun4  = (agt.indexOf("sunos 4")!=-1);
    this.sun5  = (agt.indexOf("sunos 5")!=-1);
    this.suni86= (this.sun && (agt.indexOf("i86")!=-1));
    this.irix  = (agt.indexOf("irix") !=-1);    // SGI
    this.irix5 = (agt.indexOf("irix 5") !=-1);
    this.irix6 = ((agt.indexOf("irix 6") !=-1) || (agt.indexOf("irix6") !=-1));
    this.hpux  = (agt.indexOf("hp-ux")!=-1);
    this.hpux9 = (this.hpux && (agt.indexOf("09.")!=-1));
    this.hpux10= (this.hpux && (agt.indexOf("10.")!=-1));
    this.aix   = (agt.indexOf("aix") !=-1);      // IBM
    this.aix1  = (agt.indexOf("aix 1") !=-1);    
    this.aix2  = (agt.indexOf("aix 2") !=-1);    
    this.aix3  = (agt.indexOf("aix 3") !=-1);    
    this.aix4  = (agt.indexOf("aix 4") !=-1);    
    this.linux = (agt.indexOf("inux")!=-1);
    this.sco   = (agt.indexOf("sco")!=-1) || (agt.indexOf("unix_sv")!=-1);
    this.unixware = (agt.indexOf("unix_system_v")!=-1); 
    this.mpras    = (agt.indexOf("ncr")!=-1); 
    this.reliant  = (agt.indexOf("reliantunix")!=-1);
    this.dec   = ((agt.indexOf("dec")!=-1) || (agt.indexOf("osf1")!=-1) || 
                  (agt.indexOf("dec_alpha")!=-1) || (agt.indexOf("alphaserver")!=-1) || 
                  (agt.indexOf("ultrix")!=-1) || (agt.indexOf("alphastation")!=-1)); 
    this.sinix = (agt.indexOf("sinix")!=-1);
    this.freebsd = (agt.indexOf("freebsd")!=-1);
    this.bsd = (agt.indexOf("bsd")!=-1);
    this.unix  = ((agt.indexOf("x11")!=-1) || this.sun || this.irix || this.hpux || 
                 this.sco ||this.unixware || this.mpras || this.reliant || 
                 this.dec || this.sinix || this.aix || this.linux || this.bsd || this.freebsd);

    this.vms   = ((agt.indexOf("vax")!=-1) || (agt.indexOf("openvms")!=-1));
}

var is;
var isIE3Mac = false;
// this section is designed specifically for IE3 for the Mac

if ((navigator.appVersion.indexOf("Mac")!=-1) && (navigator.userAgent.indexOf("MSIE")!=-1) && 
(parseInt(navigator.appVersion)==3))
       isIE3Mac = true;
else   is = new Is(); 
