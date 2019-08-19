# WAPP_printer

基于小程序开发的蓝牙连接打印机打印标签

```


1.在需要调用蓝牙的页面中
初始化是传入设备的主服务UUID base.Ble.initBle(['FFF0', '0A71']);

2.在onLoad中执行监听函数（记得在onUnload中 remove掉事件监听）
//初始化所有监听
    initListen: function() {
        //监听蓝牙可用状态
        base.Event.listen(base.EventModel.EVENT_BLESTATE, function(data) {
            if (data.code) {
                console.log('蓝牙已打开')
                base.blestate = true;
            } else {
                console.log('蓝牙已关闭')
                base.blestate = false;
            }
        })

        //监听扫描设备
        base.Event.listen(base.EventModel.EVENT_SCAN, function(data) {
            if (data.stop) {
                console.log('停止扫描');
                that.setData({
                    bleSearchIng: false,
                })
            } else {
                var device = data.datainfo[0];
                console.log('扫描到的设备 : ' + JSON.stringify(device));
                that.data.deviceArray.push(device);
                that.setData({
                    deviceArray: that.data.deviceArray,
                    showDeviceDialog: true,
                })
            }
        })

        //监听蓝牙连接状态
        base.Event.listen(base.EventModel.EVENT_CONNSTATE, function(data) {
            console.log('连接状态变化');
            if (data.code == true) {
                console.log('index 连接成功')

                for (var i = 0; i < that.data.deviceArray.length; i++) {
                    if (that.data.deviceArray[i].deviceId === data.datainfo) {
                        that.data.connDevice = that.data.deviceArray[i];
                    }
                }

                that.setData({
                    connSucced: true,
                    connDevice: that.data.connDevice,
                })
            } else {
                that.setData({
                    connSucced: false,
                })
            }
        })

        //监听蓝牙值变化
        base.Event.listen(base.EventModel.EVENT_RECEIVE, function(result) {
            if (result.code == true && pageState == 'onLoad' || pageState == 'onShow') {
                var data = result.datainfo;
                console.log('main 页面接受到消息：' + data);

            }
        })
    },

3.如果打印机无法打印 请查看打印机说明书 知否支持TSPL或ESC指令指令 （本demo使用的佳博答应机）
  自行将PrintUtil.js中的打印指令修改为对应的打印指令即可
```
