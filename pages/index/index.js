// pages/index/index.js
//获取应用配置的常量
const base = getApp().constants;
let encoding = require('../../utils/encode/encodeing.js');
let that;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        deviceArray: [], //设备列表
        bleSearchIng: false, //是否在搜索中
        connSucced: false, //连接成功
        showDeviceDialog: false, //是否显示打印机dialog
        connDevice: {},
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        that = this;

        console.log(base.Ble);
        base.Ble.initBle(['FFF0', '0A71']);
        that.initListen();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        // base.Ble.write(base.PrintUtil.print('测试编码', '123456', '红色', 'www.baidu.com'));
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 点击搜索
     */
    clickSearch: function() {
        if (base.blestate) {
            that.setData({
                bleSearchIng: true,
            })
            that.data.deviceArray = [];
            base.Ble.startScan();
        } else {
            wx.showToast({
                icon: 'none',
                title: '请先打开蓝牙',
            })
        }
    },

    /**
     * 关闭选择弹窗
     */
    closeDeviceDialog: function() {
        that.setData({
            showDeviceDialog: false,
        })
    },

    /**
     * 点击设备
     */
    clickDevice: function(e) {
        that.closeDeviceDialog();
        var deviceId = e.currentTarget.dataset.id;
        base.Ble.conn(deviceId);
    },

    /**
     * 打印
     */
    clickPrint: function() {
        // for (var i = 0; i < 5; i++) {
        // 	base.Ble.write(base.PrintUtil.print('我是名字test' + i, '123456', '颜色red', '123456'));
        // }
        base.Ble.write(base.PrintUtil.print('我是名字test', '123456', '颜色red', '123456'));
    },

    /********************蓝牙相关操作********************/
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
})