import PubSub from 'pubsub-js'
import moment from 'moment'
import request from '../../utils/request'
let appData = getApp();

let startX = 0, moveX = 0, moveDistance = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false,
    song: {},
    songUrl: '',
    musicId: 0,
    isMusicSwitch: false, // 控制重复点击
    durationTime: 0, // 音乐时长 ms
    momentTime: 0, // 格式化时间
    currentMomentTime: '0: 00', // 格式化播放时长
    currentTime: 0, // 播放进度时间
    currentTimeWidth: 0 // 当前进度条的宽度
  },
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    
    // 获取路由传参数据： 音乐id
    let id = options.id*1; // 注意接收的参数是string，安全起见数据统一格式，转换成number
    // 获取歌曲详情
    let songData = await request(`/song/detail?ids=${id}`);
    this.backgroundManager = wx.getBackgroundAudioManager();
  
    let durationTime = songData.songs[0].dt; // 单位是ms
    let momentTime = moment(durationTime).format('mm:ss');
    console.log('时间格式化： ', momentTime);
    this.setData({
      song: songData.songs[0],
      durationTime,
      momentTime
    })
    
    
    wx.setNavigationBarTitle({
      title: this.data.song.name
    })
  
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#d43c33',
      // animation: {
      //   duration: 400,
      //   timingFunc: 'easeOut'
      // }
    })
    
    // 判断当前页面音乐是否在播放
    if(appData.globalData.isMusicPlay && appData.globalData.musicId === id){
      // 修改播放状态为true
      this.setData({
        isPlay: true
      })
    }
    
    
    // 监听音乐暂停
    this.backgroundManager.onStop(() => {
      console.log('音乐停止');
      // 1. 调整音乐播放的时间为0
      this.backgroundManager && this.backgroundManager.stop()
      // 2. 修改播放状态
      this.setData({
        isPlay: false
      })
      
      // 3. 修改全局播放状态
      appData.globalData.isMusicPlay = false;
    })
    
    this.backgroundManager.onTimeUpdate(() => {
      // console.log('时长： ', this.backgroundManager.duration); // 秒
      // console.log('时长： ', this.backgroundManager.currentTime); // 秒
      // this.backgroundManager.currentTime / this.backgroundManager.duration = this.data.currentTimeWidth / 450;
      let currentTimeWidth = this.backgroundManager.currentTime / this.backgroundManager.duration * 450;
      let currentMomentTime = moment(this.backgroundManager.currentTime*1000).format('mm:ss');
      this.setData({
        currentTimeWidth,
        currentMomentTime
      })
      
      // 自动切换下一首
      if(this.backgroundManager.currentTime >= this.backgroundManager.duration ){
        this.handleSwitch('next')
      }
    })
  },
  
  // 封装获取歌曲详情
  async musicControl(isPlay, musicId){
    // isPlay为即将播放的状态， musicId为播放的音乐ID
    if(isPlay){
      // 获取音乐播放链接
      let musicId = this.data.song.id;
      let voiceLinkData = await request(`/song/url?id=${musicId}`);
      let voiceLink = voiceLinkData.data[0].url;
      // 播放音乐
      this.backgroundManager.src = voiceLink;
      this.backgroundManager.title = this.data.song.name;
    
      // 在全局声明当前页面音乐在播放
      appData.globalData.musicId = musicId;
      appData.globalData.isMusicPlay = true;
    }else {
      // 音乐暂停
      this.backgroundManager.pause()
      appData.globalData.isMusicPlay = false;
    
    }
    // 修改播放的状态
    this.setData({
      isPlay
    })
  },
  // 控制音乐播放暂停
  async musicPlay(){
    let {isPlay, musicId} = this.data;
    // 调用封装的方法
    this.musicControl(!isPlay, musicId);
  },

  // 切换歌曲： 上一首，下一首
  switchSong(event){
    let type = event.currentTarget.dataset.type;
    // 判断是否连续点击多次
    let isMusicSwitch = this.data.isMusicSwitch;
    if(isMusicSwitch){
      return;
    }
    this.setData({
      isPlay: false,
      isMusicSwitch: true,
    })
    // 停止当前音乐，否则真机会出现卡顿
    this.backgroundManager.stop();
    this.handleSwitch(type)
    
    // // 发布消息
    // PubSub.publish('switchMusic', type);
    // // 订阅消息
    // PubSub.subscribe('musicId', async (msg, musicId) => {
    //   console.log(msg, musicId);
    //   // 获取歌曲详情
    //   let songData = await request(`/song/detail?ids=${musicId}`)
    //   this.setData({
    //     song: songData.songs[0],
    //     musicId: musicId
    //   })
    //   wx.setNavigationBarTitle({
    //     title: this.data.song.name
    //   })
    //
    //   // 获取最新的音乐url
    //   this.musicControl(true, musicId);
    //   this.setData({
    //     isMusicSwitch: false,
    //   })
    //   // 清除上一下绑定的事件musicId， 否则：每点击一次就订阅一次事件，导致事件池对象总有多个事件回调，会触发多次
    //   PubSub.unsubscribe('musicId')
    // })
  },
  
  // 封装切换歌曲的方法
  handleSwitch(type){
    // 发布消息
    PubSub.publish('switchMusic', type);
    // 订阅消息
    PubSub.subscribe('musicId', async (msg, musicId) => {
      console.log(msg, musicId);
      // 获取歌曲详情
      let songData = await request(`/song/detail?ids=${musicId}`)
      this.setData({
        song: songData.songs[0],
        musicId: musicId
      })
      wx.setNavigationBarTitle({
        title: this.data.song.name
      })
    
      // 获取最新的音乐url
      this.musicControl(true, musicId);
      this.setData({
        isMusicSwitch: false,
      })
      // 清除上一下绑定的事件musicId， 否则：每点击一次就订阅一次事件，导致事件池对象总有多个事件回调，会触发多次
      PubSub.unsubscribe('musicId')
    })
  },
  
  // 控制进度条
  progressControlStart(e){
    startX = e.touches[0].clientX;
    
    // 当用户再次点击进度条的时候，应该将之前进度条的宽度计算进去
    startX = startX - (this.data.currentTimeWidth / 2);
    console.log('start: ', startX);
    this.moveDistance = 0;
  },
  progressControlMove(e){
    moveX = e.touches[0].clientX;
    moveDistance = (moveX - startX) * 2; // 注意：单位是px
    console.log('move: ', moveDistance);
    if(moveDistance < 0){
      return;
    }
    if(moveDistance >= 450){
      moveDistance =  450;
    }
    
    
    this.setData({
      currentTimeWidth: moveDistance
    })
    
    
  },
  progressControlEnd(e){
    // 计算播放时长
    // this.backgroundManager.currentTime / this.backgroundManager.duration = this.data.currentTimeWidth / 450;
    this.backgroundManager.seek(moveDistance / 450 * this.backgroundManager.duration);
  },
  
  
  // 播放模式切换
  playTypeControl(){
    console.log('播放模式切换');
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
