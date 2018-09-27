/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 1. 项目名称：有房有客微信CDN框架
 2. 页面名称：articleReprint.js (发布文章页)
 3. 作者：douyadong@lifang.com
 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
 class articleReprintController extends Controller {
    constructor(){
        super();
        this.publish();
    }
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    修改文章标题
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    publish(){
        let self=this;
        let id=this.getQuery('id');
        let openId=$.cookie('openId');
        let agentId=$.cookie('agentId')||100638;
        document.title="转载文章";
        setTimeout(function(){
            window.document.title="转载文章";
        },2000);
        let yfykLink='';
        let env=$.cookie('env')||'dev';
        switch(env){
            case "dev" :
                yfykLink="localhost:8080" ;
                break;
            case "test" :
                yfykLink="//m.test.wkzf" ;
                break ;
            case "sim" :
                yfykLink="//m.sim.wkzf" ;
                break ;
            case "prod" :
                yfykLink="https://m.wkzf.com" ;
                break ;
        };
        $('.publish .btn').click(function(){
            $(this).attr('disabled',true);
            let title=$('ul .edit-title').text();
            self.request(self.apiUrl.member.articlePreview,{id,openId,title},{
                //type:"POST",
                successCallback:function(data){
                    location.href=yfykLink+"/yfyk365/wechat/hybrid?openId="+openId+"&id="+id+"&agentId="+agentId+"&share=false";
                },
                errorCallback:function(err){
                    $('.publish .btn').attr('disabled',false);
                },
                exceptionCallback:function(data){
                    $('.publish .btn').attr('disabled',false);
                }
            })
        });
    }
    getQuery(name){
　      var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);//从?之后开始匹配如getQuery(courseid)返回一个数组["courseid=8","","8","&",index:0,input:"courseid=8"]
        if (r!=null) return unescape(r[2]); return null;
    }
 };
 /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
类的初始化
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
$(document).ready(function(){
    new articleReprintController ;
}) ;