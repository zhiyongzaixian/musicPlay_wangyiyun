// pages/recommendSong/recommendSong.js
import PubSub from 'pubsub-js'
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: {
      month: 0,
      day: 0
    },
    recommendSongList: [],
    index: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    
    // 验证用户是否登录
    let loginAccessData = wx.getStorageSync('loginAccessCookies')
    if(!loginAccessData){
      wx.showToast({
        title: '请先登录',
        icon: 'loading',
        success: () => {
          wx.redirectTo({
            url: '/pages/login/login'
          })
        }
      })
      return;
    }
    
    // 获取当前日期
    this.setData({
      date: {
        month: new Date().getMonth() + 1,
        day: new Date().getDate()
      }
    })
    // 获取推荐歌单列表
    let recommendSongListData = await request('/recommend/songs')
    this.setData({
      recommendSongList: recommendSongListData.recommend
    })
    
    
    // 订阅消息
    PubSub.subscribe('switchMusic', (msg, type) => {
      console.log('switchMusic');
      // 1. 根据切歌类型查找对应的歌曲ID
      let {index, recommendSongList} = this.data;
      let musicId; // 即将播放的音乐id
      if(type === 'pre'){ // 上一首
        // 判断当前播放的是否是第一首
        (index === 0) && (index = recommendSongList.length);
        index -= 1;
        //
        musicId = recommendSongList[index].id;
        
      }else { // 下一首
        // 判断当前播放的是否是最后一首
        (index === recommendSongList.length - 1) && (index = -1);
        index += 1;
        musicId = recommendSongList[index].id;
      }
      // 更新下标
      this.setData({
        index
      })
      console.log(index);
      // 将获取到的音乐ID发送给song页面
      PubSub.publish('musicId', musicId)
      
    })
  },
  
  toSong(event){
    
    // 坑： 注意在路由跳转传参的时候参数的数据过大，会自动截取，导致参数内容丢失
    // let song = event.currentTarget.dataset.song
    // let obj = {username: 'wade', age: 39}
    // wx.navigateTo({
    //   url: '/pages/song/song?songData=' + JSON.stringify(obj)
    // })
  
  
    let song = event.currentTarget.dataset.song;
    let index = event.currentTarget.dataset.index;
    // 更新下标，为后续查找切换歌曲做准备
    this.setData({
      index
    })
    // wx.navigateTo({ // 使用该方法导致音乐播放进度条动态显示有延迟
    wx.redirectTo({
      url: `/songs/pages/song/song?id=${song.id}`,
      success: (res) => {
        console.log('更新成功: ', res);
      }
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
