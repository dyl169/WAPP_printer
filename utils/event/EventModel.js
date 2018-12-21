/**
 * Data: 2018/06/15
 * Auth: Dongyunlong
 * Desc: eventModel
 */
var u = {};

u.EVENT_MAIN = 'event_uma_main';					//事件总线

//定义EVENT key
u.EVENT_BLESTATE = 'event_bleStateChange'; 						//蓝牙开关状态变化event
u.EVENT_SCAN = 'event_bleScan'; 								//扫描设备event
u.EVENT_CONNSTATE = 'event_connStateChange';					//蓝牙连接状态event
u.EVENT_RECEIVE = 'event_receive'; 								//接收数据event

module.exports = {
	EVENT_MAIN: u.EVENT_MAIN,
	EVENT_BLESTATE: u.EVENT_BLESTATE,
	EVENT_SCAN: u.EVENT_SCAN,
	EVENT_CONNSTATE: u.EVENT_CONNSTATE,
	EVENT_RECEIVE: u.EVENT_RECEIVE,
}