
// 本地环境
//  const url ='http://192.168.1.37:8760/api/patriarch';
//  const videoUrl ='http://192.168.1.37:8760/api/vod';
//  const loginUrl ='http://192.168.1.37:8760';

// 预生产环境
const url ='https://test.ingclass.org/api/patriarch';
const videoUrl ='https://test.ingclass.org/api/vod';
const loginUrl ='https://test.ingclass.org';

// 生产环境
// const url ='https://gateway.ingcare.com/api/patriarch';
// const videoUrl ='https://gateway.ingcare.com/api/vod';
// const loginUrl ='https://gateway.ingcare.com';

//客户端秘钥
const clientId="28ihb21eir238frnnuw7uskz";
const clientSecret="qrsfnm7wv5tc2ugx2gsucakmj5fle0l3";

const clicks=true;
// 获取小程序版本号
const accountInfo = wx.getAccountInfoSync();
console.log(accountInfo) // 插件版本号， 'a.b.c' 这样的形式

//异地登录code
const codes=40008;
//异地登录操作
const logOutObj={
  logOut(){
    wx.removeStorageSync('token');
    wx.removeStorageSync('passWordStatus');
    wx.removeStorageSync('refreshToken');
    //成功退出授权页面
    wx.navigateTo({
      url: '/pages/index/index',
    })
    wx.showToast({
      title: "账号在异地登录",
      icon:'none',
      duration:2000
    })
  }
}
// 校验
const calibrationMethod={
  // 手机号
  phone(res){
    var result={};
    if(res == ""){
      result['status']=false;
      result['message']='*账号不能为空';
    }else if(res != '' && !/^([1][1,3,4,5,6,7,8,9])\d{9}$/.test(res)){
      result['status']=false;
      result['message']='*手机号格式不正确';
    }else{
      result['status']=true;
    }
    return result;
  },
  // 验证码
  code(res){
    var result={};
    if(res == ""){
      result['status']=false;
      result['message']='*验证码不能为空';
    }else if(res != '' && !/^\d{6}$/.test(res)){
      result['status']=false;
      result['message']='*验证码格式错误';
    }else{
      result['status']=true;
    }
    return result;
  },
  // 密码
  password(res){
    var result={};
    if(res == ""){
      result['status']=false;
      result['message']='*登录密码不能为空';
    }else if(res != '' && !/^[a-zA-Z0-9@\$\^\.\*\\?]{6,15}$/.test(res)){
      result['status']=false;
      result['message']='*请输入6-15位字母或数字，可包括特殊字符';
    }else{
      result['status']=true;
    }
    return result;
  }
}
module.exports = {
  url: url,
  codes:codes,
  clicks:clicks,
  clientId:clientId,
  clientSecret:clientSecret,
  logOutObj:logOutObj,
  loginUrl:loginUrl,
  videoUrl:videoUrl,
  calibrationMethod:calibrationMethod
}
