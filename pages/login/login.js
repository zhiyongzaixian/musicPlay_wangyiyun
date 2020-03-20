// pages/login/login.js

import request from '../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    passwd: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  
  
  // 失去焦点的时候收集用户数据
  handleBlur(event){
    let type = event.currentTarget.dataset.id;
    this.setData({
      [type]: event.detail.value
    })
  },
  // 登录
  async handleLogin(){
    let {phone, passwd} = this.data;
    if(!phone || !passwd){
      wx.showLoading({
        title: '手机号/密码错误',
        mask: true
      })
      setTimeout(() => {
        wx.hideLoading();
      }, 2000)
      return
    }
    let loginAccessData = await request('/login/cellphone', {phone, password: passwd, isLogin: true});
    if(loginAccessData.statusCode === 200){
      // 存cookies, 为后期获取视频数据准备
      wx.setStorage({
        key: 'loginAccessCookies',
        data: JSON.stringify(loginAccessData.cookies),
      })
    
      // 存用户信息，个人中心页用
      wx.setStorage({
        key: 'userInfo',
        data: JSON.stringify(loginAccessData.data),
      })
    
      wx.showToast({
        title: '登录成功',
        success: () => {
          // 跳转至个人中心页
          wx.switchTab({
            url: '/pages/personal/personal'
          })
        }
      })
    }else {
      wx.showToast({
        title: loginAccessData.msg || '登录失败',
        mask: true
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
