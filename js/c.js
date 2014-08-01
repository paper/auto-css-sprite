var $canvas = $("#J-canvas");
var canvas = $canvas[0];
var c_width = canvas.width;
var c_height = canvas.height;
var ctx = canvas.getContext("2d");

var $box = $("#J-drag-box");
var $tip = $("#tip");
var $btnsWrap = $("#J-btns-wrap");
var $spriteCssWrap = $("#J-sprite-css-wrap");

var $spriteCssTextarea = $("#J-sprite-css");
var spriteCss = "";
var spriteHtml = "";
var spriteDemo = "";

// 拖进来的图片
var images = [];

var canvasImageName = 'canvas.png';

$(document).on({
  dragleave : function($e){
    $e.preventDefault();
  },
  
  drop : function($e){
    $e.preventDefault();
  },
  
  dragenter : function($e){
    $e.preventDefault();
  },
  
  dragover : function($e){
    $e.preventDefault();
  }
  
});

var changeCanvasColor = (function(){
  var i = 0;
  
  return function(){
    i++;
    
    if( i%2 == 0 ){
      $canvas.css("background-color", "#fff");
    }else{
      $canvas.css("background-color", "#000");
    }
  }
  
})();

// 保存图片
function saveImageInfo(){
  var data = canvas.toDataURL("image/png"); 
  var imageSrc;
  
  // https://code.google.com/p/chromium/issues/detail?id=373182#c15
  // Patch to fix chrome dataurl download name bug
  var myimgURL = data;
  var data = atob( myimgURL.substring( "data:image/png;base64,".length ) );
  var asArray = new Uint8Array(data.length);

  for( var i = 0, len = data.length; i < len; ++i ) {
    asArray[i] = data.charCodeAt(i);    
  }
  var blob = new Blob( [ asArray.buffer ], {type: "image/png"} );
  myimgURL =  URL.createObjectURL(blob);
  // End Patch
  
  imageSrc = myimgURL;
  
  var title =  'Image from canvas';
  var imgWindow = window.open(); 
  
  imgWindow.document.write('<a title="点击保存图片" href="'+ imageSrc +'" download="'+ canvasImageName +'"><img src="'+ imageSrc +'" download="'+ canvasImageName +'"></a>'); 
  imgWindow.document.title = title;
}

// 移到到 dragBox 上面
function boxDropStart(){
  $tip.show();
  $box.hide();
  $btnsWrap.hide();
  $spriteCssWrap.hide();
}

// 离开  dragBox
function boxDropOver(){
  $tip.fadeOut();
  $box.show().removeClass("drag-box-hover");
  $btnsWrap.show();
  $spriteCssWrap.show();
}

function getImage(url, callback){
  var img = document.createElement("img");
  img.onload = function(){
    callback && callback(img);
  }
  
  img.src = url;
}

function drawImage(url, x, y){
  x = x || 0;
  y = y || 0;
  
  getImage(url, function(img){
    var w = img.width;
    var h = img.height;
    
    ctx.drawImage(img, x, y, w , h);
  });
}

function reset(){
  images = [];
  canvas.width = c_width;
  canvas.height = c_height;
}

$canvas.on("contextmenu", function($e){
  return false;
});

$box.on({
  dragenter : function($e){
    $e.preventDefault();
    $box.addClass("drag-box-hover");
  },
  
  dragleave : function($e){
    $e.preventDefault();
    $box.removeClass("drag-box-hover");
  },
  
  drop : function($e){
    //jq 事件里面的 e，是进行封装过的。获取原始的event，需要使用 originalEvent 方法
    
    var e = $e.originalEvent;

    e.preventDefault();

    //获取文件列表
    var fileList = e.dataTransfer.files;
    
    // console.log(fileList);
    // lastModified  Date  Date {Mon Jul 21 2014 12:02:04 GMT+0800}
    // mozFullPath   E:\Page\canvas_png\h4.png"
    // name          "h4.png"
    // path          ""
    // size          30476 
    // type          "image/png"
    if (fileList.length == 0 || fileList[0].type.indexOf('image') === -1) {
      alert('请拖入图片');
      boxDropOver();
      return;
   }
    
    boxDropStart();
    
    reset();
    
    for(var i=0; i<fileList.length; i++){
      (function(){
        var file = fileList[i];
        
        var img_name = file.name;
      　var reader = new FileReader();
      　var img = document.createElement('img');

      　reader.onload = function(e) {
          img.onload = function(){
            img.name = img_name;
            //console.log(img.name);
            images.push([img, img.width, img.height]);
          };
        
      　　img.src = this.result;
      　};
      　reader.readAsDataURL(file);
      
      })();
    }
    
    //后续再判断如果加载完毕，再
    setTimeout(function(){
      
      var demo = [];
      
      images.forEach(function(v){
        demo.push( [ v[1], v[2] ] );
      });
      
      var t1 = +new Date();
      
      FORP(demo, function(nice){
        boxDropOver();
        
        var t2 = +new Date();
        
        console.log("消耗的时间：",  t2 - t1 );
        console.log( "最佳利用率：",  nice.u );
        console.log( nice );
        
        var r = nice.r;
        var u = nice.u;
        
        // 后面获取图片的真实宽高，需要剪掉这个space
        var space = nice.space;
        
        canvas.width = nice.w;
        canvas.height = nice.h;
        
        console.log(images)
        
        var d1 = parseInt(Math.random()*1000, 10) + "";
        var d2 = parseInt(Math.random()*1000, 10) + "";
        canvasImageName = 'auto-css-sprite-'+ d1 + d2 +'.png';
        
        
        
        //画图
        for(var i=0; i<r.length; i++){
          var temp = r[i];
          var p = temp.p;
          
          var img = images[p][0];
          ctx.drawImage(img, temp.x, temp.y);
          
          var img_name = img.name.replace(/[^\w-]/g, "_");
          
          var classname = 'auto-css-sprite-'+ img_name;
          
          spriteCss += '.'+ classname +'{'+
            'display:inline-block;'+
            'width:'+ (temp.w - space) +'px;'+
            'height:'+ (temp.h - space) +'px;'+
            'background-image:url('+ canvasImageName +');'+
            'background-repeat:no-repeat;'+
            'background-position:-'+ temp.x +'px -'+ temp.y +'px;'+
          '}\n';
          
          spriteHtml += '<span class="'+ classname +'"></span>';
          
        }
        
        spriteDemo = '<!doctype html>'+
          '<html lang="en">'+
          '<head>'+
            '<meta charset="UTF-8">'+
            '<title>Auto css sprite demo</title>'+
            '<style> span{margin:10px;} '+ spriteCss +'</style>'+
          '</head>'+
          '<body>'+ spriteHtml +'</body>'+
          '</html>';
        
        $spriteCssTextarea.val('').val(spriteDemo);
        
      });
      
      
      
    }, 500);
  }
});











