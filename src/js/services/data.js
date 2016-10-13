export {dataServiceFunc}

function dataServiceFunc($http){
	this.getMessages = function(callback){
		$http.get('logger.json')
			.then(callback)
	}
};