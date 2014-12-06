/* deprecated image rollover code */

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

var currentEffect = [];

var hideRolloverTimeouts = [];
var hoveredButtons = [];


/********************************
 * rollover/menu functions      *
 ********************************/

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
