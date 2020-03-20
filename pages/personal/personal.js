import request from '../../utils/request.js'

let startY = 0, moveY = 0;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    coverTransform: 'translateY(0)',
    coverTransition: '0s',
    recentPlayList: [], // 最近播放列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 确认用户是否登录
    let userInfo = await wx.getStorageSync('userInfo') || '{}'
    userInfo = JSON.parse(userInfo)
    // 获取用户最近播放列表
    // type=0获取allData， type默认为1，只返回weekData
    if(userInfo.profile){ // 判断是否用户登录
      this.setData({userInfo})
      // let recentPlayListData =  await request('/user/record', {uid:  JSON.parse(userInfo).profile.userId, type: 1})
      let recentPlayListData =  await request('/user/record', {uid:  userInfo.profile.userId, type: 0})
      console.log(recentPlayListData);
      this.setData({
        // recentPlayList: recentPlayListData.weekData
        recentPlayList: recentPlayListData.allData
      })
    }
  },
  
  // 处理滑动动画
  coverTouchStart(e){
    // 开启过渡
    this.setData({
      coverTransition: 'transform 0.5s linear'
    })
    startY = e.touches[0].clientY;
  },
  coverTouchMove(e){
    moveY = e.touches[0].clientY;
    let moveDistance = moveY - startY;
    // 禁止滑动到元素静态位置上边
    if(moveDistance < 0){
      this.moving = false;
      return;
    }
    
    this.moving = true;
  
    // 设定临界最大值为80， 超过80的恒等于80
    if(moveDistance >= 80 && moveDistance < 100){
      moveDistance = 80;
    }

  
    if(moveDistance > 0 && moveDistance <= 80){
      this.setData({
        coverTransform: `translateY(${moveDistance}px)`
      })
    }
    
    // this.setData({
    //   coverTransform: `translateY(${moveDistance}px)`
    // })
  },
  coverTouchend(){
    // 验证是否需要执行结束的过渡逻辑
    if(this.moving === false){
      return;
    }
    this.moving = false;
    this.setData({
      coverTransition: 'transform 0.3s cubic-bezier(.21,1.93,.53,.64)',
      coverTransform: 'translateY(0px)'
    })
  },
  
  toLogin(){
    !this.data.userInfo.profile && wx.redirectTo({
      url: '/pages/login/login'
    })
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
