// app.js
App({
    //用于存储推荐歌曲,音乐详情退出后又进入之前相同歌曲页面,页面状态的问题.
    globalData: {
        isMusicPlay: false, //是否有音乐在播放
        musicId: '', //音乐id
        currentTimeWith: 0, //进度条的进度
        currentTime: '00:00'
    },
    onLaunch() {
        // 展示本地存储能力
        const logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

        // 登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
        })
    },
    globalData: {
        userInfo: null
    }
})