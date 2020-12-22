// pages/childrenInfo/childrenInfo.js
const addR = require('../../utils/address.js')
const util = require('../../utils/util.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      pageType:false,
      newDate:'',
      subType:false,
      subActive:false,
      selectDate:'请选择宝宝的出生日期',
      selectDateType:false,
      male:false,
      female:false,
      selectAdd:'请选择常住地址',
      selectAddType:false,
      multiArray: [0, 0, 0],
      provinces:'',
      pageShow:false,
      multiIndex: [0, 0, 0],//省市区下标
      network:'',
      childrenInfo:{
        name:'',//孩子姓名
        gender:"",//性别
        birthday:'',//出生日期
        parentName:'',//家长姓名
        parentMobile:'',//家长手机号
        province:'',//省
        city:'',//市
        area:'',//区
        address:''//详细地址地址
      },
      showChildrenInfo:{},
      rules:{
        a:{
          status:true,
          message:"*请输入2-10位汉字或字母",
        },
        b:{
          status:true,
          message:"*请选择性别"
        },
        c:{
          status:true,
          message:"*请选择出生日期"
        },
        d:{
          status:true,
          message:"*请输入2-10位汉字或字母"
        },
        e:{
          status:true,
          message:"*手机号格式不正确"
        },
        f:{
          status:true,
          message:"*请选择常用地址"
        },
        g:{
          status:true,
          message:"*详细地址不能为空"
        }
      }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var address=addR.add;
    wx.showLoading({
      title: '数据加载中',
      mask:true
    })
    // 初次登陆不刷新taken
    if(wx.getStorageSync('firstToken')){
      this.getUserInfo(address);
    }else{
      app.userLogin().then(res => {
        console.log(res)
        if(res.code == 0){
          this.getUserInfo(address);
        }else{
          wx.hideLoading()
          wx.showToast({
            title: res.msg,
            icon:'none',
            duration:2000
          })
        }
      })
    }
    
    this.setData({
      provinces: address,
      multiArray:[address,address[0].children,address[0].children[0].children],
      newDate:this.getNowFormatDate(new Date(new Date().getTime() - 24*60*60*1000)),
      nextPageType:options.type
    })
    if(wx.getSystemInfoSync().platform == 'ios' || wx.getSystemInfoSync().platform == 'devtools' ){
      this.setData({
        platform:true
      })
    }else{
      this.setData({
        platform:false
      })
    }
    if(wx.getStorageSync('token') != '' && wx.getStorageSync('passWordStatus')){
      this.setData({
        pageShow:true
      })
      wx.setNavigationBarTitle({
        title: '孩子信息' 
      })
    }
    // 监听网络状态
    var that=this;
    wx.getNetworkType({
      success (res) {
        that.setData({
          network:res.networkType
        })
      }
    })
    //this.data.region=util.add;
  },
  onShow:function(){
      this.setData({
        noNet:app.globalData.nonetwork
      })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (options) {
   
  },
  //孩子姓名
  childrenName(e){
    this.setData({
      'childrenInfo.name':e.detail.value
    });
    this.fromCheck();
  },
  // 查询孩子信息
  getUserInfo(address){
    if(wx.getStorageSync('token') != ''){
      wx.removeStorageSync('firstToken')
      wx.request({
        url: util.url+'/v1/api/children/get',
        header:app.requestHeader,
        success:(res=>{
          wx.hideLoading()
          console.log(res)
          if(res.data.code == 0 && res.data.data.length != 0){
            var addressIndex=[];
            // 获取省市区的index
            //编辑反显示会用到
            address.forEach((item, index)=>{
              if(item.label == res.data.data[0].province){
                addressIndex.push(index);
              }
            })
            address[addressIndex[0]].children.forEach((item, index)=>{
              if(item.label == res.data.data[0].city){
                addressIndex.push(index);
              }
            })
            address[addressIndex[0]].children[addressIndex[1]].children.forEach((item, index)=>{
              if(item.label == res.data.data[0].area){
                addressIndex.push(index);
              }
            })
            this.setData({
              subType:true,
              selectDateType:true,
              selectAddType:true,
              pageType:true,
              multiIndex:addressIndex,
              newDateShow:res.data.data[0].birthday,
              'showChildrenInfo':res.data.data[0],//孩子姓名
              'childrenInfo.name':res.data.data[0].name,//孩子姓名
              'childrenInfo.gender':String(res.data.data[0].gender),//性别
              'childrenInfo.birthday':res.data.data[0].birthday,//出生日期
              'childrenInfo.parentName':res.data.data[0].parentName,//家长姓名
              'childrenInfo.parentMobile':res.data.data[0].parentMobile,//家长手机号
              'childrenInfo.province':res.data.data[0].province,//省
              'childrenInfo.city':res.data.data[0].city,//市
              'childrenInfo.area':res.data.data[0].area,//区
              'childrenInfo.address':res.data.data[0].address//详细地址地址,
            })
          }else if(res.data.code == util.codes ||  res.data.code == 40007){//异地登录或账号禁用
            util.logOutObj.logOut();
          }else if(res.data.code != 0){
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
            title: '查询失败',
            icon:'none',
            duration:2000
          })
        })
      })
    }
  },
  //性别
  selectGender(e){
    if(e.currentTarget.dataset.type == 1){
      this.setData({
        male:true,
        female:false,
        'childrenInfo.gender':Number(e.currentTarget.dataset.type),
        'rules.b.status':true
      })
    }else{
      this.setData({
        male:false,
        female:true,
        'childrenInfo.gender':Number(e.currentTarget.dataset.type),
        'rules.b.status':true
      })
    }
    this.fromCheck();
  },
  // 选择出生日期
  selectDate(e){
    this.setData({
      'childrenInfo.birthday':e.detail.value,
      selectDate:e.detail.value,
      "showChildrenInfo.birthday":e.detail.value,
      selectDateType:true,
      'rules.c.status':true
    });
    this.fromCheck();
  },
  //家长姓名
  parentName(e){
    this.setData({
      'childrenInfo.parentName':e.detail.value
    });
    this.fromCheck();
  },
  //家长手机号
  parentPhone(e){
    this.setData({
      'childrenInfo.parentMobile':e.detail.value
    });
    if(e.detail.value.length == 11 && !/^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(e.detail.value)){
      this.setData({
        'rules.e.status':false
      })
    }else{
      this.setData({
        'rules.e.status':true
      })
    }
    this.fromCheck();
  },
  // 选择地址
  bindMultiPickerChange: function (e) {
    var selectedVal=e.detail.value,
         province=this.data.provinces[selectedVal[0]].label,
         city=this.data.provinces[selectedVal[0]].children[selectedVal[1]].label,
         area=this.data.provinces[selectedVal[0]].children[selectedVal[1]].children[selectedVal[2]].label;
    this.setData({
      'childrenInfo.province':province,
      'childrenInfo.city':city,
      'childrenInfo.area':area,
      'showChildrenInfo.province':province,
      'showChildrenInfo.city':city,
      'showChildrenInfo.area':area,
      selectAdd:province == city ? province + area : province + city + area,
      selectAddType:true,
      'rules.f.status':true
    });
    this.fromCheck();
    this.setData({
      multiIndex: e.detail.value
    })
  },
  //常用地址滑动
  bindMultiPickerColumnChange: function (e) {
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    //更新滑动的第几列e.detail.column的数组下标值e.detail.value
    data.multiIndex[e.detail.column] = e.detail.value;
    //如果更新的是第一列“省”，第二列“市”和第三列“区”的数组下标置为0
    if (e.detail.column == 0) {
      data.multiIndex = [e.detail.value, 0, 0];
    } else if (e.detail.column == 1) {
      //如果更新的是第二列“市”，第一列“省”的下标不变，第三列“区”的数组下标置为0
      data.multiIndex = [data.multiIndex[0], e.detail.value, 0];
    } else if (e.detail.column == 2) {
      //如果更新的是第三列“区”，第一列“省”和第二列“市”的值均不变。
      data.multiIndex = [data.multiIndex[0], data.multiIndex[1], e.detail.value];
    }
    var temp = this.data.provinces;
    data.multiArray[0] = temp;
    if ((temp[data.multiIndex[0]].children).length > 0) {
      //如果第二列“市”的个数大于0,通过multiIndex变更multiArray[1]的值
      data.multiArray[1] = temp[data.multiIndex[0]].children;
      var areaArr = (temp[data.multiIndex[0]].children[data.multiIndex[1]]).children;
      //如果第三列“区”的个数大于0,通过multiIndex变更multiArray[2]的值；否则赋值为空数组
      data.multiArray[2] = areaArr.length > 0 ? areaArr : [];
    } else {
      //如果第二列“市”的个数不大于0，那么第二列“市”和第三列“区”都赋值为空数组
      data.multiArray[1] = [];
      data.multiArray[2] = [];
    }
    //data.multiArray = [temp, temp[data.multiIndex[0]].citys, temp[data.multiIndex[0]].citys[data.multiIndex[1]].areas];
    //setData更新数据
    this.setData(data);
  },
  //详细地址
  detailedAddress(e){
    this.setData({
      'childrenInfo.address':e.detail.value,
      'rules.g.status':true
    })
    this.fromCheck();
  },
  // 校验
  fromCheck(){
    this.setData({
      'rules.a.status':true
    })
    var checkObj=this.data.childrenInfo;
    var checkArr=[];
    for(var i in checkObj){
      if(i == 'name'){
        if(!/^[\u4E00-\u9FA0]|[A-Za-z]{2,10}$/.test(checkObj.name)){
          checkArr.push(i)
        }
      }else if(i == 'parentName'){
        if(!/^[\u4E00-\u9FA0]|[A-Za-z]{2,10}$/.test(checkObj.parentName)){
          checkArr.push(i)
        }
      }else if(i == 'parentMobile'){
          // this.setData({
          //   [`rules.${i}.status`]:false
          // })
          if(!/^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(checkObj.parentMobile)){
            checkArr.push(i)
          }
      }else{
        if(checkObj[i] == ''){
          checkArr.push(i)
        }
      }
    }
    console.log(checkArr)
    if(this.data.rules.a.status != false && this.data.rules.b.status != false && this.data.rules.e.status != false && checkArr.length == 0){
        this.setData({
          subType:true
        })
    }else{
      this.setData({
        subType:false
      })
    }
  },
  // 宝宝和家长姓名校验
  textCheck(e){
    if(!/^[\u4E00-\u9FA0]|[A-Za-z]{2,10}$/.test(e.detail.value) || e.detail.value.length < 2){
      if(e.currentTarget.dataset.type == 1){
        this.setData({
          'rules.a.status':false
        })
      }else{
        this.setData({
          'rules.d.status':false
        })
      }
    }else{
      if(e.currentTarget.dataset.type == 1){
        this.setData({
          'rules.a.status':true
        })
      }else{
        this.setData({
          'rules.d.status':true
        })
      }
    }
  },
  // 手机号失去焦点校验
  checkParentPhone(e){
    if(!/^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(this.data.childrenInfo.parentMobile)){
      this.setData({
        'rules.e.status':false
      })
    }else{
      this.setData({
        'rules.e.status':true
      })
    }
  },
  // 提交
  sunmitCildrenInfo(){
    if(this.data.childrenInfo.name == ''){
      this.setData({
        'rules.a.status':false,
        'rules.a.message':'*宝宝姓名不能为空'
      })
    }
    if(this.data.childrenInfo.name != '' && !/^[\u4E00-\u9FA0]|[A-Za-z]{2,10}$/.test(this.data.childrenInfo.name)){
      this.setData({
        'rules.a.status':false,
        'rules.a.message':'*请输入2-10位汉字或字母'
      })
    }
    if(this.data.childrenInfo.gender == ''){
      this.setData({
        'rules.b.status':false
      })
    }
    if(this.data.childrenInfo.birthday == ''){
      this.setData({
        'rules.c.status':false
      })
    }
    if(this.data.childrenInfo.parentName == ''){
      this.setData({
        'rules.d.status':false,
        'rules.d.message':'*家长姓名不能为空'
      })
    }
    if(this.data.childrenInfo.parentName!="" && !/^[\u4E00-\u9FA0]|[A-Za-z]{2,10}$/.test(this.data.childrenInfo.parentName)){
      this.setData({
        'rules.d.status':false,
        'rules.d.message':'*请输入2-10位汉字或字母'
      })
    }
    if(this.data.childrenInfo.parentMobile == ''){
      this.setData({
        'rules.e.status':false,
        'rules.e.message':'*家长手机不能为空'
      })
    }
    if(this.data.childrenInfo.parentMobile != '' && !/^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(this.data.childrenInfo.parentMobile)){
      this.setData({
        'rules.e.status':false,
        'rules.e.message':'*手机号格式不正确'
      })
    }
    if(this.data.childrenInfo.province == ''){
      this.setData({
        'rules.f.status':false
      })
    }
    if(this.data.childrenInfo.address == ''){
      this.setData({
        'rules.g.status':false
      })
    }
    if(this.data.subType == true){
      if(this.data.subActive == false){
        this.setData({
          subActive:true
        })
        wx.request({
          url: util.url+'/v1/api/children/addOrUpdate',
          header:app.requestHeader,
          method:"POST",
          data:{
            'name':this.data.childrenInfo.name,//孩子姓名
            'gender':Number(this.data.childrenInfo.gender),//性别
            'birthday':this.data.childrenInfo.birthday,//出生日期
            'parentName':this.data.childrenInfo.parentName,//家长姓名
            'parentMobile':this.data.childrenInfo.parentMobile,//家长手机号
            'province':this.data.childrenInfo.province,//省
            'city':this.data.childrenInfo.city,//市
            'area':this.data.childrenInfo.area,//区
            'address':this.data.childrenInfo.address//详细地址地址
          },
          success:(res=>{
            if(res.data.msg=='ok'){
              if(this.data.nextPageType == 1){
                //去往孩子信息编辑页
                console.log(getCurrentPages())
                var pages = getCurrentPages(); //页面指针数组
                var prepage ="/"+ pages[pages.length - 2].route; //上一页面指针
                var cps = getCurrentPages();
                var delta = 0;
                for (var i = cps.length - 1; i >= 0; i--) {
                  console.log("/" + cps[i].route)
                  if ("/"+cps[i].route == prepage) {
                    console.log(delta)
                    if (delta == 0) {
                      return;
                    }
                    wx.navigateBack({ delta: delta });
                    return;
                  }
                  delta++;
                }
              }else{
                // 去往首页
                wx.navigateTo({
                  url: '../home/home',
                })
              }
            }else if(res.data.code == util.codes){//异地登录
              util.logOutObj.logOut();
            }else{
              wx.showToast({
                title: res.data.msg,
                icon:'none',
                duration:2000
              });
            }
            this.setData({
              subActive:false
            })
          }),
          fail:(res=>{
            wx.hideLoading()
            wx.showToast({
              title: '提交失败',
              icon:'none',
              duration:2000
            })
          })
        })
      }
    }
  },
  delArr(str,arr){
      var index=arr.indexOf(str);
      arr.splice(index,1);
      return arr;
  },
  getNowFormatDate(date) {
         var date = date;
         var seperator1 = "-";
        var year = date.getFullYear();
         var month = date.getMonth() + 1;
         var strDate = date.getDate();
         if (month >= 1 && month <= 9) {
            month = "0" + month;
         }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = year + seperator1 + month + seperator1 + strDate;
        return currentdate;
  },
  // 刷新网络
  refreshNet(){
    this.onLoad();
    this.setData({
      noNet:app.globalData.nonetwork
    })
  }
})