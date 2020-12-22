// pages/showChildrenInfo/showChildrenInfo.js
const util = require('../../utils/util.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navTop:'',
    showChildrenInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navTop:wx.getSystemInfoSync()['statusBarHeight']+10+'px'
    })
    
  },
  onShow:function(){
    this.getUserInfo()
    this.setData({
      noNet:app.globalData.nonetwork
    })
  },
  getUserInfo(){
    // 获取孩子信息
    wx.request({
      url: util.url+'/v1/api/children/get',
      header:app.requestHeader,
      success:(res=>{
        if(res.data.code == 0 && res.data.data.length != 0){
          this.setData({
            // multiArray:addressIndex,
            'showChildrenInfo':res.data.data[0],//孩子姓名
            birthday:this.getymd(new Date(res.data.data[0].birthday))
          })
        }else if(res.data.code == util.codes){//异地登录
          util.logOutObj.logOut();
        }
      }),
      fail:(res=>{
        wx.showToast({
          title: '查询失败',
          icon:'none',
          duration:2000
        })
      })
    })
  },
  //返回上一页
  return_page(){
    var pages = getCurrentPages(); //页面指针数组
    var prepage ="/"+ pages[pages.length - 2].route; //上一页面指针
    console.log(pages)
    var delta = 0;
    for (var i = pages.length - 1; i >= 0; i--) {
      if ("/" + pages[i].route == prepage) {
        if (delta == 0) {
          return;
        }
        wx.navigateBack({ delta: delta });
        return;
      }
      delta++;
    }
  },
  getymd(dateStr) {
    var d = new Date(dateStr);
    var resDate = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate()+"日";
    return resDate;
  },
    // 刷新网络
  refreshNet(){
    this.onLoad();
    this.setData({
      noNet:app.globalData.nonetwork
    })
   }
})