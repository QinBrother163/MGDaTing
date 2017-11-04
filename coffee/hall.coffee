# 机顶盒平台
PLATFORM = 'GD'

# 获取数据
getJSON = (url, cb) ->
	req = new XMLHttpRequest
	req.open 'GET', url, true
	req.onreadystatechange = ->
		if req.readyState == 4
			obj = eval '[' + req.responseText + ']'
			cb obj[0]
			return
	req.send null
	return

getJSON 'data/gamelist.json', (list) ->
	return if not list?

	offsetTop = 120				# 上偏移
	offsetLeft = 48				# 左偏移
	# mirrorTop = 628				# 镜像上偏移
	Width = 5					# 横向范围
	Height = 3					# 纵向范围
	curX = Width // 2 + 1		# 横坐标
	curY = Height // 2 + 1		# 纵坐标

	# 要干的键值
	keycodes = [37, 38, 39, 40, 13, 8]

	# 根据不同平台追加键值
	if PLATFORM == 'GD'		# 广东
		keycodes.push key for key in [87, 83, 65, 68, 13, 8]
	if PLATFORM == 'GX'		# 广西
		keycodes.push key for key in [38, 40, 37, 39, 13, 48]
	if PLATFORM == 'HN'		# 河南
		keycodes.push key for key in [65362, 65364, 65361, 65363, 65293, 65367]

	btns = document.getElementsByClassName 'btn'
	normalImgs = ['img/page.png', 'img/return.png', 'img/mall.png']
	activeImgs = ['img/pages.png', 'img/returns.png', 'img/malls.png']

	# 返回请求字符串
	parseStr = (obj) ->
		arr = []
		arr.push v + '=' + encodeURIComponent i for v, i of obj
		return arr.join '&'

	# 返回查询参数
	getRequest = ->
		return {} unless location.search.indexOf '?' == -1
		search = location.search[1..]
		result = {}
		arr = search.split '&'
		for v in arr
			tmp = v.split '='
			result[tmp[0]] = encodeURIComponent tmp[1]
		result

	# 进入游戏
	accessGame = (item) ->
		args = getRequest()
		args.gameid = item.id
		args.ts = new Date().getTime()
		args.returnURL = encodeURIComponent location.href
		
		console.log item.url + '?' + parseStr args
		return

	# 顶部按钮
	# accessMethod = (x) ->
	# 	switch x
	# 		when 1 then window.location.href = 'Hall.html'
	# 		when 2 then history.back()
	# 		when 3 then window.location.href = 'mall.html'
	# 		else location.reload true

	# 渲染列表
	render = (cb) ->
		count = 0
		for val, i in list
			img = document.createElement 'img'
			img.src = val.image
			img.classList.add 'item'
			img.id = 'g' + val.id
			img.style.left = val.left + offsetLeft + 'px'
			img.style.top = val.top + offsetTop + 'px'
			img.onload = ->
				count++
				if count == list.length
					cb null
					return
			list[i].node = img
			document.body.appendChild img

			# 处理倒影
			# if val.mirror
			# 	mirror = document.createElement 'img'
			# 	mirror.classList.add 'mirror'
			# 	mirror.src = val.mirror
			# 	mirror.style.left = val.left + offsetLeft + 'px'
			# 	mirror.style.top = mirrorTop + 'px'
			# 	list[i].mirrorNode = mirror
			# 	document.body.appendChild mirror

	# 根据坐标获取节点
	findItem = (x, y) ->
		for item in list
			rangeX = item.x + item.width - 1
			rangeY = item.y + item.height - 1
			return item if item.x <= x <= rangeX and item.y <= y <= rangeY
		return false

	# 更新焦点
	setFocus = (item) ->
		return unless item?
		node = item.node
		node.style.left = node.offsetLeft - 24 + 'px'
		node.style.top = node.offsetTop - 24 + 'px'
		node.style.height = node.clientHeight + 48 + 'px'
		# node.style.width = node.clientWidth + 48 + 'px'
		node.style.zIndex = 999
		node.classList.add 'focus'
		return

	# 失去焦点
	lostFocus = (item) ->
		return unless item?
		node = item.node
		node.style.left = item.left + offsetLeft + 'px'
		node.style.top = item.top + offsetTop + 'px'
		node.style.height = 'auto'
		node.style.width = 'auto'
		node.style.zIndex = 'auto'
		node.classList.remove 'focus'
		return

	# 切换焦点
	switchFocus = (from, to) ->
		lostFocus from
		setFocus to
		return
	
	# 切换顶部按钮
	# switchButton = (x) ->
	# 	btn.src = normalImgs[i] for btn, i in btns
	# 	btns[x - 1].src = activeImgs[x - 1]
	# 	return
		
	# 取消顶部按钮焦点
	# lostButton = ->
	# 	btn.src = normalImgs[i] for btn, i in btns
	# 	return
	
	# 移动焦点
	moveFocus = (x, y) ->
		from = findItem curX, curY
		to = findItem x, y
		return if not x? or not y?
		curX = to.x
		curY = to.y
		switchFocus from, to
		return

	# 初始化
	render () ->
		setFocus findItem curX, curY

		# 绑定键盘事件
		document.onkeydown = (e) ->
			if keycodes.indexOf(e.keyCode) != -1 then e.preventDefault null
			source = findItem curX, curY

			switch e.keyCode
				when 87, 38, 65362
					if curY > 1
						moveFocus curX, curY - 1
						return
					# else
					# 	lostFocus findItem curX, curY
					# 	curY = 0
					# 	curX = 1
					# 	switchButton curX
					# 	return

				when 83, 40, 65364
					if 0 < curY < Height - source.height + 1
						moveFocus curX, curY + source.height
						return
					# else if curY == 0
					# 	lostButton()
					# 	curY = 1
					# 	curX = 5
					# 	setFocus findItem curX, curY
					# 	return

				when 65, 37, 65361
					if curY != 0
						moveFocus curX - 1, curY if curX > 1
						return
					# else
					# 	switchButton --curX if curX > 1
					# 	return

				when 68, 39, 65363
					if curY != 0
						moveFocus curX + source.width, curY if curX < Width
						return
					# else
					# 	switchButton ++curX if curX < btns.length
					# 	return

				when 13, 65293
					# if curY > 0 then accessGame source else accessMethod curX
					accessGame source
					return
				when 8, 48
					history.back()
					return
		return
	return