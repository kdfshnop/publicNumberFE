/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 1. 项目名称：有房有客微信CDN框架
 2. 页面名称：index.js (个人中心)
 3. 作者：tll
 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
 class IndexController extends Controller {
    constructor() {
       super();
       document.title = "个人中心";    // 设置标题
    }
}
/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
类的初始化
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
$(document).ready(function(){
   new IndexController();
})