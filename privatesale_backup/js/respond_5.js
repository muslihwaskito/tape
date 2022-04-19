/* Respond.js: min/max-width media query polyfill. (c) Scott Jehl. MIT Lic. j.mp/respondjs  */
(function( w ){
	
	"use strict";
	
	//exposed namespace
	var respond = {};
	w.respond = respond;

	//define update even in native-mq-supporting browsers, to avoid errors
	respond.update = function(){};

	//define ajax obj
	var requestQueue = [],
		xmlHttp = (function() {
			var xmlhttpmethod = false;
			try {
				xmlhttpmethod = new w.XMLHttpRequest();
			}
			catch( e ){
				xmlhttpmethod = new w.ActiveXObject( "Microsoft.XMLHTTP" );
			}
			return function(){
				return xmlhttpmethod;
			};
		})(),

		//tweaked Ajax functions from Quirksmode
		ajax = function( url, callback ) {
			var req = xmlHttp();
			if (!req){
				return;
			}
			req.open( "GET", url, true );
			req.onreadystatechange = function () {
				if ( req.readyState !== 4 || req.status !== 200 && req.status !== 304 ){
					return;
				}
				callback( req.responseText );
			};
			if ( req.readyState === 4 ){
				return;
			}
			req.send( null );
		},
		isUnsupportedMediaQuery = function( query ) {
			return query.replace( respond.regex.minmaxwh, '' ).match( respond.regex.other );
		};

	//expose for testing
	respond.ajax = ajax;
	respond.queue = requestQueue;
	respond.unsupportedmq = isUnsupportedMediaQuery;
	respond.regex = {
		media: /@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi,
		keyframes: /@(?:\-(?:o|moz|webkit)\-)?keyframes[^\{]+\{(?:[^\{\}]*\{[^\}\{]*\})+[^\}]*\}/gi,
		comments: /\/\*[^*]*\*+([^/][^*]*\*+)*\//gi,
		urls: /(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g,
		findStyles: /@media *([^\{]+)\{([\S\s]+?)$/,
		only: /(only\s+)?([a-zA-Z]+)\s?/,
		minw: /\(\s*min\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/,
		maxw: /\(\s*max\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/,
		minmaxwh: /\(\s*m(in|ax)\-(height|width)\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/gi,
		other: /\([^\)]*\)/g
	};

	//expose media query support flag for external use
	respond.mediaQueriesSupported = w.matchMedia && w.matchMedia( "only all" ) !== null && w.matchMedia( "only all" ).matches;

	//if media queries are supported, exit here
	if( respond.mediaQueriesSupported ){
		return;
	}

	//define vars
	var doc = w.document,
		docElem = doc.documentElement,
		mediastyles = [],
		rules = [],
		appendedEls = [],
		parsedSheets = {},
		resizeThrottle = 30,
		head = doc.getElementsByTagName( "head" )[0] || docElem,
		base = doc.getElementsByTagName( "base" )[0],
		links = head.getElementsByTagName( "link" ),

		lastCall,
		resizeDefer,

		//cached container for 1em value, populated the first time it's needed
		eminpx,

		// returns the value of 1em in pixels
		getEmValue = function() {
			var ret,
				div = doc.createElement('div'),
				body = doc.body,
				originalHTMLFontSize = docElem.style.fontSize,
				originalBodyFontSize = body && body.style.fontSize,
				fakeUsed = false;

			div.style.cssText = "position:absolute;font-size:1em;width:1em";

			if( !body ){
				body = fakeUsed = doc.createElement( "body" );
				body.style.background = "none";
			}

			// 1em in a media query is the value of the default font size of the browser
			// reset docElem and body to ensure the correct value is returned
			docElem.style.fontSize = "100%";
			body.style.fontSize = "100%";

			body.appendChild( div );

			if( fakeUsed ){
				docElem.insertBefore( body, docElem.firstChild );
			}

			ret = div.offsetWidth;

			if( fakeUsed ){
				docElem.removeChild( body );
			}
			else {
				body.removeChild( div );
			}

			// restore the original values
			docElem.style.fontSize = originalHTMLFontSize;
			if( originalBodyFontSize ) {
				body.style.fontSize = originalBodyFontSize;
			}


			//also update eminpx before returning
			ret = eminpx = parseFloat(ret);

			return ret;
		},

		//enable/disable styles
		applyMedia = function( fromResize ){
			var name = "clientWidth",
				docElemProp = docElem[ name ],
				currWidth = doc.compatMode === "CSS1Compat" && docElemProp || doc.body[ name ] || docElemProp,
				styleBlocks	= {},
				lastLink = links[ links.length-1 ],
				now = (new Date()).getTime();

			//throttle resize calls
			if( fromResize && lastCall && now - lastCall < resizeThrottle ){
				w.clearTimeout( resizeDefer );
				resizeDefer = w.setTimeout( applyMedia, resizeThrottle );
				return;
			}
			else {
				lastCall = now;
			}

			for( var i in mediastyles ){
				if( mediastyles.hasOwnProperty( i ) ){
					var thisstyle = mediastyles[ i ],
						min = thisstyle.minw,
						max = thisstyle.maxw,
						minnull = min === null,
						maxnull = max === null,
						em = "em";

					if( !!min ){
						min = parseFloat( min ) * ( min.indexOf( em ) > -1 ? ( eminpx || getEmValue() ) : 1 );
					}
					if( !!max ){
						max = parseFloat( max ) * ( max.indexOf( em ) > -1 ? ( eminpx || getEmValue() ) : 1 );
					}

					// if there's no media query at all (the () part), or min or max is not null, and if either is present, they're true
					if( !thisstyle.hasquery || ( !minnull || !maxnull ) && ( minnull || currWidth >= min ) && ( maxnull || currWidth <= max ) ){
						if( !styleBlocks[ thisstyle.media ] ){
							styleBlocks[ thisstyle.media ] = [];
						}
						styleBlocks[ thisstyle.media ].push( rules[ thisstyle.rules ] );
					}
				}
			}

			//remove any existing respond style element(s)
			for( var j in appendedEls ){
				if( appendedEls.hasOwnProperty( j ) ){
					if( appendedEls[ j ] && appendedEls[ j ].parentNode === head ){
						head.removeChild( appendedEls[ j ] );
					}
				}
			}
			appendedEls.length = 0;

			//inject active styles, grouped by media type
			for( var k in styleBlocks ){
				if( styleBlocks.hasOwnProperty( k ) ){
					var ss = doc.createElement( "style" ),
						css = styleBlocks[ k ].join( "\n" );

					ss.type = "text/css";
					ss.media = k;

					//originally, ss was appended to a documentFragment and sheets were appended in bulk.
					//this caused crashes in IE in a number of circumstances, such as when the HTML element had a bg image set, so appending beforehand seems best. Thanks to @dvelyk for the initial research on this one!
					head.insertBefore( ss, lastLink.nextSibling );

					if ( ss.styleSheet ){
						ss.styleSheet.cssText = css;
					}
					else {
						ss.appendChild( doc.createTextNode( css ) );
					}

					//push to appendedEls to track for later removal
					appendedEls.push( ss );
				}
			}
		},
		//find media blocks in css text, convert to style blocks
		translate = function( styles, href, media ){
			var qs = styles.replace( respond.regex.comments, '' )
					.replace( respond.regex.keyframes, '' )
					.match( respond.regex.media ),
				ql = qs && qs.length || 0;

			//try to get CSS path
			href = href.substring( 0, href.lastIndexOf( "/" ) );

			var repUrls = function( css ){
					return css.replace( respond.regex.urls, "$1" + href + "$2$3" );
				},
				useMedia = !ql && media;

			//if path exists, tack on trailing slash
			if( href.length ){ href += "/"; }

			//if no internal queries exist, but media attr does, use that
			//note: this currently lacks support for situations where a media attr is specified on a link AND
				//its associated stylesheet has internal CSS media queries.
				//In those cases, the media attribute will currently be ignored.
			if( useMedia ){
				ql = 1;
			}

			for( var i = 0; i < ql; i++ ){
				var fullq, thisq, eachq, eql;

				//media attr
				if( useMedia ){
					fullq = media;
					rules.push( repUrls( styles ) );
				}
				//parse for styles
				else{
					fullq = qs[ i ].match( respond.regex.findStyles ) && RegExp.$1;
					rules.push( RegExp.$2 && repUrls( RegExp.$2 ) );
				}

				eachq = fullq.split( "," );
				eql = eachq.length;

				for( var j = 0; j < eql; j++ ){
					thisq = eachq[ j ];

					if( isUnsupportedMediaQuery( thisq ) ) {
						continue;
					}

					mediastyles.push( {
						media : thisq.split( "(" )[ 0 ].match( respond.regex.only ) && RegExp.$2 || "all",
						rules : rules.length - 1,
						hasquery : thisq.indexOf("(") > -1,
						minw : thisq.match( respond.regex.minw ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" ),
						maxw : thisq.match( respond.regex.maxw ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" )
					} );
				}
			}

			applyMedia();
		},

		//recurse through request queue, get css text
		makeRequests = function(){
			if( requestQueue.length ){
				var thisRequest = requestQueue.shift();

				ajax( thisRequest.href, function( styles ){
					translate( styles, thisRequest.href, thisRequest.media );
					parsedSheets[ thisRequest.href ] = true;

					// by wrapping recursive function call in setTimeout
					// we prevent "Stack overflow" error in IE7
					w.setTimeout(function(){ makeRequests(); },0);
				} );
			}
		},

		//loop stylesheets, send text content to translate
		ripCSS = function(){

			for( var i = 0; i < links.length; i++ ){
				var sheet = links[ i ],
				href = sheet.href,
				media = sheet.media,
				isCSS = sheet.rel && sheet.rel.toLowerCase() === "stylesheet";

				//only links plz and prevent re-parsing
				if( !!href && isCSS && !parsedSheets[ href ] ){
					// selectivizr exposes css through the rawCssText expando
					if (sheet.styleSheet && sheet.styleSheet.rawCssText) {
						translate( sheet.styleSheet.rawCssText, href, media );
						parsedSheets[ href ] = true;
					} else {
						if( (!/^([a-zA-Z:]*\/\/)/.test( href ) && !base) ||
							href.replace( RegExp.$1, "" ).split( "/" )[0] === w.location.host ){
							// IE7 doesn't handle urls that start with '//' for ajax request
							// manually add in the protocol
							if ( href.substring(0,2) === "//" ) { href = w.location.protocol + href; }
							requestQueue.push( {
								href: href,
								media: media
							} );
						}
					}
				}
			}
			makeRequests();
		};

	//translate CSS
	ripCSS();

	//expose update for re-running respond later on
	respond.update = ripCSS;

	//expose getEmValue
	respond.getEmValue = getEmValue;

	//adjust on resize
	function callMedia(){
		applyMedia( true );
	}

	if( w.addEventListener ){
		w.addEventListener( "resize", callMedia, false );
	}
	else if( w.attachEvent ){
		w.attachEvent( "onresize", callMedia );
	}
})(this);

/* Placeholders.js v4.0.1 */
/*!
 * The MIT License
 *
 * Copyright (c) 2012 James Allardice
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
!function(a){"use strict";function b(){}function c(){try{return document.activeElement}catch(a){}}function d(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return!0;return!1}function e(a,b,c){return a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent?a.attachEvent("on"+b,c):void 0}function f(a,b){var c;a.createTextRange?(c=a.createTextRange(),c.move("character",b),c.select()):a.selectionStart&&(a.focus(),a.setSelectionRange(b,b))}function g(a,b){try{return a.type=b,!0}catch(c){return!1}}function h(a,b){if(a&&a.getAttribute(B))b(a);else for(var c,d=a?a.getElementsByTagName("input"):N,e=a?a.getElementsByTagName("textarea"):O,f=d?d.length:0,g=e?e.length:0,h=f+g,i=0;h>i;i++)c=f>i?d[i]:e[i-f],b(c)}function i(a){h(a,k)}function j(a){h(a,l)}function k(a,b){var c=!!b&&a.value!==b,d=a.value===a.getAttribute(B);if((c||d)&&"true"===a.getAttribute(C)){a.removeAttribute(C),a.value=a.value.replace(a.getAttribute(B),""),a.className=a.className.replace(A,"");var e=a.getAttribute(I);parseInt(e,10)>=0&&(a.setAttribute("maxLength",e),a.removeAttribute(I));var f=a.getAttribute(D);return f&&(a.type=f),!0}return!1}function l(a){var b=a.getAttribute(B);if(""===a.value&&b){a.setAttribute(C,"true"),a.value=b,a.className+=" "+z;var c=a.getAttribute(I);c||(a.setAttribute(I,a.maxLength),a.removeAttribute("maxLength"));var d=a.getAttribute(D);return d?a.type="text":"password"===a.type&&g(a,"text")&&a.setAttribute(D,"password"),!0}return!1}function m(a){return function(){P&&a.value===a.getAttribute(B)&&"true"===a.getAttribute(C)?f(a,0):k(a)}}function n(a){return function(){l(a)}}function o(a){return function(){i(a)}}function p(a){return function(b){return v=a.value,"true"===a.getAttribute(C)&&v===a.getAttribute(B)&&d(x,b.keyCode)?(b.preventDefault&&b.preventDefault(),!1):void 0}}function q(a){return function(){k(a,v),""===a.value&&(a.blur(),f(a,0))}}function r(a){return function(){a===c()&&a.value===a.getAttribute(B)&&"true"===a.getAttribute(C)&&f(a,0)}}function s(a){var b=a.form;b&&"string"==typeof b&&(b=document.getElementById(b),b.getAttribute(E)||(e(b,"submit",o(b)),b.setAttribute(E,"true"))),e(a,"focus",m(a)),e(a,"blur",n(a)),P&&(e(a,"keydown",p(a)),e(a,"keyup",q(a)),e(a,"click",r(a))),a.setAttribute(F,"true"),a.setAttribute(B,T),(P||a!==c())&&l(a)}var t=document.createElement("input"),u=void 0!==t.placeholder;if(a.Placeholders={nativeSupport:u,disable:u?b:i,enable:u?b:j},!u){var v,w=["text","search","url","tel","email","password","number","textarea"],x=[27,33,34,35,36,37,38,39,40,8,46],y="#ccc",z="placeholdersjs",A=new RegExp("(?:^|\\s)"+z+"(?!\\S)"),B="data-placeholder-value",C="data-placeholder-active",D="data-placeholder-type",E="data-placeholder-submit",F="data-placeholder-bound",G="data-placeholder-focus",H="data-placeholder-live",I="data-placeholder-maxlength",J=100,K=document.getElementsByTagName("head")[0],L=document.documentElement,M=a.Placeholders,N=document.getElementsByTagName("input"),O=document.getElementsByTagName("textarea"),P="false"===L.getAttribute(G),Q="false"!==L.getAttribute(H),R=document.createElement("style");R.type="text/css";var S=document.createTextNode("."+z+" {color:"+y+";}");R.styleSheet?R.styleSheet.cssText=S.nodeValue:R.appendChild(S),K.insertBefore(R,K.firstChild);for(var T,U,V=0,W=N.length+O.length;W>V;V++)U=V<N.length?N[V]:O[V-N.length],T=U.attributes.placeholder,T&&(T=T.nodeValue,T&&d(w,U.type)&&s(U));var X=setInterval(function(){for(var a=0,b=N.length+O.length;b>a;a++)U=a<N.length?N[a]:O[a-N.length],T=U.attributes.placeholder,T?(T=T.nodeValue,T&&d(w,U.type)&&(U.getAttribute(F)||s(U),(T!==U.getAttribute(B)||"password"===U.type&&!U.getAttribute(D))&&("password"===U.type&&!U.getAttribute(D)&&g(U,"text")&&U.setAttribute(D,"password"),U.value===U.getAttribute(B)&&(U.value=T),U.setAttribute(B,T)))):U.getAttribute(C)&&(k(U),U.removeAttribute(B));Q||clearInterval(X)},J);e(a,"beforeunload",function(){M.disable()})}}(this);


/* Slick Nav */

/*!
 * SlickNav Responsive Mobile Menu v1.0.7
 * (c) 2016 Josh Cope
 * licensed under MIT
 */
!function(e,n,t){function a(n,t){this.element=n,this.settings=e.extend({},i,t),this.settings.duplicate||t.hasOwnProperty("removeIds")||(this.settings.removeIds=!1),this._defaults=i,this._name=s,this.init()}var i={label:"",duplicate:!0,duration:200,easingOpen:"swing",easingClose:"swing",closedSymbol:"&#9658;",openedSymbol:"&#9660;",prependTo:"body",appendTo:"",parentTag:"a",closeOnClick:!1,allowParentLinks:!1,nestedParentLinks:!0,showChildren:!1,removeIds:!0,removeClasses:!1,removeStyles:!1,brand:"",init:function(){},beforeOpen:function(){},beforeClose:function(){},afterOpen:function(){},afterClose:function(){}},s="slicknav",l="slicknav";a.prototype.init=function(){var t,a,i=this,s=e(this.element),o=this.settings;if(o.duplicate?i.mobileNav=s.clone():i.mobileNav=s,o.removeIds&&(i.mobileNav.removeAttr("id"),i.mobileNav.find("*").each(function(n,t){e(t).removeAttr("id")})),o.removeClasses&&(i.mobileNav.removeAttr("class"),i.mobileNav.find("*").each(function(n,t){e(t).removeAttr("class")})),o.removeStyles&&(i.mobileNav.removeAttr("style"),i.mobileNav.find("*").each(function(n,t){e(t).removeAttr("style")})),t=l+"_icon",""===o.label&&(t+=" "+l+"_no-text"),"a"==o.parentTag&&(o.parentTag='a href="#"'),i.mobileNav.attr("class",l+"_nav"),a=e('<div class="'+l+'_menu"></div>'),""!==o.brand){var r=e('<div class="'+l+'_brand">'+o.brand+"</div>");e(a).append(r)}i.btn=e(["<"+o.parentTag+' aria-haspopup="true" tabindex="0" class="'+l+"_btn "+l+'_collapsed">','<span class="'+l+'_menutxt">'+o.label+"</span>",'<span class="'+t+'">','<span class="'+l+'_icon-bar"></span>','<span class="'+l+'_icon-bar"></span>','<span class="'+l+'_icon-bar"></span>',"</span>","</"+o.parentTag+">"].join("")),e(a).append(i.btn),""!==o.appendTo?e(o.appendTo).append(a):e(o.prependTo).prepend(a),a.append(i.mobileNav);var d=i.mobileNav.find("li");e(d).each(function(){var n=e(this),t={};if(t.children=n.children("ul").attr("role","menu"),n.data("menu",t),t.children.length>0){var a=n.contents(),s=!1,r=[];e(a).each(function(){return e(this).is("ul")?!1:(r.push(this),void(e(this).is("a")&&(s=!0)))});var d=e("<"+o.parentTag+' role="menuitem" aria-haspopup="true" tabindex="-1" class="'+l+'_item"/>');if(o.allowParentLinks&&!o.nestedParentLinks&&s)e(r).wrapAll('<span class="'+l+"_parent-link "+l+'_row"/>').parent();else{var p=e(r).wrapAll(d).parent();p.addClass(l+"_row")}o.showChildren?n.addClass(l+"_open"):n.addClass(l+"_collapsed"),n.addClass(l+"_parent");var c=e('<span class="'+l+'_arrow">'+(o.showChildren?o.openedSymbol:o.closedSymbol)+"</span>");o.allowParentLinks&&!o.nestedParentLinks&&s&&(c=c.wrap(d).parent()),e(r).last().after(c)}else 0===n.children().length&&n.addClass(l+"_txtnode");n.children("a").attr("role","menuitem").click(function(n){o.closeOnClick&&!e(n.target).parent().closest("li").hasClass(l+"_parent")&&e(i.btn).click()}),o.closeOnClick&&o.allowParentLinks&&(n.children("a").children("a").click(function(n){e(i.btn).click()}),n.find("."+l+"_parent-link a:not(."+l+"_item)").click(function(n){e(i.btn).click()}))}),e(d).each(function(){var n=e(this).data("menu");o.showChildren||i._visibilityToggle(n.children,null,!1,null,!0)}),i._visibilityToggle(i.mobileNav,null,!1,"init",!0),i.mobileNav.attr("role","menu"),e(n).mousedown(function(){i._outlines(!1)}),e(n).keyup(function(){i._outlines(!0)}),e(i.btn).click(function(e){e.preventDefault(),i._menuToggle()}),i.mobileNav.on("click","."+l+"_item",function(n){n.preventDefault(),i._itemClick(e(this))}),e(i.btn).keydown(function(e){var n=e||event;13==n.keyCode&&(e.preventDefault(),i._menuToggle())}),i.mobileNav.on("keydown","."+l+"_item",function(n){var t=n||event;13==t.keyCode&&(n.preventDefault(),i._itemClick(e(n.target)))}),o.allowParentLinks&&o.nestedParentLinks&&e("."+l+"_item a").click(function(e){e.stopImmediatePropagation()})},a.prototype._menuToggle=function(e){var n=this,t=n.btn,a=n.mobileNav;t.hasClass(l+"_collapsed")?(t.removeClass(l+"_collapsed"),t.addClass(l+"_open")):(t.removeClass(l+"_open"),t.addClass(l+"_collapsed")),t.addClass(l+"_animating"),n._visibilityToggle(a,t.parent(),!0,t)},a.prototype._itemClick=function(e){var n=this,t=n.settings,a=e.data("menu");a||(a={},a.arrow=e.children("."+l+"_arrow"),a.ul=e.next("ul"),a.parent=e.parent(),a.parent.hasClass(l+"_parent-link")&&(a.parent=e.parent().parent(),a.ul=e.parent().next("ul")),e.data("menu",a)),a.parent.hasClass(l+"_collapsed")?(a.arrow.html(t.openedSymbol),a.parent.removeClass(l+"_collapsed"),a.parent.addClass(l+"_open"),a.parent.addClass(l+"_animating"),n._visibilityToggle(a.ul,a.parent,!0,e)):(a.arrow.html(t.closedSymbol),a.parent.addClass(l+"_collapsed"),a.parent.removeClass(l+"_open"),a.parent.addClass(l+"_animating"),n._visibilityToggle(a.ul,a.parent,!0,e))},a.prototype._visibilityToggle=function(n,t,a,i,s){var o=this,r=o.settings,d=o._getActionItems(n),p=0;a&&(p=r.duration),n.hasClass(l+"_hidden")?(n.removeClass(l+"_hidden"),s||r.beforeOpen(i),n.slideDown(p,r.easingOpen,function(){e(i).removeClass(l+"_animating"),e(t).removeClass(l+"_animating"),s||r.afterOpen(i)}),n.attr("aria-hidden","false"),d.attr("tabindex","0"),o._setVisAttr(n,!1)):(n.addClass(l+"_hidden"),s||r.beforeClose(i),n.slideUp(p,this.settings.easingClose,function(){n.attr("aria-hidden","true"),d.attr("tabindex","-1"),o._setVisAttr(n,!0),n.hide(),e(i).removeClass(l+"_animating"),e(t).removeClass(l+"_animating"),s?"init"==i&&r.init():r.afterClose(i)}))},a.prototype._setVisAttr=function(n,t){var a=this,i=n.children("li").children("ul").not("."+l+"_hidden");t?i.each(function(){var n=e(this);n.attr("aria-hidden","true");var i=a._getActionItems(n);i.attr("tabindex","-1"),a._setVisAttr(n,t)}):i.each(function(){var n=e(this);n.attr("aria-hidden","false");var i=a._getActionItems(n);i.attr("tabindex","0"),a._setVisAttr(n,t)})},a.prototype._getActionItems=function(e){var n=e.data("menu");if(!n){n={};var t=e.children("li"),a=t.find("a");n.links=a.add(t.find("."+l+"_item")),e.data("menu",n)}return n.links},a.prototype._outlines=function(n){n?e("."+l+"_item, ."+l+"_btn").css("outline",""):e("."+l+"_item, ."+l+"_btn").css("outline","none")},a.prototype.toggle=function(){var e=this;e._menuToggle()},a.prototype.open=function(){var e=this;e.btn.hasClass(l+"_collapsed")&&e._menuToggle()},a.prototype.close=function(){var e=this;e.btn.hasClass(l+"_open")&&e._menuToggle()},e.fn[s]=function(n){var t=arguments;if(void 0===n||"object"==typeof n)return this.each(function(){e.data(this,"plugin_"+s)||e.data(this,"plugin_"+s,new a(this,n))});if("string"==typeof n&&"_"!==n[0]&&"init"!==n){var i;return this.each(function(){var l=e.data(this,"plugin_"+s);l instanceof a&&"function"==typeof l[n]&&(i=l[n].apply(l,Array.prototype.slice.call(t,1)))}),void 0!==i?i:this}}}(jQuery,document,window);

/* End Slick Nav */