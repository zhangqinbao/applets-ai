// pages/personalCenter/personalCenter.js
const util = require('../../utils/util.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navTop:'',
    platform:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navTop:wx.getSystemInfoSync()['statusBarHeight']+10+'px',
      headPortrait:wx.getStorageSync('headPortrait')
    })
    if(wx.getSystemInfoSync().platform != 'ios' && wx.getSystemInfoSync().platform != 'devtools' ){
      this.setData({
        platform:true
      })
    }
  },
  onShow:function(){

    
  },
  //去往首页
  return_page(){
    console.log(getCurrentPages())
    var pages = getCurrentPages(); //页面指针数组
    var prepage ="/"+ pages[pages.length - 2].route; //上一页面指针
    var cps = getCurrentPages();
    var delta = 0;
    for (var i = cps.length - 1; i >= 0; i--) {
      
      console.log("/" + cps[i].route)
      if ("/"+cps[i].route == prepage) {
        console.log(delta)
        if (delta == 0) {
          return;
        }
        wx.navigateBack({ delta: delta });
        return;
      }
      delta++;
    }
  },
  //退出登录
  signOut(){
    wx.request({
      url: util.loginUrl+'/api/oauth/user/ai/parent/wx/exit',
      header:app.requestHeader,
      success:(res=>{
        if(res.data.code == 0){
          //删除本地储存的key
          wx.removeStorageSync('token');
          wx.removeStorageSync('passWordStatus');
          wx.removeStorageSync('refreshToken');
          wx.removeStorageSync('isSuccess');
          app.requestHeader.token="Bearer "
          //成功退出授权页面
          wx.reLaunch({
            url: '../index/index?type=1',
          });
        }else if(res.data.code == util.codes){//异地登录
          util.logOutObj.logOut();
        }else{
          wx.showToast({
            title: res.data.msg,
            icon:'none',
            duration:2000
          });
        }
      }),
      fail:(res=>{
        wx.showToast({
          title: '退出失败',
          icon:'none',
          duration:2000
        })
      })
    })
  }
})