// pages/setPassword/setPassword.js
const util = require('../../utils/util.js')
var app = getApp();

Page({
  data: {
    logs: [],
    navTop:'',
    loginData:{
      passwordOne:'',
      passwordTwo:''
    },
    signIn:false,
    passwordShowTextOne:'',
    passwordShowTextTwo:'',
    showPassword:false,
    passwordType:true,
    showPasswordTwo:false,
    passwordTypeTwo:true
  },
  onLoad: function () {
    this.setData({
      navTop:wx.getSystemInfoSync()['statusBarHeight']+10+'px'
    })
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        // return util.formatTime(new Date(log))
      })
    })
  },
  passwordInputOne(e){
    this.setData({
      'loginData.passwordOne':e.detail.value
    })
    if( /^(?![^\da-zA-Z]+$).{6,15}$/.test(e.detail.value) && /^(?![^\da-zA-Z]+$).{6,15}$/.test(this.data.loginData.passwordTwo)){
      this.setData({
        signIn:true
      })
    }else{
      this.setData({
        signIn:false
      })
    }
    if(e.detail.value.length >= 6 && !/^[a-zA-Z0-9@\$\^\.\*\\?]{6,15}$/.test(e.detail.value)){
      this.setData({
        passwordShowTextOne:'*请输入6-15位字母或数字，可包括特殊字符'
      })
    }else{
      this.setData({
        passwordShowTextOne:''
      })
    }
  },
  passwordInputTwo(e){
    this.setData({
      'loginData.passwordTwo':e.detail.value
    })
    if(/^(?![^\da-zA-Z]+$).{6,15}$/.test(e.detail.value) && /^(?![^\da-zA-Z]+$).{6,15}$/.test(this.data.loginData.passwordOne)){
      this.setData({
        signIn:true
      })
    }else{
      this.setData({
        signIn:false
      })
    }
    if(e.detail.value.length >= 6 && !/^(?![^\da-zA-Z]+$).{6,15}$/.test(e.detail.value)){
      this.setData({
        passwordShowTextTwo:'*请输入6-15位字母或数字，可包括特殊字符'
      })
    }else{
      this.setData({
        passwordShowTextTwo:''
      })
    }
  },
  showPasswordOne(){
    this.setData({
      // 切换图标
      showPassword:!this.data.showPassword,
      passwordType:!this.data.passwordType,
    })
  },
  showPasswordTwo(){
   
    this.setData({
      // 切换图标
      showPasswordTwo:!this.data.showPasswordTwo,
      passwordTypeTwo:!this.data.passwordTypeTwo,
    })
  },
  // 登录
  signIn(){
    if(util.calibrationMethod.password(this.data.loginData.passwordOne).status == false){
      this.setData({
        passwordShowTextOne:util.calibrationMethod.password(this.data.loginData.passwordOne).message
      })
    }
    if(util.calibrationMethod.password(this.data.loginData.passwordTwo).status == false){
      this.setData({
        passwordShowTextTwo:util.calibrationMethod.password(this.data.loginData.passwordTwo).message
      })
    }
    if(this.data.loginData.passwordOne != '' && this.data.loginData.passwordTwo != '' && this.data.loginData.passwordOne != this.data.loginData.passwordTwo){
      this.setData({
        passwordShowTextTwo:'*两次密码输入不一致'
      })
      return;
    }
    if(this.data.signIn == true){
      wx.showLoading({
        title: '',
        header:app.requestHeader,
        mask:true
      })
      wx.request({
        url: util.loginUrl+'/api/oauth/user/ai/parent/wx/setPassword',
        method:'POST',
        header:app.requestHeader,
        data:{
          password:this.data.loginData.passwordOne
        },
        success:(res=>{
          //跳转到孩子信息页
          if(res.data.code == 0) {
            // 成功跳转孩子信息页
            wx.reLaunch({
              url: '../childrenInfo/childrenInfo',
            })
            wx.setStorageSync('passWordStatus', true)
            wx.hideLoading()
          }else{
            wx.hideLoading()
            wx.showToast({
              title:res.data.code,
              icon:'none',
              duration:2000
            })
          }
        }),
        fail:(res=>{
          wx.hideLoading()
          wx.showToast({
            title: '设置失败',
            icon:'none'
          })
        })
      })
    }
  }
})
