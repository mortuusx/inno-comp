"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,t){for(var n=0;n<t.length;n++){var s=t[n];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(e,s.key,s)}}return function(t,n,s){return n&&e(t.prototype,n),s&&e(t,s),t}}(),Message=function(){function e(t){if(_classCallCheck(this,e),!t.element)throw new Error("Message element must be provided.");this.element=t.element,this.duration=t.duration||1e3,this.element.classList.contains("error")?this.createButton():this.timer()}return _createClass(e,[{key:"show",get:function(){this.element.hasAttribute("show")},set:function(e){e?this.element.setAttribute("show",""):this.element.removeAttribute("show")}}]),_createClass(e,[{key:"timer",value:function(){var e=this,t=setTimeout(function(){e.show=!1},this.duration);document.addEventListener("load",t)}},{key:"createButton",value:function(){var e=this,t=document.createElement("button");t.className="message__close",t.addEventListener("click",function(){e.show=!1}),this.element.appendChild(t)}}]),e}();document.querySelectorAll(".message[message]").length&&(window.ic=window.ic||{},window.ic.messages=Array.from(document.querySelectorAll(".message[message]")).map(function(e){return new Message({element:e,duration:1e3})}));