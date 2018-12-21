/**
 * Data: 2018/06/07
 * Auth: Dongyunlong
 * Desc: 小程序蓝牙操作基础插件
 */

let BleUtil = require('../hardware/BleUtil.js');
//导入event
var EventBus = require('../event/EventBus.js');
var EventModel = require('../event/EventModel.js');

//特征值
var SERVICEIDS = [];
var DEVICEID = '';
var UUID_SERVICE = '00001000-0000-1000-8000-00805f9b34fb'.toUpperCase();
var UUID_WRITE = '00001001-0000-1000-8000-00805f9b34fb'.toUpperCase();
var UUID_NOTIFY = '00001002-0000-1000-8000-00805f9b34fb'.toUpperCase();

//全局变量
var BASE_TIMOUT = 15 * 1000; //超时时间限制
var scanTimeout = null;

var bleOpen = false; //蓝牙功能是否开启
var bleConn = false; //蓝牙是否已成功连接
var isScaning = false; //蓝牙是否在搜索设备中

//所有方法
var u = {};

/*******************开启微信蓝牙模块*******************/
/**
 * 开启微信蓝牙模块
 */
u.initBle = function (serviceIds) {
	console.log('初始化蓝牙模块' + serviceIds);
	SERVICEIDS = serviceIds;
	openBle();
}

/**
 * 关闭微信蓝牙模块
 */
u.closeBle = function () {
	closeBle();
}

/**
 * 初始化微信蓝牙模块
 */
function openBle() {
	wx.openBluetoothAdapter({
		success: function (res) {
			console.log('初始化蓝牙模块成功');
			EventBus.send(EventModel.EVENT_BLESTATE, {
				code: true
			});
			listenBleStateChange();
		},
		fail: function (e) {
			console.log('初始化蓝牙模块失败');
			listenBleStateChange();
		}
	})
}

/**
 * 监听蓝牙开关状态
 */
function listenBleStateChange() {
	wx.onBluetoothAdapterStateChange(function (res) {
		console.log('蓝牙状态发生变化' + res.available);
		if (res.available) {
			openBle();
		} else {
			PASSWORD = '00000000';
			EventBus.send(EventModel.EVENT_BLESTATE, {
				code: false
			})
		}
	})
}

/**
 * 关闭微信蓝牙模块
 */
function closeBle() {
	wx.closeBluetoothAdapter({
		success: function (res) { },
	})
}

/*******************获取蓝牙可用状态*******************/


/*******************扫描设备模块*******************/
/**
 * 开始扫描设备
 */
u.startScan = function () {
	console.log('开始扫描');
	if (!isScaning) {
		//1.开启搜索监听
		lisenDeviceFound();
		//2.开始搜索
		console.log(SERVICEIDS);
		wx.showLoading({
			title: '扫描中...',
		})
		wx.startBluetoothDevicesDiscovery({
			services: SERVICEIDS,
			success: function (res) {
				isScaning = true;
			},
		})
		scanTimeout = setTimeout(function () {
			u.stopScan();
		}, BASE_TIMOUT);
	} else {
		wx.showToast({
			icon: 'none',
			title: '正在扫描中...',
		})
	}
}

/**
 * 停止扫描设备
 */
u.stopScan = function () {
	if (scanTimeout != null) {
		clearTimeout(scanTimeout);
		scanTimeout = null;
	}
	wx.stopBluetoothDevicesDiscovery({
		success: function (res) {
			wx.hideLoading();
			console.log('停止扫描');
			isScaning = false;
			//发送事件
			EventBus.send(EventModel.EVENT_SCAN, {
				stop: true
			});
		},
	})
}

/**
 * 监听搜索到蓝牙
 */
function lisenDeviceFound() {
	wx.onBluetoothDeviceFound(function (res) {
		var devices = res.devices;
		console.log('扫描到设备:' + devices.length + '个');
		for (var i = 0; i < devices.length; i++) {
			var macId = ab2hex(devices[i].advertisData).substr(4, 12).toUpperCase();
			devices[i].mac = getMac(macId);
		}
		//发送事件
		EventBus.send(EventModel.EVENT_SCAN, {
			stop: false,
			datainfo: devices
		});
	})
}

//arrayBuffer转hex
function ab2hex(buffer) {
	var hexArr = Array.prototype.map.call(
		new Uint8Array(buffer),
		function (bit) {
			return ('00' + bit.toString(16)).slice(-2)
		}
	)
	return hexArr.join('');
}

/**
 * hex转buffer
 */
function hex2ab(hex) {
	var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
		// console.log(parseInt(h, 16))
		return parseInt(h, 16);
	}))
	return typedArray.buffer;
}

/**
 * int转hex
 */
function int2hex(data) {
	return ('00' + data.toString(16)).slice(-2);
}

/**
 * hex转bit
 */
u.hex2bit = function (val) {
	var bitArr = [];
	var num = parseInt(val, 16);
	for (var i = 7; i >= 0; i--) {
		bitArr.push((num >> i) & 0x1);
	}
	return bitArr;
}

/**
 * 获取mac地址
 */
function getMac(hexStr) {
	var mac = '';
	for (var i = 0; i < hexStr.length; i += 2) {
		mac += (hexStr.substr(i, 2) + (i == hexStr.length - 2 ? '' : ':'));
	}
	return mac;
}

/*******************连接设备模块*******************/
u.conn = function (deviceId) {
	console.log('开始连接' + deviceId);
	DEVICEID = deviceId;
	//1开始连接设备
	wx.showLoading({
		title: '连接中...',
	})
	wx.createBLEConnection({
		deviceId: deviceId,
		success: function (res) {
			console.log('建立连接成功')
			//2开始监听蓝牙状态
			listenConnState();
			//3获取特征
			getServiceId(deviceId);
		},
		fail: function (e) {
			console.log('建立连接失败', e)
			wx.hideLoading();
			EventBus.send(EventModel.EVENT_CONNSTATE, {
				code: false
			})
		}
	})
}

