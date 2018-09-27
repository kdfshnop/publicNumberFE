/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 1. 项目名称：有房有客微信CDN框架
 2. 页面名称：bind.js (手机绑定页)
 3. 作者：douyadong@lifang.com
 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
 class BindController extends Controller {
    constructor() {
        super() ;
        this.bindTel();
    }
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    获取验证码及绑定手机号
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    bindTel(){
        let self=this;
        let telReg=/^1\d{10}$/;
        let timer=null;//定时器;
        let time=60;
        let openId=$.cookie("openId");
        let state=$.cookie("state");
        $('.verify').click(function(){            
            let tel=$('.tel').val();
            if(telReg.test(tel)){
                $('.verify').html(time+'s');
                $('.verify').css('color','#999999');
                $('.verify').attr('disabled',true);//获取验证码按钮禁止点击;
                timer=setInterval(function(){
                    time--;
                    if(time==0){
                        clearInterval(timer);
                        time=60;
                        $('.verify').html('获取验证');
                        $('.verify').css('color','#fc4c5a');
                        $('.verify').attr('disabled',false);//获取验证码按钮禁止点击;
                    }else{
                        $('.verify').html(time+"s");
                    }
                },1000);
                // 发送请求,获取验证码;
                self.request(self.apiUrl.member.phoneAuthCode,{tel,openId},{
                    type:"POST",
                    successCallback:function(data){
                        console.log(data,'验证码');
                    },
                    errorCallback:function(err){
                        console.log(err,'err');
                    }
                });
            }else{
                $.tips('请输入正确手机号',2);
            }
        });
        $('.btn').click(function(){
            let tel=$('.tel').val();
            let code=$('.note input').val();
            if(!telReg.test(tel)){
                $.tips('请填写正确手机号',2);
            }else if(!code){
                $.tips('请输入验证码',2); 
            }else{
                $('.btn').attr('disabled',true);
                // 发送请求;
                self.request(self.apiUrl.member.bindSuccess,{tel,code,openId,state},{
                    type:"post",
                    successCallback:function(data){
                        $.cookie('agentId',data.data.agentId);
                        $('.btn').attr('disabled',false);
                        if(data.data.verifiedStatus==4){
                            location.href=data.data.targetUrl;
                        }else{
                            location.href="/member/profile/edit";
                        } 
                    },
                    errorCallback:function(err){
                        $('.btn').attr('disabled',false);
                    },
                    exceptionCallback:function(data){
                        $('.btn').attr('disabled',false);
                    }
                });
            }
        });
        let env=$.cookie('env')||'dev';
        let shareLinkDomain="";
        let wechatCode="";
        switch(env){
            case "dev" :
                shareLinkDomain="https://wechattest.yfyk365.com" ;
                wechatCode="5000001";
                break;
            case "test" :
                shareLinkDomain="https://wechattest.yfyk365.com" ;
                wechatCode="5000001";
                break ;
            case "sim" :
                shareLinkDomain="https://wechatsim.yfyk365.com" ;
                wechatCode="4000001";
                break ;
            case "prod" :
                shareLinkDomain="https://wechat.yfyk365.com" ;
                wechatCode="3000001";
                break ;
        };
        self.request(shareLinkDomain+"/base/getJsSdkSign.action?wechatCode="+wechatCode,{requestUrl: window.location.href},{
            successCallback(result){
                let data = result.data;
                wx.config({
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: data.appid, // 必填，企业号的唯一标识，此处填写企业号corpid
                    timestamp: data.timestamp, // 必填，生成签名的时间戳
                    nonceStr: data.nonce_str, // 必填，生成签名的随机串
                    signature: data.signature, // 必填，签名，见附录1
                    jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                });
                wx.ready(function () {
                    wx.showOptionMenu();
                    console.log('config成功');
                    wx.onMenuShareTimeline({
                        link: shareLinkDomain+"/base/getAuthCode"
                    });
                    wx.onMenuShareAppMessage({
                        link: shareLinkDomain+"/base/getAuthCode"
                    });
                });
            }
        })
    }
 }
 /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
类的初始化
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
$(document).ready(function(){
    new BindController ;
}) ;