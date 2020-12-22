// pages/aiTwentyQuestions/aiTwentyQuestions.js
const util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navTop:'',
    marquee:0,   //每次移动X坐标
    windowWidth:0,     //小程序宽度
    maxScroll:0,     //文本移动至最左侧宽度及文本宽度
    btnActive:2,
    ingSbumit:false,
    completeSbumit:false,
    completeSbumit1:false,
    footerView:true,
    animationList: [],
    clickStatus:true,
    clickStatus1:1,
    anIndex:'',
    screenRecordId:'',
    screenQuestionId:'',
    subjectArr:[],
    nonetwork:false,
    aiSubjectLength:1,
    av:{
      pagetitle:'儿童行为表现问卷是一份关于孩子发育行为的筛选表。本调查表包括20个问题，填写结果可帮助评估师了解孩子的基本情况，请您认真填写。'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if(options.screenRecordId != undefined){
      this.setData({
          screenRecordId:options.screenRecordId
      })
    }
    // type == 1为新建筛查
    if(options.type == 1){
      // 获取20道题
      wx.request({
        url: util.url+'/v1/api/question/answer/getWithAnswerByRecordId/'+options.screenRecordId,
        header:app.requestHeader,
        method:"GET",
        success:(res=>{
          if(res.data.code == 0){
            this.setData({
              subjectArr: res.data.data.questionAnswer
            })
            // 如果是第20道题展示按钮状态
            if(res.data.data.questionAnswer[res.data.data.questionAnswer.length-2].solution != null){
              this.setData({
                completeSbumit:true,
                footerView:false,
                ingSbumit:false
              })
            }
          }else if(res.data.code == util.codes){//异地登录
            util.logOutObj.logOut();
          }
        }),
        fail:(res=>{
          wx.hideLoading()
          wx.showToast({
            title: '获取失败',
            icon:'none'
          })
        })
      })
    }else{
      this.setData({
        subjectArr: wx.getStorageSync('questionAnswer')
      })
      if(wx.getStorageSync('questionAnswer')[wx.getStorageSync('questionAnswer').length-2].solution != null){
        this.setData({
          completeSbumit:true,
          footerView:false,
          ingSbumit:false
        })
      }
    }
    
    

    this.setData({
      navTop:wx.getSystemInfoSync()['statusBarHeight']+10+'px',
      status:options.status
    })
  },
