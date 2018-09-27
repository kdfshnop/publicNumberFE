/*-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 1. 项目名称：有房有客微信CDN框架
 2. 页面名称：amfe-flexible (移动端适配器)
 3. 作者：42547335@qq.com
 4. 备注：对api的依赖：jQuery
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
(function flexible (window, document) {
  var docEl = document.documentElement ;
  var dpr = window.devicePixelRatio || 1 ;

  // adjust body font size
  function setBodyFontSize () {
    if (document.body) {
      document.body.style.fontSize = (12 * dpr) + 'px' ;
    }
    else {
      document.addEventListener('DOMContentLoaded', setBodyFontSize) ;
    }
  }
  setBodyFontSize() ;

  // set 1rem = viewWidth / 10
  function setRemUnit () {
    var rem = docEl.clientWidth / 10 ;
    docEl.style.fontSize = rem + 'px' ;
  }

  setRemUnit() ;

  // reset rem unit on page resize
  window.addEventListener('resize', setRemUnit)
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      setRemUnit() ;
    }
  }) ;

  // detect 0.5px supports
  if (dpr >= 2) {
    var fakeBody = document.createElement('body') ;
    var testElement = document.createElement('div') ;
    testElement.style.border = '.5px solid transparent' ;
    fakeBody.appendChild(testElement) ;
    docEl.appendChild(fakeBody) ;
    if (testElement.offsetHeight === 1) {
      docEl.classList.add('hairlines') ;      
    }
    else docEl.classList.add('variantlines') ;
    docEl.removeChild(fakeBody)
  }
  else docEl.classList.add('variantlines') ;
}(window, document)) ;
