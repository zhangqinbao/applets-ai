//logs.js
const util = require('../../utils/util.js')
var app = getApp();

Page({
  data: {
    logs: [],
    loginData:{
      mobile:'',
      mobileCode:''
    },
    num:60,
    text:'获取验证码',
    signIn:false,
    codeACtive:false,
    phoneShowText:'',
    codeShowText:'',
    codeType:false,
    getCodeType:true
  },
  onLoad: function (options) {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        // return util.formatTime(new Date(log))
      })
    })
  },
  getVerificationCode(){
    
    console.log(this.data.codeACtive)
    if(this.data.codeACtive == true){
      if(wx.getStorageSync('times')!='' && (new Date().getTime()-wx.getStorageSync('times'))/1000<60 && wx.getStorageSync('phone') == this.data.loginData.mobile){
        wx.showToast({
          title: '请60秒后重新发送',
          icon:'none'
        })
        return;
      }

      if(this.data.loginData.mobile == '' || !/^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(this.data.loginData.mobile)){
        this.setData({
          phoneShowText:'*手机号格式不正确'
        })
        return;
      }
      var that=this;
      
      if(this.data.codeType == false){
        // 获取验证码
        wx.request({
          url: util.loginUrl+'/api/oauth/anno/ai/parent/wx/mobileCode',
          header:app.requestHeader,
          data:{
            mobile:this.data.loginData.mobile
          },
          success:(res=>{
            if(res.data.code != 0) {
              wx.showToast({
                title: res.data.msg,
                icon:'none'
              })
            }else{
              wx.setStorageSync('times', new Date().getTime());
              wx.setStorageSync('phone',this.data.loginData.mobile);
              if(that.data.num == 60){
                var ts=setInterval(function(){
                  if(that.data.num != 0){
                    that.data.num-=1;
                    that.setData({
                      text:that.data.num+'s后重发',
                      codeType:true
                    })
                  }else{
                    that.setData({
                      text:'获取验证码',
                      num:60,
                      codeType:false
                    })
                    clearInterval(ts);
                  }
                },1000)
                ts
              }
            }
          }),
          fail:(res=>{
            wx.hideLoading()
            wx.showToast({
              title: '验证码获取失败',
              icon:'none'
            })
          })
        })
      }
    }
  },
  phoneInput(e){
    this.setData({
      'loginData.mobile':e.detail.value
    })
    if(this.data.loginData.mobileCode.length == 6 && e.detail.value.length == 11 && /^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(e.detail.value)){
      this.setData({
        signIn:true
      })
    }else{
      this.setData({
        signIn:false
      })
    }
   if(e.detail.value.length == 11 && /^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(e.detail.value)){
      this.setData({
        codeACtive:true
      })
    }else{
      this.setData({
        codeACtive:false,
        phoneShowText:''
      })
    }
    if(e.detail.value.length == 11 && !/^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(e.detail.value)){
      this.setData({
        phoneShowText:'*手机号格式不正确'
      })
    }
  },
  codeInput(e){
    this.setData({
      'loginData.mobileCode':e.detail.value
    })
    if(this.data.loginData.mobile.length == 11 && e.detail.value.length == 6 && /^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(this.data.loginData.mobile)){
      this.setData({
        signIn:true
      })
    }else{
      this.setData({
        signIn:false,
        codeShowText:''
      })
    }
  },
  // 登录
  signIn(){
    if(util.calibrationMethod.phone(this.data.loginData.mobile).status == false){
      this.setData({
        phoneShowText:util.calibrationMethod.phone(this.data.loginData.mobile).message
      })
    }
    if(util.calibrationMethod.code(this.data.loginData.mobileCode).status == false){
      this.setData({
        codeShowText:util.calibrationMethod.code(this.data.loginData.mobileCode).message
      })
    }
    if(this.data.signIn == true){
      wx.showLoading({
        title: '登录中',
        mask:true
      })
      wx.request({
        url: util.loginUrl+'/api/oauth/anno/ai/parent/wx/token',
        header:app.requestHeader,
        method:'POST',
        data:{
          mobile:this.data.loginData.mobile,
          mobileCode:this.data.loginData.mobileCode,
          grantType:'ai_parent_wx_mobile'
        },
        success:(res=>{
          console.log(res.data.code)
          if(res.data.code == 0) {
            if(res.data.extra.passWordStatus == true){
              wx.reLaunch({
                url: '/pages/childrenInfo/childrenInfo',
              })
            }else{ // 未设置密码跳转到设置密码
              wx.reLaunch({
                url: '/pages/setPassword/setPassword',
              })
            }
            // 本地存储token
            wx.setStorageSync('headPortrait', false);
            wx.setStorageSync('token', res.data.data.token)
            app.requestHeader.token="Bearer "+res.data.data.token
            // 本地存储是否设置密码
            wx.setStorageSync('passWordStatus', res.data.extra.passWordStatus);
            wx.setStorageSync('refreshToken', res.data.data.refreshToken)
            wx.setStorageSync('isSuccess', res.data.isSuccess);
            wx.hideLoading()
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
            title: '登录失败',
            icon:'none'
          })
        })
      })
    }
    
  }
})
