/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 1. 项目名称：有房有客微信CDN框架
 2. 页面名称：article.js (文章列表页)
 3. 作者：douyadong@lifang.com
 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
 class articleController extends Controller {
     constructor(){
         super();
         this.pullload();
         this.tips();
     }
     // 上拉加载
    pullload() {
        let agentId=$.cookie('agentId')||'';
        let openId=$.cookie('openId');
        let env=$.cookie('env')||'dev';
        let yfykLink="";//文章预览页跳转至yfyk2h5_fe;
            switch(env){
                case "dev" :
                    yfykLink="http://localhost:8080" ;
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
        let self = this;
        require(["../components/async-item.min"],function(AsyncItem){
            self.AsyncItem = new AsyncItem({controller: self});
        });
        $("#list").pullload({
            apiUrl: this.apiUrl.member.articleList, 
            contentType:"application/json",
            requestType: "post",
            queryStringObject: {
                "conditionList":[
                    {
                        "fieldName":"openId",
                        "symbol":"eq",
                        "value":openId
                    }
                ]
            },
            traditional: true,
            pageSize: 10,
            threshold: 50,
            callback: function (data) {
                var str = '';
                if(data.data.data){
                    $.each(data.data.data, (index, item) => {
                        item.yfykLink=yfykLink;
                        item.agentId=agentId;
                        // 处理日期格式化;
                        let date=new Date(item.showTime);//根据返回时间戳获取时间,日期;
                        let td = new Date();//获取当前时间的时间戳;
                        let year = date.getFullYear();
                        let tYear = td.getFullYear();
                        let month = date.getMonth() + 1;
                        let tMonth = td.getMonth() + 1;
                        let strDate = date.getDate();
                        let tStrDate = td.getDate();
                        let hours = date.getHours();
                        let minutes = date.getMinutes();
                        if (month >= 1 && month <= 9) {
                            month = "0" + month;
                        };
                        if (strDate >= 0 && strDate <= 9) {
                            strDate = "0" + strDate;
                        };
                        if (tMonth >= 1 && tMonth <= 9) {
                            tMonth = "0" + tMonth;
                        };
                        if (tStrDate >= 0 && tStrDate <= 9) {
                            tStrDate = "0" + tStrDate;
                        };
                        if(minutes>=0 && minutes<=9){
                            minutes = "0" + minutes;
                        };
                        let currentTime;
                        if(year==tYear&&month==tMonth&&strDate==tStrDate){
                            currentTime=hours+":"+minutes;
                        }else if(year==tYear){
                            currentTime=month+'-'+strDate+' '+hours+":"+minutes;
                        }else{
                            currentTime=year+'-'+month+'-'+strDate+' '+hours+":"+minutes;
                        }
                        item.currentTime=currentTime;
                        str += self.AsyncItem.article(item);
                    });
                }
                $("#list").append(str);
            }
        })
    }
    // 文章采集提示框是否显示;
    tips(){
        let tips=window.localStorage.getItem('tips')||false;//智能采集文章提示框;
        if(tips){
            $('.tool').addClass('none');
        };
        $('.addArticle').click(function(){
            tips=window.localStorage.setItem('tips','true');
        })
    }
 };
 /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
类的初始化
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
$(document).ready(function(){
    new articleController ;
}) ;