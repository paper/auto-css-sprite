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

// canvas 背景反转
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

function checkImagesAllLoaded(images, fileListLength, callback ){
  if( images.length == fileListLength ){
    callback && callback();
  }
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
    // jq 事件里面的 e，是进行封装过的
    // 想要获取原始的event，需要使用 originalEvent
    var e = $e.originalEvent;
    e.preventDefault();

    //获取文件列表
    var fileList = e.dataTransfer.files;
    var fileListLength = fileList.length;
    
    // console.log(fileList);
    // 简单检测一下
    if (fileList.length == 0 || fileList[0].type.indexOf('image') === -1) {
      alert('请拖入图片');
      boxDropOver();
      return;
    }
    
    boxDropStart();
    
    reset();
    
    for(var i=0; i<fileListLength; i++){
      (function(){
        var file = fileList[i];

        var imgName = file.name;
        var reader = new FileReader();
        var img = document.createElement('img');

        reader.onload = function(){
        
          img.onload = function(){
            img.name = imgName;
            images.push([img, img.width, img.height]);
            
            checkImagesAllLoaded(images, fileListLength, function(){
              imagesAllLoadedCallback();
            });
            
          };

          img.src = this.result;
          
        };
        
        reader.readAsDataURL(file);

      })();
    }//end fileList for
    
    function imagesAllLoadedCallback(){

      var demo = [];
      
      images.forEach(function(v){
        demo.push( [ v[1], v[2] ] );
      });
      
      var t1 = +new Date();
      
      FORP(demo, function(nice){
        boxDropOver();
        
        var t2 = +new Date();

        console.log("消耗的时间：" + (t2 - t1) );
        console.log( "最佳利用率：",  nice.u );
        //console.log( nice );
        
        var r = nice.r;
        var u = nice.u;
        
        // 后面获取图片的真实宽高，需要剪掉这个space
        var space = nice.space;
        
        canvas.width = nice.w;
        canvas.height = nice.h;
        
        // auto-css-sprite
        var prefix = "acs-";
        
        var now = new Date();
        var d1 = parseInt(Math.random()*10000, 10) + "-";
        var d2 = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate(); 
        canvasImageName = prefix + d1 + d2 + '.png';
        
        //画图
        for(var i=0, len=r.length; i<len; i++){
          var temp = r[i];
          var p = temp.p;
          
          var img = images[p][0];
          var name = img.name;
          
          ctx.drawImage(img, temp.x, temp.y);
          
          var imgName = name.replace(/[^\w-]/g, "_");
          
          var classname = prefix + imgName;
          
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
          '<html>'+
          '<head>'+
            '<meta charset="UTF-8">'+
            '<title>Auto CSS Sprite Demo</title>'+
            '<style> span{margin:10px;} '+ spriteCss +'</style>'+
          '</head>'+
          '<body>'+ spriteHtml +'</body>'+
          '</html>';
        
        // 生成demo代码
        $spriteCssTextarea.val('').val(spriteDemo);
        
      });
      
    }//end imagesAllLoadedCallback

  }
});











