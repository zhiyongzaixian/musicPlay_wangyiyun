// pages/index/index.js
import request from '../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [],
    recommendList: [],
    topListPart: [],
    initTopListId: [0,1,2,3,4]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let bannerListData = await request('/banner');
    console.log(bannerListData);
    this.setData({
      bannerList: bannerListData.banners
    })
    
    //获取推荐歌曲数据
    let recommendListData = await request('/personalized');
    this.setData({
      recommendList: recommendListData.result
    })
    
    // 获取排行榜数据
    let initTopListId = this.data.initTopListId;
    let index = 0;
    let resultArrPart = []; // 部分数据，截取每个数组的前三个数据
    let result; // 单例模式
    while (index < initTopListId.length) {
      console.log('xxxxxxxxx', index);
      result = await request(`/top/list?idx=${index++}`);
      let obj = {name: result.playlist.name, tracks: [...result.playlist.tracks].slice(0, 3)}
      resultArrPart.push(obj)
      // 显示的快
      this.setData({
        topListPart: resultArrPart
      })
    }
    // this.setData({
    //   topListPart: resultArrPart
    // })
  
  },
  
  
  // 跳转至 recommendSong
  toRecommendList(){
    wx.navigateTo({
      url: '/songs/pages/recommendSong/recommendSong'
    })
  },
  toOthers(){
    wx.navigateTo({
      url: '/others/pages/other/other'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady:  function () {
    console.log('onReady');
  
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('onShow');
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('hide');
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('onUnload');

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
