/* jshint asi:true */
//先等图片都加载完成
//再执行布局函数

/**
 * 执行主函数
 * @param  {[type]} function( [description]
 * @return {[type]}           [description]
 */
(function() {

  /**
     * 内容JSON
     */
  var demoContent = [
    {
      demo_link: 'http://likonion.club/vux-demo/dist/index.html#/',
      img_link: 'https://github.com/likonion/vux-demo/raw/master/static/QQ20170803-164135.png',
      code_link: 'https://github.com/likonion/vux-demo.git',
      title: 'vux-demo',
      core_tech: 'VUE VUX',
      description: '基于VUE构建，VUE UI控件的使用'
    }, {
      demo_link: 'http://likonion.club/chatDefault/dist/index.html#/',
      img_link: 'https://github.com/likonion/chatDefault/raw/master/static/default.png',
      code_link: 'https://github.com/likonion/chatDefault.git',
      title: 'chatDefault',
      core_tech: 'vue2 + vuex + vue-router + webpack + ES6/7 + mockjs + sass',
      description: '基于VUE的一个客服界面演示，练习'
    }, {
      demo_link: 'http://likonion.club/xmair_zhizhuang_mobile/dist/index.html#/index',
      img_link: 'https://raw.githubusercontent.com/likonion/xmair_zhizhuang_mobile/master/static/IMG_DED19AF17548-1.jpeg',
      code_link: 'https://github.com/likonion/xmair_zhizhuang_mobile',
      title: '制装劳保移动端界面',
      core_tech: 'VUE VUX',
      description: '制装劳保移动端界面'
    }, {
      demo_link: 'http://likonion.club/kendoui-demo/',
      img_link: 
      'https://github.com/likonion/kendoui-demo/raw/master/Snipaste_2017-12-29_16-51-11.png',
      code_link: 'https://github.com/likonion/kendoui-demo',
      title: 'kendoui-demo',
      core_tech: 'kendoui',
      description: 'kendoui 演示'
    }
  ];

  contentInit(demoContent) //内容初始化
  waitImgsLoad() //等待图片加载，并执行布局初始化
}());

/**
 * 内容初始化
 * @return {[type]} [description]
 */
function contentInit(content) {
  // var htmlArr = [];
  // for (var i = 0; i < content.length; i++) {
  //     htmlArr.push('<div class="grid-item">')
  //     htmlArr.push('<a class="a-img" href="'+content[i].demo_link+'">')
  //     htmlArr.push('<img src="'+content[i].img_link+'">')
  //     htmlArr.push('</a>')
  //     htmlArr.push('<h3 class="demo-title">')
  //     htmlArr.push('<a href="'+content[i].demo_link+'">'+content[i].title+'</a>')
  //     htmlArr.push('</h3>')
  //     htmlArr.push('<p>主要技术：'+content[i].core_tech+'</p>')
  //     htmlArr.push('<p>'+content[i].description)
  //     htmlArr.push('<a href="'+content[i].code_link+'">源代码 <i class="fa fa-code" aria-hidden="true"></i></a>')
  //     htmlArr.push('</p>')
  //     htmlArr.push('</div>')
  // }
  // var htmlStr = htmlArr.join('')
  var htmlStr = ''
  for (var i = 0; i < content.length; i++) {
    htmlStr += '<div class="grid-item">' + '   <a class="a-img" href="' + content[i].demo_link + '">' + '       <img src="' + content[i].img_link + '">' + '   </a>' + '   <h3 class="demo-title">' + '       <a href="' + content[i].demo_link + '">' + content[i].title + '</a>' + '   </h3>' + '   <p>主要技术：' + content[i].core_tech + '</p>' + '   <p>' + content[i].description + '       <a href="' + content[i].code_link + '">源代码 <i class="fa fa-code" aria-hidden="true"></i></a>' + '   </p>' + '</div>'
  }
  var grid = document.querySelector('.grid')
  grid.insertAdjacentHTML('afterbegin', htmlStr)
}

/**
 * 等待图片加载
 * @return {[type]} [description]
 */
function waitImgsLoad() {
  var imgs = document.querySelectorAll('.grid img')
  var totalImgs = imgs.length
  var count = 0
  //console.log(imgs)
  for (var i = 0; i < totalImgs; i++) {
    if (imgs[i].complete) {
      //console.log('complete');
      count++
    } else {
      imgs[i].onload = function() {
        // alert('onload')
        count++
        //console.log('onload' + count)
        if (count == totalImgs) {
          //console.log('onload---bbbbbbbb')
          initGrid()
        }
      }
    }
  }
  if (count == totalImgs) {
    //console.log('---bbbbbbbb')
    initGrid()
  }
}

/**
 * 初始化栅格布局
 * @return {[type]} [description]
 */
function initGrid() {
  var msnry = new Masonry('.grid', {
    // options
    itemSelector: '.grid-item',
    columnWidth: 250,
    isFitWidth: true,
    gutter: 20
  })
}
