//app.jsvar 
let BLEConnector = require('./utils/hardware/BleConnector.js');
let BleUtil = require('./utils/hardware/BleUtil.js');
let PrintUtil = require('./utils/hardware/PrintUtil.js');
let Event = require('./utils/event/EventBus.js'); //event Bus
let EventModel = require('./utils/event/EventModel.js'); //event
App({
	onLaunch: function () {
		// 展示本地存储能力

	},
	constants: {
		blestate:false,						//蓝牙可用状态
		Ble: BLEConnector,
		BleUtil: BleUtil,
		PrintUtil: PrintUtil,
		Event: Event,
		EventModel: EventModel,
	}
})