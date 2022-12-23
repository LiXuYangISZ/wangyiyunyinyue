import request from '../../utils/request'

let startY = 0; //手指起始的坐标
let moveY = 0; //手指移动的坐标
let moveDistance = 0; //手指移动的距离

Page({

    /**
     * 页面的初始数据
     */
    data: {
        coverTransform: 'translateY(0)',
        coverTransition: '',
        userInfo: {},
        recentPlayList: [], //用户播放记录

    },
    handleTouchStart(event) {
        //每次手指下拉移动前移除上次的过度样式
        this.setData({
                coverTransition: ''
            })
            //获取手指起始坐标
        startY = event.touches[0].clientY;

    },
    handleTouchMove(event) {
        moveY = event.touches[0].clientY;
        moveDistance = moveY - startY;
        // console.log(moveDistance);
        if (moveDistance <= 0) {
            return;
        }
        if (moveDistance >= 90) {
            moveDistance = 90;
        }
        //动态更新coverTranform的状态值.
        this.setData({
            coverTransform: `translateY(${moveDistance}rpx)`
        })
    },
    handleTouchEnd(event) {
        this.setData({
            //当松开手指后,弹回去
            coverTransform: `translateY(0rpx)`,
            coverTransition: 'transform 1s linear'
        })

    },
    //点击个人中心的上半部分去登录
    toLogin() {
        wx.navigateTo({
            url: '/pages/login/login',
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        //读取用户的基本信息
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo) { //用户登录
            //更新userInfo
            this.setData({
                userInfo: JSON.parse(userInfo)
            });
            //获取用户播放记录
            this.getUserRecentPlayList(this.data.userInfo.userId)
        }

    },
    async getUserRecentPlayList(userId) {
        let recentPlayListData = await request('/user/record', { uid: userId, type: 0 });
        if (recentPlayListData.allData.length === 0) {
            return; //如果数据为空则直接不进行下列数据封装的操作.
        }
        let index = 0; //对象里面没有唯一的属性可以当做循环时的vx-key
        let recentPlayList = recentPlayListData.allData.splice(0, 10).map(item => {
            item.id = index++;
            return item;
        }); //为每一条数据加上一个index属性
        this.setData({
            recentPlayList
        })
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
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})