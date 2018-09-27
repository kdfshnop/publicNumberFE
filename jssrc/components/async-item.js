/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 1. 项目名称：yf2wechat
 2. 页面名称：components -> async-item(异步 文章等条目)
 3. 作者：douyadong@lifang.com
 4. 备注：
    
 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
 class AsyncItem{
     constructor({controller}){
         this.controller=controller;
     }
     /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    绘制文章条目
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    article(item){
        let result=`
            <a href="${item.yfykLink}/yfyk365/wechat/hybrid?agentId=${item.agentId}&share=false" class="article-info padding-lr superfine-border-top-fence relative">
                <div>
                    <p class="info-title">${item.shareTitle}</p>
                    <p class="time"> ${item.currentTime}</p>
                </div>
                <img src="${item.shareImageUrl}" alt="">
            </a>
        `;
        return result ;
    }
 };
 define([], function() {
     return AsyncItem ;
 });