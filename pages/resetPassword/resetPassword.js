// pages/resetPassword/resetPassword.js
  const util = require('../../utils/util.js')
  var app = getApp();
  
  Page({
    data: {
      logs: [],
      loginData:{
        phone:'',
        code:'',
        newPassword:''
      },
      num:60,
      text:'获取验证码',
      signIn:false,
      codeACtive:false,
      phoneShowText:'',
      codeShowText:'',
      newShowText:'',
      codeType:false
    },
    onLoad: function () {
      this.setData({
        logs: (wx.getStorageSync('logs') || []).map(log => {
          // return util.formatTime(new Date(log))
        })
      })
    },
    getVerificationCode(){
      console.log(this.data.codeACtive)
      if(this.data.codeACtive == true){
        if(this.data.loginData.phone == '' || !/^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(this.data.loginData.phone)){
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
              mobile:this.data.loginData.phone
            },
            success:(res=>{
              if(res.data.code != 0) {
                wx.showToast({
                  title: res.data.msg,
                  icon:'none'
                })
              }else{
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
        'loginData.phone':e.detail.value
      })
      if(this.data.loginData.code.length == 6 && /^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(e.detail.value) && /^(?![^\da-zA-Z]+$).{6,15}$/.test(this.data.loginData.newPassword)){
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
        'loginData.code':e.detail.value
      })
      if(e.detail.value.length == 6 && /^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(this.data.loginData.phone) && /^(?![^\da-zA-Z]+$).{6,15}$/.test(this.data.loginData.newPassword)){
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
    // 设置密码
    newPassword(e){
      this.setData({
        'loginData.newPassword':e.detail.value
      });
      if(/^(?![^\da-zA-Z]+$).{6,15}$/.test(e.detail.value) &&  /^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(this.data.loginData.phone) && this.data.loginData.code.length == 6){
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
          newShowText:'*请输入6-15位字母或数字，可包括特殊字符'
        })
      }else{
        this.setData({
          newShowText:''
        })
      }
    },
    // 登录
    signIn(){
      if(util.calibrationMethod.phone(this.data.loginData.phone).status == false){
        this.setData({
          phoneShowText:util.calibrationMethod.phone(this.data.loginData.phone).message
        })
      }
      if(util.calibrationMethod.code(this.data.loginData.code).status == false){
        this.setData({
          codeShowText:util.calibrationMethod.code(this.data.loginData.code).message
        })
      }
      if(util.calibrationMethod.password(this.data.loginData.newPassword).status == false){
        this.setData({
          newShowText:util.calibrationMethod.password(this.data.loginData.newPassword).message
        })
      }
      if(this.data.signIn == true){
        wx.showLoading({
          title: '密码修改中',
          mask:true
        })
        wx.request({
          url: util.loginUrl+'/api/oauth/anno/ai/parent/wx/findPassword',
          header:app.requestHeader,
          data:{
            mobile:this.data.loginData.phone,
            code:this.data.loginData.code,
            password:this.data.loginData.newPassword
          },
          method:'POST',
          success:(res=>{
              //成功跳转至孩子信息
              if(res.data.code == 0){
                // 修改成功后调登录接口
                wx.request({
                  url: util.loginUrl+'/api/oauth/anno/ai/parent/wx/token',
                  method:'POST',
                  header:app.requestHeader,
                  data:{
                    account:this.data.loginData.phone,
                    password:this.data.loginData.newPassword,
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
                        title:'账号或密码错误',
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
              title: '重置失败',
              icon:'none'
            })
          })
        })
      }
      
    }
  })
  