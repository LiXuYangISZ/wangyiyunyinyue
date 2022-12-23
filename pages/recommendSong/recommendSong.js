// pages/recommendSong/recommendSong.js
import PubSub from 'pubsub-js';
import request from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        day: '', //天
        month: '', //月份
        recommendList: [], //每日推荐列表
        index: 0 //点击音乐的下标
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        //判断用户是否登录
        let userInfo = wx.getStorageSync('userInfo');
        if (!userInfo) {
            wx.showToast({
                title: '请先登录',
                icon: 'none',
                success: () => {
                    //跳转到登录界面
                    wx.reLaunch({
                        url: '/pages/login/login'
                    })
                }
            })
        }
        //更新日期的状态数据
        this.setData({
            day: new Date().getDate(),
            month: new Date().getMonth() + 1
        });
        //获取每日推荐的数据
        this.getRecommendList();
        // 订阅来自songDetail页面发布的消息(即获得index,找到下一首个musicId传回songDetail)
        //注意:这里的index是从0开始的,并没有按照列表的顺序.
        PubSub.subscribe('switchType', (msg, parameters) => {
            // console.log(msg);
            let { recommendList, index } = this.data;
            // console.log(parameters);
            //根据播放类型决定下一首的index
            // console.log(parameters.bofangType);
            // console.log(typeof parameters.bofangType);
            if (parameters.bofangType === 0) { //顺序播放
                if (parameters.type === 'pre') { // 上一首
                    (index === 0) && (index = recommendList.length);
                    index -= 1;
                } else { // 下一首
                    (index === recommendList.length - 1) && (index = -1);
                    index += 1;
                }

            } else if (parameters.bofangType === 1) //随机播放
            {
                let newIndex = Math.ceil(Math.random() * recommendList.length);
                while (index == newIndex) { //如果获取的还和之前一样则再次获取
                    let newIndex = Math.ceil(Math.random() * recommendList.length);
                }
                index = newIndex;


            } //如果是单曲循环,则不做处理.

            console.log(index);


            // 更新下标
            this.setData({
                index
            })

            let musicId = recommendList[index].id;
            // 将musicId回传给songDetail页面
            PubSub.publish('musicId', musicId)

        });

    },
    //获取用户每日推荐数据
    async getRecommendList() {
        let recommendListData = await request('/recommend/songs');
        this.setData({
            recommendList: recommendListData.recommend
        })
    },

    //跳转至songDetail页面
    toSongDetail(event) {
        // console.log(event);
        let song = event.currentTarget.dataset.song;
        //路由跳转传参
        wx.navigateTo({
            // 不能直接将song对象作为参数传递，长度过长，会被自动截取掉
            // url: '/pages/songDetail/songDetail?songPackage=' + JSON.stringify(songPackage)
            url: '/pages/songDetail/songDetail?musicId=' + song.id
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