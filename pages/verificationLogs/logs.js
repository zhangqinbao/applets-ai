//logs.js
const util = require('../../utils/util.js')
var app = getApp();

Page({
  data: {
    logs: [],
    loginData:{
      mobile:'',
      password:''
    },
    num:60,
    text:'获取验证码',
    signIn:false,
    codeACtive:false,
    phoneShowText:'',
    passwordShowText:'',
    showPassword:false,
    passwordType:true
  },
  onLoad: function () {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        // return util.formatTime(new Date(log))
      })
    })
  },
  phoneInput(e){
    this.setData({
      'loginData.mobile':e.detail.value
    })
    if(e.detail.value.length == 11 && /^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(e.detail.value) && this.data.loginData.password.length >= 6){
      this.setData({
        signIn:true
      })
    }else{
      this.setData({
        signIn:false,
        phoneShowText:''
      })
    }
    if(e.detail.value.length == 11 && !/^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(e.detail.value)){
      this.setData({
        phoneShowText:'*手机号格式不正确'
      })
    }
  },
  passwordInput(e){
    this.setData({
      'loginData.password':e.detail.value
    })
    if(/^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(this.data.loginData.mobile) && /^(?![^\da-zA-Z]+$).{6,15}$/.test(e.detail.value)){
      console.log("1")
      this.setData({
        signIn:true
      })
    }else{
      console.log(this.data.loginData.mobile)
      this.setData({
        signIn:false
      })
    }
    if(e.detail.value.length >=6 && !/^[a-zA-Z0-9@\$\^\.\*\\?]{6,15}$/.test(e.detail.value)){
      this.setData({
        passwordShowText:'*请输入6-15位字母或数字，可包括特殊字符'
      })
    }else{
      this.setData({
        passwordShowText:''
      })
    }
  },
  showPassword(){
    this.setData({
      // 切换图标
      showPassword:!this.data.showPassword,
      passwordType:!this.data.passwordType,
    })
  },
  // 登录
  signIn(){
    if(util.calibrationMethod.phone(this.data.loginData.mobile).status == false){
      this.setData({
        phoneShowText:util.calibrationMethod.phone(this.data.loginData.mobile).message
      })
    }
    if(util.calibrationMethod.password(this.data.loginData.password).status == false){
      this.setData({
        passwordShowText:util.calibrationMethod.password(this.data.loginData.password).message
      })
    }
    if(this.data.signIn == true){
      wx.showLoading({
        title: '登录中',
        mask:true
      })
      wx.request({
        url: util.loginUrl+'/api/oauth/anno/ai/parent/wx/token',
        method:'POST',
        header:app.requestHeader,
        data:{
          account:this.data.loginData.mobile,
          password:this.data.loginData.password,
          grantType:'ai_parent_wx_password'
        },
        success:(res=>{
          if(res.data.code == 0) {
            // 成功跳转孩子信息页
            // 本地存储token
            wx.setStorageSync('token', res.data.data.token)
            wx.setStorageSync('headPortrait', false);
            app.requestHeader.token="Bearer "+res.data.data.token
            // 本地存储是否设置密码
            wx.setStorageSync('passWordStatus', res.data.extra.passWordStatus);
            wx.setStorageSync('refreshToken', res.data.data.refreshToken)
            wx.setStorageSync('isSuccess', res.data.isSuccess);
            wx.hideLoading()
            
            wx.reLaunch({
              url: '../childrenInfo/childrenInfo',
            })
          }else{
            wx.hideLoading()
            wx.showToast({
              title:res.data.msg,
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
