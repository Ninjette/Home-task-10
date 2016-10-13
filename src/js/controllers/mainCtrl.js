export {mainController}

function mainController($scope, dataService, $rootScope){
	let socket = io();
	$scope.messages = [];
	$scope.connected;
	this.user;

	dataService.getMessages(function(response){
		$scope.messages = response.data.messages;
	});
	$scope.setUserName = function(username){
		this.user = username;
		socket.emit('add user', username);
		$scope.connected = true;
	};
	$scope.addMessage = function(message){
		$scope.messages.push({
			name: this.user,
			text: message
		})
		socket.emit('new message', message);
	}

	$scope.onlineUsers = '';
	$scope.showParticipants  = function(data){
		if (data.numUsers === 1) {
			$scope.onlineUsers = "there's 1 participant";
		} else {
			$scope.onlineUsers = "there are " + data.numUsers + " participants"
		}
		$rootScope.$apply();
	}

	$scope.serverInfo = [];
	socket.on('user joined', function (data) {
		$scope.serverInfo.push({
			username: data.username,
			option: "joined"
		});
		$scope.showParticipants(data);
	});

	socket.on('user left', function (data) {
		$scope.serverInfo.push({
			username: data.username,
			option: 'left'
		});
		$scope.showParticipants(data);
	});


	socket.on('login', function (data) {
		$scope.showParticipants(data);
	});

	socket.on('new message', function (data) {
		$scope.messages.push({
			name: data.username,
			text: data.message
		});
		$rootScope.$apply();
	});
};