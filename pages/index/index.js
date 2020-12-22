//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    navTop:''
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function (options) {
     var that=this;
     this.getWxCode()
    // 定时获取code
    var getCode=setInterval(function(){
      that.getWxCode()
    },280000)
    
    this.setData({
      navTop:wx.getSystemInfoSync()['statusBarHeight']+10+'px',
      getCode:getCode
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  onUnload:function(){
    clearInterval(this.data.getCode);
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // 授权登录
  getPhoneNumber (e) {
    // 通过授权
    if(e.detail.errMsg == "getPhoneNumber:ok" ){
      wx.showLoading({
        title: '授权登录中',
        mask:true
      })
      
      var iv=e.detail.iv,
      encryptedData=e.detail.encryptedData,that=this;
            wx.request({
              url: util.loginUrl+"/api/oauth/anno/ai/parent/wx/token",
              method:"POST",
              header:app.requestHeader,
              data: {
                encryptedData: encryptedData, //获取的 e.detail.encryptedData
                iv: iv, //获取的e.detail.iv
                code:that.data.code,
                grantType:'ai_parent_wx_phoneNumber'//授权类型
              },
              success: function(res) {
                console.log(res)
                // 清除定时获取code
                wx.hideLoading()
                var tokenDta=res.data.data;
                  if(res.data.isSuccess == true){
                    if(res.data.extra.passWordStatus == false){
                      // 未设置密码跳转到设置密码页
                      wx.reLaunch({
                        url: '../setPassword/setPassword',
                      })
                    }else{
                      // 已设置密码跳转到孩子信息
                      wx.setStorageSync('firstToken', true);
                      wx.reLaunch({
                        url: '../childrenInfo/childrenInfo',
                      })
                    }
                    wx.setStorageSync('token', res.data.data.token);
                    wx.setStorageSync('headPortrait', true);
                    wx.setStorageSync('refreshToken', res.data.data.refreshToken);
                    wx.setStorageSync('passWordStatus', res.data.extra.passWordStatus)
                    app.requestHeader.token="Bearer "+res.data.data.token;
                    app.globalData.token=res.data.data.token
                  }else{
                      
                  }
                  if(res.data.code == -10 || res.data.code != 0){
                    wx.showToast({
                      title: res.data.msg,
                      icon:'none',
                      duration:2000
                    })
                    that.getWxCode()
                  }
              },fail:(res=>{
                  wx.hideLoading()
                  that.getWxCode()
                  wx.showToast({
                    title: res.data.msg,
                    icon:'none',
                    duration:2000
                  })
              })
            })
      }
    },
    getWxCode(){
      var that=this;
      wx.login({
        success: res => {
          that.setData({
            code:res.code
          })
        }
      })
    }
    
})
