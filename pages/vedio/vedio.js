import request from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        navId: '',
        videoGroupList: [], //视频导航栏
        videoList: [], //视频列表
        videoId: '',
        videoUpdateTime: [], //记录视频的播放时长,
        isTriggered: false,
        offset: 0, //记录视频的页数(后台分页)
        index: 0 //记录视频的id,用作遍历的v-key.

    },

    async getVideoGroupListData() {
        let videoGroupListData = await request("/video/group/list");
        // console.log(videoGroupListData);
        this.setData({
            videoGroupList: videoGroupListData.data.slice(0, 9),
            navId: videoGroupListData.data[0].id
        });
        //获取视频列表数据
        this.getVideoList(this.data.navId);
    },
    changeNav(event) {
        // let navId = event.currentTarget.id; //通过id想event传参的时候如果传递的是number类型,则会转换成string类型
        let navId = event.currentTarget.dataset.id;
        this.setData({
            navId: navId,
            //单击切换后,将之前的列表进行清空.
            videoList: []
        });
        wx.showLoading({
            title: '正在加载',
        });

        //动态获取当前导航对应的视频数据
        this.getVideoList(this.data.navId);
    },
    //获取视频列表数据
    async getVideoList(navId) {
        if (!navId) { //判断navId为空字符串的情况
            return;
        }
        //当前页数
        let offset = this.data.offset;
        //万有引力这个无推荐视频...
        let videoListData = await request('/video/group', { id: navId, offset });
        wx.hideLoading();
        let index = this.data.index;
        //获取新的数据
        let videoList2 = videoListData.datas.map(item => {
            item.id = index++;
            return item;
        })
        this.setData({
            //拼接在原数组后面
            videoList: this.data.videoList.concat(videoList2),
            isTriggered: false,
            offset: offset + 1,
            index
        })
    },
    //点击播放/继续播放的问题
    handlePlay(event) {
        /*  ???这里很蒙蔽(暂时不用管)
              问题： 多个视频同时播放的问题
            * 需求：
            *   1. 在点击播放的事件中需要找到上一个播放的视频
            *   2. 在播放新的视频之前关闭上一个正在播放的视频
            * 关键：
            *   1. 如何找到上一个视频的实例对象
            *   2. 如何确认点击播放的视频和正在播放的视频不是同一个视频
            * 单例模式：
            *   1. 需要创建多个对象的场景下，通过一个变量接收，始终保持只有一个对象，
            *   2. 节省内存空间
            * */
        let vid = event.currentTarget.id;


        //关闭上一个播放的视频
        // this.vid != vid && this.videoContext && this.videoContext.stop();
        // this.vid = vid;
        this.setData({
            videoId: vid
        });
        //创建控制video的实例对象
        this.videoContext = wx.createVideoContext(vid);
        //判断当前的视频是否播放过,是否有播放记录,如果有,跳转至指定的播放时间
        let { videoUpdateTime } = this.data;
        let videoItem = videoUpdateTime.find(item => {
            item.vid === vid
        });
        if (videoItem) { //如果有播放过,跳转到指定地方
            this.videoContext.seek(videoItem.currentTime);
        }
        this.videoContext.play();
    },
    //监听视频播放进度的回调
    handleTimeUpdate(event) {
        let videoTimeObj = {
            vid: event.currentTarget.id,
            currentTime: event.detail.currentTime
        };
        let videoUpdateTime = this.data.videoUpdateTime;
        /*
         * 思路： 判断记录播放时长的videoUpdateTime数组中是否有当前视频的播放记录
         *   1. 如果有，在原有的播放记录中修改播放时间为当前的播放时间
         *   2. 如果没有，需要在数组中添加当前视频的播放对象
         *
         * */
        let videoItem = videoUpdateTime.find(item =>
            item.vid === videoTimeObj.vid
        );
        if (videoItem) { //如果有
            // console.log("已经cunru..");
            videoItem.currentTime = event.detail.currentTime;
        } else {
            // console.log("没有存入.")
            videoUpdateTime.push(videoTimeObj);
            //videoUpdateTime.push(videoTimeObj);
        }
        //更新videoUpdateTime的状态
        this.setData({
            videoUpdateTime
        })


    },
    //视频播放结束的回调
    handleEnded(event) {
        //移除记录播放时长数组中当期那视频的对象
        let videoUpdateTime = this.data.videoUpdateTime;
        videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.detail.currentTime), 1);
        this.setData({
            videoUpdateTime
        })
    },
    //自定义下拉刷新的回调 scroll-view
    handleRefresher() {
        // console.log("scroll-view下拉刷新");
        //再次发送请求,获取最新的视频列表数据
        this.getVideoList(this.data.navId);
        //下拉刷新时,当前offset以及index为0
        this.setData({
            //所有进行清空
            index: 0,
            offset: 0, //offset为啥保持不变呢? 但这是一个合理地错误,可以达到每次刷新显示的内容都不一样.
            videoList: []
        });
        // console.log(this.data.offset);
    },
    //自定义上拉触底的回调
    handleToLower() {
        // console.log("scroll-view上拉触顶");
        //更新下一页
        this.getVideoList(this.data.navId);


    },
    //点击进入音乐搜索页面
    toSearch() {
        wx.navigateTo({
            url: '/pages/search/search'
        })
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
        // 获取导航数据
        this.getVideoGroupListData();
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
    onShareAppMessage: function( /*{ from }*/ ) {
        /**/
        // console.log(from);
        // if (from === 'button') {
        //     return {
        //         title: '来自button的转发',
        //         page: '/pages/video/video',
        //         imageUrl: '/static/images/nvsheng.jpg'
        //     }
        // } else {
        //     return {
        //         title: '来自menu的转发',
        //         page: '/pages/video/video',
        //         imageUrl: '/static/images/nvsheng.jpg'
        //     }
        // }

    }
})