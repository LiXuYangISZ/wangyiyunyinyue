// pages/index/index.js
import request from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        bannerList: [], //轮播图数据
        recommendList: [], //推荐歌单
        topList: [], //排行榜
    },
    //跳转至歌曲推荐页面
    toRecommendSong() {
        wx.navigateTo({
            url: '/pages/recommendSong/recommendSong',
        });

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function(options) {
        // wx.request({
        //     url: 'http://localhost:3000/banner',
        //     data: { type: 2 },
        //     method: 'GET',
        //     success: (result) => {
        //         console.log("请求成功:", result);
        //     },
        //     fail: (error) => {
        //         console.log("请求失败", error);
        //     }
        // });
        //1.轮播图
        let bannerListData = await request("/banner", { type: 2 });
        //console.log("结果数据:", bannerListData);
        this.setData({
                bannerList: bannerListData.banners
            })
            //2.推荐歌单
        let recommendListData = await request("/personalized", { limit: 10 });
        //console.log("结果数据:", recommendListData);
        this.setData({
                recommendList: recommendListData.result
            })
            //3.动态排行榜
            /**
             *需求分析:
                1.需要根据idx的值获取对应的数据
                2.idx的值的范围是0--36 我们需要0-4
                3.需要发送5次请求

             */
        let index = 0;
        let resultArr = [];
        while (index < 10) {
            let topListData = await request('/top/list', { idx: index++ });
            let topListItem = {
                name: topListData.playlist.name,
                //splice(会修改原数组,可以对指定的数组进行增删改)slice(不会修改原数组) 
                tracks: topListData.playlist.tracks.slice(0, 5)
            };
            resultArr.push(topListItem);
            //不需要等待五次请求全部结束才更新,用户体验较好,但是渲染次数会多一点.
            this.setData({
                topList: resultArr
            })
        };
        //更新topList的状态值,放在此处更新会导致发送请求的过程中长时间白屏,用户体验差
        // this.setData({
        //     topList: resultArr
        // })
        // console.log("结果数据:", topList);





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