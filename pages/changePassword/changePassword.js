// pages/changePassword/changePassword.js
const util = require('../../utils/util.js')
var app = getApp();

Page({
  data: {
    logs: [],
    loginData:{
      passwordOne:'',
      passwordTwo:'',
      passwordThree:''
    },
    signIn:false,
    passwordShowTextOne:'',
    passwordShowTextTwo:'',
    showPasswordThree:'',
    showPassword:false,
    passwordType:true,
    showPasswordTwo:false,
    passwordTypeTwo:true,
    showPasswordThree:false,
    passwordTypeThree:true
  },
  onLoad: function () {
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
    if(e.detail.value.length >= 6 && /^(?![^\da-zA-Z]+$).{6,15}$/.test(e.detail.value) && this.data.loginData.passwordTwo.length>=6 && /^(?![^\da-zA-Z]+$).{6,15}$/.test(this.data.loginData.passwordTwo) && this.data.loginData.passwordThree.length>=6 && /^(?![^\da-zA-Z]+$).{6,15}$/.test(this.data.loginData.passwordThree)){
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
    if(e.detail.value.length >= 6 && /^(?![^\da-zA-Z]+$).{6,15}$/.test(e.detail.value) && this.data.loginData.passwordOne.length>=6 && /^(?![^\da-zA-Z]+$).{6,15}$/.test(this.data.loginData.passwordOne) && this.data.loginData.passwordThree.length>=6 && /^(?![^\da-zA-Z]+$).{6,15}$/.test(this.data.loginData.passwordThree)){
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
        passwordShowTextTwo:'*请输入6-15位字母或数字，可包括特殊字符'
      })
    }else{
      this.setData({
        passwordShowTextTwo:''
      })
    }
  },
  passwordInputThree(e){
    this.setData({
      'loginData.passwordThree':e.detail.value
    })
    if(e.detail.value.length >= 6 && /^(?![^\da-zA-Z]+$).{6,15}$/.test(e.detail.value) && this.data.loginData.passwordOne.length>=6 &&/^(?![^\da-zA-Z]+$).{6,15}$/.test(this.data.loginData.passwordOne) && this.data.loginData.passwordTwo.length>=6 && /^(?![^\da-zA-Z]+$).{6,15}$/.test(this.data.loginData.passwordTwo)){
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
        passwordShowTextThree:'*请输入6-15位字母或数字，可包括特殊字符'
      })
    }else{
      this.setData({
        passwordShowTextThree:''
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
  showPasswordThree(){
    this.setData({
      // 切换图标
      showPasswordThree:!this.data.showPasswordThree,
      passwordTypeThree:!this.data.passwordTypeThree,
    })
  },
  // 登录
  signIn(){
    if(this.data.loginData.passwordOne == ''){
      this.setData({
        passwordShowTextOne:'*原密码不能为空'
      })
    }
    if(this.data.loginData.passwordOne != '' &&!/^[a-zA-Z0-9@\$\^\.\*\\?]{6,15}$/.test(this.data.loginData.passwordOne)){
      this.setData({
        passwordShowTextOne:'*请输入6-15位字母或数字，可包括特殊字符'
      })
    }
    if(this.data.loginData.passwordTwo == ''){
      this.setData({
        passwordShowTextTwo:'*新密码不能为空'
      })
    }
    if(this.data.loginData.passwordTwo != '' && !/^[a-zA-Z0-9@\$\^\.\*\\?]{6,15}$/.test(this.data.loginData.passwordTwo)){
      this.setData({
        passwordShowTextTwo:'*请输入6-15位字母或数字，可包括特殊字符'
      })
    }
    if(this.data.loginData.passwordThree == ''){
      this.setData({
        passwordShowTextThree:'*确认密码不能为空'
      })
    }
    if(this.data.loginData.passwordThree != '' && !/^[a-zA-Z0-9@\$\^\.\*\\?]{6,15}$/.test(this.data.loginData.passwordThree)){
      this.setData({
        passwordShowTextThree:'*请输入6-15位字母或数字，可包括特殊字符'
      })
    }
    if(this.data.loginData.passwordTwo != ''&&  this.data.loginData.passwordThree != '' && this.data.loginData.passwordTwo != this.data.loginData.passwordThree){
      this.setData({
        passwordShowTextThree:'*两次密码输入不一致'
      })
      return;
    }
    if(this.data.loginData.passwordOne != '' &&this.data.loginData.passwordTwo != '' && this.data.loginData.passwordThree != ''){
      wx.showLoading({
        title: '',
        mask:true
      })
      wx.request({
        url: util.loginUrl+'/api/oauth/user/ai/parent/wx/restPassword',
        header:app.requestHeader,
        method:'POST',
        data:{
          oldPassword:this.data.loginData.passwordOne,
          password:this.data.loginData.passwordTwo,
          confirmPassword:this.data.loginData.passwordTwo
        },
        success:(res=>{
           //成功跳转至个人中心
           if(res.data.code == 0){
            wx.hideLoading()
            wx.navigateBack({
              delta: 1,  // 返回上一级页面。
              success: function() {
                  console.log('成功！')
              }
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
            title: '修改失败',
            icon:'none'
          })
        })
      })
    }
  }
})