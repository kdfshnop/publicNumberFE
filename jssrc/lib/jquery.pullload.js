/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
1. 插件名称：pullload
2. 插件描述：拖动加载数据
3. 版本：1.0
4. 原理：判断滚动条的位置是否达到指定目标的在页面中的位置的X或者Y值临界值，以此为依据来触发Ajax请求
5. 使用范例：  
    
6. 未尽事宜：
7. 作者：zhaohuagang@guanaihui.com
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
// function appendError (text, color){
//     var $errorPanel = $('.error-panel');
//     if($errorPanel.length == 0){
//         $errorPanel = $('<div class="error-panel" style="background-color: #fff; top: 0; overflow: auto; position: fixed; z-index:100; height: 100px; width: 100%"></div>').appendTo('body');                    
//     }
//     $errorPanel.append("<p style='background-color:"+(color?"green":"#fff")+"'>"+text + "</p>");
// }

(function($) {
    $.fn.pullload = function(options) {
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        合并配置属性
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        var opts = $.extend({}, $.fn.pullload.defaults, options) ;        
        return this.each(function() {
            var self = this ;
            /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
            首先把容器节点的可以请求数据设置为true，表示允许开始请求，一旦请求开始，这个属性将被设置为false，表示在请求数据后执行接口事件过程中不能继续请
            求，一定要等接口事件完毕才能继续请求，否则计算容器最后一个节点的位置会出现偏差
            -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            $(this).attr("data-requestable", "true") ;
            /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
            然后给句柄绑定事件
            -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
            function eventHandler() {                
                /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                取得页面滚动条位置
                -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                var height = $(window).height() ;
                var scrollTop = $(window).scrollTop() ;
                /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                取得容器内最后一个元素和发生加载滚动距离需要达到的数值
                -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                var $lastEl = $(self).children().last() ;
                var offset = $lastEl.height() + $lastEl.offset().top - opts.threshold ;
                /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                满足条件就触发请求
                -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                // appendError("condition: " +( (height + scrollTop) > offset && $(self).attr("data-requestable") == "true") + ", $1:" + ( (height + scrollTop) > offset ) + "," +("height:" + height + ",scrollTop:" + scrollTop + ", offset:" + offset) + ", $2:" + $(self).attr("data-requestable"), (height + scrollTop) > offset && $(self).attr("data-requestable") == "true");
                
                if ( (height + scrollTop) > offset && $(self).attr("data-requestable") == "true") $.fn.pullload.request(self, opts) ;
                
            }

            $(opts.handler).on("scroll.pullload", eventHandler);

            // $(this).on("enable", function(){                
            //     console.log('enable...');
            //     $(opts.handler).on("scroll.pullload", eventHandler);// 重新绑定scroll事件处理函数
            //     $('.' + opts.tipsClassName).remove();
            //     $(self).attr('data-requestable', 'true');
            // }).on("disable", function(){
            //     console.log('disable...');
            //     $('.' + opts.tipsClassName).remove();
            //     $(opts.handler).off("scroll.pullload");
            // }) ;
        }) ;
    } ;

    $.fn.pullload.request = function(container, opts) {
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        并将允许请求状态设置为false ;
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        $(container).attr("data-requestable", "false") ;
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        明确化几个参数
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        var apiDataType = opts.crossDomain ? "jsonp" : "json" ;
        var requestType = opts.crossDomain ? "GET" : opts.requestType ;
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        设置请求的时候附带的参数数据
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/        
        var requestParams = {} ;
        // 支持函数形式
        if(opts.queryStringObject){
            if(typeof opts.queryStringObject === 'function'){
                requestParams = opts.queryStringObject();
            }else{
                requestParams = opts.queryStringObject;
            }
        }
        if(opts.itemClass){
            requestParams[opts.pageIndexKey] = $(container).children(opts.itemClass).size() ;
        }else{
            requestParams[opts.pageIndexKey] = $(container).children().size() ;    
        }
        //requestParams[opts.pageIndexKey] = $(container).children().size() ;
        requestParams[opts.pageSizeKey] = opts.pageSize ;

        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        根据 traditional 是否为true 防止post深度序列化数组
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        var traditional = opts.traditional ;

        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        一旦请求开始，状态条就要开启
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        $.fn.pullload.tips(opts.loadingTips, container, opts) ;        
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        整个请求过程用try-catch块包起来
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/        
        try {   
            // let声明在代码块内有效;
            let contentType=null;    
            if(opts.contentType){
                // 数据为复杂对象(多级嵌套)时的处理
                requestParams=JSON.stringify(requestParams);
                contentType=opts.contentType;
            }else{
                contentType="application/x-www-form-urlencoded";
            };   
            $.ajax({
                url : opts.apiUrl ,
                type : requestType ,
                contentType:contentType,
                dataType : apiDataType ,
                data : requestParams ,
                traditional: traditional,
                timeout : 30 * 1000 ,
                success : function(data) {
                    if( data.status.toString() !== "1" ) {
                        $.fn.pullload.tips( opts.loadFailedTips , container , opts ) ;
                        return ;
                    }
                    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                    先执行回调函数
                    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                    if (opts.callback) opts.callback(data) ;                    
                    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                    再判断数据是否加载完毕，如果加载完毕还要off掉window的事件
                    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                    if (data.data[opts.countKey] === undefined) {
                        $.fn.pullload.tips("您的数据接口好像没有给出总条数嘛！", container, opts) ;
                        return ;
                    }
                    if (data.data[opts.countKey] <= $(container).children().size()) {
                        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                        给出数据加载完毕提示信息
                        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                        $.fn.pullload.tips(opts.lastLoadedTips, container, opts) ;                            
                        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                        off事件处理
                        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                        $(opts.handler).off("scroll.pullload") ;
                    }
                    else {
                        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                        只有还有数据继续请求的时候，才将允许请求状态设置为true ;
                        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                        $(container).attr("data-requestable", "true") ;
                        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
                        关闭提示信息
                        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
                        $.fn.pullload.closeTips(container, opts) ;                        
                    } 
                } ,
                error : function(e) {
                    $.fn.pullload.tips(opts.loadFailedTips, container, opts) ; 
                }
            })

        } catch (e) {
            $.fn.pullload.tips("错误名称：" + e.name + "\n错误描述：" + e.message) ;
        }
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        整个try-catch块结束
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    } ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    显示状态提示信息，如果提示框还没创建就先创建
    如果是错误提示，要绑事件重新加载，否则要卸载事件
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    $.fn.pullload.tips = function(html, container, opts) {        
        if ($(container).next("." + opts.tipsClassName).size() === 0) $(container).after("<div class=\"" + opts.tipsClassName + "\"></div>") ;
        var $tipsBar = $(container).next("." + opts.tipsClassName) ;
        $tipsBar.html(html) ;
        if( html == opts.loadFailedTips ) {
            $tipsBar.click(function(){
                $.fn.pullload.request(container, opts) ;
            }) ;
        }
        else $tipsBar.off() ;        
        $tipsBar.slideDown(100) ;
    } ;
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    关闭状态提示信息
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    $.fn.pullload.closeTips = function(container, opts) {
        $(container).next("." + opts.tipsClassName).slideUp(100) ;
    } ;    
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    pullload默认配置
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    $.fn.pullload.defaults = {
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        拉动对象，默认是window，也可以是其他容器
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        handler : window ,        
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        提供数据进行异步加载的Ajax数据接口API地址
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        apiUrl : "" ,
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        除了pageIndex和pageSize，其他的queryString对象
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        queryStringObject : {} ,
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        接口是否跨域，这直接决定了接口的返回格式是json还是jsonp
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        crossDoman : false ,
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        请求类型，可以是：GET | POST，如果crossDomain="jsonp"，那请求肯定是GET类型
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        requestType : "GET" ,
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        接收到数据后的进行dom绘制的回调函数
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        callback : null ,        
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        向后端 请求的时候，从第几条记录开始参数key，0开始，默认为pageIndex
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        pageIndexKey : "pageIndex" ,
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        向后端 请求的时候，每页请求多少条参数key，默认为pageSize
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        pageSizeKey : "pageSize" ,
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        向后端 请求的时候，每次请求多少条，默认20
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        pageSize : 20 ,
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        接口返回的总共多少条记录在json返回串中的key，这个key应该在返回串第一级key中
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        countKey : "count",
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        数据加载提示容器的class
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        tipsClassName : "data-status" ,        
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        数据加载中提示html内容，dom会贴到整个容器后面
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        loadingTips : "<img src='https://img.wkzf.com/9f5c53fb33cc42ee9631e5d07a8bbe0e.gif'>数据加载中..." ,
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        数据加载到最后一条提示html内容
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        lastLoadedTips : "已经加载到最后一页！" ,
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        数据加载失败提示html内容
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        loadFailedTips : "加载失败，点击重新加载" ,        
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        滚动到离容器底部多少距离就触发请求后端
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        threshold : 0,
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        post请求在数组中深度序列化的问题   可以通过设置traditional 为true阻止深度序列化
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        traditional: false,
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        每个元素的类
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        itemClass: ""//比如.esf-item,.xf-item
    } ;
})(jQuery) ;