　onShow: function () {
        this.setData({
　　　　　　nonetwork: app.globalData.nonetwork,
　　　　})
　},
  onUnload:function(){
    // 销毁页面时，销毁计时器
    clearInterval(this.data.interval)
  },
  onReady:function(){
    // 无缝动画
    var t=this;
    var w = wx.getSystemInfoSync().windowWidth;
      var str = '儿童行为表现问卷是一份关于孩子发育行为的筛选表。本调查表包括20个问题，填写结果可帮助评估师了解孩子的基本情况，请您认真填写。';
      t.setData({
        marquee: w
      });
      t.data.maxScroll = str.length * 15 + 4;
      t.data.windowWidth = w;
      t.scrolltxt("1");
    this.animation = wx.createAnimation({
      duration: 1000,
      timingFunction:'ease'
    });
  },
  // 做题是否
  selectedSubject(e){
    console.log(e)
    if(this.data.clickStatus == true){
      this.setData({
        clickStatus:false
      })
      console.log(e.currentTarget.dataset.id)
      // 20道题
      if(this.data.subjectArr.length == (e.currentTarget.dataset.index+1)){
          this.setData({
            screenQuestionId:e.currentTarget.dataset.id,
            btnActive:e.currentTarget.dataset.type,
            completeSbumit1:true,
            completeSbumit:false,
            clickStatus:true,
            ingSbumit:false
          })
      }else{
        this.setData({
          screenQuestionId:e.currentTarget.dataset.id,
          btnActive:e.currentTarget.dataset.type,
          anIndex:e.currentTarget.dataset.index,
          clickStatus:true,
          ingSbumit:true
       })
      }
    }
  },
  // 提交答案
  submitAnswer(e){
    if(this.data.clickStatus){
        // 下一题
        if(this.data.ingSbumit == true || this.data.completeSbumit1 == true){
          if(util.clicks){
            util.clicks=false;
            console.log(this.data.subjectArr.length)
            if(this.data.subjectArr.length == (this.data.anIndex+2)){
              this.setData({
                completeSbumit:true,
                ingSbumit:false,
                footerView:false,
                ingSbumit:false
              })
            }
          
          
          // 无网且本地有储存答题记录
          console.log("网"+app.globalData.nonetwork)
          if(wx.getStorageSync('aiSubject') != ''&& app.globalData.nonetwork){
            // 无网最后一道题提示
            if(this.data.completeSbumit1 == true){
              wx.showToast({
                title: '网络已断开，请连网后提交',
                icon:'none'
              })
              setTimeout(()=>{
                util.clicks=true;
              },1000)
              console.log("clickSta11tus修改为true175："+this.data.clickStatus1)
            }
            if(this.data.anIndex+1 != this.data.subjectArr.length){
              if(this.data.completeSbumit1 == true && this.data.aiSubjectLength == 2){
                return;
              }
              var jsonData=JSON.parse(wx.getStorageSync('aiSubject'));
              wx.removeStorageSync('aiSubject')
              if(this.data.aiSubjectLength == 1){
                var subjectObj={
                  questionId:this.data.screenQuestionId,//问题id
                  screenRecordId:this.data.screenRecordId,//筛查记录id
                  solution:this.data.btnActive//答案 0：否 1：是
                }
                jsonData.push(subjectObj);
              }
              if(this.data.completeSbumit1 == true){
                this.setData({
                  aiSubjectLength:2
                })
              }
            }
          }else if(wx.getStorageSync('aiSubject') != ''&& !app.globalData.nonetwork){
            var jsonData=JSON.parse(wx.getStorageSync('aiSubject'));
            wx.removeStorageSync('aiSubject')
            var results=true
                jsonData.forEach((item)=>{
                    if(item.questionId == this.data.screenQuestionId){
                        results=false
                    }
                })
                // results为true时本地没有存答案
              if(results){
                var subjectObj={
                  questionId:this.data.screenQuestionId,//问题id
                  screenRecordId:this.data.screenRecordId,//筛查记录id
                  solution:this.data.btnActive//答案 0：否 1：是
                }
                jsonData.push(subjectObj);
              }
          }else{
              var jsonData=[
                {
                  questionId:this.data.screenQuestionId,//问题id
                  screenRecordId:this.data.screenRecordId,//筛查记录id
                  solution:this.data.btnActive//答案 0：否 1：是
                }
              ]
          }
          // 有网
          if(!app.globalData.nonetwork){
            console.log(jsonData)
            wx.request({
              url: util.url+'/v1/api/question/answer/batchAdd',
              header:app.requestHeader,
              method:"POST",
              // data:{
              //   list:JSON.stringify(jsonData)
              // },
              data:jsonData,
              success:(res=>{
                console.log(res)
                if(res.data.code == 0){
                  if(this.data.completeSbumit1 == true){//上传视频资料
                    wx.navigateTo({
                      url: '../upVideoIndex/upVideoIndex?screenRecordId='+this.data.screenRecordId,
                    })
                  }
                  // 本地有储存记录删除
                  if(wx.getStorageSync('aiSubject') != ''){
                    wx.removeStorageSync('aiSubject');
                  }
                  this.animation.rotate(-20).translate(-800).step()
                  let animationList = this.data.animationList
                  animationList[this.data.anIndex] = this.animation.export()
                  this.setData({
                    animationList:animationList,
                  });
                  setTimeout(()=>{
                    util.clicks=true;
                  },1000)
                }else if(res.data.code == util.codes){//异地登录
                  util.logOutObj.logOut();
                }else{
                  // this.setStorageSubject(jsonData);
                  wx.showToast({
                    title: res.data.msg,
                    icon:'none',
                    duration:2000
                  })
                }
                this.setData({
                  ingSbumit:false,
                  btnActive:2
                })
              }),
              fail:(res=>{
                  // 如果操作失败
                    this.animation.rotate(-20).translate(-800).step()
                    let animationList = this.data.animationList
                    animationList[this.data.anIndex] = this.animation.export()
                    this.setData({
                      animationList:animationList,
                      ingSbumit:false,
                      btnActive:2
                    });
                    setTimeout(()=>{
                      util.clicks=true;
                    },1000)
                    console.log("clickSta11tus修改为true280："+this.data.clickStatus1)
                  if(this.data.anIndex+1 != this.data.subjectArr.length){
                    this.setStorageSubject(jsonData);
                  }
              })
            })
          }else{
            // 如果操作失败
            this.animation.rotate(-20).translate(-800).step()
            let animationList = this.data.animationList
            animationList[this.data.anIndex] = this.animation.export()
            this.setData({
              animationList:animationList,
              ingSbumit:false,
              btnActive:2
            });
            setTimeout(()=>{
              util.clicks=true;
            },1000)
                  
            console.log("clickSta11tus修改为true299："+this.data.clickStatus1)
            if(this.data.anIndex+1 != this.data.subjectArr.length){
              this.setStorageSubject(jsonData);
            }
          }
          
          }
        }
    } 
  },
  scrolltxt:function(type){
    var t = this;
    var d = t.data;

    var interval = setInterval(function () {
      var next = d.marquee-3; //每次移动距离
      if( next<0 && Math.abs(next)>d.maxScroll ){
        next = d.windowWidth;
        clearInterval(t.data.interval);
        t.scrolltxt();
      }
      t.setData({
        marquee: next
      });
    }, 80);
    this.setData({
      interval:interval
    })
  },
  //返回上一页
  return_page(){
    if(this.data.status == 1){
      wx.reLaunch({
        url: '../home/home',
      })
    }else{
      wx.navigateBack({
        delta: 1,  // 返回上一级页面。
        success: function() {
        }
      })
    }
  },
  setStorageSubject(jsonData){
    wx.getStorage({
      key: 'aiSubject',
      success (res) {
        var subjectArr=JSON.parse(res.data);
        subjectArr.push(jsonData);
        wx.setStorage({
          key:'aiSubject',
          data:JSON.stringify(subjectArr)
        })
      },
      fail(res){
        wx.setStorage({
          key:'aiSubject',
          data:JSON.stringify(jsonData)
        })
      }
    })
  }
})