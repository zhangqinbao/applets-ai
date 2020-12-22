// pages/allOrders/allOrders.js
const util = require('../../utils/util.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabArr:['全部','已完成','待付款','已关闭'],
    currentTab:0,
    opacityType:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(!app.globalData.nonetwork){
      this.getOrderList(0);
    }
  },
  onShow:function(){
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
  changTab(e){
    this.setData({
      currentTab:e.currentTarget.dataset.index
    })
    this.getOrderList(e.currentTarget.dataset.index);
  },
  getOrderList(status){
    var url=''
    if(status == 0){//全部
      url=util.url+'/v1/api/order/listOrder';
    }else if(status == 1){//已完成
      url=util.url+'/v1/api/order/listOrder/1';
    }else if(status == 2){//待付款
      url=util.url+'/v1/api/order/listOrder/0';
    }else if(status == 3){//已关闭
      url=util.url+'/v1/api/order/listOrder/3';
    }
    wx.request({
      url: url,
      header:app.requestHeader,
      success:(res=>{
        if(res.data.code == 0){
          this.setData({
            orderList:res.data.data
          })
        }else if(res.data.code == util.codes){//异地登录
          util.logOutObj.logOut();
        }else{ 
          wx.showToast({
            title: res.data.msg,
            icon:'none',
            duration:2000
          })
        }
      }),
      fail:(res=>{
        wx.showToast({
          title: '订单查询失败',
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
  // 支付
  addRecord(e){
    var tant=this;
    var orderId=e.currentTarget.dataset.id;
    //调支付订单 
    wx.showLoading({
      title: '支付中...',
      mask:true
    })
    wx.login({
      success: res => {
        wx.request({
          url: util.url+`/v1/api/order/getOpenId/${res.code}`,
          method:"POST",
          header:app.requestHeader,
          success:(res=>{
            if(res.data.code ==  0){
              wx.request({
                url: util.url+`/v1/api/order/pay/order/${orderId}/${res.data.data}`,
                method:"POST",
                header:app.requestHeader,
                success:(res=>{
                  wx.hideLoading()
                  if(res.data.code ==  0){
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
                          url: util.url+`/v1/api/order/create/recordByOrder/${orderId}`,
                          method:"POST",
                          header:app.requestHeader,
                          success:(res=>{
                            if(res.data.code ==  0){
                              // 成功后跳转AI20问
                              wx.navigateTo({
                                url: '../aiTwentyQuestions/aiTwentyQuestions?screenRecordId='+res.data.data+"&type=1&status=1"
                              })
                            }else{ 
                              wx.hideLoading()
                              wx.showToast({
                                title: "筛查创建中，请稍后",
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
                      fail (res) {
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
  // 刷新网络
  refreshNet(){
    this.onLoad();
    this.setData({
      noNet:app.globalData.nonetwork
    })
  }
})