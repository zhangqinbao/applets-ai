// pages/upVideoIndex/upVideoIndex.js
const util = require('../../utils/util.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navTop:'',
    btnActive:false,
    maskType:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navTop:wx.getSystemInfoSync()['statusBarHeight']+10+'px',
      screenRecordId:options.screenRecordId
    })
    //options.screenRecordId
    this.getVideoList(options.screenRecordId,options.screenRecordId);
  },
  onShow:function(){
    this.getVideoList(this.data.screenRecordId,this.data.screenRecordId);
    this.setData({
      noNet:app.globalData.nonetwork
    })
  },
  returnPage(){
    var pages = getCurrentPages(); //页面指针数组
    var prepage ="/pages/home/home"; //上一页面指针
    var delta = 0;
    for (var i = pages.length - 1; i >= 0; i--) {
      if ("/"+pages[i].route == prepage) {
        if (delta == 0) {
          return;
        }
        wx.navigateBack({ delta: delta });
        return;
      }
      delta++;
    }
  },
  getVideoList(id,screenRecordId){
    wx.request({
      url: util.url+'/v1/api/question/answer/getWithAnswerByRecordId/'+id,
      header:app.requestHeader,
      success:(res=>{
        console.log(res)
        if(res.data.code == 0){
            this.setData({
              screenMedia:res.data.data.screenMedia,
              screenRecordId:screenRecordId
            })
            wx.setStorageSync('screenMedia', res.data.data.screenMedia);

            var noUPLength=[]
            res.data.data.screenMedia.forEach((item,index)=> {
              if(item.answerId == null){
                noUPLength.push(item.id)
              }
            });
            if(noUPLength.length == 0){
              this.setData({
                btnActive:true
              })
            }
        }else if(res.data.code == util.codes){//异地登录
          util.logOutObj.logOut();
        }else{
          wx.showToast({
            title: res.data.smg,
            icon:'none',
            duration:2000
          })
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
  // 提交筛查记录
  submitSource(){
    if(this.data.btnActive){
      this.setData({
        maskType:true
      })
    }
  },
  continue(){
    var that=this;
    wx.request({
      url: util.url+'/v1/api/screen/record/submit/source/'+this.data.screenRecordId,
      header:app.requestHeader,
      success:(res=>{
        if(res.data.code == 0){
          // 调消息订阅模板
          wx.requestSubscribeMessage({
            tmplIds: ['Dv0uJ3wuuDqjgXt4weuwr_ysQujMDtAnQASP-l8NrvY'], // 此处可填写多个模板 ID，但低版本微信不兼容只能授权一个
            success (res) {
              that.returnPage();
            },
            fail(res){
              that.returnPage();
            }
          })
        }else if(res.data.code == util.codes){//异地登录
          util.logOutObj.logOut();
        }else{
          wx.showToast({
            title: res.data.smg,
            icon:'none',
            duration:2000
          })
        }
        this.setData({
          maskType:false
        })
      }),
      fail:(res=>{
        wx.showToast({
          title: '提交失败',
          icon:'none',
          duration:2000
        })
      })
    })
  },
  closeMask(){
    this.setData({
      maskType:false
    })
  },
  // 刷新网络
  refreshNet(){
    this.onLoad();
    this.setData({
      noNet:app.globalData.nonetwork
    })
  }
})