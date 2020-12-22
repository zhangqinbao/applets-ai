// pages/contact/contact.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shareIn:{
      shareImg:"https://ingcare-ai.oss-cn-beijing.aliyuncs.com/20201119/mmqrcode1606726192612.png"
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  // 长按保存图片
 // 长按保存图片
 saveImg(e){
  let url = e.currentTarget.dataset.url;
  //用户需要授权
  wx.getSetting({
   success: (res) => {
    if (!res.authSetting['scope.writePhotosAlbum']) {
     wx.authorize({
      scope: 'scope.writePhotosAlbum',
      success:()=> {
       // 同意授权
       this.saveImg1(url);
      },
      fail: (res) =>{
       console.log(res);
      }
     })
    }else{
     // 已经授权了
     this.saveImg1(url);
    }
   },
   fail: (res) =>{
    console.log(res);
   }
  })  
 },
//  长按保存图片
 showBigImg() { 
  var _this = this
  wx.downloadFile({
      url: _this.data.shareIn.shareImg,
      success (res) {
          wx.saveImageToPhotosAlbum({  
              filePath: res.tempFilePath, 
              success () {
                  _this.sharePop = !_this.sharePop
                  wx.showToast({
                      title: '图片保存成功',
                      icon: 'none',
                      duration: 2000
                  })  
           
              }
          })
      }
  })
},
  freeTell(){
    wx.makePhoneCall({
      phoneNumber: '4006062105',

    })

  }
})