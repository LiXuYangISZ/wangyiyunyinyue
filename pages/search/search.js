// pages/search/search.js
import request from '../../utils/request'
let isSend = false; //用于函数节流
Page({

    /**
     * 页面的初始数据
     */
    data: {
        placeholderContent: '', //placeholder的内容
        hotList: [], //热搜榜数据
        searchContent: '', //搜索内容
        searchList: [], //关键字搜索模糊匹配的数据
        historyList: [] //历史记录
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        //获取初始化数据
        this.getInitData();
        //获取历史记录
        this.getSearchHistory();
    },

    //获取初始化数据
    async getInitData() {
        let placeholderData = await request('/search/default');
        let hostData = await request('/search/hot/detail');
        this.setData({
            placeholderContent: placeholderData.data.showKeyword,
            hotList: hostData.data
        })
    },
    //获取本地历史记录的功能函数
    getSearchHistory() {
        let historyList = wx.getStorageSync('searchHistory');
        if (historyList) {
            this.setData({
                historyList
            });
        }

    },
    //表单项内容发生改变的回调
    handleInputChange(event) {
        //更新searchContent的数据
        // console.log(this.data.searchContent);
        this.setData({
            searchContent: event.detail.value.trim()
        });
        if (isSend) {
            return;
        }
        isSend = true;
        //进行搜索
        this.getSearchList();
        //函数节流:避免每输入一次就发送一次
        setTimeout(() => {
            isSend = false;
        }, 300);

    },
    //获取搜索数据的功能函数
    async getSearchList() {

        if (!this.data.searchContent) {
            this.setData({
                searchList: []
            })
            return; //如果搜索内容为空,则不发送请求
        }
        // console.log("11111");
        let { searchContent } = this.data;
        let searchListData = await request('/search', {
            keywords: searchContent,
            limit: 20
        });
        this.setData({
            searchList: searchListData.result.songs
        });


    },
    //搜索功能:点击搜索按钮进行确认搜索...同时搜索记录会被添加到本地的缓存中..
    handleSearch() {
        let { historyList, searchContent } = this.data;
        if (!searchContent) { //如果内容为空则不添加进历史记录
            return;
        }
        //将搜索的关键字添加到搜索历史记录中
        if (historyList.indexOf(searchContent) !== -1) {
            //如果有则删除之前的记录
            historyList.splice(historyList.indexOf(searchContent), 1);
        }
        //将其插入到数组最前面
        historyList.unshift(searchContent);
        this.setData({
            historyList
        })
        wx.setStorageSync('searchHistory', historyList);


    },
    //点击×号清空搜索内容
    clearSearchContent() {
        this.setData({
            searchContent: '',
            searchList: []
        });
    },
    //删除搜索历史记录
    deleteSearchHistory() {
        wx.showModal({
            content: '确认清空历史记录吗?',
            success: (res) => {
                if (res.confirm) {
                    this.setData({
                        historyList: []
                    });
                    //移除本地历史记录
                    wx.removeStorageSync('searchHistory');
                }
            }
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