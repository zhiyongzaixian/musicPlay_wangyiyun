// pages/video/video.js
import request from '../../utils/request.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [], // 导航列表
    navId: null,
    videoList: [],
    isActivePraised: [], // 标识点赞是否点击
    isActiveComment: [], // 标识评论是否点击
    isTrigger: false,
    vid: null, // 标识视频的id地址
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let userInfo = wx.getStorageSync('userInfo');
    if(!userInfo){
      wx.showToast({
        title: '请先登录',
        icon: 'loading',
        success: () =>{
          wx.redirectTo({
            url: '/pages/login/login'
          })
        }
      })
      return;
    }
    
    let videoGroupListData = await request('/video/group/list')
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0, 14),
      navId: videoGroupListData.data[0].id
    })
  
    wx.showLoading({
      title: '正在加载中'
    })
    this.getVideoListData();
  },
  
  async getVideoListData(){
    // 获取视频标签下对应的视频数据
    // 注意： 需要先登录！！！模拟登录， 后期整改到登录页面
    this.setData({
      videoList: []
    })
    // let loginAccessData = await request('/login/cellphone?phone=15711140593&password=199202yzy', {isLogin: true});
    let videoListData = await request(`/video/group`, {id: this.data.navId}, 'GET')
    wx.hideLoading()
    console.log(videoListData);
    this.setData({
      videoList: videoListData.datas
    })
  },
  
  // 拍摄视频或者打开本地相册视频
  chooseVideo(){
    wx.chooseVideo({
      maxDuration: 40 // 注意上限是60， 官网没有明确说明
    })
  },
  
  // 修改导航ID
  changeNavId(event){
    wx.showLoading({
      title: '正在加载中'
    })
    console.log(event);
    this.setData({
      navId: event.currentTarget.dataset.id,
      isActivePraised: [], // 标识点赞是否点击
      isActiveComment: [],
    })
    // console.log(this.data.navId);
    this.getVideoListData();
  },
  // 修改点赞图标 评论图标
  handleChangePraised(event){
    // 根据传入标识动态修改 状态数据
    let {index, id} = event.currentTarget.dataset;
    if(id === 'isActivePraised'){
      let isActivePraised = this.data.isActivePraised
      isActivePraised[index] = !(isActivePraised[index] || false)
      this.setData({
        isActivePraised
      })
    }else {
      // 根据传入标识动态修改 状态数据
      let {index} = event.currentTarget.dataset;
      let isActiveComment = this.data.isActiveComment
      isActiveComment[index] = !(isActiveComment[index] || false)
      this.setData({
        isActiveComment
      })
    }
    
  },
  
  
  // 下拉刷新
  async handleRefresherPull(data){
    console.log('下拉刷新。。。');
    // let loginAccessData = await request('/login/cellphone?phone=15711140593&password=199202yzy', {isLogin: true});
    let videoListData = await request(`/video/group`, {id: this.data.navId}, 'GET')
    console.log(videoListData.datas);
  
    this.setData({
      videoList: videoListData.datas,
      isTrigger: false
    
    })
  },
  
  handleRefresherRestore(){
    console.log('复位。。。');
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
    // 自定义分享内容
    return {
      title: '硅谷音乐',
      path: '/pages/video/video',
      imageUrl: this.data.videoList[event.target.dataset.index].data.coverUrl
    }
  }
})
