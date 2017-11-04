(function(){
	// 获取游戏列表
	getGameList(function(gameList){
		if(!gameList) return;

		// 偏移
		var offsetTop = 120, offsetLeft = 48, mirrorTop = 628;

		// 坐标范围
		var Width = 5, Height = 3;

		// 当前坐标
		var curX = Math.ceil(Width / 2), curY = Math.ceil(Height / 2);

		// 需要终端的键值
		var keycodes = [37, 38, 39, 40, 13, 48];

		// 顶部按钮节点
		var btns = document.getElementsByClassName('btn');
		var normalImgs = ['img/page.png', 'img/return.png', 'img/mall.png'];
		var activeImgs = ['img/pages.png', 'img/returns.png', 'img/malls.png'];

		// 返回地址参数
		var parseStr = function(obj){
			var arr = [];
			for(var i in obj){
				arr.push(i + '=' + encodeURIComponent(obj[i]));
			}
			return arr.join('&');
		}

		// 返回查询参数
		var getReq = function(){
			if(location.search.indexOf('?') == -1) return false;
			var search = location.search.slice(1);
			var arr = search.split('&'), result = {};
			for(var i = 0; i < arr.length; i++){
				var tmp = arr[i].split('=');
				result[tmp[0]] = tmp[1];
			}
			return result;
		}

		// 进入游戏
		var accessGame = function(item){
			var args = getReq();
			var obj = {
				"gameid": item.id,
				"userId": args && args.userId || 0,
				"key": args && args.key || 0,
				"dev": args && args.dev || 0,
				"rechageURL": args && encodeURIComponent(args.rechageURL),
				//"fatherkey": args && args.fatherkey || 0,
				"fatherkey": 123456,
				"returnURL": encodeURIComponent(location.href),
				"ts": new Date().getTime()
			}
			var search = parseStr(obj);
			window.location.href = item.url + '?' + search;
			return;
		}

		// 顶部按钮功能
		var accessMethod = function(x){
			if(x == 1){
				window.location.href = 'Hall.html';
			}else if(x == 2){
				history.back();
			}else if(x == 3){
				window.location.href = 'mall.html';
			}else{
				location.reload(true);
			}
		}

		// 渲染列表
		var render = function(cb){
			for(var i = 0; i < gameList.length; i++){
				var count = 0;
				// 创建img标签
				var img = document.createElement('img');
				img.classList.add('item');
				img.id = "g" + gameList[i].id;
				img.src = gameList[i].image;
				img.style.left = gameList[i].left + offsetLeft + 'px';
				img.style.top = gameList[i].top + offsetTop + 'px';
				img.onload = function(){
					count++;
					if(count == gameList.length) cb();
				}
				gameList[i].node = img;
				document.body.appendChild(img);

				// 倒影图片
				if(gameList[i].mirror){
					var mirror = document.createElement('img');
					mirror.classList.add('mirror');
					mirror.src = gameList[i].mirror;
					mirror.style.left = gameList[i].left + offsetLeft + 'px';
					mirror.style.top = mirrorTop + 'px';
					gameList[i].mirrorNode = mirror;
					document.body.appendChild(mirror);
				}
			}
		}

		// 根据坐标获取节点
		var findItem = function(x, y){
			for(var i = 0; i < gameList.length; i++){
				var rangeX = gameList[i].x + gameList[i].width - 1;
				var rangeY = gameList[i].y + gameList[i].height - 1;
				if(rangeX >= x && 
					rangeY >= y && 
					gameList[i].x <= x && 
					gameList[i].y <= y){
					return gameList[i];
				}
			}
			return false;
		}

		// 更新焦点
		var setFocus = function(item){
			var height = item.node.clientHeight;
			var width = item.node.clientWidth;
			var left = item.node.offsetLeft;
			var top = item.node.offsetTop;
			item.node.style.left = left - 24 + 'px';
			item.node.style.top = top - 24 + 'px';
			item.node.style.height = height + 48 + 'px';
			item.node.style.width = width + 48 + 'px';
			item.node.style.zIndex = 999;
			item.node.classList.add('focus');
		}

		// 丢失焦点
		var lostFocus = function(item){
			var height = item.node.clientHeight;
			var width = item.node.clientWidth;
			var left = item.node.offsetLeft;
			var top = item.node.offsetTop;
			item.node.style.left = item.left + offsetLeft + 'px';
			item.node.style.top = item.top + offsetTop + 'px';
			item.node.style.height = 'auto';
			item.node.style.width = 'auto';
			item.node.style.zIndex = 'auto';
			item.node.classList.remove('focus');
		}

		// 切换焦点
		var switchFocus = function(from, to){
			lostFocus(from);
			setFocus(to);
		}

		// 切换顶部按钮
		var switchButton = function(x){
			for(var i = 0; i < btns.length; i++){
				btns[i].src = normalImgs[i];
			}
			btns[x - 1].src = activeImgs[x - 1];
		}

		// 取消所有顶部按钮的焦点
		var lostButton = function(){
			for(var i = 0; i < btns.length; i++){
				btns[i].src = normalImgs[i];
			}
		}

		// 移动焦点
		var moveFocus = function(x, y){
			var from = findItem(curX, curY);
			var to = findItem(x, y);

			if(!from || !to) return;

			// 修正大范围的焦点
			curX = to.x;
			curY = to.y;
			switchFocus(from, to);
		}

		// 初始化界面
		render(function(){
			setFocus(findItem(curX, curY));

			// 绑定键盘事件
			document.onkeydown = function(e){
				if(keycodes.indexOf(e.keyCode) != -1) e.preventDefault();
				var source = findItem(curX, curY);

				// 上
				keyUp(e, function(){
					if(curY > 1){
						moveFocus(curX, curY - 1);
					}
					// else{
					// 	// 先让游戏失去焦点
					// 	lostFocus(findItem(curX, curY));
					// 	curY = 0;
					// 	curX = 1;

					// 	// 顶部工具栏获取焦点
					// 	switchButton(curX);
					// }
				});

				// 下
				keyDown(e, function(){
					if(curY < Height && curY > 0){
						moveFocus(curX, curY + source.height);
					}
					// else if(curY == 0){
					// 	// 从工具栏回到列表
					// 	lostButton();
					// 	curY = 1;
					// 	curX = 5;
					// 	setFocus(findItem(curX, curY));
					// }
				});

				//左
				keyLeft(e, function(){
					if(curY != 0){
						if(curX > 1){
							moveFocus(curX - 1, curY);
						}
					}
					// else{
					// 	if(curX < btns.length){
					// 		switchButton(--curX);
					// 	}
					// }
				});

				// 右
				keyRight(e, function(){
					if(curY != 0){
						if(curX < Width){
							moveFocus(curX + source.width, curY);
						}
					}
					// else{
					// 	if(curX < btns.length){
					// 		switchButton(++curX);
					// 	}
					// }
				});

				keyEnter(e, function(){
					if(curY > 0){
						// 坐标在游戏区
						accessGame(source);
					}
					// else{
					// 	// 跳转功能区
					// 	accessMethod(curX);
					// }
				});
				
				keyBack(e, function(){
					history.back();
				});
			}
		});
	});
})();