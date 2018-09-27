/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 1. 项目名称：有房有客微信CDN框架
 2. 页面名称：profileEdit.js (个人资料编辑)
 3. 作者：zhaohuagang@lifang.com
 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
class ProfileEditController extends Controller {
    constructor() {
        super() ;
        document.title = "完善资料";    // 设置标题
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        选择的板块信息字段
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        this.selectedTowns = "" ;
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        添加dom事件监听
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        this.addEventListeners() ;       
    }
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    添加dom事件监听
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    addEventListeners() {
        require([
            this.appStaticPrefix + "/components/jquery.upload.min.js" , 
            this.appStaticPrefix + "/components/jquery.citypicker.min.js",
            this.appStaticPrefix + "/components/jquery.townpicker.min.js"
        ] , () => {
            $(".upload-handler").upload({ "accept" : "image/*" }) ;
            $("#citySelector").citypicker({
                "callback": (cityId) => {
                    $("#cityId").val(cityId) ;
                }
            }) ;
            $("#townSelector").townpicker({
                "controller" : this ,
                "callback": (data) => {
                    this.selectedTowns = data ;
                }
            });
        });
        $("#submit").click(() => {
            this.submit();
        });
    }
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    提交数据
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    submit() {
        let headPortrait = $(".head-portrait .upload-handler").attr("data-img") || "" ;
        let idCardPict = $(".idcard .upload-handler").attr("data-img") || "" ;
        let realname = $("input[name='realname']").val() ;
        if (realname) realname = $.trim(realname) ;
        let idCard = $("input[name='idCard']").val() ;
        if (idCard) idCard = $.trim(idCard) ;
        let cityId = $("#cityId").val() ;
        if (cityId) cityId = $.trim(cityId) ;
        let towns = this.selectedTowns ;
        let requestData = {
            "pic" : headPortrait ,
            "name" : realname ,
            "identity" : idCard ,
            "idcard" : idCardPict ,
            "cityId" : cityId ,
            "district" : JSON.stringify(towns) ,     // 这边有个问题 不把towns转成JSON字符串的话 传过去的参数是district[0].towns[0].id等,就是把数组拆分了
            "mobile" : $("input[name=tel]").val() ,
            "openId" : $("input[name=openId]").val(),
            "agentId" : $("input[name=agentId]").val(),
            "state": $("input[name=state]").val()
        } ;
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        数据校验
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        if ( ! headPortrait) {
            $.tips( "请上传您的头像！" , 3 ) ;
            return ;
        }
        if ( ! realname ) {
            $.tips( "请输入真实姓名！" , 3 ) ;
            return ;
        }
        if ( ! idCard ) {
            $.tips("请输入身份证号！" , 3 ) ;
            return ;
        }
        if ( ! idCardPict ) {
            $.tips("请上传身份证正面照！" , 3 ) ;
            return ;
        }
        if ( ! cityId ) {
            $.tips( "请选择城市！" , 3 ) ;
            return ;
        }
        if ( ! towns ) {
            $.tips( "请选择主营板块！" , 3 ) ;
            return ;
        }
        this.request( this.apiUrl.member.profileEdit , requestData , {
            type : "post" ,
            showLoadingTips : true,
            loadingTips : "请稍候...",
            successCallback : (data) => {
                $("body > .tips").remove();
                window.location.href = "/member/profile/result" ;
            },
            completeCallback: () => {
                $("#submit").css("pointer-events", "auto").text("提交");
            }
        }) ;
        $("#submit").css("pointer-events", "none").text("提交中...") ;
    }
}

/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
类的初始化
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
$(document).ready(function () {
    new ProfileEditController ;
}) ;