// pages/home/home.js
const util = require('../../utils/util.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navTop:'',
    recordList:{},
    animationData:{},
    opacityType:false,
    platform:false,
    recordId:'',
    maskType:false,
    navActive:false,
    globalData:{
      navHeight:'',
      navTop:'',
      windowHeight:''
    },
    checkTimes:''//本月筛查次数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(wx.getSystemInfoSync().platform != 'ios' && wx.getSystemInfoSync().platform != 'devtools' ){
      this.setData({
        platform:true
      })
    }
    //本地有答题记录先上传
    if(wx.getStorageSync('aiSubject') != ''){
      wx.request({
        url: util.url+'/v1/api/question/answer/batchAdd',
        header:app.requestHeader,
        method:"POST",
        data:wx.getStorageSync('aiSubject'),
        success:(res=>{
          if(res.data.code==0){
            wx.removeStorageSync('aiSubject');
          }else if(res.data.code == util.codes){//异地登录
            util.logOutObj.logOut();
          }
        }),
        fail:(res=>{
        })
      })
    }
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    wx.getSystemInfo({
      success: res => {
        let statusBarHeight = res.statusBarHeight,
          navTop = menuButtonObject.top,//胶囊按钮与顶部的距离
          navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight)*2;//导航高度
          
          this.setData({
            'globalData.navHeight':navHeight+6+"px",
            'globalData.navTop':navTop,
            'globalData.windowHeight':res.windowHeight
          })
      },
      fail(err) {
      }
    })
    this.setData({
      navTop:wx.getSystemInfoSync()['statusBarHeight']+10+'px',
      headPortrait:wx.getStorageSync('headPortrait')
    })
    this.getRecordList();
  },
  onShow:function(){
    this.getRecordList();
    this.setData({
      noNet:app.globalData.nonetwork
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
      this.animation = wx.createAnimation();
  },
  // 去往个人中心
  goToPersonalCenter(){
    wx.navigateTo({
      url: '../personalCenter/personalCenter',
    })
  },
  addRecord(){
  // background: rgba(24, 24, 24, 0.3);
    wx.showLoading({
      title: '数据查询中',
      mask:true
    })
    wx.request({
      url: util.url+'/v1/api/screen/record/save/screen/record',
      method:"POST",
      header:app.requestHeader,
      success:(res=>{
        //需要支付订单
        if(res.data.code == 2000){
          wx.hideLoading()
            this.animation.bottom(0).step()
            this.setData({
              animationData:this.animation.export(),
              opacityType:true,
              checkTimes:Number(res.data.data.checkTimes)+1,
              amount:res.data.data.amount
            })
          this.setData({
            recordId:res.data.data.recordId
          }) 
        }else if(res.data.code == 0){
          wx.hideLoading()
          wx.navigateTo({
            url: '../aiTwentyQuestions/aiTwentyQuestions?screenRecordId='+res.data.data.recordId+"&type=1",
          })
          this.setData({
            recordId:res.data.data.recordId
          }) 
        }else if(res.data.code == util.codes){//异地登录
          util.logOutObj.logOut();
        }else{ 
          wx.hideLoading()
          wx.showToast({
            title: '操作失败',
            icon:'none',
            duration:2000
          })
        }
      }),
      fail:(res=>{
        wx.hideLoading()
        wx.showToast({
          title: '操作失败',
          icon:'none',
          duration:2000
        })
      })
    })
  },
  closeBox(){
    this.animation.bottom(-1000).step()
    this.setData({
      animationData:this.animation.export(),
      opacityType:false
    })
  },
  getWithAnswerBy(e){
    wx.request({
      url: util.url+'/v1/api/question/answer/getWithAnswerByRecordId/'+e.currentTarget.dataset.id,
      header:app.requestHeader,
      success:(res=>{
        if(res.data.code == 0){
          // 去往ai20问
          if(res.data.data.questionAnswer.length != 0){
            wx.setStorageSync('questionAnswer',res.data.data.questionAnswer);
            wx.navigateTo({
              url: '../aiTwentyQuestions/aiTwentyQuestions?screenRecordId='+e.currentTarget.dataset.id,
            })
          }else{
            wx.navigateTo({
              url: '../upVideoIndex/upVideoIndex?screenRecordId='+e.currentTarget.dataset.id
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
  getRecordList(){
    if(wx.getStorageSync('token') != ''){
      wx.request({
        url: util.url+'/v1/api/screen/record/get',
        header:app.requestHeader,
        success:(res=>{
          if(res.data.code == 0){
           this.setData({
            recordList:res.data.data
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
    }
  },
  // 支付
  payment(){
    var tant=this;
    // 创建订单
    wx.showLoading({
      title: '正在生成订单',
      mask:true
    })
    wx.login({
      success: res => {
        wx.request({
          url: util.url+'/v1/api/order/create/order/'+res.code,
          method:"POST",
          header:app.requestHeader,
          success:(res=>{
            if(res.data.code ==  0){
              this.setData({
                orderId:res.data.data.orderId
                } )
              //调支付订单 
              wx.request({
                url: util.url+`/v1/api/order/pay/order/${res.data.data.orderId}/${res.data.data.openId}`,
                method:"POST",
                header:app.requestHeader,
                success:(res=>{
                  if(res.data.code ==  0){
                    wx.hideLoading()
                    wx.requestPayment({
                      timeStamp:res.data.data.timeStamp,//时间戳
                      nonceStr:res.data.data.nonceStr,//随机字符串
                      package:res.data.data.package,//统一下单接口返回的 prepay_id 参数值
                      signType:res.data.data.signType,
                      paySign:res.data.data.paySign,//签名
                      success (res) { 
                        wx.showToast({
                          title: '支付成功',
                        })
                        // 根据用户以及状态查询订单
                        wx.request({
                          url: util.url+`/v1/api/order/create/recordByOrder/${tant.data.orderId}`,
                          method:"POST",
                          header:app.requestHeader,
                          success:(res=>{
                            if(res.data.code ==  0){
                              tant.animation.bottom(-1000).step()
                              tant.setData({
                                animationData:tant.animation.export(),
                                opacityType:false
                              })
                              // 成功后跳转AI20问
                              wx.navigateTo({
                                url: '../aiTwentyQuestions/aiTwentyQuestions?screenRecordId='+res.data.data+"&type=1"
                              })
                            }else{ 
                              wx.hideLoading()
                              wx.showToast({
                                title: "筛查创建中，请稍后",
                                icon:'none',
                                duration:2000
                              })
                              
                              tant.animation.bottom(-1000).step()
                              tant.setData({
                                animationData:tant.animation.export(),
                                opacityType:false
                              })
                              tant.getRecordList();
                            }
                          }),
                          fail:(res=>{
                            wx.hideLoading()
                            wx.showToast({
                              title: '操作失败',
                              icon:'none',
                              duration:2000
                            })
                          })
                        })
                      },
                      fail (res) {
                        wx.hideLoading()
                        wx.showToast({
                          title: '未支付成功',
                          icon:'none',
                          duration:2000
                        })
                      }
                    })
                  }else if(res.data.code == util.codes){//异地登录
                    util.logOutObj.logOut();
                  }else{ 
                    wx.hideLoading()
                    wx.showToast({
                      title: '支付失败',
                      icon:'none',
                      duration:2000
                    })
                  }
                }),
                fail:(res=>{
                  wx.hideLoading()
                  wx.showToast({
                    title: '操作失败',
                    icon:'none',
                    duration:2000
                  })
                })
              })
            }else if(res.data.code == util.codes){//异地登录
              util.logOutObj.logOut();
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
              title: '操作失败',
              icon:'none',
              duration:2000
            })
          })
        })
      }
    })
  },
  // 正在审核弹框
  underReview(){
    this.setData({
      maskType:true
    })
  },
  continue(){
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