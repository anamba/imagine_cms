/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

/*
	This is a compiled version of Dojo, built for deployment and not for
	development. To get an editable version, please visit:

		http://dojotoolkit.org

	for documentation and information on getting the source.
*/

if(typeof dojo=="undefined"){
var dj_global=this;
var dj_currentContext=this;
function dj_undef(_1,_2){
return (typeof (_2||dj_currentContext)[_1]=="undefined");
}
if(dj_undef("djConfig",this)){
var djConfig={};
}
if(dj_undef("dojo",this)){
var dojo={};
}
dojo.global=function(){
return dj_currentContext;
};
dojo.locale=djConfig.locale;
dojo.version={major:0,minor:0,patch:0,flag:"dev",revision:Number("$Rev: 7616 $".match(/[0-9]+/)[0]),toString:function(){
with(dojo.version){
return major+"."+minor+"."+patch+flag+" ("+revision+")";
}
}};
dojo.evalProp=function(_3,_4,_5){
if((!_4)||(!_3)){
return undefined;
}
if(!dj_undef(_3,_4)){
return _4[_3];
}
return (_5?(_4[_3]={}):undefined);
};
dojo.parseObjPath=function(_6,_7,_8){
var _9=(_7||dojo.global());
var _a=_6.split(".");
var _b=_a.pop();
for(var i=0,l=_a.length;i<l&&_9;i++){
_9=dojo.evalProp(_a[i],_9,_8);
}
return {obj:_9,prop:_b};
};
dojo.evalObjPath=function(_e,_f){
if(typeof _e!="string"){
return dojo.global();
}
if(_e.indexOf(".")==-1){
return dojo.evalProp(_e,dojo.global(),_f);
}
var ref=dojo.parseObjPath(_e,dojo.global(),_f);
if(ref){
return dojo.evalProp(ref.prop,ref.obj,_f);
}
return null;
};
dojo.errorToString=function(_11){
if(!dj_undef("message",_11)){
return _11.message;
}else{
if(!dj_undef("description",_11)){
return _11.description;
}else{
return _11;
}
}
};
dojo.raise=function(_12,_13){
if(_13){
_12=_12+": "+dojo.errorToString(_13);
}else{
_12=dojo.errorToString(_12);
}
try{
if(djConfig.isDebug){
dojo.hostenv.println("FATAL exception raised: "+_12);
}
}
catch(e){
}
throw _13||Error(_12);
};
dojo.debug=function(){
};
dojo.debugShallow=function(obj){
};
dojo.profile={start:function(){
},end:function(){
},stop:function(){
},dump:function(){
}};
function dj_eval(_15){
return dj_global.eval?dj_global.eval(_15):eval(_15);
}
dojo.unimplemented=function(_16,_17){
var _18="'"+_16+"' not implemented";
if(_17!=null){
_18+=" "+_17;
}
dojo.raise(_18);
};
dojo.deprecated=function(_19,_1a,_1b){
var _1c="DEPRECATED: "+_19;
if(_1a){
_1c+=" "+_1a;
}
if(_1b){
_1c+=" -- will be removed in version: "+_1b;
}
dojo.debug(_1c);
};
dojo.render=(function(){
function vscaffold(_1d,_1e){
var tmp={capable:false,support:{builtin:false,plugin:false},prefixes:_1d};
for(var i=0;i<_1e.length;i++){
tmp[_1e[i]]=false;
}
return tmp;
}
return {name:"",ver:dojo.version,os:{win:false,linux:false,osx:false},html:vscaffold(["html"],["ie","opera","khtml","safari","moz"]),svg:vscaffold(["svg"],["corel","adobe","batik"]),vml:vscaffold(["vml"],["ie"]),swf:vscaffold(["Swf","Flash","Mm"],["mm"]),swt:vscaffold(["Swt"],["ibm"])};
})();
dojo.hostenv=(function(){
var _21={isDebug:false,allowQueryConfig:false,baseScriptUri:"",baseRelativePath:"",libraryScriptUri:"",iePreventClobber:false,ieClobberMinimal:true,preventBackButtonFix:true,delayMozLoadingFix:false,searchIds:[],parseWidgets:true};
if(typeof djConfig=="undefined"){
djConfig=_21;
}else{
for(var _22 in _21){
if(typeof djConfig[_22]=="undefined"){
djConfig[_22]=_21[_22];
}
}
}
return {name_:"(unset)",version_:"(unset)",getName:function(){
return this.name_;
},getVersion:function(){
return this.version_;
},getText:function(uri){
dojo.unimplemented("getText","uri="+uri);
}};
})();
dojo.hostenv.getBaseScriptUri=function(){
if(djConfig.baseScriptUri.length){
return djConfig.baseScriptUri;
}
var uri=new String(djConfig.libraryScriptUri||djConfig.baseRelativePath);
if(!uri){
dojo.raise("Nothing returned by getLibraryScriptUri(): "+uri);
}
var _25=uri.lastIndexOf("/");
djConfig.baseScriptUri=djConfig.baseRelativePath;
return djConfig.baseScriptUri;
};
(function(){
var _26={pkgFileName:"__package__",loading_modules_:{},loaded_modules_:{},addedToLoadingCount:[],removedFromLoadingCount:[],inFlightCount:0,modulePrefixes_:{dojo:{name:"dojo",value:"src"}},setModulePrefix:function(_27,_28){
this.modulePrefixes_[_27]={name:_27,value:_28};
},moduleHasPrefix:function(_29){
var mp=this.modulePrefixes_;
return Boolean(mp[_29]&&mp[_29].value);
},getModulePrefix:function(_2b){
if(this.moduleHasPrefix(_2b)){
return this.modulePrefixes_[_2b].value;
}
return _2b;
},getTextStack:[],loadUriStack:[],loadedUris:[],post_load_:false,modulesLoadedListeners:[],unloadListeners:[],loadNotifying:false};
for(var _2c in _26){
dojo.hostenv[_2c]=_26[_2c];
}
})();
dojo.hostenv.loadPath=function(_2d,_2e,cb){
var uri;
if(_2d.charAt(0)=="/"||_2d.match(/^\w+:/)){
uri=_2d;
}else{
uri=this.getBaseScriptUri()+_2d;
}
if(djConfig.cacheBust&&dojo.render.html.capable){
uri+="?"+String(djConfig.cacheBust).replace(/\W+/g,"");
}
try{
return !_2e?this.loadUri(uri,cb):this.loadUriAndCheck(uri,_2e,cb);
}
catch(e){
dojo.debug(e);
return false;
}
};
dojo.hostenv.loadUri=function(uri,cb){
if(this.loadedUris[uri]){
return true;
}
var _33=this.getText(uri,null,true);
if(!_33){
return false;
}
this.loadedUris[uri]=true;
if(cb){
_33="("+_33+")";
}
var _34=dj_eval(_33);
if(cb){
cb(_34);
}
return true;
};
dojo.hostenv.loadUriAndCheck=function(uri,_36,cb){
var ok=true;
try{
ok=this.loadUri(uri,cb);
}
catch(e){
dojo.debug("failed loading ",uri," with error: ",e);
}
return Boolean(ok&&this.findModule(_36,false));
};
dojo.loaded=function(){
};
dojo.unloaded=function(){
};
dojo.hostenv.loaded=function(){
this.loadNotifying=true;
this.post_load_=true;
var mll=this.modulesLoadedListeners;
for(var x=0;x<mll.length;x++){
mll[x]();
}
this.modulesLoadedListeners=[];
this.loadNotifying=false;
dojo.loaded();
};
dojo.hostenv.unloaded=function(){
var mll=this.unloadListeners;
while(mll.length){
(mll.pop())();
}
dojo.unloaded();
};
dojo.addOnLoad=function(obj,_3d){
var dh=dojo.hostenv;
if(arguments.length==1){
dh.modulesLoadedListeners.push(obj);
}else{
if(arguments.length>1){
dh.modulesLoadedListeners.push(function(){
obj[_3d]();
});
}
}
if(dh.post_load_&&dh.inFlightCount==0&&!dh.loadNotifying){
dh.callLoaded();
}
};
dojo.addOnUnload=function(obj,_40){
var dh=dojo.hostenv;
if(arguments.length==1){
dh.unloadListeners.push(obj);
}else{
if(arguments.length>1){
dh.unloadListeners.push(function(){
obj[_40]();
});
}
}
};
dojo.hostenv.modulesLoaded=function(){
if(this.post_load_){
return;
}
if(this.loadUriStack.length==0&&this.getTextStack.length==0){
if(this.inFlightCount>0){
dojo.debug("files still in flight!");
return;
}
dojo.hostenv.callLoaded();
}
};
dojo.hostenv.callLoaded=function(){
if(typeof setTimeout=="object"||(djConfig["useXDomain"]&&dojo.render.html.opera)){
setTimeout("dojo.hostenv.loaded();",0);
}else{
dojo.hostenv.loaded();
}
};
dojo.hostenv.getModuleSymbols=function(_42){
var _43=_42.split(".");
for(var i=_43.length;i>0;i--){
var _45=_43.slice(0,i).join(".");
if((i==1)&&!this.moduleHasPrefix(_45)){
_43[0]="../"+_43[0];
}else{
var _46=this.getModulePrefix(_45);
if(_46!=_45){
_43.splice(0,i,_46);
break;
}
}
}
return _43;
};
dojo.hostenv._global_omit_module_check=false;
dojo.hostenv.loadModule=function(_47,_48,_49){
if(!_47){
return;
}
_49=this._global_omit_module_check||_49;
var _4a=this.findModule(_47,false);
if(_4a){
return _4a;
}
if(dj_undef(_47,this.loading_modules_)){
this.addedToLoadingCount.push(_47);
}
this.loading_modules_[_47]=1;
var _4b=_47.replace(/\./g,"/")+".js";
var _4c=_47.split(".");
var _4d=this.getModuleSymbols(_47);
var _4e=((_4d[0].charAt(0)!="/")&&!_4d[0].match(/^\w+:/));
var _4f=_4d[_4d.length-1];
var ok;
if(_4f=="*"){
_47=_4c.slice(0,-1).join(".");
while(_4d.length){
_4d.pop();
_4d.push(this.pkgFileName);
_4b=_4d.join("/")+".js";
if(_4e&&_4b.charAt(0)=="/"){
_4b=_4b.slice(1);
}
ok=this.loadPath(_4b,!_49?_47:null);
if(ok){
break;
}
_4d.pop();
}
}else{
_4b=_4d.join("/")+".js";
_47=_4c.join(".");
var _51=!_49?_47:null;
ok=this.loadPath(_4b,_51);
if(!ok&&!_48){
_4d.pop();
while(_4d.length){
_4b=_4d.join("/")+".js";
ok=this.loadPath(_4b,_51);
if(ok){
break;
}
_4d.pop();
_4b=_4d.join("/")+"/"+this.pkgFileName+".js";
if(_4e&&_4b.charAt(0)=="/"){
_4b=_4b.slice(1);
}
ok=this.loadPath(_4b,_51);
if(ok){
break;
}
}
}
if(!ok&&!_49){
dojo.raise("Could not load '"+_47+"'; last tried '"+_4b+"'");
}
}
if(!_49&&!this["isXDomain"]){
_4a=this.findModule(_47,false);
if(!_4a){
dojo.raise("symbol '"+_47+"' is not defined after loading '"+_4b+"'");
}
}
return _4a;
};
dojo.hostenv.startPackage=function(_52){
var _53=String(_52);
var _54=_53;
var _55=_52.split(/\./);
if(_55[_55.length-1]=="*"){
_55.pop();
_54=_55.join(".");
}
var _56=dojo.evalObjPath(_54,true);
this.loaded_modules_[_53]=_56;
this.loaded_modules_[_54]=_56;
return _56;
};
dojo.hostenv.findModule=function(_57,_58){
var lmn=String(_57);
if(this.loaded_modules_[lmn]){
return this.loaded_modules_[lmn];
}
if(_58){
dojo.raise("no loaded module named '"+_57+"'");
}
return null;
};
dojo.kwCompoundRequire=function(_5a){
var _5b=_5a["common"]||[];
var _5c=_5a[dojo.hostenv.name_]?_5b.concat(_5a[dojo.hostenv.name_]||[]):_5b.concat(_5a["default"]||[]);
for(var x=0;x<_5c.length;x++){
var _5e=_5c[x];
if(_5e.constructor==Array){
dojo.hostenv.loadModule.apply(dojo.hostenv,_5e);
}else{
dojo.hostenv.loadModule(_5e);
}
}
};
dojo.require=function(_5f){
dojo.hostenv.loadModule.apply(dojo.hostenv,arguments);
};
dojo.requireIf=function(_60,_61){
var _62=arguments[0];
if((_62===true)||(_62=="common")||(_62&&dojo.render[_62].capable)){
var _63=[];
for(var i=1;i<arguments.length;i++){
_63.push(arguments[i]);
}
dojo.require.apply(dojo,_63);
}
};
dojo.requireAfterIf=dojo.requireIf;
dojo.provide=function(_65){
return dojo.hostenv.startPackage.apply(dojo.hostenv,arguments);
};
dojo.registerModulePath=function(_66,_67){
return dojo.hostenv.setModulePrefix(_66,_67);
};
if(djConfig["modulePaths"]){
for(var param in djConfig["modulePaths"]){
dojo.registerModulePath(param,djConfig["modulePaths"][param]);
}
}
dojo.setModulePrefix=function(_68,_69){
dojo.deprecated("dojo.setModulePrefix(\""+_68+"\", \""+_69+"\")","replaced by dojo.registerModulePath","0.5");
return dojo.registerModulePath(_68,_69);
};
dojo.exists=function(obj,_6b){
var p=_6b.split(".");
for(var i=0;i<p.length;i++){
if(!obj[p[i]]){
return false;
}
obj=obj[p[i]];
}
return true;
};
dojo.hostenv.normalizeLocale=function(_6e){
var _6f=_6e?_6e.toLowerCase():dojo.locale;
if(_6f=="root"){
_6f="ROOT";
}
return _6f;
};
dojo.hostenv.searchLocalePath=function(_70,_71,_72){
_70=dojo.hostenv.normalizeLocale(_70);
var _73=_70.split("-");
var _74=[];
for(var i=_73.length;i>0;i--){
_74.push(_73.slice(0,i).join("-"));
}
_74.push(false);
if(_71){
_74.reverse();
}
for(var j=_74.length-1;j>=0;j--){
var loc=_74[j]||"ROOT";
var _78=_72(loc);
if(_78){
break;
}
}
};
dojo.hostenv.localesGenerated;
dojo.hostenv.registerNlsPrefix=function(){
dojo.registerModulePath("nls","nls");
};
dojo.hostenv.preloadLocalizations=function(){
if(dojo.hostenv.localesGenerated){
dojo.hostenv.registerNlsPrefix();
function preload(_79){
_79=dojo.hostenv.normalizeLocale(_79);
dojo.hostenv.searchLocalePath(_79,true,function(loc){
for(var i=0;i<dojo.hostenv.localesGenerated.length;i++){
if(dojo.hostenv.localesGenerated[i]==loc){
dojo["require"]("nls.dojo_"+loc);
return true;
}
}
return false;
});
}
preload();
var _7c=djConfig.extraLocale||[];
for(var i=0;i<_7c.length;i++){
preload(_7c[i]);
}
}
dojo.hostenv.preloadLocalizations=function(){
};
};
dojo.requireLocalization=function(_7e,_7f,_80,_81){
dojo.hostenv.preloadLocalizations();
var _82=dojo.hostenv.normalizeLocale(_80);
var _83=[_7e,"nls",_7f].join(".");
var _84="";
if(_81){
var _85=_81.split(",");
for(var i=0;i<_85.length;i++){
if(_82.indexOf(_85[i])==0){
if(_85[i].length>_84.length){
_84=_85[i];
}
}
}
if(!_84){
_84="ROOT";
}
}
var _87=_81?_84:_82;
var _88=dojo.hostenv.findModule(_83);
var _89=null;
if(_88){
if(djConfig.localizationComplete&&_88._built){
return;
}
var _8a=_87.replace("-","_");
var _8b=_83+"."+_8a;
_89=dojo.hostenv.findModule(_8b);
}
if(!_89){
_88=dojo.hostenv.startPackage(_83);
var _8c=dojo.hostenv.getModuleSymbols(_7e);
var _8d=_8c.concat("nls").join("/");
var _8e;
dojo.hostenv.searchLocalePath(_87,_81,function(loc){
var _90=loc.replace("-","_");
var _91=_83+"."+_90;
var _92=false;
if(!dojo.hostenv.findModule(_91)){
dojo.hostenv.startPackage(_91);
var _93=[_8d];
if(loc!="ROOT"){
_93.push(loc);
}
_93.push(_7f);
var _94=_93.join("/")+".js";
_92=dojo.hostenv.loadPath(_94,null,function(_95){
var _96=function(){
};
_96.prototype=_8e;
_88[_90]=new _96();
for(var j in _95){
_88[_90][j]=_95[j];
}
});
}else{
_92=true;
}
if(_92&&_88[_90]){
_8e=_88[_90];
}else{
_88[_90]=_8e;
}
if(_81){
return true;
}
});
}
if(_81&&_82!=_84){
_88[_82.replace("-","_")]=_88[_84.replace("-","_")];
}
};
(function(){
var _98=djConfig.extraLocale;
if(_98){
if(!_98 instanceof Array){
_98=[_98];
}
var req=dojo.requireLocalization;
dojo.requireLocalization=function(m,b,_9c,_9d){
req(m,b,_9c,_9d);
if(_9c){
return;
}
for(var i=0;i<_98.length;i++){
req(m,b,_98[i],_9d);
}
};
}
})();
}
if(typeof window!="undefined"){
(function(){
if(djConfig.allowQueryConfig){
var _9f=document.location.toString();
var _a0=_9f.split("?",2);
if(_a0.length>1){
var _a1=_a0[1];
var _a2=_a1.split("&");
for(var x in _a2){
var sp=_a2[x].split("=");
if((sp[0].length>9)&&(sp[0].substr(0,9)=="djConfig.")){
var opt=sp[0].substr(9);
try{
djConfig[opt]=eval(sp[1]);
}
catch(e){
djConfig[opt]=sp[1];
}
}
}
}
}
if(((djConfig["baseScriptUri"]=="")||(djConfig["baseRelativePath"]==""))&&(document&&document.getElementsByTagName)){
var _a6=document.getElementsByTagName("script");
var _a7=/(__package__|dojo|bootstrap1)\.js([\?\.]|$)/i;
for(var i=0;i<_a6.length;i++){
var src=_a6[i].getAttribute("src");
if(!src){
continue;
}
var m=src.match(_a7);
if(m){
var _ab=src.substring(0,m.index);
if(src.indexOf("bootstrap1")>-1){
_ab+="../";
}
if(!this["djConfig"]){
djConfig={};
}
if(djConfig["baseScriptUri"]==""){
djConfig["baseScriptUri"]=_ab;
}
if(djConfig["baseRelativePath"]==""){
djConfig["baseRelativePath"]=_ab;
}
break;
}
}
}
var dr=dojo.render;
var drh=dojo.render.html;
var drs=dojo.render.svg;
var dua=(drh.UA=navigator.userAgent);
var dav=(drh.AV=navigator.appVersion);
var t=true;
var f=false;
drh.capable=t;
drh.support.builtin=t;
dr.ver=parseFloat(drh.AV);
dr.os.mac=dav.indexOf("Macintosh")>=0;
dr.os.win=dav.indexOf("Windows")>=0;
dr.os.linux=dav.indexOf("X11")>=0;
drh.opera=dua.indexOf("Opera")>=0;
drh.khtml=(dav.indexOf("Konqueror")>=0)||(dav.indexOf("Safari")>=0);
drh.safari=dav.indexOf("Safari")>=0;
var _b3=dua.indexOf("Gecko");
drh.mozilla=drh.moz=(_b3>=0)&&(!drh.khtml);
if(drh.mozilla){
drh.geckoVersion=dua.substring(_b3+6,_b3+14);
}
drh.ie=(document.all)&&(!drh.opera);
drh.ie50=drh.ie&&dav.indexOf("MSIE 5.0")>=0;
drh.ie55=drh.ie&&dav.indexOf("MSIE 5.5")>=0;
drh.ie60=drh.ie&&dav.indexOf("MSIE 6.0")>=0;
drh.ie70=drh.ie&&dav.indexOf("MSIE 7.0")>=0;
var cm=document["compatMode"];
drh.quirks=(cm=="BackCompat")||(cm=="QuirksMode")||drh.ie55||drh.ie50;
dojo.locale=dojo.locale||(drh.ie?navigator.userLanguage:navigator.language).toLowerCase();
dr.vml.capable=drh.ie;
drs.capable=f;
drs.support.plugin=f;
drs.support.builtin=f;
var _b5=window["document"];
var tdi=_b5["implementation"];
if((tdi)&&(tdi["hasFeature"])&&(tdi.hasFeature("org.w3c.dom.svg","1.0"))){
drs.capable=t;
drs.support.builtin=t;
drs.support.plugin=f;
}
if(drh.safari){
var tmp=dua.split("AppleWebKit/")[1];
var ver=parseFloat(tmp.split(" ")[0]);
if(ver>=420){
drs.capable=t;
drs.support.builtin=t;
drs.support.plugin=f;
}
}else{
}
})();
dojo.hostenv.startPackage("dojo.hostenv");
dojo.render.name=dojo.hostenv.name_="browser";
dojo.hostenv.searchIds=[];
dojo.hostenv._XMLHTTP_PROGIDS=["Msxml2.XMLHTTP","Microsoft.XMLHTTP","Msxml2.XMLHTTP.4.0"];
dojo.hostenv.getXmlhttpObject=function(){
var _b9=null;
var _ba=null;
try{
_b9=new XMLHttpRequest();
}
catch(e){
}
if(!_b9){
for(var i=0;i<3;++i){
var _bc=dojo.hostenv._XMLHTTP_PROGIDS[i];
try{
_b9=new ActiveXObject(_bc);
}
catch(e){
_ba=e;
}
if(_b9){
dojo.hostenv._XMLHTTP_PROGIDS=[_bc];
break;
}
}
}
if(!_b9){
return dojo.raise("XMLHTTP not available",_ba);
}
return _b9;
};
dojo.hostenv._blockAsync=false;
dojo.hostenv.getText=function(uri,_be,_bf){
if(!_be){
this._blockAsync=true;
}
var _c0=this.getXmlhttpObject();
function isDocumentOk(_c1){
var _c2=_c1["status"];
return Boolean((!_c2)||((200<=_c2)&&(300>_c2))||(_c2==304));
}
if(_be){
var _c3=this,_c4=null,gbl=dojo.global();
var xhr=dojo.evalObjPath("dojo.io.XMLHTTPTransport");
_c0.onreadystatechange=function(){
if(_c4){
gbl.clearTimeout(_c4);
_c4=null;
}
if(_c3._blockAsync||(xhr&&xhr._blockAsync)){
_c4=gbl.setTimeout(function(){
_c0.onreadystatechange.apply(this);
},10);
}else{
if(4==_c0.readyState){
if(isDocumentOk(_c0)){
_be(_c0.responseText);
}
}
}
};
}
_c0.open("GET",uri,_be?true:false);
try{
_c0.send(null);
if(_be){
return null;
}
if(!isDocumentOk(_c0)){
var err=Error("Unable to load "+uri+" status:"+_c0.status);
err.status=_c0.status;
err.responseText=_c0.responseText;
throw err;
}
}
catch(e){
this._blockAsync=false;
if((_bf)&&(!_be)){
return null;
}else{
throw e;
}
}
this._blockAsync=false;
return _c0.responseText;
};
dojo.hostenv.defaultDebugContainerId="dojoDebug";
dojo.hostenv._println_buffer=[];
dojo.hostenv._println_safe=false;
dojo.hostenv.println=function(_c8){
if(!dojo.hostenv._println_safe){
dojo.hostenv._println_buffer.push(_c8);
}else{
try{
var _c9=document.getElementById(djConfig.debugContainerId?djConfig.debugContainerId:dojo.hostenv.defaultDebugContainerId);
if(!_c9){
_c9=dojo.body();
}
var div=document.createElement("div");
div.appendChild(document.createTextNode(_c8));
_c9.appendChild(div);
}
catch(e){
try{
document.write("<div>"+_c8+"</div>");
}
catch(e2){
window.status=_c8;
}
}
}
};
dojo.addOnLoad(function(){
dojo.hostenv._println_safe=true;
while(dojo.hostenv._println_buffer.length>0){
dojo.hostenv.println(dojo.hostenv._println_buffer.shift());
}
});
function dj_addNodeEvtHdlr(_cb,_cc,fp){
var _ce=_cb["on"+_cc]||function(){
};
_cb["on"+_cc]=function(){
fp.apply(_cb,arguments);
_ce.apply(_cb,arguments);
};
return true;
}
function dj_load_init(e){
var _d0=(e&&e.type)?e.type.toLowerCase():"load";
if(arguments.callee.initialized||(_d0!="domcontentloaded"&&_d0!="load")){
return;
}
arguments.callee.initialized=true;
if(typeof (_timer)!="undefined"){
clearInterval(_timer);
delete _timer;
}
var _d1=function(){
if(dojo.render.html.ie){
dojo.hostenv.makeWidgets();
}
};
if(dojo.hostenv.inFlightCount==0){
_d1();
dojo.hostenv.modulesLoaded();
}else{
dojo.hostenv.modulesLoadedListeners.unshift(_d1);
}
}
if(document.addEventListener){
if(dojo.render.html.opera||(dojo.render.html.moz&&(djConfig["enableMozDomContentLoaded"]===true))){
document.addEventListener("DOMContentLoaded",dj_load_init,null);
}
window.addEventListener("load",dj_load_init,null);
}
if(dojo.render.html.ie&&dojo.render.os.win){
document.attachEvent("onreadystatechange",function(e){
if(document.readyState=="complete"){
dj_load_init();
}
});
}
if(/(WebKit|khtml)/i.test(navigator.userAgent)){
var _timer=setInterval(function(){
if(/loaded|complete/.test(document.readyState)){
dj_load_init();
}
},10);
}
if(dojo.render.html.ie){
dj_addNodeEvtHdlr(window,"beforeunload",function(){
dojo.hostenv._unloading=true;
window.setTimeout(function(){
dojo.hostenv._unloading=false;
},0);
});
}
dj_addNodeEvtHdlr(window,"unload",function(){
dojo.hostenv.unloaded();
if((!dojo.render.html.ie)||(dojo.render.html.ie&&dojo.hostenv._unloading)){
dojo.hostenv.unloaded();
}
});
dojo.hostenv.makeWidgets=function(){
var _d3=[];
if(djConfig.searchIds&&djConfig.searchIds.length>0){
_d3=_d3.concat(djConfig.searchIds);
}
if(dojo.hostenv.searchIds&&dojo.hostenv.searchIds.length>0){
_d3=_d3.concat(dojo.hostenv.searchIds);
}
if((djConfig.parseWidgets)||(_d3.length>0)){
if(dojo.evalObjPath("dojo.widget.Parse")){
var _d4=new dojo.xml.Parse();
if(_d3.length>0){
for(var x=0;x<_d3.length;x++){
var _d6=document.getElementById(_d3[x]);
if(!_d6){
continue;
}
var _d7=_d4.parseElement(_d6,null,true);
dojo.widget.getParser().createComponents(_d7);
}
}else{
if(djConfig.parseWidgets){
var _d7=_d4.parseElement(dojo.body(),null,true);
dojo.widget.getParser().createComponents(_d7);
}
}
}
}
};
dojo.addOnLoad(function(){
if(!dojo.render.html.ie){
dojo.hostenv.makeWidgets();
}
});
try{
if(dojo.render.html.ie){
document.namespaces.add("v","urn:schemas-microsoft-com:vml");
document.createStyleSheet().addRule("v\\:*","behavior:url(#default#VML)");
}
}
catch(e){
}
dojo.hostenv.writeIncludes=function(){
};
if(!dj_undef("document",this)){
dj_currentDocument=this.document;
}
dojo.doc=function(){
return dj_currentDocument;
};
dojo.body=function(){
return dojo.doc().body||dojo.doc().getElementsByTagName("body")[0];
};
dojo.byId=function(id,doc){
if((id)&&((typeof id=="string")||(id instanceof String))){
if(!doc){
doc=dj_currentDocument;
}
var ele=doc.getElementById(id);
if(ele&&(ele.id!=id)&&doc.all){
ele=null;
eles=doc.all[id];
if(eles){
if(eles.length){
for(var i=0;i<eles.length;i++){
if(eles[i].id==id){
ele=eles[i];
break;
}
}
}else{
ele=eles;
}
}
}
return ele;
}
return id;
};
dojo.setContext=function(_dc,_dd){
dj_currentContext=_dc;
dj_currentDocument=_dd;
};
dojo._fireCallback=function(_de,_df,_e0){
if((_df)&&((typeof _de=="string")||(_de instanceof String))){
_de=_df[_de];
}
return (_df?_de.apply(_df,_e0||[]):_de());
};
dojo.withGlobal=function(_e1,_e2,_e3,_e4){
var _e5;
var _e6=dj_currentContext;
var _e7=dj_currentDocument;
try{
dojo.setContext(_e1,_e1.document);
_e5=dojo._fireCallback(_e2,_e3,_e4);
}
finally{
dojo.setContext(_e6,_e7);
}
return _e5;
};
dojo.withDoc=function(_e8,_e9,_ea,_eb){
var _ec;
var _ed=dj_currentDocument;
try{
dj_currentDocument=_e8;
_ec=dojo._fireCallback(_e9,_ea,_eb);
}
finally{
dj_currentDocument=_ed;
}
return _ec;
};
}
dojo.requireIf((djConfig["isDebug"]||djConfig["debugAtAllCosts"]),"dojo.debug");
dojo.requireIf(djConfig["debugAtAllCosts"]&&!window.widget&&!djConfig["useXDomain"],"dojo.browser_debug");
dojo.requireIf(djConfig["debugAtAllCosts"]&&!window.widget&&djConfig["useXDomain"],"dojo.browser_debug_xd");
dojo.provide("dojo.ns");
dojo.ns={namespaces:{},failed:{},loading:{},loaded:{},register:function(_ee,_ef,_f0,_f1){
if(!_f1||!this.namespaces[_ee]){
this.namespaces[_ee]=new dojo.ns.Ns(_ee,_ef,_f0);
}
},allow:function(_f2){
if(this.failed[_f2]){
return false;
}
if((djConfig.excludeNamespace)&&(dojo.lang.inArray(djConfig.excludeNamespace,_f2))){
return false;
}
return ((_f2==this.dojo)||(!djConfig.includeNamespace)||(dojo.lang.inArray(djConfig.includeNamespace,_f2)));
},get:function(_f3){
return this.namespaces[_f3];
},require:function(_f4){
var ns=this.namespaces[_f4];
if((ns)&&(this.loaded[_f4])){
return ns;
}
if(!this.allow(_f4)){
return false;
}
if(this.loading[_f4]){
dojo.debug("dojo.namespace.require: re-entrant request to load namespace \""+_f4+"\" must fail.");
return false;
}
var req=dojo.require;
this.loading[_f4]=true;
try{
if(_f4=="dojo"){
req("dojo.namespaces.dojo");
}else{
if(!dojo.hostenv.moduleHasPrefix(_f4)){
dojo.registerModulePath(_f4,"../"+_f4);
}
req([_f4,"manifest"].join("."),false,true);
}
if(!this.namespaces[_f4]){
this.failed[_f4]=true;
}
}
finally{
this.loading[_f4]=false;
}
return this.namespaces[_f4];
}};
dojo.ns.Ns=function(_f7,_f8,_f9){
this.name=_f7;
this.module=_f8;
this.resolver=_f9;
this._loaded=[];
this._failed=[];
};
dojo.ns.Ns.prototype.resolve=function(_fa,_fb,_fc){
if(!this.resolver||djConfig["skipAutoRequire"]){
return false;
}
var _fd=this.resolver(_fa,_fb);
if((_fd)&&(!this._loaded[_fd])&&(!this._failed[_fd])){
var req=dojo.require;
req(_fd,false,true);
if(dojo.hostenv.findModule(_fd,false)){
this._loaded[_fd]=true;
}else{
if(!_fc){
dojo.raise("dojo.ns.Ns.resolve: module '"+_fd+"' not found after loading via namespace '"+this.name+"'");
}
this._failed[_fd]=true;
}
}
return Boolean(this._loaded[_fd]);
};
dojo.registerNamespace=function(_ff,_100,_101){
dojo.ns.register.apply(dojo.ns,arguments);
};
dojo.registerNamespaceResolver=function(name,_103){
var n=dojo.ns.namespaces[name];
if(n){
n.resolver=_103;
}
};
dojo.registerNamespaceManifest=function(_105,path,name,_108,_109){
dojo.registerModulePath(name,path);
dojo.registerNamespace(name,_108,_109);
};
dojo.registerNamespace("dojo","dojo.widget");
dojo.provide("dojo.namespaces.dojo");
(function(){
var map={html:{"accordioncontainer":"dojo.widget.AccordionContainer","animatedpng":"dojo.widget.AnimatedPng","button":"dojo.widget.Button","chart":"dojo.widget.Chart","checkbox":"dojo.widget.Checkbox","clock":"dojo.widget.Clock","colorpalette":"dojo.widget.ColorPalette","combobox":"dojo.widget.ComboBox","combobutton":"dojo.widget.Button","contentpane":"dojo.widget.ContentPane","currencytextbox":"dojo.widget.CurrencyTextbox","datepicker":"dojo.widget.DatePicker","datetextbox":"dojo.widget.DateTextbox","debugconsole":"dojo.widget.DebugConsole","dialog":"dojo.widget.Dialog","dropdownbutton":"dojo.widget.Button","dropdowndatepicker":"dojo.widget.DropdownDatePicker","dropdowntimepicker":"dojo.widget.DropdownTimePicker","emaillisttextbox":"dojo.widget.InternetTextbox","emailtextbox":"dojo.widget.InternetTextbox","editor":"dojo.widget.Editor","editor2":"dojo.widget.Editor2","filteringtable":"dojo.widget.FilteringTable","fisheyelist":"dojo.widget.FisheyeList","fisheyelistitem":"dojo.widget.FisheyeList","floatingpane":"dojo.widget.FloatingPane","modalfloatingpane":"dojo.widget.FloatingPane","form":"dojo.widget.Form","googlemap":"dojo.widget.GoogleMap","inlineeditbox":"dojo.widget.InlineEditBox","integerspinner":"dojo.widget.Spinner","integertextbox":"dojo.widget.IntegerTextbox","ipaddresstextbox":"dojo.widget.InternetTextbox","layoutcontainer":"dojo.widget.LayoutContainer","linkpane":"dojo.widget.LinkPane","popupmenu2":"dojo.widget.Menu2","menuitem2":"dojo.widget.Menu2","menuseparator2":"dojo.widget.Menu2","menubar2":"dojo.widget.Menu2","menubaritem2":"dojo.widget.Menu2","pagecontainer":"dojo.widget.PageContainer","pagecontroller":"dojo.widget.PageContainer","popupcontainer":"dojo.widget.PopupContainer","progressbar":"dojo.widget.ProgressBar","radiogroup":"dojo.widget.RadioGroup","realnumbertextbox":"dojo.widget.RealNumberTextbox","regexptextbox":"dojo.widget.RegexpTextbox","repeater":"dojo.widget.Repeater","resizabletextarea":"dojo.widget.ResizableTextarea","richtext":"dojo.widget.RichText","select":"dojo.widget.Select","show":"dojo.widget.Show","showaction":"dojo.widget.ShowAction","showslide":"dojo.widget.ShowSlide","slidervertical":"dojo.widget.Slider","sliderhorizontal":"dojo.widget.Slider","slider":"dojo.widget.Slider","slideshow":"dojo.widget.SlideShow","sortabletable":"dojo.widget.SortableTable","splitcontainer":"dojo.widget.SplitContainer","tabcontainer":"dojo.widget.TabContainer","tabcontroller":"dojo.widget.TabContainer","taskbar":"dojo.widget.TaskBar","textbox":"dojo.widget.Textbox","timepicker":"dojo.widget.TimePicker","timetextbox":"dojo.widget.DateTextbox","titlepane":"dojo.widget.TitlePane","toaster":"dojo.widget.Toaster","toggler":"dojo.widget.Toggler","toolbar":"dojo.widget.Toolbar","toolbarcontainer":"dojo.widget.Toolbar","toolbaritem":"dojo.widget.Toolbar","toolbarbuttongroup":"dojo.widget.Toolbar","toolbarbutton":"dojo.widget.Toolbar","toolbardialog":"dojo.widget.Toolbar","toolbarmenu":"dojo.widget.Toolbar","toolbarseparator":"dojo.widget.Toolbar","toolbarspace":"dojo.widget.Toolbar","toolbarselect":"dojo.widget.Toolbar","toolbarcolordialog":"dojo.widget.Toolbar","tooltip":"dojo.widget.Tooltip","tree":"dojo.widget.Tree","treebasiccontroller":"dojo.widget.TreeBasicController","treecontextmenu":"dojo.widget.TreeContextMenu","treedisablewrapextension":"dojo.widget.TreeDisableWrapExtension","treedociconextension":"dojo.widget.TreeDocIconExtension","treeeditor":"dojo.widget.TreeEditor","treeemphasizeonselect":"dojo.widget.TreeEmphasizeOnSelect","treeexpandtonodeonselect":"dojo.widget.TreeExpandToNodeOnSelect","treelinkextension":"dojo.widget.TreeLinkExtension","treeloadingcontroller":"dojo.widget.TreeLoadingController","treemenuitem":"dojo.widget.TreeContextMenu","treenode":"dojo.widget.TreeNode","treerpccontroller":"dojo.widget.TreeRPCController","treeselector":"dojo.widget.TreeSelector","treetoggleonselect":"dojo.widget.TreeToggleOnSelect","treev3":"dojo.widget.TreeV3","treebasiccontrollerv3":"dojo.widget.TreeBasicControllerV3","treecontextmenuv3":"dojo.widget.TreeContextMenuV3","treedndcontrollerv3":"dojo.widget.TreeDndControllerV3","treeloadingcontrollerv3":"dojo.widget.TreeLoadingControllerV3","treemenuitemv3":"dojo.widget.TreeContextMenuV3","treerpccontrollerv3":"dojo.widget.TreeRpcControllerV3","treeselectorv3":"dojo.widget.TreeSelectorV3","urltextbox":"dojo.widget.InternetTextbox","usphonenumbertextbox":"dojo.widget.UsTextbox","ussocialsecuritynumbertextbox":"dojo.widget.UsTextbox","usstatetextbox":"dojo.widget.UsTextbox","usziptextbox":"dojo.widget.UsTextbox","validationtextbox":"dojo.widget.ValidationTextbox","treeloadingcontroller":"dojo.widget.TreeLoadingController","wizardcontainer":"dojo.widget.Wizard","wizardpane":"dojo.widget.Wizard","yahoomap":"dojo.widget.YahooMap"},svg:{"chart":"dojo.widget.svg.Chart"},vml:{"chart":"dojo.widget.vml.Chart"}};
dojo.addDojoNamespaceMapping=function(_10b,_10c){
map[_10b]=_10c;
};
function dojoNamespaceResolver(name,_10e){
if(!_10e){
_10e="html";
}
if(!map[_10e]){
return null;
}
return map[_10e][name];
}
dojo.registerNamespaceResolver("dojo",dojoNamespaceResolver);
})();
dojo.provide("dojo.lang.common");
dojo.lang.inherits=function(_10f,_110){
if(!dojo.lang.isFunction(_110)){
dojo.raise("dojo.inherits: superclass argument ["+_110+"] must be a function (subclass: ["+_10f+"']");
}
_10f.prototype=new _110();
_10f.prototype.constructor=_10f;
_10f.superclass=_110.prototype;
_10f["super"]=_110.prototype;
};
dojo.lang._mixin=function(obj,_112){
var tobj={};
for(var x in _112){
if((typeof tobj[x]=="undefined")||(tobj[x]!=_112[x])){
obj[x]=_112[x];
}
}
if(dojo.render.html.ie&&(typeof (_112["toString"])=="function")&&(_112["toString"]!=obj["toString"])&&(_112["toString"]!=tobj["toString"])){
obj.toString=_112.toString;
}
return obj;
};
dojo.lang.mixin=function(obj,_116){
for(var i=1,l=arguments.length;i<l;i++){
dojo.lang._mixin(obj,arguments[i]);
}
return obj;
};
dojo.lang.extend=function(_119,_11a){
for(var i=1,l=arguments.length;i<l;i++){
dojo.lang._mixin(_119.prototype,arguments[i]);
}
return _119;
};
dojo.inherits=dojo.lang.inherits;
dojo.mixin=dojo.lang.mixin;
dojo.extend=dojo.lang.extend;
dojo.lang.find=function(_11d,_11e,_11f,_120){
if(!dojo.lang.isArrayLike(_11d)&&dojo.lang.isArrayLike(_11e)){
dojo.deprecated("dojo.lang.find(value, array)","use dojo.lang.find(array, value) instead","0.5");
var temp=_11d;
_11d=_11e;
_11e=temp;
}
var _122=dojo.lang.isString(_11d);
if(_122){
_11d=_11d.split("");
}
if(_120){
var step=-1;
var i=_11d.length-1;
var end=-1;
}else{
var step=1;
var i=0;
var end=_11d.length;
}
if(_11f){
while(i!=end){
if(_11d[i]===_11e){
return i;
}
i+=step;
}
}else{
while(i!=end){
if(_11d[i]==_11e){
return i;
}
i+=step;
}
}
return -1;
};
dojo.lang.indexOf=dojo.lang.find;
dojo.lang.findLast=function(_126,_127,_128){
return dojo.lang.find(_126,_127,_128,true);
};
dojo.lang.lastIndexOf=dojo.lang.findLast;
dojo.lang.inArray=function(_129,_12a){
return dojo.lang.find(_129,_12a)>-1;
};
dojo.lang.isObject=function(it){
if(typeof it=="undefined"){
return false;
}
return (typeof it=="object"||it===null||dojo.lang.isArray(it)||dojo.lang.isFunction(it));
};
dojo.lang.isArray=function(it){
return (it&&it instanceof Array||typeof it=="array");
};
dojo.lang.isArrayLike=function(it){
if((!it)||(dojo.lang.isUndefined(it))){
return false;
}
if(dojo.lang.isString(it)){
return false;
}
if(dojo.lang.isFunction(it)){
return false;
}
if(dojo.lang.isArray(it)){
return true;
}
if((it.tagName)&&(it.tagName.toLowerCase()=="form")){
return false;
}
if(dojo.lang.isNumber(it.length)&&isFinite(it.length)){
return true;
}
return false;
};
dojo.lang.isFunction=function(it){
return (it instanceof Function||typeof it=="function");
};
(function(){
if((dojo.render.html.capable)&&(dojo.render.html["safari"])){
dojo.lang.isFunction=function(it){
if((typeof (it)=="function")&&(it=="[object NodeList]")){
return false;
}
return (it instanceof Function||typeof it=="function");
};
}
})();
dojo.lang.isString=function(it){
return (typeof it=="string"||it instanceof String);
};
dojo.lang.isAlien=function(it){
if(!it){
return false;
}
return !dojo.lang.isFunction(it)&&/\{\s*\[native code\]\s*\}/.test(String(it));
};
dojo.lang.isBoolean=function(it){
return (it instanceof Boolean||typeof it=="boolean");
};
dojo.lang.isNumber=function(it){
return (it instanceof Number||typeof it=="number");
};
dojo.lang.isUndefined=function(it){
return ((typeof (it)=="undefined")&&(it==undefined));
};
dojo.provide("dojo.dom");
dojo.dom.ELEMENT_NODE=1;
dojo.dom.ATTRIBUTE_NODE=2;
dojo.dom.TEXT_NODE=3;
dojo.dom.CDATA_SECTION_NODE=4;
dojo.dom.ENTITY_REFERENCE_NODE=5;
dojo.dom.ENTITY_NODE=6;
dojo.dom.PROCESSING_INSTRUCTION_NODE=7;
dojo.dom.COMMENT_NODE=8;
dojo.dom.DOCUMENT_NODE=9;
dojo.dom.DOCUMENT_TYPE_NODE=10;
dojo.dom.DOCUMENT_FRAGMENT_NODE=11;
dojo.dom.NOTATION_NODE=12;
dojo.dom.dojoml="http://www.dojotoolkit.org/2004/dojoml";
dojo.dom.xmlns={svg:"http://www.w3.org/2000/svg",smil:"http://www.w3.org/2001/SMIL20/",mml:"http://www.w3.org/1998/Math/MathML",cml:"http://www.xml-cml.org",xlink:"http://www.w3.org/1999/xlink",xhtml:"http://www.w3.org/1999/xhtml",xul:"http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",xbl:"http://www.mozilla.org/xbl",fo:"http://www.w3.org/1999/XSL/Format",xsl:"http://www.w3.org/1999/XSL/Transform",xslt:"http://www.w3.org/1999/XSL/Transform",xi:"http://www.w3.org/2001/XInclude",xforms:"http://www.w3.org/2002/01/xforms",saxon:"http://icl.com/saxon",xalan:"http://xml.apache.org/xslt",xsd:"http://www.w3.org/2001/XMLSchema",dt:"http://www.w3.org/2001/XMLSchema-datatypes",xsi:"http://www.w3.org/2001/XMLSchema-instance",rdf:"http://www.w3.org/1999/02/22-rdf-syntax-ns#",rdfs:"http://www.w3.org/2000/01/rdf-schema#",dc:"http://purl.org/dc/elements/1.1/",dcq:"http://purl.org/dc/qualifiers/1.0","soap-env":"http://schemas.xmlsoap.org/soap/envelope/",wsdl:"http://schemas.xmlsoap.org/wsdl/",AdobeExtensions:"http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"};
dojo.dom.isNode=function(wh){
if(typeof Element=="function"){
try{
return wh instanceof Element;
}
catch(e){
}
}else{
return wh&&!isNaN(wh.nodeType);
}
};
dojo.dom.getUniqueId=function(){
var _136=dojo.doc();
do{
var id="dj_unique_"+(++arguments.callee._idIncrement);
}while(_136.getElementById(id));
return id;
};
dojo.dom.getUniqueId._idIncrement=0;
dojo.dom.firstElement=dojo.dom.getFirstChildElement=function(_138,_139){
var node=_138.firstChild;
while(node&&node.nodeType!=dojo.dom.ELEMENT_NODE){
node=node.nextSibling;
}
if(_139&&node&&node.tagName&&node.tagName.toLowerCase()!=_139.toLowerCase()){
node=dojo.dom.nextElement(node,_139);
}
return node;
};
dojo.dom.lastElement=dojo.dom.getLastChildElement=function(_13b,_13c){
var node=_13b.lastChild;
while(node&&node.nodeType!=dojo.dom.ELEMENT_NODE){
node=node.previousSibling;
}
if(_13c&&node&&node.tagName&&node.tagName.toLowerCase()!=_13c.toLowerCase()){
node=dojo.dom.prevElement(node,_13c);
}
return node;
};
dojo.dom.nextElement=dojo.dom.getNextSiblingElement=function(node,_13f){
if(!node){
return null;
}
do{
node=node.nextSibling;
}while(node&&node.nodeType!=dojo.dom.ELEMENT_NODE);
if(node&&_13f&&_13f.toLowerCase()!=node.tagName.toLowerCase()){
return dojo.dom.nextElement(node,_13f);
}
return node;
};
dojo.dom.prevElement=dojo.dom.getPreviousSiblingElement=function(node,_141){
if(!node){
return null;
}
if(_141){
_141=_141.toLowerCase();
}
do{
node=node.previousSibling;
}while(node&&node.nodeType!=dojo.dom.ELEMENT_NODE);
if(node&&_141&&_141.toLowerCase()!=node.tagName.toLowerCase()){
return dojo.dom.prevElement(node,_141);
}
return node;
};
dojo.dom.moveChildren=function(_142,_143,trim){
var _145=0;
if(trim){
while(_142.hasChildNodes()&&_142.firstChild.nodeType==dojo.dom.TEXT_NODE){
_142.removeChild(_142.firstChild);
}
while(_142.hasChildNodes()&&_142.lastChild.nodeType==dojo.dom.TEXT_NODE){
_142.removeChild(_142.lastChild);
}
}
while(_142.hasChildNodes()){
_143.appendChild(_142.firstChild);
_145++;
}
return _145;
};
dojo.dom.copyChildren=function(_146,_147,trim){
var _149=_146.cloneNode(true);
return this.moveChildren(_149,_147,trim);
};
dojo.dom.replaceChildren=function(node,_14b){
var _14c=[];
if(dojo.render.html.ie){
for(var i=0;i<node.childNodes.length;i++){
_14c.push(node.childNodes[i]);
}
}
dojo.dom.removeChildren(node);
node.appendChild(_14b);
for(var i=0;i<_14c.length;i++){
dojo.dom.destroyNode(_14c[i]);
}
};
dojo.dom.removeChildren=function(node){
var _14f=node.childNodes.length;
while(node.hasChildNodes()){
dojo.dom.removeNode(node.firstChild);
}
return _14f;
};
dojo.dom.replaceNode=function(node,_151){
return node.parentNode.replaceChild(_151,node);
};
dojo.dom.destroyNode=function(node){
if(node.parentNode){
node=dojo.dom.removeNode(node);
}
if(node.nodeType!=3){
if(dojo.evalObjPath("dojo.event.browser.clean",false)){
dojo.event.browser.clean(node);
}
if(dojo.render.html.ie){
node.outerHTML="";
}
}
};
dojo.dom.removeNode=function(node){
if(node&&node.parentNode){
return node.parentNode.removeChild(node);
}
};
dojo.dom.getAncestors=function(node,_155,_156){
var _157=[];
var _158=(_155&&(_155 instanceof Function||typeof _155=="function"));
while(node){
if(!_158||_155(node)){
_157.push(node);
}
if(_156&&_157.length>0){
return _157[0];
}
node=node.parentNode;
}
if(_156){
return null;
}
return _157;
};
dojo.dom.getAncestorsByTag=function(node,tag,_15b){
tag=tag.toLowerCase();
return dojo.dom.getAncestors(node,function(el){
return ((el.tagName)&&(el.tagName.toLowerCase()==tag));
},_15b);
};
dojo.dom.getFirstAncestorByTag=function(node,tag){
return dojo.dom.getAncestorsByTag(node,tag,true);
};
dojo.dom.isDescendantOf=function(node,_160,_161){
if(_161&&node){
node=node.parentNode;
}
while(node){
if(node==_160){
return true;
}
node=node.parentNode;
}
return false;
};
dojo.dom.innerXML=function(node){
if(node.innerXML){
return node.innerXML;
}else{
if(node.xml){
return node.xml;
}else{
if(typeof XMLSerializer!="undefined"){
return (new XMLSerializer()).serializeToString(node);
}
}
}
};
dojo.dom.createDocument=function(){
var doc=null;
var _164=dojo.doc();
if(!dj_undef("ActiveXObject")){
var _165=["MSXML2","Microsoft","MSXML","MSXML3"];
for(var i=0;i<_165.length;i++){
try{
doc=new ActiveXObject(_165[i]+".XMLDOM");
}
catch(e){
}
if(doc){
break;
}
}
}else{
if((_164.implementation)&&(_164.implementation.createDocument)){
doc=_164.implementation.createDocument("","",null);
}
}
return doc;
};
dojo.dom.createDocumentFromText=function(str,_168){
if(!_168){
_168="text/xml";
}
if(!dj_undef("DOMParser")){
var _169=new DOMParser();
return _169.parseFromString(str,_168);
}else{
if(!dj_undef("ActiveXObject")){
var _16a=dojo.dom.createDocument();
if(_16a){
_16a.async=false;
_16a.loadXML(str);
return _16a;
}else{
dojo.debug("toXml didn't work?");
}
}else{
var _16b=dojo.doc();
if(_16b.createElement){
var tmp=_16b.createElement("xml");
tmp.innerHTML=str;
if(_16b.implementation&&_16b.implementation.createDocument){
var _16d=_16b.implementation.createDocument("foo","",null);
for(var i=0;i<tmp.childNodes.length;i++){
_16d.importNode(tmp.childNodes.item(i),true);
}
return _16d;
}
return ((tmp.document)&&(tmp.document.firstChild?tmp.document.firstChild:tmp));
}
}
}
return null;
};
dojo.dom.prependChild=function(node,_170){
if(_170.firstChild){
_170.insertBefore(node,_170.firstChild);
}else{
_170.appendChild(node);
}
return true;
};
dojo.dom.insertBefore=function(node,ref,_173){
if((_173!=true)&&(node===ref||node.nextSibling===ref)){
return false;
}
var _174=ref.parentNode;
_174.insertBefore(node,ref);
return true;
};
dojo.dom.insertAfter=function(node,ref,_177){
var pn=ref.parentNode;
if(ref==pn.lastChild){
if((_177!=true)&&(node===ref)){
return false;
}
pn.appendChild(node);
}else{
return this.insertBefore(node,ref.nextSibling,_177);
}
return true;
};
dojo.dom.insertAtPosition=function(node,ref,_17b){
if((!node)||(!ref)||(!_17b)){
return false;
}
switch(_17b.toLowerCase()){
case "before":
return dojo.dom.insertBefore(node,ref);
case "after":
return dojo.dom.insertAfter(node,ref);
case "first":
if(ref.firstChild){
return dojo.dom.insertBefore(node,ref.firstChild);
}else{
ref.appendChild(node);
return true;
}
break;
default:
ref.appendChild(node);
return true;
}
};
dojo.dom.insertAtIndex=function(node,_17d,_17e){
var _17f=_17d.childNodes;
if(!_17f.length||_17f.length==_17e){
_17d.appendChild(node);
return true;
}
if(_17e==0){
return dojo.dom.prependChild(node,_17d);
}
return dojo.dom.insertAfter(node,_17f[_17e-1]);
};
dojo.dom.textContent=function(node,text){
if(arguments.length>1){
var _182=dojo.doc();
dojo.dom.replaceChildren(node,_182.createTextNode(text));
return text;
}else{
if(node.textContent!=undefined){
return node.textContent;
}
var _183="";
if(node==null){
return _183;
}
for(var i=0;i<node.childNodes.length;i++){
switch(node.childNodes[i].nodeType){
case 1:
case 5:
_183+=dojo.dom.textContent(node.childNodes[i]);
break;
case 3:
case 2:
case 4:
_183+=node.childNodes[i].nodeValue;
break;
default:
break;
}
}
return _183;
}
};
dojo.dom.hasParent=function(node){
return Boolean(node&&node.parentNode&&dojo.dom.isNode(node.parentNode));
};
dojo.dom.isTag=function(node){
if(node&&node.tagName){
for(var i=1;i<arguments.length;i++){
if(node.tagName==String(arguments[i])){
return String(arguments[i]);
}
}
}
return "";
};
dojo.dom.setAttributeNS=function(elem,_189,_18a,_18b){
if(elem==null||((elem==undefined)&&(typeof elem=="undefined"))){
dojo.raise("No element given to dojo.dom.setAttributeNS");
}
if(!((elem.setAttributeNS==undefined)&&(typeof elem.setAttributeNS=="undefined"))){
elem.setAttributeNS(_189,_18a,_18b);
}else{
var _18c=elem.ownerDocument;
var _18d=_18c.createNode(2,_18a,_189);
_18d.nodeValue=_18b;
elem.setAttributeNode(_18d);
}
};
dojo.provide("dojo.html.common");
dojo.lang.mixin(dojo.html,dojo.dom);
dojo.html.body=function(){
dojo.deprecated("dojo.html.body() moved to dojo.body()","0.5");
return dojo.body();
};
dojo.html.getEventTarget=function(evt){
if(!evt){
evt=dojo.global().event||{};
}
var t=(evt.srcElement?evt.srcElement:(evt.target?evt.target:null));
while((t)&&(t.nodeType!=1)){
t=t.parentNode;
}
return t;
};
dojo.html.getViewport=function(){
var _190=dojo.global();
var _191=dojo.doc();
var w=0;
var h=0;
if(dojo.render.html.mozilla){
w=_191.documentElement.clientWidth;
h=_190.innerHeight;
}else{
if(!dojo.render.html.opera&&_190.innerWidth){
w=_190.innerWidth;
h=_190.innerHeight;
}else{
if(!dojo.render.html.opera&&dojo.exists(_191,"documentElement.clientWidth")){
var w2=_191.documentElement.clientWidth;
if(!w||w2&&w2<w){
w=w2;
}
h=_191.documentElement.clientHeight;
}else{
if(dojo.body().clientWidth){
w=dojo.body().clientWidth;
h=dojo.body().clientHeight;
}
}
}
}
return {width:w,height:h};
};
dojo.html.getScroll=function(){
var _195=dojo.global();
var _196=dojo.doc();
var top=_195.pageYOffset||_196.documentElement.scrollTop||dojo.body().scrollTop||0;
var left=_195.pageXOffset||_196.documentElement.scrollLeft||dojo.body().scrollLeft||0;
return {top:top,left:left,offset:{x:left,y:top}};
};
dojo.html.getParentByType=function(node,type){
var _19b=dojo.doc();
var _19c=dojo.byId(node);
type=type.toLowerCase();
while((_19c)&&(_19c.nodeName.toLowerCase()!=type)){
if(_19c==(_19b["body"]||_19b["documentElement"])){
return null;
}
_19c=_19c.parentNode;
}
return _19c;
};
dojo.html.getAttribute=function(node,attr){
node=dojo.byId(node);
if((!node)||(!node.getAttribute)){
return null;
}
var ta=typeof attr=="string"?attr:new String(attr);
var v=node.getAttribute(ta.toUpperCase());
if((v)&&(typeof v=="string")&&(v!="")){
return v;
}
if(v&&v.value){
return v.value;
}
if((node.getAttributeNode)&&(node.getAttributeNode(ta))){
return (node.getAttributeNode(ta)).value;
}else{
if(node.getAttribute(ta)){
return node.getAttribute(ta);
}else{
if(node.getAttribute(ta.toLowerCase())){
return node.getAttribute(ta.toLowerCase());
}
}
}
return null;
};
dojo.html.hasAttribute=function(node,attr){
return dojo.html.getAttribute(dojo.byId(node),attr)?true:false;
};
dojo.html.getCursorPosition=function(e){
e=e||dojo.global().event;
var _1a4={x:0,y:0};
if(e.pageX||e.pageY){
_1a4.x=e.pageX;
_1a4.y=e.pageY;
}else{
var de=dojo.doc().documentElement;
var db=dojo.body();
_1a4.x=e.clientX+((de||db)["scrollLeft"])-((de||db)["clientLeft"]);
_1a4.y=e.clientY+((de||db)["scrollTop"])-((de||db)["clientTop"]);
}
return _1a4;
};
dojo.html.isTag=function(node){
node=dojo.byId(node);
if(node&&node.tagName){
for(var i=1;i<arguments.length;i++){
if(node.tagName.toLowerCase()==String(arguments[i]).toLowerCase()){
return String(arguments[i]).toLowerCase();
}
}
}
return "";
};
if(dojo.render.html.ie&&!dojo.render.html.ie70){
if(window.location.href.substr(0,6).toLowerCase()!="https:"){
(function(){
var _1a9=dojo.doc().createElement("script");
_1a9.src="javascript:'dojo.html.createExternalElement=function(doc, tag){ return doc.createElement(tag); }'";
dojo.doc().getElementsByTagName("head")[0].appendChild(_1a9);
})();
}
}else{
dojo.html.createExternalElement=function(doc,tag){
return doc.createElement(tag);
};
}
dojo.html._callDeprecated=function(_1ac,_1ad,args,_1af,_1b0){
dojo.deprecated("dojo.html."+_1ac,"replaced by dojo.html."+_1ad+"("+(_1af?"node, {"+_1af+": "+_1af+"}":"")+")"+(_1b0?"."+_1b0:""),"0.5");
var _1b1=[];
if(_1af){
var _1b2={};
_1b2[_1af]=args[1];
_1b1.push(args[0]);
_1b1.push(_1b2);
}else{
_1b1=args;
}
var ret=dojo.html[_1ad].apply(dojo.html,args);
if(_1b0){
return ret[_1b0];
}else{
return ret;
}
};
dojo.html.getViewportWidth=function(){
return dojo.html._callDeprecated("getViewportWidth","getViewport",arguments,null,"width");
};
dojo.html.getViewportHeight=function(){
return dojo.html._callDeprecated("getViewportHeight","getViewport",arguments,null,"height");
};
dojo.html.getViewportSize=function(){
return dojo.html._callDeprecated("getViewportSize","getViewport",arguments);
};
dojo.html.getScrollTop=function(){
return dojo.html._callDeprecated("getScrollTop","getScroll",arguments,null,"top");
};
dojo.html.getScrollLeft=function(){
return dojo.html._callDeprecated("getScrollLeft","getScroll",arguments,null,"left");
};
dojo.html.getScrollOffset=function(){
return dojo.html._callDeprecated("getScrollOffset","getScroll",arguments,null,"offset");
};
dojo.provide("dojo.uri.Uri");
dojo.uri=new function(){
this.dojoUri=function(uri){
return new dojo.uri.Uri(dojo.hostenv.getBaseScriptUri(),uri);
};
this.moduleUri=function(_1b5,uri){
var loc=dojo.hostenv.getModuleSymbols(_1b5).join("/");
if(!loc){
return null;
}
if(loc.lastIndexOf("/")!=loc.length-1){
loc+="/";
}
var _1b8=loc.indexOf(":");
var _1b9=loc.indexOf("/");
if(loc.charAt(0)!="/"&&(_1b8==-1||_1b8>_1b9)){
loc=dojo.hostenv.getBaseScriptUri()+loc;
}
return new dojo.uri.Uri(loc,uri);
};
this.Uri=function(){
var uri=arguments[0];
for(var i=1;i<arguments.length;i++){
if(!arguments[i]){
continue;
}
var _1bc=new dojo.uri.Uri(arguments[i].toString());
var _1bd=new dojo.uri.Uri(uri.toString());
if((_1bc.path=="")&&(_1bc.scheme==null)&&(_1bc.authority==null)&&(_1bc.query==null)){
if(_1bc.fragment!=null){
_1bd.fragment=_1bc.fragment;
}
_1bc=_1bd;
}else{
if(_1bc.scheme==null){
_1bc.scheme=_1bd.scheme;
if(_1bc.authority==null){
_1bc.authority=_1bd.authority;
if(_1bc.path.charAt(0)!="/"){
var path=_1bd.path.substring(0,_1bd.path.lastIndexOf("/")+1)+_1bc.path;
var segs=path.split("/");
for(var j=0;j<segs.length;j++){
if(segs[j]=="."){
if(j==segs.length-1){
segs[j]="";
}else{
segs.splice(j,1);
j--;
}
}else{
if(j>0&&!(j==1&&segs[0]=="")&&segs[j]==".."&&segs[j-1]!=".."){
if(j==segs.length-1){
segs.splice(j,1);
segs[j-1]="";
}else{
segs.splice(j-1,2);
j-=2;
}
}
}
}
_1bc.path=segs.join("/");
}
}
}
}
uri="";
if(_1bc.scheme!=null){
uri+=_1bc.scheme+":";
}
if(_1bc.authority!=null){
uri+="//"+_1bc.authority;
}
uri+=_1bc.path;
if(_1bc.query!=null){
uri+="?"+_1bc.query;
}
if(_1bc.fragment!=null){
uri+="#"+_1bc.fragment;
}
}
this.uri=uri.toString();
var _1c1="^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$";
var r=this.uri.match(new RegExp(_1c1));
this.scheme=r[2]||(r[1]?"":null);
this.authority=r[4]||(r[3]?"":null);
this.path=r[5];
this.query=r[7]||(r[6]?"":null);
this.fragment=r[9]||(r[8]?"":null);
if(this.authority!=null){
_1c1="^((([^:]+:)?([^@]+))@)?([^:]*)(:([0-9]+))?$";
r=this.authority.match(new RegExp(_1c1));
this.user=r[3]||null;
this.password=r[4]||null;
this.host=r[5];
this.port=r[7]||null;
}
this.toString=function(){
return this.uri;
};
};
};
dojo.provide("dojo.html.style");
dojo.html.getClass=function(node){
node=dojo.byId(node);
if(!node){
return "";
}
var cs="";
if(node.className){
cs=node.className;
}else{
if(dojo.html.hasAttribute(node,"class")){
cs=dojo.html.getAttribute(node,"class");
}
}
return cs.replace(/^\s+|\s+$/g,"");
};
dojo.html.getClasses=function(node){
var c=dojo.html.getClass(node);
return (c=="")?[]:c.split(/\s+/g);
};
dojo.html.hasClass=function(node,_1c8){
return (new RegExp("(^|\\s+)"+_1c8+"(\\s+|$)")).test(dojo.html.getClass(node));
};
dojo.html.prependClass=function(node,_1ca){
_1ca+=" "+dojo.html.getClass(node);
return dojo.html.setClass(node,_1ca);
};
dojo.html.addClass=function(node,_1cc){
if(dojo.html.hasClass(node,_1cc)){
return false;
}
_1cc=(dojo.html.getClass(node)+" "+_1cc).replace(/^\s+|\s+$/g,"");
return dojo.html.setClass(node,_1cc);
};
dojo.html.setClass=function(node,_1ce){
node=dojo.byId(node);
var cs=new String(_1ce);
try{
if(typeof node.className=="string"){
node.className=cs;
}else{
if(node.setAttribute){
node.setAttribute("class",_1ce);
node.className=cs;
}else{
return false;
}
}
}
catch(e){
dojo.debug("dojo.html.setClass() failed",e);
}
return true;
};
dojo.html.removeClass=function(node,_1d1,_1d2){
try{
if(!_1d2){
var _1d3=dojo.html.getClass(node).replace(new RegExp("(^|\\s+)"+_1d1+"(\\s+|$)"),"$1$2");
}else{
var _1d3=dojo.html.getClass(node).replace(_1d1,"");
}
dojo.html.setClass(node,_1d3);
}
catch(e){
dojo.debug("dojo.html.removeClass() failed",e);
}
return true;
};
dojo.html.replaceClass=function(node,_1d5,_1d6){
dojo.html.removeClass(node,_1d6);
dojo.html.addClass(node,_1d5);
};
dojo.html.classMatchType={ContainsAll:0,ContainsAny:1,IsOnly:2};
dojo.html.getElementsByClass=function(_1d7,_1d8,_1d9,_1da,_1db){
_1db=false;
var _1dc=dojo.doc();
_1d8=dojo.byId(_1d8)||_1dc;
var _1dd=_1d7.split(/\s+/g);
var _1de=[];
if(_1da!=1&&_1da!=2){
_1da=0;
}
var _1df=new RegExp("(\\s|^)(("+_1dd.join(")|(")+"))(\\s|$)");
var _1e0=_1dd.join(" ").length;
var _1e1=[];
if(!_1db&&_1dc.evaluate){
var _1e2=".//"+(_1d9||"*")+"[contains(";
if(_1da!=dojo.html.classMatchType.ContainsAny){
_1e2+="concat(' ',@class,' '), ' "+_1dd.join(" ') and contains(concat(' ',@class,' '), ' ")+" ')";
if(_1da==2){
_1e2+=" and string-length(@class)="+_1e0+"]";
}else{
_1e2+="]";
}
}else{
_1e2+="concat(' ',@class,' '), ' "+_1dd.join(" ') or contains(concat(' ',@class,' '), ' ")+" ')]";
}
var _1e3=_1dc.evaluate(_1e2,_1d8,null,XPathResult.ANY_TYPE,null);
var _1e4=_1e3.iterateNext();
while(_1e4){
try{
_1e1.push(_1e4);
_1e4=_1e3.iterateNext();
}
catch(e){
break;
}
}
return _1e1;
}else{
if(!_1d9){
_1d9="*";
}
_1e1=_1d8.getElementsByTagName(_1d9);
var node,i=0;
outer:
while(node=_1e1[i++]){
var _1e7=dojo.html.getClasses(node);
if(_1e7.length==0){
continue outer;
}
var _1e8=0;
for(var j=0;j<_1e7.length;j++){
if(_1df.test(_1e7[j])){
if(_1da==dojo.html.classMatchType.ContainsAny){
_1de.push(node);
continue outer;
}else{
_1e8++;
}
}else{
if(_1da==dojo.html.classMatchType.IsOnly){
continue outer;
}
}
}
if(_1e8==_1dd.length){
if((_1da==dojo.html.classMatchType.IsOnly)&&(_1e8==_1e7.length)){
_1de.push(node);
}else{
if(_1da==dojo.html.classMatchType.ContainsAll){
_1de.push(node);
}
}
}
}
return _1de;
}
};
dojo.html.getElementsByClassName=dojo.html.getElementsByClass;
dojo.html.toCamelCase=function(_1ea){
var arr=_1ea.split("-"),cc=arr[0];
for(var i=1;i<arr.length;i++){
cc+=arr[i].charAt(0).toUpperCase()+arr[i].substring(1);
}
return cc;
};
dojo.html.toSelectorCase=function(_1ee){
return _1ee.replace(/([A-Z])/g,"-$1").toLowerCase();
};
if(dojo.render.html.ie){
dojo.html.getComputedStyle=function(node,_1f0,_1f1){
node=dojo.byId(node);
if(!node||!node.style){
return _1f1;
}
return node.currentStyle[dojo.html.toCamelCase(_1f0)];
};
dojo.html.getComputedStyles=function(node){
return node.currentStyle;
};
}else{
dojo.html.getComputedStyle=function(node,_1f4,_1f5){
node=dojo.byId(node);
if(!node||!node.style){
return _1f5;
}
var s=document.defaultView.getComputedStyle(node,null);
return (s&&s[dojo.html.toCamelCase(_1f4)])||"";
};
dojo.html.getComputedStyles=function(node){
return document.defaultView.getComputedStyle(node,null);
};
}
dojo.html.getStyleProperty=function(node,_1f9){
node=dojo.byId(node);
return (node&&node.style?node.style[dojo.html.toCamelCase(_1f9)]:undefined);
};
dojo.html.getStyle=function(node,_1fb){
var _1fc=dojo.html.getStyleProperty(node,_1fb);
return (_1fc?_1fc:dojo.html.getComputedStyle(node,_1fb));
};
dojo.html.setStyle=function(node,_1fe,_1ff){
node=dojo.byId(node);
if(node&&node.style){
var _200=dojo.html.toCamelCase(_1fe);
node.style[_200]=_1ff;
}
};
dojo.html.setStyleText=function(_201,text){
try{
_201.style.cssText=text;
}
catch(e){
_201.setAttribute("style",text);
}
};
dojo.html.copyStyle=function(_203,_204){
if(!_204.style.cssText){
_203.setAttribute("style",_204.getAttribute("style"));
}else{
_203.style.cssText=_204.style.cssText;
}
dojo.html.addClass(_203,dojo.html.getClass(_204));
};
dojo.html.getUnitValue=function(node,_206,_207){
var s=dojo.html.getComputedStyle(node,_206);
if((!s)||((s=="auto")&&(_207))){
return {value:0,units:"px"};
}
var _209=s.match(/(\-?[\d.]+)([a-z%]*)/i);
if(!_209){
return dojo.html.getUnitValue.bad;
}
return {value:Number(_209[1]),units:_209[2].toLowerCase()};
};
dojo.html.getUnitValue.bad={value:NaN,units:""};
if(dojo.render.html.ie){
dojo.html.toPixelValue=function(_20a,_20b){
if(!_20b){
return 0;
}
if(_20b.slice(-2)=="px"){
return parseFloat(_20b);
}
var _20c=0;
with(_20a){
var _20d=style.left;
var _20e=runtimeStyle.left;
runtimeStyle.left=currentStyle.left;
try{
style.left=_20b||0;
_20c=style.pixelLeft;
style.left=_20d;
runtimeStyle.left=_20e;
}
catch(e){
}
}
return _20c;
};
}else{
dojo.html.toPixelValue=function(_20f,_210){
return (_210&&(_210.slice(-2)=="px")?parseFloat(_210):0);
};
}
dojo.html.getPixelValue=function(node,_212,_213){
return dojo.html.toPixelValue(node,dojo.html.getComputedStyle(node,_212));
};
dojo.html.setPositivePixelValue=function(node,_215,_216){
if(isNaN(_216)){
return false;
}
node.style[_215]=Math.max(0,_216)+"px";
return true;
};
dojo.html.styleSheet=null;
dojo.html.insertCssRule=function(_217,_218,_219){
if(!dojo.html.styleSheet){
if(document.createStyleSheet){
dojo.html.styleSheet=document.createStyleSheet();
}else{
if(document.styleSheets[0]){
dojo.html.styleSheet=document.styleSheets[0];
}else{
return null;
}
}
}
if(arguments.length<3){
if(dojo.html.styleSheet.cssRules){
_219=dojo.html.styleSheet.cssRules.length;
}else{
if(dojo.html.styleSheet.rules){
_219=dojo.html.styleSheet.rules.length;
}else{
return null;
}
}
}
if(dojo.html.styleSheet.insertRule){
var rule=_217+" { "+_218+" }";
return dojo.html.styleSheet.insertRule(rule,_219);
}else{
if(dojo.html.styleSheet.addRule){
return dojo.html.styleSheet.addRule(_217,_218,_219);
}else{
return null;
}
}
};
dojo.html.removeCssRule=function(_21b){
if(!dojo.html.styleSheet){
dojo.debug("no stylesheet defined for removing rules");
return false;
}
if(dojo.render.html.ie){
if(!_21b){
_21b=dojo.html.styleSheet.rules.length;
dojo.html.styleSheet.removeRule(_21b);
}
}else{
if(document.styleSheets[0]){
if(!_21b){
_21b=dojo.html.styleSheet.cssRules.length;
}
dojo.html.styleSheet.deleteRule(_21b);
}
}
return true;
};
dojo.html._insertedCssFiles=[];
dojo.html.insertCssFile=function(URI,doc,_21e,_21f){
if(!URI){
return;
}
if(!doc){
doc=document;
}
var _220=dojo.hostenv.getText(URI,false,_21f);
if(_220===null){
return;
}
_220=dojo.html.fixPathsInCssText(_220,URI);
if(_21e){
var idx=-1,node,ent=dojo.html._insertedCssFiles;
for(var i=0;i<ent.length;i++){
if((ent[i].doc==doc)&&(ent[i].cssText==_220)){
idx=i;
node=ent[i].nodeRef;
break;
}
}
if(node){
var _225=doc.getElementsByTagName("style");
for(var i=0;i<_225.length;i++){
if(_225[i]==node){
return;
}
}
dojo.html._insertedCssFiles.shift(idx,1);
}
}
var _226=dojo.html.insertCssText(_220,doc);
dojo.html._insertedCssFiles.push({"doc":doc,"cssText":_220,"nodeRef":_226});
if(_226&&djConfig.isDebug){
_226.setAttribute("dbgHref",URI);
}
return _226;
};
dojo.html.insertCssText=function(_227,doc,URI){
if(!_227){
return;
}
if(!doc){
doc=document;
}
if(URI){
_227=dojo.html.fixPathsInCssText(_227,URI);
}
var _22a=doc.createElement("style");
_22a.setAttribute("type","text/css");
var head=doc.getElementsByTagName("head")[0];
if(!head){
dojo.debug("No head tag in document, aborting styles");
return;
}else{
head.appendChild(_22a);
}
if(_22a.styleSheet){
var _22c=function(){
try{
_22a.styleSheet.cssText=_227;
}
catch(e){
dojo.debug(e);
}
};
if(_22a.styleSheet.disabled){
setTimeout(_22c,10);
}else{
_22c();
}
}else{
var _22d=doc.createTextNode(_227);
_22a.appendChild(_22d);
}
return _22a;
};
dojo.html.fixPathsInCssText=function(_22e,URI){
if(!_22e||!URI){
return;
}
var _230,str="",url="",_233="[\\t\\s\\w\\(\\)\\/\\.\\\\'\"-:#=&?~]+";
var _234=new RegExp("url\\(\\s*("+_233+")\\s*\\)");
var _235=/(file|https?|ftps?):\/\//;
regexTrim=new RegExp("^[\\s]*(['\"]?)("+_233+")\\1[\\s]*?$");
if(dojo.render.html.ie55||dojo.render.html.ie60){
var _236=new RegExp("AlphaImageLoader\\((.*)src=['\"]("+_233+")['\"]");
while(_230=_236.exec(_22e)){
url=_230[2].replace(regexTrim,"$2");
if(!_235.exec(url)){
url=(new dojo.uri.Uri(URI,url).toString());
}
str+=_22e.substring(0,_230.index)+"AlphaImageLoader("+_230[1]+"src='"+url+"'";
_22e=_22e.substr(_230.index+_230[0].length);
}
_22e=str+_22e;
str="";
}
while(_230=_234.exec(_22e)){
url=_230[1].replace(regexTrim,"$2");
if(!_235.exec(url)){
url=(new dojo.uri.Uri(URI,url).toString());
}
str+=_22e.substring(0,_230.index)+"url("+url+")";
_22e=_22e.substr(_230.index+_230[0].length);
}
return str+_22e;
};
dojo.html.setActiveStyleSheet=function(_237){
var i=0,a,els=dojo.doc().getElementsByTagName("link");
while(a=els[i++]){
if(a.getAttribute("rel").indexOf("style")!=-1&&a.getAttribute("title")){
a.disabled=true;
if(a.getAttribute("title")==_237){
a.disabled=false;
}
}
}
};
dojo.html.getActiveStyleSheet=function(){
var i=0,a,els=dojo.doc().getElementsByTagName("link");
while(a=els[i++]){
if(a.getAttribute("rel").indexOf("style")!=-1&&a.getAttribute("title")&&!a.disabled){
return a.getAttribute("title");
}
}
return null;
};
dojo.html.getPreferredStyleSheet=function(){
var i=0,a,els=dojo.doc().getElementsByTagName("link");
while(a=els[i++]){
if(a.getAttribute("rel").indexOf("style")!=-1&&a.getAttribute("rel").indexOf("alt")==-1&&a.getAttribute("title")){
return a.getAttribute("title");
}
}
return null;
};
dojo.html.applyBrowserClass=function(node){
var drh=dojo.render.html;
var _243={dj_ie:drh.ie,dj_ie55:drh.ie55,dj_ie6:drh.ie60,dj_ie7:drh.ie70,dj_iequirks:drh.ie&&drh.quirks,dj_opera:drh.opera,dj_opera8:drh.opera&&(Math.floor(dojo.render.version)==8),dj_opera9:drh.opera&&(Math.floor(dojo.render.version)==9),dj_khtml:drh.khtml,dj_safari:drh.safari,dj_gecko:drh.mozilla};
for(var p in _243){
if(_243[p]){
dojo.html.addClass(node,p);
}
}
};
dojo.kwCompoundRequire({common:["dojo.html.common","dojo.html.style"]});
dojo.provide("dojo.html.*");
dojo.provide("dojo.html.display");
dojo.html._toggle=function(node,_246,_247){
node=dojo.byId(node);
_247(node,!_246(node));
return _246(node);
};
dojo.html.show=function(node){
node=dojo.byId(node);
if(dojo.html.getStyleProperty(node,"display")=="none"){
dojo.html.setStyle(node,"display",(node.dojoDisplayCache||""));
node.dojoDisplayCache=undefined;
}
};
dojo.html.hide=function(node){
node=dojo.byId(node);
if(typeof node["dojoDisplayCache"]=="undefined"){
var d=dojo.html.getStyleProperty(node,"display");
if(d!="none"){
node.dojoDisplayCache=d;
}
}
dojo.html.setStyle(node,"display","none");
};
dojo.html.setShowing=function(node,_24c){
dojo.html[(_24c?"show":"hide")](node);
};
dojo.html.isShowing=function(node){
return (dojo.html.getStyleProperty(node,"display")!="none");
};
dojo.html.toggleShowing=function(node){
return dojo.html._toggle(node,dojo.html.isShowing,dojo.html.setShowing);
};
dojo.html.displayMap={tr:"",td:"",th:"",img:"inline",span:"inline",input:"inline",button:"inline"};
dojo.html.suggestDisplayByTagName=function(node){
node=dojo.byId(node);
if(node&&node.tagName){
var tag=node.tagName.toLowerCase();
return (tag in dojo.html.displayMap?dojo.html.displayMap[tag]:"block");
}
};
dojo.html.setDisplay=function(node,_252){
dojo.html.setStyle(node,"display",((_252 instanceof String||typeof _252=="string")?_252:(_252?dojo.html.suggestDisplayByTagName(node):"none")));
};
dojo.html.isDisplayed=function(node){
return (dojo.html.getComputedStyle(node,"display")!="none");
};
dojo.html.toggleDisplay=function(node){
return dojo.html._toggle(node,dojo.html.isDisplayed,dojo.html.setDisplay);
};
dojo.html.setVisibility=function(node,_256){
dojo.html.setStyle(node,"visibility",((_256 instanceof String||typeof _256=="string")?_256:(_256?"visible":"hidden")));
};
dojo.html.isVisible=function(node){
return (dojo.html.getComputedStyle(node,"visibility")!="hidden");
};
dojo.html.toggleVisibility=function(node){
return dojo.html._toggle(node,dojo.html.isVisible,dojo.html.setVisibility);
};
dojo.html.setOpacity=function(node,_25a,_25b){
node=dojo.byId(node);
var h=dojo.render.html;
if(!_25b){
if(_25a>=1){
if(h.ie){
dojo.html.clearOpacity(node);
return;
}else{
_25a=0.999999;
}
}else{
if(_25a<0){
_25a=0;
}
}
}
if(h.ie){
if(node.nodeName.toLowerCase()=="tr"){
var tds=node.getElementsByTagName("td");
for(var x=0;x<tds.length;x++){
tds[x].style.filter="Alpha(Opacity="+_25a*100+")";
}
}
node.style.filter="Alpha(Opacity="+_25a*100+")";
}else{
if(h.moz){
node.style.opacity=_25a;
node.style.MozOpacity=_25a;
}else{
if(h.safari){
node.style.opacity=_25a;
node.style.KhtmlOpacity=_25a;
}else{
node.style.opacity=_25a;
}
}
}
};
dojo.html.clearOpacity=function(node){
node=dojo.byId(node);
var ns=node.style;
var h=dojo.render.html;
if(h.ie){
try{
if(node.filters&&node.filters.alpha){
ns.filter="";
}
}
catch(e){
}
}else{
if(h.moz){
ns.opacity=1;
ns.MozOpacity=1;
}else{
if(h.safari){
ns.opacity=1;
ns.KhtmlOpacity=1;
}else{
ns.opacity=1;
}
}
}
};
dojo.html.getOpacity=function(node){
node=dojo.byId(node);
var h=dojo.render.html;
if(h.ie){
var opac=(node.filters&&node.filters.alpha&&typeof node.filters.alpha.opacity=="number"?node.filters.alpha.opacity:100)/100;
}else{
var opac=node.style.opacity||node.style.MozOpacity||node.style.KhtmlOpacity||1;
}
return opac>=0.999999?1:Number(opac);
};
dojo.provide("dojo.html.layout");
dojo.html.sumAncestorProperties=function(node,prop){
node=dojo.byId(node);
if(!node){
return 0;
}
var _267=0;
while(node){
if(dojo.html.getComputedStyle(node,"position")=="fixed"){
return 0;
}
var val=node[prop];
if(val){
_267+=val-0;
if(node==dojo.body()){
break;
}
}
node=node.parentNode;
}
return _267;
};
dojo.html.setStyleAttributes=function(node,_26a){
node=dojo.byId(node);
var _26b=_26a.replace(/(;)?\s*$/,"").split(";");
for(var i=0;i<_26b.length;i++){
var _26d=_26b[i].split(":");
var name=_26d[0].replace(/\s*$/,"").replace(/^\s*/,"").toLowerCase();
var _26f=_26d[1].replace(/\s*$/,"").replace(/^\s*/,"");
switch(name){
case "opacity":
dojo.html.setOpacity(node,_26f);
break;
case "content-height":
dojo.html.setContentBox(node,{height:_26f});
break;
case "content-width":
dojo.html.setContentBox(node,{width:_26f});
break;
case "outer-height":
dojo.html.setMarginBox(node,{height:_26f});
break;
case "outer-width":
dojo.html.setMarginBox(node,{width:_26f});
break;
default:
node.style[dojo.html.toCamelCase(name)]=_26f;
}
}
};
dojo.html.boxSizing={MARGIN_BOX:"margin-box",BORDER_BOX:"border-box",PADDING_BOX:"padding-box",CONTENT_BOX:"content-box"};
dojo.html.getAbsolutePosition=dojo.html.abs=function(node,_271,_272){
node=dojo.byId(node,node.ownerDocument);
var ret={x:0,y:0};
var bs=dojo.html.boxSizing;
if(!_272){
_272=bs.CONTENT_BOX;
}
var _275=2;
var _276;
switch(_272){
case bs.MARGIN_BOX:
_276=3;
break;
case bs.BORDER_BOX:
_276=2;
break;
case bs.PADDING_BOX:
default:
_276=1;
break;
case bs.CONTENT_BOX:
_276=0;
break;
}
var h=dojo.render.html;
var db=document["body"]||document["documentElement"];
if(h.ie){
with(node.getBoundingClientRect()){
ret.x=left-2;
ret.y=top-2;
}
}else{
if(document.getBoxObjectFor){
_275=1;
try{
var bo=document.getBoxObjectFor(node);
ret.x=bo.x-dojo.html.sumAncestorProperties(node,"scrollLeft");
ret.y=bo.y-dojo.html.sumAncestorProperties(node,"scrollTop");
}
catch(e){
}
}else{
if(node["offsetParent"]){
var _27a;
if((h.safari)&&(node.style.getPropertyValue("position")=="absolute")&&(node.parentNode==db)){
_27a=db;
}else{
_27a=db.parentNode;
}
if(node.parentNode!=db){
var nd=node;
if(dojo.render.html.opera){
nd=db;
}
ret.x-=dojo.html.sumAncestorProperties(nd,"scrollLeft");
ret.y-=dojo.html.sumAncestorProperties(nd,"scrollTop");
}
var _27c=node;
do{
var n=_27c["offsetLeft"];
if(!h.opera||n>0){
ret.x+=isNaN(n)?0:n;
}
var m=_27c["offsetTop"];
ret.y+=isNaN(m)?0:m;
_27c=_27c.offsetParent;
}while((_27c!=_27a)&&(_27c!=null));
}else{
if(node["x"]&&node["y"]){
ret.x+=isNaN(node.x)?0:node.x;
ret.y+=isNaN(node.y)?0:node.y;
}
}
}
}
if(_271){
var _27f=dojo.html.getScroll();
ret.y+=_27f.top;
ret.x+=_27f.left;
}
var _280=[dojo.html.getPaddingExtent,dojo.html.getBorderExtent,dojo.html.getMarginExtent];
if(_275>_276){
for(var i=_276;i<_275;++i){
ret.y+=_280[i](node,"top");
ret.x+=_280[i](node,"left");
}
}else{
if(_275<_276){
for(var i=_276;i>_275;--i){
ret.y-=_280[i-1](node,"top");
ret.x-=_280[i-1](node,"left");
}
}
}
ret.top=ret.y;
ret.left=ret.x;
return ret;
};
dojo.html.isPositionAbsolute=function(node){
return (dojo.html.getComputedStyle(node,"position")=="absolute");
};
dojo.html._sumPixelValues=function(node,_284,_285){
var _286=0;
for(var x=0;x<_284.length;x++){
_286+=dojo.html.getPixelValue(node,_284[x],_285);
}
return _286;
};
dojo.html.getMargin=function(node){
return {width:dojo.html._sumPixelValues(node,["margin-left","margin-right"],(dojo.html.getComputedStyle(node,"position")=="absolute")),height:dojo.html._sumPixelValues(node,["margin-top","margin-bottom"],(dojo.html.getComputedStyle(node,"position")=="absolute"))};
};
dojo.html.getBorder=function(node){
return {width:dojo.html.getBorderExtent(node,"left")+dojo.html.getBorderExtent(node,"right"),height:dojo.html.getBorderExtent(node,"top")+dojo.html.getBorderExtent(node,"bottom")};
};
dojo.html.getBorderExtent=function(node,side){
return (dojo.html.getStyle(node,"border-"+side+"-style")=="none"?0:dojo.html.getPixelValue(node,"border-"+side+"-width"));
};
dojo.html.getMarginExtent=function(node,side){
return dojo.html._sumPixelValues(node,["margin-"+side],dojo.html.isPositionAbsolute(node));
};
dojo.html.getPaddingExtent=function(node,side){
return dojo.html._sumPixelValues(node,["padding-"+side],true);
};
dojo.html.getPadding=function(node){
return {width:dojo.html._sumPixelValues(node,["padding-left","padding-right"],true),height:dojo.html._sumPixelValues(node,["padding-top","padding-bottom"],true)};
};
dojo.html.getPadBorder=function(node){
var pad=dojo.html.getPadding(node);
var _293=dojo.html.getBorder(node);
return {width:pad.width+_293.width,height:pad.height+_293.height};
};
dojo.html.getBoxSizing=function(node){
var h=dojo.render.html;
var bs=dojo.html.boxSizing;
if(((h.ie)||(h.opera))&&node.nodeName.toLowerCase()!="img"){
var cm=document["compatMode"];
if((cm=="BackCompat")||(cm=="QuirksMode")){
return bs.BORDER_BOX;
}else{
return bs.CONTENT_BOX;
}
}else{
if(arguments.length==0){
node=document.documentElement;
}
var _298;
if(!h.ie){
_298=dojo.html.getStyle(node,"-moz-box-sizing");
if(!_298){
_298=dojo.html.getStyle(node,"box-sizing");
}
}
return (_298?_298:bs.CONTENT_BOX);
}
};
dojo.html.isBorderBox=function(node){
return (dojo.html.getBoxSizing(node)==dojo.html.boxSizing.BORDER_BOX);
};
dojo.html.getBorderBox=function(node){
node=dojo.byId(node);
return {width:node.offsetWidth,height:node.offsetHeight};
};
dojo.html.getPaddingBox=function(node){
var box=dojo.html.getBorderBox(node);
var _29d=dojo.html.getBorder(node);
return {width:box.width-_29d.width,height:box.height-_29d.height};
};
dojo.html.getContentBox=function(node){
node=dojo.byId(node);
var _29f=dojo.html.getPadBorder(node);
return {width:node.offsetWidth-_29f.width,height:node.offsetHeight-_29f.height};
};
dojo.html.setContentBox=function(node,args){
node=dojo.byId(node);
var _2a2=0;
var _2a3=0;
var isbb=dojo.html.isBorderBox(node);
var _2a5=(isbb?dojo.html.getPadBorder(node):{width:0,height:0});
var ret={};
if(typeof args.width!="undefined"){
_2a2=args.width+_2a5.width;
ret.width=dojo.html.setPositivePixelValue(node,"width",_2a2);
}
if(typeof args.height!="undefined"){
_2a3=args.height+_2a5.height;
ret.height=dojo.html.setPositivePixelValue(node,"height",_2a3);
}
return ret;
};
dojo.html.getMarginBox=function(node){
var _2a8=dojo.html.getBorderBox(node);
var _2a9=dojo.html.getMargin(node);
return {width:_2a8.width+_2a9.width,height:_2a8.height+_2a9.height};
};
dojo.html.setMarginBox=function(node,args){
node=dojo.byId(node);
var _2ac=0;
var _2ad=0;
var isbb=dojo.html.isBorderBox(node);
var _2af=(!isbb?dojo.html.getPadBorder(node):{width:0,height:0});
var _2b0=dojo.html.getMargin(node);
var ret={};
if(typeof args.width!="undefined"){
_2ac=args.width-_2af.width;
_2ac-=_2b0.width;
ret.width=dojo.html.setPositivePixelValue(node,"width",_2ac);
}
if(typeof args.height!="undefined"){
_2ad=args.height-_2af.height;
_2ad-=_2b0.height;
ret.height=dojo.html.setPositivePixelValue(node,"height",_2ad);
}
return ret;
};
dojo.html.getElementBox=function(node,type){
var bs=dojo.html.boxSizing;
switch(type){
case bs.MARGIN_BOX:
return dojo.html.getMarginBox(node);
case bs.BORDER_BOX:
return dojo.html.getBorderBox(node);
case bs.PADDING_BOX:
return dojo.html.getPaddingBox(node);
case bs.CONTENT_BOX:
default:
return dojo.html.getContentBox(node);
}
};
dojo.html.toCoordinateObject=dojo.html.toCoordinateArray=function(_2b5,_2b6,_2b7){
if(_2b5 instanceof Array||typeof _2b5=="array"){
dojo.deprecated("dojo.html.toCoordinateArray","use dojo.html.toCoordinateObject({left: , top: , width: , height: }) instead","0.5");
while(_2b5.length<4){
_2b5.push(0);
}
while(_2b5.length>4){
_2b5.pop();
}
var ret={left:_2b5[0],top:_2b5[1],width:_2b5[2],height:_2b5[3]};
}else{
if(!_2b5.nodeType&&!(_2b5 instanceof String||typeof _2b5=="string")&&("width" in _2b5||"height" in _2b5||"left" in _2b5||"x" in _2b5||"top" in _2b5||"y" in _2b5)){
var ret={left:_2b5.left||_2b5.x||0,top:_2b5.top||_2b5.y||0,width:_2b5.width||0,height:_2b5.height||0};
}else{
var node=dojo.byId(_2b5);
var pos=dojo.html.abs(node,_2b6,_2b7);
var _2bb=dojo.html.getMarginBox(node);
var ret={left:pos.left,top:pos.top,width:_2bb.width,height:_2bb.height};
}
}
ret.x=ret.left;
ret.y=ret.top;
return ret;
};
dojo.html.setMarginBoxWidth=dojo.html.setOuterWidth=function(node,_2bd){
return dojo.html._callDeprecated("setMarginBoxWidth","setMarginBox",arguments,"width");
};
dojo.html.setMarginBoxHeight=dojo.html.setOuterHeight=function(){
return dojo.html._callDeprecated("setMarginBoxHeight","setMarginBox",arguments,"height");
};
dojo.html.getMarginBoxWidth=dojo.html.getOuterWidth=function(){
return dojo.html._callDeprecated("getMarginBoxWidth","getMarginBox",arguments,null,"width");
};
dojo.html.getMarginBoxHeight=dojo.html.getOuterHeight=function(){
return dojo.html._callDeprecated("getMarginBoxHeight","getMarginBox",arguments,null,"height");
};
dojo.html.getTotalOffset=function(node,type,_2c0){
return dojo.html._callDeprecated("getTotalOffset","getAbsolutePosition",arguments,null,type);
};
dojo.html.getAbsoluteX=function(node,_2c2){
return dojo.html._callDeprecated("getAbsoluteX","getAbsolutePosition",arguments,null,"x");
};
dojo.html.getAbsoluteY=function(node,_2c4){
return dojo.html._callDeprecated("getAbsoluteY","getAbsolutePosition",arguments,null,"y");
};
dojo.html.totalOffsetLeft=function(node,_2c6){
return dojo.html._callDeprecated("totalOffsetLeft","getAbsolutePosition",arguments,null,"left");
};
dojo.html.totalOffsetTop=function(node,_2c8){
return dojo.html._callDeprecated("totalOffsetTop","getAbsolutePosition",arguments,null,"top");
};
dojo.html.getMarginWidth=function(node){
return dojo.html._callDeprecated("getMarginWidth","getMargin",arguments,null,"width");
};
dojo.html.getMarginHeight=function(node){
return dojo.html._callDeprecated("getMarginHeight","getMargin",arguments,null,"height");
};
dojo.html.getBorderWidth=function(node){
return dojo.html._callDeprecated("getBorderWidth","getBorder",arguments,null,"width");
};
dojo.html.getBorderHeight=function(node){
return dojo.html._callDeprecated("getBorderHeight","getBorder",arguments,null,"height");
};
dojo.html.getPaddingWidth=function(node){
return dojo.html._callDeprecated("getPaddingWidth","getPadding",arguments,null,"width");
};
dojo.html.getPaddingHeight=function(node){
return dojo.html._callDeprecated("getPaddingHeight","getPadding",arguments,null,"height");
};
dojo.html.getPadBorderWidth=function(node){
return dojo.html._callDeprecated("getPadBorderWidth","getPadBorder",arguments,null,"width");
};
dojo.html.getPadBorderHeight=function(node){
return dojo.html._callDeprecated("getPadBorderHeight","getPadBorder",arguments,null,"height");
};
dojo.html.getBorderBoxWidth=dojo.html.getInnerWidth=function(){
return dojo.html._callDeprecated("getBorderBoxWidth","getBorderBox",arguments,null,"width");
};
dojo.html.getBorderBoxHeight=dojo.html.getInnerHeight=function(){
return dojo.html._callDeprecated("getBorderBoxHeight","getBorderBox",arguments,null,"height");
};
dojo.html.getContentBoxWidth=dojo.html.getContentWidth=function(){
return dojo.html._callDeprecated("getContentBoxWidth","getContentBox",arguments,null,"width");
};
dojo.html.getContentBoxHeight=dojo.html.getContentHeight=function(){
return dojo.html._callDeprecated("getContentBoxHeight","getContentBox",arguments,null,"height");
};
dojo.html.setContentBoxWidth=dojo.html.setContentWidth=function(node,_2d2){
return dojo.html._callDeprecated("setContentBoxWidth","setContentBox",arguments,"width");
};
dojo.html.setContentBoxHeight=dojo.html.setContentHeight=function(node,_2d4){
return dojo.html._callDeprecated("setContentBoxHeight","setContentBox",arguments,"height");
};
dojo.provide("dojo.html.selection");
dojo.html.selectionType={NONE:0,TEXT:1,CONTROL:2};
dojo.html.clearSelection=function(){
var _2d5=dojo.global();
var _2d6=dojo.doc();
try{
if(_2d5["getSelection"]){
if(dojo.render.html.safari){
_2d5.getSelection().collapse();
}else{
_2d5.getSelection().removeAllRanges();
}
}else{
if(_2d6.selection){
if(_2d6.selection.empty){
_2d6.selection.empty();
}else{
if(_2d6.selection.clear){
_2d6.selection.clear();
}
}
}
}
return true;
}
catch(e){
dojo.debug(e);
return false;
}
};
dojo.html.disableSelection=function(_2d7){
_2d7=dojo.byId(_2d7)||dojo.body();
var h=dojo.render.html;
if(h.mozilla){
_2d7.style.MozUserSelect="none";
}else{
if(h.safari){
_2d7.style.KhtmlUserSelect="none";
}else{
if(h.ie){
_2d7.unselectable="on";
}else{
return false;
}
}
}
return true;
};
dojo.html.enableSelection=function(_2d9){
_2d9=dojo.byId(_2d9)||dojo.body();
var h=dojo.render.html;
if(h.mozilla){
_2d9.style.MozUserSelect="";
}else{
if(h.safari){
_2d9.style.KhtmlUserSelect="";
}else{
if(h.ie){
_2d9.unselectable="off";
}else{
return false;
}
}
}
return true;
};
dojo.html.selectElement=function(_2db){
dojo.deprecated("dojo.html.selectElement","replaced by dojo.html.selection.selectElementChildren",0.5);
};
dojo.html.selectInputText=function(_2dc){
var _2dd=dojo.global();
var _2de=dojo.doc();
_2dc=dojo.byId(_2dc);
if(_2de["selection"]&&dojo.body()["createTextRange"]){
var _2df=_2dc.createTextRange();
_2df.moveStart("character",0);
_2df.moveEnd("character",_2dc.value.length);
_2df.select();
}else{
if(_2dd["getSelection"]){
var _2e0=_2dd.getSelection();
_2dc.setSelectionRange(0,_2dc.value.length);
}
}
_2dc.focus();
};
dojo.html.isSelectionCollapsed=function(){
dojo.deprecated("dojo.html.isSelectionCollapsed","replaced by dojo.html.selection.isCollapsed",0.5);
return dojo.html.selection.isCollapsed();
};
dojo.lang.mixin(dojo.html.selection,{getType:function(){
if(dojo.doc()["selection"]){
return dojo.html.selectionType[dojo.doc().selection.type.toUpperCase()];
}else{
var _2e1=dojo.html.selectionType.TEXT;
var oSel;
try{
oSel=dojo.global().getSelection();
}
catch(e){
}
if(oSel&&oSel.rangeCount==1){
var _2e3=oSel.getRangeAt(0);
if(_2e3.startContainer==_2e3.endContainer&&(_2e3.endOffset-_2e3.startOffset)==1&&_2e3.startContainer.nodeType!=dojo.dom.TEXT_NODE){
_2e1=dojo.html.selectionType.CONTROL;
}
}
return _2e1;
}
},isCollapsed:function(){
var _2e4=dojo.global();
var _2e5=dojo.doc();
if(_2e5["selection"]){
return _2e5.selection.createRange().text=="";
}else{
if(_2e4["getSelection"]){
var _2e6=_2e4.getSelection();
if(dojo.lang.isString(_2e6)){
return _2e6=="";
}else{
return _2e6.isCollapsed||_2e6.toString()=="";
}
}
}
},getSelectedElement:function(){
if(dojo.html.selection.getType()==dojo.html.selectionType.CONTROL){
if(dojo.doc()["selection"]){
var _2e7=dojo.doc().selection.createRange();
if(_2e7&&_2e7.item){
return dojo.doc().selection.createRange().item(0);
}
}else{
var _2e8=dojo.global().getSelection();
return _2e8.anchorNode.childNodes[_2e8.anchorOffset];
}
}
},getParentElement:function(){
if(dojo.html.selection.getType()==dojo.html.selectionType.CONTROL){
var p=dojo.html.selection.getSelectedElement();
if(p){
return p.parentNode;
}
}else{
if(dojo.doc()["selection"]){
return dojo.doc().selection.createRange().parentElement();
}else{
var _2ea=dojo.global().getSelection();
if(_2ea){
var node=_2ea.anchorNode;
while(node&&node.nodeType!=dojo.dom.ELEMENT_NODE){
node=node.parentNode;
}
return node;
}
}
}
},getSelectedText:function(){
if(dojo.doc()["selection"]){
if(dojo.html.selection.getType()==dojo.html.selectionType.CONTROL){
return null;
}
return dojo.doc().selection.createRange().text;
}else{
var _2ec=dojo.global().getSelection();
if(_2ec){
return _2ec.toString();
}
}
},getSelectedHtml:function(){
if(dojo.doc()["selection"]){
if(dojo.html.selection.getType()==dojo.html.selectionType.CONTROL){
return null;
}
return dojo.doc().selection.createRange().htmlText;
}else{
var _2ed=dojo.global().getSelection();
if(_2ed&&_2ed.rangeCount){
var frag=_2ed.getRangeAt(0).cloneContents();
var div=document.createElement("div");
div.appendChild(frag);
return div.innerHTML;
}
return null;
}
},hasAncestorElement:function(_2f0){
return (dojo.html.selection.getAncestorElement.apply(this,arguments)!=null);
},getAncestorElement:function(_2f1){
var node=dojo.html.selection.getSelectedElement()||dojo.html.selection.getParentElement();
while(node){
if(dojo.html.selection.isTag(node,arguments).length>0){
return node;
}
node=node.parentNode;
}
return null;
},isTag:function(node,tags){
if(node&&node.tagName){
for(var i=0;i<tags.length;i++){
if(node.tagName.toLowerCase()==String(tags[i]).toLowerCase()){
return String(tags[i]).toLowerCase();
}
}
}
return "";
},selectElement:function(_2f6){
var _2f7=dojo.global();
var _2f8=dojo.doc();
_2f6=dojo.byId(_2f6);
if(_2f8.selection&&dojo.body().createTextRange){
try{
var _2f9=dojo.body().createControlRange();
_2f9.addElement(_2f6);
_2f9.select();
}
catch(e){
dojo.html.selection.selectElementChildren(_2f6);
}
}else{
if(_2f7["getSelection"]){
var _2fa=_2f7.getSelection();
if(_2fa["removeAllRanges"]){
var _2f9=_2f8.createRange();
_2f9.selectNode(_2f6);
_2fa.removeAllRanges();
_2fa.addRange(_2f9);
}
}
}
},selectElementChildren:function(_2fb){
var _2fc=dojo.global();
var _2fd=dojo.doc();
_2fb=dojo.byId(_2fb);
if(_2fd.selection&&dojo.body().createTextRange){
var _2fe=dojo.body().createTextRange();
_2fe.moveToElementText(_2fb);
_2fe.select();
}else{
if(_2fc["getSelection"]){
var _2ff=_2fc.getSelection();
if(_2ff["setBaseAndExtent"]){
_2ff.setBaseAndExtent(_2fb,0,_2fb,_2fb.innerText.length-1);
}else{
if(_2ff["selectAllChildren"]){
_2ff.selectAllChildren(_2fb);
}
}
}
}
},getBookmark:function(){
var _300;
var _301=dojo.doc();
if(_301["selection"]){
var _302=_301.selection.createRange();
_300=_302.getBookmark();
}else{
var _303;
try{
_303=dojo.global().getSelection();
}
catch(e){
}
if(_303){
var _302=_303.getRangeAt(0);
_300=_302.cloneRange();
}else{
dojo.debug("No idea how to store the current selection for this browser!");
}
}
return _300;
},moveToBookmark:function(_304){
var _305=dojo.doc();
if(_305["selection"]){
var _306=_305.selection.createRange();
_306.moveToBookmark(_304);
_306.select();
}else{
var _307;
try{
_307=dojo.global().getSelection();
}
catch(e){
}
if(_307&&_307["removeAllRanges"]){
_307.removeAllRanges();
_307.addRange(_304);
}else{
dojo.debug("No idea how to restore selection for this browser!");
}
}
},collapse:function(_308){
if(dojo.global()["getSelection"]){
var _309=dojo.global().getSelection();
if(_309.removeAllRanges){
if(_308){
_309.collapseToStart();
}else{
_309.collapseToEnd();
}
}else{
dojo.global().getSelection().collapse(_308);
}
}else{
if(dojo.doc().selection){
var _30a=dojo.doc().selection.createRange();
_30a.collapse(_308);
_30a.select();
}
}
},remove:function(){
if(dojo.doc().selection){
var _30b=dojo.doc().selection;
if(_30b.type.toUpperCase()!="NONE"){
_30b.clear();
}
return _30b;
}else{
var _30b=dojo.global().getSelection();
for(var i=0;i<_30b.rangeCount;i++){
_30b.getRangeAt(i).deleteContents();
}
return _30b;
}
}});
dojo.provide("dojo.lang.array");
dojo.lang.mixin(dojo.lang,{has:function(obj,name){
try{
return typeof obj[name]!="undefined";
}
catch(e){
return false;
}
},isEmpty:function(obj){
if(dojo.lang.isObject(obj)){
var tmp={};
var _311=0;
for(var x in obj){
if(obj[x]&&(!tmp[x])){
_311++;
break;
}
}
return _311==0;
}else{
if(dojo.lang.isArrayLike(obj)||dojo.lang.isString(obj)){
return obj.length==0;
}
}
},map:function(arr,obj,_315){
var _316=dojo.lang.isString(arr);
if(_316){
arr=arr.split("");
}
if(dojo.lang.isFunction(obj)&&(!_315)){
_315=obj;
obj=dj_global;
}else{
if(dojo.lang.isFunction(obj)&&_315){
var _317=obj;
obj=_315;
_315=_317;
}
}
if(Array.map){
var _318=Array.map(arr,_315,obj);
}else{
var _318=[];
for(var i=0;i<arr.length;++i){
_318.push(_315.call(obj,arr[i]));
}
}
if(_316){
return _318.join("");
}else{
return _318;
}
},reduce:function(arr,_31b,obj,_31d){
var _31e=_31b;
if(arguments.length==2){
_31d=_31b;
_31e=arr[0];
arr=arr.slice(1);
}else{
if(arguments.length==3){
if(dojo.lang.isFunction(obj)){
_31d=obj;
obj=null;
}
}else{
if(dojo.lang.isFunction(obj)){
var tmp=_31d;
_31d=obj;
obj=tmp;
}
}
}
var ob=obj||dj_global;
dojo.lang.map(arr,function(val){
_31e=_31d.call(ob,_31e,val);
});
return _31e;
},forEach:function(_322,_323,_324){
if(dojo.lang.isString(_322)){
_322=_322.split("");
}
if(Array.forEach){
Array.forEach(_322,_323,_324);
}else{
if(!_324){
_324=dj_global;
}
for(var i=0,l=_322.length;i<l;i++){
_323.call(_324,_322[i],i,_322);
}
}
},_everyOrSome:function(_327,arr,_329,_32a){
if(dojo.lang.isString(arr)){
arr=arr.split("");
}
if(Array.every){
return Array[_327?"every":"some"](arr,_329,_32a);
}else{
if(!_32a){
_32a=dj_global;
}
for(var i=0,l=arr.length;i<l;i++){
var _32d=_329.call(_32a,arr[i],i,arr);
if(_327&&!_32d){
return false;
}else{
if((!_327)&&(_32d)){
return true;
}
}
}
return Boolean(_327);
}
},every:function(arr,_32f,_330){
return this._everyOrSome(true,arr,_32f,_330);
},some:function(arr,_332,_333){
return this._everyOrSome(false,arr,_332,_333);
},filter:function(arr,_335,_336){
var _337=dojo.lang.isString(arr);
if(_337){
arr=arr.split("");
}
var _338;
if(Array.filter){
_338=Array.filter(arr,_335,_336);
}else{
if(!_336){
if(arguments.length>=3){
dojo.raise("thisObject doesn't exist!");
}
_336=dj_global;
}
_338=[];
for(var i=0;i<arr.length;i++){
if(_335.call(_336,arr[i],i,arr)){
_338.push(arr[i]);
}
}
}
if(_337){
return _338.join("");
}else{
return _338;
}
},unnest:function(){
var out=[];
for(var i=0;i<arguments.length;i++){
if(dojo.lang.isArrayLike(arguments[i])){
var add=dojo.lang.unnest.apply(this,arguments[i]);
out=out.concat(add);
}else{
out.push(arguments[i]);
}
}
return out;
},toArray:function(_33d,_33e){
var _33f=[];
for(var i=_33e||0;i<_33d.length;i++){
_33f.push(_33d[i]);
}
return _33f;
}});
dojo.provide("dojo.lang.extras");
dojo.lang.setTimeout=function(func,_342){
var _343=window,_344=2;
if(!dojo.lang.isFunction(func)){
_343=func;
func=_342;
_342=arguments[2];
_344++;
}
if(dojo.lang.isString(func)){
func=_343[func];
}
var args=[];
for(var i=_344;i<arguments.length;i++){
args.push(arguments[i]);
}
return dojo.global().setTimeout(function(){
func.apply(_343,args);
},_342);
};
dojo.lang.clearTimeout=function(_347){
dojo.global().clearTimeout(_347);
};
dojo.lang.getNameInObj=function(ns,item){
if(!ns){
ns=dj_global;
}
for(var x in ns){
if(ns[x]===item){
return new String(x);
}
}
return null;
};
dojo.lang.shallowCopy=function(obj,deep){
var i,ret;
if(obj===null){
return null;
}
if(dojo.lang.isObject(obj)){
ret=new obj.constructor();
for(i in obj){
if(dojo.lang.isUndefined(ret[i])){
ret[i]=deep?dojo.lang.shallowCopy(obj[i],deep):obj[i];
}
}
}else{
if(dojo.lang.isArray(obj)){
ret=[];
for(i=0;i<obj.length;i++){
ret[i]=deep?dojo.lang.shallowCopy(obj[i],deep):obj[i];
}
}else{
ret=obj;
}
}
return ret;
};
dojo.lang.firstValued=function(){
for(var i=0;i<arguments.length;i++){
if(typeof arguments[i]!="undefined"){
return arguments[i];
}
}
return undefined;
};
dojo.lang.getObjPathValue=function(_350,_351,_352){
with(dojo.parseObjPath(_350,_351,_352)){
return dojo.evalProp(prop,obj,_352);
}
};
dojo.lang.setObjPathValue=function(_353,_354,_355,_356){
dojo.deprecated("dojo.lang.setObjPathValue","use dojo.parseObjPath and the '=' operator","0.6");
if(arguments.length<4){
_356=true;
}
with(dojo.parseObjPath(_353,_355,_356)){
if(obj&&(_356||(prop in obj))){
obj[prop]=_354;
}
}
};
dojo.provide("dojo.lang.func");
dojo.lang.hitch=function(_357,_358){
var fcn=(dojo.lang.isString(_358)?_357[_358]:_358)||function(){
};
return function(){
return fcn.apply(_357,arguments);
};
};
dojo.lang.anonCtr=0;
dojo.lang.anon={};
dojo.lang.nameAnonFunc=function(_35a,_35b,_35c){
var nso=(_35b||dojo.lang.anon);
if((_35c)||((dj_global["djConfig"])&&(djConfig["slowAnonFuncLookups"]==true))){
for(var x in nso){
try{
if(nso[x]===_35a){
return x;
}
}
catch(e){
}
}
}
var ret="__"+dojo.lang.anonCtr++;
while(typeof nso[ret]!="undefined"){
ret="__"+dojo.lang.anonCtr++;
}
nso[ret]=_35a;
return ret;
};
dojo.lang.forward=function(_360){
return function(){
return this[_360].apply(this,arguments);
};
};
dojo.lang.curry=function(_361,func){
var _363=[];
_361=_361||dj_global;
if(dojo.lang.isString(func)){
func=_361[func];
}
for(var x=2;x<arguments.length;x++){
_363.push(arguments[x]);
}
var _365=(func["__preJoinArity"]||func.length)-_363.length;
function gather(_366,_367,_368){
var _369=_368;
var _36a=_367.slice(0);
for(var x=0;x<_366.length;x++){
_36a.push(_366[x]);
}
_368=_368-_366.length;
if(_368<=0){
var res=func.apply(_361,_36a);
_368=_369;
return res;
}else{
return function(){
return gather(arguments,_36a,_368);
};
}
}
return gather([],_363,_365);
};
dojo.lang.curryArguments=function(_36d,func,args,_370){
var _371=[];
var x=_370||0;
for(x=_370;x<args.length;x++){
_371.push(args[x]);
}
return dojo.lang.curry.apply(dojo.lang,[_36d,func].concat(_371));
};
dojo.lang.tryThese=function(){
for(var x=0;x<arguments.length;x++){
try{
if(typeof arguments[x]=="function"){
var ret=(arguments[x]());
if(ret){
return ret;
}
}
}
catch(e){
dojo.debug(e);
}
}
};
dojo.lang.delayThese=function(farr,cb,_377,_378){
if(!farr.length){
if(typeof _378=="function"){
_378();
}
return;
}
if((typeof _377=="undefined")&&(typeof cb=="number")){
_377=cb;
cb=function(){
};
}else{
if(!cb){
cb=function(){
};
if(!_377){
_377=0;
}
}
}
setTimeout(function(){
(farr.shift())();
cb();
dojo.lang.delayThese(farr,cb,_377,_378);
},_377);
};
dojo.provide("dojo.event.common");
dojo.event=new function(){
this._canTimeout=dojo.lang.isFunction(dj_global["setTimeout"])||dojo.lang.isAlien(dj_global["setTimeout"]);
function interpolateArgs(args,_37a){
var dl=dojo.lang;
var ao={srcObj:dj_global,srcFunc:null,adviceObj:dj_global,adviceFunc:null,aroundObj:null,aroundFunc:null,adviceType:(args.length>2)?args[0]:"after",precedence:"last",once:false,delay:null,rate:0,adviceMsg:false,maxCalls:-1};
switch(args.length){
case 0:
return;
case 1:
return;
case 2:
ao.srcFunc=args[0];
ao.adviceFunc=args[1];
break;
case 3:
if((dl.isObject(args[0]))&&(dl.isString(args[1]))&&(dl.isString(args[2]))){
ao.adviceType="after";
ao.srcObj=args[0];
ao.srcFunc=args[1];
ao.adviceFunc=args[2];
}else{
if((dl.isString(args[1]))&&(dl.isString(args[2]))){
ao.srcFunc=args[1];
ao.adviceFunc=args[2];
}else{
if((dl.isObject(args[0]))&&(dl.isString(args[1]))&&(dl.isFunction(args[2]))){
ao.adviceType="after";
ao.srcObj=args[0];
ao.srcFunc=args[1];
var _37d=dl.nameAnonFunc(args[2],ao.adviceObj,_37a);
ao.adviceFunc=_37d;
}else{
if((dl.isFunction(args[0]))&&(dl.isObject(args[1]))&&(dl.isString(args[2]))){
ao.adviceType="after";
ao.srcObj=dj_global;
var _37d=dl.nameAnonFunc(args[0],ao.srcObj,_37a);
ao.srcFunc=_37d;
ao.adviceObj=args[1];
ao.adviceFunc=args[2];
}
}
}
}
break;
case 4:
if((dl.isObject(args[0]))&&(dl.isObject(args[2]))){
ao.adviceType="after";
ao.srcObj=args[0];
ao.srcFunc=args[1];
ao.adviceObj=args[2];
ao.adviceFunc=args[3];
}else{
if((dl.isString(args[0]))&&(dl.isString(args[1]))&&(dl.isObject(args[2]))){
ao.adviceType=args[0];
ao.srcObj=dj_global;
ao.srcFunc=args[1];
ao.adviceObj=args[2];
ao.adviceFunc=args[3];
}else{
if((dl.isString(args[0]))&&(dl.isFunction(args[1]))&&(dl.isObject(args[2]))){
ao.adviceType=args[0];
ao.srcObj=dj_global;
var _37d=dl.nameAnonFunc(args[1],dj_global,_37a);
ao.srcFunc=_37d;
ao.adviceObj=args[2];
ao.adviceFunc=args[3];
}else{
if((dl.isString(args[0]))&&(dl.isObject(args[1]))&&(dl.isString(args[2]))&&(dl.isFunction(args[3]))){
ao.srcObj=args[1];
ao.srcFunc=args[2];
var _37d=dl.nameAnonFunc(args[3],dj_global,_37a);
ao.adviceObj=dj_global;
ao.adviceFunc=_37d;
}else{
if(dl.isObject(args[1])){
ao.srcObj=args[1];
ao.srcFunc=args[2];
ao.adviceObj=dj_global;
ao.adviceFunc=args[3];
}else{
if(dl.isObject(args[2])){
ao.srcObj=dj_global;
ao.srcFunc=args[1];
ao.adviceObj=args[2];
ao.adviceFunc=args[3];
}else{
ao.srcObj=ao.adviceObj=ao.aroundObj=dj_global;
ao.srcFunc=args[1];
ao.adviceFunc=args[2];
ao.aroundFunc=args[3];
}
}
}
}
}
}
break;
case 6:
ao.srcObj=args[1];
ao.srcFunc=args[2];
ao.adviceObj=args[3];
ao.adviceFunc=args[4];
ao.aroundFunc=args[5];
ao.aroundObj=dj_global;
break;
default:
ao.srcObj=args[1];
ao.srcFunc=args[2];
ao.adviceObj=args[3];
ao.adviceFunc=args[4];
ao.aroundObj=args[5];
ao.aroundFunc=args[6];
ao.once=args[7];
ao.delay=args[8];
ao.rate=args[9];
ao.adviceMsg=args[10];
ao.maxCalls=(!isNaN(parseInt(args[11])))?args[11]:-1;
break;
}
if(dl.isFunction(ao.aroundFunc)){
var _37d=dl.nameAnonFunc(ao.aroundFunc,ao.aroundObj,_37a);
ao.aroundFunc=_37d;
}
if(dl.isFunction(ao.srcFunc)){
ao.srcFunc=dl.getNameInObj(ao.srcObj,ao.srcFunc);
}
if(dl.isFunction(ao.adviceFunc)){
ao.adviceFunc=dl.getNameInObj(ao.adviceObj,ao.adviceFunc);
}
if((ao.aroundObj)&&(dl.isFunction(ao.aroundFunc))){
ao.aroundFunc=dl.getNameInObj(ao.aroundObj,ao.aroundFunc);
}
if(!ao.srcObj){
dojo.raise("bad srcObj for srcFunc: "+ao.srcFunc);
}
if(!ao.adviceObj){
dojo.raise("bad adviceObj for adviceFunc: "+ao.adviceFunc);
}
if(!ao.adviceFunc){
dojo.debug("bad adviceFunc for srcFunc: "+ao.srcFunc);
dojo.debugShallow(ao);
}
return ao;
}
this.connect=function(){
if(arguments.length==1){
var ao=arguments[0];
}else{
var ao=interpolateArgs(arguments,true);
}
if(dojo.lang.isArray(ao.srcObj)&&ao.srcObj!=""){
var _37f={};
for(var x in ao){
_37f[x]=ao[x];
}
var mjps=[];
dojo.lang.forEach(ao.srcObj,function(src){
if((dojo.render.html.capable)&&(dojo.lang.isString(src))){
src=dojo.byId(src);
}
_37f.srcObj=src;
mjps.push(dojo.event.connect.call(dojo.event,_37f));
});
return mjps;
}
var mjp=dojo.event.MethodJoinPoint.getForMethod(ao.srcObj,ao.srcFunc);
if(ao.adviceFunc){
var mjp2=dojo.event.MethodJoinPoint.getForMethod(ao.adviceObj,ao.adviceFunc);
}
mjp.kwAddAdvice(ao);
return mjp;
};
this.log=function(a1,a2){
var _387;
if((arguments.length==1)&&(typeof a1=="object")){
_387=a1;
}else{
_387={srcObj:a1,srcFunc:a2};
}
_387.adviceFunc=function(){
var _388=[];
for(var x=0;x<arguments.length;x++){
_388.push(arguments[x]);
}
dojo.debug("("+_387.srcObj+")."+_387.srcFunc,":",_388.join(", "));
};
this.kwConnect(_387);
};
this.connectBefore=function(){
var args=["before"];
for(var i=0;i<arguments.length;i++){
args.push(arguments[i]);
}
return this.connect.apply(this,args);
};
this.connectAround=function(){
var args=["around"];
for(var i=0;i<arguments.length;i++){
args.push(arguments[i]);
}
return this.connect.apply(this,args);
};
this.connectOnce=function(){
var ao=interpolateArgs(arguments,true);
ao.once=true;
return this.connect(ao);
};
this.connectRunOnce=function(){
var ao=interpolateArgs(arguments,true);
ao.maxCalls=1;
return this.connect(ao);
};
this._kwConnectImpl=function(_390,_391){
var fn=(_391)?"disconnect":"connect";
if(typeof _390["srcFunc"]=="function"){
_390.srcObj=_390["srcObj"]||dj_global;
var _393=dojo.lang.nameAnonFunc(_390.srcFunc,_390.srcObj,true);
_390.srcFunc=_393;
}
if(typeof _390["adviceFunc"]=="function"){
_390.adviceObj=_390["adviceObj"]||dj_global;
var _393=dojo.lang.nameAnonFunc(_390.adviceFunc,_390.adviceObj,true);
_390.adviceFunc=_393;
}
_390.srcObj=_390["srcObj"]||dj_global;
_390.adviceObj=_390["adviceObj"]||_390["targetObj"]||dj_global;
_390.adviceFunc=_390["adviceFunc"]||_390["targetFunc"];
return dojo.event[fn](_390);
};
this.kwConnect=function(_394){
return this._kwConnectImpl(_394,false);
};
this.disconnect=function(){
if(arguments.length==1){
var ao=arguments[0];
}else{
var ao=interpolateArgs(arguments,true);
}
if(!ao.adviceFunc){
return;
}
if(dojo.lang.isString(ao.srcFunc)&&(ao.srcFunc.toLowerCase()=="onkey")){
if(dojo.render.html.ie){
ao.srcFunc="onkeydown";
this.disconnect(ao);
}
ao.srcFunc="onkeypress";
}
if(!ao.srcObj[ao.srcFunc]){
return null;
}
var mjp=dojo.event.MethodJoinPoint.getForMethod(ao.srcObj,ao.srcFunc,true);
mjp.removeAdvice(ao.adviceObj,ao.adviceFunc,ao.adviceType,ao.once);
return mjp;
};
this.kwDisconnect=function(_397){
return this._kwConnectImpl(_397,true);
};
};
dojo.event.MethodInvocation=function(_398,obj,args){
this.jp_=_398;
this.object=obj;
this.args=[];
for(var x=0;x<args.length;x++){
this.args[x]=args[x];
}
this.around_index=-1;
};
dojo.event.MethodInvocation.prototype.proceed=function(){
this.around_index++;
if(this.around_index>=this.jp_.around.length){
return this.jp_.object[this.jp_.methodname].apply(this.jp_.object,this.args);
}else{
var ti=this.jp_.around[this.around_index];
var mobj=ti[0]||dj_global;
var meth=ti[1];
return mobj[meth].call(mobj,this);
}
};
dojo.event.MethodJoinPoint=function(obj,_3a0){
this.object=obj||dj_global;
this.methodname=_3a0;
this.methodfunc=this.object[_3a0];
this.squelch=false;
};
dojo.event.MethodJoinPoint.getForMethod=function(obj,_3a2){
if(!obj){
obj=dj_global;
}
var ofn=obj[_3a2];
if(!ofn){
ofn=obj[_3a2]=function(){
};
if(!obj[_3a2]){
dojo.raise("Cannot set do-nothing method on that object "+_3a2);
}
}else{
if((typeof ofn!="function")&&(!dojo.lang.isFunction(ofn))&&(!dojo.lang.isAlien(ofn))){
return null;
}
}
var _3a4=_3a2+"$joinpoint";
var _3a5=_3a2+"$joinpoint$method";
var _3a6=obj[_3a4];
if(!_3a6){
var _3a7=false;
if(dojo.event["browser"]){
if((obj["attachEvent"])||(obj["nodeType"])||(obj["addEventListener"])){
_3a7=true;
dojo.event.browser.addClobberNodeAttrs(obj,[_3a4,_3a5,_3a2]);
}
}
var _3a8=ofn.length;
obj[_3a5]=ofn;
_3a6=obj[_3a4]=new dojo.event.MethodJoinPoint(obj,_3a5);
if(!_3a7){
obj[_3a2]=function(){
return _3a6.run.apply(_3a6,arguments);
};
}else{
obj[_3a2]=function(){
var args=[];
if(!arguments.length){
var evt=null;
try{
if(obj.ownerDocument){
evt=obj.ownerDocument.parentWindow.event;
}else{
if(obj.documentElement){
evt=obj.documentElement.ownerDocument.parentWindow.event;
}else{
if(obj.event){
evt=obj.event;
}else{
evt=window.event;
}
}
}
}
catch(e){
evt=window.event;
}
if(evt){
args.push(dojo.event.browser.fixEvent(evt,this));
}
}else{
for(var x=0;x<arguments.length;x++){
if((x==0)&&(dojo.event.browser.isEvent(arguments[x]))){
args.push(dojo.event.browser.fixEvent(arguments[x],this));
}else{
args.push(arguments[x]);
}
}
}
return _3a6.run.apply(_3a6,args);
};
}
obj[_3a2].__preJoinArity=_3a8;
}
return _3a6;
};
dojo.lang.extend(dojo.event.MethodJoinPoint,{squelch:false,unintercept:function(){
this.object[this.methodname]=this.methodfunc;
this.before=[];
this.after=[];
this.around=[];
},disconnect:dojo.lang.forward("unintercept"),run:function(){
var obj=this.object||dj_global;
var args=arguments;
var _3ae=[];
for(var x=0;x<args.length;x++){
_3ae[x]=args[x];
}
var _3b0=function(marr){
if(!marr){
dojo.debug("Null argument to unrollAdvice()");
return;
}
var _3b2=marr[0]||dj_global;
var _3b3=marr[1];
if(!_3b2[_3b3]){
dojo.raise("function \""+_3b3+"\" does not exist on \""+_3b2+"\"");
}
var _3b4=marr[2]||dj_global;
var _3b5=marr[3];
var msg=marr[6];
var _3b7=marr[7];
if(_3b7>-1){
if(_3b7==0){
return;
}
marr[7]--;
}
var _3b8;
var to={args:[],jp_:this,object:obj,proceed:function(){
return _3b2[_3b3].apply(_3b2,to.args);
}};
to.args=_3ae;
var _3ba=parseInt(marr[4]);
var _3bb=((!isNaN(_3ba))&&(marr[4]!==null)&&(typeof marr[4]!="undefined"));
if(marr[5]){
var rate=parseInt(marr[5]);
var cur=new Date();
var _3be=false;
if((marr["last"])&&((cur-marr.last)<=rate)){
if(dojo.event._canTimeout){
if(marr["delayTimer"]){
clearTimeout(marr.delayTimer);
}
var tod=parseInt(rate*2);
var mcpy=dojo.lang.shallowCopy(marr);
marr.delayTimer=setTimeout(function(){
mcpy[5]=0;
_3b0(mcpy);
},tod);
}
return;
}else{
marr.last=cur;
}
}
if(_3b5){
_3b4[_3b5].call(_3b4,to);
}else{
if((_3bb)&&((dojo.render.html)||(dojo.render.svg))){
dj_global["setTimeout"](function(){
if(msg){
_3b2[_3b3].call(_3b2,to);
}else{
_3b2[_3b3].apply(_3b2,args);
}
},_3ba);
}else{
if(msg){
_3b2[_3b3].call(_3b2,to);
}else{
_3b2[_3b3].apply(_3b2,args);
}
}
}
};
var _3c1=function(){
if(this.squelch){
try{
return _3b0.apply(this,arguments);
}
catch(e){
dojo.debug(e);
}
}else{
return _3b0.apply(this,arguments);
}
};
if((this["before"])&&(this.before.length>0)){
dojo.lang.forEach(this.before.concat(new Array()),_3c1);
}
var _3c2;
try{
if((this["around"])&&(this.around.length>0)){
var mi=new dojo.event.MethodInvocation(this,obj,args);
_3c2=mi.proceed();
}else{
if(this.methodfunc){
_3c2=this.object[this.methodname].apply(this.object,args);
}
}
}
catch(e){
if(!this.squelch){
dojo.debug(e,"when calling",this.methodname,"on",this.object,"with arguments",args);
dojo.raise(e);
}
}
if((this["after"])&&(this.after.length>0)){
dojo.lang.forEach(this.after.concat(new Array()),_3c1);
}
return (this.methodfunc)?_3c2:null;
},getArr:function(kind){
var type="after";
if((typeof kind=="string")&&(kind.indexOf("before")!=-1)){
type="before";
}else{
if(kind=="around"){
type="around";
}
}
if(!this[type]){
this[type]=[];
}
return this[type];
},kwAddAdvice:function(args){
this.addAdvice(args["adviceObj"],args["adviceFunc"],args["aroundObj"],args["aroundFunc"],args["adviceType"],args["precedence"],args["once"],args["delay"],args["rate"],args["adviceMsg"],args["maxCalls"]);
},addAdvice:function(_3c7,_3c8,_3c9,_3ca,_3cb,_3cc,once,_3ce,rate,_3d0,_3d1){
var arr=this.getArr(_3cb);
if(!arr){
dojo.raise("bad this: "+this);
}
var ao=[_3c7,_3c8,_3c9,_3ca,_3ce,rate,_3d0,_3d1];
if(once){
if(this.hasAdvice(_3c7,_3c8,_3cb,arr)>=0){
return;
}
}
if(_3cc=="first"){
arr.unshift(ao);
}else{
arr.push(ao);
}
},hasAdvice:function(_3d4,_3d5,_3d6,arr){
if(!arr){
arr=this.getArr(_3d6);
}
var ind=-1;
for(var x=0;x<arr.length;x++){
var aao=(typeof _3d5=="object")?(new String(_3d5)).toString():_3d5;
var a1o=(typeof arr[x][1]=="object")?(new String(arr[x][1])).toString():arr[x][1];
if((arr[x][0]==_3d4)&&(a1o==aao)){
ind=x;
}
}
return ind;
},removeAdvice:function(_3dc,_3dd,_3de,once){
var arr=this.getArr(_3de);
var ind=this.hasAdvice(_3dc,_3dd,_3de,arr);
if(ind==-1){
return false;
}
while(ind!=-1){
arr.splice(ind,1);
if(once){
break;
}
ind=this.hasAdvice(_3dc,_3dd,_3de,arr);
}
return true;
}});
dojo.provide("dojo.event.topic");
dojo.event.topic=new function(){
this.topics={};
this.getTopic=function(_3e2){
if(!this.topics[_3e2]){
this.topics[_3e2]=new this.TopicImpl(_3e2);
}
return this.topics[_3e2];
};
this.registerPublisher=function(_3e3,obj,_3e5){
var _3e3=this.getTopic(_3e3);
_3e3.registerPublisher(obj,_3e5);
};
this.subscribe=function(_3e6,obj,_3e8){
var _3e6=this.getTopic(_3e6);
_3e6.subscribe(obj,_3e8);
};
this.unsubscribe=function(_3e9,obj,_3eb){
var _3e9=this.getTopic(_3e9);
_3e9.unsubscribe(obj,_3eb);
};
this.destroy=function(_3ec){
this.getTopic(_3ec).destroy();
delete this.topics[_3ec];
};
this.publishApply=function(_3ed,args){
var _3ed=this.getTopic(_3ed);
_3ed.sendMessage.apply(_3ed,args);
};
this.publish=function(_3ef,_3f0){
var _3ef=this.getTopic(_3ef);
var args=[];
for(var x=1;x<arguments.length;x++){
args.push(arguments[x]);
}
_3ef.sendMessage.apply(_3ef,args);
};
};
dojo.event.topic.TopicImpl=function(_3f3){
this.topicName=_3f3;
this.subscribe=function(_3f4,_3f5){
var tf=_3f5||_3f4;
var to=(!_3f5)?dj_global:_3f4;
return dojo.event.kwConnect({srcObj:this,srcFunc:"sendMessage",adviceObj:to,adviceFunc:tf});
};
this.unsubscribe=function(_3f8,_3f9){
var tf=(!_3f9)?_3f8:_3f9;
var to=(!_3f9)?null:_3f8;
return dojo.event.kwDisconnect({srcObj:this,srcFunc:"sendMessage",adviceObj:to,adviceFunc:tf});
};
this._getJoinPoint=function(){
return dojo.event.MethodJoinPoint.getForMethod(this,"sendMessage");
};
this.setSquelch=function(_3fc){
this._getJoinPoint().squelch=_3fc;
};
this.destroy=function(){
this._getJoinPoint().disconnect();
};
this.registerPublisher=function(_3fd,_3fe){
dojo.event.connect(_3fd,_3fe,this,"sendMessage");
};
this.sendMessage=function(_3ff){
};
};
dojo.provide("dojo.event.browser");
dojo._ie_clobber=new function(){
this.clobberNodes=[];
function nukeProp(node,prop){
try{
node[prop]=null;
}
catch(e){
}
try{
delete node[prop];
}
catch(e){
}
try{
node.removeAttribute(prop);
}
catch(e){
}
}
this.clobber=function(_402){
var na;
var tna;
if(_402){
tna=_402.all||_402.getElementsByTagName("*");
na=[_402];
for(var x=0;x<tna.length;x++){
if(tna[x]["__doClobber__"]){
na.push(tna[x]);
}
}
}else{
try{
window.onload=null;
}
catch(e){
}
na=(this.clobberNodes.length)?this.clobberNodes:document.all;
}
tna=null;
var _406={};
for(var i=na.length-1;i>=0;i=i-1){
var el=na[i];
try{
if(el&&el["__clobberAttrs__"]){
for(var j=0;j<el.__clobberAttrs__.length;j++){
nukeProp(el,el.__clobberAttrs__[j]);
}
nukeProp(el,"__clobberAttrs__");
nukeProp(el,"__doClobber__");
}
}
catch(e){
}
}
na=null;
};
};
if(dojo.render.html.ie){
dojo.addOnUnload(function(){
dojo._ie_clobber.clobber();
try{
if((dojo["widget"])&&(dojo.widget["manager"])){
dojo.widget.manager.destroyAll();
}
}
catch(e){
}
if(dojo.widget){
for(var name in dojo.widget._templateCache){
if(dojo.widget._templateCache[name].node){
dojo.dom.destroyNode(dojo.widget._templateCache[name].node);
dojo.widget._templateCache[name].node=null;
delete dojo.widget._templateCache[name].node;
}
}
}
try{
window.onload=null;
}
catch(e){
}
try{
window.onunload=null;
}
catch(e){
}
dojo._ie_clobber.clobberNodes=[];
});
}
dojo.event.browser=new function(){
var _40b=0;
this.normalizedEventName=function(_40c){
switch(_40c){
case "CheckboxStateChange":
case "DOMAttrModified":
case "DOMMenuItemActive":
case "DOMMenuItemInactive":
case "DOMMouseScroll":
case "DOMNodeInserted":
case "DOMNodeRemoved":
case "RadioStateChange":
return _40c;
break;
default:
var lcn=_40c.toLowerCase();
return (lcn.indexOf("on")==0)?lcn.substr(2):lcn;
break;
}
};
this.clean=function(node){
if(dojo.render.html.ie){
dojo._ie_clobber.clobber(node);
}
};
this.addClobberNode=function(node){
if(!dojo.render.html.ie){
return;
}
if(!node["__doClobber__"]){
node.__doClobber__=true;
dojo._ie_clobber.clobberNodes.push(node);
node.__clobberAttrs__=[];
}
};
this.addClobberNodeAttrs=function(node,_411){
if(!dojo.render.html.ie){
return;
}
this.addClobberNode(node);
for(var x=0;x<_411.length;x++){
node.__clobberAttrs__.push(_411[x]);
}
};
this.removeListener=function(node,_414,fp,_416){
if(!_416){
var _416=false;
}
_414=dojo.event.browser.normalizedEventName(_414);
if(_414=="key"){
if(dojo.render.html.ie){
this.removeListener(node,"onkeydown",fp,_416);
}
_414="keypress";
}
if(node.removeEventListener){
node.removeEventListener(_414,fp,_416);
}
};
this.addListener=function(node,_418,fp,_41a,_41b){
if(!node){
return;
}
if(!_41a){
var _41a=false;
}
_418=dojo.event.browser.normalizedEventName(_418);
if(_418=="key"){
if(dojo.render.html.ie){
this.addListener(node,"onkeydown",fp,_41a,_41b);
}
_418="keypress";
}
if(!_41b){
var _41c=function(evt){
if(!evt){
evt=window.event;
}
var ret=fp(dojo.event.browser.fixEvent(evt,this));
if(_41a){
dojo.event.browser.stopEvent(evt);
}
return ret;
};
}else{
_41c=fp;
}
if(node.addEventListener){
node.addEventListener(_418,_41c,_41a);
return _41c;
}else{
_418="on"+_418;
if(typeof node[_418]=="function"){
var _41f=node[_418];
node[_418]=function(e){
_41f(e);
return _41c(e);
};
}else{
node[_418]=_41c;
}
if(dojo.render.html.ie){
this.addClobberNodeAttrs(node,[_418]);
}
return _41c;
}
};
this.isEvent=function(obj){
return (typeof obj!="undefined")&&(obj)&&(typeof Event!="undefined")&&(obj.eventPhase);
};
this.currentEvent=null;
this.callListener=function(_422,_423){
if(typeof _422!="function"){
dojo.raise("listener not a function: "+_422);
}
dojo.event.browser.currentEvent.currentTarget=_423;
return _422.call(_423,dojo.event.browser.currentEvent);
};
this._stopPropagation=function(){
dojo.event.browser.currentEvent.cancelBubble=true;
};
this._preventDefault=function(){
dojo.event.browser.currentEvent.returnValue=false;
};
this.keys={KEY_BACKSPACE:8,KEY_TAB:9,KEY_CLEAR:12,KEY_ENTER:13,KEY_SHIFT:16,KEY_CTRL:17,KEY_ALT:18,KEY_PAUSE:19,KEY_CAPS_LOCK:20,KEY_ESCAPE:27,KEY_SPACE:32,KEY_PAGE_UP:33,KEY_PAGE_DOWN:34,KEY_END:35,KEY_HOME:36,KEY_LEFT_ARROW:37,KEY_UP_ARROW:38,KEY_RIGHT_ARROW:39,KEY_DOWN_ARROW:40,KEY_INSERT:45,KEY_DELETE:46,KEY_HELP:47,KEY_LEFT_WINDOW:91,KEY_RIGHT_WINDOW:92,KEY_SELECT:93,KEY_NUMPAD_0:96,KEY_NUMPAD_1:97,KEY_NUMPAD_2:98,KEY_NUMPAD_3:99,KEY_NUMPAD_4:100,KEY_NUMPAD_5:101,KEY_NUMPAD_6:102,KEY_NUMPAD_7:103,KEY_NUMPAD_8:104,KEY_NUMPAD_9:105,KEY_NUMPAD_MULTIPLY:106,KEY_NUMPAD_PLUS:107,KEY_NUMPAD_ENTER:108,KEY_NUMPAD_MINUS:109,KEY_NUMPAD_PERIOD:110,KEY_NUMPAD_DIVIDE:111,KEY_F1:112,KEY_F2:113,KEY_F3:114,KEY_F4:115,KEY_F5:116,KEY_F6:117,KEY_F7:118,KEY_F8:119,KEY_F9:120,KEY_F10:121,KEY_F11:122,KEY_F12:123,KEY_F13:124,KEY_F14:125,KEY_F15:126,KEY_NUM_LOCK:144,KEY_SCROLL_LOCK:145};
this.revKeys=[];
for(var key in this.keys){
this.revKeys[this.keys[key]]=key;
}
this.fixEvent=function(evt,_426){
if(!evt){
if(window["event"]){
evt=window.event;
}
}
if((evt["type"])&&(evt["type"].indexOf("key")==0)){
evt.keys=this.revKeys;
for(var key in this.keys){
evt[key]=this.keys[key];
}
if(evt["type"]=="keydown"&&dojo.render.html.ie){
switch(evt.keyCode){
case evt.KEY_SHIFT:
case evt.KEY_CTRL:
case evt.KEY_ALT:
case evt.KEY_CAPS_LOCK:
case evt.KEY_LEFT_WINDOW:
case evt.KEY_RIGHT_WINDOW:
case evt.KEY_SELECT:
case evt.KEY_NUM_LOCK:
case evt.KEY_SCROLL_LOCK:
case evt.KEY_NUMPAD_0:
case evt.KEY_NUMPAD_1:
case evt.KEY_NUMPAD_2:
case evt.KEY_NUMPAD_3:
case evt.KEY_NUMPAD_4:
case evt.KEY_NUMPAD_5:
case evt.KEY_NUMPAD_6:
case evt.KEY_NUMPAD_7:
case evt.KEY_NUMPAD_8:
case evt.KEY_NUMPAD_9:
case evt.KEY_NUMPAD_PERIOD:
break;
case evt.KEY_NUMPAD_MULTIPLY:
case evt.KEY_NUMPAD_PLUS:
case evt.KEY_NUMPAD_ENTER:
case evt.KEY_NUMPAD_MINUS:
case evt.KEY_NUMPAD_DIVIDE:
break;
case evt.KEY_PAUSE:
case evt.KEY_TAB:
case evt.KEY_BACKSPACE:
case evt.KEY_ENTER:
case evt.KEY_ESCAPE:
case evt.KEY_PAGE_UP:
case evt.KEY_PAGE_DOWN:
case evt.KEY_END:
case evt.KEY_HOME:
case evt.KEY_LEFT_ARROW:
case evt.KEY_UP_ARROW:
case evt.KEY_RIGHT_ARROW:
case evt.KEY_DOWN_ARROW:
case evt.KEY_INSERT:
case evt.KEY_DELETE:
case evt.KEY_F1:
case evt.KEY_F2:
case evt.KEY_F3:
case evt.KEY_F4:
case evt.KEY_F5:
case evt.KEY_F6:
case evt.KEY_F7:
case evt.KEY_F8:
case evt.KEY_F9:
case evt.KEY_F10:
case evt.KEY_F11:
case evt.KEY_F12:
case evt.KEY_F12:
case evt.KEY_F13:
case evt.KEY_F14:
case evt.KEY_F15:
case evt.KEY_CLEAR:
case evt.KEY_HELP:
evt.key=evt.keyCode;
break;
default:
if(evt.ctrlKey||evt.altKey){
var _428=evt.keyCode;
if(_428>=65&&_428<=90&&evt.shiftKey==false){
_428+=32;
}
if(_428>=1&&_428<=26&&evt.ctrlKey){
_428+=96;
}
evt.key=String.fromCharCode(_428);
}
}
}else{
if(evt["type"]=="keypress"){
if(dojo.render.html.opera){
if(evt.which==0){
evt.key=evt.keyCode;
}else{
if(evt.which>0){
switch(evt.which){
case evt.KEY_SHIFT:
case evt.KEY_CTRL:
case evt.KEY_ALT:
case evt.KEY_CAPS_LOCK:
case evt.KEY_NUM_LOCK:
case evt.KEY_SCROLL_LOCK:
break;
case evt.KEY_PAUSE:
case evt.KEY_TAB:
case evt.KEY_BACKSPACE:
case evt.KEY_ENTER:
case evt.KEY_ESCAPE:
evt.key=evt.which;
break;
default:
var _428=evt.which;
if((evt.ctrlKey||evt.altKey||evt.metaKey)&&(evt.which>=65&&evt.which<=90&&evt.shiftKey==false)){
_428+=32;
}
evt.key=String.fromCharCode(_428);
}
}
}
}else{
if(dojo.render.html.ie){
if(!evt.ctrlKey&&!evt.altKey&&evt.keyCode>=evt.KEY_SPACE){
evt.key=String.fromCharCode(evt.keyCode);
}
}else{
if(dojo.render.html.safari){
switch(evt.keyCode){
case 25:
evt.key=evt.KEY_TAB;
evt.shift=true;
break;
case 63232:
evt.key=evt.KEY_UP_ARROW;
break;
case 63233:
evt.key=evt.KEY_DOWN_ARROW;
break;
case 63234:
evt.key=evt.KEY_LEFT_ARROW;
break;
case 63235:
evt.key=evt.KEY_RIGHT_ARROW;
break;
case 63236:
evt.key=evt.KEY_F1;
break;
case 63237:
evt.key=evt.KEY_F2;
break;
case 63238:
evt.key=evt.KEY_F3;
break;
case 63239:
evt.key=evt.KEY_F4;
break;
case 63240:
evt.key=evt.KEY_F5;
break;
case 63241:
evt.key=evt.KEY_F6;
break;
case 63242:
evt.key=evt.KEY_F7;
break;
case 63243:
evt.key=evt.KEY_F8;
break;
case 63244:
evt.key=evt.KEY_F9;
break;
case 63245:
evt.key=evt.KEY_F10;
break;
case 63246:
evt.key=evt.KEY_F11;
break;
case 63247:
evt.key=evt.KEY_F12;
break;
case 63250:
evt.key=evt.KEY_PAUSE;
break;
case 63272:
evt.key=evt.KEY_DELETE;
break;
case 63273:
evt.key=evt.KEY_HOME;
break;
case 63275:
evt.key=evt.KEY_END;
break;
case 63276:
evt.key=evt.KEY_PAGE_UP;
break;
case 63277:
evt.key=evt.KEY_PAGE_DOWN;
break;
case 63302:
evt.key=evt.KEY_INSERT;
break;
case 63248:
case 63249:
case 63289:
break;
default:
evt.key=evt.charCode>=evt.KEY_SPACE?String.fromCharCode(evt.charCode):evt.keyCode;
}
}else{
evt.key=evt.charCode>0?String.fromCharCode(evt.charCode):evt.keyCode;
}
}
}
}
}
}
if(dojo.render.html.ie){
if(!evt.target){
evt.target=evt.srcElement;
}
if(!evt.currentTarget){
evt.currentTarget=(_426?_426:evt.srcElement);
}
if(!evt.layerX){
evt.layerX=evt.offsetX;
}
if(!evt.layerY){
evt.layerY=evt.offsetY;
}
var doc=(evt.srcElement&&evt.srcElement.ownerDocument)?evt.srcElement.ownerDocument:document;
var _42a=((dojo.render.html.ie55)||(doc["compatMode"]=="BackCompat"))?doc.body:doc.documentElement;
if(!evt.pageX){
evt.pageX=evt.clientX+(_42a.scrollLeft||0);
}
if(!evt.pageY){
evt.pageY=evt.clientY+(_42a.scrollTop||0);
}
if(evt.type=="mouseover"){
evt.relatedTarget=evt.fromElement;
}
if(evt.type=="mouseout"){
evt.relatedTarget=evt.toElement;
}
this.currentEvent=evt;
evt.callListener=this.callListener;
evt.stopPropagation=this._stopPropagation;
evt.preventDefault=this._preventDefault;
}
return evt;
};
this.stopEvent=function(evt){
if(window.event){
evt.cancelBubble=true;
evt.returnValue=false;
}else{
evt.preventDefault();
evt.stopPropagation();
}
};
};
dojo.kwCompoundRequire({common:["dojo.event.common","dojo.event.topic"],browser:["dojo.event.browser"],dashboard:["dojo.event.browser"]});
dojo.provide("dojo.event.*");
dojo.provide("dojo.string.common");
dojo.string.trim=function(str,wh){
if(!str.replace){
return str;
}
if(!str.length){
return str;
}
var re=(wh>0)?(/^\s+/):(wh<0)?(/\s+$/):(/^\s+|\s+$/g);
return str.replace(re,"");
};
dojo.string.trimStart=function(str){
return dojo.string.trim(str,1);
};
dojo.string.trimEnd=function(str){
return dojo.string.trim(str,-1);
};
dojo.string.repeat=function(str,_432,_433){
var out="";
for(var i=0;i<_432;i++){
out+=str;
if(_433&&i<_432-1){
out+=_433;
}
}
return out;
};
dojo.string.pad=function(str,len,c,dir){
var out=String(str);
if(!c){
c="0";
}
if(!dir){
dir=1;
}
while(out.length<len){
if(dir>0){
out=c+out;
}else{
out+=c;
}
}
return out;
};
dojo.string.padLeft=function(str,len,c){
return dojo.string.pad(str,len,c,1);
};
dojo.string.padRight=function(str,len,c){
return dojo.string.pad(str,len,c,-1);
};
dojo.provide("dojo.string.extras");
dojo.string.substituteParams=function(_441,hash){
var map=(typeof hash=="object")?hash:dojo.lang.toArray(arguments,1);
return _441.replace(/\%\{(\w+)\}/g,function(_444,key){
if(typeof (map[key])!="undefined"&&map[key]!=null){
return map[key];
}
dojo.raise("Substitution not found: "+key);
});
};
dojo.string.capitalize=function(str){
if(!dojo.lang.isString(str)){
return "";
}
if(arguments.length==0){
str=this;
}
var _447=str.split(" ");
for(var i=0;i<_447.length;i++){
_447[i]=_447[i].charAt(0).toUpperCase()+_447[i].substring(1);
}
return _447.join(" ");
};
dojo.string.isBlank=function(str){
if(!dojo.lang.isString(str)){
return true;
}
return (dojo.string.trim(str).length==0);
};
dojo.string.encodeAscii=function(str){
if(!dojo.lang.isString(str)){
return str;
}
var ret="";
var _44c=escape(str);
var _44d,re=/%u([0-9A-F]{4})/i;
while((_44d=_44c.match(re))){
var num=Number("0x"+_44d[1]);
var _450=escape("&#"+num+";");
ret+=_44c.substring(0,_44d.index)+_450;
_44c=_44c.substring(_44d.index+_44d[0].length);
}
ret+=_44c.replace(/\+/g,"%2B");
return ret;
};
dojo.string.escape=function(type,str){
var args=dojo.lang.toArray(arguments,1);
switch(type.toLowerCase()){
case "xml":
case "html":
case "xhtml":
return dojo.string.escapeXml.apply(this,args);
case "sql":
return dojo.string.escapeSql.apply(this,args);
case "regexp":
case "regex":
return dojo.string.escapeRegExp.apply(this,args);
case "javascript":
case "jscript":
case "js":
return dojo.string.escapeJavaScript.apply(this,args);
case "ascii":
return dojo.string.encodeAscii.apply(this,args);
default:
return str;
}
};
dojo.string.escapeXml=function(str,_455){
str=str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_455){
str=str.replace(/'/gm,"&#39;");
}
return str;
};
dojo.string.escapeSql=function(str){
return str.replace(/'/gm,"''");
};
dojo.string.escapeRegExp=function(str){
return str.replace(/\\/gm,"\\\\").replace(/([\f\b\n\t\r[\^$|?*+(){}])/gm,"\\$1");
};
dojo.string.escapeJavaScript=function(str){
return str.replace(/(["'\f\b\n\t\r])/gm,"\\$1");
};
dojo.string.escapeString=function(str){
return ("\""+str.replace(/(["\\])/g,"\\$1")+"\"").replace(/[\f]/g,"\\f").replace(/[\b]/g,"\\b").replace(/[\n]/g,"\\n").replace(/[\t]/g,"\\t").replace(/[\r]/g,"\\r");
};
dojo.string.summary=function(str,len){
if(!len||str.length<=len){
return str;
}
return str.substring(0,len).replace(/\.+$/,"")+"...";
};
dojo.string.endsWith=function(str,end,_45e){
if(_45e){
str=str.toLowerCase();
end=end.toLowerCase();
}
if((str.length-end.length)<0){
return false;
}
return str.lastIndexOf(end)==str.length-end.length;
};
dojo.string.endsWithAny=function(str){
for(var i=1;i<arguments.length;i++){
if(dojo.string.endsWith(str,arguments[i])){
return true;
}
}
return false;
};
dojo.string.startsWith=function(str,_462,_463){
if(_463){
str=str.toLowerCase();
_462=_462.toLowerCase();
}
return str.indexOf(_462)==0;
};
dojo.string.startsWithAny=function(str){
for(var i=1;i<arguments.length;i++){
if(dojo.string.startsWith(str,arguments[i])){
return true;
}
}
return false;
};
dojo.string.has=function(str){
for(var i=1;i<arguments.length;i++){
if(str.indexOf(arguments[i])>-1){
return true;
}
}
return false;
};
dojo.string.normalizeNewlines=function(text,_469){
if(_469=="\n"){
text=text.replace(/\r\n/g,"\n");
text=text.replace(/\r/g,"\n");
}else{
if(_469=="\r"){
text=text.replace(/\r\n/g,"\r");
text=text.replace(/\n/g,"\r");
}else{
text=text.replace(/([^\r])\n/g,"$1\r\n").replace(/\r([^\n])/g,"\r\n$1");
}
}
return text;
};
dojo.string.splitEscaped=function(str,_46b){
var _46c=[];
for(var i=0,_46e=0;i<str.length;i++){
if(str.charAt(i)=="\\"){
i++;
continue;
}
if(str.charAt(i)==_46b){
_46c.push(str.substring(_46e,i));
_46e=i+1;
}
}
_46c.push(str.substr(_46e));
return _46c;
};
dojo.provide("dojo.Deferred");
dojo.Deferred=function(_46f){
this.chain=[];
this.id=this._nextId();
this.fired=-1;
this.paused=0;
this.results=[null,null];
this.canceller=_46f;
this.silentlyCancelled=false;
};
dojo.lang.extend(dojo.Deferred,{getFunctionFromArgs:function(){
var a=arguments;
if((a[0])&&(!a[1])){
if(dojo.lang.isFunction(a[0])){
return a[0];
}else{
if(dojo.lang.isString(a[0])){
return dj_global[a[0]];
}
}
}else{
if((a[0])&&(a[1])){
return dojo.lang.hitch(a[0],a[1]);
}
}
return null;
},makeCalled:function(){
var _471=new dojo.Deferred();
_471.callback();
return _471;
},repr:function(){
var _472;
if(this.fired==-1){
_472="unfired";
}else{
if(this.fired==0){
_472="success";
}else{
_472="error";
}
}
return "Deferred("+this.id+", "+_472+")";
},toString:dojo.lang.forward("repr"),_nextId:(function(){
var n=1;
return function(){
return n++;
};
})(),cancel:function(){
if(this.fired==-1){
if(this.canceller){
this.canceller(this);
}else{
this.silentlyCancelled=true;
}
if(this.fired==-1){
this.errback(new Error(this.repr()));
}
}else{
if((this.fired==0)&&(this.results[0] instanceof dojo.Deferred)){
this.results[0].cancel();
}
}
},_pause:function(){
this.paused++;
},_unpause:function(){
this.paused--;
if((this.paused==0)&&(this.fired>=0)){
this._fire();
}
},_continue:function(res){
this._resback(res);
this._unpause();
},_resback:function(res){
this.fired=((res instanceof Error)?1:0);
this.results[this.fired]=res;
this._fire();
},_check:function(){
if(this.fired!=-1){
if(!this.silentlyCancelled){
dojo.raise("already called!");
}
this.silentlyCancelled=false;
return;
}
},callback:function(res){
this._check();
this._resback(res);
},errback:function(res){
this._check();
if(!(res instanceof Error)){
res=new Error(res);
}
this._resback(res);
},addBoth:function(cb,cbfn){
var _47a=this.getFunctionFromArgs(cb,cbfn);
if(arguments.length>2){
_47a=dojo.lang.curryArguments(null,_47a,arguments,2);
}
return this.addCallbacks(_47a,_47a);
},addCallback:function(cb,cbfn){
var _47d=this.getFunctionFromArgs(cb,cbfn);
if(arguments.length>2){
_47d=dojo.lang.curryArguments(null,_47d,arguments,2);
}
return this.addCallbacks(_47d,null);
},addErrback:function(cb,cbfn){
var _480=this.getFunctionFromArgs(cb,cbfn);
if(arguments.length>2){
_480=dojo.lang.curryArguments(null,_480,arguments,2);
}
return this.addCallbacks(null,_480);
return this.addCallbacks(null,cbfn);
},addCallbacks:function(cb,eb){
this.chain.push([cb,eb]);
if(this.fired>=0){
this._fire();
}
return this;
},_fire:function(){
var _483=this.chain;
var _484=this.fired;
var res=this.results[_484];
var self=this;
var cb=null;
while(_483.length>0&&this.paused==0){
var pair=_483.shift();
var f=pair[_484];
if(f==null){
continue;
}
try{
res=f(res);
_484=((res instanceof Error)?1:0);
if(res instanceof dojo.Deferred){
cb=function(res){
self._continue(res);
};
this._pause();
}
}
catch(err){
_484=1;
res=err;
}
}
this.fired=_484;
this.results[_484]=res;
if((cb)&&(this.paused)){
res.addBoth(cb);
}
}});
dojo.provide("dojo.xml.Parse");
dojo.xml.Parse=function(){
var isIE=((dojo.render.html.capable)&&(dojo.render.html.ie));
function getTagName(node){
try{
return node.tagName.toLowerCase();
}
catch(e){
return "";
}
}
function getDojoTagName(node){
var _48e=getTagName(node);
if(!_48e){
return "";
}
if((dojo.widget)&&(dojo.widget.tags[_48e])){
return _48e;
}
var p=_48e.indexOf(":");
if(p>=0){
return _48e;
}
if(_48e.substr(0,5)=="dojo:"){
return _48e;
}
if(dojo.render.html.capable&&dojo.render.html.ie&&node.scopeName!="HTML"){
return node.scopeName.toLowerCase()+":"+_48e;
}
if(_48e.substr(0,4)=="dojo"){
return "dojo:"+_48e.substring(4);
}
var djt=node.getAttribute("dojoType")||node.getAttribute("dojotype");
if(djt){
if(djt.indexOf(":")<0){
djt="dojo:"+djt;
}
return djt.toLowerCase();
}
djt=node.getAttributeNS&&node.getAttributeNS(dojo.dom.dojoml,"type");
if(djt){
return "dojo:"+djt.toLowerCase();
}
try{
djt=node.getAttribute("dojo:type");
}
catch(e){
}
if(djt){
return "dojo:"+djt.toLowerCase();
}
if((dj_global["djConfig"])&&(!djConfig["ignoreClassNames"])){
var _491=node.className||node.getAttribute("class");
if((_491)&&(_491.indexOf)&&(_491.indexOf("dojo-")!=-1)){
var _492=_491.split(" ");
for(var x=0,c=_492.length;x<c;x++){
if(_492[x].slice(0,5)=="dojo-"){
return "dojo:"+_492[x].substr(5).toLowerCase();
}
}
}
}
return "";
}
this.parseElement=function(node,_496,_497,_498){
var _499=getTagName(node);
if(isIE&&_499.indexOf("/")==0){
return null;
}
try{
var attr=node.getAttribute("parseWidgets");
if(attr&&attr.toLowerCase()=="false"){
return {};
}
}
catch(e){
}
var _49b=true;
if(_497){
var _49c=getDojoTagName(node);
_499=_49c||_499;
_49b=Boolean(_49c);
}
var _49d={};
_49d[_499]=[];
var pos=_499.indexOf(":");
if(pos>0){
var ns=_499.substring(0,pos);
_49d["ns"]=ns;
if((dojo.ns)&&(!dojo.ns.allow(ns))){
_49b=false;
}
}
if(_49b){
var _4a0=this.parseAttributes(node);
for(var attr in _4a0){
if((!_49d[_499][attr])||(typeof _49d[_499][attr]!="array")){
_49d[_499][attr]=[];
}
_49d[_499][attr].push(_4a0[attr]);
}
_49d[_499].nodeRef=node;
_49d.tagName=_499;
_49d.index=_498||0;
}
var _4a1=0;
for(var i=0;i<node.childNodes.length;i++){
var tcn=node.childNodes.item(i);
switch(tcn.nodeType){
case dojo.dom.ELEMENT_NODE:
var ctn=getDojoTagName(tcn)||getTagName(tcn);
if(!_49d[ctn]){
_49d[ctn]=[];
}
_49d[ctn].push(this.parseElement(tcn,true,_497,_4a1));
if((tcn.childNodes.length==1)&&(tcn.childNodes.item(0).nodeType==dojo.dom.TEXT_NODE)){
_49d[ctn][_49d[ctn].length-1].value=tcn.childNodes.item(0).nodeValue;
}
_4a1++;
break;
case dojo.dom.TEXT_NODE:
if(node.childNodes.length==1){
_49d[_499].push({value:node.childNodes.item(0).nodeValue});
}
break;
default:
break;
}
}
return _49d;
};
this.parseAttributes=function(node){
var _4a6={};
var atts=node.attributes;
var _4a8,i=0;
while((_4a8=atts[i++])){
if(isIE){
if(!_4a8){
continue;
}
if((typeof _4a8=="object")&&(typeof _4a8.nodeValue=="undefined")||(_4a8.nodeValue==null)||(_4a8.nodeValue=="")){
continue;
}
}
var nn=_4a8.nodeName.split(":");
nn=(nn.length==2)?nn[1]:_4a8.nodeName;
_4a6[nn]={value:_4a8.nodeValue};
}
return _4a6;
};
};
dojo.provide("dojo.lang.declare");
dojo.lang.declare=function(_4ab,_4ac,init,_4ae){
if((dojo.lang.isFunction(_4ae))||((!_4ae)&&(!dojo.lang.isFunction(init)))){
var temp=_4ae;
_4ae=init;
init=temp;
}
var _4b0=[];
if(dojo.lang.isArray(_4ac)){
_4b0=_4ac;
_4ac=_4b0.shift();
}
if(!init){
init=dojo.evalObjPath(_4ab,false);
if((init)&&(!dojo.lang.isFunction(init))){
init=null;
}
}
var ctor=dojo.lang.declare._makeConstructor();
var scp=(_4ac?_4ac.prototype:null);
if(scp){
scp.prototyping=true;
ctor.prototype=new _4ac();
scp.prototyping=false;
}
ctor.superclass=scp;
ctor.mixins=_4b0;
for(var i=0,l=_4b0.length;i<l;i++){
dojo.lang.extend(ctor,_4b0[i].prototype);
}
ctor.prototype.initializer=null;
ctor.prototype.declaredClass=_4ab;
if(dojo.lang.isArray(_4ae)){
dojo.lang.extend.apply(dojo.lang,[ctor].concat(_4ae));
}else{
dojo.lang.extend(ctor,(_4ae)||{});
}
dojo.lang.extend(ctor,dojo.lang.declare._common);
ctor.prototype.constructor=ctor;
ctor.prototype.initializer=(ctor.prototype.initializer)||(init)||(function(){
});
var _4b5=dojo.parseObjPath(_4ab,null,true);
_4b5.obj[_4b5.prop]=ctor;
return ctor;
};
dojo.lang.declare._makeConstructor=function(){
return function(){
var self=this._getPropContext();
var s=self.constructor.superclass;
if((s)&&(s.constructor)){
if(s.constructor==arguments.callee){
this._inherited("constructor",arguments);
}else{
this._contextMethod(s,"constructor",arguments);
}
}
var ms=(self.constructor.mixins)||([]);
for(var i=0,m;(m=ms[i]);i++){
(((m.prototype)&&(m.prototype.initializer))||(m)).apply(this,arguments);
}
if((!this.prototyping)&&(self.initializer)){
self.initializer.apply(this,arguments);
}
};
};
dojo.lang.declare._common={_getPropContext:function(){
return (this.___proto||this);
},_contextMethod:function(_4bb,_4bc,args){
var _4be,_4bf=this.___proto;
this.___proto=_4bb;
try{
_4be=_4bb[_4bc].apply(this,(args||[]));
}
catch(e){
throw e;
}
finally{
this.___proto=_4bf;
}
return _4be;
},_inherited:function(prop,args){
var p=this._getPropContext();
do{
if((!p.constructor)||(!p.constructor.superclass)){
return;
}
p=p.constructor.superclass;
}while(!(prop in p));
return (dojo.lang.isFunction(p[prop])?this._contextMethod(p,prop,args):p[prop]);
},inherited:function(prop,args){
dojo.deprecated("'inherited' method is dangerous, do not up-call! 'inherited' is slated for removal in 0.5; name your super class (or use superclass property) instead.","0.5");
this._inherited(prop,args);
}};
dojo.declare=dojo.lang.declare;
dojo.provide("dojo.widget.Manager");
dojo.widget.manager=new function(){
this.widgets=[];
this.widgetIds=[];
this.topWidgets={};
var _4c5={};
var _4c6=[];
this.getUniqueId=function(_4c7){
var _4c8;
do{
_4c8=_4c7+"_"+(_4c5[_4c7]!=undefined?++_4c5[_4c7]:_4c5[_4c7]=0);
}while(this.getWidgetById(_4c8));
return _4c8;
};
this.add=function(_4c9){
this.widgets.push(_4c9);
if(!_4c9.extraArgs["id"]){
_4c9.extraArgs["id"]=_4c9.extraArgs["ID"];
}
if(_4c9.widgetId==""){
if(_4c9["id"]){
_4c9.widgetId=_4c9["id"];
}else{
if(_4c9.extraArgs["id"]){
_4c9.widgetId=_4c9.extraArgs["id"];
}else{
_4c9.widgetId=this.getUniqueId(_4c9.ns+"_"+_4c9.widgetType);
}
}
}
if(this.widgetIds[_4c9.widgetId]){
dojo.debug("widget ID collision on ID: "+_4c9.widgetId);
}
this.widgetIds[_4c9.widgetId]=_4c9;
};
this.destroyAll=function(){
for(var x=this.widgets.length-1;x>=0;x--){
try{
this.widgets[x].destroy(true);
delete this.widgets[x];
}
catch(e){
}
}
};
this.remove=function(_4cb){
if(dojo.lang.isNumber(_4cb)){
var tw=this.widgets[_4cb].widgetId;
delete this.topWidgets[tw];
delete this.widgetIds[tw];
this.widgets.splice(_4cb,1);
}else{
this.removeById(_4cb);
}
};
this.removeById=function(id){
if(!dojo.lang.isString(id)){
id=id["widgetId"];
if(!id){
dojo.debug("invalid widget or id passed to removeById");
return;
}
}
for(var i=0;i<this.widgets.length;i++){
if(this.widgets[i].widgetId==id){
this.remove(i);
break;
}
}
};
this.getWidgetById=function(id){
if(dojo.lang.isString(id)){
return this.widgetIds[id];
}
return id;
};
this.getWidgetsByType=function(type){
var lt=type.toLowerCase();
var _4d2=(type.indexOf(":")<0?function(x){
return x.widgetType.toLowerCase();
}:function(x){
return x.getNamespacedType();
});
var ret=[];
dojo.lang.forEach(this.widgets,function(x){
if(_4d2(x)==lt){
ret.push(x);
}
});
return ret;
};
this.getWidgetsByFilter=function(_4d7,_4d8){
var ret=[];
dojo.lang.every(this.widgets,function(x){
if(_4d7(x)){
ret.push(x);
if(_4d8){
return false;
}
}
return true;
});
return (_4d8?ret[0]:ret);
};
this.getAllWidgets=function(){
return this.widgets.concat();
};
this.getWidgetByNode=function(node){
var w=this.getAllWidgets();
node=dojo.byId(node);
for(var i=0;i<w.length;i++){
if(w[i].domNode==node){
return w[i];
}
}
return null;
};
this.byId=this.getWidgetById;
this.byType=this.getWidgetsByType;
this.byFilter=this.getWidgetsByFilter;
this.byNode=this.getWidgetByNode;
var _4de={};
var _4df=["dojo.widget"];
for(var i=0;i<_4df.length;i++){
_4df[_4df[i]]=true;
}
this.registerWidgetPackage=function(_4e1){
if(!_4df[_4e1]){
_4df[_4e1]=true;
_4df.push(_4e1);
}
};
this.getWidgetPackageList=function(){
return dojo.lang.map(_4df,function(elt){
return (elt!==true?elt:undefined);
});
};
this.getImplementation=function(_4e3,_4e4,_4e5,ns){
var impl=this.getImplementationName(_4e3,ns);
if(impl){
var ret=_4e4?new impl(_4e4):new impl();
return ret;
}
};
function buildPrefixCache(){
for(var _4e9 in dojo.render){
if(dojo.render[_4e9]["capable"]===true){
var _4ea=dojo.render[_4e9].prefixes;
for(var i=0;i<_4ea.length;i++){
_4c6.push(_4ea[i].toLowerCase());
}
}
}
}
var _4ec=function(_4ed,_4ee){
if(!_4ee){
return null;
}
for(var i=0,l=_4c6.length,_4f1;i<=l;i++){
_4f1=(i<l?_4ee[_4c6[i]]:_4ee);
if(!_4f1){
continue;
}
for(var name in _4f1){
if(name.toLowerCase()==_4ed){
return _4f1[name];
}
}
}
return null;
};
var _4f3=function(_4f4,_4f5){
var _4f6=dojo.evalObjPath(_4f5,false);
return (_4f6?_4ec(_4f4,_4f6):null);
};
this.getImplementationName=function(_4f7,ns){
var _4f9=_4f7.toLowerCase();
ns=ns||"dojo";
var imps=_4de[ns]||(_4de[ns]={});
var impl=imps[_4f9];
if(impl){
return impl;
}
if(!_4c6.length){
buildPrefixCache();
}
var _4fc=dojo.ns.get(ns);
if(!_4fc){
dojo.ns.register(ns,ns+".widget");
_4fc=dojo.ns.get(ns);
}
if(_4fc){
_4fc.resolve(_4f7);
}
impl=_4f3(_4f9,_4fc.module);
if(impl){
return (imps[_4f9]=impl);
}
_4fc=dojo.ns.require(ns);
if((_4fc)&&(_4fc.resolver)){
_4fc.resolve(_4f7);
impl=_4f3(_4f9,_4fc.module);
if(impl){
return (imps[_4f9]=impl);
}
}
dojo.deprecated("dojo.widget.Manager.getImplementationName","Could not locate widget implementation for \""+_4f7+"\" in \""+_4fc.module+"\" registered to namespace \""+_4fc.name+"\". "+"Developers must specify correct namespaces for all non-Dojo widgets","0.5");
for(var i=0;i<_4df.length;i++){
impl=_4f3(_4f9,_4df[i]);
if(impl){
return (imps[_4f9]=impl);
}
}
throw new Error("Could not locate widget implementation for \""+_4f7+"\" in \""+_4fc.module+"\" registered to namespace \""+_4fc.name+"\"");
};
this.resizing=false;
this.onWindowResized=function(){
if(this.resizing){
return;
}
try{
this.resizing=true;
for(var id in this.topWidgets){
var _4ff=this.topWidgets[id];
if(_4ff.checkSize){
_4ff.checkSize();
}
}
}
catch(e){
}
finally{
this.resizing=false;
}
};
if(typeof window!="undefined"){
dojo.addOnLoad(this,"onWindowResized");
dojo.event.connect(window,"onresize",this,"onWindowResized");
}
};
(function(){
var dw=dojo.widget;
var dwm=dw.manager;
var h=dojo.lang.curry(dojo.lang,"hitch",dwm);
var g=function(_504,_505){
dw[(_505||_504)]=h(_504);
};
g("add","addWidget");
g("destroyAll","destroyAllWidgets");
g("remove","removeWidget");
g("removeById","removeWidgetById");
g("getWidgetById");
g("getWidgetById","byId");
g("getWidgetsByType");
g("getWidgetsByFilter");
g("getWidgetsByType","byType");
g("getWidgetsByFilter","byFilter");
g("getWidgetByNode","byNode");
dw.all=function(n){
var _507=dwm.getAllWidgets.apply(dwm,arguments);
if(arguments.length>0){
return _507[n];
}
return _507;
};
g("registerWidgetPackage");
g("getImplementation","getWidgetImplementation");
g("getImplementationName","getWidgetImplementationName");
dw.widgets=dwm.widgets;
dw.widgetIds=dwm.widgetIds;
dw.root=dwm.root;
})();
dojo.kwCompoundRequire({common:[["dojo.uri.Uri",false,false]]});
dojo.provide("dojo.uri.*");
dojo.provide("dojo.a11y");
dojo.a11y={imgPath:dojo.uri.moduleUri("dojo.widget","templates/images"),doAccessibleCheck:true,accessible:null,checkAccessible:function(){
if(this.accessible===null){
this.accessible=false;
if(this.doAccessibleCheck==true){
this.accessible=this.testAccessible();
}
}
return this.accessible;
},testAccessible:function(){
this.accessible=false;
if(dojo.render.html.ie||dojo.render.html.mozilla){
var div=document.createElement("div");
div.style.backgroundImage="url(\""+this.imgPath+"/tab_close.gif\")";
dojo.body().appendChild(div);
var _509=null;
if(window.getComputedStyle){
var _50a=getComputedStyle(div,"");
_509=_50a.getPropertyValue("background-image");
}else{
_509=div.currentStyle.backgroundImage;
}
var _50b=false;
if(_509!=null&&(_509=="none"||_509=="url(invalid-url:)")){
this.accessible=true;
}
dojo.body().removeChild(div);
}
return this.accessible;
},setCheckAccessible:function(_50c){
this.doAccessibleCheck=_50c;
},setAccessibleMode:function(){
if(this.accessible===null){
if(this.checkAccessible()){
dojo.render.html.prefixes.unshift("a11y");
}
}
return this.accessible;
}};
dojo.provide("dojo.widget.Widget");
dojo.declare("dojo.widget.Widget",null,function(){
this.children=[];
this.extraArgs={};
},{parent:null,isTopLevel:false,disabled:false,isContainer:false,widgetId:"",widgetType:"Widget",ns:"dojo",getNamespacedType:function(){
return (this.ns?this.ns+":"+this.widgetType:this.widgetType).toLowerCase();
},toString:function(){
return "[Widget "+this.getNamespacedType()+", "+(this.widgetId||"NO ID")+"]";
},repr:function(){
return this.toString();
},enable:function(){
this.disabled=false;
},disable:function(){
this.disabled=true;
},onResized:function(){
this.notifyChildrenOfResize();
},notifyChildrenOfResize:function(){
for(var i=0;i<this.children.length;i++){
var _50e=this.children[i];
if(_50e.onResized){
_50e.onResized();
}
}
},create:function(args,_510,_511,ns){
if(ns){
this.ns=ns;
}
this.satisfyPropertySets(args,_510,_511);
this.mixInProperties(args,_510,_511);
this.postMixInProperties(args,_510,_511);
dojo.widget.manager.add(this);
this.buildRendering(args,_510,_511);
this.initialize(args,_510,_511);
this.postInitialize(args,_510,_511);
this.postCreate(args,_510,_511);
return this;
},destroy:function(_513){
if(this.parent){
this.parent.removeChild(this);
}
this.destroyChildren();
this.uninitialize();
this.destroyRendering(_513);
dojo.widget.manager.removeById(this.widgetId);
},destroyChildren:function(){
var _514;
var i=0;
while(this.children.length>i){
_514=this.children[i];
if(_514 instanceof dojo.widget.Widget){
this.removeChild(_514);
_514.destroy();
continue;
}
i++;
}
},getChildrenOfType:function(type,_517){
var ret=[];
var _519=dojo.lang.isFunction(type);
if(!_519){
type=type.toLowerCase();
}
for(var x=0;x<this.children.length;x++){
if(_519){
if(this.children[x] instanceof type){
ret.push(this.children[x]);
}
}else{
if(this.children[x].widgetType.toLowerCase()==type){
ret.push(this.children[x]);
}
}
if(_517){
ret=ret.concat(this.children[x].getChildrenOfType(type,_517));
}
}
return ret;
},getDescendants:function(){
var _51b=[];
var _51c=[this];
var elem;
while((elem=_51c.pop())){
_51b.push(elem);
if(elem.children){
dojo.lang.forEach(elem.children,function(elem){
_51c.push(elem);
});
}
}
return _51b;
},isFirstChild:function(){
return this===this.parent.children[0];
},isLastChild:function(){
return this===this.parent.children[this.parent.children.length-1];
},satisfyPropertySets:function(args){
return args;
},mixInProperties:function(args,frag){
if((args["fastMixIn"])||(frag["fastMixIn"])){
for(var x in args){
this[x]=args[x];
}
return;
}
var _523;
var _524=dojo.widget.lcArgsCache[this.widgetType];
if(_524==null){
_524={};
for(var y in this){
_524[((new String(y)).toLowerCase())]=y;
}
dojo.widget.lcArgsCache[this.widgetType]=_524;
}
var _526={};
for(var x in args){
if(!this[x]){
var y=_524[(new String(x)).toLowerCase()];
if(y){
args[y]=args[x];
x=y;
}
}
if(_526[x]){
continue;
}
_526[x]=true;
if((typeof this[x])!=(typeof _523)){
if(typeof args[x]!="string"){
this[x]=args[x];
}else{
if(dojo.lang.isString(this[x])){
this[x]=args[x];
}else{
if(dojo.lang.isNumber(this[x])){
this[x]=new Number(args[x]);
}else{
if(dojo.lang.isBoolean(this[x])){
this[x]=(args[x].toLowerCase()=="false")?false:true;
}else{
if(dojo.lang.isFunction(this[x])){
if(args[x].search(/[^\w\.]+/i)==-1){
this[x]=dojo.evalObjPath(args[x],false);
}else{
var tn=dojo.lang.nameAnonFunc(new Function(args[x]),this);
dojo.event.kwConnect({srcObj:this,srcFunc:x,adviceObj:this,adviceFunc:tn});
}
}else{
if(dojo.lang.isArray(this[x])){
this[x]=args[x].split(";");
}else{
if(this[x] instanceof Date){
this[x]=new Date(Number(args[x]));
}else{
if(typeof this[x]=="object"){
if(this[x] instanceof dojo.uri.Uri){
this[x]=dojo.uri.dojoUri(args[x]);
}else{
var _528=args[x].split(";");
for(var y=0;y<_528.length;y++){
var si=_528[y].indexOf(":");
if((si!=-1)&&(_528[y].length>si)){
this[x][_528[y].substr(0,si).replace(/^\s+|\s+$/g,"")]=_528[y].substr(si+1);
}
}
}
}else{
this[x]=args[x];
}
}
}
}
}
}
}
}
}else{
this.extraArgs[x.toLowerCase()]=args[x];
}
}
},postMixInProperties:function(args,frag,_52c){
},initialize:function(args,frag,_52f){
return false;
},postInitialize:function(args,frag,_532){
return false;
},postCreate:function(args,frag,_535){
return false;
},uninitialize:function(){
return false;
},buildRendering:function(args,frag,_538){
dojo.unimplemented("dojo.widget.Widget.buildRendering, on "+this.toString()+", ");
return false;
},destroyRendering:function(){
dojo.unimplemented("dojo.widget.Widget.destroyRendering");
return false;
},addedTo:function(_539){
},addChild:function(_53a){
dojo.unimplemented("dojo.widget.Widget.addChild");
return false;
},removeChild:function(_53b){
for(var x=0;x<this.children.length;x++){
if(this.children[x]===_53b){
this.children.splice(x,1);
_53b.parent=null;
break;
}
}
return _53b;
},getPreviousSibling:function(){
var idx=this.getParentIndex();
if(idx<=0){
return null;
}
return this.parent.children[idx-1];
},getSiblings:function(){
return this.parent.children;
},getParentIndex:function(){
return dojo.lang.indexOf(this.parent.children,this,true);
},getNextSibling:function(){
var idx=this.getParentIndex();
if(idx==this.parent.children.length-1){
return null;
}
if(idx<0){
return null;
}
return this.parent.children[idx+1];
}});
dojo.widget.lcArgsCache={};
dojo.widget.tags={};
dojo.widget.tags.addParseTreeHandler=function(type){
dojo.deprecated("addParseTreeHandler",". ParseTreeHandlers are now reserved for components. Any unfiltered DojoML tag without a ParseTreeHandler is assumed to be a widget","0.5");
};
dojo.widget.tags["dojo:propertyset"]=function(_540,_541,_542){
var _543=_541.parseProperties(_540["dojo:propertyset"]);
};
dojo.widget.tags["dojo:connect"]=function(_544,_545,_546){
var _547=_545.parseProperties(_544["dojo:connect"]);
};
dojo.widget.buildWidgetFromParseTree=function(type,frag,_54a,_54b,_54c,_54d){
dojo.a11y.setAccessibleMode();
var _54e=type.split(":");
_54e=(_54e.length==2)?_54e[1]:type;
var _54f=_54d||_54a.parseProperties(frag[frag["ns"]+":"+_54e]);
var _550=dojo.widget.manager.getImplementation(_54e,null,null,frag["ns"]);
if(!_550){
throw new Error("cannot find \""+type+"\" widget");
}else{
if(!_550.create){
throw new Error("\""+type+"\" widget object has no \"create\" method and does not appear to implement *Widget");
}
}
_54f["dojoinsertionindex"]=_54c;
var ret=_550.create(_54f,frag,_54b,frag["ns"]);
return ret;
};
dojo.widget.defineWidget=function(_552,_553,_554,init,_556){
if(dojo.lang.isString(arguments[3])){
dojo.widget._defineWidget(arguments[0],arguments[3],arguments[1],arguments[4],arguments[2]);
}else{
var args=[arguments[0]],p=3;
if(dojo.lang.isString(arguments[1])){
args.push(arguments[1],arguments[2]);
}else{
args.push("",arguments[1]);
p=2;
}
if(dojo.lang.isFunction(arguments[p])){
args.push(arguments[p],arguments[p+1]);
}else{
args.push(null,arguments[p]);
}
dojo.widget._defineWidget.apply(this,args);
}
};
dojo.widget.defineWidget.renderers="html|svg|vml";
dojo.widget._defineWidget=function(_559,_55a,_55b,init,_55d){
var _55e=_559.split(".");
var type=_55e.pop();
var regx="\\.("+(_55a?_55a+"|":"")+dojo.widget.defineWidget.renderers+")\\.";
var r=_559.search(new RegExp(regx));
_55e=(r<0?_55e.join("."):_559.substr(0,r));
dojo.widget.manager.registerWidgetPackage(_55e);
var pos=_55e.indexOf(".");
var _563=(pos>-1)?_55e.substring(0,pos):_55e;
_55d=(_55d)||{};
_55d.widgetType=type;
if((!init)&&(_55d["classConstructor"])){
init=_55d.classConstructor;
delete _55d.classConstructor;
}
dojo.declare(_559,_55b,init,_55d);
};
dojo.provide("dojo.widget.Parse");
dojo.widget.Parse=function(_564){
this.propertySetsList=[];
this.fragment=_564;
this.createComponents=function(frag,_566){
var _567=[];
var _568=false;
try{
if(frag&&frag.tagName&&(frag!=frag.nodeRef)){
var _569=dojo.widget.tags;
var tna=String(frag.tagName).split(";");
for(var x=0;x<tna.length;x++){
var ltn=tna[x].replace(/^\s+|\s+$/g,"").toLowerCase();
frag.tagName=ltn;
var ret;
if(_569[ltn]){
_568=true;
ret=_569[ltn](frag,this,_566,frag.index);
_567.push(ret);
}else{
if(ltn.indexOf(":")==-1){
ltn="dojo:"+ltn;
}
ret=dojo.widget.buildWidgetFromParseTree(ltn,frag,this,_566,frag.index);
if(ret){
_568=true;
_567.push(ret);
}
}
}
}
}
catch(e){
dojo.debug("dojo.widget.Parse: error:",e);
}
if(!_568){
_567=_567.concat(this.createSubComponents(frag,_566));
}
return _567;
};
this.createSubComponents=function(_56e,_56f){
var frag,_571=[];
for(var item in _56e){
frag=_56e[item];
if(frag&&typeof frag=="object"&&(frag!=_56e.nodeRef)&&(frag!=_56e.tagName)&&(!dojo.dom.isNode(frag))){
_571=_571.concat(this.createComponents(frag,_56f));
}
}
return _571;
};
this.parsePropertySets=function(_573){
return [];
};
this.parseProperties=function(_574){
var _575={};
for(var item in _574){
if((_574[item]==_574.tagName)||(_574[item]==_574.nodeRef)){
}else{
var frag=_574[item];
if(frag.tagName&&dojo.widget.tags[frag.tagName.toLowerCase()]){
}else{
if(frag[0]&&frag[0].value!=""&&frag[0].value!=null){
try{
if(item.toLowerCase()=="dataprovider"){
var _578=this;
this.getDataProvider(_578,frag[0].value);
_575.dataProvider=this.dataProvider;
}
_575[item]=frag[0].value;
var _579=this.parseProperties(frag);
for(var _57a in _579){
_575[_57a]=_579[_57a];
}
}
catch(e){
dojo.debug(e);
}
}
}
switch(item.toLowerCase()){
case "checked":
case "disabled":
if(typeof _575[item]!="boolean"){
_575[item]=true;
}
break;
}
}
}
return _575;
};
this.getDataProvider=function(_57b,_57c){
dojo.io.bind({url:_57c,load:function(type,_57e){
if(type=="load"){
_57b.dataProvider=_57e;
}
},mimetype:"text/javascript",sync:true});
};
this.getPropertySetById=function(_57f){
for(var x=0;x<this.propertySetsList.length;x++){
if(_57f==this.propertySetsList[x]["id"][0].value){
return this.propertySetsList[x];
}
}
return "";
};
this.getPropertySetsByType=function(_581){
var _582=[];
for(var x=0;x<this.propertySetsList.length;x++){
var cpl=this.propertySetsList[x];
var cpcc=cpl.componentClass||cpl.componentType||null;
var _586=this.propertySetsList[x]["id"][0].value;
if(cpcc&&(_586==cpcc[0].value)){
_582.push(cpl);
}
}
return _582;
};
this.getPropertySets=function(_587){
var ppl="dojo:propertyproviderlist";
var _589=[];
var _58a=_587.tagName;
if(_587[ppl]){
var _58b=_587[ppl].value.split(" ");
for(var _58c in _58b){
if((_58c.indexOf("..")==-1)&&(_58c.indexOf("://")==-1)){
var _58d=this.getPropertySetById(_58c);
if(_58d!=""){
_589.push(_58d);
}
}else{
}
}
}
return this.getPropertySetsByType(_58a).concat(_589);
};
this.createComponentFromScript=function(_58e,_58f,_590,ns){
_590.fastMixIn=true;
var ltn=(ns||"dojo")+":"+_58f.toLowerCase();
if(dojo.widget.tags[ltn]){
return [dojo.widget.tags[ltn](_590,this,null,null,_590)];
}
return [dojo.widget.buildWidgetFromParseTree(ltn,_590,this,null,null,_590)];
};
};
dojo.widget._parser_collection={"dojo":new dojo.widget.Parse()};
dojo.widget.getParser=function(name){
if(!name){
name="dojo";
}
if(!this._parser_collection[name]){
this._parser_collection[name]=new dojo.widget.Parse();
}
return this._parser_collection[name];
};
dojo.widget.createWidget=function(name,_595,_596,_597){
var _598=false;
var _599=(typeof name=="string");
if(_599){
var pos=name.indexOf(":");
var ns=(pos>-1)?name.substring(0,pos):"dojo";
if(pos>-1){
name=name.substring(pos+1);
}
var _59c=name.toLowerCase();
var _59d=ns+":"+_59c;
_598=(dojo.byId(name)&&!dojo.widget.tags[_59d]);
}
if((arguments.length==1)&&(_598||!_599)){
var xp=new dojo.xml.Parse();
var tn=_598?dojo.byId(name):name;
return dojo.widget.getParser().createComponents(xp.parseElement(tn,null,true))[0];
}
function fromScript(_5a0,name,_5a2,ns){
_5a2[_59d]={dojotype:[{value:_59c}],nodeRef:_5a0,fastMixIn:true};
_5a2.ns=ns;
return dojo.widget.getParser().createComponentFromScript(_5a0,name,_5a2,ns);
}
_595=_595||{};
var _5a4=false;
var tn=null;
var h=dojo.render.html.capable;
if(h){
tn=document.createElement("span");
}
if(!_596){
_5a4=true;
_596=tn;
if(h){
dojo.body().appendChild(_596);
}
}else{
if(_597){
dojo.dom.insertAtPosition(tn,_596,_597);
}else{
tn=_596;
}
}
var _5a6=fromScript(tn,name.toLowerCase(),_595,ns);
if((!_5a6)||(!_5a6[0])||(typeof _5a6[0].widgetType=="undefined")){
throw new Error("createWidget: Creation of \""+name+"\" widget failed.");
}
try{
if(_5a4&&_5a6[0].domNode.parentNode){
_5a6[0].domNode.parentNode.removeChild(_5a6[0].domNode);
}
}
catch(e){
dojo.debug(e);
}
return _5a6[0];
};
dojo.provide("dojo.widget.DomWidget");
dojo.widget._cssFiles={};
dojo.widget._cssStrings={};
dojo.widget._templateCache={};
dojo.widget.defaultStrings={dojoRoot:dojo.hostenv.getBaseScriptUri(),dojoWidgetModuleUri:dojo.uri.moduleUri("dojo.widget"),baseScriptUri:dojo.hostenv.getBaseScriptUri()};
dojo.widget.fillFromTemplateCache=function(obj,_5a8,_5a9,_5aa){
var _5ab=_5a8||obj.templatePath;
var _5ac=dojo.widget._templateCache;
if(!_5ab&&!obj["widgetType"]){
do{
var _5ad="__dummyTemplate__"+dojo.widget._templateCache.dummyCount++;
}while(_5ac[_5ad]);
obj.widgetType=_5ad;
}
var wt=_5ab?_5ab.toString():obj.widgetType;
var ts=_5ac[wt];
if(!ts){
_5ac[wt]={"string":null,"node":null};
if(_5aa){
ts={};
}else{
ts=_5ac[wt];
}
}
if((!obj.templateString)&&(!_5aa)){
obj.templateString=_5a9||ts["string"];
}
if(obj.templateString){
obj.templateString=this._sanitizeTemplateString(obj.templateString);
}
if((!obj.templateNode)&&(!_5aa)){
obj.templateNode=ts["node"];
}
if((!obj.templateNode)&&(!obj.templateString)&&(_5ab)){
var _5b0=this._sanitizeTemplateString(dojo.hostenv.getText(_5ab));
obj.templateString=_5b0;
if(!_5aa){
_5ac[wt]["string"]=_5b0;
}
}
if((!ts["string"])&&(!_5aa)){
ts.string=obj.templateString;
}
};
dojo.widget._sanitizeTemplateString=function(_5b1){
if(_5b1){
_5b1=_5b1.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,"");
var _5b2=_5b1.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
if(_5b2){
_5b1=_5b2[1];
}
}else{
_5b1="";
}
return _5b1;
};
dojo.widget._templateCache.dummyCount=0;
dojo.widget.attachProperties=["dojoAttachPoint","id"];
dojo.widget.eventAttachProperty="dojoAttachEvent";
dojo.widget.onBuildProperty="dojoOnBuild";
dojo.widget.waiNames=["waiRole","waiState"];
dojo.widget.wai={waiRole:{name:"waiRole","namespace":"http://www.w3.org/TR/xhtml2",alias:"x2",prefix:"wairole:"},waiState:{name:"waiState","namespace":"http://www.w3.org/2005/07/aaa",alias:"aaa",prefix:""},setAttr:function(node,ns,attr,_5b6){
if(dojo.render.html.ie){
node.setAttribute(this[ns].alias+":"+attr,this[ns].prefix+_5b6);
}else{
node.setAttributeNS(this[ns]["namespace"],attr,this[ns].prefix+_5b6);
}
},getAttr:function(node,ns,attr){
if(dojo.render.html.ie){
return node.getAttribute(this[ns].alias+":"+attr);
}else{
return node.getAttributeNS(this[ns]["namespace"],attr);
}
},removeAttr:function(node,ns,attr){
var _5bd=true;
if(dojo.render.html.ie){
_5bd=node.removeAttribute(this[ns].alias+":"+attr);
}else{
node.removeAttributeNS(this[ns]["namespace"],attr);
}
return _5bd;
}};
dojo.widget.attachTemplateNodes=function(_5be,_5bf,_5c0){
var _5c1=dojo.dom.ELEMENT_NODE;
function trim(str){
return str.replace(/^\s+|\s+$/g,"");
}
if(!_5be){
_5be=_5bf.domNode;
}
if(_5be.nodeType!=_5c1){
return;
}
var _5c3=_5be.all||_5be.getElementsByTagName("*");
var _5c4=_5bf;
for(var x=-1;x<_5c3.length;x++){
var _5c6=(x==-1)?_5be:_5c3[x];
var _5c7=[];
if(!_5bf.widgetsInTemplate||!_5c6.getAttribute("dojoType")){
for(var y=0;y<this.attachProperties.length;y++){
var _5c9=_5c6.getAttribute(this.attachProperties[y]);
if(_5c9){
_5c7=_5c9.split(";");
for(var z=0;z<_5c7.length;z++){
if(dojo.lang.isArray(_5bf[_5c7[z]])){
_5bf[_5c7[z]].push(_5c6);
}else{
_5bf[_5c7[z]]=_5c6;
}
}
break;
}
}
var _5cb=_5c6.getAttribute(this.eventAttachProperty);
if(_5cb){
var evts=_5cb.split(";");
for(var y=0;y<evts.length;y++){
if((!evts[y])||(!evts[y].length)){
continue;
}
var _5cd=null;
var tevt=trim(evts[y]);
if(evts[y].indexOf(":")>=0){
var _5cf=tevt.split(":");
tevt=trim(_5cf[0]);
_5cd=trim(_5cf[1]);
}
if(!_5cd){
_5cd=tevt;
}
var tf=function(){
var ntf=new String(_5cd);
return function(evt){
if(_5c4[ntf]){
_5c4[ntf](dojo.event.browser.fixEvent(evt,this));
}
};
}();
dojo.event.browser.addListener(_5c6,tevt,tf,false,true);
}
}
for(var y=0;y<_5c0.length;y++){
var _5d3=_5c6.getAttribute(_5c0[y]);
if((_5d3)&&(_5d3.length)){
var _5cd=null;
var _5d4=_5c0[y].substr(4);
_5cd=trim(_5d3);
var _5d5=[_5cd];
if(_5cd.indexOf(";")>=0){
_5d5=dojo.lang.map(_5cd.split(";"),trim);
}
for(var z=0;z<_5d5.length;z++){
if(!_5d5[z].length){
continue;
}
var tf=function(){
var ntf=new String(_5d5[z]);
return function(evt){
if(_5c4[ntf]){
_5c4[ntf](dojo.event.browser.fixEvent(evt,this));
}
};
}();
dojo.event.browser.addListener(_5c6,_5d4,tf,false,true);
}
}
}
}
var _5d8=_5c6.getAttribute(this.templateProperty);
if(_5d8){
_5bf[_5d8]=_5c6;
}
dojo.lang.forEach(dojo.widget.waiNames,function(name){
var wai=dojo.widget.wai[name];
var val=_5c6.getAttribute(wai.name);
if(val){
if(val.indexOf("-")==-1){
dojo.widget.wai.setAttr(_5c6,wai.name,"role",val);
}else{
var _5dc=val.split("-");
dojo.widget.wai.setAttr(_5c6,wai.name,_5dc[0],_5dc[1]);
}
}
},this);
var _5dd=_5c6.getAttribute(this.onBuildProperty);
if(_5dd){
eval("var node = baseNode; var widget = targetObj; "+_5dd);
}
}
};
dojo.widget.getDojoEventsFromStr=function(str){
var re=/(dojoOn([a-z]+)(\s?))=/gi;
var evts=str?str.match(re)||[]:[];
var ret=[];
var lem={};
for(var x=0;x<evts.length;x++){
if(evts[x].length<1){
continue;
}
var cm=evts[x].replace(/\s/,"");
cm=(cm.slice(0,cm.length-1));
if(!lem[cm]){
lem[cm]=true;
ret.push(cm);
}
}
return ret;
};
dojo.declare("dojo.widget.DomWidget",dojo.widget.Widget,function(){
if((arguments.length>0)&&(typeof arguments[0]=="object")){
this.create(arguments[0]);
}
},{templateNode:null,templateString:null,templateCssString:null,preventClobber:false,domNode:null,containerNode:null,widgetsInTemplate:false,addChild:function(_5e5,_5e6,pos,ref,_5e9){
if(!this.isContainer){
dojo.debug("dojo.widget.DomWidget.addChild() attempted on non-container widget");
return null;
}else{
if(_5e9==undefined){
_5e9=this.children.length;
}
this.addWidgetAsDirectChild(_5e5,_5e6,pos,ref,_5e9);
this.registerChild(_5e5,_5e9);
}
return _5e5;
},addWidgetAsDirectChild:function(_5ea,_5eb,pos,ref,_5ee){
if((!this.containerNode)&&(!_5eb)){
this.containerNode=this.domNode;
}
var cn=(_5eb)?_5eb:this.containerNode;
if(!pos){
pos="after";
}
if(!ref){
if(!cn){
cn=dojo.body();
}
ref=cn.lastChild;
}
if(!_5ee){
_5ee=0;
}
_5ea.domNode.setAttribute("dojoinsertionindex",_5ee);
if(!ref){
cn.appendChild(_5ea.domNode);
}else{
if(pos=="insertAtIndex"){
dojo.dom.insertAtIndex(_5ea.domNode,ref.parentNode,_5ee);
}else{
if((pos=="after")&&(ref===cn.lastChild)){
cn.appendChild(_5ea.domNode);
}else{
dojo.dom.insertAtPosition(_5ea.domNode,cn,pos);
}
}
}
},registerChild:function(_5f0,_5f1){
_5f0.dojoInsertionIndex=_5f1;
var idx=-1;
for(var i=0;i<this.children.length;i++){
if(this.children[i].dojoInsertionIndex<=_5f1){
idx=i;
}
}
this.children.splice(idx+1,0,_5f0);
_5f0.parent=this;
_5f0.addedTo(this,idx+1);
delete dojo.widget.manager.topWidgets[_5f0.widgetId];
},removeChild:function(_5f4){
dojo.dom.removeNode(_5f4.domNode);
return dojo.widget.DomWidget.superclass.removeChild.call(this,_5f4);
},getFragNodeRef:function(frag){
if(!frag){
return null;
}
if(!frag[this.getNamespacedType()]){
dojo.raise("Error: no frag for widget type "+this.getNamespacedType()+", id "+this.widgetId+" (maybe a widget has set it's type incorrectly)");
}
return frag[this.getNamespacedType()]["nodeRef"];
},postInitialize:function(args,frag,_5f8){
var _5f9=this.getFragNodeRef(frag);
if(_5f8&&(_5f8.snarfChildDomOutput||!_5f9)){
_5f8.addWidgetAsDirectChild(this,"","insertAtIndex","",args["dojoinsertionindex"],_5f9);
}else{
if(_5f9){
if(this.domNode&&(this.domNode!==_5f9)){
this._sourceNodeRef=dojo.dom.replaceNode(_5f9,this.domNode);
}
}
}
if(_5f8){
_5f8.registerChild(this,args.dojoinsertionindex);
}else{
dojo.widget.manager.topWidgets[this.widgetId]=this;
}
if(this.widgetsInTemplate){
var _5fa=new dojo.xml.Parse();
var _5fb;
var _5fc=this.domNode.getElementsByTagName("*");
for(var i=0;i<_5fc.length;i++){
if(_5fc[i].getAttribute("dojoAttachPoint")=="subContainerWidget"){
_5fb=_5fc[i];
}
if(_5fc[i].getAttribute("dojoType")){
_5fc[i].setAttribute("isSubWidget",true);
}
}
if(this.isContainer&&!this.containerNode){
if(_5fb){
var src=this.getFragNodeRef(frag);
if(src){
dojo.dom.moveChildren(src,_5fb);
frag["dojoDontFollow"]=true;
}
}else{
dojo.debug("No subContainerWidget node can be found in template file for widget "+this);
}
}
var _5ff=_5fa.parseElement(this.domNode,null,true);
dojo.widget.getParser().createSubComponents(_5ff,this);
var _600=[];
var _601=[this];
var w;
while((w=_601.pop())){
for(var i=0;i<w.children.length;i++){
var _603=w.children[i];
if(_603._processedSubWidgets||!_603.extraArgs["issubwidget"]){
continue;
}
_600.push(_603);
if(_603.isContainer){
_601.push(_603);
}
}
}
for(var i=0;i<_600.length;i++){
var _604=_600[i];
if(_604._processedSubWidgets){
dojo.debug("This should not happen: widget._processedSubWidgets is already true!");
return;
}
_604._processedSubWidgets=true;
if(_604.extraArgs["dojoattachevent"]){
var evts=_604.extraArgs["dojoattachevent"].split(";");
for(var j=0;j<evts.length;j++){
var _607=null;
var tevt=dojo.string.trim(evts[j]);
if(tevt.indexOf(":")>=0){
var _609=tevt.split(":");
tevt=dojo.string.trim(_609[0]);
_607=dojo.string.trim(_609[1]);
}
if(!_607){
_607=tevt;
}
if(dojo.lang.isFunction(_604[tevt])){
dojo.event.kwConnect({srcObj:_604,srcFunc:tevt,targetObj:this,targetFunc:_607});
}else{
alert(tevt+" is not a function in widget "+_604);
}
}
}
if(_604.extraArgs["dojoattachpoint"]){
this[_604.extraArgs["dojoattachpoint"]]=_604;
}
}
}
if(this.isContainer&&!frag["dojoDontFollow"]){
dojo.widget.getParser().createSubComponents(frag,this);
}
},buildRendering:function(args,frag){
var ts=dojo.widget._templateCache[this.widgetType];
if(args["templatecsspath"]){
args["templateCssPath"]=args["templatecsspath"];
}
var _60d=args["templateCssPath"]||this.templateCssPath;
if(_60d&&!dojo.widget._cssFiles[_60d.toString()]){
if((!this.templateCssString)&&(_60d)){
this.templateCssString=dojo.hostenv.getText(_60d);
this.templateCssPath=null;
}
dojo.widget._cssFiles[_60d.toString()]=true;
}
if((this["templateCssString"])&&(!dojo.widget._cssStrings[this.templateCssString])){
dojo.html.insertCssText(this.templateCssString,null,_60d);
dojo.widget._cssStrings[this.templateCssString]=true;
}
if((!this.preventClobber)&&((this.templatePath)||(this.templateNode)||((this["templateString"])&&(this.templateString.length))||((typeof ts!="undefined")&&((ts["string"])||(ts["node"]))))){
this.buildFromTemplate(args,frag);
}else{
this.domNode=this.getFragNodeRef(frag);
}
this.fillInTemplate(args,frag);
},buildFromTemplate:function(args,frag){
var _610=false;
if(args["templatepath"]){
args["templatePath"]=args["templatepath"];
}
dojo.widget.fillFromTemplateCache(this,args["templatePath"],null,_610);
var ts=dojo.widget._templateCache[this.templatePath?this.templatePath.toString():this.widgetType];
if((ts)&&(!_610)){
if(!this.templateString.length){
this.templateString=ts["string"];
}
if(!this.templateNode){
this.templateNode=ts["node"];
}
}
var _612=false;
var node=null;
var tstr=this.templateString;
if((!this.templateNode)&&(this.templateString)){
_612=this.templateString.match(/\$\{([^\}]+)\}/g);
if(_612){
var hash=this.strings||{};
for(var key in dojo.widget.defaultStrings){
if(dojo.lang.isUndefined(hash[key])){
hash[key]=dojo.widget.defaultStrings[key];
}
}
for(var i=0;i<_612.length;i++){
var key=_612[i];
key=key.substring(2,key.length-1);
var kval=(key.substring(0,5)=="this.")?dojo.lang.getObjPathValue(key.substring(5),this):hash[key];
var _619;
if((kval)||(dojo.lang.isString(kval))){
_619=new String((dojo.lang.isFunction(kval))?kval.call(this,key,this.templateString):kval);
while(_619.indexOf("\"")>-1){
_619=_619.replace("\"","&quot;");
}
tstr=tstr.replace(_612[i],_619);
}
}
}else{
this.templateNode=this.createNodesFromText(this.templateString,true)[0];
if(!_610){
ts.node=this.templateNode;
}
}
}
if((!this.templateNode)&&(!_612)){
dojo.debug("DomWidget.buildFromTemplate: could not create template");
return false;
}else{
if(!_612){
node=this.templateNode.cloneNode(true);
if(!node){
return false;
}
}else{
node=this.createNodesFromText(tstr,true)[0];
}
}
this.domNode=node;
this.attachTemplateNodes();
if(this.isContainer&&this.containerNode){
var src=this.getFragNodeRef(frag);
if(src){
dojo.dom.moveChildren(src,this.containerNode);
}
}
},attachTemplateNodes:function(_61b,_61c){
if(!_61b){
_61b=this.domNode;
}
if(!_61c){
_61c=this;
}
return dojo.widget.attachTemplateNodes(_61b,_61c,dojo.widget.getDojoEventsFromStr(this.templateString));
},fillInTemplate:function(){
},destroyRendering:function(){
try{
dojo.dom.destroyNode(this.domNode);
delete this.domNode;
}
catch(e){
}
if(this._sourceNodeRef){
try{
dojo.dom.destroyNode(this._sourceNodeRef);
}
catch(e){
}
}
},createNodesFromText:function(){
dojo.unimplemented("dojo.widget.DomWidget.createNodesFromText");
}});
dojo.provide("dojo.html.util");
dojo.html.getElementWindow=function(_61d){
return dojo.html.getDocumentWindow(_61d.ownerDocument);
};
dojo.html.getDocumentWindow=function(doc){
if(dojo.render.html.safari&&!doc._parentWindow){
var fix=function(win){
win.document._parentWindow=win;
for(var i=0;i<win.frames.length;i++){
fix(win.frames[i]);
}
};
fix(window.top);
}
if(dojo.render.html.ie&&window!==document.parentWindow&&!doc._parentWindow){
doc.parentWindow.execScript("document._parentWindow = window;","Javascript");
var win=doc._parentWindow;
doc._parentWindow=null;
return win;
}
return doc._parentWindow||doc.parentWindow||doc.defaultView;
};
dojo.html.gravity=function(node,e){
node=dojo.byId(node);
var _625=dojo.html.getCursorPosition(e);
with(dojo.html){
var _626=getAbsolutePosition(node,true);
var bb=getBorderBox(node);
var _628=_626.x+(bb.width/2);
var _629=_626.y+(bb.height/2);
}
with(dojo.html.gravity){
return ((_625.x<_628?WEST:EAST)|(_625.y<_629?NORTH:SOUTH));
}
};
dojo.html.gravity.NORTH=1;
dojo.html.gravity.SOUTH=1<<1;
dojo.html.gravity.EAST=1<<2;
dojo.html.gravity.WEST=1<<3;
dojo.html.overElement=function(_62a,e){
_62a=dojo.byId(_62a);
var _62c=dojo.html.getCursorPosition(e);
var bb=dojo.html.getBorderBox(_62a);
var _62e=dojo.html.getAbsolutePosition(_62a,true,dojo.html.boxSizing.BORDER_BOX);
var top=_62e.y;
var _630=top+bb.height;
var left=_62e.x;
var _632=left+bb.width;
return (_62c.x>=left&&_62c.x<=_632&&_62c.y>=top&&_62c.y<=_630);
};
dojo.html.renderedTextContent=function(node){
node=dojo.byId(node);
var _634="";
if(node==null){
return _634;
}
for(var i=0;i<node.childNodes.length;i++){
switch(node.childNodes[i].nodeType){
case 1:
case 5:
var _636="unknown";
try{
_636=dojo.html.getStyle(node.childNodes[i],"display");
}
catch(E){
}
switch(_636){
case "block":
case "list-item":
case "run-in":
case "table":
case "table-row-group":
case "table-header-group":
case "table-footer-group":
case "table-row":
case "table-column-group":
case "table-column":
case "table-cell":
case "table-caption":
_634+="\n";
_634+=dojo.html.renderedTextContent(node.childNodes[i]);
_634+="\n";
break;
case "none":
break;
default:
if(node.childNodes[i].tagName&&node.childNodes[i].tagName.toLowerCase()=="br"){
_634+="\n";
}else{
_634+=dojo.html.renderedTextContent(node.childNodes[i]);
}
break;
}
break;
case 3:
case 2:
case 4:
var text=node.childNodes[i].nodeValue;
var _638="unknown";
try{
_638=dojo.html.getStyle(node,"text-transform");
}
catch(E){
}
switch(_638){
case "capitalize":
var _639=text.split(" ");
for(var i=0;i<_639.length;i++){
_639[i]=_639[i].charAt(0).toUpperCase()+_639[i].substring(1);
}
text=_639.join(" ");
break;
case "uppercase":
text=text.toUpperCase();
break;
case "lowercase":
text=text.toLowerCase();
break;
default:
break;
}
switch(_638){
case "nowrap":
break;
case "pre-wrap":
break;
case "pre-line":
break;
case "pre":
break;
default:
text=text.replace(/\s+/," ");
if(/\s$/.test(_634)){
text.replace(/^\s/,"");
}
break;
}
_634+=text;
break;
default:
break;
}
}
return _634;
};
dojo.html.createNodesFromText=function(txt,trim){
if(trim){
txt=txt.replace(/^\s+|\s+$/g,"");
}
var tn=dojo.doc().createElement("div");
tn.style.visibility="hidden";
dojo.body().appendChild(tn);
var _63d="none";
if((/^<t[dh][\s\r\n>]/i).test(txt.replace(/^\s+/))){
txt="<table><tbody><tr>"+txt+"</tr></tbody></table>";
_63d="cell";
}else{
if((/^<tr[\s\r\n>]/i).test(txt.replace(/^\s+/))){
txt="<table><tbody>"+txt+"</tbody></table>";
_63d="row";
}else{
if((/^<(thead|tbody|tfoot)[\s\r\n>]/i).test(txt.replace(/^\s+/))){
txt="<table>"+txt+"</table>";
_63d="section";
}
}
}
tn.innerHTML=txt;
if(tn["normalize"]){
tn.normalize();
}
var _63e=null;
switch(_63d){
case "cell":
_63e=tn.getElementsByTagName("tr")[0];
break;
case "row":
_63e=tn.getElementsByTagName("tbody")[0];
break;
case "section":
_63e=tn.getElementsByTagName("table")[0];
break;
default:
_63e=tn;
break;
}
var _63f=[];
for(var x=0;x<_63e.childNodes.length;x++){
_63f.push(_63e.childNodes[x].cloneNode(true));
}
tn.style.display="none";
dojo.html.destroyNode(tn);
return _63f;
};
dojo.html.placeOnScreen=function(node,_642,_643,_644,_645,_646,_647){
if(_642 instanceof Array||typeof _642=="array"){
_647=_646;
_646=_645;
_645=_644;
_644=_643;
_643=_642[1];
_642=_642[0];
}
if(_646 instanceof String||typeof _646=="string"){
_646=_646.split(",");
}
if(!isNaN(_644)){
_644=[Number(_644),Number(_644)];
}else{
if(!(_644 instanceof Array||typeof _644=="array")){
_644=[0,0];
}
}
var _648=dojo.html.getScroll().offset;
var view=dojo.html.getViewport();
node=dojo.byId(node);
var _64a=node.style.display;
node.style.display="";
var bb=dojo.html.getBorderBox(node);
var w=bb.width;
var h=bb.height;
node.style.display=_64a;
if(!(_646 instanceof Array||typeof _646=="array")){
_646=["TL"];
}
var _64e,_64f,_650=Infinity,_651;
for(var _652=0;_652<_646.length;++_652){
var _653=_646[_652];
var _654=true;
var tryX=_642-(_653.charAt(1)=="L"?0:w)+_644[0]*(_653.charAt(1)=="L"?1:-1);
var tryY=_643-(_653.charAt(0)=="T"?0:h)+_644[1]*(_653.charAt(0)=="T"?1:-1);
if(_645){
tryX-=_648.x;
tryY-=_648.y;
}
if(tryX<0){
tryX=0;
_654=false;
}
if(tryY<0){
tryY=0;
_654=false;
}
var x=tryX+w;
if(x>view.width){
x=view.width-w;
_654=false;
}else{
x=tryX;
}
x=Math.max(_644[0],x)+_648.x;
var y=tryY+h;
if(y>view.height){
y=view.height-h;
_654=false;
}else{
y=tryY;
}
y=Math.max(_644[1],y)+_648.y;
if(_654){
_64e=x;
_64f=y;
_650=0;
_651=_653;
break;
}else{
var dist=Math.pow(x-tryX-_648.x,2)+Math.pow(y-tryY-_648.y,2);
if(_650>dist){
_650=dist;
_64e=x;
_64f=y;
_651=_653;
}
}
}
if(!_647){
node.style.left=_64e+"px";
node.style.top=_64f+"px";
}
return {left:_64e,top:_64f,x:_64e,y:_64f,dist:_650,corner:_651};
};
dojo.html.placeOnScreenPoint=function(node,_65b,_65c,_65d,_65e){
dojo.deprecated("dojo.html.placeOnScreenPoint","use dojo.html.placeOnScreen() instead","0.5");
return dojo.html.placeOnScreen(node,_65b,_65c,_65d,_65e,["TL","TR","BL","BR"]);
};
dojo.html.placeOnScreenAroundElement=function(node,_660,_661,_662,_663,_664){
var best,_666=Infinity;
_660=dojo.byId(_660);
var _667=_660.style.display;
_660.style.display="";
var mb=dojo.html.getElementBox(_660,_662);
var _669=mb.width;
var _66a=mb.height;
var _66b=dojo.html.getAbsolutePosition(_660,true,_662);
_660.style.display=_667;
for(var _66c in _663){
var pos,_66e,_66f;
var _670=_663[_66c];
_66e=_66b.x+(_66c.charAt(1)=="L"?0:_669);
_66f=_66b.y+(_66c.charAt(0)=="T"?0:_66a);
pos=dojo.html.placeOnScreen(node,_66e,_66f,_661,true,_670,true);
if(pos.dist==0){
best=pos;
break;
}else{
if(_666>pos.dist){
_666=pos.dist;
best=pos;
}
}
}
if(!_664){
node.style.left=best.left+"px";
node.style.top=best.top+"px";
}
return best;
};
dojo.html.scrollIntoView=function(node){
if(!node){
return;
}
if(dojo.render.html.ie){
if(dojo.html.getBorderBox(node.parentNode).height<=node.parentNode.scrollHeight){
node.scrollIntoView(false);
}
}else{
if(dojo.render.html.mozilla){
node.scrollIntoView(false);
}else{
var _672=node.parentNode;
var _673=_672.scrollTop+dojo.html.getBorderBox(_672).height;
var _674=node.offsetTop+dojo.html.getMarginBox(node).height;
if(_673<_674){
_672.scrollTop+=(_674-_673);
}else{
if(_672.scrollTop>node.offsetTop){
_672.scrollTop-=(_672.scrollTop-node.offsetTop);
}
}
}
}
};
dojo.provide("dojo.gfx.color");
dojo.gfx.color.Color=function(r,g,b,a){
if(dojo.lang.isArray(r)){
this.r=r[0];
this.g=r[1];
this.b=r[2];
this.a=r[3]||1;
}else{
if(dojo.lang.isString(r)){
var rgb=dojo.gfx.color.extractRGB(r);
this.r=rgb[0];
this.g=rgb[1];
this.b=rgb[2];
this.a=g||1;
}else{
if(r instanceof dojo.gfx.color.Color){
this.r=r.r;
this.b=r.b;
this.g=r.g;
this.a=r.a;
}else{
this.r=r;
this.g=g;
this.b=b;
this.a=a;
}
}
}
};
dojo.gfx.color.Color.fromArray=function(arr){
return new dojo.gfx.color.Color(arr[0],arr[1],arr[2],arr[3]);
};
dojo.extend(dojo.gfx.color.Color,{toRgb:function(_67b){
if(_67b){
return this.toRgba();
}else{
return [this.r,this.g,this.b];
}
},toRgba:function(){
return [this.r,this.g,this.b,this.a];
},toHex:function(){
return dojo.gfx.color.rgb2hex(this.toRgb());
},toCss:function(){
return "rgb("+this.toRgb().join()+")";
},toString:function(){
return this.toHex();
},blend:function(_67c,_67d){
var rgb=null;
if(dojo.lang.isArray(_67c)){
rgb=_67c;
}else{
if(_67c instanceof dojo.gfx.color.Color){
rgb=_67c.toRgb();
}else{
rgb=new dojo.gfx.color.Color(_67c).toRgb();
}
}
return dojo.gfx.color.blend(this.toRgb(),rgb,_67d);
}});
dojo.gfx.color.named={white:[255,255,255],black:[0,0,0],red:[255,0,0],green:[0,255,0],lime:[0,255,0],blue:[0,0,255],navy:[0,0,128],gray:[128,128,128],silver:[192,192,192]};
dojo.gfx.color.blend=function(a,b,_681){
if(typeof a=="string"){
return dojo.gfx.color.blendHex(a,b,_681);
}
if(!_681){
_681=0;
}
_681=Math.min(Math.max(-1,_681),1);
_681=((_681+1)/2);
var c=[];
for(var x=0;x<3;x++){
c[x]=parseInt(b[x]+((a[x]-b[x])*_681));
}
return c;
};
dojo.gfx.color.blendHex=function(a,b,_686){
return dojo.gfx.color.rgb2hex(dojo.gfx.color.blend(dojo.gfx.color.hex2rgb(a),dojo.gfx.color.hex2rgb(b),_686));
};
dojo.gfx.color.extractRGB=function(_687){
var hex="0123456789abcdef";
_687=_687.toLowerCase();
if(_687.indexOf("rgb")==0){
var _689=_687.match(/rgba*\((\d+), *(\d+), *(\d+)/i);
var ret=_689.splice(1,3);
return ret;
}else{
var _68b=dojo.gfx.color.hex2rgb(_687);
if(_68b){
return _68b;
}else{
return dojo.gfx.color.named[_687]||[255,255,255];
}
}
};
dojo.gfx.color.hex2rgb=function(hex){
var _68d="0123456789ABCDEF";
var rgb=new Array(3);
if(hex.indexOf("#")==0){
hex=hex.substring(1);
}
hex=hex.toUpperCase();
if(hex.replace(new RegExp("["+_68d+"]","g"),"")!=""){
return null;
}
if(hex.length==3){
rgb[0]=hex.charAt(0)+hex.charAt(0);
rgb[1]=hex.charAt(1)+hex.charAt(1);
rgb[2]=hex.charAt(2)+hex.charAt(2);
}else{
rgb[0]=hex.substring(0,2);
rgb[1]=hex.substring(2,4);
rgb[2]=hex.substring(4);
}
for(var i=0;i<rgb.length;i++){
rgb[i]=_68d.indexOf(rgb[i].charAt(0))*16+_68d.indexOf(rgb[i].charAt(1));
}
return rgb;
};
dojo.gfx.color.rgb2hex=function(r,g,b){
if(dojo.lang.isArray(r)){
g=r[1]||0;
b=r[2]||0;
r=r[0]||0;
}
var ret=dojo.lang.map([r,g,b],function(x){
x=new Number(x);
var s=x.toString(16);
while(s.length<2){
s="0"+s;
}
return s;
});
ret.unshift("#");
return ret.join("");
};
dojo.provide("dojo.lfx.Animation");
dojo.lfx.Line=function(_696,end){
this.start=_696;
this.end=end;
if(dojo.lang.isArray(_696)){
var diff=[];
dojo.lang.forEach(this.start,function(s,i){
diff[i]=this.end[i]-s;
},this);
this.getValue=function(n){
var res=[];
dojo.lang.forEach(this.start,function(s,i){
res[i]=(diff[i]*n)+s;
},this);
return res;
};
}else{
var diff=end-_696;
this.getValue=function(n){
return (diff*n)+this.start;
};
}
};
if((dojo.render.html.khtml)&&(!dojo.render.html.safari)){
dojo.lfx.easeDefault=function(n){
return (parseFloat("0.5")+((Math.sin((n+parseFloat("1.5"))*Math.PI))/2));
};
}else{
dojo.lfx.easeDefault=function(n){
return (0.5+((Math.sin((n+1.5)*Math.PI))/2));
};
}
dojo.lfx.easeIn=function(n){
return Math.pow(n,3);
};
dojo.lfx.easeOut=function(n){
return (1-Math.pow(1-n,3));
};
dojo.lfx.easeInOut=function(n){
return ((3*Math.pow(n,2))-(2*Math.pow(n,3)));
};
dojo.lfx.IAnimation=function(){
};
dojo.lang.extend(dojo.lfx.IAnimation,{curve:null,duration:1000,easing:null,repeatCount:0,rate:10,handler:null,beforeBegin:null,onBegin:null,onAnimate:null,onEnd:null,onPlay:null,onPause:null,onStop:null,play:null,pause:null,stop:null,connect:function(evt,_6a6,_6a7){
if(!_6a7){
_6a7=_6a6;
_6a6=this;
}
_6a7=dojo.lang.hitch(_6a6,_6a7);
var _6a8=this[evt]||function(){
};
this[evt]=function(){
var ret=_6a8.apply(this,arguments);
_6a7.apply(this,arguments);
return ret;
};
return this;
},fire:function(evt,args){
if(this[evt]){
this[evt].apply(this,(args||[]));
}
return this;
},repeat:function(_6ac){
this.repeatCount=_6ac;
return this;
},_active:false,_paused:false});
dojo.lfx.Animation=function(_6ad,_6ae,_6af,_6b0,_6b1,rate){
dojo.lfx.IAnimation.call(this);
if(dojo.lang.isNumber(_6ad)||(!_6ad&&_6ae.getValue)){
rate=_6b1;
_6b1=_6b0;
_6b0=_6af;
_6af=_6ae;
_6ae=_6ad;
_6ad=null;
}else{
if(_6ad.getValue||dojo.lang.isArray(_6ad)){
rate=_6b0;
_6b1=_6af;
_6b0=_6ae;
_6af=_6ad;
_6ae=null;
_6ad=null;
}
}
if(dojo.lang.isArray(_6af)){
this.curve=new dojo.lfx.Line(_6af[0],_6af[1]);
}else{
this.curve=_6af;
}
if(_6ae!=null&&_6ae>0){
this.duration=_6ae;
}
if(_6b1){
this.repeatCount=_6b1;
}
if(rate){
this.rate=rate;
}
if(_6ad){
dojo.lang.forEach(["handler","beforeBegin","onBegin","onEnd","onPlay","onStop","onAnimate"],function(item){
if(_6ad[item]){
this.connect(item,_6ad[item]);
}
},this);
}
if(_6b0&&dojo.lang.isFunction(_6b0)){
this.easing=_6b0;
}
};
dojo.inherits(dojo.lfx.Animation,dojo.lfx.IAnimation);
dojo.lang.extend(dojo.lfx.Animation,{_startTime:null,_endTime:null,_timer:null,_percent:0,_startRepeatCount:0,play:function(_6b4,_6b5){
if(_6b5){
clearTimeout(this._timer);
this._active=false;
this._paused=false;
this._percent=0;
}else{
if(this._active&&!this._paused){
return this;
}
}
this.fire("handler",["beforeBegin"]);
this.fire("beforeBegin");
if(_6b4>0){
setTimeout(dojo.lang.hitch(this,function(){
this.play(null,_6b5);
}),_6b4);
return this;
}
this._startTime=new Date().valueOf();
if(this._paused){
this._startTime-=(this.duration*this._percent/100);
}
this._endTime=this._startTime+this.duration;
this._active=true;
this._paused=false;
var step=this._percent/100;
var _6b7=this.curve.getValue(step);
if(this._percent==0){
if(!this._startRepeatCount){
this._startRepeatCount=this.repeatCount;
}
this.fire("handler",["begin",_6b7]);
this.fire("onBegin",[_6b7]);
}
this.fire("handler",["play",_6b7]);
this.fire("onPlay",[_6b7]);
this._cycle();
return this;
},pause:function(){
clearTimeout(this._timer);
if(!this._active){
return this;
}
this._paused=true;
var _6b8=this.curve.getValue(this._percent/100);
this.fire("handler",["pause",_6b8]);
this.fire("onPause",[_6b8]);
return this;
},gotoPercent:function(pct,_6ba){
clearTimeout(this._timer);
this._active=true;
this._paused=true;
this._percent=pct;
if(_6ba){
this.play();
}
return this;
},stop:function(_6bb){
clearTimeout(this._timer);
var step=this._percent/100;
if(_6bb){
step=1;
}
var _6bd=this.curve.getValue(step);
this.fire("handler",["stop",_6bd]);
this.fire("onStop",[_6bd]);
this._active=false;
this._paused=false;
return this;
},status:function(){
if(this._active){
return this._paused?"paused":"playing";
}else{
return "stopped";
}
return this;
},_cycle:function(){
clearTimeout(this._timer);
if(this._active){
var curr=new Date().valueOf();
var step=(curr-this._startTime)/(this._endTime-this._startTime);
if(step>=1){
step=1;
this._percent=100;
}else{
this._percent=step*100;
}
if((this.easing)&&(dojo.lang.isFunction(this.easing))){
step=this.easing(step);
}
var _6c0=this.curve.getValue(step);
this.fire("handler",["animate",_6c0]);
this.fire("onAnimate",[_6c0]);
if(step<1){
this._timer=setTimeout(dojo.lang.hitch(this,"_cycle"),this.rate);
}else{
this._active=false;
this.fire("handler",["end"]);
this.fire("onEnd");
if(this.repeatCount>0){
this.repeatCount--;
this.play(null,true);
}else{
if(this.repeatCount==-1){
this.play(null,true);
}else{
if(this._startRepeatCount){
this.repeatCount=this._startRepeatCount;
this._startRepeatCount=0;
}
}
}
}
}
return this;
}});
dojo.lfx.Combine=function(_6c1){
dojo.lfx.IAnimation.call(this);
this._anims=[];
this._animsEnded=0;
var _6c2=arguments;
if(_6c2.length==1&&(dojo.lang.isArray(_6c2[0])||dojo.lang.isArrayLike(_6c2[0]))){
_6c2=_6c2[0];
}
dojo.lang.forEach(_6c2,function(anim){
this._anims.push(anim);
anim.connect("onEnd",dojo.lang.hitch(this,"_onAnimsEnded"));
},this);
};
dojo.inherits(dojo.lfx.Combine,dojo.lfx.IAnimation);
dojo.lang.extend(dojo.lfx.Combine,{_animsEnded:0,play:function(_6c4,_6c5){
if(!this._anims.length){
return this;
}
this.fire("beforeBegin");
if(_6c4>0){
setTimeout(dojo.lang.hitch(this,function(){
this.play(null,_6c5);
}),_6c4);
return this;
}
if(_6c5||this._anims[0].percent==0){
this.fire("onBegin");
}
this.fire("onPlay");
this._animsCall("play",null,_6c5);
return this;
},pause:function(){
this.fire("onPause");
this._animsCall("pause");
return this;
},stop:function(_6c6){
this.fire("onStop");
this._animsCall("stop",_6c6);
return this;
},_onAnimsEnded:function(){
this._animsEnded++;
if(this._animsEnded>=this._anims.length){
this.fire("onEnd");
}
return this;
},_animsCall:function(_6c7){
var args=[];
if(arguments.length>1){
for(var i=1;i<arguments.length;i++){
args.push(arguments[i]);
}
}
var _6ca=this;
dojo.lang.forEach(this._anims,function(anim){
anim[_6c7](args);
},_6ca);
return this;
}});
dojo.lfx.Chain=function(_6cc){
dojo.lfx.IAnimation.call(this);
this._anims=[];
this._currAnim=-1;
var _6cd=arguments;
if(_6cd.length==1&&(dojo.lang.isArray(_6cd[0])||dojo.lang.isArrayLike(_6cd[0]))){
_6cd=_6cd[0];
}
var _6ce=this;
dojo.lang.forEach(_6cd,function(anim,i,_6d1){
this._anims.push(anim);
if(i<_6d1.length-1){
anim.connect("onEnd",dojo.lang.hitch(this,"_playNext"));
}else{
anim.connect("onEnd",dojo.lang.hitch(this,function(){
this.fire("onEnd");
}));
}
},this);
};
dojo.inherits(dojo.lfx.Chain,dojo.lfx.IAnimation);
dojo.lang.extend(dojo.lfx.Chain,{_currAnim:-1,play:function(_6d2,_6d3){
if(!this._anims.length){
return this;
}
if(_6d3||!this._anims[this._currAnim]){
this._currAnim=0;
}
var _6d4=this._anims[this._currAnim];
this.fire("beforeBegin");
if(_6d2>0){
setTimeout(dojo.lang.hitch(this,function(){
this.play(null,_6d3);
}),_6d2);
return this;
}
if(_6d4){
if(this._currAnim==0){
this.fire("handler",["begin",this._currAnim]);
this.fire("onBegin",[this._currAnim]);
}
this.fire("onPlay",[this._currAnim]);
_6d4.play(null,_6d3);
}
return this;
},pause:function(){
if(this._anims[this._currAnim]){
this._anims[this._currAnim].pause();
this.fire("onPause",[this._currAnim]);
}
return this;
},playPause:function(){
if(this._anims.length==0){
return this;
}
if(this._currAnim==-1){
this._currAnim=0;
}
var _6d5=this._anims[this._currAnim];
if(_6d5){
if(!_6d5._active||_6d5._paused){
this.play();
}else{
this.pause();
}
}
return this;
},stop:function(){
var _6d6=this._anims[this._currAnim];
if(_6d6){
_6d6.stop();
this.fire("onStop",[this._currAnim]);
}
return _6d6;
},_playNext:function(){
if(this._currAnim==-1||this._anims.length==0){
return this;
}
this._currAnim++;
if(this._anims[this._currAnim]){
this._anims[this._currAnim].play(null,true);
}
return this;
}});
dojo.lfx.combine=function(_6d7){
var _6d8=arguments;
if(dojo.lang.isArray(arguments[0])){
_6d8=arguments[0];
}
if(_6d8.length==1){
return _6d8[0];
}
return new dojo.lfx.Combine(_6d8);
};
dojo.lfx.chain=function(_6d9){
var _6da=arguments;
if(dojo.lang.isArray(arguments[0])){
_6da=arguments[0];
}
if(_6da.length==1){
return _6da[0];
}
return new dojo.lfx.Chain(_6da);
};
dojo.provide("dojo.html.color");
dojo.html.getBackgroundColor=function(node){
node=dojo.byId(node);
var _6dc;
do{
_6dc=dojo.html.getStyle(node,"background-color");
if(_6dc.toLowerCase()=="rgba(0, 0, 0, 0)"){
_6dc="transparent";
}
if(node==document.getElementsByTagName("body")[0]){
node=null;
break;
}
node=node.parentNode;
}while(node&&dojo.lang.inArray(["transparent",""],_6dc));
if(_6dc=="transparent"){
_6dc=[255,255,255,0];
}else{
_6dc=dojo.gfx.color.extractRGB(_6dc);
}
return _6dc;
};
dojo.provide("dojo.lfx.html");
dojo.lfx.html._byId=function(_6dd){
if(!_6dd){
return [];
}
if(dojo.lang.isArrayLike(_6dd)){
if(!_6dd.alreadyChecked){
var n=[];
dojo.lang.forEach(_6dd,function(node){
n.push(dojo.byId(node));
});
n.alreadyChecked=true;
return n;
}else{
return _6dd;
}
}else{
var n=[];
n.push(dojo.byId(_6dd));
n.alreadyChecked=true;
return n;
}
};
dojo.lfx.html.propertyAnimation=function(_6e0,_6e1,_6e2,_6e3,_6e4){
_6e0=dojo.lfx.html._byId(_6e0);
var _6e5={"propertyMap":_6e1,"nodes":_6e0,"duration":_6e2,"easing":_6e3||dojo.lfx.easeDefault};
var _6e6=function(args){
if(args.nodes.length==1){
var pm=args.propertyMap;
if(!dojo.lang.isArray(args.propertyMap)){
var parr=[];
for(var _6ea in pm){
pm[_6ea].property=_6ea;
parr.push(pm[_6ea]);
}
pm=args.propertyMap=parr;
}
dojo.lang.forEach(pm,function(prop){
if(dj_undef("start",prop)){
if(prop.property!="opacity"){
prop.start=parseInt(dojo.html.getComputedStyle(args.nodes[0],prop.property));
}else{
prop.start=dojo.html.getOpacity(args.nodes[0]);
}
}
});
}
};
var _6ec=function(_6ed){
var _6ee=[];
dojo.lang.forEach(_6ed,function(c){
_6ee.push(Math.round(c));
});
return _6ee;
};
var _6f0=function(n,_6f2){
n=dojo.byId(n);
if(!n||!n.style){
return;
}
for(var s in _6f2){
try{
if(s=="opacity"){
dojo.html.setOpacity(n,_6f2[s]);
}else{
n.style[s]=_6f2[s];
}
}
catch(e){
dojo.debug(e);
}
}
};
var _6f4=function(_6f5){
this._properties=_6f5;
this.diffs=new Array(_6f5.length);
dojo.lang.forEach(_6f5,function(prop,i){
if(dojo.lang.isFunction(prop.start)){
prop.start=prop.start(prop,i);
}
if(dojo.lang.isFunction(prop.end)){
prop.end=prop.end(prop,i);
}
if(dojo.lang.isArray(prop.start)){
this.diffs[i]=null;
}else{
if(prop.start instanceof dojo.gfx.color.Color){
prop.startRgb=prop.start.toRgb();
prop.endRgb=prop.end.toRgb();
}else{
this.diffs[i]=prop.end-prop.start;
}
}
},this);
this.getValue=function(n){
var ret={};
dojo.lang.forEach(this._properties,function(prop,i){
var _6fc=null;
if(dojo.lang.isArray(prop.start)){
}else{
if(prop.start instanceof dojo.gfx.color.Color){
_6fc=(prop.units||"rgb")+"(";
for(var j=0;j<prop.startRgb.length;j++){
_6fc+=Math.round(((prop.endRgb[j]-prop.startRgb[j])*n)+prop.startRgb[j])+(j<prop.startRgb.length-1?",":"");
}
_6fc+=")";
}else{
_6fc=((this.diffs[i])*n)+prop.start+(prop.property!="opacity"?prop.units||"px":"");
}
}
ret[dojo.html.toCamelCase(prop.property)]=_6fc;
},this);
return ret;
};
};
var anim=new dojo.lfx.Animation({beforeBegin:function(){
_6e6(_6e5);
anim.curve=new _6f4(_6e5.propertyMap);
},onAnimate:function(_6ff){
dojo.lang.forEach(_6e5.nodes,function(node){
_6f0(node,_6ff);
});
}},_6e5.duration,null,_6e5.easing);
if(_6e4){
for(var x in _6e4){
if(dojo.lang.isFunction(_6e4[x])){
anim.connect(x,anim,_6e4[x]);
}
}
}
return anim;
};
dojo.lfx.html._makeFadeable=function(_702){
var _703=function(node){
if(dojo.render.html.ie){
if((node.style.zoom.length==0)&&(dojo.html.getStyle(node,"zoom")=="normal")){
node.style.zoom="1";
}
if((node.style.width.length==0)&&(dojo.html.getStyle(node,"width")=="auto")){
node.style.width="auto";
}
}
};
if(dojo.lang.isArrayLike(_702)){
dojo.lang.forEach(_702,_703);
}else{
_703(_702);
}
};
dojo.lfx.html.fade=function(_705,_706,_707,_708,_709){
_705=dojo.lfx.html._byId(_705);
var _70a={property:"opacity"};
if(!dj_undef("start",_706)){
_70a.start=_706.start;
}else{
_70a.start=function(){
return dojo.html.getOpacity(_705[0]);
};
}
if(!dj_undef("end",_706)){
_70a.end=_706.end;
}else{
dojo.raise("dojo.lfx.html.fade needs an end value");
}
var anim=dojo.lfx.propertyAnimation(_705,[_70a],_707,_708);
anim.connect("beforeBegin",function(){
dojo.lfx.html._makeFadeable(_705);
});
if(_709){
anim.connect("onEnd",function(){
_709(_705,anim);
});
}
return anim;
};
dojo.lfx.html.fadeIn=function(_70c,_70d,_70e,_70f){
return dojo.lfx.html.fade(_70c,{end:1},_70d,_70e,_70f);
};
dojo.lfx.html.fadeOut=function(_710,_711,_712,_713){
return dojo.lfx.html.fade(_710,{end:0},_711,_712,_713);
};
dojo.lfx.html.fadeShow=function(_714,_715,_716,_717){
_714=dojo.lfx.html._byId(_714);
dojo.lang.forEach(_714,function(node){
dojo.html.setOpacity(node,0);
});
var anim=dojo.lfx.html.fadeIn(_714,_715,_716,_717);
anim.connect("beforeBegin",function(){
if(dojo.lang.isArrayLike(_714)){
dojo.lang.forEach(_714,dojo.html.show);
}else{
dojo.html.show(_714);
}
});
return anim;
};
dojo.lfx.html.fadeHide=function(_71a,_71b,_71c,_71d){
var anim=dojo.lfx.html.fadeOut(_71a,_71b,_71c,function(){
if(dojo.lang.isArrayLike(_71a)){
dojo.lang.forEach(_71a,dojo.html.hide);
}else{
dojo.html.hide(_71a);
}
if(_71d){
_71d(_71a,anim);
}
});
return anim;
};
dojo.lfx.html.wipeIn=function(_71f,_720,_721,_722){
_71f=dojo.lfx.html._byId(_71f);
var _723=[];
dojo.lang.forEach(_71f,function(node){
var _725={};
var _726,_727,_728;
with(node.style){
_726=top;
_727=left;
_728=position;
top="-9999px";
left="-9999px";
position="absolute";
display="";
}
var _729=dojo.html.getBorderBox(node).height;
with(node.style){
top=_726;
left=_727;
position=_728;
display="none";
}
var anim=dojo.lfx.propertyAnimation(node,{"height":{start:1,end:function(){
return _729;
}}},_720,_721);
anim.connect("beforeBegin",function(){
_725.overflow=node.style.overflow;
_725.height=node.style.height;
with(node.style){
overflow="hidden";
height="1px";
}
dojo.html.show(node);
});
anim.connect("onEnd",function(){
with(node.style){
overflow=_725.overflow;
height=_725.height;
}
if(_722){
_722(node,anim);
}
});
_723.push(anim);
});
return dojo.lfx.combine(_723);
};
dojo.lfx.html.wipeOut=function(_72b,_72c,_72d,_72e){
_72b=dojo.lfx.html._byId(_72b);
var _72f=[];
dojo.lang.forEach(_72b,function(node){
var _731={};
var anim=dojo.lfx.propertyAnimation(node,{"height":{start:function(){
return dojo.html.getContentBox(node).height;
},end:1}},_72c,_72d,{"beforeBegin":function(){
_731.overflow=node.style.overflow;
_731.height=node.style.height;
with(node.style){
overflow="hidden";
}
dojo.html.show(node);
},"onEnd":function(){
dojo.html.hide(node);
with(node.style){
overflow=_731.overflow;
height=_731.height;
}
if(_72e){
_72e(node,anim);
}
}});
_72f.push(anim);
});
return dojo.lfx.combine(_72f);
};
dojo.lfx.html.slideTo=function(_733,_734,_735,_736,_737){
_733=dojo.lfx.html._byId(_733);
var _738=[];
var _739=dojo.html.getComputedStyle;
if(dojo.lang.isArray(_734)){
dojo.deprecated("dojo.lfx.html.slideTo(node, array)","use dojo.lfx.html.slideTo(node, {top: value, left: value});","0.5");
_734={top:_734[0],left:_734[1]};
}
dojo.lang.forEach(_733,function(node){
var top=null;
var left=null;
var init=(function(){
var _73e=node;
return function(){
var pos=_739(_73e,"position");
top=(pos=="absolute"?node.offsetTop:parseInt(_739(node,"top"))||0);
left=(pos=="absolute"?node.offsetLeft:parseInt(_739(node,"left"))||0);
if(!dojo.lang.inArray(["absolute","relative"],pos)){
var ret=dojo.html.abs(_73e,true);
dojo.html.setStyleAttributes(_73e,"position:absolute;top:"+ret.y+"px;left:"+ret.x+"px;");
top=ret.y;
left=ret.x;
}
};
})();
init();
var anim=dojo.lfx.propertyAnimation(node,{"top":{start:top,end:(_734.top||0)},"left":{start:left,end:(_734.left||0)}},_735,_736,{"beforeBegin":init});
if(_737){
anim.connect("onEnd",function(){
_737(_733,anim);
});
}
_738.push(anim);
});
return dojo.lfx.combine(_738);
};
dojo.lfx.html.slideBy=function(_742,_743,_744,_745,_746){
_742=dojo.lfx.html._byId(_742);
var _747=[];
var _748=dojo.html.getComputedStyle;
if(dojo.lang.isArray(_743)){
dojo.deprecated("dojo.lfx.html.slideBy(node, array)","use dojo.lfx.html.slideBy(node, {top: value, left: value});","0.5");
_743={top:_743[0],left:_743[1]};
}
dojo.lang.forEach(_742,function(node){
var top=null;
var left=null;
var init=(function(){
var _74d=node;
return function(){
var pos=_748(_74d,"position");
top=(pos=="absolute"?node.offsetTop:parseInt(_748(node,"top"))||0);
left=(pos=="absolute"?node.offsetLeft:parseInt(_748(node,"left"))||0);
if(!dojo.lang.inArray(["absolute","relative"],pos)){
var ret=dojo.html.abs(_74d,true);
dojo.html.setStyleAttributes(_74d,"position:absolute;top:"+ret.y+"px;left:"+ret.x+"px;");
top=ret.y;
left=ret.x;
}
};
})();
init();
var anim=dojo.lfx.propertyAnimation(node,{"top":{start:top,end:top+(_743.top||0)},"left":{start:left,end:left+(_743.left||0)}},_744,_745).connect("beforeBegin",init);
if(_746){
anim.connect("onEnd",function(){
_746(_742,anim);
});
}
_747.push(anim);
});
return dojo.lfx.combine(_747);
};
dojo.lfx.html.explode=function(_751,_752,_753,_754,_755){
var h=dojo.html;
_751=dojo.byId(_751);
_752=dojo.byId(_752);
var _757=h.toCoordinateObject(_751,true);
var _758=document.createElement("div");
h.copyStyle(_758,_752);
if(_752.explodeClassName){
_758.className=_752.explodeClassName;
}
with(_758.style){
position="absolute";
display="none";
var _759=h.getStyle(_751,"background-color");
backgroundColor=_759?_759.toLowerCase():"transparent";
backgroundColor=(backgroundColor=="transparent")?"rgb(221, 221, 221)":backgroundColor;
}
dojo.body().appendChild(_758);
with(_752.style){
visibility="hidden";
display="block";
}
var _75a=h.toCoordinateObject(_752,true);
with(_752.style){
display="none";
visibility="visible";
}
var _75b={opacity:{start:0.5,end:1}};
dojo.lang.forEach(["height","width","top","left"],function(type){
_75b[type]={start:_757[type],end:_75a[type]};
});
var anim=new dojo.lfx.propertyAnimation(_758,_75b,_753,_754,{"beforeBegin":function(){
h.setDisplay(_758,"block");
},"onEnd":function(){
h.setDisplay(_752,"block");
_758.parentNode.removeChild(_758);
}});
if(_755){
anim.connect("onEnd",function(){
_755(_752,anim);
});
}
return anim;
};
dojo.lfx.html.implode=function(_75e,end,_760,_761,_762){
var h=dojo.html;
_75e=dojo.byId(_75e);
end=dojo.byId(end);
var _764=dojo.html.toCoordinateObject(_75e,true);
var _765=dojo.html.toCoordinateObject(end,true);
var _766=document.createElement("div");
dojo.html.copyStyle(_766,_75e);
if(_75e.explodeClassName){
_766.className=_75e.explodeClassName;
}
dojo.html.setOpacity(_766,0.3);
with(_766.style){
position="absolute";
display="none";
backgroundColor=h.getStyle(_75e,"background-color").toLowerCase();
}
dojo.body().appendChild(_766);
var _767={opacity:{start:1,end:0.5}};
dojo.lang.forEach(["height","width","top","left"],function(type){
_767[type]={start:_764[type],end:_765[type]};
});
var anim=new dojo.lfx.propertyAnimation(_766,_767,_760,_761,{"beforeBegin":function(){
dojo.html.hide(_75e);
dojo.html.show(_766);
},"onEnd":function(){
_766.parentNode.removeChild(_766);
}});
if(_762){
anim.connect("onEnd",function(){
_762(_75e,anim);
});
}
return anim;
};
dojo.lfx.html.highlight=function(_76a,_76b,_76c,_76d,_76e){
_76a=dojo.lfx.html._byId(_76a);
var _76f=[];
dojo.lang.forEach(_76a,function(node){
var _771=dojo.html.getBackgroundColor(node);
var bg=dojo.html.getStyle(node,"background-color").toLowerCase();
var _773=dojo.html.getStyle(node,"background-image");
var _774=(bg=="transparent"||bg=="rgba(0, 0, 0, 0)");
while(_771.length>3){
_771.pop();
}
var rgb=new dojo.gfx.color.Color(_76b);
var _776=new dojo.gfx.color.Color(_771);
var anim=dojo.lfx.propertyAnimation(node,{"background-color":{start:rgb,end:_776}},_76c,_76d,{"beforeBegin":function(){
if(_773){
node.style.backgroundImage="none";
}
node.style.backgroundColor="rgb("+rgb.toRgb().join(",")+")";
},"onEnd":function(){
if(_773){
node.style.backgroundImage=_773;
}
if(_774){
node.style.backgroundColor="transparent";
}
if(_76e){
_76e(node,anim);
}
}});
_76f.push(anim);
});
return dojo.lfx.combine(_76f);
};
dojo.lfx.html.unhighlight=function(_778,_779,_77a,_77b,_77c){
_778=dojo.lfx.html._byId(_778);
var _77d=[];
dojo.lang.forEach(_778,function(node){
var _77f=new dojo.gfx.color.Color(dojo.html.getBackgroundColor(node));
var rgb=new dojo.gfx.color.Color(_779);
var _781=dojo.html.getStyle(node,"background-image");
var anim=dojo.lfx.propertyAnimation(node,{"background-color":{start:_77f,end:rgb}},_77a,_77b,{"beforeBegin":function(){
if(_781){
node.style.backgroundImage="none";
}
node.style.backgroundColor="rgb("+_77f.toRgb().join(",")+")";
},"onEnd":function(){
if(_77c){
_77c(node,anim);
}
}});
_77d.push(anim);
});
return dojo.lfx.combine(_77d);
};
dojo.lang.mixin(dojo.lfx,dojo.lfx.html);
dojo.kwCompoundRequire({browser:["dojo.lfx.html"],dashboard:["dojo.lfx.html"]});
dojo.provide("dojo.lfx.*");
dojo.provide("dojo.lfx.toggle");
dojo.lfx.toggle.plain={show:function(node,_784,_785,_786){
dojo.html.show(node);
if(dojo.lang.isFunction(_786)){
_786();
}
},hide:function(node,_788,_789,_78a){
dojo.html.hide(node);
if(dojo.lang.isFunction(_78a)){
_78a();
}
}};
dojo.lfx.toggle.fade={show:function(node,_78c,_78d,_78e){
dojo.lfx.fadeShow(node,_78c,_78d,_78e).play();
},hide:function(node,_790,_791,_792){
dojo.lfx.fadeHide(node,_790,_791,_792).play();
}};
dojo.lfx.toggle.wipe={show:function(node,_794,_795,_796){
dojo.lfx.wipeIn(node,_794,_795,_796).play();
},hide:function(node,_798,_799,_79a){
dojo.lfx.wipeOut(node,_798,_799,_79a).play();
}};
dojo.lfx.toggle.explode={show:function(node,_79c,_79d,_79e,_79f){
dojo.lfx.explode(_79f||{x:0,y:0,width:0,height:0},node,_79c,_79d,_79e).play();
},hide:function(node,_7a1,_7a2,_7a3,_7a4){
dojo.lfx.implode(node,_7a4||{x:0,y:0,width:0,height:0},_7a1,_7a2,_7a3).play();
}};
dojo.provide("dojo.widget.HtmlWidget");
dojo.declare("dojo.widget.HtmlWidget",dojo.widget.DomWidget,{templateCssPath:null,templatePath:null,lang:"",toggle:"plain",toggleDuration:150,initialize:function(args,frag){
},postMixInProperties:function(args,frag){
if(this.lang===""){
this.lang=null;
}
this.toggleObj=dojo.lfx.toggle[this.toggle.toLowerCase()]||dojo.lfx.toggle.plain;
},createNodesFromText:function(txt,wrap){
return dojo.html.createNodesFromText(txt,wrap);
},destroyRendering:function(_7ab){
try{
if(this.bgIframe){
this.bgIframe.remove();
delete this.bgIframe;
}
if(!_7ab&&this.domNode){
dojo.event.browser.clean(this.domNode);
}
dojo.widget.HtmlWidget.superclass.destroyRendering.call(this);
}
catch(e){
}
},isShowing:function(){
return dojo.html.isShowing(this.domNode);
},toggleShowing:function(){
if(this.isShowing()){
this.hide();
}else{
this.show();
}
},show:function(){
if(this.isShowing()){
return;
}
this.animationInProgress=true;
this.toggleObj.show(this.domNode,this.toggleDuration,null,dojo.lang.hitch(this,this.onShow),this.explodeSrc);
},onShow:function(){
this.animationInProgress=false;
this.checkSize();
},hide:function(){
if(!this.isShowing()){
return;
}
this.animationInProgress=true;
this.toggleObj.hide(this.domNode,this.toggleDuration,null,dojo.lang.hitch(this,this.onHide),this.explodeSrc);
},onHide:function(){
this.animationInProgress=false;
},_isResized:function(w,h){
if(!this.isShowing()){
return false;
}
var wh=dojo.html.getMarginBox(this.domNode);
var _7af=w||wh.width;
var _7b0=h||wh.height;
if(this.width==_7af&&this.height==_7b0){
return false;
}
this.width=_7af;
this.height=_7b0;
return true;
},checkSize:function(){
if(!this._isResized()){
return;
}
this.onResized();
},resizeTo:function(w,h){
dojo.html.setMarginBox(this.domNode,{width:w,height:h});
if(this.isShowing()){
this.onResized();
}
},resizeSoon:function(){
if(this.isShowing()){
dojo.lang.setTimeout(this,this.onResized,0);
}
},onResized:function(){
dojo.lang.forEach(this.children,function(_7b3){
if(_7b3.checkSize){
_7b3.checkSize();
}
});
}});
dojo.kwCompoundRequire({common:["dojo.xml.Parse","dojo.widget.Widget","dojo.widget.Parse","dojo.widget.Manager"],browser:["dojo.widget.DomWidget","dojo.widget.HtmlWidget"],dashboard:["dojo.widget.DomWidget","dojo.widget.HtmlWidget"],svg:["dojo.widget.SvgWidget"],rhino:["dojo.widget.SwtWidget"]});
dojo.provide("dojo.widget.*");
dojo.provide("dojo.widget.Button");
dojo.widget.defineWidget("dojo.widget.Button",dojo.widget.HtmlWidget,{isContainer:true,caption:"",templateString:"<div dojoAttachPoint=\"buttonNode\" class=\"dojoButton\" style=\"position:relative;\" dojoAttachEvent=\"onMouseOver; onMouseOut; onMouseDown; onMouseUp; onClick:buttonClick; onKey:onKey; onFocus;\">\n  <div class=\"dojoButtonContents\" align=center dojoAttachPoint=\"containerNode\" style=\"position:absolute;z-index:2;\"></div>\n  <img dojoAttachPoint=\"leftImage\" style=\"position:absolute;left:0px;\">\n  <img dojoAttachPoint=\"centerImage\" style=\"position:absolute;z-index:1;\">\n  <img dojoAttachPoint=\"rightImage\" style=\"position:absolute;top:0px;right:0px;\">\n</div>\n",templateCssString:"/* ---- button --- */\n.dojoButton {\n\tpadding: 0 0 0 0;\n\tfont-size: 8pt;\n\twhite-space: nowrap;\n\tcursor: pointer;\n\tfont-family: Myriad, Tahoma, Verdana, sans-serif;\n}\n\n.dojoButton .dojoButtonContents {\n\tpadding: 2px 2px 2px 2px;\n\ttext-align: center;\t\t/* if icon and label are split across two lines, center icon */\n\tcolor: white;\n}\n\n.dojoButtonLeftPart .dojoButtonContents {\n\tpadding-right: 8px;\n}\n\n.dojoButtonDisabled {\n\tcursor: url(\"images/no.gif\"), default;\n}\n\n\n.dojoButtonContents img {\n\tvertical-align: middle;\t/* if icon and label are on same line, center them */\n}\n\n/* -------- colors ------------ */\n\n.dojoButtonHover .dojoButtonContents {\n}\n\n.dojoButtonDepressed .dojoButtonContents {\n\tcolor: #293a4b;\n}\n\n.dojoButtonDisabled .dojoButtonContents {\n\tcolor: #aaa;\n}\n\n\n/* ---------- drop down button specific ---------- */\n\n/* border between label and arrow (for drop down buttons */\n.dojoButton .border {\n\twidth: 1px;\n\tbackground: gray;\n}\n\n/* button arrow */\n.dojoButton .downArrow {\n\tpadding-left: 10px;\n\ttext-align: center;\n}\n\n.dojoButton.disabled .downArrow {\n\tcursor : default;\n}\n",templateCssPath:dojo.uri.moduleUri("dojo.widget","templates/ButtonTemplate.css"),inactiveImg:"templates/images/soriaButton-",activeImg:"templates/images/soriaActive-",pressedImg:"templates/images/soriaPressed-",disabledImg:"templates/images/soriaDisabled-",width2height:1/3,fillInTemplate:function(){
if(this.caption){
this.containerNode.appendChild(document.createTextNode(this.caption));
}
dojo.html.disableSelection(this.containerNode);
},postCreate:function(){
this._sizeMyself();
},_sizeMyself:function(){
if(this.domNode.parentNode){
var _7b4=document.createElement("span");
dojo.html.insertBefore(_7b4,this.domNode);
}
dojo.body().appendChild(this.domNode);
this._sizeMyselfHelper();
if(_7b4){
dojo.html.insertBefore(this.domNode,_7b4);
dojo.html.removeNode(_7b4);
}
},_sizeMyselfHelper:function(){
var mb=dojo.html.getMarginBox(this.containerNode);
this.height=mb.height;
this.containerWidth=mb.width;
var _7b6=this.height*this.width2height;
this.containerNode.style.left=_7b6+"px";
this.leftImage.height=this.rightImage.height=this.centerImage.height=this.height;
this.leftImage.width=this.rightImage.width=_7b6+1;
this.centerImage.width=this.containerWidth;
this.centerImage.style.left=_7b6+"px";
this._setImage(this.disabled?this.disabledImg:this.inactiveImg);
if(this.disabled){
dojo.html.prependClass(this.domNode,"dojoButtonDisabled");
this.domNode.removeAttribute("tabIndex");
dojo.widget.wai.setAttr(this.domNode,"waiState","disabled",true);
}else{
dojo.html.removeClass(this.domNode,"dojoButtonDisabled");
this.domNode.setAttribute("tabIndex","0");
dojo.widget.wai.setAttr(this.domNode,"waiState","disabled",false);
}
this.domNode.style.height=this.height+"px";
this.domNode.style.width=(this.containerWidth+2*_7b6)+"px";
},onMouseOver:function(e){
if(this.disabled){
return;
}
if(!dojo.html.hasClass(this.buttonNode,"dojoButtonHover")){
dojo.html.prependClass(this.buttonNode,"dojoButtonHover");
}
this._setImage(this.activeImg);
},onMouseDown:function(e){
if(this.disabled){
return;
}
dojo.html.prependClass(this.buttonNode,"dojoButtonDepressed");
dojo.html.removeClass(this.buttonNode,"dojoButtonHover");
this._setImage(this.pressedImg);
},onMouseUp:function(e){
if(this.disabled){
return;
}
dojo.html.prependClass(this.buttonNode,"dojoButtonHover");
dojo.html.removeClass(this.buttonNode,"dojoButtonDepressed");
this._setImage(this.activeImg);
},onMouseOut:function(e){
if(this.disabled){
return;
}
if(e.toElement&&dojo.html.isDescendantOf(e.toElement,this.buttonNode)){
return;
}
dojo.html.removeClass(this.buttonNode,"dojoButtonHover");
dojo.html.removeClass(this.buttonNode,"dojoButtonDepressed");
this._setImage(this.inactiveImg);
},onKey:function(e){
if(!e.key){
return;
}
var menu=dojo.widget.getWidgetById(this.menuId);
if(e.key==e.KEY_ENTER||e.key==" "){
this.onMouseDown(e);
this.buttonClick(e);
dojo.lang.setTimeout(this,"onMouseUp",75,e);
dojo.event.browser.stopEvent(e);
}
if(menu&&menu.isShowingNow&&e.key==e.KEY_DOWN_ARROW){
dojo.event.disconnect(this.domNode,"onblur",this,"onBlur");
}
},onFocus:function(e){
var menu=dojo.widget.getWidgetById(this.menuId);
if(menu){
dojo.event.connectOnce(this.domNode,"onblur",this,"onBlur");
}
},onBlur:function(e){
var menu=dojo.widget.getWidgetById(this.menuId);
if(!menu){
return;
}
if(menu.close&&menu.isShowingNow){
menu.close();
}
},buttonClick:function(e){
if(!this.disabled){
try{
this.domNode.focus();
}
catch(e2){
}
this.onClick(e);
}
},onClick:function(e){
},_setImage:function(_7c3){
this.leftImage.src=dojo.uri.moduleUri("dojo.widget",_7c3+"l.gif");
this.centerImage.src=dojo.uri.moduleUri("dojo.widget",_7c3+"c.gif");
this.rightImage.src=dojo.uri.moduleUri("dojo.widget",_7c3+"r.gif");
},_toggleMenu:function(_7c4){
var menu=dojo.widget.getWidgetById(_7c4);
if(!menu){
return;
}
if(menu.open&&!menu.isShowingNow){
var pos=dojo.html.getAbsolutePosition(this.domNode,false);
menu.open(pos.x,pos.y+this.height,this);
dojo.event.disconnect(this.domNode,"onblur",this,"onBlur");
}else{
if(menu.close&&menu.isShowingNow){
menu.close();
}else{
menu.toggle();
}
}
},setCaption:function(_7c7){
this.caption=_7c7;
this.containerNode.innerHTML=_7c7;
this._sizeMyself();
},setDisabled:function(_7c8){
this.disabled=_7c8;
this._sizeMyself();
}});
dojo.widget.defineWidget("dojo.widget.DropDownButton",dojo.widget.Button,{menuId:"",downArrow:"templates/images/whiteDownArrow.gif",disabledDownArrow:"templates/images/whiteDownArrow.gif",fillInTemplate:function(){
dojo.widget.DropDownButton.superclass.fillInTemplate.apply(this,arguments);
this.arrow=document.createElement("img");
dojo.html.setClass(this.arrow,"downArrow");
dojo.widget.wai.setAttr(this.domNode,"waiState","haspopup",this.menuId);
},_sizeMyselfHelper:function(){
this.arrow.src=dojo.uri.moduleUri("dojo.widget",this.disabled?this.disabledDownArrow:this.downArrow);
this.containerNode.appendChild(this.arrow);
dojo.widget.DropDownButton.superclass._sizeMyselfHelper.call(this);
},onClick:function(e){
this._toggleMenu(this.menuId);
}});
dojo.widget.defineWidget("dojo.widget.ComboButton",dojo.widget.Button,{menuId:"",templateString:"<div class=\"dojoButton\" style=\"position:relative;top:0px;left:0px; text-align:none;\" dojoAttachEvent=\"onKey;onFocus\">\n\n\t<div dojoAttachPoint=\"buttonNode\" class=\"dojoButtonLeftPart\" style=\"position:absolute;left:0px;top:0px;\"\n\t\tdojoAttachEvent=\"onMouseOver; onMouseOut; onMouseDown; onMouseUp; onClick:buttonClick;\">\n\t\t<div class=\"dojoButtonContents\" dojoAttachPoint=\"containerNode\" style=\"position:absolute;top:0px;right:0px;z-index:2;\"></div>\n\t\t<img dojoAttachPoint=\"leftImage\" style=\"position:absolute;left:0px;top:0px;\">\n\t\t<img dojoAttachPoint=\"centerImage\" style=\"position:absolute;right:0px;top:0px;z-index:1;\">\n\t</div>\n\n\t<div dojoAttachPoint=\"rightPart\" class=\"dojoButtonRightPart\" style=\"position:absolute;top:0px;right:0px;\"\n\t\tdojoAttachEvent=\"onMouseOver:rightOver; onMouseOut:rightOut; onMouseDown:rightDown; onMouseUp:rightUp; onClick:rightClick;\">\n\t\t<img dojoAttachPoint=\"arrowBackgroundImage\" style=\"position:absolute;top:0px;left:0px;z-index:1;\">\n\t\t<img src=\"${dojoWidgetModuleUri}templates/images/whiteDownArrow.gif\"\n\t\t  \t\tstyle=\"z-index:2;position:absolute;left:3px;top:50%;\">\n\t\t<img dojoAttachPoint=\"rightImage\" style=\"position:absolute;top:0px;right:0px;\">\n\t</div>\n\n</div>\n",splitWidth:2,arrowWidth:5,_sizeMyselfHelper:function(e){
var mb=dojo.html.getMarginBox(this.containerNode);
this.height=mb.height;
this.containerWidth=mb.width;
var _7cc=this.height/3;
if(this.disabled){
dojo.widget.wai.setAttr(this.domNode,"waiState","disabled",true);
this.domNode.removeAttribute("tabIndex");
}else{
dojo.widget.wai.setAttr(this.domNode,"waiState","disabled",false);
this.domNode.setAttribute("tabIndex","0");
}
this.leftImage.height=this.rightImage.height=this.centerImage.height=this.arrowBackgroundImage.height=this.height;
this.leftImage.width=_7cc+1;
this.centerImage.width=this.containerWidth;
this.buttonNode.style.height=this.height+"px";
this.buttonNode.style.width=_7cc+this.containerWidth+"px";
this._setImage(this.disabled?this.disabledImg:this.inactiveImg);
this.arrowBackgroundImage.width=this.arrowWidth;
this.rightImage.width=_7cc+1;
this.rightPart.style.height=this.height+"px";
this.rightPart.style.width=this.arrowWidth+_7cc+"px";
this._setImageR(this.disabled?this.disabledImg:this.inactiveImg);
this.domNode.style.height=this.height+"px";
var _7cd=this.containerWidth+this.splitWidth+this.arrowWidth+2*_7cc;
this.domNode.style.width=_7cd+"px";
},_setImage:function(_7ce){
this.leftImage.src=dojo.uri.moduleUri("dojo.widget",_7ce+"l.gif");
this.centerImage.src=dojo.uri.moduleUri("dojo.widget",_7ce+"c.gif");
},rightOver:function(e){
if(this.disabled){
return;
}
dojo.html.prependClass(this.rightPart,"dojoButtonHover");
this._setImageR(this.activeImg);
},rightDown:function(e){
if(this.disabled){
return;
}
dojo.html.prependClass(this.rightPart,"dojoButtonDepressed");
dojo.html.removeClass(this.rightPart,"dojoButtonHover");
this._setImageR(this.pressedImg);
},rightUp:function(e){
if(this.disabled){
return;
}
dojo.html.prependClass(this.rightPart,"dojoButtonHover");
dojo.html.removeClass(this.rightPart,"dojoButtonDepressed");
this._setImageR(this.activeImg);
},rightOut:function(e){
if(this.disabled){
return;
}
dojo.html.removeClass(this.rightPart,"dojoButtonHover");
dojo.html.removeClass(this.rightPart,"dojoButtonDepressed");
this._setImageR(this.inactiveImg);
},rightClick:function(e){
if(this.disabled){
return;
}
try{
this.domNode.focus();
}
catch(e2){
}
this._toggleMenu(this.menuId);
},_setImageR:function(_7d4){
this.arrowBackgroundImage.src=dojo.uri.moduleUri("dojo.widget",_7d4+"c.gif");
this.rightImage.src=dojo.uri.moduleUri("dojo.widget",_7d4+"r.gif");
},onKey:function(e){
if(!e.key){
return;
}
var menu=dojo.widget.getWidgetById(this.menuId);
if(e.key==e.KEY_ENTER||e.key==" "){
this.onMouseDown(e);
this.buttonClick(e);
dojo.lang.setTimeout(this,"onMouseUp",75,e);
dojo.event.browser.stopEvent(e);
}else{
if(e.key==e.KEY_DOWN_ARROW&&e.altKey){
this.rightDown(e);
this.rightClick(e);
dojo.lang.setTimeout(this,"rightUp",75,e);
dojo.event.browser.stopEvent(e);
}else{
if(menu&&menu.isShowingNow&&e.key==e.KEY_DOWN_ARROW){
dojo.event.disconnect(this.domNode,"onblur",this,"onBlur");
}
}
}
}});
if(!this["dojo"]){
alert("\"dojo/__package__.js\" is now located at \"dojo/dojo.js\". Please update your includes accordingly");
}
dojo.provide("dojo.string");
dojo.provide("dojo.io.common");
dojo.io.transports=[];
dojo.io.hdlrFuncNames=["load","error","timeout"];
dojo.io.Request=function(url,_7d8,_7d9,_7da){
if((arguments.length==1)&&(arguments[0].constructor==Object)){
this.fromKwArgs(arguments[0]);
}else{
this.url=url;
if(_7d8){
this.mimetype=_7d8;
}
if(_7d9){
this.transport=_7d9;
}
if(arguments.length>=4){
this.changeUrl=_7da;
}
}
};
dojo.lang.extend(dojo.io.Request,{url:"",mimetype:"text/plain",method:"GET",content:undefined,transport:undefined,changeUrl:undefined,formNode:undefined,sync:false,bindSuccess:false,useCache:false,preventCache:false,load:function(type,data,_7dd,_7de){
},error:function(type,_7e0,_7e1,_7e2){
},timeout:function(type,_7e4,_7e5,_7e6){
},handle:function(type,data,_7e9,_7ea){
},timeoutSeconds:0,abort:function(){
},fromKwArgs:function(_7eb){
if(_7eb["url"]){
_7eb.url=_7eb.url.toString();
}
if(_7eb["formNode"]){
_7eb.formNode=dojo.byId(_7eb.formNode);
}
if(!_7eb["method"]&&_7eb["formNode"]&&_7eb["formNode"].method){
_7eb.method=_7eb["formNode"].method;
}
if(!_7eb["handle"]&&_7eb["handler"]){
_7eb.handle=_7eb.handler;
}
if(!_7eb["load"]&&_7eb["loaded"]){
_7eb.load=_7eb.loaded;
}
if(!_7eb["changeUrl"]&&_7eb["changeURL"]){
_7eb.changeUrl=_7eb.changeURL;
}
_7eb.encoding=dojo.lang.firstValued(_7eb["encoding"],djConfig["bindEncoding"],"");
_7eb.sendTransport=dojo.lang.firstValued(_7eb["sendTransport"],djConfig["ioSendTransport"],false);
var _7ec=dojo.lang.isFunction;
for(var x=0;x<dojo.io.hdlrFuncNames.length;x++){
var fn=dojo.io.hdlrFuncNames[x];
if(_7eb[fn]&&_7ec(_7eb[fn])){
continue;
}
if(_7eb["handle"]&&_7ec(_7eb["handle"])){
_7eb[fn]=_7eb.handle;
}
}
dojo.lang.mixin(this,_7eb);
}});
dojo.io.Error=function(msg,type,num){
this.message=msg;
this.type=type||"unknown";
this.number=num||0;
};
dojo.io.transports.addTransport=function(name){
this.push(name);
this[name]=dojo.io[name];
};
dojo.io.bind=function(_7f3){
if(!(_7f3 instanceof dojo.io.Request)){
try{
_7f3=new dojo.io.Request(_7f3);
}
catch(e){
dojo.debug(e);
}
}
var _7f4="";
if(_7f3["transport"]){
_7f4=_7f3["transport"];
if(!this[_7f4]){
dojo.io.sendBindError(_7f3,"No dojo.io.bind() transport with name '"+_7f3["transport"]+"'.");
return _7f3;
}
if(!this[_7f4].canHandle(_7f3)){
dojo.io.sendBindError(_7f3,"dojo.io.bind() transport with name '"+_7f3["transport"]+"' cannot handle this type of request.");
return _7f3;
}
}else{
for(var x=0;x<dojo.io.transports.length;x++){
var tmp=dojo.io.transports[x];
if((this[tmp])&&(this[tmp].canHandle(_7f3))){
_7f4=tmp;
break;
}
}
if(_7f4==""){
dojo.io.sendBindError(_7f3,"None of the loaded transports for dojo.io.bind()"+" can handle the request.");
return _7f3;
}
}
this[_7f4].bind(_7f3);
_7f3.bindSuccess=true;
return _7f3;
};
dojo.io.sendBindError=function(_7f7,_7f8){
if((typeof _7f7.error=="function"||typeof _7f7.handle=="function")&&(typeof setTimeout=="function"||typeof setTimeout=="object")){
var _7f9=new dojo.io.Error(_7f8);
setTimeout(function(){
_7f7[(typeof _7f7.error=="function")?"error":"handle"]("error",_7f9,null,_7f7);
},50);
}else{
dojo.raise(_7f8);
}
};
dojo.io.queueBind=function(_7fa){
if(!(_7fa instanceof dojo.io.Request)){
try{
_7fa=new dojo.io.Request(_7fa);
}
catch(e){
dojo.debug(e);
}
}
var _7fb=_7fa.load;
_7fa.load=function(){
dojo.io._queueBindInFlight=false;
var ret=_7fb.apply(this,arguments);
dojo.io._dispatchNextQueueBind();
return ret;
};
var _7fd=_7fa.error;
_7fa.error=function(){
dojo.io._queueBindInFlight=false;
var ret=_7fd.apply(this,arguments);
dojo.io._dispatchNextQueueBind();
return ret;
};
dojo.io._bindQueue.push(_7fa);
dojo.io._dispatchNextQueueBind();
return _7fa;
};
dojo.io._dispatchNextQueueBind=function(){
if(!dojo.io._queueBindInFlight){
dojo.io._queueBindInFlight=true;
if(dojo.io._bindQueue.length>0){
dojo.io.bind(dojo.io._bindQueue.shift());
}else{
dojo.io._queueBindInFlight=false;
}
}
};
dojo.io._bindQueue=[];
dojo.io._queueBindInFlight=false;
dojo.io.argsFromMap=function(map,_800,last){
var enc=/utf/i.test(_800||"")?encodeURIComponent:dojo.string.encodeAscii;
var _803=[];
var _804=new Object();
for(var name in map){
var _806=function(elt){
var val=enc(name)+"="+enc(elt);
_803[(last==name)?"push":"unshift"](val);
};
if(!_804[name]){
var _809=map[name];
if(dojo.lang.isArray(_809)){
dojo.lang.forEach(_809,_806);
}else{
_806(_809);
}
}
}
return _803.join("&");
};
dojo.io.setIFrameSrc=function(_80a,src,_80c){
try{
var r=dojo.render.html;
if(!_80c){
if(r.safari){
_80a.location=src;
}else{
frames[_80a.name].location=src;
}
}else{
var idoc;
if(r.ie){
idoc=_80a.contentWindow.document;
}else{
if(r.safari){
idoc=_80a.document;
}else{
idoc=_80a.contentWindow;
}
}
if(!idoc){
_80a.location=src;
return;
}else{
idoc.location.replace(src);
}
}
}
catch(e){
dojo.debug(e);
dojo.debug("setIFrameSrc: "+e);
}
};
dojo.provide("dojo.undo.browser");
try{
if((!djConfig["preventBackButtonFix"])&&(!dojo.hostenv.post_load_)){
document.write("<iframe style='border: 0px; width: 1px; height: 1px; position: absolute; bottom: 0px; right: 0px; visibility: visible;' name='djhistory' id='djhistory' src='"+(djConfig["dojoIframeHistoryUrl"]||dojo.hostenv.getBaseScriptUri()+"iframe_history.html")+"'></iframe>");
}
}
catch(e){
}
if(dojo.render.html.opera){
dojo.debug("Opera is not supported with dojo.undo.browser, so back/forward detection will not work.");
}
dojo.undo.browser={initialHref:(!dj_undef("window"))?window.location.href:"",initialHash:(!dj_undef("window"))?window.location.hash:"",moveForward:false,historyStack:[],forwardStack:[],historyIframe:null,bookmarkAnchor:null,locationTimer:null,setInitialState:function(args){
this.initialState=this._createState(this.initialHref,args,this.initialHash);
},addToHistory:function(args){
this.forwardStack=[];
var hash=null;
var url=null;
if(!this.historyIframe){
if(djConfig["useXDomain"]&&!djConfig["dojoIframeHistoryUrl"]){
dojo.debug("dojo.undo.browser: When using cross-domain Dojo builds,"+" please save iframe_history.html to your domain and set djConfig.dojoIframeHistoryUrl"+" to the path on your domain to iframe_history.html");
}
this.historyIframe=window.frames["djhistory"];
}
if(!this.bookmarkAnchor){
this.bookmarkAnchor=document.createElement("a");
dojo.body().appendChild(this.bookmarkAnchor);
this.bookmarkAnchor.style.display="none";
}
if(args["changeUrl"]){
hash="#"+((args["changeUrl"]!==true)?args["changeUrl"]:(new Date()).getTime());
if(this.historyStack.length==0&&this.initialState.urlHash==hash){
this.initialState=this._createState(url,args,hash);
return;
}else{
if(this.historyStack.length>0&&this.historyStack[this.historyStack.length-1].urlHash==hash){
this.historyStack[this.historyStack.length-1]=this._createState(url,args,hash);
return;
}
}
this.changingUrl=true;
setTimeout("window.location.href = '"+hash+"'; dojo.undo.browser.changingUrl = false;",1);
this.bookmarkAnchor.href=hash;
if(dojo.render.html.ie){
url=this._loadIframeHistory();
var _813=args["back"]||args["backButton"]||args["handle"];
var tcb=function(_815){
if(window.location.hash!=""){
setTimeout("window.location.href = '"+hash+"';",1);
}
_813.apply(this,[_815]);
};
if(args["back"]){
args.back=tcb;
}else{
if(args["backButton"]){
args.backButton=tcb;
}else{
if(args["handle"]){
args.handle=tcb;
}
}
}
var _816=args["forward"]||args["forwardButton"]||args["handle"];
var tfw=function(_818){
if(window.location.hash!=""){
window.location.href=hash;
}
if(_816){
_816.apply(this,[_818]);
}
};
if(args["forward"]){
args.forward=tfw;
}else{
if(args["forwardButton"]){
args.forwardButton=tfw;
}else{
if(args["handle"]){
args.handle=tfw;
}
}
}
}else{
if(dojo.render.html.moz){
if(!this.locationTimer){
this.locationTimer=setInterval("dojo.undo.browser.checkLocation();",200);
}
}
}
}else{
url=this._loadIframeHistory();
}
this.historyStack.push(this._createState(url,args,hash));
},checkLocation:function(){
if(!this.changingUrl){
var hsl=this.historyStack.length;
if((window.location.hash==this.initialHash||window.location.href==this.initialHref)&&(hsl==1)){
this.handleBackButton();
return;
}
if(this.forwardStack.length>0){
if(this.forwardStack[this.forwardStack.length-1].urlHash==window.location.hash){
this.handleForwardButton();
return;
}
}
if((hsl>=2)&&(this.historyStack[hsl-2])){
if(this.historyStack[hsl-2].urlHash==window.location.hash){
this.handleBackButton();
return;
}
}
}
},iframeLoaded:function(evt,_81b){
if(!dojo.render.html.opera){
var _81c=this._getUrlQuery(_81b.href);
if(_81c==null){
if(this.historyStack.length==1){
this.handleBackButton();
}
return;
}
if(this.moveForward){
this.moveForward=false;
return;
}
if(this.historyStack.length>=2&&_81c==this._getUrlQuery(this.historyStack[this.historyStack.length-2].url)){
this.handleBackButton();
}else{
if(this.forwardStack.length>0&&_81c==this._getUrlQuery(this.forwardStack[this.forwardStack.length-1].url)){
this.handleForwardButton();
}
}
}
},handleBackButton:function(){
var _81d=this.historyStack.pop();
if(!_81d){
return;
}
var last=this.historyStack[this.historyStack.length-1];
if(!last&&this.historyStack.length==0){
last=this.initialState;
}
if(last){
if(last.kwArgs["back"]){
last.kwArgs["back"]();
}else{
if(last.kwArgs["backButton"]){
last.kwArgs["backButton"]();
}else{
if(last.kwArgs["handle"]){
last.kwArgs.handle("back");
}
}
}
}
this.forwardStack.push(_81d);
},handleForwardButton:function(){
var last=this.forwardStack.pop();
if(!last){
return;
}
if(last.kwArgs["forward"]){
last.kwArgs.forward();
}else{
if(last.kwArgs["forwardButton"]){
last.kwArgs.forwardButton();
}else{
if(last.kwArgs["handle"]){
last.kwArgs.handle("forward");
}
}
}
this.historyStack.push(last);
},_createState:function(url,args,hash){
return {"url":url,"kwArgs":args,"urlHash":hash};
},_getUrlQuery:function(url){
var _824=url.split("?");
if(_824.length<2){
return null;
}else{
return _824[1];
}
},_loadIframeHistory:function(){
var url=(djConfig["dojoIframeHistoryUrl"]||dojo.hostenv.getBaseScriptUri()+"iframe_history.html")+"?"+(new Date()).getTime();
this.moveForward=true;
dojo.io.setIFrameSrc(this.historyIframe,url,false);
return url;
}};
dojo.provide("dojo.io.BrowserIO");
if(!dj_undef("window")){
dojo.io.checkChildrenForFile=function(node){
var _827=false;
var _828=node.getElementsByTagName("input");
dojo.lang.forEach(_828,function(_829){
if(_827){
return;
}
if(_829.getAttribute("type")=="file"){
_827=true;
}
});
return _827;
};
dojo.io.formHasFile=function(_82a){
return dojo.io.checkChildrenForFile(_82a);
};
dojo.io.updateNode=function(node,_82c){
node=dojo.byId(node);
var args=_82c;
if(dojo.lang.isString(_82c)){
args={url:_82c};
}
args.mimetype="text/html";
args.load=function(t,d,e){
while(node.firstChild){
dojo.dom.destroyNode(node.firstChild);
}
node.innerHTML=d;
};
dojo.io.bind(args);
};
dojo.io.formFilter=function(node){
var type=(node.type||"").toLowerCase();
return !node.disabled&&node.name&&!dojo.lang.inArray(["file","submit","image","reset","button"],type);
};
dojo.io.encodeForm=function(_833,_834,_835){
if((!_833)||(!_833.tagName)||(!_833.tagName.toLowerCase()=="form")){
dojo.raise("Attempted to encode a non-form element.");
}
if(!_835){
_835=dojo.io.formFilter;
}
var enc=/utf/i.test(_834||"")?encodeURIComponent:dojo.string.encodeAscii;
var _837=[];
for(var i=0;i<_833.elements.length;i++){
var elm=_833.elements[i];
if(!elm||elm.tagName.toLowerCase()=="fieldset"||!_835(elm)){
continue;
}
var name=enc(elm.name);
var type=elm.type.toLowerCase();
if(type=="select-multiple"){
for(var j=0;j<elm.options.length;j++){
if(elm.options[j].selected){
_837.push(name+"="+enc(elm.options[j].value));
}
}
}else{
if(dojo.lang.inArray(["radio","checkbox"],type)){
if(elm.checked){
_837.push(name+"="+enc(elm.value));
}
}else{
_837.push(name+"="+enc(elm.value));
}
}
}
var _83d=_833.getElementsByTagName("input");
for(var i=0;i<_83d.length;i++){
var _83e=_83d[i];
if(_83e.type.toLowerCase()=="image"&&_83e.form==_833&&_835(_83e)){
var name=enc(_83e.name);
_837.push(name+"="+enc(_83e.value));
_837.push(name+".x=0");
_837.push(name+".y=0");
}
}
return _837.join("&")+"&";
};
dojo.io.FormBind=function(args){
this.bindArgs={};
if(args&&args.formNode){
this.init(args);
}else{
if(args){
this.init({formNode:args});
}
}
};
dojo.lang.extend(dojo.io.FormBind,{form:null,bindArgs:null,clickedButton:null,init:function(args){
var form=dojo.byId(args.formNode);
if(!form||!form.tagName||form.tagName.toLowerCase()!="form"){
throw new Error("FormBind: Couldn't apply, invalid form");
}else{
if(this.form==form){
return;
}else{
if(this.form){
throw new Error("FormBind: Already applied to a form");
}
}
}
dojo.lang.mixin(this.bindArgs,args);
this.form=form;
this.connect(form,"onsubmit","submit");
for(var i=0;i<form.elements.length;i++){
var node=form.elements[i];
if(node&&node.type&&dojo.lang.inArray(["submit","button"],node.type.toLowerCase())){
this.connect(node,"onclick","click");
}
}
var _844=form.getElementsByTagName("input");
for(var i=0;i<_844.length;i++){
var _845=_844[i];
if(_845.type.toLowerCase()=="image"&&_845.form==form){
this.connect(_845,"onclick","click");
}
}
},onSubmit:function(form){
return true;
},submit:function(e){
e.preventDefault();
if(this.onSubmit(this.form)){
dojo.io.bind(dojo.lang.mixin(this.bindArgs,{formFilter:dojo.lang.hitch(this,"formFilter")}));
}
},click:function(e){
var node=e.currentTarget;
if(node.disabled){
return;
}
this.clickedButton=node;
},formFilter:function(node){
var type=(node.type||"").toLowerCase();
var _84c=false;
if(node.disabled||!node.name){
_84c=false;
}else{
if(dojo.lang.inArray(["submit","button","image"],type)){
if(!this.clickedButton){
this.clickedButton=node;
}
_84c=node==this.clickedButton;
}else{
_84c=!dojo.lang.inArray(["file","submit","reset","button"],type);
}
}
return _84c;
},connect:function(_84d,_84e,_84f){
if(dojo.evalObjPath("dojo.event.connect")){
dojo.event.connect(_84d,_84e,this,_84f);
}else{
var fcn=dojo.lang.hitch(this,_84f);
_84d[_84e]=function(e){
if(!e){
e=window.event;
}
if(!e.currentTarget){
e.currentTarget=e.srcElement;
}
if(!e.preventDefault){
e.preventDefault=function(){
window.event.returnValue=false;
};
}
fcn(e);
};
}
}});
dojo.io.XMLHTTPTransport=new function(){
var _852=this;
var _853={};
this.useCache=false;
this.preventCache=false;
function getCacheKey(url,_855,_856){
return url+"|"+_855+"|"+_856.toLowerCase();
}
function addToCache(url,_858,_859,http){
_853[getCacheKey(url,_858,_859)]=http;
}
function getFromCache(url,_85c,_85d){
return _853[getCacheKey(url,_85c,_85d)];
}
this.clearCache=function(){
_853={};
};
function doLoad(_85e,http,url,_861,_862){
if(((http.status>=200)&&(http.status<300))||(http.status==304)||(location.protocol=="file:"&&(http.status==0||http.status==undefined))||(location.protocol=="chrome:"&&(http.status==0||http.status==undefined))){
var ret;
if(_85e.method.toLowerCase()=="head"){
var _864=http.getAllResponseHeaders();
ret={};
ret.toString=function(){
return _864;
};
var _865=_864.split(/[\r\n]+/g);
for(var i=0;i<_865.length;i++){
var pair=_865[i].match(/^([^:]+)\s*:\s*(.+)$/i);
if(pair){
ret[pair[1]]=pair[2];
}
}
}else{
if(_85e.mimetype=="text/javascript"){
try{
ret=dj_eval(http.responseText);
}
catch(e){
dojo.debug(e);
dojo.debug(http.responseText);
ret=null;
}
}else{
if(_85e.mimetype=="text/json"||_85e.mimetype=="application/json"){
try{
ret=dj_eval("("+http.responseText+")");
}
catch(e){
dojo.debug(e);
dojo.debug(http.responseText);
ret=false;
}
}else{
if((_85e.mimetype=="application/xml")||(_85e.mimetype=="text/xml")){
ret=http.responseXML;
if(!ret||typeof ret=="string"||!http.getResponseHeader("Content-Type")){
ret=dojo.dom.createDocumentFromText(http.responseText);
}
}else{
ret=http.responseText;
}
}
}
}
if(_862){
addToCache(url,_861,_85e.method,http);
}
_85e[(typeof _85e.load=="function")?"load":"handle"]("load",ret,http,_85e);
}else{
var _868=new dojo.io.Error("XMLHttpTransport Error: "+http.status+" "+http.statusText);
_85e[(typeof _85e.error=="function")?"error":"handle"]("error",_868,http,_85e);
}
}
function setHeaders(http,_86a){
if(_86a["headers"]){
for(var _86b in _86a["headers"]){
if(_86b.toLowerCase()=="content-type"&&!_86a["contentType"]){
_86a["contentType"]=_86a["headers"][_86b];
}else{
http.setRequestHeader(_86b,_86a["headers"][_86b]);
}
}
}
}
this.inFlight=[];
this.inFlightTimer=null;
this.startWatchingInFlight=function(){
if(!this.inFlightTimer){
this.inFlightTimer=setTimeout("dojo.io.XMLHTTPTransport.watchInFlight();",10);
}
};
this.watchInFlight=function(){
var now=null;
if(!dojo.hostenv._blockAsync&&!_852._blockAsync){
for(var x=this.inFlight.length-1;x>=0;x--){
try{
var tif=this.inFlight[x];
if(!tif||tif.http._aborted||!tif.http.readyState){
this.inFlight.splice(x,1);
continue;
}
if(4==tif.http.readyState){
this.inFlight.splice(x,1);
doLoad(tif.req,tif.http,tif.url,tif.query,tif.useCache);
}else{
if(tif.startTime){
if(!now){
now=(new Date()).getTime();
}
if(tif.startTime+(tif.req.timeoutSeconds*1000)<now){
if(typeof tif.http.abort=="function"){
tif.http.abort();
}
this.inFlight.splice(x,1);
tif.req[(typeof tif.req.timeout=="function")?"timeout":"handle"]("timeout",null,tif.http,tif.req);
}
}
}
}
catch(e){
try{
var _86f=new dojo.io.Error("XMLHttpTransport.watchInFlight Error: "+e);
tif.req[(typeof tif.req.error=="function")?"error":"handle"]("error",_86f,tif.http,tif.req);
}
catch(e2){
dojo.debug("XMLHttpTransport error callback failed: "+e2);
}
}
}
}
clearTimeout(this.inFlightTimer);
if(this.inFlight.length==0){
this.inFlightTimer=null;
return;
}
this.inFlightTimer=setTimeout("dojo.io.XMLHTTPTransport.watchInFlight();",10);
};
var _870=dojo.hostenv.getXmlhttpObject()?true:false;
this.canHandle=function(_871){
return _870&&dojo.lang.inArray(["text/plain","text/html","application/xml","text/xml","text/javascript","text/json","application/json"],(_871["mimetype"].toLowerCase()||""))&&!(_871["formNode"]&&dojo.io.formHasFile(_871["formNode"]));
};
this.multipartBoundary="45309FFF-BD65-4d50-99C9-36986896A96F";
this.bind=function(_872){
if(!_872["url"]){
if(!_872["formNode"]&&(_872["backButton"]||_872["back"]||_872["changeUrl"]||_872["watchForURL"])&&(!djConfig.preventBackButtonFix)){
dojo.deprecated("Using dojo.io.XMLHTTPTransport.bind() to add to browser history without doing an IO request","Use dojo.undo.browser.addToHistory() instead.","0.4");
dojo.undo.browser.addToHistory(_872);
return true;
}
}
var url=_872.url;
var _874="";
if(_872["formNode"]){
var ta=_872.formNode.getAttribute("action");
if((ta)&&(!_872["url"])){
url=ta;
}
var tp=_872.formNode.getAttribute("method");
if((tp)&&(!_872["method"])){
_872.method=tp;
}
_874+=dojo.io.encodeForm(_872.formNode,_872.encoding,_872["formFilter"]);
}
if(url.indexOf("#")>-1){
dojo.debug("Warning: dojo.io.bind: stripping hash values from url:",url);
url=url.split("#")[0];
}
if(_872["file"]){
_872.method="post";
}
if(!_872["method"]){
_872.method="get";
}
if(_872.method.toLowerCase()=="get"){
_872.multipart=false;
}else{
if(_872["file"]){
_872.multipart=true;
}else{
if(!_872["multipart"]){
_872.multipart=false;
}
}
}
if(_872["backButton"]||_872["back"]||_872["changeUrl"]){
dojo.undo.browser.addToHistory(_872);
}
var _877=_872["content"]||{};
if(_872.sendTransport){
_877["dojo.transport"]="xmlhttp";
}
do{
if(_872.postContent){
_874=_872.postContent;
break;
}
if(_877){
_874+=dojo.io.argsFromMap(_877,_872.encoding);
}
if(_872.method.toLowerCase()=="get"||!_872.multipart){
break;
}
var t=[];
if(_874.length){
var q=_874.split("&");
for(var i=0;i<q.length;++i){
if(q[i].length){
var p=q[i].split("=");
t.push("--"+this.multipartBoundary,"Content-Disposition: form-data; name=\""+p[0]+"\"","",p[1]);
}
}
}
if(_872.file){
if(dojo.lang.isArray(_872.file)){
for(var i=0;i<_872.file.length;++i){
var o=_872.file[i];
t.push("--"+this.multipartBoundary,"Content-Disposition: form-data; name=\""+o.name+"\"; filename=\""+("fileName" in o?o.fileName:o.name)+"\"","Content-Type: "+("contentType" in o?o.contentType:"application/octet-stream"),"",o.content);
}
}else{
var o=_872.file;
t.push("--"+this.multipartBoundary,"Content-Disposition: form-data; name=\""+o.name+"\"; filename=\""+("fileName" in o?o.fileName:o.name)+"\"","Content-Type: "+("contentType" in o?o.contentType:"application/octet-stream"),"",o.content);
}
}
if(t.length){
t.push("--"+this.multipartBoundary+"--","");
_874=t.join("\r\n");
}
}while(false);
var _87d=_872["sync"]?false:true;
var _87e=_872["preventCache"]||(this.preventCache==true&&_872["preventCache"]!=false);
var _87f=_872["useCache"]==true||(this.useCache==true&&_872["useCache"]!=false);
if(!_87e&&_87f){
var _880=getFromCache(url,_874,_872.method);
if(_880){
doLoad(_872,_880,url,_874,false);
return;
}
}
var http=dojo.hostenv.getXmlhttpObject(_872);
var _882=false;
if(_87d){
var _883=this.inFlight.push({"req":_872,"http":http,"url":url,"query":_874,"useCache":_87f,"startTime":_872.timeoutSeconds?(new Date()).getTime():0});
this.startWatchingInFlight();
}else{
_852._blockAsync=true;
}
if(_872.method.toLowerCase()=="post"){
if(!_872.user){
http.open("POST",url,_87d);
}else{
http.open("POST",url,_87d,_872.user,_872.password);
}
setHeaders(http,_872);
http.setRequestHeader("Content-Type",_872.multipart?("multipart/form-data; boundary="+this.multipartBoundary):(_872.contentType||"application/x-www-form-urlencoded"));
try{
http.send(_874);
}
catch(e){
if(typeof http.abort=="function"){
http.abort();
}
doLoad(_872,{status:404},url,_874,_87f);
}
}else{
var _884=url;
if(_874!=""){
_884+=(_884.indexOf("?")>-1?"&":"?")+_874;
}
if(_87e){
_884+=(dojo.string.endsWithAny(_884,"?","&")?"":(_884.indexOf("?")>-1?"&":"?"))+"dojo.preventCache="+new Date().valueOf();
}
if(!_872.user){
http.open(_872.method.toUpperCase(),_884,_87d);
}else{
http.open(_872.method.toUpperCase(),_884,_87d,_872.user,_872.password);
}
setHeaders(http,_872);
try{
http.send(null);
}
catch(e){
if(typeof http.abort=="function"){
http.abort();
}
doLoad(_872,{status:404},url,_874,_87f);
}
}
if(!_87d){
doLoad(_872,http,url,_874,_87f);
_852._blockAsync=false;
}
_872.abort=function(){
try{
http._aborted=true;
}
catch(e){
}
return http.abort();
};
return;
};
dojo.io.transports.addTransport("XMLHTTPTransport");
};
}
dojo.provide("dojo.io.cookie");
dojo.io.cookie.setCookie=function(name,_886,days,path,_889,_88a){
var _88b=-1;
if((typeof days=="number")&&(days>=0)){
var d=new Date();
d.setTime(d.getTime()+(days*24*60*60*1000));
_88b=d.toGMTString();
}
_886=escape(_886);
document.cookie=name+"="+_886+";"+(_88b!=-1?" expires="+_88b+";":"")+(path?"path="+path:"")+(_889?"; domain="+_889:"")+(_88a?"; secure":"");
};
dojo.io.cookie.set=dojo.io.cookie.setCookie;
dojo.io.cookie.getCookie=function(name){
var idx=document.cookie.lastIndexOf(name+"=");
if(idx==-1){
return null;
}
var _88f=document.cookie.substring(idx+name.length+1);
var end=_88f.indexOf(";");
if(end==-1){
end=_88f.length;
}
_88f=_88f.substring(0,end);
_88f=unescape(_88f);
return _88f;
};
dojo.io.cookie.get=dojo.io.cookie.getCookie;
dojo.io.cookie.deleteCookie=function(name){
dojo.io.cookie.setCookie(name,"-",0);
};
dojo.io.cookie.setObjectCookie=function(name,obj,days,path,_896,_897,_898){
if(arguments.length==5){
_898=_896;
_896=null;
_897=null;
}
var _899=[],_89a,_89b="";
if(!_898){
_89a=dojo.io.cookie.getObjectCookie(name);
}
if(days>=0){
if(!_89a){
_89a={};
}
for(var prop in obj){
if(obj[prop]==null){
delete _89a[prop];
}else{
if((typeof obj[prop]=="string")||(typeof obj[prop]=="number")){
_89a[prop]=obj[prop];
}
}
}
prop=null;
for(var prop in _89a){
_899.push(escape(prop)+"="+escape(_89a[prop]));
}
_89b=_899.join("&");
}
dojo.io.cookie.setCookie(name,_89b,days,path,_896,_897);
};
dojo.io.cookie.getObjectCookie=function(name){
var _89e=null,_89f=dojo.io.cookie.getCookie(name);
if(_89f){
_89e={};
var _8a0=_89f.split("&");
for(var i=0;i<_8a0.length;i++){
var pair=_8a0[i].split("=");
var _8a3=pair[1];
if(isNaN(_8a3)){
_8a3=unescape(pair[1]);
}
_89e[unescape(pair[0])]=_8a3;
}
}
return _89e;
};
dojo.io.cookie.isSupported=function(){
if(typeof navigator.cookieEnabled!="boolean"){
dojo.io.cookie.setCookie("__TestingYourBrowserForCookieSupport__","CookiesAllowed",90,null);
var _8a4=dojo.io.cookie.getCookie("__TestingYourBrowserForCookieSupport__");
navigator.cookieEnabled=(_8a4=="CookiesAllowed");
if(navigator.cookieEnabled){
this.deleteCookie("__TestingYourBrowserForCookieSupport__");
}
}
return navigator.cookieEnabled;
};
if(!dojo.io.cookies){
dojo.io.cookies=dojo.io.cookie;
}
dojo.kwCompoundRequire({common:["dojo.io.common"],rhino:["dojo.io.RhinoIO"],browser:["dojo.io.BrowserIO","dojo.io.cookie"],dashboard:["dojo.io.BrowserIO","dojo.io.cookie"]});
dojo.provide("dojo.io.*");
dojo.provide("dojo.widget.RichText");
if(!djConfig["useXDomain"]||djConfig["allowXdRichTextSave"]){
if(dojo.hostenv.post_load_){
(function(){
var _8a5=dojo.doc().createElement("textarea");
_8a5.id="dojo.widget.RichText.savedContent";
_8a5.style="display:none;position:absolute;top:-100px;left:-100px;height:3px;width:3px;overflow:hidden;";
dojo.body().appendChild(_8a5);
})();
}else{
try{
dojo.doc().write("<textarea id=\"dojo.widget.RichText.savedContent\" "+"style=\"display:none;position:absolute;top:-100px;left:-100px;height:3px;width:3px;overflow:hidden;\"></textarea>");
}
catch(e){
}
}
}
dojo.widget.defineWidget("dojo.widget.RichText",dojo.widget.HtmlWidget,function(){
this.contentPreFilters=[];
this.contentPostFilters=[];
this.contentDomPreFilters=[];
this.contentDomPostFilters=[];
this.editingAreaStyleSheets=[];
if(dojo.render.html.moz){
this.contentPreFilters.push(this._fixContentForMoz);
}
this.contentPreFilters.push(this._preserveSpecialMarkersPre);
this.contentPostFilters.push(this._preserveSpecialMarkersPost);
this._keyHandlers={};
if(dojo.Deferred){
this.onLoadDeferred=new dojo.Deferred();
}
},{inheritWidth:false,focusOnLoad:false,saveName:"",styleSheets:"",_content:"",height:"",minHeight:"1em",isClosed:true,isLoaded:false,useActiveX:false,relativeImageUrls:false,_SEPARATOR:"@@**%%__RICHTEXTBOUNDRY__%%**@@",onLoadDeferred:null,fillInTemplate:function(){
dojo.event.topic.publish("dojo.widget.RichText::init",this);
this.open();
dojo.event.connect(this,"onKeyPressed",this,"afterKeyPress");
dojo.event.connect(this,"onKeyPress",this,"keyPress");
dojo.event.connect(this,"onKeyDown",this,"keyDown");
dojo.event.connect(this,"onKeyUp",this,"keyUp");
this.setupDefaultShortcuts();
},setupDefaultShortcuts:function(){
var ctrl=this.KEY_CTRL;
var exec=function(cmd,arg){
return arguments.length==1?function(){
this.execCommand(cmd);
}:function(){
this.execCommand(cmd,arg);
};
};
this.addKeyHandler("b",ctrl,exec("bold"));
this.addKeyHandler("i",ctrl,exec("italic"));
this.addKeyHandler("u",ctrl,exec("underline"));
this.addKeyHandler("a",ctrl,exec("selectall"));
this.addKeyHandler("s",ctrl,function(){
this.save(true);
});
this.addKeyHandler("1",ctrl,exec("formatblock","h1"));
this.addKeyHandler("2",ctrl,exec("formatblock","h2"));
this.addKeyHandler("3",ctrl,exec("formatblock","h3"));
this.addKeyHandler("4",ctrl,exec("formatblock","h4"));
this.addKeyHandler("\\",ctrl,exec("insertunorderedlist"));
if(!dojo.render.html.ie){
this.addKeyHandler("Z",ctrl,exec("redo"));
}
},events:["onBlur","onFocus","onKeyPress","onKeyDown","onKeyUp","onClick"],open:function(_8aa){
if(this.onLoadDeferred.fired>=0){
this.onLoadDeferred=new dojo.Deferred();
}
var h=dojo.render.html;
if(!this.isClosed){
this.close();
}
dojo.event.topic.publish("dojo.widget.RichText::open",this);
this._content="";
if((arguments.length==1)&&(_8aa["nodeName"])){
this.domNode=_8aa;
}
if((this.domNode["nodeName"])&&(this.domNode.nodeName.toLowerCase()=="textarea")){
this.textarea=this.domNode;
var html=this._preFilterContent(dojo.string.trim(this.textarea.value));
this.domNode=dojo.doc().createElement("div");
dojo.html.copyStyle(this.domNode,this.textarea);
var _8ad=dojo.lang.hitch(this,function(){
with(this.textarea.style){
display="block";
position="absolute";
left=top="-1000px";
if(h.ie){
this.__overflow=overflow;
overflow="hidden";
}
}
});
if(h.ie){
setTimeout(_8ad,10);
}else{
_8ad();
}
if(!h.safari){
dojo.html.insertBefore(this.domNode,this.textarea);
}
if(this.textarea.form){
dojo.event.connect("before",this.textarea.form,"onsubmit",dojo.lang.hitch(this,function(){
this.textarea.value=this.getEditorContent();
}));
}
var _8ae=this;
dojo.event.connect(this,"postCreate",function(){
dojo.html.insertAfter(_8ae.textarea,_8ae.domNode);
});
}else{
var html=this._preFilterContent(dojo.string.trim(this.domNode.innerHTML));
}
if(html==""){
html="&nbsp;";
}
var _8af=dojo.html.getContentBox(this.domNode);
this._oldHeight=_8af.height;
this._oldWidth=_8af.width;
this._firstChildContributingMargin=this._getContributingMargin(this.domNode,"top");
this._lastChildContributingMargin=this._getContributingMargin(this.domNode,"bottom");
this.savedContent=html;
this.domNode.innerHTML="";
this.editingArea=dojo.doc().createElement("div");
this.domNode.appendChild(this.editingArea);
if((this.domNode["nodeName"])&&(this.domNode.nodeName=="LI")){
this.domNode.innerHTML=" <br>";
}
if(this.saveName!=""&&(!djConfig["useXDomain"]||djConfig["allowXdRichTextSave"])){
var _8b0=dojo.doc().getElementById("dojo.widget.RichText.savedContent");
if(_8b0.value!=""){
var _8b1=_8b0.value.split(this._SEPARATOR);
for(var i=0;i<_8b1.length;i++){
var data=_8b1[i].split(":");
if(data[0]==this.saveName){
html=data[1];
_8b1.splice(i,1);
break;
}
}
}
dojo.event.connect("before",window,"onunload",this,"_saveContent");
}
if(h.ie70&&this.useActiveX){
dojo.debug("activeX in ie70 is not currently supported, useActiveX is ignored for now.");
this.useActiveX=false;
}
if(this.useActiveX&&h.ie){
var self=this;
setTimeout(function(){
self._drawObject(html);
},0);
}else{
if(h.ie||this._safariIsLeopard()||h.opera){
this.iframe=dojo.doc().createElement("iframe");
this.iframe.src="javascript:void(0)";
this.editorObject=this.iframe;
with(this.iframe.style){
border="0";
width="100%";
}
this.iframe.frameBorder=0;
this.editingArea.appendChild(this.iframe);
this.window=this.iframe.contentWindow;
this.document=this.window.document;
this.document.open();
this.document.write("<html><head><style>body{margin:0;padding:0;border:0;overflow:hidden;}</style></head><body><div></div></body></html>");
this.document.close();
this.editNode=this.document.body.firstChild;
this.editNode.contentEditable=true;
with(this.iframe.style){
if(h.ie70){
if(this.height){
height=this.height;
}
if(this.minHeight){
minHeight=this.minHeight;
}
}else{
height=this.height?this.height:this.minHeight;
}
}
var _8b5=["p","pre","address","h1","h2","h3","h4","h5","h6","ol","div","ul"];
var _8b6="";
for(var i in _8b5){
if(_8b5[i].charAt(1)!="l"){
_8b6+="<"+_8b5[i]+"><span>content</span></"+_8b5[i]+">";
}else{
_8b6+="<"+_8b5[i]+"><li>content</li></"+_8b5[i]+">";
}
}
with(this.editNode.style){
position="absolute";
left="-2000px";
top="-2000px";
}
this.editNode.innerHTML=_8b6;
var node=this.editNode.firstChild;
while(node){
dojo.withGlobal(this.window,"selectElement",dojo.html.selection,[node.firstChild]);
var _8b8=node.tagName.toLowerCase();
this._local2NativeFormatNames[_8b8]=this.queryCommandValue("formatblock");
this._native2LocalFormatNames[this._local2NativeFormatNames[_8b8]]=_8b8;
node=node.nextSibling;
}
with(this.editNode.style){
position="";
left="";
top="";
}
this.editNode.innerHTML=html;
if(this.height){
this.document.body.style.overflowY="scroll";
}
dojo.lang.forEach(this.events,function(e){
dojo.event.connect(this.editNode,e.toLowerCase(),this,e);
},this);
this.onLoad();
}else{
this._drawIframe(html);
this.editorObject=this.iframe;
}
}
if(this.domNode.nodeName=="LI"){
this.domNode.lastChild.style.marginTop="-1.2em";
}
dojo.html.addClass(this.domNode,"RichTextEditable");
this.isClosed=false;
},_hasCollapseableMargin:function(_8ba,side){
if(dojo.html.getPixelValue(_8ba,"border-"+side+"-width",false)){
return false;
}else{
if(dojo.html.getPixelValue(_8ba,"padding-"+side,false)){
return false;
}else{
return true;
}
}
},_getContributingMargin:function(_8bc,_8bd){
if(_8bd=="top"){
var _8be="previousSibling";
var _8bf="nextSibling";
var _8c0="firstChild";
var _8c1="margin-top";
var _8c2="margin-bottom";
}else{
var _8be="nextSibling";
var _8bf="previousSibling";
var _8c0="lastChild";
var _8c1="margin-bottom";
var _8c2="margin-top";
}
var _8c3=dojo.html.getPixelValue(_8bc,_8c1,false);
function isSignificantNode(_8c4){
return !(_8c4.nodeType==3&&dojo.string.isBlank(_8c4.data))&&dojo.html.getStyle(_8c4,"display")!="none"&&!dojo.html.isPositionAbsolute(_8c4);
}
var _8c5=0;
var _8c6=_8bc[_8c0];
while(_8c6){
while((!isSignificantNode(_8c6))&&_8c6[_8bf]){
_8c6=_8c6[_8bf];
}
_8c5=Math.max(_8c5,dojo.html.getPixelValue(_8c6,_8c1,false));
if(!this._hasCollapseableMargin(_8c6,_8bd)){
break;
}
_8c6=_8c6[_8c0];
}
if(!this._hasCollapseableMargin(_8bc,_8bd)){
return parseInt(_8c5);
}
var _8c7=0;
var _8c8=_8bc[_8be];
while(_8c8){
if(isSignificantNode(_8c8)){
_8c7=dojo.html.getPixelValue(_8c8,_8c2,false);
break;
}
_8c8=_8c8[_8be];
}
if(!_8c8){
_8c7=dojo.html.getPixelValue(_8bc.parentNode,_8c1,false);
}
if(_8c5>_8c3){
return parseInt(Math.max((_8c5-_8c3)-_8c7,0));
}else{
return 0;
}
},_drawIframe:function(html){
var _8ca=Boolean(dojo.render.html.moz&&(typeof window.XML=="undefined"));
if(!this.iframe){
var _8cb=(new dojo.uri.Uri(dojo.doc().location)).host;
this.iframe=dojo.doc().createElement("iframe");
with(this.iframe){
style.border="none";
style.lineHeight="0";
style.verticalAlign="bottom";
scrolling=this.height?"auto":"no";
}
}
if(djConfig["useXDomain"]&&!djConfig["dojoRichTextFrameUrl"]){
dojo.debug("dojo.widget.RichText: When using cross-domain Dojo builds,"+" please save src/widget/templates/richtextframe.html to your domain and set djConfig.dojoRichTextFrameUrl"+" to the path on your domain to richtextframe.html");
}
this.iframe.src=(djConfig["dojoRichTextFrameUrl"]||dojo.uri.moduleUri("dojo.widget","templates/richtextframe.html"))+((dojo.doc().domain!=_8cb)?("#"+dojo.doc().domain):"");
this.iframe.width=this.inheritWidth?this._oldWidth:"100%";
if(this.height){
this.iframe.style.height=this.height;
}else{
var _8cc=this._oldHeight;
if(this._hasCollapseableMargin(this.domNode,"top")){
_8cc+=this._firstChildContributingMargin;
}
if(this._hasCollapseableMargin(this.domNode,"bottom")){
_8cc+=this._lastChildContributingMargin;
}
this.iframe.height=_8cc;
}
var _8cd=dojo.doc().createElement("div");
_8cd.innerHTML=html;
this.editingArea.appendChild(_8cd);
if(this.relativeImageUrls){
var imgs=_8cd.getElementsByTagName("img");
for(var i=0;i<imgs.length;i++){
imgs[i].src=(new dojo.uri.Uri(dojo.global().location,imgs[i].src)).toString();
}
html=_8cd.innerHTML;
}
var _8d0=dojo.html.firstElement(_8cd);
var _8d1=dojo.html.lastElement(_8cd);
if(_8d0){
_8d0.style.marginTop=this._firstChildContributingMargin+"px";
}
if(_8d1){
_8d1.style.marginBottom=this._lastChildContributingMargin+"px";
}
this.editingArea.appendChild(this.iframe);
if(dojo.render.html.safari){
this.iframe.src=this.iframe.src;
}
var _8d2=false;
var _8d3=dojo.lang.hitch(this,function(){
if(!_8d2){
_8d2=true;
}else{
return;
}
if(!this.editNode){
if(this.iframe.contentWindow){
this.window=this.iframe.contentWindow;
this.document=this.iframe.contentWindow.document;
}else{
if(this.iframe.contentDocument){
this.window=this.iframe.contentDocument.window;
this.document=this.iframe.contentDocument;
}
}
var _8d4=(function(_8d5){
return function(_8d6){
return dojo.html.getStyle(_8d5,_8d6);
};
})(this.domNode);
var font=_8d4("font-weight")+" "+_8d4("font-size")+" "+_8d4("font-family");
var _8d8="1.0";
var _8d9=dojo.html.getUnitValue(this.domNode,"line-height");
if(_8d9.value&&_8d9.units==""){
_8d8=_8d9.value;
}
dojo.html.insertCssText("body,html{background:transparent;padding:0;margin:0;}"+"body{top:0;left:0;right:0;"+(((this.height)||(dojo.render.html.opera))?"":"position:fixed;")+"font:"+font+";"+"min-height:"+this.minHeight+";"+"line-height:"+_8d8+"}"+"p{margin: 1em 0 !important;}"+"body > *:first-child{padding-top:0 !important;margin-top:"+this._firstChildContributingMargin+"px !important;}"+"body > *:last-child{padding-bottom:0 !important;margin-bottom:"+this._lastChildContributingMargin+"px !important;}"+"li > ul:-moz-first-node, li > ol:-moz-first-node{padding-top:1.2em;}\n"+"li{min-height:1.2em;}"+"",this.document);
dojo.html.removeNode(_8cd);
this.document.body.innerHTML=html;
if(_8ca||dojo.render.html.safari){
this.document.designMode="on";
}
this.onLoad();
}else{
dojo.html.removeNode(_8cd);
this.editNode.innerHTML=html;
this.onDisplayChanged();
}
});
if(this.editNode){
_8d3();
}else{
if(dojo.render.html.moz){
this.iframe.onload=function(){
setTimeout(_8d3,250);
};
}else{
this.iframe.onload=_8d3;
}
}
},_applyEditingAreaStyleSheets:function(){
var _8da=[];
if(this.styleSheets){
_8da=this.styleSheets.split(";");
this.styleSheets="";
}
_8da=_8da.concat(this.editingAreaStyleSheets);
this.editingAreaStyleSheets=[];
if(_8da.length>0){
for(var i=0;i<_8da.length;i++){
var url=_8da[i];
if(url){
this.addStyleSheet(dojo.uri.dojoUri(url));
}
}
}
},addStyleSheet:function(uri){
var url=uri.toString();
if(dojo.lang.find(this.editingAreaStyleSheets,url)>-1){
dojo.debug("dojo.widget.RichText.addStyleSheet: Style sheet "+url+" is already applied to the editing area!");
return;
}
if(url.charAt(0)=="."||(url.charAt(0)!="/"&&!uri.host)){
url=(new dojo.uri.Uri(dojo.global().location,url)).toString();
}
this.editingAreaStyleSheets.push(url);
if(this.document.createStyleSheet){
this.document.createStyleSheet(url);
}else{
var head=this.document.getElementsByTagName("head")[0];
var _8e0=this.document.createElement("link");
with(_8e0){
rel="stylesheet";
type="text/css";
href=url;
}
head.appendChild(_8e0);
}
},removeStyleSheet:function(uri){
var url=uri.toString();
if(url.charAt(0)=="."||(url.charAt(0)!="/"&&!uri.host)){
url=(new dojo.uri.Uri(dojo.global().location,url)).toString();
}
var _8e3=dojo.lang.find(this.editingAreaStyleSheets,url);
if(_8e3==-1){
dojo.debug("dojo.widget.RichText.removeStyleSheet: Style sheet "+url+" is not applied to the editing area so it can not be removed!");
return;
}
delete this.editingAreaStyleSheets[_8e3];
var _8e4=this.document.getElementsByTagName("link");
for(var i=0;i<_8e4.length;i++){
if(_8e4[i].href==url){
if(dojo.render.html.ie){
_8e4[i].href="";
}
dojo.html.removeNode(_8e4[i]);
break;
}
}
},_drawObject:function(html){
this.object=dojo.html.createExternalElement(dojo.doc(),"object");
with(this.object){
classid="clsid:2D360201-FFF5-11D1-8D03-00A0C959BC0A";
width=this.inheritWidth?this._oldWidth:"100%";
style.height=this.height?this.height:(this._oldHeight+"px");
Scrollbars=this.height?true:false;
Appearance=this._activeX.appearance.flat;
}
this.editorObject=this.object;
this.editingArea.appendChild(this.object);
this.object.attachEvent("DocumentComplete",dojo.lang.hitch(this,"onLoad"));
dojo.lang.forEach(this.events,function(e){
this.object.attachEvent(e.toLowerCase(),dojo.lang.hitch(this,e));
},this);
this.object.DocumentHTML="<!doctype HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">"+"<html><title></title>"+"<style type=\"text/css\">"+"    body,html { padding: 0; margin: 0; }"+(this.height?"":"    body,  { overflow: hidden; }")+"</style>"+"<body><div>"+html+"<div></body></html>";
this._cacheLocalBlockFormatNames();
},_local2NativeFormatNames:{},_native2LocalFormatNames:{},_cacheLocalBlockFormatNames:function(){
if(!this._native2LocalFormatNames["p"]){
var obj=this.object;
var _8e9=false;
if(!obj){
try{
obj=dojo.html.createExternalElement(dojo.doc(),"object");
obj.classid="clsid:2D360201-FFF5-11D1-8D03-00A0C959BC0A";
dojo.body().appendChild(obj);
obj.DocumentHTML="<html><head></head><body></body></html>";
}
catch(e){
_8e9=true;
}
}
try{
var _8ea=new ActiveXObject("DEGetBlockFmtNamesParam.DEGetBlockFmtNamesParam");
obj.ExecCommand(this._activeX.command["getblockformatnames"],0,_8ea);
var _8eb=new VBArray(_8ea.Names);
var _8ec=_8eb.toArray();
var _8ed=["p","pre","address","h1","h2","h3","h4","h5","h6","ol","ul","","","","","div"];
for(var i=0;i<_8ed.length;++i){
if(_8ed[i].length>0){
this._local2NativeFormatNames[_8ec[i]]=_8ed[i];
this._native2LocalFormatNames[_8ed[i]]=_8ec[i];
}
}
}
catch(e){
_8e9=true;
}
if(obj&&!this.object){
dojo.body().removeChild(obj);
}
}
return !_8e9;
},_isResized:function(){
return false;
},onLoad:function(e){
this.isLoaded=true;
if(this.object){
this.document=this.object.DOM;
this.window=this.document.parentWindow;
this.editNode=this.document.body.firstChild;
this.editingArea.style.height=this.height?this.height:this.minHeight;
if(!this.height){
this.connect(this,"onDisplayChanged","_updateHeight");
}
this.window._frameElement=this.object;
}else{
if(this.iframe&&!dojo.render.html.ie){
this.editNode=this.document.body;
if(!this.height){
this.connect(this,"onDisplayChanged","_updateHeight");
}
try{
this.document.execCommand("useCSS",false,true);
this.document.execCommand("styleWithCSS",false,false);
}
catch(e2){
}
if(dojo.render.html.safari){
this.connect(this.editNode,"onblur","onBlur");
this.connect(this.editNode,"onfocus","onFocus");
this.connect(this.editNode,"onclick","onFocus");
this.interval=setInterval(dojo.lang.hitch(this,"onDisplayChanged"),750);
}else{
if(dojo.render.html.mozilla||dojo.render.html.opera){
var doc=this.document;
var _8f1=dojo.event.browser.addListener;
var self=this;
dojo.lang.forEach(this.events,function(e){
var l=_8f1(self.document,e.substr(2).toLowerCase(),dojo.lang.hitch(self,e));
if(e=="onBlur"){
var _8f5={unBlur:function(e){
dojo.event.browser.removeListener(doc,"blur",l);
}};
dojo.event.connect("before",self,"close",_8f5,"unBlur");
}
});
}
}
}else{
if(dojo.render.html.ie){
if(!this.height){
this.connect(this,"onDisplayChanged","_updateHeight");
}
this.editNode.style.zoom=1;
}
}
}
this._applyEditingAreaStyleSheets();
if(this.focusOnLoad){
this.focus();
}
this.onDisplayChanged(e);
if(this.onLoadDeferred){
this.onLoadDeferred.callback(true);
}
},onKeyDown:function(e){
if((!e)&&(this.object)){
e=dojo.event.browser.fixEvent(this.window.event);
}
if((dojo.render.html.ie)&&(e.keyCode==e.KEY_TAB)){
e.preventDefault();
e.stopPropagation();
this.execCommand((e.shiftKey?"outdent":"indent"));
}else{
if(dojo.render.html.ie){
if((65<=e.keyCode)&&(e.keyCode<=90)){
e.charCode=e.keyCode;
this.onKeyPress(e);
}
}
}
},onKeyUp:function(e){
return;
},KEY_CTRL:1,onKeyPress:function(e){
if((!e)&&(this.object)){
e=dojo.event.browser.fixEvent(this.window.event);
}
var _8fa=e.ctrlKey?this.KEY_CTRL:0;
if(this._keyHandlers[e.key]){
var _8fb=this._keyHandlers[e.key],i=0,_8fd;
while(_8fd=_8fb[i++]){
if(_8fa==_8fd.modifiers){
e.preventDefault();
_8fd.handler.call(this);
break;
}
}
}
dojo.lang.setTimeout(this,this.onKeyPressed,1,e);
},addKeyHandler:function(key,_8ff,_900){
if(!(this._keyHandlers[key] instanceof Array)){
this._keyHandlers[key]=[];
}
this._keyHandlers[key].push({modifiers:_8ff||0,handler:_900});
},onKeyPressed:function(e){
this.onDisplayChanged();
if(this.textarea){
this.textarea.value=this._postFilterContent(this.editNode.innerHTML);
}
},onClick:function(e){
this.onDisplayChanged(e);
},onBlur:function(e){
},_initialFocus:true,onFocus:function(e){
if((dojo.render.html.mozilla)&&(this._initialFocus)){
this._initialFocus=false;
if(dojo.string.trim(this.editNode.innerHTML)=="&nbsp;"){
this.placeCursorAtStart();
}
}
},blur:function(){
if(this.iframe){
this.window.blur();
}else{
if(this.object){
this.document.body.blur();
}else{
if(this.editNode){
this.editNode.blur();
}
}
}
},focus:function(){
if(this.iframe&&!dojo.render.html.ie){
this.window.focus();
}else{
if(this.object){
this.document.focus();
}else{
if(this.editNode&&this.editNode.focus){
this.editNode.focus();
}else{
dojo.debug("Have no idea how to focus into the editor!");
}
}
}
},onDisplayChanged:function(e){
},_activeX:{command:{bold:5000,italic:5023,underline:5048,justifycenter:5024,justifyleft:5025,justifyright:5026,cut:5003,copy:5002,paste:5032,"delete":5004,undo:5049,redo:5033,removeformat:5034,selectall:5035,unlink:5050,indent:5018,outdent:5031,insertorderedlist:5030,insertunorderedlist:5051,inserttable:5022,insertcell:5019,insertcol:5020,insertrow:5021,deletecells:5005,deletecols:5006,deleterows:5007,mergecells:5029,splitcell:5047,setblockformat:5043,getblockformat:5011,getblockformatnames:5012,setfontname:5044,getfontname:5013,setfontsize:5045,getfontsize:5014,setbackcolor:5042,getbackcolor:5010,setforecolor:5046,getforecolor:5015,findtext:5008,font:5009,hyperlink:5016,image:5017,lockelement:5027,makeabsolute:5028,sendbackward:5036,bringforward:5037,sendbelowtext:5038,bringabovetext:5039,sendtoback:5040,bringtofront:5041,properties:5052},ui:{"default":0,prompt:1,noprompt:2},status:{notsupported:0,disabled:1,enabled:3,latched:7,ninched:11},appearance:{flat:0,inset:1},state:{unchecked:0,checked:1,gray:2}},_normalizeCommand:function(cmd){
var drh=dojo.render.html;
var _908=cmd.toLowerCase();
if(_908=="formatblock"){
if(drh.safari){
_908="heading";
}
}else{
if(this.object){
switch(_908){
case "createlink":
_908="hyperlink";
break;
case "insertimage":
_908="image";
break;
}
}else{
if(_908=="hilitecolor"&&!drh.mozilla){
_908="backcolor";
}
}
}
return _908;
},_safariIsLeopard:function(){
var _909=false;
if(dojo.render.html.safari){
var tmp=dojo.render.html.UA.split("AppleWebKit/")[1];
var ver=parseFloat(tmp.split(" ")[0]);
if(ver>=420){
_909=true;
}
}
return _909;
},queryCommandAvailable:function(_90c){
var ie=1;
var _90e=1<<1;
var _90f=1<<2;
var _910=1<<3;
var _911=1<<4;
var _912=this._safariIsLeopard();
function isSupportedBy(_913){
return {ie:Boolean(_913&ie),mozilla:Boolean(_913&_90e),safari:Boolean(_913&_90f),safari420:Boolean(_913&_911),opera:Boolean(_913&_910)};
}
var _914=null;
switch(_90c.toLowerCase()){
case "bold":
case "italic":
case "underline":
case "subscript":
case "superscript":
case "fontname":
case "fontsize":
case "forecolor":
case "hilitecolor":
case "justifycenter":
case "justifyfull":
case "justifyleft":
case "justifyright":
case "delete":
case "selectall":
_914=isSupportedBy(_90e|ie|_90f|_910);
break;
case "createlink":
case "unlink":
case "removeformat":
case "inserthorizontalrule":
case "insertimage":
case "insertorderedlist":
case "insertunorderedlist":
case "indent":
case "outdent":
case "formatblock":
case "inserthtml":
case "undo":
case "redo":
case "strikethrough":
_914=isSupportedBy(_90e|ie|_910|_911);
break;
case "blockdirltr":
case "blockdirrtl":
case "dirltr":
case "dirrtl":
case "inlinedirltr":
case "inlinedirrtl":
_914=isSupportedBy(ie);
break;
case "cut":
case "copy":
case "paste":
_914=isSupportedBy(ie|_90e|_911);
break;
case "inserttable":
_914=isSupportedBy(_90e|(this.object?ie:0));
break;
case "insertcell":
case "insertcol":
case "insertrow":
case "deletecells":
case "deletecols":
case "deleterows":
case "mergecells":
case "splitcell":
_914=isSupportedBy(this.object?ie:0);
break;
default:
return false;
}
return (dojo.render.html.ie&&_914.ie)||(dojo.render.html.mozilla&&_914.mozilla)||(dojo.render.html.safari&&_914.safari)||(_912&&_914.safari420)||(dojo.render.html.opera&&_914.opera);
},execCommand:function(_915,_916){
var _917;
this.focus();
_915=this._normalizeCommand(_915);
if(_916!=undefined){
if(_915=="heading"){
throw new Error("unimplemented");
}else{
if(_915=="formatblock"){
if(this.object){
_916=this._native2LocalFormatNames[_916];
}else{
if(dojo.render.html.ie){
_916="<"+_916+">";
}
}
}
}
}
if(this.object){
switch(_915){
case "hilitecolor":
_915="setbackcolor";
break;
case "forecolor":
case "backcolor":
case "fontsize":
case "fontname":
_915="set"+_915;
break;
case "formatblock":
_915="setblockformat";
}
if(_915=="strikethrough"){
_915="inserthtml";
var _918=this.document.selection.createRange();
if(!_918.htmlText){
return;
}
_916=_918.htmlText.strike();
}else{
if(_915=="inserthorizontalrule"){
_915="inserthtml";
_916="<hr>";
}
}
if(_915=="inserthtml"){
var _918=this.document.selection.createRange();
if(this.document.selection.type.toUpperCase()=="CONTROL"){
for(var i=0;i<_918.length;i++){
_918.item(i).outerHTML=_916;
}
}else{
_918.pasteHTML(_916);
_918.select();
}
_917=true;
}else{
if(arguments.length==1){
_917=this.object.ExecCommand(this._activeX.command[_915],this._activeX.ui.noprompt);
}else{
_917=this.object.ExecCommand(this._activeX.command[_915],this._activeX.ui.noprompt,_916);
}
}
}else{
if(_915=="inserthtml"){
if(dojo.render.html.ie){
var _91a=this.document.selection.createRange();
_91a.pasteHTML(_916);
_91a.select();
return true;
}else{
return this.document.execCommand(_915,false,_916);
}
}else{
if((_915=="unlink")&&(this.queryCommandEnabled("unlink"))&&(dojo.render.html.mozilla)){
var _91b=this.window.getSelection();
var _91c=_91b.getRangeAt(0);
var _91d=_91c.startContainer;
var _91e=_91c.startOffset;
var _91f=_91c.endContainer;
var _920=_91c.endOffset;
var a=dojo.withGlobal(this.window,"getAncestorElement",dojo.html.selection,["a"]);
dojo.withGlobal(this.window,"selectElement",dojo.html.selection,[a]);
_917=this.document.execCommand("unlink",false,null);
var _91c=this.document.createRange();
_91c.setStart(_91d,_91e);
_91c.setEnd(_91f,_920);
_91b.removeAllRanges();
_91b.addRange(_91c);
return _917;
}else{
if((_915=="hilitecolor")&&(dojo.render.html.mozilla)){
this.document.execCommand("useCSS",false,false);
_917=this.document.execCommand(_915,false,_916);
this.document.execCommand("useCSS",false,true);
}else{
if((dojo.render.html.ie)&&((_915=="backcolor")||(_915=="forecolor"))){
_916=arguments.length>1?_916:null;
_917=this.document.execCommand(_915,false,_916);
}else{
_916=arguments.length>1?_916:null;
if(_916||_915!="createlink"){
_917=this.document.execCommand(_915,false,_916);
}
}
}
}
}
}
this.onDisplayChanged();
return _917;
},queryCommandEnabled:function(_922){
_922=this._normalizeCommand(_922);
if(this.object){
switch(_922){
case "hilitecolor":
_922="setbackcolor";
break;
case "forecolor":
case "backcolor":
case "fontsize":
case "fontname":
_922="set"+_922;
break;
case "formatblock":
_922="setblockformat";
break;
case "strikethrough":
_922="bold";
break;
case "inserthorizontalrule":
return true;
}
if(typeof this._activeX.command[_922]=="undefined"){
return false;
}
var _923=this.object.QueryStatus(this._activeX.command[_922]);
return ((_923!=this._activeX.status.notsupported)&&(_923!=this._activeX.status.disabled));
}else{
if(dojo.render.html.mozilla){
if(_922=="unlink"){
return dojo.withGlobal(this.window,"hasAncestorElement",dojo.html.selection,["a"]);
}else{
if(_922=="inserttable"){
return true;
}
}
}
var elem=(dojo.render.html.ie)?this.document.selection.createRange():this.document;
return elem.queryCommandEnabled(_922);
}
},queryCommandState:function(_925){
_925=this._normalizeCommand(_925);
if(this.object){
if(_925=="forecolor"){
_925="setforecolor";
}else{
if(_925=="backcolor"){
_925="setbackcolor";
}else{
if(_925=="strikethrough"){
return dojo.withGlobal(this.window,"hasAncestorElement",dojo.html.selection,["strike"]);
}else{
if(_925=="inserthorizontalrule"){
return false;
}
}
}
}
if(typeof this._activeX.command[_925]=="undefined"){
return null;
}
var _926=this.object.QueryStatus(this._activeX.command[_925]);
return ((_926==this._activeX.status.latched)||(_926==this._activeX.status.ninched));
}else{
return this.document.queryCommandState(_925);
}
},queryCommandValue:function(_927){
_927=this._normalizeCommand(_927);
if(this.object){
switch(_927){
case "forecolor":
case "backcolor":
case "fontsize":
case "fontname":
_927="get"+_927;
return this.object.execCommand(this._activeX.command[_927],this._activeX.ui.noprompt);
case "formatblock":
var _928=this.object.execCommand(this._activeX.command["getblockformat"],this._activeX.ui.noprompt);
if(_928){
return this._local2NativeFormatNames[_928];
}
}
}else{
if(dojo.render.html.ie&&_927=="formatblock"){
return this._local2NativeFormatNames[this.document.queryCommandValue(_927)]||this.document.queryCommandValue(_927);
}
return this.document.queryCommandValue(_927);
}
},placeCursorAtStart:function(){
this.focus();
if(dojo.render.html.moz&&this.editNode.firstChild&&this.editNode.firstChild.nodeType!=dojo.dom.TEXT_NODE){
dojo.withGlobal(this.window,"selectElementChildren",dojo.html.selection,[this.editNode.firstChild]);
}else{
dojo.withGlobal(this.window,"selectElementChildren",dojo.html.selection,[this.editNode]);
}
dojo.withGlobal(this.window,"collapse",dojo.html.selection,[true]);
},placeCursorAtEnd:function(){
this.focus();
if(dojo.render.html.moz&&this.editNode.lastChild&&this.editNode.lastChild.nodeType!=dojo.dom.TEXT_NODE){
dojo.withGlobal(this.window,"selectElementChildren",dojo.html.selection,[this.editNode.lastChild]);
}else{
dojo.withGlobal(this.window,"selectElementChildren",dojo.html.selection,[this.editNode]);
}
dojo.withGlobal(this.window,"collapse",dojo.html.selection,[false]);
},replaceEditorContent:function(html){
html=this._preFilterContent(html);
if(this.isClosed){
this.domNode.innerHTML=html;
}else{
if(this.window&&this.window.getSelection&&!dojo.render.html.moz){
this.editNode.innerHTML=html;
}else{
if((this.window&&this.window.getSelection)||(this.document&&this.document.selection)){
this.execCommand("selectall");
if(dojo.render.html.moz&&!html){
html="&nbsp;";
}
this.execCommand("inserthtml",html);
}
}
}
},_preFilterContent:function(html){
var ec=html;
dojo.lang.forEach(this.contentPreFilters,function(ef){
ec=ef(ec);
});
if(this.contentDomPreFilters.length>0){
var dom=dojo.doc().createElement("div");
dom.style.display="none";
dojo.body().appendChild(dom);
dom.innerHTML=ec;
dojo.lang.forEach(this.contentDomPreFilters,function(ef){
dom=ef(dom);
});
ec=dom.innerHTML;
dojo.body().removeChild(dom);
}
return ec;
},_postFilterContent:function(html){
var ec=html;
if(this.contentDomPostFilters.length>0){
var dom=this.document.createElement("div");
dom.innerHTML=ec;
dojo.lang.forEach(this.contentDomPostFilters,function(ef){
dom=ef(dom);
});
ec=dom.innerHTML;
}
dojo.lang.forEach(this.contentPostFilters,function(ef){
ec=ef(ec);
});
return ec;
},_lastHeight:0,_updateHeight:function(){
if(!this.isLoaded){
return;
}
if(this.height){
return;
}
var _934=dojo.html.getBorderBox(this.editNode).height;
if(!_934){
_934=dojo.html.getBorderBox(this.document.body).height;
}
if(_934==0){
dojo.debug("Can not figure out the height of the editing area!");
return;
}
this._lastHeight=_934;
this.editorObject.style.height=this._lastHeight+"px";
this.window.scrollTo(0,0);
},_saveContent:function(e){
var _936=dojo.doc().getElementById("dojo.widget.RichText.savedContent");
_936.value+=this._SEPARATOR+this.saveName+":"+this.getEditorContent();
},getEditorContent:function(){
var ec="";
try{
ec=(this._content.length>0)?this._content:this.editNode.innerHTML;
if(dojo.string.trim(ec)=="&nbsp;"){
ec="";
}
}
catch(e){
}
if(dojo.render.html.ie&&!this.object){
var re=new RegExp("(?:<p>&nbsp;</p>[\n\r]*)+$","i");
ec=ec.replace(re,"");
}
ec=this._postFilterContent(ec);
if(this.relativeImageUrls){
var _939=dojo.global().location.protocol+"//"+dojo.global().location.host;
var _93a=dojo.global().location.pathname;
if(_93a.match(/\/$/)){
}else{
var _93b=_93a.split("/");
if(_93b.length){
_93b.pop();
}
_93a=_93b.join("/")+"/";
}
var _93c=new RegExp("(<img[^>]* src=[\"'])("+_939+"("+_93a+")?)","ig");
ec=ec.replace(_93c,"$1");
}
return ec;
},close:function(save,_93e){
if(this.isClosed){
return false;
}
if(arguments.length==0){
save=true;
}
this._content=this._postFilterContent(this.editNode.innerHTML);
var _93f=(this.savedContent!=this._content);
if(this.interval){
clearInterval(this.interval);
}
if(dojo.render.html.ie&&!this.object){
dojo.event.browser.clean(this.editNode);
}
if(this.iframe){
delete this.iframe;
}
if(this.textarea){
with(this.textarea.style){
position="";
left=top="";
if(dojo.render.html.ie){
overflow=this.__overflow;
this.__overflow=null;
}
}
if(save){
this.textarea.value=this._content;
}else{
this.textarea.value=this.savedContent;
}
dojo.html.removeNode(this.domNode);
this.domNode=this.textarea;
}else{
if(save){
if(dojo.render.html.moz){
var nc=dojo.doc().createElement("span");
this.domNode.appendChild(nc);
nc.innerHTML=this.editNode.innerHTML;
}else{
this.domNode.innerHTML=this._content;
}
}else{
this.domNode.innerHTML=this.savedContent;
}
}
dojo.html.removeClass(this.domNode,"RichTextEditable");
this.isClosed=true;
this.isLoaded=false;
delete this.editNode;
if(this.window._frameElement){
this.window._frameElement=null;
}
this.window=null;
this.document=null;
this.object=null;
this.editingArea=null;
this.editorObject=null;
return _93f;
},destroyRendering:function(){
},destroy:function(){
this.destroyRendering();
if(!this.isClosed){
this.close(false);
}
dojo.widget.RichText.superclass.destroy.call(this);
},connect:function(_941,_942,_943){
dojo.event.connect(_941,_942,this,_943);
},disconnect:function(_944,_945,_946){
dojo.event.disconnect(_944,_945,this,_946);
},disconnectAllWithRoot:function(_947){
dojo.deprecated("disconnectAllWithRoot","is deprecated. No need to disconnect manually","0.5");
},_fixContentForMoz:function(html){
html=html.replace(/<strong([ \>])/gi,"<b$1");
html=html.replace(/<\/strong>/gi,"</b>");
html=html.replace(/<em([ \>])/gi,"<i$1");
html=html.replace(/<\/em>/gi,"</i>");
return html;
},_preserveSpecialMarkersPre:function(html){
html=html.replace(/<script(.*?)>/gi,"&lt;script$1&gt;");
html=html.replace(/<\/script>/gi,"&lt;/script&gt;");
return html;
},_preserveSpecialMarkersPost:function(html){
html=html.replace(/&lt;%/gi,"<%");
html=html.replace(/%&gt;/gi,"%>");
html=html.replace(/&lt;#/gi,"<#");
html=html.replace(/#&gt;/gi,"#>");
html=html.replace(/%3c#%20/gi,"<# ");
html=html.replace(/%20#%3e/gi," #>");
html=html.replace(/%3c#/gi,"<#" );
html=html.replace(/#%3e/gi,"#>");
html=html.replace(/\=&gt;/gi,"=>");
html=html.replace(/&lt;script(.*?)&gt;/gi,"<script$1>");
html=html.replace(/&lt;\/script&gt;/gi,"</script>");
return html;
}});
dojo.provide("dojo.lang.type");
dojo.lang.whatAmI=function(_94b){
dojo.deprecated("dojo.lang.whatAmI","use dojo.lang.getType instead","0.5");
return dojo.lang.getType(_94b);
};
dojo.lang.whatAmI.custom={};
dojo.lang.getType=function(_94c){
try{
if(dojo.lang.isArray(_94c)){
return "array";
}
if(dojo.lang.isFunction(_94c)){
return "function";
}
if(dojo.lang.isString(_94c)){
return "string";
}
if(dojo.lang.isNumber(_94c)){
return "number";
}
if(dojo.lang.isBoolean(_94c)){
return "boolean";
}
if(dojo.lang.isAlien(_94c)){
return "alien";
}
if(dojo.lang.isUndefined(_94c)){
return "undefined";
}
for(var name in dojo.lang.whatAmI.custom){
if(dojo.lang.whatAmI.custom[name](_94c)){
return name;
}
}
if(dojo.lang.isObject(_94c)){
return "object";
}
}
catch(e){
}
return "unknown";
};
dojo.lang.isNumeric=function(_94e){
return (!isNaN(_94e)&&isFinite(_94e)&&(_94e!=null)&&!dojo.lang.isBoolean(_94e)&&!dojo.lang.isArray(_94e)&&!/^\s*$/.test(_94e));
};
dojo.lang.isBuiltIn=function(_94f){
return (dojo.lang.isArray(_94f)||dojo.lang.isFunction(_94f)||dojo.lang.isString(_94f)||dojo.lang.isNumber(_94f)||dojo.lang.isBoolean(_94f)||(_94f==null)||(_94f instanceof Error)||(typeof _94f=="error"));
};
dojo.lang.isPureObject=function(_950){
return ((_950!=null)&&dojo.lang.isObject(_950)&&_950.constructor==Object);
};
dojo.lang.isOfType=function(_951,type,_953){
var _954=false;
if(_953){
_954=_953["optional"];
}
if(_954&&((_951===null)||dojo.lang.isUndefined(_951))){
return true;
}
if(dojo.lang.isArray(type)){
var _955=type;
for(var i in _955){
var _957=_955[i];
if(dojo.lang.isOfType(_951,_957)){
return true;
}
}
return false;
}else{
if(dojo.lang.isString(type)){
type=type.toLowerCase();
}
switch(type){
case Array:
case "array":
return dojo.lang.isArray(_951);
case Function:
case "function":
return dojo.lang.isFunction(_951);
case String:
case "string":
return dojo.lang.isString(_951);
case Number:
case "number":
return dojo.lang.isNumber(_951);
case "numeric":
return dojo.lang.isNumeric(_951);
case Boolean:
case "boolean":
return dojo.lang.isBoolean(_951);
case Object:
case "object":
return dojo.lang.isObject(_951);
case "pureobject":
return dojo.lang.isPureObject(_951);
case "builtin":
return dojo.lang.isBuiltIn(_951);
case "alien":
return dojo.lang.isAlien(_951);
case "undefined":
return dojo.lang.isUndefined(_951);
case null:
case "null":
return (_951===null);
case "optional":
dojo.deprecated("dojo.lang.isOfType(value, [type, \"optional\"])","use dojo.lang.isOfType(value, type, {optional: true} ) instead","0.5");
return ((_951===null)||dojo.lang.isUndefined(_951));
default:
if(dojo.lang.isFunction(type)){
return (_951 instanceof type);
}else{
dojo.raise("dojo.lang.isOfType() was passed an invalid type");
}
}
}
dojo.raise("If we get here, it means a bug was introduced above.");
};
dojo.lang.getObject=function(str){
var _959=str.split("."),i=0,obj=dj_global;
do{
obj=obj[_959[i++]];
}while(i<_959.length&&obj);
return (obj!=dj_global)?obj:null;
};
dojo.lang.doesObjectExist=function(str){
var _95d=str.split("."),i=0,obj=dj_global;
do{
obj=obj[_95d[i++]];
}while(i<_95d.length&&obj);
return (obj&&obj!=dj_global);
};
dojo.provide("dojo.lang.assert");
dojo.lang.assert=function(_960,_961){
if(!_960){
var _962="An assert statement failed.\n"+"The method dojo.lang.assert() was called with a 'false' value.\n";
if(_961){
_962+="Here's the assert message:\n"+_961+"\n";
}
throw new Error(_962);
}
};
dojo.lang.assertType=function(_963,type,_965){
if(dojo.lang.isString(_965)){
dojo.deprecated("dojo.lang.assertType(value, type, \"message\")","use dojo.lang.assertType(value, type) instead","0.5");
}
if(!dojo.lang.isOfType(_963,type,_965)){
if(!dojo.lang.assertType._errorMessage){
dojo.lang.assertType._errorMessage="Type mismatch: dojo.lang.assertType() failed.";
}
dojo.lang.assert(false,dojo.lang.assertType._errorMessage);
}
};
dojo.lang.assertValidKeywords=function(_966,_967,_968){
var key;
if(!_968){
if(!dojo.lang.assertValidKeywords._errorMessage){
dojo.lang.assertValidKeywords._errorMessage="In dojo.lang.assertValidKeywords(), found invalid keyword:";
}
_968=dojo.lang.assertValidKeywords._errorMessage;
}
if(dojo.lang.isArray(_967)){
for(key in _966){
if(!dojo.lang.inArray(_967,key)){
dojo.lang.assert(false,_968+" "+key);
}
}
}else{
for(key in _966){
if(!(key in _967)){
dojo.lang.assert(false,_968+" "+key);
}
}
}
};
dojo.provide("dojo.AdapterRegistry");
dojo.AdapterRegistry=function(_96a){
this.pairs=[];
this.returnWrappers=_96a||false;
};
dojo.lang.extend(dojo.AdapterRegistry,{register:function(name,_96c,wrap,_96e,_96f){
var type=(_96f)?"unshift":"push";
this.pairs[type]([name,_96c,wrap,_96e]);
},match:function(){
for(var i=0;i<this.pairs.length;i++){
var pair=this.pairs[i];
if(pair[1].apply(this,arguments)){
if((pair[3])||(this.returnWrappers)){
return pair[2];
}else{
return pair[2].apply(this,arguments);
}
}
}
throw new Error("No match found");
},unregister:function(name){
for(var i=0;i<this.pairs.length;i++){
var pair=this.pairs[i];
if(pair[0]==name){
this.pairs.splice(i,1);
return true;
}
}
return false;
}});
dojo.provide("dojo.lang.repr");
dojo.lang.reprRegistry=new dojo.AdapterRegistry();
dojo.lang.registerRepr=function(name,_977,wrap,_979){
dojo.lang.reprRegistry.register(name,_977,wrap,_979);
};
dojo.lang.repr=function(obj){
if(typeof (obj)=="undefined"){
return "undefined";
}else{
if(obj===null){
return "null";
}
}
try{
if(typeof (obj["__repr__"])=="function"){
return obj["__repr__"]();
}else{
if((typeof (obj["repr"])=="function")&&(obj.repr!=arguments.callee)){
return obj["repr"]();
}
}
return dojo.lang.reprRegistry.match(obj);
}
catch(e){
if(typeof (obj.NAME)=="string"&&(obj.toString==Function.prototype.toString||obj.toString==Object.prototype.toString)){
return obj.NAME;
}
}
if(typeof (obj)=="function"){
obj=(obj+"").replace(/^\s+/,"");
var idx=obj.indexOf("{");
if(idx!=-1){
obj=obj.substr(0,idx)+"{...}";
}
}
return obj+"";
};
dojo.lang.reprArrayLike=function(arr){
try{
var na=dojo.lang.map(arr,dojo.lang.repr);
return "["+na.join(", ")+"]";
}
catch(e){
}
};
(function(){
var m=dojo.lang;
m.registerRepr("arrayLike",m.isArrayLike,m.reprArrayLike);
m.registerRepr("string",m.isString,m.reprString);
m.registerRepr("numbers",m.isNumber,m.reprNumber);
m.registerRepr("boolean",m.isBoolean,m.reprNumber);
})();
dojo.kwCompoundRequire({common:["dojo.lang.common","dojo.lang.assert","dojo.lang.array","dojo.lang.type","dojo.lang.func","dojo.lang.extras","dojo.lang.repr","dojo.lang.declare"]});
dojo.provide("dojo.lang.*");
dojo.provide("dojo.html.iframe");
dojo.html.iframeContentWindow=function(_97f){
var win=dojo.html.getDocumentWindow(dojo.html.iframeContentDocument(_97f))||dojo.html.iframeContentDocument(_97f).__parent__||(_97f.name&&document.frames[_97f.name])||null;
return win;
};
dojo.html.iframeContentDocument=function(_981){
var doc=_981.contentDocument||((_981.contentWindow)&&(_981.contentWindow.document))||((_981.name)&&(document.frames[_981.name])&&(document.frames[_981.name].document))||null;
return doc;
};
dojo.html.BackgroundIframe=function(node){
if(dojo.render.html.ie55||dojo.render.html.ie60){
var html="<iframe src='javascript:false'"+" style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;"+"z-index: -1; filter:Alpha(Opacity=\"0\");' "+">";
this.iframe=dojo.doc().createElement(html);
this.iframe.tabIndex=-1;
if(node){
node.appendChild(this.iframe);
this.domNode=node;
}else{
dojo.body().appendChild(this.iframe);
this.iframe.style.display="none";
}
}
};
dojo.lang.extend(dojo.html.BackgroundIframe,{iframe:null,onResized:function(){
if(this.iframe&&this.domNode&&this.domNode.parentNode){
var _985=dojo.html.getMarginBox(this.domNode);
if(_985.width==0||_985.height==0){
dojo.lang.setTimeout(this,this.onResized,100);
return;
}
this.iframe.style.width=_985.width+"px";
this.iframe.style.height=_985.height+"px";
}
},size:function(node){
if(!this.iframe){
return;
}
var _987=dojo.html.toCoordinateObject(node,true,dojo.html.boxSizing.BORDER_BOX);
with(this.iframe.style){
width=_987.width+"px";
height=_987.height+"px";
left=_987.left+"px";
top=_987.top+"px";
}
},setZIndex:function(node){
if(!this.iframe){
return;
}
if(dojo.dom.isNode(node)){
this.iframe.style.zIndex=dojo.html.getStyle(node,"z-index")-1;
}else{
if(!isNaN(node)){
this.iframe.style.zIndex=node;
}
}
},show:function(){
if(this.iframe){
this.iframe.style.display="block";
}
},hide:function(){
if(this.iframe){
this.iframe.style.display="none";
}
},remove:function(){
if(this.iframe){
dojo.html.removeNode(this.iframe,true);
delete this.iframe;
this.iframe=null;
}
}});
dojo.provide("dojo.widget.PopupContainer");
dojo.declare("dojo.widget.PopupContainerBase",null,function(){
this.queueOnAnimationFinish=[];
},{isShowingNow:false,currentSubpopup:null,beginZIndex:1000,parentPopup:null,parent:null,popupIndex:0,aroundBox:dojo.html.boxSizing.BORDER_BOX,openedForWindow:null,processKey:function(evt){
return false;
},applyPopupBasicStyle:function(){
with(this.domNode.style){
display="none";
position="absolute";
}
},aboutToShow:function(){
},open:function(x,y,_98c,_98d,_98e,_98f){
if(this.isShowingNow){
return;
}
if(this.animationInProgress){
this.queueOnAnimationFinish.push(this.open,arguments);
return;
}
this.aboutToShow();
var _990=false,node,_992;
if(typeof x=="object"){
node=x;
_992=_98d;
_98d=_98c;
_98c=y;
_990=true;
}
this.parent=_98c;
dojo.body().appendChild(this.domNode);
_98d=_98d||_98c["domNode"]||[];
var _993=null;
this.isTopLevel=true;
while(_98c){
if(_98c!==this&&(_98c.setOpenedSubpopup!=undefined&&_98c.applyPopupBasicStyle!=undefined)){
_993=_98c;
this.isTopLevel=false;
_993.setOpenedSubpopup(this);
break;
}
_98c=_98c.parent;
}
this.parentPopup=_993;
this.popupIndex=_993?_993.popupIndex+1:1;
if(this.isTopLevel){
var _994=dojo.html.isNode(_98d)?_98d:null;
dojo.widget.PopupManager.opened(this,_994);
}
if(this.isTopLevel&&!dojo.withGlobal(this.openedForWindow||dojo.global(),dojo.html.selection.isCollapsed)){
this._bookmark=dojo.withGlobal(this.openedForWindow||dojo.global(),dojo.html.selection.getBookmark);
}else{
this._bookmark=null;
}
if(_98d instanceof Array){
_98d={left:_98d[0],top:_98d[1],width:0,height:0};
}
with(this.domNode.style){
display="";
zIndex=this.beginZIndex+this.popupIndex;
}
if(_990){
this.move(node,_98f,_992);
}else{
this.move(x,y,_98f,_98e);
}
this.domNode.style.display="none";
this.explodeSrc=_98d;
this.show();
this.isShowingNow=true;
},move:function(x,y,_997,_998){
var _999=(typeof x=="object");
if(_999){
var _99a=_997;
var node=x;
_997=y;
if(!_99a){
_99a={"BL":"TL","TL":"BL"};
}
dojo.html.placeOnScreenAroundElement(this.domNode,node,_997,this.aroundBox,_99a);
}else{
if(!_998){
_998="TL,TR,BL,BR";
}
dojo.html.placeOnScreen(this.domNode,x,y,_997,true,_998);
}
},close:function(_99c){
if(_99c){
this.domNode.style.display="none";
}
if(this.animationInProgress){
this.queueOnAnimationFinish.push(this.close,[]);
return;
}
this.closeSubpopup(_99c);
this.hide();
if(this.bgIframe){
this.bgIframe.hide();
this.bgIframe.size({left:0,top:0,width:0,height:0});
}
if(this.isTopLevel){
dojo.widget.PopupManager.closed(this);
}
this.isShowingNow=false;
if(this.parent){
setTimeout(dojo.lang.hitch(this,function(){
try{
if(this.parent["focus"]){
this.parent.focus();
}else{
this.parent.domNode.focus();
}
}
catch(e){
dojo.debug("No idea how to focus to parent",e);
}
}),10);
}
if(this._bookmark&&dojo.withGlobal(this.openedForWindow||dojo.global(),dojo.html.selection.isCollapsed)){
if(this.openedForWindow){
this.openedForWindow.focus();
}
try{
dojo.withGlobal(this.openedForWindow||dojo.global(),"moveToBookmark",dojo.html.selection,[this._bookmark]);
}
catch(e){
}
}
this._bookmark=null;
},closeAll:function(_99d){
if(this.parentPopup){
this.parentPopup.closeAll(_99d);
}else{
this.close(_99d);
}
},setOpenedSubpopup:function(_99e){
this.currentSubpopup=_99e;
},closeSubpopup:function(_99f){
if(this.currentSubpopup==null){
return;
}
this.currentSubpopup.close(_99f);
this.currentSubpopup=null;
},onShow:function(){
dojo.widget.PopupContainer.superclass.onShow.apply(this,arguments);
this.openedSize={w:this.domNode.style.width,h:this.domNode.style.height};
if(dojo.render.html.ie){
if(!this.bgIframe){
this.bgIframe=new dojo.html.BackgroundIframe();
this.bgIframe.setZIndex(this.domNode);
}
this.bgIframe.size(this.domNode);
this.bgIframe.show();
}
this.processQueue();
},processQueue:function(){
if(!this.queueOnAnimationFinish.length){
return;
}
var func=this.queueOnAnimationFinish.shift();
var args=this.queueOnAnimationFinish.shift();
func.apply(this,args);
},onHide:function(){
dojo.widget.HtmlWidget.prototype.onHide.call(this);
if(this.openedSize){
with(this.domNode.style){
width=this.openedSize.w;
height=this.openedSize.h;
}
}
this.processQueue();
}});
dojo.widget.defineWidget("dojo.widget.PopupContainer",[dojo.widget.HtmlWidget,dojo.widget.PopupContainerBase],{isContainer:true,fillInTemplate:function(){
this.applyPopupBasicStyle();
dojo.widget.PopupContainer.superclass.fillInTemplate.apply(this,arguments);
}});
dojo.widget.PopupManager=new function(){
this.currentMenu=null;
this.currentButton=null;
this.currentFocusMenu=null;
this.focusNode=null;
this.registeredWindows=[];
this.registerWin=function(win){
if(!win.__PopupManagerRegistered){
dojo.event.connect(win.document,"onmousedown",this,"onClick");
dojo.event.connect(win,"onscroll",this,"onClick");
dojo.event.connect(win.document,"onkey",this,"onKey");
win.__PopupManagerRegistered=true;
this.registeredWindows.push(win);
}
};
this.registerAllWindows=function(_9a3){
if(!_9a3){
_9a3=dojo.html.getDocumentWindow(window.top&&window.top.document||window.document);
}
this.registerWin(_9a3);
for(var i=0;i<_9a3.frames.length;i++){
try{
var win=dojo.html.getDocumentWindow(_9a3.frames[i].document);
if(win){
this.registerAllWindows(win);
}
}
catch(e){
}
}
};
this.unRegisterWin=function(win){
if(win.__PopupManagerRegistered){
dojo.event.disconnect(win.document,"onmousedown",this,"onClick");
dojo.event.disconnect(win,"onscroll",this,"onClick");
dojo.event.disconnect(win.document,"onkey",this,"onKey");
win.__PopupManagerRegistered=false;
}
};
this.unRegisterAllWindows=function(){
for(var i=0;i<this.registeredWindows.length;++i){
this.unRegisterWin(this.registeredWindows[i]);
}
this.registeredWindows=[];
};
dojo.addOnLoad(this,"registerAllWindows");
dojo.addOnUnload(this,"unRegisterAllWindows");
this.closed=function(menu){
if(this.currentMenu==menu){
this.currentMenu=null;
this.currentButton=null;
this.currentFocusMenu=null;
}
};
this.opened=function(menu,_9aa){
if(menu==this.currentMenu){
return;
}
if(this.currentMenu){
this.currentMenu.close();
}
this.currentMenu=menu;
this.currentFocusMenu=menu;
this.currentButton=_9aa;
};
this.setFocusedMenu=function(menu){
this.currentFocusMenu=menu;
};
this.onKey=function(e){
if(!e.key){
return;
}
if(!this.currentMenu||!this.currentMenu.isShowingNow){
return;
}
var m=this.currentFocusMenu;
while(m){
if(m.processKey(e)){
e.preventDefault();
e.stopPropagation();
break;
}
m=m.parentPopup||m.parentMenu;
}
},this.onClick=function(e){
if(!this.currentMenu){
return;
}
var _9af=dojo.html.getScroll().offset;
var m=this.currentMenu;
while(m){
if(dojo.html.overElement(m.domNode,e)||dojo.html.isDescendantOf(e.target,m.domNode)){
return;
}
m=m.currentSubpopup;
}
if(this.currentButton&&dojo.html.overElement(this.currentButton,e)){
return;
}
this.currentMenu.closeAll(true);
};
};
dojo.provide("dojo.widget.ColorPalette");
dojo.widget.defineWidget("dojo.widget.ColorPalette",dojo.widget.HtmlWidget,{palette:"7x10",_palettes:{"7x10":[["fff","fcc","fc9","ff9","ffc","9f9","9ff","cff","ccf","fcf"],["ccc","f66","f96","ff6","ff3","6f9","3ff","6ff","99f","f9f"],["c0c0c0","f00","f90","fc6","ff0","3f3","6cc","3cf","66c","c6c"],["999","c00","f60","fc3","fc0","3c0","0cc","36f","63f","c3c"],["666","900","c60","c93","990","090","399","33f","60c","939"],["333","600","930","963","660","060","366","009","339","636"],["000","300","630","633","330","030","033","006","309","303"]],"3x4":[["ffffff","00ff00","008000","0000ff"],["c0c0c0","ffff00","ff00ff","000080"],["808080","ff0000","800080","000000"]]},buildRendering:function(){
this.domNode=document.createElement("table");
dojo.html.disableSelection(this.domNode);
dojo.event.connect(this.domNode,"onmousedown",function(e){
e.preventDefault();
});
with(this.domNode){
cellPadding="0";
cellSpacing="1";
border="1";
style.backgroundColor="white";
}
var _9b2=this._palettes[this.palette];
for(var i=0;i<_9b2.length;i++){
var tr=this.domNode.insertRow(-1);
for(var j=0;j<_9b2[i].length;j++){
if(_9b2[i][j].length==3){
_9b2[i][j]=_9b2[i][j].replace(/(.)(.)(.)/,"$1$1$2$2$3$3");
}
var td=tr.insertCell(-1);
with(td.style){
backgroundColor="#"+_9b2[i][j];
border="1px solid gray";
width=height="15px";
fontSize="1px";
}
td.color="#"+_9b2[i][j];
td.onmouseover=function(e){
this.style.borderColor="white";
};
td.onmouseout=function(e){
this.style.borderColor="gray";
};
dojo.event.connect(td,"onmousedown",this,"onClick");
td.innerHTML="&nbsp;";
}
}
},onClick:function(e){
this.onColorSelect(e.currentTarget.color);
e.currentTarget.style.borderColor="gray";
},onColorSelect:function(_9ba){
}});
dojo.provide("dojo.widget.ContentPane");
dojo.widget.defineWidget("dojo.widget.ContentPane",dojo.widget.HtmlWidget,function(){
this._styleNodes=[];
this._onLoadStack=[];
this._onUnloadStack=[];
this._callOnUnload=false;
this._ioBindObj;
this.scriptScope;
this.bindArgs={};
},{isContainer:true,adjustPaths:true,href:"",extractContent:true,parseContent:true,cacheContent:true,preload:false,refreshOnShow:false,handler:"",executeScripts:false,scriptSeparation:true,loadingMessage:"Loading...",isLoaded:false,postCreate:function(args,frag,_9bd){
if(this.handler!==""){
this.setHandler(this.handler);
}
if(this.isShowing()||this.preload){
this.loadContents();
}
},show:function(){
if(this.refreshOnShow){
this.refresh();
}else{
this.loadContents();
}
dojo.widget.ContentPane.superclass.show.call(this);
},refresh:function(){
this.isLoaded=false;
this.loadContents();
},loadContents:function(){
if(this.isLoaded){
return;
}
if(dojo.lang.isFunction(this.handler)){
this._runHandler();
}else{
if(this.href!=""){
this._downloadExternalContent(this.href,this.cacheContent&&!this.refreshOnShow);
}
}
},setUrl:function(url){
this.href=url;
this.isLoaded=false;
if(this.preload||this.isShowing()){
this.loadContents();
}
},abort:function(){
var bind=this._ioBindObj;
if(!bind||!bind.abort){
return;
}
bind.abort();
delete this._ioBindObj;
},_downloadExternalContent:function(url,_9c1){
this.abort();
this._handleDefaults(this.loadingMessage,"onDownloadStart");
var self=this;
this._ioBindObj=dojo.io.bind(this._cacheSetting({url:url,mimetype:"text/html",handler:function(type,data,xhr){
delete self._ioBindObj;
if(type=="load"){
self.onDownloadEnd.call(self,url,data);
}else{
var e={responseText:xhr.responseText,status:xhr.status,statusText:xhr.statusText,responseHeaders:xhr.getAllResponseHeaders(),text:"Error loading '"+url+"' ("+xhr.status+" "+xhr.statusText+")"};
self._handleDefaults.call(self,e,"onDownloadError");
self.onLoad();
}
}},_9c1));
},_cacheSetting:function(_9c7,_9c8){
for(var x in this.bindArgs){
if(dojo.lang.isUndefined(_9c7[x])){
_9c7[x]=this.bindArgs[x];
}
}
if(dojo.lang.isUndefined(_9c7.useCache)){
_9c7.useCache=_9c8;
}
if(dojo.lang.isUndefined(_9c7.preventCache)){
_9c7.preventCache=!_9c8;
}
if(dojo.lang.isUndefined(_9c7.mimetype)){
_9c7.mimetype="text/html";
}
return _9c7;
},onLoad:function(e){
this._runStack("_onLoadStack");
this.isLoaded=true;
},onUnLoad:function(e){
dojo.deprecated(this.widgetType+".onUnLoad, use .onUnload (lowercased load)",0.5);
},onUnload:function(e){
this._runStack("_onUnloadStack");
delete this.scriptScope;
if(this.onUnLoad!==dojo.widget.ContentPane.prototype.onUnLoad){
this.onUnLoad.apply(this,arguments);
}
},_runStack:function(_9cd){
var st=this[_9cd];
var err="";
var _9d0=this.scriptScope||window;
for(var i=0;i<st.length;i++){
try{
st[i].call(_9d0);
}
catch(e){
err+="\n"+st[i]+" failed: "+e.description;
}
}
this[_9cd]=[];
if(err.length){
var name=(_9cd=="_onLoadStack")?"addOnLoad":"addOnUnLoad";
this._handleDefaults(name+" failure\n "+err,"onExecError","debug");
}
},addOnLoad:function(obj,func){
this._pushOnStack(this._onLoadStack,obj,func);
},addOnUnload:function(obj,func){
this._pushOnStack(this._onUnloadStack,obj,func);
},addOnUnLoad:function(){
dojo.deprecated(this.widgetType+".addOnUnLoad, use addOnUnload instead. (lowercased Load)",0.5);
this.addOnUnload.apply(this,arguments);
},_pushOnStack:function(_9d7,obj,func){
if(typeof func=="undefined"){
_9d7.push(obj);
}else{
_9d7.push(function(){
obj[func]();
});
}
},destroy:function(){
this.onUnload();
dojo.widget.ContentPane.superclass.destroy.call(this);
},onExecError:function(e){
},onContentError:function(e){
},onDownloadError:function(e){
},onDownloadStart:function(e){
},onDownloadEnd:function(url,data){
data=this.splitAndFixPaths(data,url);
this.setContent(data);
},_handleDefaults:function(e,_9e1,_9e2){
if(!_9e1){
_9e1="onContentError";
}
if(dojo.lang.isString(e)){
e={text:e};
}
if(!e.text){
e.text=e.toString();
}
e.toString=function(){
return this.text;
};
if(typeof e.returnValue!="boolean"){
e.returnValue=true;
}
if(typeof e.preventDefault!="function"){
e.preventDefault=function(){
this.returnValue=false;
};
}
this[_9e1](e);
if(e.returnValue){
switch(_9e2){
case true:
case "alert":
alert(e.toString());
break;
case "debug":
dojo.debug(e.toString());
break;
default:
if(this._callOnUnload){
this.onUnload();
}
this._callOnUnload=false;
if(arguments.callee._loopStop){
dojo.debug(e.toString());
}else{
arguments.callee._loopStop=true;
this._setContent(e.toString());
}
}
}
arguments.callee._loopStop=false;
},splitAndFixPaths:function(s,url){
var _9e5=[],_9e6=[],tmp=[];
var _9e8=[],_9e9=[],attr=[],_9eb=[];
var str="",path="",fix="",_9ef="",tag="",_9f1="";
if(!url){
url="./";
}
if(s){
var _9f2=/<title[^>]*>([\s\S]*?)<\/title>/i;
while(_9e8=_9f2.exec(s)){
_9e5.push(_9e8[1]);
s=s.substring(0,_9e8.index)+s.substr(_9e8.index+_9e8[0].length);
}
if(this.adjustPaths){
var _9f3=/<[a-z][a-z0-9]*[^>]*\s(?:(?:src|href|style)=[^>])+[^>]*>/i;
var _9f4=/\s(src|href|style)=(['"]?)([\w()\[\]\/.,\\'"-:;#=&?\s@]+?)\2/i;
var _9f5=/^(?:[#]|(?:(?:https?|ftps?|file|javascript|mailto|news):))/;
while(tag=_9f3.exec(s)){
str+=s.substring(0,tag.index);
s=s.substring((tag.index+tag[0].length),s.length);
tag=tag[0];
_9ef="";
while(attr=_9f4.exec(tag)){
path="";
_9f1=attr[3];
switch(attr[1].toLowerCase()){
case "src":
case "href":
if(_9f5.exec(_9f1)){
path=_9f1;
}else{
path=(new dojo.uri.Uri(url,_9f1).toString());
}
break;
case "style":
path=dojo.html.fixPathsInCssText(_9f1,url);
break;
default:
path=_9f1;
}
fix=" "+attr[1]+"="+attr[2]+path+attr[2];
_9ef+=tag.substring(0,attr.index)+fix;
tag=tag.substring((attr.index+attr[0].length),tag.length);
}
str+=_9ef+tag;
}
s=str+s;
}
_9f2=/(?:<(style)[^>]*>([\s\S]*?)<\/style>|<link ([^>]*rel=['"]?stylesheet['"]?[^>]*)>)/i;
while(_9e8=_9f2.exec(s)){
if(_9e8[1]&&_9e8[1].toLowerCase()=="style"){
_9eb.push(dojo.html.fixPathsInCssText(_9e8[2],url));
}else{
if(attr=_9e8[3].match(/href=(['"]?)([^'">]*)\1/i)){
_9eb.push({path:attr[2]});
}
}
s=s.substring(0,_9e8.index)+s.substr(_9e8.index+_9e8[0].length);
}
var _9f2=/<script([^>]*)>([\s\S]*?)<\/script>/i;
var _9f6=/src=(['"]?)([^"']*)\1/i;
var _9f7=/.*(\bdojo\b\.js(?:\.uncompressed\.js)?)$/;
var _9f8=/(?:var )?\bdjConfig\b(?:[\s]*=[\s]*\{[^}]+\}|\.[\w]*[\s]*=[\s]*[^;\n]*)?;?|dojo\.hostenv\.writeIncludes\(\s*\);?/g;
var _9f9=/dojo\.(?:(?:require(?:After)?(?:If)?)|(?:widget\.(?:manager\.)?registerWidgetPackage)|(?:(?:hostenv\.)?setModulePrefix|registerModulePath)|defineNamespace)\((['"]).*?\1\)\s*;?/;
while(_9e8=_9f2.exec(s)){
if(this.executeScripts&&_9e8[1]){
if(attr=_9f6.exec(_9e8[1])){
if(_9f7.exec(attr[2])){
dojo.debug("Security note! inhibit:"+attr[2]+" from  being loaded again.");
}else{
_9e6.push({path:attr[2]});
}
}
}
if(_9e8[2]){
var sc=_9e8[2].replace(_9f8,"");
if(!sc){
continue;
}
while(tmp=_9f9.exec(sc)){
_9e9.push(tmp[0]);
sc=sc.substring(0,tmp.index)+sc.substr(tmp.index+tmp[0].length);
}
if(this.executeScripts){
_9e6.push(sc);
}
}
s=s.substr(0,_9e8.index)+s.substr(_9e8.index+_9e8[0].length);
}
if(this.extractContent){
_9e8=s.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
if(_9e8){
s=_9e8[1];
}
}
if(this.executeScripts&&this.scriptSeparation){
var _9f2=/(<[a-zA-Z][a-zA-Z0-9]*\s[^>]*?\S=)((['"])[^>]*scriptScope[^>]*>)/;
var _9fb=/([\s'";:\(])scriptScope(.*)/;
str="";
while(tag=_9f2.exec(s)){
tmp=((tag[3]=="'")?"\"":"'");
fix="";
str+=s.substring(0,tag.index)+tag[1];
while(attr=_9fb.exec(tag[2])){
tag[2]=tag[2].substring(0,attr.index)+attr[1]+"dojo.widget.byId("+tmp+this.widgetId+tmp+").scriptScope"+attr[2];
}
str+=tag[2];
s=s.substr(tag.index+tag[0].length);
}
s=str+s;
}
}
return {"xml":s,"styles":_9eb,"titles":_9e5,"requires":_9e9,"scripts":_9e6,"url":url};
},_setContent:function(cont){
this.destroyChildren();
for(var i=0;i<this._styleNodes.length;i++){
if(this._styleNodes[i]&&this._styleNodes[i].parentNode){
this._styleNodes[i].parentNode.removeChild(this._styleNodes[i]);
}
}
this._styleNodes=[];
try{
var node=this.containerNode||this.domNode;
while(node.firstChild){
dojo.html.destroyNode(node.firstChild);
}
if(typeof cont!="string"){
node.appendChild(cont);
}else{
node.innerHTML=cont;
}
}
catch(e){
e.text="Couldn't load content:"+e.description;
this._handleDefaults(e,"onContentError");
}
},setContent:function(data){
this.abort();
if(this._callOnUnload){
this.onUnload();
}
this._callOnUnload=true;
if(!data||dojo.html.isNode(data)){
this._setContent(data);
this.onResized();
this.onLoad();
}else{
if(typeof data.xml!="string"){
this.href="";
data=this.splitAndFixPaths(data);
}
this._setContent(data.xml);
for(var i=0;i<data.styles.length;i++){
if(data.styles[i].path){
this._styleNodes.push(dojo.html.insertCssFile(data.styles[i].path,dojo.doc(),false,true));
}else{
this._styleNodes.push(dojo.html.insertCssText(data.styles[i]));
}
}
if(this.parseContent){
for(var i=0;i<data.requires.length;i++){
try{
eval(data.requires[i]);
}
catch(e){
e.text="ContentPane: error in package loading calls, "+(e.description||e);
this._handleDefaults(e,"onContentError","debug");
}
}
}
var _a01=this;
function asyncParse(){
if(_a01.executeScripts){
_a01._executeScripts(data.scripts);
}
if(_a01.parseContent){
var node=_a01.containerNode||_a01.domNode;
var _a03=new dojo.xml.Parse();
var frag=_a03.parseElement(node,null,true);
dojo.widget.getParser().createSubComponents(frag,_a01);
}
_a01.onResized();
_a01.onLoad();
}
if(dojo.hostenv.isXDomain&&data.requires.length){
dojo.addOnLoad(asyncParse);
}else{
asyncParse();
}
}
},setHandler:function(_a05){
var fcn=dojo.lang.isFunction(_a05)?_a05:window[_a05];
if(!dojo.lang.isFunction(fcn)){
this._handleDefaults("Unable to set handler, '"+_a05+"' not a function.","onExecError",true);
return;
}
this.handler=function(){
return fcn.apply(this,arguments);
};
},_runHandler:function(){
var ret=true;
if(dojo.lang.isFunction(this.handler)){
this.handler(this,this.domNode);
ret=false;
}
this.onLoad();
return ret;
},_executeScripts:function(_a08){
var self=this;
var tmp="",code="";
for(var i=0;i<_a08.length;i++){
if(_a08[i].path){
dojo.io.bind(this._cacheSetting({"url":_a08[i].path,"load":function(type,_a0e){
dojo.lang.hitch(self,tmp=";"+_a0e);
},"error":function(type,_a10){
_a10.text=type+" downloading remote script";
self._handleDefaults.call(self,_a10,"onExecError","debug");
},"mimetype":"text/plain","sync":true},this.cacheContent));
code+=tmp;
}else{
code+=_a08[i];
}
}
try{
if(this.scriptSeparation){
delete this.scriptScope;
this.scriptScope=new (new Function("_container_",code+"; return this;"))(self);
}else{
var djg=dojo.global();
if(djg.execScript){
djg.execScript(code);
}else{
var djd=dojo.doc();
var sc=djd.createElement("script");
sc.appendChild(djd.createTextNode(code));
(this.containerNode||this.domNode).appendChild(sc);
}
}
}
catch(e){
e.text="Error running scripts from content:\n"+e.description;
this._handleDefaults(e,"onExecError","debug");
}
}});
dojo.provide("dojo.widget.Editor2Toolbar");
dojo.lang.declare("dojo.widget.HandlerManager",null,function(){
this._registeredHandlers=[];
},{registerHandler:function(obj,func){
if(arguments.length==2){
this._registeredHandlers.push(function(){
return obj[func].apply(obj,arguments);
});
}else{
this._registeredHandlers.push(obj);
}
},removeHandler:function(func){
for(var i=0;i<this._registeredHandlers.length;i++){
if(func===this._registeredHandlers[i]){
delete this._registeredHandlers[i];
return;
}
}
dojo.debug("HandlerManager handler "+func+" is not registered, can not remove.");
},destroy:function(){
for(var i=0;i<this._registeredHandlers.length;i++){
delete this._registeredHandlers[i];
}
}});
dojo.widget.Editor2ToolbarItemManager=new dojo.widget.HandlerManager;
dojo.lang.mixin(dojo.widget.Editor2ToolbarItemManager,{getToolbarItem:function(name){
var item;
name=name.toLowerCase();
for(var i=0;i<this._registeredHandlers.length;i++){
item=this._registeredHandlers[i](name);
if(item){
return item;
}
}
switch(name){
case "bold":
case "copy":
case "cut":
case "delete":
case "indent":
case "inserthorizontalrule":
case "insertorderedlist":
case "insertunorderedlist":
case "italic":
case "justifycenter":
case "justifyfull":
case "justifyleft":
case "justifyright":
case "outdent":
case "paste":
case "redo":
case "removeformat":
case "selectall":
case "strikethrough":
case "subscript":
case "superscript":
case "underline":
case "undo":
case "unlink":
case "createlink":
case "insertimage":
case "htmltoggle":
item=new dojo.widget.Editor2ToolbarButton(name);
break;
case "forecolor":
case "hilitecolor":
item=new dojo.widget.Editor2ToolbarColorPaletteButton(name);
break;
case "plainformatblock":
item=new dojo.widget.Editor2ToolbarFormatBlockPlainSelect("formatblock");
break;
case "formatblock":
item=new dojo.widget.Editor2ToolbarFormatBlockSelect("formatblock");
break;
case "fontsize":
item=new dojo.widget.Editor2ToolbarFontSizeSelect("fontsize");
break;
case "fontname":
item=new dojo.widget.Editor2ToolbarFontNameSelect("fontname");
break;
case "inserttable":
case "insertcell":
case "insertcol":
case "insertrow":
case "deletecells":
case "deletecols":
case "deleterows":
case "mergecells":
case "splitcell":
dojo.debug(name+" is implemented in dojo.widget.Editor2Plugin.TableOperation, please require it first.");
break;
case "inserthtml":
case "blockdirltr":
case "blockdirrtl":
case "dirltr":
case "dirrtl":
case "inlinedirltr":
case "inlinedirrtl":
dojo.debug("Not yet implemented toolbar item: "+name);
break;
default:
dojo.debug("dojo.widget.Editor2ToolbarItemManager.getToolbarItem: Unknown toolbar item: "+name);
}
return item;
}});
dojo.addOnUnload(dojo.widget.Editor2ToolbarItemManager,"destroy");
dojo.declare("dojo.widget.Editor2ToolbarButton",null,function(name){
this._name=name;
},{create:function(node,_a1e,_a1f){
this._domNode=node;
var cmd=_a1e.parent.getCommand(this._name);
if(cmd){
this._domNode.title=cmd.getText();
}
this.disableSelection(this._domNode);
this._parentToolbar=_a1e;
dojo.event.connect(this._domNode,"onclick",this,"onClick");
if(!_a1f){
dojo.event.connect(this._domNode,"onmouseover",this,"onMouseOver");
dojo.event.connect(this._domNode,"onmouseout",this,"onMouseOut");
}
},disableSelection:function(_a21){
dojo.html.disableSelection(_a21);
var _a22=_a21.all||_a21.getElementsByTagName("*");
for(var x=0;x<_a22.length;x++){
dojo.html.disableSelection(_a22[x]);
}
},onMouseOver:function(){
var _a24=dojo.widget.Editor2Manager.getCurrentInstance();
if(_a24){
var _a25=_a24.getCommand(this._name);
if(_a25&&_a25.getState()!=dojo.widget.Editor2Manager.commandState.Disabled){
this.highlightToolbarItem();
}
}
},onMouseOut:function(){
this.unhighlightToolbarItem();
},destroy:function(){
this._domNode=null;
this._parentToolbar=null;
},onClick:function(e){
if(this._domNode&&!this._domNode.disabled&&this._parentToolbar.checkAvailability()){
e.preventDefault();
e.stopPropagation();
var _a27=dojo.widget.Editor2Manager.getCurrentInstance();
if(_a27){
var _a28=_a27.getCommand(this._name);
if(_a28){
_a28.execute();
}
}
}
},refreshState:function(){
var _a29=dojo.widget.Editor2Manager.getCurrentInstance();
var em=dojo.widget.Editor2Manager;
if(_a29){
var _a2b=_a29.getCommand(this._name);
if(_a2b){
var _a2c=_a2b.getState();
if(_a2c!=this._lastState){
switch(_a2c){
case em.commandState.Latched:
this.latchToolbarItem();
break;
case em.commandState.Enabled:
this.enableToolbarItem();
break;
case em.commandState.Disabled:
default:
this.disableToolbarItem();
}
this._lastState=_a2c;
}
}
}
return em.commandState.Enabled;
},latchToolbarItem:function(){
this._domNode.disabled=false;
this.removeToolbarItemStyle(this._domNode);
dojo.html.addClass(this._domNode,this._parentToolbar.ToolbarLatchedItemStyle);
},enableToolbarItem:function(){
this._domNode.disabled=false;
this.removeToolbarItemStyle(this._domNode);
dojo.html.addClass(this._domNode,this._parentToolbar.ToolbarEnabledItemStyle);
},disableToolbarItem:function(){
this._domNode.disabled=true;
this.removeToolbarItemStyle(this._domNode);
dojo.html.addClass(this._domNode,this._parentToolbar.ToolbarDisabledItemStyle);
},highlightToolbarItem:function(){
dojo.html.addClass(this._domNode,this._parentToolbar.ToolbarHighlightedItemStyle);
},unhighlightToolbarItem:function(){
dojo.html.removeClass(this._domNode,this._parentToolbar.ToolbarHighlightedItemStyle);
},removeToolbarItemStyle:function(){
dojo.html.removeClass(this._domNode,this._parentToolbar.ToolbarEnabledItemStyle);
dojo.html.removeClass(this._domNode,this._parentToolbar.ToolbarLatchedItemStyle);
dojo.html.removeClass(this._domNode,this._parentToolbar.ToolbarDisabledItemStyle);
this.unhighlightToolbarItem();
}});
dojo.declare("dojo.widget.Editor2ToolbarDropDownButton",dojo.widget.Editor2ToolbarButton,{onClick:function(){
if(this._domNode&&!this._domNode.disabled&&this._parentToolbar.checkAvailability()){
if(!this._dropdown){
this._dropdown=dojo.widget.createWidget("PopupContainer",{});
this._domNode.appendChild(this._dropdown.domNode);
}
if(this._dropdown.isShowingNow){
this._dropdown.close();
}else{
this.onDropDownShown();
this._dropdown.open(this._domNode,null,this._domNode);
}
}
},destroy:function(){
this.onDropDownDestroy();
if(this._dropdown){
this._dropdown.destroy();
}
dojo.widget.Editor2ToolbarDropDownButton.superclass.destroy.call(this);
},onDropDownShown:function(){
},onDropDownDestroy:function(){
}});
dojo.declare("dojo.widget.Editor2ToolbarColorPaletteButton",dojo.widget.Editor2ToolbarDropDownButton,{onDropDownShown:function(){
if(!this._colorpalette){
this._colorpalette=dojo.widget.createWidget("ColorPalette",{});
this._dropdown.addChild(this._colorpalette);
this.disableSelection(this._dropdown.domNode);
this.disableSelection(this._colorpalette.domNode);
dojo.event.connect(this._colorpalette,"onColorSelect",this,"setColor");
dojo.event.connect(this._dropdown,"open",this,"latchToolbarItem");
dojo.event.connect(this._dropdown,"close",this,"enableToolbarItem");
}
},setColor:function(_a2d){
this._dropdown.close();
var _a2e=dojo.widget.Editor2Manager.getCurrentInstance();
if(_a2e){
var _a2f=_a2e.getCommand(this._name);
if(_a2f){
_a2f.execute(_a2d);
}
}
}});
dojo.declare("dojo.widget.Editor2ToolbarFormatBlockPlainSelect",dojo.widget.Editor2ToolbarButton,{create:function(node,_a31){
this._domNode=node;
this._parentToolbar=_a31;
this._domNode=node;
this.disableSelection(this._domNode);
dojo.event.connect(this._domNode,"onchange",this,"onChange");
},destroy:function(){
this._domNode=null;
},onChange:function(){
if(this._parentToolbar.checkAvailability()){
var sv=this._domNode.value.toLowerCase();
var _a33=dojo.widget.Editor2Manager.getCurrentInstance();
if(_a33){
var _a34=_a33.getCommand(this._name);
if(_a34){
_a34.execute(sv);
}
}
}
},refreshState:function(){
if(this._domNode){
dojo.widget.Editor2ToolbarFormatBlockPlainSelect.superclass.refreshState.call(this);
var _a35=dojo.widget.Editor2Manager.getCurrentInstance();
if(_a35){
var _a36=_a35.getCommand(this._name);
if(_a36){
var _a37=_a36.getValue();
if(!_a37){
_a37="";
}
dojo.lang.forEach(this._domNode.options,function(item){
if(item.value.toLowerCase()==_a37.toLowerCase()){
item.selected=true;
}
});
}
}
}
}});
dojo.declare("dojo.widget.Editor2ToolbarComboItem",dojo.widget.Editor2ToolbarDropDownButton,{href:null,create:function(node,_a3a){
dojo.widget.Editor2ToolbarComboItem.superclass.create.apply(this,arguments);
if(!this._contentPane){
this._contentPane=dojo.widget.createWidget("ContentPane",{preload:"true"});
this._contentPane.addOnLoad(this,"setup");
this._contentPane.setUrl(this.href);
}
},onMouseOver:function(e){
if(this._lastState!=dojo.widget.Editor2Manager.commandState.Disabled){
dojo.html.addClass(e.currentTarget,this._parentToolbar.ToolbarHighlightedSelectStyle);
}
},onMouseOut:function(e){
dojo.html.removeClass(e.currentTarget,this._parentToolbar.ToolbarHighlightedSelectStyle);
},onDropDownShown:function(){
if(!this._dropdown.__addedContentPage){
this._dropdown.addChild(this._contentPane);
this._dropdown.__addedContentPage=true;
}
},setup:function(){
},onChange:function(e){
if(this._parentToolbar.checkAvailability()){
var name=e.currentTarget.getAttribute("dropDownItemName");
var _a3f=dojo.widget.Editor2Manager.getCurrentInstance();
if(_a3f){
var _a40=_a3f.getCommand(this._name);
if(_a40){
_a40.execute(name);
}
}
}
this._dropdown.close();
},onMouseOverItem:function(e){
dojo.html.addClass(e.currentTarget,this._parentToolbar.ToolbarHighlightedSelectItemStyle);
},onMouseOutItem:function(e){
dojo.html.removeClass(e.currentTarget,this._parentToolbar.ToolbarHighlightedSelectItemStyle);
}});
dojo.declare("dojo.widget.Editor2ToolbarFormatBlockSelect",dojo.widget.Editor2ToolbarComboItem,{href:dojo.uri.moduleUri("dojo.widget","templates/Editor2/EditorToolbar_FormatBlock.html"),setup:function(){
dojo.widget.Editor2ToolbarFormatBlockSelect.superclass.setup.call(this);
var _a43=this._contentPane.domNode.all||this._contentPane.domNode.getElementsByTagName("*");
this._blockNames={};
this._blockDisplayNames={};
for(var x=0;x<_a43.length;x++){
var node=_a43[x];
dojo.html.disableSelection(node);
var name=node.getAttribute("dropDownItemName");
if(name){
this._blockNames[name]=node;
var _a47=node.getElementsByTagName(name);
this._blockDisplayNames[name]=_a47[_a47.length-1].innerHTML;
}
}
for(var name in this._blockNames){
dojo.event.connect(this._blockNames[name],"onclick",this,"onChange");
dojo.event.connect(this._blockNames[name],"onmouseover",this,"onMouseOverItem");
dojo.event.connect(this._blockNames[name],"onmouseout",this,"onMouseOutItem");
}
},onDropDownDestroy:function(){
if(this._blockNames){
for(var name in this._blockNames){
delete this._blockNames[name];
delete this._blockDisplayNames[name];
}
}
},refreshState:function(){
dojo.widget.Editor2ToolbarFormatBlockSelect.superclass.refreshState.call(this);
if(this._lastState!=dojo.widget.Editor2Manager.commandState.Disabled){
var _a49=dojo.widget.Editor2Manager.getCurrentInstance();
if(_a49){
var _a4a=_a49.getCommand(this._name);
if(_a4a){
var _a4b=_a4a.getValue();
if(_a4b==this._lastSelectedFormat&&this._blockDisplayNames){
return this._lastState;
}
this._lastSelectedFormat=_a4b;
var _a4c=this._domNode.getElementsByTagName("label")[0];
var _a4d=false;
if(this._blockDisplayNames){
for(var name in this._blockDisplayNames){
if(name==_a4b){
_a4c.innerHTML=this._blockDisplayNames[name];
_a4d=true;
break;
}
}
if(!_a4d){
_a4c.innerHTML="&nbsp;";
}
}
}
}
}
return this._lastState;
}});
dojo.declare("dojo.widget.Editor2ToolbarFontSizeSelect",dojo.widget.Editor2ToolbarComboItem,{href:dojo.uri.moduleUri("dojo.widget","templates/Editor2/EditorToolbar_FontSize.html"),setup:function(){
dojo.widget.Editor2ToolbarFormatBlockSelect.superclass.setup.call(this);
var _a4f=this._contentPane.domNode.all||this._contentPane.domNode.getElementsByTagName("*");
this._fontsizes={};
this._fontSizeDisplayNames={};
for(var x=0;x<_a4f.length;x++){
var node=_a4f[x];
dojo.html.disableSelection(node);
var name=node.getAttribute("dropDownItemName");
if(name){
this._fontsizes[name]=node;
this._fontSizeDisplayNames[name]=node.getElementsByTagName("font")[0].innerHTML;
}
}
for(var name in this._fontsizes){
dojo.event.connect(this._fontsizes[name],"onclick",this,"onChange");
dojo.event.connect(this._fontsizes[name],"onmouseover",this,"onMouseOverItem");
dojo.event.connect(this._fontsizes[name],"onmouseout",this,"onMouseOutItem");
}
},onDropDownDestroy:function(){
if(this._fontsizes){
for(var name in this._fontsizes){
delete this._fontsizes[name];
delete this._fontSizeDisplayNames[name];
}
}
},refreshState:function(){
dojo.widget.Editor2ToolbarFormatBlockSelect.superclass.refreshState.call(this);
if(this._lastState!=dojo.widget.Editor2Manager.commandState.Disabled){
var _a54=dojo.widget.Editor2Manager.getCurrentInstance();
if(_a54){
var _a55=_a54.getCommand(this._name);
if(_a55){
var size=_a55.getValue();
if(size==this._lastSelectedSize&&this._fontSizeDisplayNames){
return this._lastState;
}
this._lastSelectedSize=size;
var _a57=this._domNode.getElementsByTagName("label")[0];
var _a58=false;
if(this._fontSizeDisplayNames){
for(var name in this._fontSizeDisplayNames){
if(name==size){
_a57.innerHTML=this._fontSizeDisplayNames[name];
_a58=true;
break;
}
}
if(!_a58){
_a57.innerHTML="&nbsp;";
}
}
}
}
}
return this._lastState;
}});
dojo.declare("dojo.widget.Editor2ToolbarFontNameSelect",dojo.widget.Editor2ToolbarFontSizeSelect,{href:dojo.uri.moduleUri("dojo.widget","templates/Editor2/EditorToolbar_FontName.html")});
dojo.widget.defineWidget("dojo.widget.Editor2Toolbar",dojo.widget.HtmlWidget,function(){
dojo.event.connect(this,"fillInTemplate",dojo.lang.hitch(this,function(){
if(dojo.render.html.ie){
this.domNode.style.zoom=1;
}
}));
},{templateString:"<div dojoAttachPoint=\"domNode\" class=\"EditorToolbarDomNode\" unselectable=\"on\">\n\t<table cellpadding=\"3\" cellspacing=\"0\" border=\"0\">\n\t\t<!--\n\t\t\tour toolbar should look something like:\n\n\t\t\t+=======+=======+=======+=============================================+\n\t\t\t| w   w | style | copy  | bo | it | un | le | ce | ri |\n\t\t\t| w w w | style |=======|==============|==============|\n\t\t\t|  w w  | style | paste |  undo | redo | change style |\n\t\t\t+=======+=======+=======+=============================================+\n\t\t-->\n\t\t<tbody>\n\t\t\t<tr valign=\"top\">\n\t\t\t\t<td rowspan=\"2\">\n\t\t\t\t\t<div class=\"bigIcon\" dojoAttachPoint=\"wikiWordButton\"\n\t\t\t\t\t\tdojoOnClick=\"wikiWordClick; buttonClick;\">\n\t\t\t\t\t\t<span style=\"font-size: 30px; margin-left: 5px;\">\n\t\t\t\t\t\t\tW\n\t\t\t\t\t\t</span>\n\t\t\t\t\t</div>\n\t\t\t\t</td>\n\t\t\t\t<td rowspan=\"2\">\n\t\t\t\t\t<div class=\"bigIcon\" dojoAttachPoint=\"styleDropdownButton\"\n\t\t\t\t\t\tdojoOnClick=\"styleDropdownClick; buttonClick;\">\n\t\t\t\t\t\t<span unselectable=\"on\"\n\t\t\t\t\t\t\tstyle=\"font-size: 30px; margin-left: 5px;\">\n\t\t\t\t\t\t\tS\n\t\t\t\t\t\t</span>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"StyleDropdownContainer\" style=\"display: none;\"\n\t\t\t\t\t\tdojoAttachPoint=\"styleDropdownContainer\">\n\t\t\t\t\t\t<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\"\n\t\t\t\t\t\t\theight=\"100%\" width=\"100%\">\n\t\t\t\t\t\t\t<tr valign=\"top\">\n\t\t\t\t\t\t\t\t<td rowspan=\"2\">\n\t\t\t\t\t\t\t\t\t<div style=\"height: 245px; overflow: auto;\">\n\t\t\t\t\t\t\t\t\t\t<div class=\"headingContainer\"\n\t\t\t\t\t\t\t\t\t\t\tunselectable=\"on\"\n\t\t\t\t\t\t\t\t\t\t\tdojoOnClick=\"normalTextClick\">normal</div>\n\t\t\t\t\t\t\t\t\t\t<h1 class=\"headingContainer\"\n\t\t\t\t\t\t\t\t\t\t\tunselectable=\"on\"\n\t\t\t\t\t\t\t\t\t\t\tdojoOnClick=\"h1TextClick\">Heading 1</h1>\n\t\t\t\t\t\t\t\t\t\t<h2 class=\"headingContainer\"\n\t\t\t\t\t\t\t\t\t\t\tunselectable=\"on\"\n\t\t\t\t\t\t\t\t\t\t\tdojoOnClick=\"h2TextClick\">Heading 2</h2>\n\t\t\t\t\t\t\t\t\t\t<h3 class=\"headingContainer\"\n\t\t\t\t\t\t\t\t\t\t\tunselectable=\"on\"\n\t\t\t\t\t\t\t\t\t\t\tdojoOnClick=\"h3TextClick\">Heading 3</h3>\n\t\t\t\t\t\t\t\t\t\t<h4 class=\"headingContainer\"\n\t\t\t\t\t\t\t\t\t\t\tunselectable=\"on\"\n\t\t\t\t\t\t\t\t\t\t\tdojoOnClick=\"h4TextClick\">Heading 4</h4>\n\t\t\t\t\t\t\t\t\t\t<div class=\"headingContainer\"\n\t\t\t\t\t\t\t\t\t\t\tunselectable=\"on\"\n\t\t\t\t\t\t\t\t\t\t\tdojoOnClick=\"blahTextClick\">blah</div>\n\t\t\t\t\t\t\t\t\t\t<div class=\"headingContainer\"\n\t\t\t\t\t\t\t\t\t\t\tunselectable=\"on\"\n\t\t\t\t\t\t\t\t\t\t\tdojoOnClick=\"blahTextClick\">blah</div>\n\t\t\t\t\t\t\t\t\t\t<div class=\"headingContainer\"\n\t\t\t\t\t\t\t\t\t\t\tunselectable=\"on\"\n\t\t\t\t\t\t\t\t\t\t\tdojoOnClick=\"blahTextClick\">blah</div>\n\t\t\t\t\t\t\t\t\t\t<div class=\"headingContainer\">blah</div>\n\t\t\t\t\t\t\t\t\t\t<div class=\"headingContainer\">blah</div>\n\t\t\t\t\t\t\t\t\t\t<div class=\"headingContainer\">blah</div>\n\t\t\t\t\t\t\t\t\t\t<div class=\"headingContainer\">blah</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t<!--\n\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\t<span class=\"iconContainer\" dojoOnClick=\"buttonClick;\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"icon justifyleft\" \n\t\t\t\t\t\t\t\t\t\t\tstyle=\"float: left;\">&nbsp;</span>\n\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t\t<span class=\"iconContainer\" dojoOnClick=\"buttonClick;\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"icon justifycenter\" \n\t\t\t\t\t\t\t\t\t\t\tstyle=\"float: left;\">&nbsp;</span>\n\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t\t<span class=\"iconContainer\" dojoOnClick=\"buttonClick;\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"icon justifyright\" \n\t\t\t\t\t\t\t\t\t\t\tstyle=\"float: left;\">&nbsp;</span>\n\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t\t<span class=\"iconContainer\" dojoOnClick=\"buttonClick;\">\n\t\t\t\t\t\t\t\t\t\t<span class=\"icon justifyfull\" \n\t\t\t\t\t\t\t\t\t\t\tstyle=\"float: left;\">&nbsp;</span>\n\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t-->\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t<tr valign=\"top\">\n\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\tthud\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t</table>\n\t\t\t\t\t</div>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<!-- copy -->\n\t\t\t\t\t<span class=\"iconContainer\" dojoAttachPoint=\"copyButton\"\n\t\t\t\t\t\tunselectable=\"on\"\n\t\t\t\t\t\tdojoOnClick=\"copyClick; buttonClick;\">\n\t\t\t\t\t\t<span class=\"icon copy\" \n\t\t\t\t\t\t\tunselectable=\"on\"\n\t\t\t\t\t\t\tstyle=\"float: left;\">&nbsp;</span> copy\n\t\t\t\t\t</span>\n\t\t\t\t\t<!-- \"droppable\" options -->\n\t\t\t\t\t<span class=\"iconContainer\" dojoAttachPoint=\"boldButton\"\n\t\t\t\t\t\tunselectable=\"on\"\n\t\t\t\t\t\tdojoOnClick=\"boldClick; buttonClick;\">\n\t\t\t\t\t\t<span class=\"icon bold\" unselectable=\"on\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t\t<span class=\"iconContainer\" dojoAttachPoint=\"italicButton\"\n\t\t\t\t\t\tdojoOnClick=\"italicClick; buttonClick;\">\n\t\t\t\t\t\t<span class=\"icon italic\" unselectable=\"on\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t\t<span class=\"iconContainer\" dojoAttachPoint=\"underlineButton\"\n\t\t\t\t\t\tdojoOnClick=\"underlineClick; buttonClick;\">\n\t\t\t\t\t\t<span class=\"icon underline\" unselectable=\"on\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t\t<span class=\"iconContainer\" dojoAttachPoint=\"leftButton\"\n\t\t\t\t\t\tdojoOnClick=\"leftClick; buttonClick;\">\n\t\t\t\t\t\t<span class=\"icon justifyleft\" unselectable=\"on\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t\t<span class=\"iconContainer\" dojoAttachPoint=\"fullButton\"\n\t\t\t\t\t\tdojoOnClick=\"fullClick; buttonClick;\">\n\t\t\t\t\t\t<span class=\"icon justifyfull\" unselectable=\"on\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t\t<span class=\"iconContainer\" dojoAttachPoint=\"rightButton\"\n\t\t\t\t\t\tdojoOnClick=\"rightClick; buttonClick;\">\n\t\t\t\t\t\t<span class=\"icon justifyright\" unselectable=\"on\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t</tr>\n\t\t\t<tr>\n\t\t\t\t<td>\n\t\t\t\t\t<!-- paste -->\n\t\t\t\t\t<span class=\"iconContainer\" dojoAttachPoint=\"pasteButton\"\n\t\t\t\t\t\tdojoOnClick=\"pasteClick; buttonClick;\" unselectable=\"on\">\n\t\t\t\t\t\t<span class=\"icon paste\" style=\"float: left;\" unselectable=\"on\">&nbsp;</span> paste\n\t\t\t\t\t</span>\n\t\t\t\t\t<!-- \"droppable\" options -->\n\t\t\t\t\t<span class=\"iconContainer\" dojoAttachPoint=\"undoButton\"\n\t\t\t\t\t\tdojoOnClick=\"undoClick; buttonClick;\" unselectable=\"on\">\n\t\t\t\t\t\t<span class=\"icon undo\" style=\"float: left;\" unselectable=\"on\">&nbsp;</span> undo\n\t\t\t\t\t</span>\n\t\t\t\t\t<span class=\"iconContainer\" dojoAttachPoint=\"redoButton\"\n\t\t\t\t\t\tdojoOnClick=\"redoClick; buttonClick;\" unselectable=\"on\">\n\t\t\t\t\t\t<span class=\"icon redo\" style=\"float: left;\" unselectable=\"on\">&nbsp;</span> redo\n\t\t\t\t\t</span>\n\t\t\t\t</td>\t\n\t\t\t</tr>\n\t\t</tbody>\n\t</table>\n</div>\n",templateCssString:".StyleDropdownContainer {\n\tposition: absolute;\n\tz-index: 1000;\n\toverflow: auto;\n\tcursor: default;\n\twidth: 250px;\n\theight: 250px;\n\tbackground-color: white;\n\tborder: 1px solid black;\n}\n\n.ColorDropdownContainer {\n\tposition: absolute;\n\tz-index: 1000;\n\toverflow: auto;\n\tcursor: default;\n\twidth: 250px;\n\theight: 150px;\n\tbackground-color: white;\n\tborder: 1px solid black;\n}\n\n.RichTextEditable {border:1px solid #C4C4C4;border-top-color:#D2D2D2;}\n\n/*for non-IFRAME (IE)*/\n/*.RichTextEditable td {border:1px dotted #F00;}  */\n\n.label {text-align:right;}\nfieldset {padding:2px;}\nlegend {font-weight: bold;}\n\n.buttonColor {\n  padding: 1px;\n  cursor: default;\n  border: 1px solid;\n  border-color: ButtonHighlight ButtonShadow ButtonShadow ButtonHighlight;\n}\n\n.buttonColor .chooser, .buttonColor .nocolor {\n  height: 0.6em;\n  border: 1px solid;\n  padding: 0px 1em;\n  border-color: ButtonShadow ButtonHighlight ButtonHighlight ButtonShadow;\n}\n\n.buttonColor-hilite {border-color: #000;}\n.buttonColor .nocolor { padding: 0px; }\n.buttonColor .nocolor-hilite { background-color: #fff; color: #f00; }\n\n\n\n.EditorToolbarDomNode {\n\tbackground-image: url(buttons/bg-fade.png);\n\tbackground-repeat: repeat-x;\n\tbackground-position: 0px 95%;\n\tmin-height:22px;\n\tborder-bottom:1px solid #C0C0C0;\n}\n\n.EditorToolbarSmallBg {\n\tbackground-image: url(images/toolbar-bg.gif);\n\tbackground-repeat: repeat-x;\n\tbackground-position: 0px 0px;\n}\n\n/*\nbody {\n\tbackground:url(images/blank.gif) fixed;\n}*/\n\n.IEFixedToolbar {\n\tposition:absolute;\n\t/* top:0; */\n\ttop: expression(eval((document.documentElement||document.body).scrollTop));\n}\n\ndiv.bigIcon {\n\twidth: 40px;\n\theight: 40px; \n\t/* background-color: white; */\n\t/* border: 1px solid #a6a7a3; */\n\tfont-family: Verdana, Trebuchet, Tahoma, Arial;\n}\n\n.iconContainer {\n\tfont-family: Verdana, Trebuchet, Tahoma, Arial;\n\tfont-size: 13px;\n\tfloat: left;\n\theight: 18px;\n\tdisplay: block;\n\t/* background-color: white; */\n\tcursor: pointer;\n\tpadding: 1px 1px 1px 1px; /* almost the same as a transparent border */\n\tmargin-right:2px;\n\tborder: 0px;\n}\n\n.dojoE2TBIcon {\n\tdisplay: block;\n\ttext-align: center;\n\tmin-width: 18px;\n\twidth: 18px;\n\theight: 18px;\n\tbackground-repeat: no-repeat;\n\tbackground-image: url(buttons/aggregate.gif);\n}\n\n.dojoE2TBIcon[class~=dojoE2TBIcon] {\n}\n\n\n.TObar {\n\tborder-top:1px solid #ddd;\n}\n\n.TOBarIcon {\n\tbackground-image: url(buttons/TOaggregate.gif);\n}\n\n.ToolbarButtonLatched {\n    border: #316ac5 1px solid; !important;\n    padding: 0px 0px 0px 0px; !important; /* make room for border */\n\n    background-color: #c1d2ee;\n}\n\n.ToolbarButtonHighlighted {\n    border: #316ac5 1px solid; !important;\n    padding: 0px 0px 0px 0px; !important; /* make room for border */\n    background-color: #dff1ff;\n}\n\n.ToolbarButtonDisabled{\n    filter: gray() alpha(opacity=30); /* IE */\n    opacity: 0.30; /* Safari, Opera and Mozilla */\n}\n\n.headingContainer {\n\twidth: 150px;\n\theight: 30px;\n\tmargin: 0px;\n\t/* padding-left: 5px; */\n\toverflow: hidden;\n\tline-height: 25px;\n\tborder-bottom: 1px solid black;\n\tborder-top: 1px solid white;\n}\n\n.EditorToolbarDomNode select {\n\tfont-size: x-small;\n\twidth:104px;\n}\n\n.Editor_sel_fontname select {width:94px;}\n.Editor_sel_fontsize select {width:46px;}\n\n\n.dojoE2TBIcon_Sep {\n\twidth: 5px; min-width: 5px; max-width: 5px;\n\theight: 20px;\n\tbackground-position: 0px 0px;\n}\n.dojoE2TBIcon_Backcolor { background-position: -18px 0px}\n.dojoE2TBIcon_Bold { background-position: -36px 0px}\n.dojoE2TBIcon_Cancel { background-position: -54px 0px}\n.dojoE2TBIcon_Copy { background-position: -72px 0px}\n.dojoE2TBIcon_Link { background-position: -90px 0px}\n.dojoE2TBIcon_Cut { background-position: -108px 0px}\n.dojoE2TBIcon_Delete { background-position: -126px 0px}\n.dojoE2TBIcon_TextColor { background-position: -144px 0px}\n.dojoE2TBIcon_BackgroundColor { background-position: -162px 0px}\n.dojoE2TBIcon_Indent { background-position: -180px 0px}\n.dojoE2TBIcon_HorizontalLine { background-position: -198px 0px}\n.dojoE2TBIcon_Image { background-position: -216px 0px}\n.dojoE2TBIcon_NumberedList { background-position: -234px 0px}\n.dojoE2TBIcon_Table { background-position: -252px 0px}\n.dojoE2TBIcon_BulletedList { background-position: -270px 0px}\n.dojoE2TBIcon_Italic { background-position: -288px 0px}\n.dojoE2TBIcon_CenterJustify { background-position: -306px 0px}\n.dojoE2TBIcon_BlockJustify { background-position: -324px 0px}\n.dojoE2TBIcon_LeftJustify { background-position: -342px 0px}\n.dojoE2TBIcon_RightJustify { background-position: -360px 0px}\n.dojoE2TBIcon_left_to_right { background-position: -378px 0px}\n.dojoE2TBIcon_list_bullet_indent { background-position: -396px 0px}\n.dojoE2TBIcon_list_bullet_outdent { background-position: -414px 0px}\n.dojoE2TBIcon_list_num_indent { background-position: -432px 0px}\n.dojoE2TBIcon_list_num_outdent { background-position: -450px 0px}\n.dojoE2TBIcon_Outdent { background-position: -468px 0px}\n.dojoE2TBIcon_Paste { background-position: -486px 0px}\n.dojoE2TBIcon_Redo { background-position: -504px 0px}\n.dojoE2TBIcon_RemoveFormat { background-position: -522px 0px}\n.dojoE2TBIcon_right_to_left { background-position: -540px 0px}\n.dojoE2TBIcon_Save { background-position: -558px 0px}\n.dojoE2TBIcon_Space { background-position: -576px 0px}\n.dojoE2TBIcon_StrikeThrough { background-position: -594px 0px}\n.dojoE2TBIcon_Subscript { background-position: -612px 0px}\n.dojoE2TBIcon_Superscript { background-position: -630px 0px}\n.dojoE2TBIcon_Underline { background-position: -648px 0px}\n.dojoE2TBIcon_Undo { background-position: -666px 0px}\n.dojoE2TBIcon_WikiWord { background-position: -684px 0px}\n\n.dojoE2TBIcon_HtmlToggle {background-position: -756px 0}\n.dojoE2TBIcon_InsertHtml {background-position: -774px 0}\n.dojoE2TBIcon_Audio {background-position: -792px 0}\n.dojoE2TBIcon_Video {background-position: -810px 0}\n.dojoE2TBIcon_Interactive {background-position: -828px 0}\n.dojoE2TBIcon_FileManager {background-position: -846px 0}\n.dojoE2TBIcon_BlockQuote {background-position: -900px 0}\n\n.dojoE2TBIcon_insertsymbol_symbol {background-position: -864px 0}\n.dojoE2TBIcon_insertsymbol_smiley {background-position: -882px 0}\n\n.dojoE2TBIcon_BorderColor { background-position: -918px 0px}\n\n.dojoE2TBIcon_tableproperties {background-position: 0 0}\n.dojoE2TBIcon_trproperties {background-position: -18px 0}\n.dojoE2TBIcon_tdproperties {background-position: -36px 0}\n.dojoE2TBIcon_insertrowbelow {background-position: -54px 0}\n.dojoE2TBIcon_insertrowabove {background-position: -72px 0}\n.dojoE2TBIcon_deleterows {background-position: -90px 0}\n.dojoE2TBIcon_insertcolafter {background-position: -108px 0}\n.dojoE2TBIcon_insertcolbefore {background-position: -126px 0}\n.dojoE2TBIcon_deletecols {background-position: -144px 0}\n.dojoE2TBIcon_mergecells {background-position: -162px 0}\n.dojoE2TBIcon_splitcells {background-position: -180px 0}\n.dojoE2TBIcon_splitrows {background-position: -198px 0}\n.dojoE2TBIcon_splitcols {background-position: -216px 0}\n.dojoE2TBIcon_deletetable {background-position: -234px 0}\n.dojoE2TBIcon_toggleth {background-position: -252px 0}\n.dojoE2TBIcon_toggletableborder {background-position: -270px 0}\n\n\n\n\n.SC_Panel\n{\n    overflow: auto;\n    white-space: nowrap;\n    cursor: default;\n    border: 1px solid #8f8f73;\n    padding-left: 2px;\n    padding-right: 2px;\n    background-color: #ffffff;\n}\n\n.SC_Panel, .SC_Panel TD\n{\n    font-size: 11px;\n    font-family: 'Microsoft Sans Serif' , Tahoma, Arial, Verdana, Sans-Serif;\n}\n\n.SC_Item, .SC_ItemSelected\n{\n    margin-top: 2px;\n    margin-bottom: 2px;\n    background-position: left center;\n    padding-left: 11px;\n    padding-right: 3px;\n    padding-top: 2px;\n    padding-bottom: 2px;\n    text-overflow: ellipsis;\n    overflow: hidden;\n    background-repeat: no-repeat;\n    border: #dddddd 1px solid;\n}\n\n.SC_Item *, .SC_ItemSelected *\n{\n    margin-top: 0px;\n    margin-bottom: 0px;\n}\n\n.SC_ItemSelected\n{\n    border: #9a9afb 1px solid;\n    background-image: url(images/toolbar.arrowright.gif);\n}\n\n.ToolbarSelectHighlightedItem\n{\n    border: #316ac5 1px solid;\n}\n\n.SC_Field\n{\n    border: #b7b7c6 1px solid;\n    cursor: default;\n    width: 100px;\n    margin-right:1px;\n}\n\n.SC_FieldCaption\n{\n    overflow: visible;\n    padding-right: 2px;\n    padding-left: 4px;\n\n\tborder: 1px solid #F8F8F8; border-right:none;\n\n\t-moz-border-radius:5px 0 0 5.2px;\n    background-color: #DDD;\n    color:#666;\n\tfont-size:xx-small;\n}\n\n.SC_FieldLabel\n{\n    white-space: nowrap;\n    padding: 2px;\n    width: 100%;\n    cursor: default;\n    background-color: #ffffff;\n    text-overflow: ellipsis;\n    overflow: hidden;\n    font-size:x-small;\n}\n\n.SC_FieldButton\n{\n    background-position: center center;\n    background-repeat: no-repeat;\n    background-image: url(images/toolbar.buttonarrow.gif);\n    border-left: #b7b7c6 1px solid;\n    width: 14px;\n}\n\n.SC_FieldDisabled .SC_FieldButton, .SC_FieldDisabled .SC_FieldCaption\n{\n    opacity: 0.30; /* Safari, Opera and Mozilla */\n    filter: gray() alpha(opacity=30); /* IE */ /* -moz-opacity: 0.30; Mozilla (Old) */\n}\n\n.ToolbarSelectHighlighted\n{\n    border: #316ac5 1px solid;\n}\n\n.ToolbarSelectHighlighted .SC_FieldButton\n{\n    border-left: #316ac5 1px solid;\n}\n",templateCssPath:dojo.uri.moduleUri("dojo.widget","templates/EditorToolbar.css"),ToolbarLatchedItemStyle:"ToolbarButtonLatched",ToolbarEnabledItemStyle:"ToolbarButtonEnabled",ToolbarDisabledItemStyle:"ToolbarButtonDisabled",ToolbarHighlightedItemStyle:"ToolbarButtonHighlighted",ToolbarHighlightedSelectStyle:"ToolbarSelectHighlighted",ToolbarHighlightedSelectItemStyle:"ToolbarSelectHighlightedItem",postCreate:function(){
var _a5a=dojo.html.getElementsByClass("dojoEditorToolbarItem",this.domNode);
this.items={};
for(var x=0;x<_a5a.length;x++){
var node=_a5a[x];
var _a5d=node.getAttribute("dojoETItemName");
if(_a5d){
var item=dojo.widget.Editor2ToolbarItemManager.getToolbarItem(_a5d);
if(item){
item.create(node,this);
this.items[_a5d.toLowerCase()]=item;
}else{
node.style.display="none";
}
}
}
},update:function(){
for(var cmd in this.items){
this.items[cmd].refreshState();
}
},shareGroup:"",checkAvailability:function(){
if(!this.shareGroup){
this.parent.focus();
return true;
}
var _a60=dojo.widget.Editor2Manager.getCurrentInstance();
if(this.shareGroup==_a60.toolbarGroup){
return true;
}
return false;
},destroy:function(){
for(var it in this.items){
this.items[it].destroy();
delete this.items[it];
}
dojo.widget.Editor2Toolbar.superclass.destroy.call(this);
}});
dojo.provide("dojo.uri.cache");
dojo.uri.cache={_cache:{},set:function(uri,_a63){
this._cache[uri.toString()]=_a63;
return uri;
},remove:function(uri){
delete this._cache[uri.toString()];
},get:function(uri){
var key=uri.toString();
var _a67=this._cache[key];
if(!_a67){
_a67=dojo.hostenv.getText(key);
if(_a67){
this._cache[key]=_a67;
}
}
return _a67;
},allow:function(uri){
return uri;
}};
dojo.provide("dojo.lfx.shadow");
dojo.lfx.shadow=function(node){
this.shadowPng=dojo.uri.moduleUri("dojo.html","images/shadow");
this.shadowThickness=8;
this.shadowOffset=15;
this.init(node);
};
dojo.extend(dojo.lfx.shadow,{init:function(node){
this.node=node;
this.pieces={};
var x1=-1*this.shadowThickness;
var y0=this.shadowOffset;
var y1=this.shadowOffset+this.shadowThickness;
this._makePiece("tl","top",y0,"left",x1);
this._makePiece("l","top",y1,"left",x1,"scale");
this._makePiece("tr","top",y0,"left",0);
this._makePiece("r","top",y1,"left",0,"scale");
this._makePiece("bl","top",0,"left",x1);
this._makePiece("b","top",0,"left",0,"crop");
this._makePiece("br","top",0,"left",0);
},_makePiece:function(name,_a6f,_a70,_a71,_a72,_a73){
var img;
var url=this.shadowPng+name.toUpperCase()+".png";
if(dojo.render.html.ie55||dojo.render.html.ie60){
img=dojo.doc().createElement("div");
img.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+url+"'"+(_a73?", sizingMethod='"+_a73+"'":"")+")";
}else{
img=dojo.doc().createElement("img");
img.src=url;
}
img.style.position="absolute";
img.style[_a6f]=_a70+"px";
img.style[_a71]=_a72+"px";
img.style.width=this.shadowThickness+"px";
img.style.height=this.shadowThickness+"px";
this.pieces[name]=img;
this.node.appendChild(img);
},size:function(_a76,_a77){
var _a78=_a77-(this.shadowOffset+this.shadowThickness+1);
if(_a78<0){
_a78=0;
}
if(_a77<1){
_a77=1;
}
if(_a76<1){
_a76=1;
}
with(this.pieces){
l.style.height=_a78+"px";
r.style.height=_a78+"px";
b.style.width=(_a76-1)+"px";
bl.style.top=(_a77-1)+"px";
b.style.top=(_a77-1)+"px";
br.style.top=(_a77-1)+"px";
tr.style.left=(_a76-1)+"px";
r.style.left=(_a76-1)+"px";
br.style.left=(_a76-1)+"px";
}
}});
dojo.provide("dojo.widget.html.layout");
dojo.widget.html.layout=function(_a79,_a7a,_a7b){
dojo.html.addClass(_a79,"dojoLayoutContainer");
_a7a=dojo.lang.filter(_a7a,function(_a7c,idx){
_a7c.idx=idx;
return dojo.lang.inArray(["top","bottom","left","right","client","flood"],_a7c.layoutAlign);
});
if(_a7b&&_a7b!="none"){
var rank=function(_a7f){
switch(_a7f.layoutAlign){
case "flood":
return 1;
case "left":
case "right":
return (_a7b=="left-right")?2:3;
case "top":
case "bottom":
return (_a7b=="left-right")?3:2;
default:
return 4;
}
};
_a7a.sort(function(a,b){
return (rank(a)-rank(b))||(a.idx-b.idx);
});
}
var f={top:dojo.html.getPixelValue(_a79,"padding-top",true),left:dojo.html.getPixelValue(_a79,"padding-left",true)};
dojo.lang.mixin(f,dojo.html.getContentBox(_a79));
dojo.lang.forEach(_a7a,function(_a83){
var elm=_a83.domNode;
var pos=_a83.layoutAlign;
with(elm.style){
left=f.left+"px";
top=f.top+"px";
bottom="auto";
right="auto";
}
dojo.html.addClass(elm,"dojoAlign"+dojo.string.capitalize(pos));
if((pos=="top")||(pos=="bottom")){
dojo.html.setMarginBox(elm,{width:f.width});
var h=dojo.html.getMarginBox(elm).height;
f.height-=h;
if(pos=="top"){
f.top+=h;
}else{
elm.style.top=f.top+f.height+"px";
}
if(_a83.onResized){
_a83.onResized();
}
}else{
if(pos=="left"||pos=="right"){
var w=dojo.html.getMarginBox(elm).width;
if(_a83.resizeTo){
_a83.resizeTo(w,f.height);
}else{
dojo.html.setMarginBox(elm,{width:w,height:f.height});
}
f.width-=w;
if(pos=="left"){
f.left+=w;
}else{
elm.style.left=f.left+f.width+"px";
}
}else{
if(pos=="flood"||pos=="client"){
if(_a83.resizeTo){
_a83.resizeTo(f.width,f.height);
}else{
dojo.html.setMarginBox(elm,{width:f.width,height:f.height});
}
}
}
}
});
};
dojo.html.insertCssText(".dojoLayoutContainer{ position: relative; display: block; overflow: hidden; }\n"+"body .dojoAlignTop, body .dojoAlignBottom, body .dojoAlignLeft, body .dojoAlignRight { position: absolute; overflow: hidden; }\n"+"body .dojoAlignClient { position: absolute }\n"+".dojoAlignClient { overflow: auto; }\n");
dojo.provide("dojo.dnd.DragAndDrop");
dojo.declare("dojo.dnd.DragSource",null,{type:"",onDragEnd:function(evt){
},onDragStart:function(evt){
},onSelected:function(evt){
},unregister:function(){
dojo.dnd.dragManager.unregisterDragSource(this);
},reregister:function(){
dojo.dnd.dragManager.registerDragSource(this);
}});
dojo.declare("dojo.dnd.DragObject",null,{type:"",register:function(){
var dm=dojo.dnd.dragManager;
if(dm["registerDragObject"]){
dm.registerDragObject(this);
}
},onDragStart:function(evt){
},onDragMove:function(evt){
},onDragOver:function(evt){
},onDragOut:function(evt){
},onDragEnd:function(evt){
},onDragLeave:dojo.lang.forward("onDragOut"),onDragEnter:dojo.lang.forward("onDragOver"),ondragout:dojo.lang.forward("onDragOut"),ondragover:dojo.lang.forward("onDragOver")});
dojo.declare("dojo.dnd.DropTarget",null,{acceptsType:function(type){
if(!dojo.lang.inArray(this.acceptedTypes,"*")){
if(!dojo.lang.inArray(this.acceptedTypes,type)){
return false;
}
}
return true;
},accepts:function(_a92){
if(!dojo.lang.inArray(this.acceptedTypes,"*")){
for(var i=0;i<_a92.length;i++){
if(!dojo.lang.inArray(this.acceptedTypes,_a92[i].type)){
return false;
}
}
}
return true;
},unregister:function(){
dojo.dnd.dragManager.unregisterDropTarget(this);
},onDragOver:function(evt){
},onDragOut:function(evt){
},onDragMove:function(evt){
},onDropStart:function(evt){
},onDrop:function(evt){
},onDropEnd:function(){
}},function(){
this.acceptedTypes=[];
});
dojo.dnd.DragEvent=function(){
this.dragSource=null;
this.dragObject=null;
this.target=null;
this.eventStatus="success";
};
dojo.declare("dojo.dnd.DragManager",null,{selectedSources:[],dragObjects:[],dragSources:[],registerDragSource:function(_a99){
},dropTargets:[],registerDropTarget:function(_a9a){
},lastDragTarget:null,currentDragTarget:null,onKeyDown:function(){
},onMouseOut:function(){
},onMouseMove:function(){
},onMouseUp:function(){
}});
dojo.provide("dojo.dnd.HtmlDragManager");
dojo.declare("dojo.dnd.HtmlDragManager",dojo.dnd.DragManager,{disabled:false,nestedTargets:false,mouseDownTimer:null,dsCounter:0,dsPrefix:"dojoDragSource",dropTargetDimensions:[],currentDropTarget:null,previousDropTarget:null,_dragTriggered:false,selectedSources:[],dragObjects:[],dragSources:[],dropTargets:[],currentX:null,currentY:null,lastX:null,lastY:null,mouseDownX:null,mouseDownY:null,threshold:7,dropAcceptable:false,cancelEvent:function(e){
e.stopPropagation();
e.preventDefault();
},registerDragSource:function(ds){
if(ds["domNode"]){
var dp=this.dsPrefix;
var _a9e=dp+"Idx_"+(this.dsCounter++);
ds.dragSourceId=_a9e;
this.dragSources[_a9e]=ds;
ds.domNode.setAttribute(dp,_a9e);
if(dojo.render.html.ie){
dojo.event.browser.addListener(ds.domNode,"ondragstart",this.cancelEvent);
}
}
},unregisterDragSource:function(ds){
if(ds["domNode"]){
var dp=this.dsPrefix;
var _aa1=ds.dragSourceId;
delete ds.dragSourceId;
delete this.dragSources[_aa1];
ds.domNode.setAttribute(dp,null);
if(dojo.render.html.ie){
dojo.event.browser.removeListener(ds.domNode,"ondragstart",this.cancelEvent);
}
}
},registerDropTarget:function(dt){
this.dropTargets.push(dt);
},unregisterDropTarget:function(dt){
var _aa4=dojo.lang.find(this.dropTargets,dt,true);
if(_aa4>=0){
this.dropTargets.splice(_aa4,1);
}
},getDragSource:function(e){
var tn=e.target;
if(tn===dojo.body()){
return;
}
var ta=dojo.html.getAttribute(tn,this.dsPrefix);
while((!ta)&&(tn)){
tn=tn.parentNode;
if((!tn)||(tn===dojo.body())){
return;
}
ta=dojo.html.getAttribute(tn,this.dsPrefix);
}
return this.dragSources[ta];
},onKeyDown:function(e){
},onMouseDown:function(e){
if(this.disabled){
return;
}
if(dojo.render.html.ie){
if(e.button!=1){
return;
}
}else{
if(e.which!=1){
return;
}
}
var _aaa=e.target.nodeType==dojo.html.TEXT_NODE?e.target.parentNode:e.target;
if(dojo.html.isTag(_aaa,"button","textarea","input","select","option")){
return;
}
var ds=this.getDragSource(e);
if(!ds){
return;
}
if(!dojo.lang.inArray(this.selectedSources,ds)){
this.selectedSources.push(ds);
ds.onSelected();
}
this.mouseDownX=e.pageX;
this.mouseDownY=e.pageY;
e.preventDefault();
dojo.event.connect(document,"onmousemove",this,"onMouseMove");
},onMouseUp:function(e,_aad){
if(this.selectedSources.length==0){
return;
}
this.mouseDownX=null;
this.mouseDownY=null;
this._dragTriggered=false;
e.dragSource=this.dragSource;
if((!e.shiftKey)&&(!e.ctrlKey)){
if(this.currentDropTarget){
this.currentDropTarget.onDropStart();
}
dojo.lang.forEach(this.dragObjects,function(_aae){
var ret=null;
if(!_aae){
return;
}
if(this.currentDropTarget){
e.dragObject=_aae;
var ce=this.currentDropTarget.domNode.childNodes;
if(ce.length>0){
e.dropTarget=ce[0];
while(e.dropTarget==_aae.domNode){
e.dropTarget=e.dropTarget.nextSibling;
}
}else{
e.dropTarget=this.currentDropTarget.domNode;
}
if(this.dropAcceptable){
ret=this.currentDropTarget.onDrop(e);
}else{
this.currentDropTarget.onDragOut(e);
}
}
e.dragStatus=this.dropAcceptable&&ret?"dropSuccess":"dropFailure";
dojo.lang.delayThese([function(){
try{
_aae.dragSource.onDragEnd(e);
}
catch(err){
var _ab1={};
for(var i in e){
if(i=="type"){
_ab1.type="mouseup";
continue;
}
_ab1[i]=e[i];
}
_aae.dragSource.onDragEnd(_ab1);
}
},function(){
_aae.onDragEnd(e);
}]);
},this);
this.selectedSources=[];
this.dragObjects=[];
this.dragSource=null;
if(this.currentDropTarget){
this.currentDropTarget.onDropEnd();
}
}else{
}
dojo.event.disconnect(document,"onmousemove",this,"onMouseMove");
this.currentDropTarget=null;
},onScroll:function(){
for(var i=0;i<this.dragObjects.length;i++){
if(this.dragObjects[i].updateDragOffset){
this.dragObjects[i].updateDragOffset();
}
}
if(this.dragObjects.length){
this.cacheTargetLocations();
}
},_dragStartDistance:function(x,y){
if((!this.mouseDownX)||(!this.mouseDownX)){
return;
}
var dx=Math.abs(x-this.mouseDownX);
var dx2=dx*dx;
var dy=Math.abs(y-this.mouseDownY);
var dy2=dy*dy;
return parseInt(Math.sqrt(dx2+dy2),10);
},cacheTargetLocations:function(){
dojo.profile.start("cacheTargetLocations");
this.dropTargetDimensions=[];
dojo.lang.forEach(this.dropTargets,function(_aba){
var tn=_aba.domNode;
if(!tn||!_aba.accepts([this.dragSource])){
return;
}
var abs=dojo.html.getAbsolutePosition(tn,true);
var bb=dojo.html.getBorderBox(tn);
this.dropTargetDimensions.push([[abs.x,abs.y],[abs.x+bb.width,abs.y+bb.height],_aba]);
},this);
dojo.profile.end("cacheTargetLocations");
},onMouseMove:function(e){
if((dojo.render.html.ie)&&(e.button!=1)){
this.currentDropTarget=null;
this.onMouseUp(e,true);
return;
}
if((this.selectedSources.length)&&(!this.dragObjects.length)){
var dx;
var dy;
if(!this._dragTriggered){
this._dragTriggered=(this._dragStartDistance(e.pageX,e.pageY)>this.threshold);
if(!this._dragTriggered){
return;
}
dx=e.pageX-this.mouseDownX;
dy=e.pageY-this.mouseDownY;
}
this.dragSource=this.selectedSources[0];
dojo.lang.forEach(this.selectedSources,function(_ac1){
if(!_ac1){
return;
}
var tdo=_ac1.onDragStart(e);
if(tdo){
tdo.onDragStart(e);
tdo.dragOffset.y+=dy;
tdo.dragOffset.x+=dx;
tdo.dragSource=_ac1;
this.dragObjects.push(tdo);
}
},this);
this.previousDropTarget=null;
this.cacheTargetLocations();
}
dojo.lang.forEach(this.dragObjects,function(_ac3){
if(_ac3){
_ac3.onDragMove(e);
}
});
if(this.currentDropTarget){
var c=dojo.html.toCoordinateObject(this.currentDropTarget.domNode,true);
var dtp=[[c.x,c.y],[c.x+c.width,c.y+c.height]];
}
if((!this.nestedTargets)&&(dtp)&&(this.isInsideBox(e,dtp))){
if(this.dropAcceptable){
this.currentDropTarget.onDragMove(e,this.dragObjects);
}
}else{
var _ac6=this.findBestTarget(e);
if(_ac6.target===null){
if(this.currentDropTarget){
this.currentDropTarget.onDragOut(e);
this.previousDropTarget=this.currentDropTarget;
this.currentDropTarget=null;
}
this.dropAcceptable=false;
return;
}
if(this.currentDropTarget!==_ac6.target){
if(this.currentDropTarget){
this.previousDropTarget=this.currentDropTarget;
this.currentDropTarget.onDragOut(e);
}
this.currentDropTarget=_ac6.target;
e.dragObjects=this.dragObjects;
this.dropAcceptable=this.currentDropTarget.onDragOver(e);
}else{
if(this.dropAcceptable){
this.currentDropTarget.onDragMove(e,this.dragObjects);
}
}
}
},findBestTarget:function(e){
var _ac8=this;
var _ac9=new Object();
_ac9.target=null;
_ac9.points=null;
dojo.lang.every(this.dropTargetDimensions,function(_aca){
if(!_ac8.isInsideBox(e,_aca)){
return true;
}
_ac9.target=_aca[2];
_ac9.points=_aca;
return Boolean(_ac8.nestedTargets);
});
return _ac9;
},isInsideBox:function(e,_acc){
if((e.pageX>_acc[0][0])&&(e.pageX<_acc[1][0])&&(e.pageY>_acc[0][1])&&(e.pageY<_acc[1][1])){
return true;
}
return false;
},onMouseOver:function(e){
},onMouseOut:function(e){
}});
dojo.dnd.dragManager=new dojo.dnd.HtmlDragManager();
(function(){
var d=document;
var dm=dojo.dnd.dragManager;
dojo.event.connect(d,"onkeydown",dm,"onKeyDown");
dojo.event.connect(d,"onmouseover",dm,"onMouseOver");
dojo.event.connect(d,"onmouseout",dm,"onMouseOut");
dojo.event.connect(d,"onmousedown",dm,"onMouseDown");
dojo.event.connect(d,"onmouseup",dm,"onMouseUp");
dojo.event.connect(window,"onscroll",dm,"onScroll");
})();
dojo.provide("dojo.dnd.HtmlDragAndDrop");
dojo.declare("dojo.dnd.HtmlDragSource",dojo.dnd.DragSource,{dragClass:"",onDragStart:function(){
var _ad1=new dojo.dnd.HtmlDragObject(this.dragObject,this.type);
if(this.dragClass){
_ad1.dragClass=this.dragClass;
}
if(this.constrainToContainer){
_ad1.constrainTo(this.constrainingContainer||this.domNode.parentNode);
}
return _ad1;
},setDragHandle:function(node){
node=dojo.byId(node);
dojo.dnd.dragManager.unregisterDragSource(this);
this.domNode=node;
dojo.dnd.dragManager.registerDragSource(this);
},setDragTarget:function(node){
this.dragObject=node;
},constrainTo:function(_ad4){
this.constrainToContainer=true;
if(_ad4){
this.constrainingContainer=_ad4;
}
},onSelected:function(){
for(var i=0;i<this.dragObjects.length;i++){
dojo.dnd.dragManager.selectedSources.push(new dojo.dnd.HtmlDragSource(this.dragObjects[i]));
}
},addDragObjects:function(el){
for(var i=0;i<arguments.length;i++){
this.dragObjects.push(dojo.byId(arguments[i]));
}
}},function(node,type){
node=dojo.byId(node);
this.dragObjects=[];
this.constrainToContainer=false;
if(node){
this.domNode=node;
this.dragObject=node;
this.type=(type)||(this.domNode.nodeName.toLowerCase());
dojo.dnd.DragSource.prototype.reregister.call(this);
}
});
dojo.declare("dojo.dnd.HtmlDragObject",dojo.dnd.DragObject,{dragClass:"",opacity:0.5,createIframe:true,disableX:false,disableY:false,createDragNode:function(){
var node=this.domNode.cloneNode(true);
if(this.dragClass){
dojo.html.addClass(node,this.dragClass);
}
if(this.opacity<1){
dojo.html.setOpacity(node,this.opacity);
}
var ltn=node.tagName.toLowerCase();
var isTr=(ltn=="tr");
if((isTr)||(ltn=="tbody")){
var doc=this.domNode.ownerDocument;
var _ade=doc.createElement("table");
if(isTr){
var _adf=doc.createElement("tbody");
_ade.appendChild(_adf);
_adf.appendChild(node);
}else{
_ade.appendChild(node);
}
var _ae0=((isTr)?this.domNode:this.domNode.firstChild);
var _ae1=((isTr)?node:node.firstChild);
var _ae2=_ae0.childNodes;
var _ae3=_ae1.childNodes;
for(var i=0;i<_ae2.length;i++){
if((_ae3[i])&&(_ae3[i].style)){
_ae3[i].style.width=dojo.html.getContentBox(_ae2[i]).width+"px";
}
}
node=_ade;
}
if((dojo.render.html.ie55||dojo.render.html.ie60)&&this.createIframe){
with(node.style){
top="0px";
left="0px";
}
var _ae5=document.createElement("div");
_ae5.appendChild(node);
this.bgIframe=new dojo.html.BackgroundIframe(_ae5);
_ae5.appendChild(this.bgIframe.iframe);
node=_ae5;
}
node.style.zIndex=999;
return node;
},onDragStart:function(e){
dojo.html.clearSelection();
this.scrollOffset=dojo.html.getScroll().offset;
this.dragStartPosition=dojo.html.getAbsolutePosition(this.domNode,true);
this.dragOffset={y:this.dragStartPosition.y-e.pageY,x:this.dragStartPosition.x-e.pageX};
this.dragClone=this.createDragNode();
this.containingBlockPosition=this.domNode.offsetParent?dojo.html.getAbsolutePosition(this.domNode.offsetParent,true):{x:0,y:0};
if(this.constrainToContainer){
this.constraints=this.getConstraints();
}
with(this.dragClone.style){
position="absolute";
top=this.dragOffset.y+e.pageY+"px";
left=this.dragOffset.x+e.pageX+"px";
}
dojo.body().appendChild(this.dragClone);
dojo.event.topic.publish("dragStart",{source:this});
},getConstraints:function(){
if(this.constrainingContainer.nodeName.toLowerCase()=="body"){
var _ae7=dojo.html.getViewport();
var _ae8=_ae7.width;
var _ae9=_ae7.height;
var _aea=dojo.html.getScroll().offset;
var x=_aea.x;
var y=_aea.y;
}else{
var _aed=dojo.html.getContentBox(this.constrainingContainer);
_ae8=_aed.width;
_ae9=_aed.height;
x=this.containingBlockPosition.x+dojo.html.getPixelValue(this.constrainingContainer,"padding-left",true)+dojo.html.getBorderExtent(this.constrainingContainer,"left");
y=this.containingBlockPosition.y+dojo.html.getPixelValue(this.constrainingContainer,"padding-top",true)+dojo.html.getBorderExtent(this.constrainingContainer,"top");
}
var mb=dojo.html.getMarginBox(this.domNode);
return {minX:x,minY:y,maxX:x+_ae8-mb.width,maxY:y+_ae9-mb.height};
},updateDragOffset:function(){
var _aef=dojo.html.getScroll().offset;
if(_aef.y!=this.scrollOffset.y){
var diff=_aef.y-this.scrollOffset.y;
this.dragOffset.y+=diff;
this.scrollOffset.y=_aef.y;
}
if(_aef.x!=this.scrollOffset.x){
var diff=_aef.x-this.scrollOffset.x;
this.dragOffset.x+=diff;
this.scrollOffset.x=_aef.x;
}
},onDragMove:function(e){
this.updateDragOffset();
var x=this.dragOffset.x+e.pageX;
var y=this.dragOffset.y+e.pageY;
if(this.constrainToContainer){
if(x<this.constraints.minX){
x=this.constraints.minX;
}
if(y<this.constraints.minY){
y=this.constraints.minY;
}
if(x>this.constraints.maxX){
x=this.constraints.maxX;
}
if(y>this.constraints.maxY){
y=this.constraints.maxY;
}
}
this.setAbsolutePosition(x,y);
dojo.event.topic.publish("dragMove",{source:this});
},setAbsolutePosition:function(x,y){
if(!this.disableY){
this.dragClone.style.top=y+"px";
}
if(!this.disableX){
this.dragClone.style.left=x+"px";
}
},onDragEnd:function(e){
switch(e.dragStatus){
case "dropSuccess":
dojo.html.removeNode(this.dragClone);
this.dragClone=null;
break;
case "dropFailure":
var _af7=dojo.html.getAbsolutePosition(this.dragClone,true);
var _af8={left:this.dragStartPosition.x+1,top:this.dragStartPosition.y+1};
var anim=dojo.lfx.slideTo(this.dragClone,_af8,300);
var _afa=this;
dojo.event.connect(anim,"onEnd",function(e){
dojo.html.removeNode(_afa.dragClone);
_afa.dragClone=null;
});
anim.play();
break;
}
dojo.event.topic.publish("dragEnd",{source:this});
},constrainTo:function(_afc){
this.constrainToContainer=true;
if(_afc){
this.constrainingContainer=_afc;
}else{
this.constrainingContainer=this.domNode.parentNode;
}
}},function(node,type){
this.domNode=dojo.byId(node);
this.type=type;
this.constrainToContainer=false;
this.dragSource=null;
dojo.dnd.DragObject.prototype.register.call(this);
});
dojo.declare("dojo.dnd.HtmlDropTarget",dojo.dnd.DropTarget,{vertical:false,onDragOver:function(e){
if(!this.accepts(e.dragObjects)){
return false;
}
this.childBoxes=[];
for(var i=0,_b01;i<this.domNode.childNodes.length;i++){
_b01=this.domNode.childNodes[i];
if(_b01.nodeType!=dojo.html.ELEMENT_NODE){
continue;
}
var pos=dojo.html.getAbsolutePosition(_b01,true);
var _b03=dojo.html.getBorderBox(_b01);
this.childBoxes.push({top:pos.y,bottom:pos.y+_b03.height,left:pos.x,right:pos.x+_b03.width,height:_b03.height,width:_b03.width,node:_b01});
}
return true;
},_getNodeUnderMouse:function(e){
for(var i=0,_b06;i<this.childBoxes.length;i++){
with(this.childBoxes[i]){
if(e.pageX>=left&&e.pageX<=right&&e.pageY>=top&&e.pageY<=bottom){
return i;
}
}
}
return -1;
},createDropIndicator:function(){
this.dropIndicator=document.createElement("div");
with(this.dropIndicator.style){
position="absolute";
zIndex=999;
if(this.vertical){
borderLeftWidth="1px";
borderLeftColor="black";
borderLeftStyle="solid";
height=dojo.html.getBorderBox(this.domNode).height+"px";
top=dojo.html.getAbsolutePosition(this.domNode,true).y+"px";
}else{
borderTopWidth="1px";
borderTopColor="black";
borderTopStyle="solid";
width=dojo.html.getBorderBox(this.domNode).width+"px";
left=dojo.html.getAbsolutePosition(this.domNode,true).x+"px";
}
}
},onDragMove:function(e,_b08){
var i=this._getNodeUnderMouse(e);
if(!this.dropIndicator){
this.createDropIndicator();
}
var _b0a=this.vertical?dojo.html.gravity.WEST:dojo.html.gravity.NORTH;
var hide=false;
if(i<0){
if(this.childBoxes.length){
var _b0c=(dojo.html.gravity(this.childBoxes[0].node,e)&_b0a);
if(_b0c){
hide=true;
}
}else{
var _b0c=true;
}
}else{
var _b0d=this.childBoxes[i];
var _b0c=(dojo.html.gravity(_b0d.node,e)&_b0a);
if(_b0d.node===_b08[0].dragSource.domNode){
hide=true;
}else{
var _b0e=_b0c?(i>0?this.childBoxes[i-1]:_b0d):(i<this.childBoxes.length-1?this.childBoxes[i+1]:_b0d);
if(_b0e.node===_b08[0].dragSource.domNode){
hide=true;
}
}
}
if(hide){
this.dropIndicator.style.display="none";
return;
}else{
this.dropIndicator.style.display="";
}
this.placeIndicator(e,_b08,i,_b0c);
if(!dojo.html.hasParent(this.dropIndicator)){
dojo.body().appendChild(this.dropIndicator);
}
},placeIndicator:function(e,_b10,_b11,_b12){
var _b13=this.vertical?"left":"top";
var _b14;
if(_b11<0){
if(this.childBoxes.length){
_b14=_b12?this.childBoxes[0]:this.childBoxes[this.childBoxes.length-1];
}else{
this.dropIndicator.style[_b13]=dojo.html.getAbsolutePosition(this.domNode,true)[this.vertical?"x":"y"]+"px";
}
}else{
_b14=this.childBoxes[_b11];
}
if(_b14){
this.dropIndicator.style[_b13]=(_b12?_b14[_b13]:_b14[this.vertical?"right":"bottom"])+"px";
if(this.vertical){
this.dropIndicator.style.height=_b14.height+"px";
this.dropIndicator.style.top=_b14.top+"px";
}else{
this.dropIndicator.style.width=_b14.width+"px";
this.dropIndicator.style.left=_b14.left+"px";
}
}
},onDragOut:function(e){
if(this.dropIndicator){
dojo.html.removeNode(this.dropIndicator);
delete this.dropIndicator;
}
},onDrop:function(e){
this.onDragOut(e);
var i=this._getNodeUnderMouse(e);
var _b18=this.vertical?dojo.html.gravity.WEST:dojo.html.gravity.NORTH;
if(i<0){
if(this.childBoxes.length){
if(dojo.html.gravity(this.childBoxes[0].node,e)&_b18){
return this.insert(e,this.childBoxes[0].node,"before");
}else{
return this.insert(e,this.childBoxes[this.childBoxes.length-1].node,"after");
}
}
return this.insert(e,this.domNode,"append");
}
var _b19=this.childBoxes[i];
if(dojo.html.gravity(_b19.node,e)&_b18){
return this.insert(e,_b19.node,"before");
}else{
return this.insert(e,_b19.node,"after");
}
},insert:function(e,_b1b,_b1c){
var node=e.dragObject.domNode;
if(_b1c=="before"){
return dojo.html.insertBefore(node,_b1b);
}else{
if(_b1c=="after"){
return dojo.html.insertAfter(node,_b1b);
}else{
if(_b1c=="append"){
_b1b.appendChild(node);
return true;
}
}
}
return false;
}},function(node,_b1f){
if(arguments.length==0){
return;
}
this.domNode=dojo.byId(node);
dojo.dnd.DropTarget.call(this);
if(_b1f&&dojo.lang.isString(_b1f)){
_b1f=[_b1f];
}
this.acceptedTypes=_b1f||[];
dojo.dnd.dragManager.registerDropTarget(this);
});
dojo.kwCompoundRequire({common:["dojo.dnd.DragAndDrop"],browser:["dojo.dnd.HtmlDragAndDrop"],dashboard:["dojo.dnd.HtmlDragAndDrop"]});
dojo.provide("dojo.dnd.*");
dojo.provide("dojo.dnd.HtmlDragMove");
dojo.declare("dojo.dnd.HtmlDragMoveSource",dojo.dnd.HtmlDragSource,{onDragStart:function(){
var _b20=new dojo.dnd.HtmlDragMoveObject(this.dragObject,this.type);
if(this.constrainToContainer){
_b20.constrainTo(this.constrainingContainer);
}
return _b20;
},onSelected:function(){
for(var i=0;i<this.dragObjects.length;i++){
dojo.dnd.dragManager.selectedSources.push(new dojo.dnd.HtmlDragMoveSource(this.dragObjects[i]));
}
}});
dojo.declare("dojo.dnd.HtmlDragMoveObject",dojo.dnd.HtmlDragObject,{onDragStart:function(e){
dojo.html.clearSelection();
this.dragClone=this.domNode;
if(dojo.html.getComputedStyle(this.domNode,"position")!="absolute"){
this.domNode.style.position="relative";
}
var left=parseInt(dojo.html.getComputedStyle(this.domNode,"left"));
var top=parseInt(dojo.html.getComputedStyle(this.domNode,"top"));
this.dragStartPosition={x:isNaN(left)?0:left,y:isNaN(top)?0:top};
this.scrollOffset=dojo.html.getScroll().offset;
this.dragOffset={y:this.dragStartPosition.y-e.pageY,x:this.dragStartPosition.x-e.pageX};
this.containingBlockPosition={x:0,y:0};
if(this.constrainToContainer){
this.constraints=this.getConstraints();
}
dojo.event.connect(this.domNode,"onclick",this,"_squelchOnClick");
},onDragEnd:function(e){
},setAbsolutePosition:function(x,y){
if(!this.disableY){
this.domNode.style.top=y+"px";
}
if(!this.disableX){
this.domNode.style.left=x+"px";
}
},_squelchOnClick:function(e){
dojo.event.browser.stopEvent(e);
dojo.event.disconnect(this.domNode,"onclick",this,"_squelchOnClick");
}});
dojo.provide("dojo.widget.Dialog");
dojo.declare("dojo.widget.ModalDialogBase",null,{isContainer:true,focusElement:"",bgColor:"black",bgOpacity:0.4,followScroll:true,appendToBody:true,closeOnBackgroundClick:false,trapTabs:function(e){
if(e.target==this.tabStartOuter){
if(this._fromTrap){
this.tabStart.focus();
this._fromTrap=false;
}else{
this._fromTrap=true;
this.tabEnd.focus();
}
}else{
if(e.target==this.tabStart){
if(this._fromTrap){
this._fromTrap=false;
}else{
this._fromTrap=true;
this.tabEnd.focus();
}
}else{
if(e.target==this.tabEndOuter){
if(this._fromTrap){
this.tabEnd.focus();
this._fromTrap=false;
}else{
this._fromTrap=true;
this.tabStart.focus();
}
}else{
if(e.target==this.tabEnd){
if(this._fromTrap){
this._fromTrap=false;
}else{
this._fromTrap=true;
this.tabStart.focus();
}
}
}
}
}
},clearTrap:function(e){
var _b2b=this;
setTimeout(function(){
_b2b._fromTrap=false;
},100);
},postCreate:function(){
with(this.domNode.style){
position="absolute";
zIndex=999;
display="none";
overflow="visible";
}
var b=dojo.body();
if(this.appendToBody){
b.appendChild(this.domNode);
}
this.bg=document.createElement("div");
this.bg.className="dialogUnderlay";
with(this.bg.style){
position="absolute";
left=top="0px";
zIndex=998;
display="none";
}
b.appendChild(this.bg);
this.setBackgroundColor(this.bgColor);
this.bgIframe=new dojo.html.BackgroundIframe();
if(this.bgIframe.iframe){
with(this.bgIframe.iframe.style){
position="absolute";
left=top="0px";
zIndex=90;
display="none";
}
}
if(this.closeOnBackgroundClick){
dojo.event.kwConnect({srcObj:this.bg,srcFunc:"onclick",adviceObj:this,adviceFunc:"onBackgroundClick",once:true});
}
},uninitialize:function(){
this.bgIframe.remove();
dojo.html.removeNode(this.bg,true);
},setBackgroundColor:function(_b2d){
if(arguments.length>=3){
_b2d=new dojo.gfx.color.Color(arguments[0],arguments[1],arguments[2]);
}else{
_b2d=new dojo.gfx.color.Color(_b2d);
}
this.bg.style.backgroundColor=_b2d.toString();
return this.bgColor=_b2d;
},setBackgroundOpacity:function(op){
if(arguments.length==0){
op=this.bgOpacity;
}
dojo.html.setOpacity(this.bg,op);
try{
this.bgOpacity=dojo.html.getOpacity(this.bg);
}
catch(e){
this.bgOpacity=op;
}
return this.bgOpacity;
},_sizeBackground:function(){
if(this.bgOpacity>0){
var _b2f=dojo.html.getViewport();
var h=_b2f.height;
var w=_b2f.width;
with(this.bg.style){
width=w+"px";
height=h+"px";
}
var _b32=dojo.html.getScroll().offset;
this.bg.style.top=_b32.y+"px";
this.bg.style.left=_b32.x+"px";
var _b2f=dojo.html.getViewport();
if(_b2f.width!=w){
this.bg.style.width=_b2f.width+"px";
}
if(_b2f.height!=h){
this.bg.style.height=_b2f.height+"px";
}
}
this.bgIframe.size(this.bg);
},_showBackground:function(){
if(this.bgOpacity>0){
this.bg.style.display="block";
}
if(this.bgIframe.iframe){
this.bgIframe.iframe.style.display="block";
}
},placeModalDialog:function(){
var _b33=dojo.html.getScroll().offset;
var _b34=dojo.html.getViewport();
var mb;
if(this.isShowing()){
mb=dojo.html.getMarginBox(this.domNode);
}else{
dojo.html.setVisibility(this.domNode,false);
dojo.html.show(this.domNode);
mb=dojo.html.getMarginBox(this.domNode);
dojo.html.hide(this.domNode);
dojo.html.setVisibility(this.domNode,true);
}
var x=_b33.x+(_b34.width-mb.width)/2;
var y=_b33.y+(_b34.height-mb.height)/2;
with(this.domNode.style){
left=x+"px";
top=y+"px";
}
},_onKey:function(evt){
if(evt.key){
var node=evt.target;
while(node!=null){
if(node==this.domNode){
return;
}
node=node.parentNode;
}
if(evt.key!=evt.KEY_TAB){
dojo.event.browser.stopEvent(evt);
}else{
if(!dojo.render.html.opera){
try{
this.tabStart.focus();
}
catch(e){
}
}
}
}
},showModalDialog:function(){
if(this.followScroll&&!this._scrollConnected){
this._scrollConnected=true;
dojo.event.connect(window,"onscroll",this,"_onScroll");
}
dojo.event.connect(document.documentElement,"onkey",this,"_onKey");
this.placeModalDialog();
this.setBackgroundOpacity();
this._sizeBackground();
this._showBackground();
this._fromTrap=true;
setTimeout(dojo.lang.hitch(this,function(){
try{
this.tabStart.focus();
}
catch(e){
}
}),50);
},hideModalDialog:function(){
if(this.focusElement){
dojo.byId(this.focusElement).focus();
dojo.byId(this.focusElement).blur();
}
this.bg.style.display="none";
this.bg.style.width=this.bg.style.height="1px";
if(this.bgIframe.iframe){
this.bgIframe.iframe.style.display="none";
}
dojo.event.disconnect(document.documentElement,"onkey",this,"_onKey");
if(this._scrollConnected){
this._scrollConnected=false;
dojo.event.disconnect(window,"onscroll",this,"_onScroll");
}
},_onScroll:function(){
var _b3a=dojo.html.getScroll().offset;
this.bg.style.top=_b3a.y+"px";
this.bg.style.left=_b3a.x+"px";
this.placeModalDialog();
},checkSize:function(){
if(this.isShowing()){
this._sizeBackground();
this.placeModalDialog();
this.onResized();
}
},onBackgroundClick:function(){
if(this.lifetime-this.timeRemaining>=this.blockDuration){
return;
}
this.hide();
}});
dojo.widget.defineWidget("dojo.widget.Dialog",[dojo.widget.ContentPane,dojo.widget.ModalDialogBase],{templateString:"<div id=\"${this.widgetId}\" class=\"dojoDialog\" dojoattachpoint=\"wrapper\">\n\t<span dojoattachpoint=\"tabStartOuter\" dojoonfocus=\"trapTabs\" dojoonblur=\"clearTrap\"\ttabindex=\"0\"></span>\n\t<span dojoattachpoint=\"tabStart\" dojoonfocus=\"trapTabs\" dojoonblur=\"clearTrap\" tabindex=\"0\"></span>\n\t<div dojoattachpoint=\"containerNode\" style=\"position: relative; z-index: 2;\"></div>\n\t<span dojoattachpoint=\"tabEnd\" dojoonfocus=\"trapTabs\" dojoonblur=\"clearTrap\" tabindex=\"0\"></span>\n\t<span dojoattachpoint=\"tabEndOuter\" dojoonfocus=\"trapTabs\" dojoonblur=\"clearTrap\" tabindex=\"0\"></span>\n</div>\n",blockDuration:0,lifetime:0,closeNode:"",postMixInProperties:function(){
dojo.widget.Dialog.superclass.postMixInProperties.apply(this,arguments);
if(this.closeNode){
this.setCloseControl(this.closeNode);
}
},postCreate:function(){
dojo.widget.Dialog.superclass.postCreate.apply(this,arguments);
dojo.widget.ModalDialogBase.prototype.postCreate.apply(this,arguments);
},show:function(){
if(this.lifetime){
this.timeRemaining=this.lifetime;
if(this.timerNode){
this.timerNode.innerHTML=Math.ceil(this.timeRemaining/1000);
}
if(this.blockDuration&&this.closeNode){
if(this.lifetime>this.blockDuration){
this.closeNode.style.visibility="hidden";
}else{
this.closeNode.style.display="none";
}
}
if(this.timer){
clearInterval(this.timer);
}
this.timer=setInterval(dojo.lang.hitch(this,"_onTick"),100);
}
this.showModalDialog();
dojo.widget.Dialog.superclass.show.call(this);
},onLoad:function(){
this.placeModalDialog();
dojo.widget.Dialog.superclass.onLoad.call(this);
},fillInTemplate:function(){
},hide:function(){
this.hideModalDialog();
dojo.widget.Dialog.superclass.hide.call(this);
if(this.timer){
clearInterval(this.timer);
}
},setTimerNode:function(node){
this.timerNode=node;
},setCloseControl:function(node){
this.closeNode=dojo.byId(node);
dojo.event.connect(this.closeNode,"onclick",this,"hide");
},setShowControl:function(node){
node=dojo.byId(node);
dojo.event.connect(node,"onclick",this,"show");
},_onTick:function(){
if(this.timer){
this.timeRemaining-=100;
if(this.lifetime-this.timeRemaining>=this.blockDuration){
if(this.closeNode){
this.closeNode.style.visibility="visible";
}
}
if(!this.timeRemaining){
clearInterval(this.timer);
this.hide();
}else{
if(this.timerNode){
this.timerNode.innerHTML=Math.ceil(this.timeRemaining/1000);
}
}
}
}});
dojo.provide("dojo.widget.ResizeHandle");
dojo.widget.defineWidget("dojo.widget.ResizeHandle",dojo.widget.HtmlWidget,{targetElmId:"",templateCssString:".dojoHtmlResizeHandle {\n\tfloat: right;\n\tposition: absolute;\n\tright: 2px;\n\tbottom: 2px;\n\twidth: 13px;\n\theight: 13px;\n\tz-index: 20;\n\tcursor: nw-resize;\n\tbackground-image: url(grabCorner.gif);\n\tline-height: 0px;\n}\n",templateCssPath:dojo.uri.moduleUri("dojo.widget","templates/ResizeHandle.css"),templateString:"<div class=\"dojoHtmlResizeHandle\"><div></div></div>",postCreate:function(){
dojo.event.connect(this.domNode,"onmousedown",this,"_beginSizing");
},_beginSizing:function(e){
if(this._isSizing){
return false;
}
this.targetWidget=dojo.widget.byId(this.targetElmId);
this.targetDomNode=this.targetWidget?this.targetWidget.domNode:dojo.byId(this.targetElmId);
if(!this.targetDomNode){
return;
}
this._isSizing=true;
this.startPoint={"x":e.clientX,"y":e.clientY};
var mb=dojo.html.getMarginBox(this.targetDomNode);
this.startSize={"w":mb.width,"h":mb.height};
dojo.event.kwConnect({srcObj:dojo.body(),srcFunc:"onmousemove",targetObj:this,targetFunc:"_changeSizing",rate:25});
dojo.event.connect(dojo.body(),"onmouseup",this,"_endSizing");
e.preventDefault();
},_changeSizing:function(e){
try{
if(!e.clientX||!e.clientY){
return;
}
}
catch(e){
return;
}
var dx=this.startPoint.x-e.clientX;
var dy=this.startPoint.y-e.clientY;
var newW=this.startSize.w-dx;
var newH=this.startSize.h-dy;
if(this.minSize){
var mb=dojo.html.getMarginBox(this.targetDomNode);
if(newW<this.minSize.w){
newW=mb.width;
}
if(newH<this.minSize.h){
newH=mb.height;
}
}
if(this.targetWidget){
this.targetWidget.resizeTo(newW,newH);
}else{
dojo.html.setMarginBox(this.targetDomNode,{width:newW,height:newH});
}
e.preventDefault();
},_endSizing:function(e){
dojo.event.disconnect(dojo.body(),"onmousemove",this,"_changeSizing");
dojo.event.disconnect(dojo.body(),"onmouseup",this,"_endSizing");
this._isSizing=false;
}});
dojo.provide("dojo.widget.FloatingPane");
dojo.declare("dojo.widget.FloatingPaneBase",null,{title:"",iconSrc:"",hasShadow:false,constrainToContainer:false,taskBarId:"",resizable:true,titleBarDisplay:true,windowState:"normal",displayCloseAction:false,displayMinimizeAction:false,displayMaximizeAction:false,_max_taskBarConnectAttempts:5,_taskBarConnectAttempts:0,templateString:"<div id=\"${this.widgetId}\" dojoAttachEvent=\"onMouseDown\" class=\"dojoFloatingPane\">\n\t<div dojoAttachPoint=\"titleBar\" class=\"dojoFloatingPaneTitleBar\"  style=\"display:none\">\n\t  \t<img dojoAttachPoint=\"titleBarIcon\"  class=\"dojoFloatingPaneTitleBarIcon\">\n\t\t<div dojoAttachPoint=\"closeAction\" dojoAttachEvent=\"onClick:closeWindow\"\n   \t  \t\tclass=\"dojoFloatingPaneCloseIcon\"></div>\n\t\t<div dojoAttachPoint=\"restoreAction\" dojoAttachEvent=\"onClick:restoreWindow\"\n   \t  \t\tclass=\"dojoFloatingPaneRestoreIcon\"></div>\n\t\t<div dojoAttachPoint=\"maximizeAction\" dojoAttachEvent=\"onClick:maximizeWindow\"\n   \t  \t\tclass=\"dojoFloatingPaneMaximizeIcon\"></div>\n\t\t<div dojoAttachPoint=\"minimizeAction\" dojoAttachEvent=\"onClick:minimizeWindow\"\n   \t  \t\tclass=\"dojoFloatingPaneMinimizeIcon\"></div>\n\t  \t<div dojoAttachPoint=\"titleBarText\" class=\"dojoFloatingPaneTitleText\">${this.title}</div>\n\t</div>\n\n\t<div id=\"${this.widgetId}_container\" dojoAttachPoint=\"containerNode\" class=\"dojoFloatingPaneClient\"></div>\n\n\t<div dojoAttachPoint=\"resizeBar\" class=\"dojoFloatingPaneResizebar\" style=\"display:none\"></div>\n</div>\n",templateCssString:"\n/********** Outer Window ***************/\n\n.dojoFloatingPane {\n\t/* essential css */\n\tposition: absolute;\n\toverflow: visible;\t\t/* so drop shadow is displayed */\n\tz-index: 10;\n\n\t/* styling css */\n\tborder: 1px solid;\n\tborder-color: ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight;\n\tbackground-color: ThreeDFace;\n}\n\n\n/********** Title Bar ****************/\n\n.dojoFloatingPaneTitleBar {\n\tvertical-align: top;\n\tmargin: 2px 2px 2px 2px;\n\tz-index: 10;\n\tbackground-color: #7596c6;\n\tcursor: default;\n\toverflow: hidden;\n\tborder-color: ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight;\n\tvertical-align: middle;\n}\n\n.dojoFloatingPaneTitleText {\n\tfloat: left;\n\tpadding: 2px 4px 2px 2px;\n\twhite-space: nowrap;\n\tcolor: CaptionText;\n\tfont: small-caption;\n}\n\n.dojoTitleBarIcon {\n\tfloat: left;\n\theight: 22px;\n\twidth: 22px;\n\tvertical-align: middle;\n\tmargin-right: 5px;\n\tmargin-left: 5px;\n}\n\n.dojoFloatingPaneActions{\n\tfloat: right;\n\tposition: absolute;\n\tright: 2px;\n\ttop: 2px;\n\tvertical-align: middle;\n}\n\n\n.dojoFloatingPaneActionItem {\n\tvertical-align: middle;\n\tmargin-right: 1px;\n\theight: 22px;\n\twidth: 22px;\n}\n\n\n.dojoFloatingPaneTitleBarIcon {\n\t/* essential css */\n\tfloat: left;\n\n\t/* styling css */\n\tmargin-left: 2px;\n\tmargin-right: 4px;\n\theight: 22px;\n}\n\n/* minimize/maximize icons are specified by CSS only */\n.dojoFloatingPaneMinimizeIcon,\n.dojoFloatingPaneMaximizeIcon,\n.dojoFloatingPaneRestoreIcon,\n.dojoFloatingPaneCloseIcon {\n\tvertical-align: middle;\n\theight: 22px;\n\twidth: 22px;\n\tfloat: right;\n}\n.dojoFloatingPaneMinimizeIcon {\n\tbackground-image: url(images/floatingPaneMinimize.gif);\n}\n.dojoFloatingPaneMaximizeIcon {\n\tbackground-image: url(images/floatingPaneMaximize.gif);\n}\n.dojoFloatingPaneRestoreIcon {\n\tbackground-image: url(images/floatingPaneRestore.gif);\n}\n.dojoFloatingPaneCloseIcon {\n\tbackground-image: url(images/floatingPaneClose.gif);\n}\n\n/* bar at bottom of window that holds resize handle */\n.dojoFloatingPaneResizebar {\n\tz-index: 10;\n\theight: 13px;\n\tbackground-color: ThreeDFace;\n}\n\n/************* Client Area ***************/\n\n.dojoFloatingPaneClient {\n\tposition: relative;\n\tz-index: 10;\n\tborder: 1px solid;\n\tborder-color: ThreeDShadow ThreeDHighlight ThreeDHighlight ThreeDShadow;\n\tmargin: 2px;\n\tbackground-color: ThreeDFace;\n\tpadding: 8px;\n\tfont-family: Verdana, Helvetica, Garamond, sans-serif;\n\tfont-size: 12px;\n\toverflow: auto;\n}\n\n",templateCssPath:dojo.uri.moduleUri("dojo.widget","templates/FloatingPane.css"),fillInFloatingPaneTemplate:function(args,frag){
var _b49=this.getFragNodeRef(frag);
dojo.html.copyStyle(this.domNode,_b49);
dojo.body().appendChild(this.domNode);
if(!this.isShowing()){
this.windowState="minimized";
}
if(this.iconSrc==""){
dojo.html.removeNode(this.titleBarIcon);
}else{
this.titleBarIcon.src=this.iconSrc.toString();
}
if(this.titleBarDisplay){
this.titleBar.style.display="";
dojo.html.disableSelection(this.titleBar);
this.titleBarIcon.style.display=(this.iconSrc==""?"none":"");
this.minimizeAction.style.display=(this.displayMinimizeAction?"":"none");
this.maximizeAction.style.display=(this.displayMaximizeAction&&this.windowState!="maximized"?"":"none");
this.restoreAction.style.display=(this.displayMaximizeAction&&this.windowState=="maximized"?"":"none");
this.closeAction.style.display=(this.displayCloseAction?"":"none");
this.drag=new dojo.dnd.HtmlDragMoveSource(this.domNode);
if(this.constrainToContainer){
this.drag.constrainTo();
}
this.drag.setDragHandle(this.titleBar);
var self=this;
dojo.event.topic.subscribe("dragMove",function(info){
if(info.source.domNode==self.domNode){
dojo.event.topic.publish("floatingPaneMove",{source:self});
}
});
}
if(this.resizable){
this.resizeBar.style.display="";
this.resizeHandle=dojo.widget.createWidget("ResizeHandle",{targetElmId:this.widgetId,id:this.widgetId+"_resize"});
this.resizeBar.appendChild(this.resizeHandle.domNode);
}
if(this.hasShadow){
this.shadow=new dojo.lfx.shadow(this.domNode);
}
this.bgIframe=new dojo.html.BackgroundIframe(this.domNode);
if(this.taskBarId){
this._taskBarSetup();
}
dojo.body().removeChild(this.domNode);
},postCreate:function(){
if(dojo.hostenv.post_load_){
this._setInitialWindowState();
}else{
dojo.addOnLoad(this,"_setInitialWindowState");
}
},maximizeWindow:function(evt){
var mb=dojo.html.getMarginBox(this.domNode);
this.previous={width:mb.width||this.width,height:mb.height||this.height,left:this.domNode.style.left,top:this.domNode.style.top,bottom:this.domNode.style.bottom,right:this.domNode.style.right};
if(this.domNode.parentNode.style.overflow.toLowerCase()!="hidden"){
this.parentPrevious={overflow:this.domNode.parentNode.style.overflow};
dojo.debug(this.domNode.parentNode.style.overflow);
this.domNode.parentNode.style.overflow="hidden";
}
this.domNode.style.left=dojo.html.getPixelValue(this.domNode.parentNode,"padding-left",true)+"px";
this.domNode.style.top=dojo.html.getPixelValue(this.domNode.parentNode,"padding-top",true)+"px";
if((this.domNode.parentNode.nodeName.toLowerCase()=="body")){
var _b4e=dojo.html.getViewport();
var _b4f=dojo.html.getPadding(dojo.body());
this.resizeTo(_b4e.width-_b4f.width,_b4e.height-_b4f.height);
}else{
var _b50=dojo.html.getContentBox(this.domNode.parentNode);
this.resizeTo(_b50.width,_b50.height);
}
this.maximizeAction.style.display="none";
this.restoreAction.style.display="";
if(this.resizeHandle){
this.resizeHandle.domNode.style.display="none";
}
this.drag.setDragHandle(null);
this.windowState="maximized";
},minimizeWindow:function(evt){
this.hide();
for(var attr in this.parentPrevious){
this.domNode.parentNode.style[attr]=this.parentPrevious[attr];
}
this.lastWindowState=this.windowState;
this.windowState="minimized";
},restoreWindow:function(evt){
if(this.windowState=="minimized"){
this.show();
if(this.lastWindowState=="maximized"){
this.domNode.parentNode.style.overflow="hidden";
this.windowState="maximized";
}else{
this.windowState="normal";
}
}else{
if(this.windowState=="maximized"){
for(var attr in this.previous){
this.domNode.style[attr]=this.previous[attr];
}
for(var attr in this.parentPrevious){
this.domNode.parentNode.style[attr]=this.parentPrevious[attr];
}
this.resizeTo(this.previous.width,this.previous.height);
this.previous=null;
this.parentPrevious=null;
this.restoreAction.style.display="none";
this.maximizeAction.style.display=this.displayMaximizeAction?"":"none";
if(this.resizeHandle){
this.resizeHandle.domNode.style.display="";
}
this.drag.setDragHandle(this.titleBar);
this.windowState="normal";
}else{
}
}
},toggleDisplay:function(){
if(this.windowState=="minimized"){
this.restoreWindow();
}else{
this.minimizeWindow();
}
},closeWindow:function(evt){
dojo.html.removeNode(this.domNode);
this.destroy();
},onMouseDown:function(evt){
this.bringToTop();
},bringToTop:function(){
var _b57=dojo.widget.manager.getWidgetsByType(this.widgetType);
var _b58=[];
for(var x=0;x<_b57.length;x++){
if(this.widgetId!=_b57[x].widgetId){
_b58.push(_b57[x]);
}
}
_b58.sort(function(a,b){
return a.domNode.style.zIndex-b.domNode.style.zIndex;
});
_b58.push(this);
var _b5c=100;
for(x=0;x<_b58.length;x++){
_b58[x].domNode.style.zIndex=_b5c+x*2;
}
},_setInitialWindowState:function(){
if(this.isShowing()){
this.width=-1;
var mb=dojo.html.getMarginBox(this.domNode);
this.resizeTo(mb.width,mb.height);
}
if(this.windowState=="maximized"){
this.maximizeWindow();
this.show();
return;
}
if(this.windowState=="normal"){
this.show();
return;
}
if(this.windowState=="minimized"){
this.hide();
return;
}
this.windowState="minimized";
},_taskBarSetup:function(){
var _b5e=dojo.widget.getWidgetById(this.taskBarId);
if(!_b5e){
if(this._taskBarConnectAttempts<this._max_taskBarConnectAttempts){
dojo.lang.setTimeout(this,this._taskBarSetup,50);
this._taskBarConnectAttempts++;
}else{
dojo.debug("Unable to connect to the taskBar");
}
return;
}
_b5e.addChild(this);
},showFloatingPane:function(){
this.bringToTop();
},onFloatingPaneShow:function(){
var mb=dojo.html.getMarginBox(this.domNode);
this.resizeTo(mb.width,mb.height);
},resizeTo:function(_b60,_b61){
dojo.html.setMarginBox(this.domNode,{width:_b60,height:_b61});
dojo.widget.html.layout(this.domNode,[{domNode:this.titleBar,layoutAlign:"top"},{domNode:this.resizeBar,layoutAlign:"bottom"},{domNode:this.containerNode,layoutAlign:"client"}]);
dojo.widget.html.layout(this.containerNode,this.children,"top-bottom");
this.bgIframe.onResized();
if(this.shadow){
this.shadow.size(_b60,_b61);
}
this.onResized();
},checkSize:function(){
},destroyFloatingPane:function(){
if(this.resizeHandle){
this.resizeHandle.destroy();
this.resizeHandle=null;
}
}});
dojo.widget.defineWidget("dojo.widget.FloatingPane",[dojo.widget.ContentPane,dojo.widget.FloatingPaneBase],{fillInTemplate:function(args,frag){
this.fillInFloatingPaneTemplate(args,frag);
dojo.widget.FloatingPane.superclass.fillInTemplate.call(this,args,frag);
},postCreate:function(){
dojo.widget.FloatingPaneBase.prototype.postCreate.apply(this,arguments);
dojo.widget.FloatingPane.superclass.postCreate.apply(this,arguments);
},show:function(){
dojo.widget.FloatingPane.superclass.show.apply(this,arguments);
this.showFloatingPane();
},onShow:function(){
dojo.widget.FloatingPane.superclass.onShow.call(this);
this.onFloatingPaneShow();
},destroy:function(){
this.destroyFloatingPane();
dojo.widget.FloatingPane.superclass.destroy.apply(this,arguments);
}});
dojo.widget.defineWidget("dojo.widget.ModalFloatingPane",[dojo.widget.FloatingPane,dojo.widget.ModalDialogBase],{windowState:"minimized",displayCloseAction:true,postCreate:function(){
dojo.widget.ModalDialogBase.prototype.postCreate.call(this);
dojo.widget.ModalFloatingPane.superclass.postCreate.call(this);
},show:function(){
this.showModalDialog();
dojo.widget.ModalFloatingPane.superclass.show.apply(this,arguments);
this.bg.style.zIndex=this.domNode.style.zIndex-1;
},hide:function(){
this.hideModalDialog();
dojo.widget.ModalFloatingPane.superclass.hide.apply(this,arguments);
},closeWindow:function(){
this.hide();
dojo.widget.ModalFloatingPane.superclass.closeWindow.apply(this,arguments);
}});
dojo.provide("dojo.widget.Editor2Plugin.AlwaysShowToolbar");
dojo.event.topic.subscribe("dojo.widget.Editor2::onLoad",function(_b64){
if(_b64.toolbarAlwaysVisible){
var p=new dojo.widget.Editor2Plugin.AlwaysShowToolbar(_b64);
}
});
dojo.declare("dojo.widget.Editor2Plugin.AlwaysShowToolbar",null,function(_b66){
this.editor=_b66;
this.editor.registerLoadedPlugin(this);
this.setup();
},{_scrollSetUp:false,_fixEnabled:false,_scrollThreshold:false,_handleScroll:true,setup:function(){
var tdn=this.editor.toolbarWidget;
if(!tdn.tbBgIframe){
tdn.tbBgIframe=new dojo.html.BackgroundIframe(tdn.domNode);
tdn.tbBgIframe.onResized();
}
this.scrollInterval=setInterval(dojo.lang.hitch(this,"globalOnScrollHandler"),100);
dojo.event.connect("before",this.editor.toolbarWidget,"destroy",this,"destroy");
},globalOnScrollHandler:function(){
var isIE=dojo.render.html.ie;
if(!this._handleScroll){
return;
}
var dh=dojo.html;
var tdn=this.editor.toolbarWidget.domNode;
var db=dojo.body();
if(!this._scrollSetUp){
this._scrollSetUp=true;
var _b6c=dh.getMarginBox(this.editor.domNode).width;
this._scrollThreshold=dh.abs(tdn,true).y;
if((isIE)&&(db)&&(dh.getStyle(db,"background-image")=="none")){
with(db.style){
backgroundImage="url("+dojo.uri.moduleUri("dojo.widget","templates/images/blank.gif")+")";
backgroundAttachment="fixed";
}
}
}
var _b6d=(window["pageYOffset"])?window["pageYOffset"]:(document["documentElement"]||document["body"]).scrollTop;
if(_b6d>this._scrollThreshold){
if(!this._fixEnabled){
var _b6e=dojo.html.getMarginBox(tdn);
this.editor.editorObject.style.marginTop=_b6e.height+"px";
if(isIE){
tdn.style.left=dojo.html.abs(tdn,dojo.html.boxSizing.MARGIN_BOX).x;
if(tdn.previousSibling){
this._IEOriginalPos=["after",tdn.previousSibling];
}else{
if(tdn.nextSibling){
this._IEOriginalPos=["before",tdn.nextSibling];
}else{
this._IEOriginalPos=["",tdn.parentNode];
}
}
dojo.body().appendChild(tdn);
dojo.html.addClass(tdn,"IEFixedToolbar");
}else{
with(tdn.style){
position="fixed";
top="0px";
}
}
tdn.style.width=_b6e.width+"px";
tdn.style.zIndex=1000;
this._fixEnabled=true;
}
}else{
if(this._fixEnabled){
(this.editor.object||this.editor.iframe).style.marginTop=null;
with(tdn.style){
position="";
top="";
zIndex="";
display="";
}
if(isIE){
tdn.style.left="";
dojo.html.removeClass(tdn,"IEFixedToolbar");
if(this._IEOriginalPos){
dojo.html.insertAtPosition(tdn,this._IEOriginalPos[1],this._IEOriginalPos[0]);
this._IEOriginalPos=null;
}else{
dojo.html.insertBefore(tdn,this.editor.object||this.editor.iframe);
}
}
tdn.style.width="";
this._fixEnabled=false;
}
}
},destroy:function(){
this._IEOriginalPos=null;
this._handleScroll=false;
clearInterval(this.scrollInterval);
this.editor.unregisterLoadedPlugin(this);
if(dojo.render.html.ie){
dojo.html.removeClass(this.editor.toolbarWidget.domNode,"IEFixedToolbar");
}
}});
dojo.provide("dojo.widget.Editor2");
dojo.widget.Editor2Manager=new dojo.widget.HandlerManager;
dojo.lang.mixin(dojo.widget.Editor2Manager,{_currentInstance:null,commandState:{Disabled:0,Latched:1,Enabled:2},getCurrentInstance:function(){
return this._currentInstance;
},setCurrentInstance:function(inst){
this._currentInstance=inst;
},getCommand:function(_b70,name){
var _b72;
name=name.toLowerCase();
for(var i=0;i<this._registeredHandlers.length;i++){
_b72=this._registeredHandlers[i](_b70,name);
if(_b72){
return _b72;
}
}
switch(name){
case "htmltoggle":
_b72=new dojo.widget.Editor2BrowserCommand(_b70,name);
break;
case "formatblock":
_b72=new dojo.widget.Editor2FormatBlockCommand(_b70,name);
break;
case "anchor":
_b72=new dojo.widget.Editor2Command(_b70,name);
break;
case "createlink":
_b72=new dojo.widget.Editor2DialogCommand(_b70,name,{contentFile:"dojo.widget.Editor2Plugin.CreateLinkDialog",contentClass:"Editor2CreateLinkDialog",title:"Insert/Edit Link",width:"300px",height:"200px"});
break;
case "insertimage":
_b72=new dojo.widget.Editor2DialogCommand(_b70,name,{contentFile:"dojo.widget.Editor2Plugin.InsertImageDialog",contentClass:"Editor2InsertImageDialog",title:"Insert/Edit Image",width:"400px",height:"270px"});
break;
default:
var _b74=this.getCurrentInstance();
if((_b74&&_b74.queryCommandAvailable(name))||(!_b74&&dojo.widget.Editor2.prototype.queryCommandAvailable(name))){
_b72=new dojo.widget.Editor2BrowserCommand(_b70,name);
}else{
dojo.debug("dojo.widget.Editor2Manager.getCommand: Unknown command "+name);
return;
}
}
return _b72;
},destroy:function(){
this._currentInstance=null;
dojo.widget.HandlerManager.prototype.destroy.call(this);
}});
dojo.addOnUnload(dojo.widget.Editor2Manager,"destroy");
dojo.lang.declare("dojo.widget.Editor2Command",null,function(_b75,name){
this._editor=_b75;
this._updateTime=0;
this._name=name;
},{_text:"Unknown",execute:function(para){
dojo.unimplemented("dojo.widget.Editor2Command.execute");
},getText:function(){
return this._text;
},getState:function(){
return dojo.widget.Editor2Manager.commandState.Enabled;
},destroy:function(){
}});
dojo.widget.Editor2BrowserCommandNames={"bold":"Bold","copy":"Copy","cut":"Cut","Delete":"Delete","indent":"Indent","inserthorizontalrule":"Horizontal Rule","insertorderedlist":"Numbered List","insertunorderedlist":"Bullet List","italic":"Italic","justifycenter":"Align Center","justifyfull":"Justify","justifyleft":"Align Left","justifyright":"Align Right","outdent":"Outdent","paste":"Paste","redo":"Redo","removeformat":"Remove Format","selectall":"Select All","strikethrough":"Strikethrough","subscript":"Subscript","superscript":"Superscript","underline":"Underline","undo":"Undo","unlink":"Remove Link","createlink":"Create Link","insertimage":"Insert Image","htmltoggle":"HTML Source","forecolor":"Foreground Color","hilitecolor":"Background Color","plainformatblock":"Paragraph Style","formatblock":"Paragraph Style","fontsize":"Font Size","fontname":"Font Name"};
dojo.lang.declare("dojo.widget.Editor2BrowserCommand",dojo.widget.Editor2Command,function(_b78,name){
var text=dojo.widget.Editor2BrowserCommandNames[name.toLowerCase()];
if(text){
this._text=text;
}
},{execute:function(para){
this._editor.execCommand(this._name,para);
},getState:function(){
if(this._editor._lastStateTimestamp>this._updateTime||this._state==undefined){
this._updateTime=this._editor._lastStateTimestamp;
try{
if(this._editor.queryCommandEnabled(this._name)){
if(this._editor.queryCommandState(this._name)){
this._state=dojo.widget.Editor2Manager.commandState.Latched;
}else{
this._state=dojo.widget.Editor2Manager.commandState.Enabled;
}
}else{
this._state=dojo.widget.Editor2Manager.commandState.Disabled;
}
}
catch(e){
this._state=dojo.widget.Editor2Manager.commandState.Enabled;
}
}
return this._state;
},getValue:function(){
try{
return this._editor.queryCommandValue(this._name);
}
catch(e){
}
}});
dojo.lang.declare("dojo.widget.Editor2FormatBlockCommand",dojo.widget.Editor2BrowserCommand,{});
dojo.widget.defineWidget("dojo.widget.Editor2Dialog",[dojo.widget.HtmlWidget,dojo.widget.FloatingPaneBase,dojo.widget.ModalDialogBase],{templateString:"<div id=\"${this.widgetId}\" class=\"dojoFloatingPane\">\n\t<span dojoattachpoint=\"tabStartOuter\" dojoonfocus=\"trapTabs\" dojoonblur=\"clearTrap\"\ttabindex=\"0\"></span>\n\t<span dojoattachpoint=\"tabStart\" dojoonfocus=\"trapTabs\" dojoonblur=\"clearTrap\" tabindex=\"0\"></span>\n\t<div dojoAttachPoint=\"titleBar\" class=\"dojoFloatingPaneTitleBar\"  style=\"display:none\">\n\t  \t<img dojoAttachPoint=\"titleBarIcon\"  class=\"dojoFloatingPaneTitleBarIcon\">\n\t\t<div dojoAttachPoint=\"closeAction\" dojoAttachEvent=\"onClick:hide\"\n   \t  \t\tclass=\"dojoFloatingPaneCloseIcon\"></div>\n\t\t<div dojoAttachPoint=\"restoreAction\" dojoAttachEvent=\"onClick:restoreWindow\"\n   \t  \t\tclass=\"dojoFloatingPaneRestoreIcon\"></div>\n\t\t<div dojoAttachPoint=\"maximizeAction\" dojoAttachEvent=\"onClick:maximizeWindow\"\n   \t  \t\tclass=\"dojoFloatingPaneMaximizeIcon\"></div>\n\t\t<div dojoAttachPoint=\"minimizeAction\" dojoAttachEvent=\"onClick:minimizeWindow\"\n   \t  \t\tclass=\"dojoFloatingPaneMinimizeIcon\"></div>\n\t  \t<div dojoAttachPoint=\"titleBarText\" class=\"dojoFloatingPaneTitleText\">${this.title}</div>\n\t</div>\n\n\t<div id=\"${this.widgetId}_container\" dojoAttachPoint=\"containerNode\" class=\"dojoFloatingPaneClient\"></div>\n\t<span dojoattachpoint=\"tabEnd\" dojoonfocus=\"trapTabs\" dojoonblur=\"clearTrap\" tabindex=\"0\"></span>\n\t<span dojoattachpoint=\"tabEndOuter\" dojoonfocus=\"trapTabs\" dojoonblur=\"clearTrap\" tabindex=\"0\"></span>\n\t<div dojoAttachPoint=\"resizeBar\" class=\"dojoFloatingPaneResizebar\" style=\"display:none\"></div>\n</div>\n",modal:true,width:"",height:"",windowState:"minimized",displayCloseAction:true,contentFile:"",contentClass:"",fillInTemplate:function(args,frag){
this.fillInFloatingPaneTemplate(args,frag);
dojo.widget.Editor2Dialog.superclass.fillInTemplate.call(this,args,frag);
},postCreate:function(){
if(this.contentFile){
dojo.require(this.contentFile);
}
if(this.modal){
dojo.widget.ModalDialogBase.prototype.postCreate.call(this);
}else{
with(this.domNode.style){
zIndex=999;
display="none";
}
}
dojo.widget.FloatingPaneBase.prototype.postCreate.apply(this,arguments);
dojo.widget.Editor2Dialog.superclass.postCreate.call(this);
if(this.width&&this.height){
with(this.domNode.style){
width=this.width;
height=this.height;
}
}
},createContent:function(){
if(!this.contentWidget&&this.contentClass){
this.contentWidget=dojo.widget.createWidget(this.contentClass);
this.addChild(this.contentWidget);
}
},show:function(){
if(!this.contentWidget){
dojo.widget.Editor2Dialog.superclass.show.apply(this,arguments);
this.createContent();
dojo.widget.Editor2Dialog.superclass.hide.call(this);
}
if(!this.contentWidget||!this.contentWidget.loadContent()){
return;
}
this.showFloatingPane();
dojo.widget.Editor2Dialog.superclass.show.apply(this,arguments);
if(this.modal){
this.showModalDialog();
}
if(this.modal){
this.bg.style.zIndex=this.domNode.style.zIndex-1;
}
},onShow:function(){
dojo.widget.Editor2Dialog.superclass.onShow.call(this);
this.onFloatingPaneShow();
},closeWindow:function(){
this.hide();
dojo.widget.Editor2Dialog.superclass.closeWindow.apply(this,arguments);
},hide:function(){
if(this.modal){
this.hideModalDialog();
}
dojo.widget.Editor2Dialog.superclass.hide.call(this);
},checkSize:function(){
if(this.isShowing()){
if(this.modal){
this._sizeBackground();
}
this.placeModalDialog();
this.onResized();
}
}});
dojo.widget.defineWidget("dojo.widget.Editor2DialogContent",dojo.widget.HtmlWidget,{widgetsInTemplate:true,loadContent:function(){
return true;
},cancel:function(){
this.parent.hide();
}});
dojo.lang.declare("dojo.widget.Editor2DialogCommand",dojo.widget.Editor2BrowserCommand,function(_b7e,name,_b80){
this.dialogParas=_b80;
},{execute:function(){
if(!this.dialog){
if(!this.dialogParas.contentFile||!this.dialogParas.contentClass){
alert("contentFile and contentClass should be set for dojo.widget.Editor2DialogCommand.dialogParas!");
return;
}
this.dialog=dojo.widget.createWidget("Editor2Dialog",this.dialogParas);
dojo.body().appendChild(this.dialog.domNode);
dojo.event.connect(this,"destroy",this.dialog,"destroy");
}
this.dialog.show();
},getText:function(){
return this.dialogParas.title||dojo.widget.Editor2DialogCommand.superclass.getText.call(this);
}});
dojo.widget.Editor2ToolbarGroups={};
dojo.widget.defineWidget("dojo.widget.Editor2",dojo.widget.RichText,function(){
this._loadedCommands={};
},{toolbarAlwaysVisible:false,toolbarWidget:null,scrollInterval:null,toolbarTemplatePath:dojo.uri.cache.set(dojo.uri.moduleUri("dojo.widget","templates/EditorToolbarOneline.html"), "<div class=\"EditorToolbarDomNode EditorToolbarSmallBg\">\n\t<table cellpadding=\"1\" cellspacing=\"0\" border=\"0\">\n\t\t<tbody>\n\t\t\t<tr valign=\"top\" align=\"left\">\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"htmltoggle\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon\" \n\t\t\t\t\t\tstyle=\"background-image: none; width: 30px;\" >&lt;h&gt;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"copy\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Copy\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"paste\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Paste\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"undo\">\n\t\t\t\t\t\t<!-- FIXME: should we have the text \"undo\" here? -->\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Undo\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"redo\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Redo\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td isSpacer=\"true\">\n\t\t\t\t\t<span class=\"iconContainer\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Sep\"\tstyle=\"width: 5px; min-width: 5px;\"></span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"createlink\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Link\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"insertimage\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Image\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"inserthorizontalrule\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_HorizontalLine \">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"bold\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Bold\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"italic\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Italic\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"underline\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Underline\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"strikethrough\">\n\t\t\t\t\t\t<span \n\t\t\t\t\t\t\tclass=\"dojoE2TBIcon dojoE2TBIcon_StrikeThrough\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td isSpacer=\"true\">\n\t\t\t\t\t<span class=\"iconContainer\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Sep\" \n\t\t\t\t\t\t\tstyle=\"width: 5px; min-width: 5px;\"></span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"insertunorderedlist\">\n\t\t\t\t\t\t<span \n\t\t\t\t\t\t\tclass=\"dojoE2TBIcon dojoE2TBIcon_BulletedList\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"insertorderedlist\">\n\t\t\t\t\t\t<span \n\t\t\t\t\t\t\tclass=\"dojoE2TBIcon dojoE2TBIcon_NumberedList\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td isSpacer=\"true\">\n\t\t\t\t\t<span class=\"iconContainer\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Sep\" style=\"width: 5px; min-width: 5px;\"></span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"indent\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Indent\" \n\t\t\t\t\t\t\tunselectable=\"on\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"outdent\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Outdent\" \n\t\t\t\t\t\t\tunselectable=\"on\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td isSpacer=\"true\">\n\t\t\t\t\t<span class=\"iconContainer\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Sep\" style=\"width: 5px; min-width: 5px;\"></span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"forecolor\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_TextColor\" \n\t\t\t\t\t\t\tunselectable=\"on\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"hilitecolor\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_BackgroundColor\" \n\t\t\t\t\t\t\tunselectable=\"on\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td isSpacer=\"true\">\n\t\t\t\t\t<span class=\"iconContainer\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Sep\" style=\"width: 5px; min-width: 5px;\"></span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"justifyleft\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_LeftJustify\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"justifycenter\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_CenterJustify\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"justifyright\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_RightJustify\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"justifyfull\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_BlockJustify\">&nbsp;</span>\n\t\t\t\t\t</span>\n\t\t\t\t</td>\t\n\t\t\t\t<td>\n\t\t\t\t\t<select class=\"dojoEditorToolbarItem\" dojoETItemName=\"plainformatblock\">\n\t\t\t\t\t\t<!-- FIXME: using \"p\" here inserts a paragraph in most cases! -->\n\t\t\t\t\t\t<option value=\"\">-- format --</option>\n\t\t\t\t\t\t<option value=\"p\">Normal</option>\n\t\t\t\t\t\t<option value=\"pre\">Fixed Font</option>\n\t\t\t\t\t\t<option value=\"h1\">Main Heading</option>\n\t\t\t\t\t\t<option value=\"h2\">Section Heading</option>\n\t\t\t\t\t\t<option value=\"h3\">Sub-Heading</option>\n\t\t\t\t\t\t<!-- <option value=\"blockquote\">Block Quote</option> -->\n\t\t\t\t\t</select>\n\t\t\t\t</td>\n\t\t\t\t<td><!-- uncomment to enable save button -->\n\t\t\t\t\t<!-- save -->\n\t\t\t\t\t<!--span class=\"iconContainer dojoEditorToolbarItem\" dojoETItemName=\"save\">\n\t\t\t\t\t\t<span class=\"dojoE2TBIcon dojoE2TBIcon_Save\">&nbsp;</span>\n\t\t\t\t\t</span-->\n\t\t\t\t</td>\n\t\t\t\t<td width=\"*\">&nbsp;</td>\n\t\t\t</tr>\n\t\t</tbody>\n\t</table>\n</div>\n"),toolbarTemplateCssPath:null,toolbarPlaceHolder:"",_inSourceMode:false,_htmlEditNode:null,toolbarGroup:"",isToolbarGroupLeader:true,shareToolbar:false,contextMenuGroupSet:"",editorOnLoad:function(){
dojo.event.topic.publish("dojo.widget.Editor2::preLoadingToolbar",this);
if(this.toolbarAlwaysVisible){
}
if(this.toolbarWidget){
this.toolbarWidget.show();
dojo.html.insertBefore(this.toolbarWidget.domNode,this.domNode.firstChild);
}else{
if(this.shareToolbar){
dojo.deprecated("Editor2:shareToolbar is deprecated in favor of toolbarGroup","0.5");
this.toolbarGroup="defaultDojoToolbarGroup";
}
if(this.toolbarGroup){
if(dojo.widget.Editor2ToolbarGroups[this.toolbarGroup]){
this.toolbarWidget=dojo.widget.Editor2ToolbarGroups[this.toolbarGroup];
}else{
if(!this.isToolbarGroupLeader){
setTimeout("dojo.widget.byId('"+this.widgetId+"').editorOnLoad();",500);
return;
}
}
}
if(!this.toolbarWidget){
var _b81={shareGroup:this.toolbarGroup,parent:this};
_b81.templateString=dojo.uri.cache.get(this.toolbarTemplatePath);
if(this.toolbarTemplateCssPath){
_b81.templateCssPath=this.toolbarTemplateCssPath;
_b81.templateCssString=dojo.uri.cache.get(this.toolbarTemplateCssPath);
}
if(this.toolbarPlaceHolder){
this.toolbarWidget=dojo.widget.createWidget("Editor2Toolbar",_b81,dojo.byId(this.toolbarPlaceHolder),"after");
}else{
this.toolbarWidget=dojo.widget.createWidget("Editor2Toolbar",_b81,this.domNode.firstChild,"before");
}
if(this.toolbarGroup){
dojo.widget.Editor2ToolbarGroups[this.toolbarGroup]=this.toolbarWidget;
}
dojo.event.connect(this,"close",this.toolbarWidget,"hide");
this.toolbarLoaded();
}
}
dojo.event.topic.registerPublisher("Editor2.clobberFocus",this,"clobberFocus");
dojo.event.topic.subscribe("Editor2.clobberFocus",this,"setBlur");
dojo.event.topic.publish("dojo.widget.Editor2::onLoad",this);
},toolbarLoaded:function(){
},registerLoadedPlugin:function(obj){
if(!this.loadedPlugins){
this.loadedPlugins=[];
}
this.loadedPlugins.push(obj);
},unregisterLoadedPlugin:function(obj){
for(var i in this.loadedPlugins){
if(this.loadedPlugins[i]===obj){
delete this.loadedPlugins[i];
return;
}
}
dojo.debug("dojo.widget.Editor2.unregisterLoadedPlugin: unknow plugin object: "+obj);
},execCommand:function(_b85,_b86){
switch(_b85.toLowerCase()){
case "htmltoggle":
this.toggleHtmlEditing();
break;
default:
dojo.widget.Editor2.superclass.execCommand.apply(this,arguments);
}
},queryCommandEnabled:function(_b87,_b88){
switch(_b87.toLowerCase()){
case "htmltoggle":
return true;
default:
if(this._inSourceMode){
return false;
}
return dojo.widget.Editor2.superclass.queryCommandEnabled.apply(this,arguments);
}
},queryCommandState:function(_b89,_b8a){
switch(_b89.toLowerCase()){
case "htmltoggle":
return this._inSourceMode;
default:
return dojo.widget.Editor2.superclass.queryCommandState.apply(this,arguments);
}
},onClick:function(e){
dojo.widget.Editor2.superclass.onClick.call(this,e);
if(dojo.widget.PopupManager){
if(!e){
e=this.window.event;
}
dojo.widget.PopupManager.onClick(e);
}
},clobberFocus:function(){
},toggleHtmlEditing:function(){
if(this===dojo.widget.Editor2Manager.getCurrentInstance()){
if(!this._inSourceMode){
var html=this.getEditorContent();
this._inSourceMode=true;
if(!this._htmlEditNode){
this._htmlEditNode=dojo.doc().createElement("textarea");
dojo.html.insertAfter(this._htmlEditNode,this.editorObject);
}
this._htmlEditNode.style.display="";
this._htmlEditNode.style.width="100%";
this._htmlEditNode.style.height=dojo.html.getBorderBox(this.editNode).height+"px";
this._htmlEditNode.value=html;
with(this.editorObject.style){
position="absolute";
left="-2000px";
top="-2000px";
}
}else{
this._inSourceMode=false;
this._htmlEditNode.blur();
with(this.editorObject.style){
position="";
left="";
top="";
}
var html=this._htmlEditNode.value;
dojo.lang.setTimeout(this,"replaceEditorContent",1,html);
this._htmlEditNode.style.display="none";
this.focus();
}
this.onDisplayChanged(null,true);
}
},setFocus:function(){
if(dojo.widget.Editor2Manager.getCurrentInstance()===this){
return;
}
this.clobberFocus();
dojo.widget.Editor2Manager.setCurrentInstance(this);
},setBlur:function(){
},saveSelection:function(){
this._bookmark=null;
this._bookmark=dojo.withGlobal(this.window,dojo.html.selection.getBookmark);
},restoreSelection:function(){
if(this._bookmark){
this.focus();
dojo.withGlobal(this.window,"moveToBookmark",dojo.html.selection,[this._bookmark]);
this._bookmark=null;
}else{
dojo.debug("restoreSelection: no saved selection is found!");
}
},_updateToolbarLastRan:null,_updateToolbarTimer:null,_updateToolbarFrequency:500,updateToolbar:function(_b8d){
if((!this.isLoaded)||(!this.toolbarWidget)){
return;
}
var diff=new Date()-this._updateToolbarLastRan;
if((!_b8d)&&(this._updateToolbarLastRan)&&((diff<this._updateToolbarFrequency))){
clearTimeout(this._updateToolbarTimer);
var _b8f=this;
this._updateToolbarTimer=setTimeout(function(){
_b8f.updateToolbar();
},this._updateToolbarFrequency/2);
return;
}else{
this._updateToolbarLastRan=new Date();
}
if(dojo.widget.Editor2Manager.getCurrentInstance()!==this){
return;
}
this.toolbarWidget.update();
},destroy:function(_b90){
this._htmlEditNode=null;
dojo.event.disconnect(this,"close",this.toolbarWidget,"hide");
if(!_b90){
this.toolbarWidget.destroy();
}
dojo.widget.Editor2.superclass.destroy.call(this);
},_lastStateTimestamp:0,onDisplayChanged:function(e,_b92){
this._lastStateTimestamp=(new Date()).getTime();
dojo.widget.Editor2.superclass.onDisplayChanged.call(this,e);
this.updateToolbar(_b92);
},onLoad:function(){
try{
dojo.widget.Editor2.superclass.onLoad.call(this);
}
catch(e){
dojo.debug(e);
}
this.editorOnLoad();
},onFocus:function(){
dojo.widget.Editor2.superclass.onFocus.call(this);
this.setFocus();
},getEditorContent:function(){
if(this._inSourceMode){
return this._htmlEditNode.value;
}
return dojo.widget.Editor2.superclass.getEditorContent.call(this);
},replaceEditorContent:function(html){
if(this._inSourceMode){
this._htmlEditNode.value=html;
return;
}
dojo.widget.Editor2.superclass.replaceEditorContent.apply(this,arguments);
},getCommand:function(name){
if(this._loadedCommands[name]){
return this._loadedCommands[name];
}
var cmd=dojo.widget.Editor2Manager.getCommand(this,name);
this._loadedCommands[name]=cmd;
return cmd;
},shortcuts:[["bold"],["italic"],["underline"],["selectall","a"],["insertunorderedlist","\\"]],setupDefaultShortcuts:function(){
var exec=function(cmd){
return function(){
cmd.execute();
};
};
var self=this;
dojo.lang.forEach(this.shortcuts,function(item){
var cmd=self.getCommand(item[0]);
if(cmd){
self.addKeyHandler(item[1]?item[1]:item[0].charAt(0),item[2]==undefined?self.KEY_CTRL:item[2],exec(cmd));
}
});
}});
dojo.provide("dojo.widget.Editor2Plugin.CreateLinkDialog");
dojo.widget.defineWidget("dojo.widget.Editor2CreateLinkDialog",dojo.widget.Editor2DialogContent,{templateString:"<table>\n<tr><td>URL</td><td> <input type=\"text\" dojoAttachPoint=\"link_href\" name=\"dojo_createLink_href\"/></td></tr>\n<tr><td>Target </td><td><select dojoAttachPoint=\"link_target\">\n\t<option value=\"\">Self</option>\n\t<option value=\"_blank\">New Window</option>\n\t<option value=\"_top\">Top Window</option>\n\t</select></td></tr>\n<tr><td>Class </td><td><input type=\"text\" dojoAttachPoint=\"link_class\" /></td></tr>\n<tr><td colspan=\"2\">\n\t<table><tr>\n\t<td><button dojoType='Button' dojoAttachEvent='onClick:ok'>OK</button></td>\n\t<td><button dojoType='Button' dojoAttachEvent='onClick:cancel'>Cancel</button></td>\n\t</tr></table>\n\t</td></tr>\n</table>\n",editableAttributes:["href","target","class"],loadContent:function(){
var _b9b=dojo.widget.Editor2Manager.getCurrentInstance();
_b9b.saveSelection();
this.linkNode=dojo.withGlobal(_b9b.window,"getAncestorElement",dojo.html.selection,["a"]);
var _b9c={};
this.extraAttribText="";
if(this.linkNode){
var _b9d=this.linkNode.attributes;
for(var i=0;i<_b9d.length;i++){
if(dojo.lang.find(this.editableAttributes,_b9d[i].name.toLowerCase())>-1){
_b9c[_b9d[i].name]=_b9d[i].value;
}else{
if(_b9d[i].specified==undefined||_b9d[i].specified){
this.extraAttribText+=_b9d[i].name+"=\""+_b9d[i].value+"\" ";
}
}
}
}else{
var html=dojo.withGlobal(_b9b.window,"getSelectedText",dojo.html.selection);
if(html==null||html.length==0){
alert("Please select some text to create a link.");
return false;
}
}
for(var i=0;i<this.editableAttributes.length;++i){
name=this.editableAttributes[i];
this["link_"+name].value=(_b9c[name]==undefined)?"":_b9c[name];
}
return true;
},ok:function(){
var _ba0=dojo.widget.Editor2Manager.getCurrentInstance();
_ba0.restoreSelection();
if(!this.linkNode){
var html=dojo.withGlobal(_ba0.window,"getSelectedHtml",dojo.html.selection);
}else{
var html=this.linkNode.innerHTML;
dojo.withGlobal(_ba0.window,"selectElement",dojo.html.selection,[this.linkNode]);
}
var _ba2="";
for(var i=0;i<this.editableAttributes.length;++i){
name=this.editableAttributes[i];
var _ba4=this["link_"+name].value;
if(_ba4.length>0){
_ba2+=name+"=\""+_ba4+"\" ";
}
}
_ba0.execCommand("inserthtml","<a "+_ba2+this.extraAttribText+">"+html+"</a>");
this.cancel();
}});
dojo.provide("dojo.widget.Editor2Plugin.InsertTableDialog");
dojo.widget.defineWidget("dojo.widget.Editor2InsertTableDialog",dojo.widget.Editor2DialogContent,{templateString:"<div>\n<table cellSpacing=\"1\" cellPadding=\"1\" width=\"100%\" border=\"0\">\n\t<tr>\n\t\t<td valign=\"top\">\n\t\t\t<table cellSpacing=\"0\" cellPadding=\"0\" border=\"0\">\n\t\t\t\t<tr>\n\n\t\t\t\t\t<td><span>Rows</span>:</td>\n\t\t\t\t\t<td>&nbsp;<input dojoAttachPoint=\"table_rows\" type=\"text\" maxLength=\"3\" size=\"2\" value=\"3\"></td>\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td><span>Columns</span>:</td>\n\t\t\t\t\t<td>&nbsp;<input dojoAttachPoint=\"table_cols\" type=\"text\" maxLength=\"2\" size=\"2\" value=\"2\"></td>\n\t\t\t\t</tr>\n\n\t\t\t\t<tr>\n\t\t\t\t\t<td>&nbsp;</td>\n\t\t\t\t\t<td>&nbsp;</td>\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td><span>Border size</span>:</td>\n\t\t\t\t\t<td>&nbsp;<INPUT dojoAttachPoint=\"table_border\" type=\"text\" maxLength=\"2\" size=\"2\" value=\"1\"></td>\n\t\t\t\t</tr>\n\n\t\t\t\t<tr>\n\t\t\t\t\t<td><span>Alignment</span>:</td>\n\t\t\t\t\t<td>&nbsp;<select dojoAttachPoint=\"table_align\">\n\t\t\t\t\t\t\t<option value=\"\" selected>&lt;Not set&gt;</option>\n\t\t\t\t\t\t\t<option value=\"left\">Left</option>\n\t\t\t\t\t\t\t<option value=\"center\">Center</option>\n\t\t\t\t\t\t\t<option value=\"right\">Right</option>\n\t\t\t\t\t\t</select></td>\n\t\t\t\t</tr>\n\t\t\t</table>\n\t\t</td>\n\t\t<td>&nbsp;&nbsp;&nbsp;</td>\n\t\t<td align=\"right\" valign=\"top\">\n\t\t\t<table cellSpacing=\"0\" cellPadding=\"0\" border=\"0\">\n\t\t\t\t<tr>\n\t\t\t\t\t<td><span>Width</span>:</td>\n\t\t\t\t\t<td>&nbsp;<input dojoAttachPoint=\"table_width\" type=\"text\" maxLength=\"4\" size=\"3\"></td>\n\t\t\t\t\t<td>&nbsp;<select dojoAttachPoint=\"table_widthtype\">\n\t\t\t\t\t\t\t<option value=\"percent\" selected>percent</option>\n\t\t\t\t\t\t\t<option value=\"pixels\">pixels</option>\n\t\t\t\t\t\t</select></td>\n\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td><span>Height</span>:</td>\n\t\t\t\t\t<td>&nbsp;<INPUT dojoAttachPoint=\"table_height\" type=\"text\" maxLength=\"4\" size=\"3\"></td>\n\t\t\t\t\t<td>&nbsp;<span>pixels</span></td>\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td>&nbsp;</td>\n\t\t\t\t\t<td>&nbsp;</td>\n\t\t\t\t\t<td>&nbsp;</td>\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td nowrap><span>Cell spacing</span>:</td>\n\t\t\t\t\t<td>&nbsp;<input dojoAttachPoint=\"table_cellspacing\" type=\"text\" maxLength=\"2\" size=\"2\" value=\"1\"></td>\n\t\t\t\t\t<td>&nbsp;</td>\n\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td nowrap><span>Cell padding</span>:</td>\n\t\t\t\t\t<td>&nbsp;<input dojoAttachPoint=\"table_cellpadding\" type=\"text\" maxLength=\"2\" size=\"2\" value=\"1\"></td>\n\t\t\t\t\t<td>&nbsp;</td>\n\t\t\t\t</tr>\n\t\t\t</table>\n\t\t</td>\n\t</tr>\n</table>\n<table cellSpacing=\"0\" cellPadding=\"0\" width=\"100%\" border=\"0\">\n\t<tr>\n\t\t<td nowrap><span>Caption</span>:</td>\n\t\t<td>&nbsp;</td>\n\t\t<td width=\"100%\" nowrap>&nbsp;\n\t\t\t<input dojoAttachPoint=\"table_caption\" type=\"text\" style=\"WIDTH: 90%\"></td>\n\t</tr>\n\t<tr>\n\t\t<td nowrap><span>Summary</span>:</td>\n\t\t<td>&nbsp;</td>\n\t\t<td width=\"100%\" nowrap>&nbsp;\n\t\t\t<input dojoAttachPoint=\"table_summary\" type=\"text\" style=\"WIDTH: 90%\"></td>\n\t</tr>\n</table>\n<table><tr>\n<td><button dojoType='Button' dojoAttachEvent='onClick:ok'>Ok</button></td>\n<td><button dojoType='Button' dojoAttachEvent='onClick:cancel'>Cancel</button></td>\n</tr></table>\n</div>\n",editableAttributes:["summary","height","cellspacing","cellpadding","border","align"],loadContent:function(){
var _ba5=dojo.widget.Editor2Manager.getCurrentInstance();
_ba5.saveSelection();
this.tableNode=dojo.withGlobal(_ba5.window,"getSelectedElement",dojo.html.selection);
if(!this.tableNode||this.tableNode.tagName.toLowerCase()!="table"){
this.tableNode=dojo.withGlobal(_ba5.window,"getAncestorElement",dojo.html.selection,["table"]);
}
var _ba6={};
this.extraAttribText="";
if(this.tableNode){
this["table_rows"].value=this.tableNode.rows.length;
this["table_rows"].disabled=true;
this["table_cols"].value=this.tableNode.rows[0].cells.length;
this["table_cols"].disabled=true;
if(this.tableNode.caption){
this["table_caption"].value=this.tableNode.caption.innerHTML;
}else{
this["table_caption"].value="";
}
var _ba7=this.tableNode.style.width||this.tableNode.width;
if(_ba7){
this["table_width"].value=parseInt(_ba7);
if(_ba7.indexOf("%")>-1){
this["table_widthtype"].value="percent";
}else{
this["table_widthtype"].value="pixels";
}
}else{
this["table_width"].value="100";
}
var _ba8=this.tableNode.style.height||this.tableNode.height;
if(_ba8){
this["table_height"].value=parseInt(_ba7);
}else{
this["table_height"].value="";
}
var _ba9=this.tableNode.attributes;
for(var i=0;i<_ba9.length;i++){
if(dojo.lang.find(this.editableAttributes,_ba9[i].name.toLowerCase())>-1){
_ba6[_ba9[i].name]=_ba9[i].value;
}else{
this.extraAttribText+=_ba9[i].name+"=\""+_ba9[i].value+"\" ";
}
}
}else{
this["table_rows"].value=3;
this["table_rows"].disabled=false;
this["table_cols"].value=2;
this["table_cols"].disabled=false;
this["table_width"].value=100;
this["table_widthtype"].value="percent";
this["table_height"].value="";
}
for(var i=0;i<this.editableAttributes.length;++i){
name=this.editableAttributes[i];
this["table_"+name].value=(_ba6[name]==undefined)?"":_ba6[name];
if(name=="height"&&_ba6[name]!=undefined){
this["table_"+name].value=_ba6[name];
}
}
return true;
},ok:function(){
var _bab=dojo.widget.Editor2Manager.getCurrentInstance();
var args={};
args["rows"]=this["table_rows"].value;
args["cols"]=this["table_cols"].value;
args["caption"]=this["table_caption"].value;
args["tableattrs"]="";
if(this["table_widthtype"].value=="percent"){
args["tableattrs"]+="width=\""+this["table_width"].value+"%\" ";
}else{
args["tableattrs"]+="width=\""+this["table_width"].value+"px\" ";
}
for(var i=0;i<this.editableAttributes.length;++i){
var name=this.editableAttributes[i];
var _baf=this["table_"+name].value;
if(_baf.length>0){
args["tableattrs"]+=name+"=\""+_baf+"\" ";
}
}
if(!args["tableattrs"]){
args["tableattrs"]="";
}
if(dojo.render.html.ie&&!this["table_border"].value){
args["tableattrs"]+="class=\"dojoShowIETableBorders\" ";
}
var html="<table "+args["tableattrs"]+">";
if(args["caption"]){
html+="<caption>"+args["caption"]+"</caption>";
}
var _bb1="<tbody>";
if(this.tableNode){
var _bb2=this.tableNode.getElementsByTagName("tbody")[0];
_bb1=_bb2.outerHTML;
if(!_bb1){
var _bb3=_bb2.cloneNode(true);
var _bb4=_bb2.ownerDocument.createElement("div");
_bb4.appendChild(_bb3);
_bb1=_bb4.innerHTML;
}
dojo.withGlobal(_bab.window,"selectElement",dojo.html.selection,[this.tableNode]);
}else{
var cols="<tr>";
for(var i=0;i<+args.cols;i++){
cols+="<td></td>";
}
cols+="</tr>";
for(var i=0;i<args.rows;i++){
_bb1+=cols;
}
_bb1+="</tbody>";
}
html+=_bb1+"</table>";
_bab.restoreSelection();
_bab.execCommand("inserthtml",html);
this.cancel();
}});
dojo.provide("dojo.widget.Editor2Plugin.TableOperation");
dojo.event.topic.subscribe("dojo.widget.RichText::init",function(_bb6){
if(dojo.render.html.ie){
_bb6.contentDomPreFilters.push(dojo.widget.Editor2Plugin.TableOperation.showIETableBorder);
_bb6.contentDomPostFilters.push(dojo.widget.Editor2Plugin.TableOperation.removeIEFakeClass);
}
_bb6.getCommand("toggletableborder");
});
dojo.lang.declare("dojo.widget.Editor2Plugin.deleteTableCommand",dojo.widget.Editor2Command,{execute:function(){
var _bb7=dojo.withGlobal(this._editor.window,"getAncestorElement",dojo.html.selection,["table"]);
if(_bb7){
dojo.withGlobal(this._editor.window,"selectElement",dojo.html.selection,[_bb7]);
this._editor.execCommand("inserthtml"," ");
}
},getState:function(){
if(this._editor._lastStateTimestamp>this._updateTime||this._state==undefined){
this._updateTime=this._editor._lastStateTimestamp;
var _bb8=dojo.withGlobal(this._editor.window,"hasAncestorElement",dojo.html.selection,["table"]);
this._state=_bb8?dojo.widget.Editor2Manager.commandState.Enabled:dojo.widget.Editor2Manager.commandState.Disabled;
}
return this._state;
},getText:function(){
return "Delete Table";
}});
dojo.lang.declare("dojo.widget.Editor2Plugin.toggleTableBorderCommand",dojo.widget.Editor2Command,function(){
this._showTableBorder=false;
dojo.event.connect(this._editor,"editorOnLoad",this,"execute");
},{execute:function(){
if(this._showTableBorder){
this._showTableBorder=false;
if(dojo.render.html.moz){
this._editor.removeStyleSheet(dojo.uri.moduleUri("dojo.widget","templates/Editor2/showtableborder_gecko.css"));
}else{
if(dojo.render.html.ie){
this._editor.removeStyleSheet(dojo.uri.moduleUri("dojo.widget","templates/Editor2/showtableborder_ie.css"));
}
}
}else{
this._showTableBorder=true;
if(dojo.render.html.moz){
this._editor.addStyleSheet(dojo.uri.moduleUri("dojo.widget","templates/Editor2/showtableborder_gecko.css"));
}else{
if(dojo.render.html.ie){
this._editor.addStyleSheet(dojo.uri.moduleUri("dojo.widget","templates/Editor2/showtableborder_ie.css"));
}
}
}
},getText:function(){
return "Toggle Table Border";
},getState:function(){
return this._showTableBorder?dojo.widget.Editor2Manager.commandState.Latched:dojo.widget.Editor2Manager.commandState.Enabled;
}});
dojo.widget.Editor2Plugin.TableOperation={getCommand:function(_bb9,name){
switch(name.toLowerCase()){
case "toggletableborder":
return new dojo.widget.Editor2Plugin.toggleTableBorderCommand(_bb9,name);
case "inserttable":
return new dojo.widget.Editor2DialogCommand(_bb9,"inserttable",{contentFile:"dojo.widget.Editor2Plugin.InsertTableDialog",contentClass:"Editor2InsertTableDialog",title:"Insert/Edit Table",width:"450px",height:"250px"});
case "deletetable":
return new dojo.widget.Editor2Plugin.deleteTableCommand(_bb9,name);
}
},getToolbarItem:function(name){
var name=name.toLowerCase();
var item;
switch(name){
case "inserttable":
case "toggletableborder":
item=new dojo.widget.Editor2ToolbarButton(name);
}
return item;
},getContextMenuGroup:function(name,_bbe){
return new dojo.widget.Editor2Plugin.TableContextMenuGroup(_bbe);
},showIETableBorder:function(dom){
var _bc0=dom.getElementsByTagName("table");
dojo.lang.forEach(_bc0,function(t){
dojo.html.addClass(t,"dojoShowIETableBorders");
});
return dom;
},removeIEFakeClass:function(dom){
var _bc3=dom.getElementsByTagName("table");
dojo.lang.forEach(_bc3,function(t){
dojo.html.removeClass(t,"dojoShowIETableBorders");
});
return dom;
}};
dojo.widget.Editor2Manager.registerHandler(dojo.widget.Editor2Plugin.TableOperation.getCommand);
dojo.widget.Editor2ToolbarItemManager.registerHandler(dojo.widget.Editor2Plugin.TableOperation.getToolbarItem);
if(dojo.widget.Editor2Plugin.ContextMenuManager){
dojo.widget.Editor2Plugin.ContextMenuManager.registerGroup("Table",dojo.widget.Editor2Plugin.TableOperation.getContextMenuGroup);
dojo.declare("dojo.widget.Editor2Plugin.TableContextMenuGroup",dojo.widget.Editor2Plugin.SimpleContextMenuGroup,{createItems:function(){
this.items.push(dojo.widget.createWidget("Editor2ContextMenuItem",{caption:"Delete Table",command:"deletetable"}));
this.items.push(dojo.widget.createWidget("Editor2ContextMenuItem",{caption:"Table Property",command:"inserttable",iconClass:"TB_Button_Icon TB_Button_Table"}));
},checkVisibility:function(){
var _bc5=dojo.widget.Editor2Manager.getCurrentInstance();
var _bc6=dojo.withGlobal(_bc5.window,"hasAncestorElement",dojo.html.selection,["table"]);
if(dojo.withGlobal(_bc5.window,"hasAncestorElement",dojo.html.selection,["table"])){
this.items[0].show();
this.items[1].show();
return true;
}else{
this.items[0].hide();
this.items[1].hide();
return false;
}
}});
}

