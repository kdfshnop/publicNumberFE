/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 1. 项目名称：有房有客微信CDN框架
 2. 页面名称：upload (jQuery插件 - 文件上传)
 3. 作者：zhaohuagang@lifang.com
 4. 实例：
    $(".portrait-uploader").upload({
        "accept" : "image/jpg,image/jpeg,image/png,image/gif"
    }) ;
 5. 在一个容器内增加文件上传缩略图及句柄
 -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
(function ($) {
    $.fn.upload = function (options) {
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        将每个upload加上对应的配置属性
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        var opts = $.extend({}, $.fn.upload.defaults, options);
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
         执行事件添加后返回
         -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        return this.each(function () {
            $.fn.upload.generate(this, opts);
        });
    };
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    绘制相应的dom节点
    -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    $.fn.upload.generate = function (container, opts) {
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        绘制上传句柄
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        var $input = $(document.createElement("INPUT")).addClass("uploader-input").attr("type", "file").attr("accept", opts.accept);
        // if(navigator.userAgent.indexOf("iPhone") < 0) {
        //     $input.attr("capture","camera");
        // }
        $(container).append($input);
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        当上传句柄文件域值改变的时候触发事件监听
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        $input.change(function () {
            // var reader = new FileReader();
            // reader.readAsDataURL(this.files[0]);
            // reader.onload = function () {
            //     // $(container).css({ "background-image": "url(" + this.result + ")" }).attr("data-img", encodeURIComponent(this.result.split(",")[1]));
            //     $(container).find(".upload-placeholder").remove();
            // };
            selectFileImage(this,container);
        });
    };
    function selectFileImage(fileObj,container) {
        var file = fileObj.files['0'];
        //图片方向角 added by lzk
        var Orientation = null;
        if (file) {
            console.log("正在上传,请稍后...");
            var rFilter = /^(image\/jpeg|image\/png)$/i; // 检查图片格式
            if (!rFilter.test(file.type)) {
                //showMyTips("请选择jpeg、png格式的图片", false);
                return;
            }
            // var URL = URL || webkitURL;
            //获取照片方向角属性，用户旋转控制
            EXIF.getData(file, function () {
                // alert(EXIF.pretty(this));
                EXIF.getAllTags(this);
                //alert(EXIF.getTag(this, 'Orientation')); 
                Orientation = EXIF.getTag(this, 'Orientation');
                //return;
            });

            var oReader = new FileReader();
            oReader.onload = function (e) {
                var image = new Image();
                image.src = e.target.result;
                image.onload = function () {
                    var expectWidth = this.naturalWidth;
                    var expectHeight = this.naturalHeight;
                    if (this.naturalWidth > this.naturalHeight && this.naturalWidth > 800) {
                        expectWidth = 800;
                        expectHeight = expectWidth * this.naturalHeight / this.naturalWidth;
                    } else if (this.naturalHeight > this.naturalWidth && this.naturalHeight > 1200) {
                        expectHeight = 1200;
                        expectWidth = expectHeight * this.naturalWidth / this.naturalHeight;
                    }
                    var canvas = document.createElement("canvas");
                    var ctx = canvas.getContext("2d");
                    canvas.width = expectWidth;
                    canvas.height = expectHeight;
                    ctx.drawImage(this, 0, 0, expectWidth, expectHeight);
                    var base64 = null;
                    //修复ios
                    if (navigator.userAgent.match(/iphone/i)) {
                        // console.log('iphone');
                        //alert(expectWidth + ',' + expectHeight);
                        //如果方向角不为1，都需要进行旋转 added by lzk
                        if (Orientation != "" && Orientation != 1) {
                            // alert('旋转处理');
                            switch (Orientation) {
                                case 6://需要顺时针（向左）90度旋转
                                    // alert('需要顺时针（向左）90度旋转');
                                    rotateImg(this, 'left', canvas);
                                    break;
                                case 8://需要逆时针（向右）90度旋转
                                    // alert('需要顺时针（向右）90度旋转');
                                    rotateImg(this, 'right', canvas);
                                    break;
                                case 3://需要180度旋转
                                    // alert('需要180度旋转');
                                    rotateImg(this, 'right', canvas);//转两次
                                    rotateImg(this, 'right', canvas);
                                    break;
                            }
                        }
                    } 
                    base64 = canvas.toDataURL("image/jpeg", 0.8);
                    $(container).css({ "background-image": "url(" + base64 + ")" }).attr("data-img", encodeURIComponent(base64.split(",")[1]));
                    $(container).find(".upload-placeholder").remove();
                };
            };
            oReader.readAsDataURL(file);
        }
    }
    //对图片旋转处理 added by lzk
    function rotateImg(img, direction, canvas) {
        //alert(img);
        //最小与最大旋转方向，图片旋转4次后回到原方向  
        var min_step = 0;
        var max_step = 3;
        //var img = document.getElementById(pid);  
        if (img == null) return;
        //img的高度和宽度不能在img元素隐藏后获取，否则会出错  
        var height = img.height;
        var width = img.width;
        //var step = img.getAttribute('step');  
        var step = 2;
        if (step == null) {
            step = min_step;
        }
        if (direction == 'right') {
            step++;
            //旋转到原位置，即超过最大值  
            step > max_step && (step = min_step);
        } else {
            step--;
            step < min_step && (step = max_step);
        }
        //img.setAttribute('step', step);  
        /*var canvas = document.getElementById('pic_' + pid);  
        if (canvas == null) {  
            img.style.display = 'none';  
            canvas = document.createElement('canvas');  
            canvas.setAttribute('id', 'pic_' + pid);  
            img.parentNode.appendChild(canvas);  
        }  */
        //旋转角度以弧度值为参数  
        var degree = step * 90 * Math.PI / 180;
        var ctx = canvas.getContext('2d');
        switch (step) {
            case 0:
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0);
                break;
            case 1:
                canvas.width = height;
                canvas.height = width;
                ctx.rotate(degree);
                ctx.drawImage(img, 0, -height);
                break;
            case 2:
                canvas.width = width;
                canvas.height = height;
                ctx.rotate(degree);
                ctx.drawImage(img, -width, -height);
                break;
            case 3:
                canvas.width = height;
                canvas.height = width;
                ctx.rotate(degree);
                ctx.drawImage(img, -width, 0);
                break;
        }
    }
    /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
     upload默认配置
     -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
    $.fn.upload.defaults = {
        /*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
        可以接受的文件扩展名列表，用半角逗号隔开，默认是上传图片，值为：image/jpg,image/jpeg,image/png,image/gif
        -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        "accept": "image/jpg,image/jpeg,image/png,image/gif"
    };
})(jQuery);