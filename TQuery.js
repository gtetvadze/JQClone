
(function(){

    tQuery = function(query, context){
		/*return new tQuery(query, context);*/
		return new tQuery.prototype.init(query, context);
	};

	
	// ----------AJAX----------- // 

	var ajax = function(url, settings){
		
		if(url.constructor == Object) {
			settings = url;
			url = null;
		}
		//default value asignments
		settings = settings || {};
		var obj = {};
		obj.async = settings.async || "true";
		obj.url = url || settings.url;
		obj.method = settings.method || "GET";
		obj.responseType = settings.responseType || "json";
		obj.success = settings.success || function(){};
		obj.fail = settings.fail || function(){};
		obj.beforeLoad = settings.beforeLoad || function(){};
		obj.done = settings.done || function(){};
		//

		if (window.XMLHttpRequest){
		  	xhr = new XMLHttpRequest();
		} else {
		  	xhr = new ActiveXObject("Microsoft.XMLHTTP");
		}
		// exec callback
		obj.beforeLoad.call(this);
		xhr.responseType = obj.responseType;
		xhr.open(obj.method,obj.url,obj.async);
		xhr.send();
		xhr.onreadystatechange = function() {
			obj.status = xhr.status;
			obj.readyState = xhr.readyState;
			obj.statusText = xhr.statusText;
		  	if (xhr.readyState == 4 && xhr.status == 200) {
				obj.success.call(this, xhr.response);
		    	}else{
				obj.fail.call(this);	
			}
			obj.done.call(this);
		}
	};
			

	tQuery.ajax = function(url, settings){
		return new ajax(url, settings);
	}
	
	//// ----------END OF AJAX----------- /////



	tQuery.prototype = {
		init:function(query, context){

			context = context || document;

			if(!(context instanceof Array)) {
				context = [context];
			}

			var result = [];

			try {
				for(var i = 0,length = context.length; i < length; i++) {
					var nodes = context[i].querySelectorAll(query);

					for(var j = 0, len = nodes.length; j < len;) {
						result.push(nodes[j++]);
					}

				}

			} catch(ex) {
				result = [];
			}

			this.length = 0;
			this.pop = [].pop;
			this.push = [].push;
			this.splice = [].splice;


			Array.prototype.push.apply(this,result);

		},
		each: function(callback){
			for(var i = 0; (el = this[i]);i++) {
				callback.call(el, i);
			}
			return this;
		},
		//className
		addClass:function(name) {
			this.each(function(){
				className.add(this, name);
			});
			return this;
		},
		hasClass:function(name){
			return className.has(this[0], name) ? true : false;
		},
		removeClass:function(name){
			this.each(function(){
				className.remove(this, name);
			});
			return this;
		},
		toggleClass: function(name) {
			this.each(function(){
				className.toggle(this, name);
			});
			return this;
		},
		first:function(){
			while(this.length > 1){
				this.pop();
			}
			return this;
		},
		last:function() {
			var temp = this.pop();
			while(this.length > 0) {
				this.pop();
			}
			this.push(temp);
			return this;
		},
		find:function(query) {
			var mySet = new Set();
			this.each(function(){
				var queryResult = this.querySelectorAll(query);
				for(var i = 0;i < queryResult.length;i ++) {
					mySet.add(queryResult[i]);
				}
			});
			while(this.length > 0)this.pop();
			var that = this;
			mySet.forEach(function(value) {
			  	that.push(value);
			});
			
			return this;
		},
		attr:function(name, value) {
			if (typeof value === 'undefined'){
				if(name.constructor == Object) {
					this.each(function(){
						for(var key in name) {
							if (name.hasOwnProperty(key)) {
								this.setAttribute(key, name[key]);
  							}

						}
					});
					return this;
				} else {
					return this[0].getAttribute(name);
				}
			} else {
				if(typeof(value) === "function") {
					this.each(function(i,val){
						this.setAttribute(name,value.call(this,i,this.getAttribute(name)));
					});
					return this;
				} else {
					this.each(function(){
						this.setAttribute(name, value);
					});
					return this;
				}
			}
			
		},
		css:function(name, value){
			if(typeof value === 'undefined') {
				if(name.constructor === Array) {
					var result = {};
					for(var i = 0;i < name.length;i ++) {
						result[name[i]] = window.getComputedStyle(this[0])[name[i]];
					}
					return result;
				} else if(name.constructor == Object){
					this.each(function() {
						for(var key in name) {
							console.log(key + " " + name[key]);
							this.style[key] = name[key];
						}
					});
					return this;
				} else {
					result = window.getComputedStyle(this[0])[name];
					return result;
				} 
			} else {
				if(typeof(value) === "function") {
					this.each(function(i, val){
						value.call(this,i,window.getComputedStyle(this)[name]);
					});
					return this;
				} else {
					if( typeof value === 'number' ) {
						value = value.toString();
						value += "px";
						console.log(value);
					}
					
					this.each(function(){
						this.style[name] = value;
					});
					return this;
				}
			}
		},

		data:function(name, value){
			if(document.body.dataset) {
				if(typeof value === 'undefined') {
					if(typeof name === 'undefined') {
						var result = {};
						for(var key in this[0].dataset) {
							result[key] = this[0].dataset;
						}
						return result;
					} else if(name.constructor == Object) {
						this.each(function(){
							for(var key in name) {
								this.setAttribute('data-'+key,name[key]);
							}
						});
						return this;
					} else {
						var att = this[0].dataset;
						return att[name];
					}
				} else { 
					this.each(function(){
						this.setAttribute(name,value);
					});
				}
			} else {
				return this;
			}

		},

		on:function(events, selector, data, handler){
			// TODO  complete method
			var eventsList = events.split(" ");
			if( typeof(selector) === "function" ) {
				handler = selector;
				this.each(function(i, val){
					for(var i in eventsList)
						this.addEventListener(eventsList[i],handler);
				});
				return this;
			} else if(typeof(data) === "function" && typeof selector === "string"){
				handler = data;
				var path = this.find(selector);
				for(var key = 0;key < path.length;key ++){
					for(var i in eventsList) {
						var el = path[key];
						el.addEventListener(eventsList[i],handler);
					}
				}			
				return this;
			} else if(typeof selector === 'undefined') {

			}
		},

		//HTML manipulation 

		html:function(param){
			if(typeof param !== 'undefined') {
				if(typeof(param) == 'function') {
					this.each(function(i){
						param.call(this,i,this.innerHTML)
					});
					return this;
				} else {
					param = param.toString();
					this.each(function(){
						this.innerHTML = "";
						this.innerHTML = param;
					});
					return this;
				}
			} else {
				return this[0].innerHTML;
			}
		},
		append:function(){
			args = arguments;
			this.each(function(){
				for(var i = 0;i < args.length;i ++) {
					var that = this;
					if(typeof args[i] ==='undefined' || args[i] == null) continue;
					if(args[i] instanceof tQuery) {
						args[i].each(function(){
							that.appendChild(this);
						});
					} else if (args[i].constructor == Array) {
						for(var j = 0;j < args[i].length;j ++) {
							if(args[i][j] instanceof tQuery) {
								args[i][j].each(function(){
									that.appendChild(this);
								});
								
							} else if(args[i][j] instanceof HTMLElement) {
								that.appendChild(args[i][j]);
							} else {
								args[i][j] = args[i][j].toString();
								var node = document.createTextNode(args[i][j]);
								that.appendChild(node);
							}
						}
					} else if(args[i] instanceof HTMLElement){
						that.appendChild(args[i]);
					} else {
						args[i] = args[i].toString();
						var node = document.createTextNode(args[i]);
						that.appendChild(node);
					}
				}
			});
			return this;
		},
		prepend:function(){
			args = arguments;
			this.each(function(){
				for(var i = args.length - 1;i >= 0;i --) {
					var that = this;
					if(typeof args[i] ==='undefined' || args[i] == null) continue;
					if(args[i] instanceof tQuery) {
						args[i].each(function(){
							that.insertBefore(this,that.firstChild);
						});
					} else if (args[i].constructor == Array) {
						for(var j = args[i].length - 1;j >= 0 ;j --) {
							if(args[i][j] instanceof tQuery) {
								args[i][j].each(function(){
									that.insertBefore(this,that.firstChild);
								});
								
							} else if(args[i][j] instanceof HTMLElement) {
								that.insertBefore(args[i][j],that.firstChild);
								//that.appendChild(args[i][j]);
							} else {
								args[i][j] = args[i][j].toString();
								var node = document.createTextNode(args[i][j]);
								that.insertBefore(node,that.firstChild);
							}
						}
					} else if(args[i] instanceof HTMLElement){
						that.insertBefore(args[i],that.firstChild);
					} else {
						args[i] = args[i].toString();
						var node = document.createTextNode(args[i]);
						that.insertBefore(node,that.firstChild);
					}
				}
			});
			return this;
		},
		empty:function(){
			this.each(function(){
				this.innerHTML = "";
			});
			return this;
		}

	};



	var className = {
		add:function(el, value){
			this.remove(el, value);
			var className = el.className.split(/\s+/);
			console.log(className);
			className.push(value);
			el.className = className.join(' ');			
		},

		remove:function(el, value){
			var regex = new RegExp('(^|\\s)' + value + '(\\s|$)','g')
			el.className = el.className.replace(regex, '$1$2');
		},
		has:function(el, value){
			var regex = new RegExp('(^|\\s)' + value + '(\\s|$)','g');
			return regex.test(el.className);
		},  
		toggle:function(el, value){
			if(className.has(el, value)) {
				className.remove(el, value);
			} else {
				className.add(el,value);
			}
		}
	};

	

	
	tQuery.prototype.init.prototype = tQuery.prototype;

	return (window.$$$ = tQuery);

})()
