/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 1. 项目名称：有房有客微信CDN框架
 2. 页面名称：articlePublish.js (发布文章页)
 3. 作者：douyadong@lifang.com
 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
 class articlePublishController extends Controller {
     constructor(){
         super();
         this.createArticle();
     }
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    生成文章
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    createArticle(){
        let self=this;
        let link="mp.weixin.qq.com";
        let agentId=$.cookie('agentId');
        let openId=$.cookie('openId');
        $('.article-link>input').on('input',function(){
            if($('.article-link>input').val()){
                $('.article-link>.clear').show();
            }else{
                $('.article-link>.clear').hide();
            }
        });
        $('.article-link>.clear').click(function(){
            $('.article-link>input').val('');
            $('.article-link>.clear').hide();
        });
        $('.key>.btn').click(function(){
            let origin=$('.article-link>input').val();
            origin=$.trim(origin);
            if(!origin){
                $.tips('地址不能为空',2);
                return;
            }else if(origin.indexOf(link)<=-1){
                $.tips('地址格式不正确',2);
                return;
            }else{
                // 发送请求;
                $('.key>.btn').attr('disabled',true);
                self.request(self.apiUrl.member.publishArticleCount,{origin,openId},{
                    successCallback:function(data){
                        // $('.key>.btn').attr('disabled',false);
                        self.request(self.apiUrl.member.publishArticleSuccess,{origin,openId},{
                            successCallback:function(data){
                                // $.cookie('id',data.data.id);//文章id;
                                location.href="/member/article/reprint?id="+data.data.id;
                            }
                        }) 
                    },
                    errorCallback:function(data){
                        $('.key>.btn').attr('disabled',false);
                        $.tips(data.message,2);
                    },
                    exceptionCallback:function(data){
                        $('.key>.btn').attr('disabled',false);
                    }
                });
            }
        });
    }
 }
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
类的初始化
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
$(document).ready(function(){
    new articlePublishController ;
}) ;