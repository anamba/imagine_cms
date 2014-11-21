/* deprecated text field hints (use html placeholder attribute instead) */

/********************************
 * text field hints             *
 ********************************/

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