/**
 * 关闭连接
 */
u.disConn = function () {
	console.log('断开连接：' + DEVICEID)
	wx.closeBLEConnection({
		deviceId: DEVICEID,
		success: function (res) {
			DEVICEID = '';
			UUID_NOTIFY = "";
			UUID_WRITE = "";
			stopTimer();
			EventBus.send(EventModel.EVENT_CONNSTATE, {
				code: false
			})
		},
	})
}

/**
 * 监听连接状态变化
 */
function listenConnState() {
	wx.onBLEConnectionStateChange(function (res) {
		if (!res.connected) {
			EventBus.send(EventModel.EVENT_CONNSTATE, {
				code: false
			})
		}
	})
}

/**
 * 获取主服务ID
 */
function getServiceId(deviceId) {
	var serviceId = '';
	wx.getBLEDeviceServices({
		deviceId: deviceId,
		success: function (res) {
			console.log('主服务');
			console.log(res);
			for (var i = 0; i < res.services.length; i++) {
				if (res.services[i].isPrimary == true && SERVICEIDS.indexOf(res.services[i].uuid.substr(4, 4)) > -1) {
					serviceId = res.services[i].uuid.toUpperCase();
					break;
				}
			}
			UUID_SERVICE = serviceId;
			//获取特征值
			wx.getBLEDeviceCharacteristics({
				deviceId: deviceId,
				serviceId: serviceId,
				success: function (res) {
					console.log('特征');
					console.log(res);
					for (var i = 0; i < res.characteristics.length; i++) {
						if (res.characteristics[i].properties.write == true) {
							UUID_WRITE = res.characteristics[i].uuid.toUpperCase();
						}
						if (res.characteristics[i].properties.notify == true) {
							UUID_NOTIFY = res.characteristics[i].uuid.toUpperCase();
						}
						break;
					}
					// console.log(serviceId);
					// console.log(UUID_WRITE);
					// console.log(UUID_NOTIFY);
					if (UUID_SERVICE != '' && UUID_WRITE != '' && UUID_NOTIFY != '') {
						//获取特征成功才设置连接上
						// console.log('获取UUID成功');
						enableNotify(deviceId);
					}
				},
				fail: function (e) {
					console.log('获取主服务失败')
					//特征获取失败连接失败
					wx.hideLoading();
					u.disConn();
				}
			})
		},
		fail: function (e) {
			wx.hideLoading();
			//特征获取失败连接失败
			u.disConn();
		}
	})
}


/*******************获取已连接的设备*******************/
u.getConnState = function (deviceId, callback) {
	wx.getConnectedBluetoothDevices({
		services: SERVICEIDS,
		success: function (res) {
			console.log(res.devices);
			var conn = false;

			for (var i = 0; i < res.devices.length; i++) {
				if (res.devices[i].deviceId == deviceId) {
					conn = true;
					break;
				}
			}

			callback(conn);
		},
	})
}


/*******************写操作模块*******************/
/**
 * 开启写和通知
 */
function enableNotify(deviceId) {
	console.log('启用notify' + deviceId + " / service:" + UUID_SERVICE + " / char : " + UUID_NOTIFY);
	wx.notifyBLECharacteristicValueChange({
		deviceId: deviceId,
		serviceId: UUID_SERVICE,
		characteristicId: UUID_NOTIFY,
		state: true,
		success: function (res) {
			console.log('启用notify成功');
			listenReceive();
			DEVICEID = deviceId;
			wx.showToast({
				title: '连接成功',
			})
			EventBus.send(EventModel.EVENT_CONNSTATE, {
				code: true,
				datainfo: deviceId,
				sucinfo: '连接成功'
			})
		},
		fail: function (e) {
			//
			wx.hideLoading();
			console.log('启用notify失败');
		}
	})
}

/**
 * 写数据
 */
u.write = function (str) {
	var dataArr = subPackage(BleUtil.str2ab(str));
	dataArr.forEach(function (item, index) {
		write(item);
	})
}

/**
 * 写入指令
 */
function write(arrayBuffer) {
	wx.writeBLECharacteristicValue({
		deviceId: DEVICEID,
		serviceId: UUID_SERVICE,
		characteristicId: UUID_WRITE,
		value: arrayBuffer,
		success: function (res) {
			console.log('step.指令写入成功 : \n' + BleUtil.ab2str(arrayBuffer));
		},
	})
}

/**
 * 监听通知
 */
function listenReceive() {
	wx.onBLECharacteristicValueChange(function (res) {
		console.log('数据中心收到消息：' + hexString)
		EventBus.send(EventModel.EVENT_RECEIVE, {
			code: true,
			datainfo: hexString,
			sucinfo: '通知成功'
		});
	})
}

/**
 * 分包 大于20长度需要分包
 * 
 */
function subPackage(arrBuffer) {
	var valueArr = [];
	if (arrBuffer.byteLength <= 20) {
		valueArr.push(arrBuffer);
	} else {
		var index = 0;
		do {
			var length = arrBuffer.byteLength - index > 20 ? 20 : arrBuffer.byteLength - index;
			var newAb = new ArrayBuffer(length);
			newAb = arrBuffer.slice(index, index + length);
			valueArr.push(newAb);
			index += length;
		} while (index < arrBuffer.byteLength);
	}
	console.log(valueArr);
	return valueArr;
}



module.exports = u;