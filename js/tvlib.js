// 机顶盒js库
// by wallax
// wallax@126.com
// 2017.04
// v1.0

;(function(){
	// 机顶盒平台
	// GD = 广东
	// GX = 广西
	// HN = 河南
	// PC = PC平台，调试
	var PLATFORM = 'GD';

	// 生成随机字符串
	var randStr = function(length=5){
		var strtable = '0123456789abcdefghijklmnopqrstuvwxyz';
		var len = strtable.length;
		var str = '';
		for(var i = 0; i < length; i++){
			str += strtable[Math.floor(Math.random() * len)];
		}
		return str;
	}

	// 获取当前时间的时间戳
	window.getTimestamp = function(fl=false){
		var cur = Date.now ? Date.now() : new Date().getTime();
		return fl ? cur / 1000 : cur;
	}

	// dom选择器
	window.q = function(str, base=null){
		var arr = str.split(' '), base = base || document;
		var fetchNode = function(selector){
			base = base instanceof NodeList ? base[0] : node;
			if(selector[0] == '.'){
				return base.getElementsByClassName(selector.slice(1));
			}else if(selector[0] == '#'){
				return base.getElementById(selector.slice(1));
			}else{
				return base.getElementsByTagName(selector);
			}
		}
		if(arr.length == 1){
			return fetchNode(arr[0]);
		}else{
			var selector = arr.slice(1).join(' ');
			return q(selector, fetchNode(arr[0]));
		}
	}

	// ajax获取json
	// 如果不支持ajax，则调用jsonp
	window.getJSON = function(url, cb){
		if(window.XMLHttpRequest){
			var req = new XMLHttpRequest();
			req.open('GET', url, true);
			req.onreadystatechange = function(){
				if(req.readyState == 4){
					var str = req.responseText;
					if(window.JSON){
						// 支持JSON.parse
						try{
							str = JSON.parse(str);
						}finally{
							cb(str);
						}
					}else{
						// 不支持JSON.parse
						try{
							str = eval('[' + str + ']')[0];
						}finally{
							cb(str);
						}
					}
				}
			}
			req.send();
		}else{
			// 使用jsonp
			// 服务端判断是否存在callback参数，如果存在则返回jsonp格式的数据
			var callback = '_func' + randStr();
			url += url.indexOf('?') == -1 ? ('&callback=' + encodeURI(callback)) : ('?callback=' + encodeURI(callback));
			url += '&ts=' + getTimestamp();
			var node = document.createElement('script');
			node.src = url;
			document.body.appendChild(node);
			window[callback] = function(data){
				cb(data);
				document.body.removeChild(node);
				delete window[callback];
			}
		}
	}

	// 键盘映射表
	var keyCodeTable = {
		// 广东
		"GD": {
			"up":    87,
			"down":  83,
			"left":  65,
			"right": 68,
			"enter": 13,
			"back":  8
		},
		// 广西
		"GX": {
			"up":    38,
			"down":  40,
			"left":  37,
			"right": 39,
			"enter": 13,
			"back":  48
		},
		// 河南
		"HN": {
			"up":    65362,
			"down":  65364,
			"left":  65361,
			"right": 65363,
			"enter": 65293,
			"back":  65367
		},
		// PC
		"PC": {
			"up":    38,
			"down":  40,
			"left":  37,
			"right": 39,
			"enter": 13,
			"back":  8
		}
	}

	// 键盘按键判断
	var keyCheck = function(e, cb, key){
		var keycodes = keyCodeTable[PLATFORM] || keyCodeTable['PC'];
		var keysarr = [];
		for(var i in keycodes){
			keysarr.push(keycodes[i]);
			// 添加PC端键位方便调试
			keysarr.push(keyCodeTable['PC'][i]);
		}
		
		if(keysarr.indexOf(e.keyCode) != -1) e.preventDefault();
		if(e.keyCode == keycodes[key] || e.keyCode == keyCodeTable['PC'][key]){
			cb(e);
		}
	}
	window.keyLeft = function(e, cb){
		keyCheck(e, cb, 'left');
	}
	window.keyRight = function(e, cb){
		keyCheck(e, cb, 'right');
	}
	window.keyUp = function(e, cb){
		keyCheck(e, cb, 'up');
	}
	window.keyDown = function(e, cb){
		keyCheck(e, cb, 'down');
	}
	window.keyEnter = function(e, cb){
		keyCheck(e, cb, 'enter');
	}
	window.keyBack = function(e, cb){
		keyCheck(e, cb, 'back');
	}
})();