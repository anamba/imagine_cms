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
