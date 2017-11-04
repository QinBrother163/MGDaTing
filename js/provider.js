;(function(){
	window.getGameList = function(cb){
		getJSON('data/gamelist.json', cb);
	}
})();