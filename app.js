//app.js
const util = require('/utils/util.js')
const base64 = require('/utils/base64.js')
App({
  onLaunch: function () {
    // const arrayBuffer = new Uint8Array(['cta02d6kok6tmzupespep4nj','xa0zi07fif0ig2y5ogpmrc01n11ijtdj'])
    // console.log(wx.arrayBufferToBase64(arrayBuffer))
    var that = this;
    // 监听网络状态
　　wx.onNetworkStatusChange(function (res) {
　　　　if (res.networkType == 'none') {
　　　　　　that.globalData.nonetwork = true;
　　　　} else {
　　　　　　that.globalData.nonetwork = false;
　　　　}
　　})
  },
  onError (msg) {
    console.log("上传错误"+msg)
  },
  globalData: {
    userInfo: null,
    nonetwork:false,

  },
  requestHeader:{
    "content-type":'application/json',
    "Authorization":'Basic '+base64.encode(util.clientId+':'+util.clientSecret),
    "tenant":'MDAwMA==',
    "token":"Bearer "+wx.getStorageSync('token')
  },
  userLogin: function() {
    var that = this;
    return new Promise(function(resolve, reject){
        // 登录
        if(wx.getStorageSync('refreshToken') != ''){
          wx.request({
            url:util.loginUrl+'/api/oauth/anno/ai/parent/wx/token',
            method:"POST",
              header:that.requestHeader,
            data:{
              refreshToken:wx.getStorageSync('refreshToken'),
              grantType:'ai_parent_wx_refresh_token'
            },
            success:(res=>{
              console.log(res)
              // token失效
              if(res.data.code == 0 && !wx.getStorageSync('passWordStatus')){
                that.requestHeader.token="Bearer "+res.data.data.token
                // // 本地存储token
                wx.setStorageSync('token', res.data.data.token)
                // // 本地存储refreshToken
                wx.setStorageSync('refreshToken', res.data.data.refreshToken)
                wx.navigateTo({
                  url: '/pages/setPassword/setPassword'
                });
                reject(res);
              }else{
                // 40001 token失效，-10账号已禁用，40008异地登录
                if(res.data.code == 40001 || res.data.code == -10 ||  res.data.code == 40007  ||  res.data.code == 40008){
                  //删除本地储存的key
                  wx.removeStorageSync('token');
                  wx.removeStorageSync('refreshToken');
                  that.requestHeader.token="Bearer "
                  //成功退出授权页面
                  wx.navigateTo({
                    url: '/pages/index/index',
                  });
                }else if(res.data.code == 0){
                  if(res.data.isSuccess  == true){//用户已绑定
                    that.requestHeader.token="Bearer "+res.data.data.token
                    // // 本地存储token
                    wx.setStorageSync('token', res.data.data.token)
                    // // 本地存储refreshToken
                    wx.setStorageSync('refreshToken', res.data.data.refreshToken)
                  }
                  that.globalData.token=res.data.data.token
                }
                //promise机制放回成功数据
                resolve(res.data);
              }
              
            }),
            fail:(res=>{
              reject(res);
              wx.hideLoading()
              wx.showToast({
                title: '登录失败',
                icon:'none'
              })
            })
          })
        }else{
          wx.navigateTo({
            url: '/pages/index/index',
          });
        }
      })
  }
})