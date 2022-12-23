/**
  说明: 登录流程
  1. 收集表单项数据
  2. 前端验证
    1) 验证用户信息(账号，密码)是否合法
    2) 前端验证不通过就提示用户，不需要发请求给后端
    3) 前端验证通过了，发请求(携带账号, 密码)给服务器端
  3. 后端验证
    1) 验证用户是否存在
    2) 用户不存在直接返回，告诉前端用户不存在
    3) 用户存在需要验证密码是否正确
    4) 密码不正确返回给前端提示密码不正确
    5) 密码正确返回给前端数据，提示用户登录成功(会携带用户的相关信息)
*/

import request from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        phone: '',
        password: ''
    },

    // 表单内容发生改变的回调
    handleInput(event) {
        let type = event.currentTarget.id;
        //let type = event.currentTarget.dataset.type  但使用data-key=value
        // console.log(event.currentTarget.id + ":" + event.detail.value);
        this.setData({
            [type]: event.detail.value //通过type进行赋值.
        })
    },
    //登录的表单验证
    async login(event) {
        //收集表单数据
        let { phone, password } = this.data;
        //2.前端验证
        /**
         * 手机号验证:
         *      1.内容为空
         *      2.手机号格式不正确
         *      3.手机号格式正确,验证通过
         */
        if (!phone) {
            //提示用户
            wx.showToast({
                title: '手机号不能为空',
                icon: 'error',
            });
            return; //后续代码不执行
        }
        //定义正则
        let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!phoneReg.test(phone)) {
            wx.showToast({
                title: '手机号格式错误',
                icon: 'error'
            });
            return; 
        } 
        //验证密码
        if (!password) {
            //提示用户
            wx.showToast({
                title: '密码不能为空',
                icon: 'error',
            });
            return; //后续代码不执行
        }
        //后端验证
        let result = await request("/login/cellphone", { phone, password, isLogin: true });
        if (result.code === 200) {
            wx.showToast({ 
                    title: '登录成功'
                })
                //将用户信息存储到本地
            wx.setStorageSync("userInfo", JSON.stringify(result.profile));

            //跳转至个人中心的personal页面
            wx.reLaunch({
                url: '/pages/personal/personal',
            });


        } else if (result.code === 400) {
            wx.showToast({
                title: '手机号错误',
                icon: 'error'
            })
        } else if (result.code === 502) {
            wx.showToast({
                title: '密码错误',
                icon: 'error'
            })
        } else if (result.code === 501) {
            wx.showToast({
                title: '账号不存在',
                icon: 'error'
            })
        } else {
            wx.showToast({
                title: '登录失败,请重新登录',
                icon: 'none'
            })
        }

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

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