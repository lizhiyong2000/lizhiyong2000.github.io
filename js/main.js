/**
 * some JavaScript code for this blog theme
 */
/* jshint asi:true */

/////////////////////////header////////////////////////////
/**
 * clickMenu
 */
(function () {
    if (window.innerWidth <= 770) {
        var menuBtn = document.querySelector('#headerMenu')
        var nav = document.querySelector('#headerNav')
        menuBtn.onclick = function (e) {
            e.stopPropagation()
            if (menuBtn.classList.contains('active')) {
                menuBtn.classList.remove('active')
                nav.classList.remove('nav-show')
            } else {
                nav.classList.add('nav-show')
                menuBtn.classList.add('active')
            }
        }
        document.querySelector('body').addEventListener('click', function () {
            nav.classList.remove('nav-show')
            menuBtn.classList.remove('active')
        })
    }
}());

//////////////////////////back to top////////////////////////////
(function () {
    var backToTop = document.querySelector('.back-to-top')
    var backToTopA = document.querySelector('.back-to-top a')
    // console.log(backToTop);
    window.addEventListener('scroll', function () {

        // 页面顶部滚进去的距离
        var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop)

        if (scrollTop > 200) {
            backToTop.classList.add('back-to-top-show')
        } else {
            backToTop.classList.remove('back-to-top-show')
        }
    })

    // backToTopA.addEventListener('click',function (e) {
    //     e.preventDefault()
    //     window.scrollTo(0,0)
    // })
}());


//////////////////////////scrollPos//////////////////////////////
(function () {
    if (document.getElementById('content-side')) {
        
        var $navs = document.getElementById('content-side').querySelectorAll('a'),          // 导航
            $sections = document.querySelector('.left').querySelectorAll('h2,h3,h4,h5');       // 模块 h1为文章标题
        window.onscroll = function (e) {
            e.stopPropagation()
            var scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;

            function getOffset(el) {
                const box = el.getBoundingClientRect();
                return {
                    top: box.top + window.pageYOffset - document.documentElement.clientTop,
                    left: box.left + window.pageXOffset - document.documentElement.clientLeft
                }
            }
            for (let i = 0; i < $navs.length ; i++) {
                var that = $sections[i];
                if (scrollTop >= getOffset(that).top - 50) {
                    // 高亮目录
                    $navs.forEach(function (e) {
                        e.closest('li').classList.remove('current')
                    })
                    $navs[i].closest('li').classList.add('current')
                    // 右边目录根据滚动定位
                    var navATop = $navs[i].offsetTop // 高亮目录距离顶部的距离
                        navBox = document.getElementById('content-side'),
                        navBoxClientHeight = navBox.clientHeight, // 目录容器可见区域的高度
                        navBoxScrollTop = navBox.scrollTop; // 目录容器顶部被隐藏的高度
                        // navBoxScrollHeight = navBox.scrollHeight; // 目录容器总高度
                    if (navATop >= navBoxClientHeight) {
                        navBox.scrollTop = navATop - navBoxClientHeight / 2 // 保证高亮目录在目录容器可见区域的中间位置
                    } else {
                        navBox.scrollTop = 0
                    }
                }
            }
        }
    }
}());

// 设置图片说明宽度
(function () {
    var img_instructions = document.querySelectorAll('.img-instructions');
    var timer = setInterval(function () {
        var imgLoadComplete = true; // 图片是否全部加载完成
        for (var i = 0; i < img_instructions.length; i++) {
            var img = img_instructions[i].previousElementSibling.querySelectorAll('img')[0];
            if (img.complete) {
                var imgBoxWidth = img.clientWidth;
                img_instructions[i].style.width = imgBoxWidth - 10 + 'px';
            } else {
                imgLoadComplete = false;
            }
        }
        if (imgLoadComplete) {
            clearInterval(timer)
        }
    }, 500)

       
        
})()