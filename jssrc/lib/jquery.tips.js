/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 1. 项目名称：有房有客微信CDN框架
 2. 页面名称：tips (jQuery扩展方法 - 提示)
 3. 作者：z42547335@qq.com
 4. 实例：
    $.tips("至少选择2项", 2, function(){ alert("提示看完了") ; }) ;
 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
$.tips = function(content, time, callback) {
    var $tips = $(document.createElement("DIV")).addClass("tips").html(content) ;
    var callbackMethod = callback || $.noop ;
    $(document.body).append($tips) ;    
    $tips.fadeIn(200) ;
    var tipsWidth = parseInt( $tips.css("width") , 10 ) ;
    var tipsHeight = parseInt( $tips.css("height") , 10 ) ;
    var left = ( $(window).width() - tipsWidth ) / 2 ;
    var top = ( $(window).height() - tipsHeight ) / 2 ;
    $tips.css({ "left" :  left + "px" , "top" : top + "px" }) ;      
    if(time) {        
        window.setTimeout(function(){
            $tips.remove() ;           
            callbackMethod() ;
        }, time * 1000) ;         
    }    
} ;