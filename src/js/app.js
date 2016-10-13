require('../sass/style.scss');
import {mainController} from "./controllers/mainCtrl.js";
import {dataServiceFunc} from "./services/data.js";

angular.module("chatApp",[])
	.service('dataService', dataServiceFunc)
	.controller('mainCtrl', mainController)