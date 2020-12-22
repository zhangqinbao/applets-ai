// pages/upVideo/upVideo.js
const util = require('../../utils/util.js')
var app = getApp();
import VODUpload from './../../utils/aliyun-upload-sdk-1.0.0.min.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navTop:'',
    videoUrl:'',
    files: [],
    fileSize:'',
    videos: [],
    maskType:false,
    firstBtn:true,
    videoShowType:'',
    videoUrlTrue:'',
    globalData:{
      navHeight:'',
      navTop:'',
      windowHeight:''
    },
    success:false,
    optionsId:1,
    textStr:'',
    textStr1:'',
    textTransformation:false,
    upType:0,
    returnPageType:true,
    contentShowType:false,
    playtype:true,
    playIcon:false,
    upStatus:true,
    retrunType:true,
    upNumber:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options.id
    wx.getStorageSync('screenMedia').forEach((item,index)=>{
      if(options.id == item.id){
          this.setData({
            videoInfo:item,
            optionsId:item.id,
            screenRecordId:options.screenRecordId,
            textStr:item.content.length >= 79?item.content.substring(0,79)+"...":item.content,
            content:item.content,
            contentShowType:item.content.length >= 79?true:false
          })
          if(item.answerMediaId!=null){
            console.log("answerMediaId"+item.answerMediaId)
            // 获取播放url
            wx.request({
              url:util.videoUrl+'/aliyunVod/vod/play/info?vid='+item.answerMediaId,
              method:"POST",
              header:app.requestHeader,
              success: (res => {
                console.log(res)
                  if(res.data.code == 0) {
                    this.setData({
                      videoUrl:res.data.data.playURL,
                      videoUrlTrue:res.data.data.playURL,
                      videoPUrl:res.data.data.coverURL,
                      duration:Number(res.data.data.duration),
                      videoShowType:item.answerMediaId==null?false:true,
                      success:item.answerMediaId==null?false:true
                    })
                  }else if(res.data.code == util.codes){//异地登录
                    util.logOutObj.logOut();
                  }else{
                    console.log("1111")
                    wx.showToast({
                      title: res.data.msg,
                      icon: 'none',
                      duration: 2000
                    })
                  }
              }),
              fail: (res => {
                wx.showToast({
                  title: '操作失败',
                  icon:'none',
                  duration:2000
                })
              })
            });
          }
      }
    })
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
      options: options,
      optionsId:options.id
    })
  },
  onShow:function(){
    // 切换前后台及网络，视频上传中断处理
    wx.onError((error) => {
        wx.hideLoading();
        wx.showToast({
          title: '上传视频中断!',
          icon: 'none',
          duration: 2500
        })
        if(this.data.videoUrlTrue == ''){
          this.setData({
            videoUrl:'',
            videoShowType:false
          })
        }else{
          this.setData({
            videoUrl:this.data.videoUrlTrue
          })
        }
        this.setData({
          retrunType:false,
          upStatus:false,
          returnPageType:true,
          upNumber:0,
          uploader:''
        })
        this.uploader()
    })
  },
  onUnload: function() {
    // 页面销毁时取消上传视频
    if(this.data.upNumber != 0){
      wx.hideToast();
      wx.hideLoading()
      this.setData({
        upStatus:false,
        videoShowType:false,
        success:false,
        maskType:true,
        retrunType:false,
        returnPageType:true,
        upNumber:0,
        uploader:''
      })
    }
  },
  onReady: function () {
    this.uploader()
  },
  //上传视频
  chooseVideo: function (e) {
    if(this.data.returnPageType){
      var that=this;
      wx.getNetworkType({
        success (res) {
          if(res.networkType == "wifi"){
            that.changeUpVideo(that);
          }else{
            that.setData({
              showTetx:'非wifi网络，正使用流量上传',
              maskType:true,
              btnText:'继续上传',
              upType:1
            })
          }
        }
      })
    }
  },
  changeUpVideo(that){
    wx.chooseVideo({
      sourceType: ['album'],
      maxDuration: 60,
      compressed: true,
      camera: 'back',
      success: function (res) {
          if(res.duration/60 < 3 || res.duration/60 > 5){
            that.setData({
              showTetx:'请上传3-5分钟的视频',
              btnText:'确定',
              maskType:true,
              firstBtn:false,
              upType:3
            })
            return;
          }
          var file = {url: res.tempFilePath, coverUrl: res.thumbTempFilePath};
          that.setData({
              videos: that.data.videos.concat(file),
              fileSize:res.size,
              videoShowType:true,
              returnPageType:false,
              ingUpType:false,
              videoUrl:res.tempFilePath,
              videoPUrl:res.thumbTempFilePath,
              upStatus:true,
              upNumber:0,
              retrunType:true
          });
          wx.showLoading({
              title: '上传中...0%',
              mask:true
          })
          var uploader = that.data.uploader;
          var userData = '{"Vod":{}}'
          uploader.addFile(file, null, null, null, userData)
          //调上传视频方法
          that.data.uploader.startUpload();
      }
  })
  },
  // 查看全部
  textTransformation(){
      if(!this.data.textTransformation){
        this.setData({
          textTransformation:true,
          textStr:this.data.content
        })
      }else{
        this.setData({
          textTransformation:false,
          textStr:this.data.content.substring(0,79)+'...'
        })
      }
  },
  _getSuffix: function (filename) {
    var pos = filename.lastIndexOf('.')
    var suffix = ''
    if (pos != -1) {
        suffix = filename.substring(++pos)
    }
    return suffix;
  },//返回上一页
  returnPage(){
    // 正在上传中
    if(this.data.returnPageType == false){
      this.setData({
        showTetx:'视频尚未上传成功，返回会中断上传，是否返回？',
        maskType:true,
        firstBtn:true,
        btnText:'继续上传',
        upType:2
      })
    }else{
      wx.navigateBack({
        delta: 1,  // 返回上一级页面。
        success: function() {
        }
      })
    }
  },
  // 继续操作
  continue(e){
    // 1继续上传，2继续返回,4继续播放
    if(e.currentTarget.dataset.type == 1){
      this.changeUpVideo(this);

    }else if(e.currentTarget.dataset.type == 2){
      this.data.uploader.stopUpload();
    }else if(e.currentTarget.dataset.type == 3){
      
    }else if(e.currentTarget.dataset.type == 4){
      var videoContext = wx.createVideoContext('ai-sl-Video');
          videoContext.play()//暂停播放
          this.setData({
            playtype:false
          })
    }
    this.setData({
      maskType:false
    })
  },
  returnPages(){
    wx.navigateBack({
      delta: 1,  // 返回上一级页面。
      success: function() {
          console.log('成功！')
      }
    })
  },
  preservation(){
    if(this.data.success){
      if(this.data.returnPageType){
        wx.navigateBack({
          delta: 1,  // 返回上一级页面。
          success: function() {
              console.log('成功！')
          }
        })
      }
    }
  },
  closeMask(e){
    if(e.currentTarget.dataset.type == 2){
      this.setData({
        upStatus:false
      })
      wx.hideToast();
      this.data.uploader.stopUpload()
      this.returnPages();
    }else{
      this.setData({
        maskType:false
      })
    }
  },
  upVideoPlay(){
    var videoContext = wx.createVideoContext('ai-sl-Video1');
    if(this.data.returnPageType == false){
      videoContext.pause()//暂停播放
    }
  },
  videoPlay(){
    var that=this;
    var videoContext = wx.createVideoContext('ai-sl-Video');
    this.setData({
      playIcon:true
    })
    if(this.data.returnPageType == false){
      videoContext.pause()//暂停播放
    }else{
      wx.getNetworkType({
        success (res) {
          if(res.networkType != "wifi"){
            //获取video
           if(that.data.playtype){
                videoContext.pause()//暂停播放
                that.setData({
                  showTetx:'非wifi网络，正使用流量播放',
                  maskType:true,
                  firstBtn:true,
                  btnText:'继续播放',
                  upType:4
                })
           }
          }
        }
      })
    }
    
  },
  // 刷新网络
  refreshNet(){
    this.onLoad();
    this.setData({
      noNet:app.globalData.nonetwork
    })
  },
  imgHieght(e){
      console.log(e)
  },
  uploader(){
    var that = this;
    var uploader = new VODUpload({
      //阿里账号ID，必须有值
      userId:"1114809017502275",
      //网络原因失败时，重新上传次数，默认为3
      retryCount: 3,
     //网络原因失败时，重新上传间隔时间，默认为2秒
      retryDuration: 2,
      // 添加文件成功
      addFileSuccess: function (uploadInfo) {
      },
      // 开始上传
      onUploadstarted: function (uploadInfo) {
          wx.request({
              url:util.videoUrl+'/aliyunVod/vod/upload/certificate',
              method:"POST",
              data:{
                fileName:uploadInfo.url,
                title:"ai"
              },
              header:app.requestHeader,
              success: (res => {
                console.log(res.data.code)
                  if (res.data.code == 0) {
                      var akInfo = res.data.data;
                      uploader.setUploadAuthAndAddress(uploadInfo, akInfo.uploadAuth, akInfo.uploadAddress, akInfo.videoId);
                      that.setData({
                        mediaId:akInfo.videoId,
                        upNumber:2
                      })
                  }else if(res.data.code == util.codes){//异地登录
                    util.logOutObj.logOut();
                  }else {
                    uploader.stopUpload();
                  }
              }),
              fail: (res => {
                  uploader.stopUpload();
              })
          });

      },
      // 文件上传成功
      onUploadSucceed: function (uploadInfo) {
        wx.hideLoading()
        that.setData({
          upNumber:0
        }) 
        if(that.data.upStatus){
          wx.request({
            url: util.url+'/v1/api/question/answer/saveOrUpdate',
            header:app.requestHeader,
            method:"POST",
            data:{
              id:that.data.videoInfo.answerId == null?'':that.data.videoInfo.answerId,
              mediaId:that.data.mediaId,
              screenMediaExampleId:that.data.videoInfo.id,//示例id
              screenRecordId:that.data.screenRecordId
            },
            success:(res=>{
              console.log("res"+res)
              console.log(res)
              if(res.data.code == 0){
                  that.setData({
                    'videoInfo.answerId':res.data.data,
                     maskType:false,
                     upNumber:0
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
            }),
            fail:(res=>{
              wx.showToast({
                title: '查询失败',
                icon:'none',
                duration:2000
              })
            })
          })
            that.setData({
              success:true,
              returnPageType:true,
              upNumber:0
            })
            wx.showToast({
                title: '上传成功',
                icon: 'success',
                duration: 2000
            })
        }
      },
      // 文件上传失败
      onUploadFailed: function (uploadInfo, code, message) {
          wx.showToast({
              title: '上传失败',
              icon: 'none',
              duration: 2000
          })
          uploader.stopUpload();
      },
      // 取消文件上传
      onUploadCanceled: function (uploadInfo, code, message) {
          wx.showToast({
              title: '文件已暂停上传!',
              icon: 'none',
              duration: 2000
          })
          uploader.stopUpload();

      },
      // 文件上传进度，单位：字节, 可以在这个函数中拿到上传进度并显示在页面上
      onUploadProgress: function (uploadInfo, totalSize, progress) {
          var files  = that.data.videos;

          files.forEach((file, idx) => {
              if (file.url === uploadInfo.url) {
                  file.progress = progress;
                  that.setData({
                      videos: files
                  })
              }
          })

          //console.log(JSON.stringify(uploadInfo) + "|" + totalSize + "|" + progress)
          // console.log("onUploadProgress:file:" + uploadInfo.file.name + ", fileSize:" + totalSize + ", percent:" + Math.ceil(progress * 100) + "%")
          //var progressPercent = Math.ceil(progress * 100)
          if(that.data.retrunType){
            if(!that.data.maskType){
              wx.showLoading({
                title: '上传中...' + progress + '%'
              })
            }else{
              wx.hideLoading()
            }
          }else{
            uploader.stopUpload();
          }
      },
      // 上传凭证超时
      onUploadTokenExpired: function (uploadInfo) {
          // // 如果是上传方式二即根据 STSToken 实现时，从新获取STS临时账号用于恢复上传
          // // 上传文件过大时可能在上传过程中 sts token 就会失效, 所以需要在 token 过期的回调中调用 resumeUploadWithSTSToken 方法
          // // 这里是测试接口, 所以我直接获取了 STSToken
          // $('#status').text('文件上传超时!')
          //
          // var stsUrl = 'http://demo-vod.cn-shanghai.aliyuncs.com/voddemo/CreateSecurityToken?BusinessType=vodai&TerminalType=pc&DeviceModel=iPhone9,2&UUID=67999yyuuuy&AppVersion=1.0.0'
          // $.get(stsUrl, function (data) {
          //     var info = data.SecurityTokenInfo
          //     var accessKeyId = info.AccessKeyId
          //     var accessKeySecret = info.AccessKeySecret
          //     var secretToken = info.SecurityToken
          //     var expiration = info.Expiration
          //     uploader.resumeUploadWithSTSToken(accessKeyId, accessKeySecret, secretToken, expiration)
          // }, 'json')
      },
      // 全部文件上传结束
      onUploadEnd: function (uploadInfo) {
          
      }
  });

  this.setData({
      uploader: uploader
  });
  }
})