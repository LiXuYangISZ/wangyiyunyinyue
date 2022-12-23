// pages/songDetail/songDetail.js
import PubSub from 'pubsub-js';

import request from '../../utils/request'
//获取全局实例
const appInstance = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        song: {}, //当前页面显示的歌曲.
        isPlay: false, //音乐是否播放
        musicId: '', //当前音乐的id
        // musicLink: '' //保存歌曲的链接。
        currentTime: '00:00', //实时时间
        durationTime: '00:00', //总时长
        currentTimeWith: 0, //进度条占的百分比
        bofangType: 0, //播放类型  0 顺序播放 1随机播放 2单曲循环
        leftLen: 0 //用于保存进度条view组件到左侧的距离.


    },

    //点击播放/暂停的回调
    handleMusicPlay() {
        let isPlay = !this.data.isPlay;
        // this.setData({//该设置已经被监听器所拥有,无需再设置.
        //     isPlay
        // })

        //console.log(isPlay);
        //this.musicControl(isPlay, musicId);
        let { musicId } = this.data;
        this.musicControl(isPlay, musicId);
    },
    //控制音乐播放/暂停的功能函数
    //这里没有必要使用musicLink来保存音乐的链接，因为当发送请求后会被存到本地。如果下次发送一样的请求则会直接使用本地的。
    async musicControl(isPlay, musicId) { 
        //创建控制音乐播放的实例
        // var backAudioManager = wx.getBackgroundAudioManager();
        if (isPlay) { //音乐播放
            //if (!musicLink) { //如果只是当前音乐的暂停/继续 此时当前音乐已经存在，则不必重新发送请求---❌没必要了。
            let musicLinkData = await request('/song/url', { id: musicId });
            //console.log(musicLinkData);
            let musicLink = musicLinkData.data[0].url;
            // this.setData({
            //     musicLink
            // });
            //  }

            this.backAudioManager.src = musicLink;
            this.backAudioManager.title = this.data.song.name;
        } else {
            this.backAudioManager.pause(); //暂停音乐
        }


    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // options: 用于接收路由跳转的query参数
        // 原生小程序中路由传参，对参数的长度有限制，如果参数长度过长会自动截取掉
        // console.log(JSON.parse(options.songPackage));
        let musicId = options.musicId;
        this.setData({
            musicId
        });
        //获取音乐详情
        this.getMusicInfo(musicId);

        //判断当前音乐是否在播放.
        if (appInstance.globalData.musicId == musicId) { //如果当前id和背景音乐一致,就显示对应的相关信息.
            this.setData({
                isPlay: appInstance.globalData.isMusicPlay,
                currentTimeWith: appInstance.globalData.currentTimeWith,
                currentTime: appInstance.globalData.currentTime
            })
        } else {
            this.setData({
                isPlay: false,
                currentTimeWith: 0,
            })
        }

        //创建控制音乐播放的实例
        this.backAudioManager = wx.getBackgroundAudioManager();
        //设置音乐播放/暂停/停止 的监听
        this.backAudioManager.onPlay(() => {
            //修改全局音乐播放的状态
            appInstance.globalData.musicId = musicId;
            this.changePlayState(true);

        });
        this.backAudioManager.onPause(() => {
            this.changePlayState(false);
        });
        this.backAudioManager.onStop(() => {
            this.changePlayState(false);
        });
        //监听音乐实时播放的进度
        this.backAudioManager.onTimeUpdate(() => {
            // console.log("总时长:" + this.backAudioManager.duration);
            // console.log("当前时长:" + this.backAudioManager.currentTime);
            let { musicId } = this.data;
            //如果是当前歌曲再修改其进度/以及实时时长.
            let minute = Math.floor(this.backAudioManager.currentTime/60);
            let second = Math.floor(this.backAudioManager.currentTime) % 60;
            // let currentTime = moment(this.backAudioManager.currentTime * 1000).format("mm:ss");
            let currentTime = (minute < 10 ? '0'+minute :minute) +':'+ (second<10?'0'+second:second);
            let currentTimeWith = this.backAudioManager.currentTime / this.backAudioManager.duration * 450;
            if (appInstance.globalData.musicId == musicId) { //如果当前页面的music和背景音乐一致.显示相关信息
                this.setData({
                    currentTime,
                    currentTimeWith
                })
            }
            //将相关动态参数同步到全局js文件中
            appInstance.globalData.currentTimeWith = currentTimeWith;
            appInstance.globalData.currentTime = currentTime;
        });
        //监听音乐播放自然结束
        this.backAudioManager.onEnded(() => {
            // console.log("音乐播放结束了...");
            //将实时进度条,进度时长调整为0
            this.setData({
                currentTimeWith: 0,
                currentTime: '00:00'
            });
            //自动切换至下一首音乐,并且自动播放.
            // 发布消息数据给recommendSong页面,根据播放模式让其切换到下一首
            let { bofangType } = this.data;
            let parameters = {
                bofangType,
                type: "next"
            }; 
            PubSub.publish('switchType', parameters);
            let isPlay = this.data.isPlay;
            PubSub.subscribe('musicId', (msg, musicId) => {
                // console.log(musicId);

                // 获取音乐详情信息
                this.getMusicInfo(musicId);
                // 播放当前的音乐 根据上一首音乐是否播放的情况.如果上一首是播放的状态,则当前也将是播放的状态.如果上一首未播放,则当前也显示未播放状态.
                this.musicControl(true, musicId);
                // 取消订阅 防止多次订阅.
                PubSub.unsubscribe('musicId');
            });
        });

    },
    //修改播放状态的功能函数
    changePlayState(isPlay) {
        this.setData({
            isPlay
        }); 
        //修改全局中音乐是否在播放的状态
        let { currentTimeWith, currentTime } = this.data;
        appInstance.globalData.isMusicPlay = isPlay;

    },
    async getMusicInfo(musicId) {
        let songData = await request('/song/detail', { ids: musicId }); 
        let minute = Math.floor(songData.songs[0].dt / 1000/ 60);
        let second = Math.floor(songData.songs[0].dt / 1000) % 60;
        // let durationTime = moment(songData.songs[0].dt).format('mm:ss');
        let durationTime =(minute < 10 ? '0'+minute :minute) +':'+ (second<10?'0'+second:second);
        this.setData({
            song: songData.songs[0],
            durationTime
        });
        //动态修改窗口的标题
        wx.setNavigationBarTitle({
            title: this.data.song.name
        })


    },
    // 点击切歌的回调
    handleSwitch(event) {
        // 获取切歌的类型 pre/next
        let type = event.currentTarget.id;

        // 关闭当前播放的音乐
        this.backAudioManager.stop();
        // // 订阅来自recommendSong页面发布的musicId消息

        // 发布消息数据给recommendSong页面
        //如果当前是单曲循环,则点击下一首,我们将其当做顺序播放类型.
        let { bofangType } = this.data;
        if (bofangType === 2) {
            bofangType = 0;
        }
        let parameters = {
            bofangType,
            type
        };


        let isPlay = this.data.isPlay;
        PubSub.subscribe('musicId', (msg, musicId) => {
            // console.log(musicId);

            // 获取音乐详情信息
            this.getMusicInfo(musicId);
            // 播放当前的音乐 根据上一首音乐是否播放的情况.如果上一首是播放的状态,则当前也将是播放的状态.如果上一首未播放,则当前也显示未播放状态.
            this.musicControl(isPlay, musicId);
            // 取消订阅 防止多次订阅.
            PubSub.unsubscribe('musicId');
        }); 

        PubSub.publish('switchType', parameters);
    },
    //点击切换音乐播放模式:单曲循环,随机播放,顺序播放.
    handleSwitchType(event) {
        // console.log(event);
        //前台的数据都是string,此处要转为number类型.
        let typeId = event.currentTarget.dataset.type * 1;
        typeId = ++typeId % 3; // 
        this.setData({
                bofangType: typeId
            })
            // console.log(typeId);

    },
    //修改进度条的函数
    changeSchedule(event) {

        let _this = this;
        let query = wx.createSelectorQuery();
        query.select(".barControl").boundingClientRect();
        // this.leftLen = 0;
        query.selectViewport().scrollOffset();
        let result = query.exec(function(res) {
            console.log(res);
            _this.setData({
                    leftLen: res[0].left * 2
                })
                // console.log("进度条坐标1:" + res[0].left);
        });
        let { leftLen } = this.data;



        //这里一定要注意单位...好坑,自己设的是rpx,结果计算的是px
        let resLen = event.detail.x*2  - leftLen;
        console.log(resLen);
        this.setData({
            currentTimeWith: resLen
        });
        var second = resLen * this.backAudioManager.duration / 450; // 当前播放的进度条/总进度条=当前时间/总时间
        let { isPlay, currentTime } = this.data;
        // console.log(currentTime);
        this.backAudioManager.seek(second);
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