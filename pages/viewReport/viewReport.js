// pages/viewReport/viewReport.js
const util = require('../../utils/util.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gender:2,
    playtype:true,
    maskType:false,
    videoArr:[],
    videoUrlArr:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '报告加载中',
      mask:true
    })
    // 调报告接口
    wx.request({
      url: util.url+"/v1/api/screen/record/get/summary/report/"+options.screenRecordId,
      header:app.requestHeader,
      success:(res=>{
        if(res.data.code == 0){
          var reportObj=res.data.data.report,videoUrlArr=[],videoPUrlArr=[];
          res.data.data.report.forEach((item,index) => {
            // 获取播放url
              wx.request({
                url:util.videoUrl+'/aliyunVod/vod/play/info?vid='+item.mediaId,
                method:"POST",
                header:app.requestHeader,
                success: (res => {
                  wx.hideLoading()
                    if (res.data.code == 0) {
                      var string = 'videoArr[' + index + ']';
                      var stringU = 'videoUrlArr[' + index + ']';
                      this.setData({
                              [string]: res.data.data.playURL,
                              [stringU]: res.data.data.coverURL,
                            })
                    }else if(res.data.code == util.codes){//异地登录
                      util.logOutObj.logOut();
                    }else {
                      wx.showToast({
                        title: res.data.smg,
                        icon:'none',
                        duration:2000
                      })
                    }
                }),
                fail: (res => {
                  wx.hideLoading()
                  wx.showToast({
                    title: '操作失败',
                    icon:'none',
                    duration:2000
                  })
                })
              });
            });
            this.setData({
              reportList:reportObj,
              chidlredInfo:res.data.data,
              summaryLevel:res.data.data.summaryLevel,
              summary:res.data.data.summary
            })
        }else{ 
          wx.hideLoading()
          wx.showToast({
            title: res.data.msg,
            icon:'none',
            duration:2000
          })
        }
      }),
      fail:(res=>{
        wx.hideLoading()
        wx.showToast({
          title: '查询失败',
          icon:'none',
          duration:2000
        })
      })
    })
  },
  returnPages(){
    wx.navigateBack({
      delta: 1,  // 返回上一级页面。
      success: function() {
      }
    })
  },
  // 判断网络
  videoPlay(e){
    var that=this,eThat=e.currentTarget.id
    wx.getNetworkType({
      success (res) {
        if(res.networkType != "wifi"){
          //获取video
         if(that.data.playtype){
          var videoContext = wx.createVideoContext(eThat);
              videoContext.pause()//暂停播放
              that.setData({
                maskType:true,
                videoId:eThat
              })
         }
        }
      }
    })
  },
  // 继续播放
  continue(){
    var videoContext = wx.createVideoContext(this.data.videoId);
    videoContext.play();
    this.setData({
      maskType:false,
      playtype:false
    })
  },
  closeMask(){
    this.setData({
      maskType:false
    })
  }
})