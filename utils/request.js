import config from './config'
export default (url, data={}, method='GET') => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.host + url,
      data,
      method,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        // 'cookie': (JSON.parse(wx.getStorageSync("loginAccessCookies") || "[]"))
        // 注意： cookie后跟的必须是字符串，不使用模板字符串无法读取loginAccessCookies中的数据
        'cookie': `${(JSON.parse(wx.getStorageSync("loginAccessCookies") || "[]"))}`
      },
      success: (res) => {
        if(data.isLogin){
          resolve(res);
        }else {
          resolve(res.data);
        }
      },
      fail: (error) => {
        reject(error)
      }
    });
  });
}
