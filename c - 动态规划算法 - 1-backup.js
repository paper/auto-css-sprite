var canvas = document.getElementById("J-canvas");
var c_width = canvas.width;
var c_height = canvas.height;

var ctx = canvas.getContext("2d");
var box = document.getElementById("J-drag-box");

var _max = Math.max;
var _min = Math.min;
var _abs = Math.abs;

document.addEventListener("dragleave", function(e){
  e.preventDefault();
});
document.addEventListener("drop", function(e){
  e.preventDefault();
});
document.addEventListener("dragenter", function(e){
  e.preventDefault();
});
document.addEventListener("dragover", function(e){
  e.preventDefault();
});

/*---------------------------------------------------------------*/

var images = [];
//图片间隔
var img_space = 0;

function getImage(url, callback){
  var img = document.createElement("img");
  img.onload = function(){
    callback && callback(img);
  }
  
  img.src = url;
}

function getImages(url){
  //console.log(url);
  getImage(url, function(img){
    var w = img.width;
    var h = img.height;
    
    images.push( [url, w, h] );
  });
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
  
  ctx.rect(0, 0, c_width, c_height);
  ctx.fillStyle = "#fff";
  ctx.fill();
}


box.addEventListener("drop", function(e){
  e.preventDefault();
  
  //获取文件列表
  var fileList = e.dataTransfer.files;
  
  //console.log(fileList);
    
    
  // lastModified  Date  Date {Mon Jul 21 2014 12:02:04 GMT+0800}
  // mozFullPath   E:\Page\canvas_png\h4.png"
  // name          "h4.png"
  // path          ""
  // size          30476 
  // type          "image/png"
  
  if (fileList.length == 0) {return;}
  if (fileList[0].type.indexOf('image') === -1) {return;}
  
  reset();
  
  for(var i=0; i<fileList.length; i++){
    (function(){
      
    　var reader = new FileReader();
    　var img = document.createElement('img');

    　reader.onload = function(e) {
        img.onload = function(){
          images.push([img, img.width, img.height]);
        }
      
    　　img.src = this.result;
    　}
    　reader.readAsDataURL(fileList[i]);
    
    })()
  }
  
  //后续再判断如果加载完毕，再
  setTimeout(function(){
    //console.log(images);
    
    //float 算法
    
    //大图排序
    //面积从左到右
    
    
    function sortImg(r){
      var result = [];
      var r = r.concat();

      function fn(){
        if( r.length == 1 ){
          result.push(r[0]);
          return;
        }
        
        var max = 0;
        var j = 0;
        
        for(var i=0;i<r.length;i++){
          var temp = r[i];
          var s = temp[1] * temp[2];
          
          if( max < s ){
            max = s;
            j = i;
          }
        }
        
        result.push(r[j]);
        r.splice(j, 1);
        
        fn();
      }
      
      fn();
      
      return result;
      
    }
    
    var images2 =  sortImg(images).reverse();
    //console.log( images2 );
    //var imagedataR = [];
    
    //找到面积尽量小的，边框尽量接近的2个图片
    function findTwoMiniBoxes(){

      
      if( images2.length <= 1 ) return;

      var p1 = images2[0];
      var p2 = images2[1];
      
      var p1_img = p1[0];
      var p2_img = p2[0];
      
      var p1_width = p1[1];
      var p1_height = p1[2];
      
      var p2_width = p2[1];
      var p2_height = p2[2];
      
      images2.splice(0,2);
      
      /*  
        分析result，组合成最小面积
        并得到对于图片的左边
      */
      var result = getMinAreaByTwoBox(p1_width, p1_height, p2_width, p2_height);
      
      var x1 = result.x1;
      var x2 = result.x2;
      var y1 = result.y1;
      var y2 = result.y2;
      var w  = result.width;
      var h  = result.height;
      
      ctx.clearRect(0,0,c_width,c_height);
      
      if( Object.prototype.toString.call(p1_img) == "[object HTMLImageElement]" ){
        //[object HTMLImageElement]
        ctx.drawImage(p1_img, x1, y1);
      }else{
        //[object ImageData]
        ctx.putImageData(p1_img, x1, y1);
      }
      
      if( Object.prototype.toString.call(p2_img) == "[object HTMLImageElement]" ){
        ctx.drawImage(p2_img, x2, y2);
      }else{
        ctx.putImageData(p2_img, x2, y2);
      }
      
      var imagedata = ctx.getImageData(0, 0, w, h);
      var doneImg = [ imagedata, w, h ];
      
      
      // imagedataR.push( doneImg );
      // console.log( doneImg );
      // console.log( result );
      // console.log( '===========================================================')
      
      // var canvas2 = document.createElement("canvas");
      // canvas2.width = 200;
      // canvas2.height = 200;
      // document.getElementById("canvas-w").appendChild(canvas2);
      // var ctx2 = canvas2.getContext("2d");
      // ctx2.putImageData( doneImg[0], 0, 0);
 
      //再插入正确的位置
      for(var i = 0; i<images2.length; i++){
        if( w * h <= images2[i][1] * images2[i][2]){
          images2.splice(i, 0, doneImg);
          
          break;
        }else if( i == images2.length -1){
          images2.push( doneImg );
          break;
        }
      }

      findTwoMiniBoxes();
      
    }
    
    
    findTwoMiniBoxes();
    
    
    // console.log(imagedataR)
    // var ctx3 = document.getElementById("J-canvas3").getContext("2d");
    // ctx3.putImageData( imagedataR[3][0], 0, 0 );
    
    /**
      2个矩形的最小面积，
      2个矩形不能旋转
      并且求出2个矩形的坐标（已知第1个矩形的左边）
    */
    function getMinAreaByTwoBox(w1, h1, w2, h2, x1, y1){
      x1 = x1 || 0;
      y1 = y1 || 0;
      
      // 返回第2个矩形的坐标 x2, y2
      // 返回生成之后的 宽度和高度(width, height)，还有左上角坐标(x1, y1)
      var result = {
        width : 0,
        height : 0,
        x2 : 0,
        y2 : 0
      }
      
      var s1 = _max(h1, h2) * (w1 + w2);
      var s2 = _max(w1, w2) * (h1 + h2);
      var s_min = Math.min(s1, s2);
      
      switch( s_min ){
        case s1 :
          result = {
            width : w1 + w2,
            height : _max(h1, h2),
            x2 : x1 + w1,
            y2 : y1
          }
          break;
        
        case s2 :
          result = {
            width : _max(w1, w2),
            height : h1 + h2,
            x2 : x1,
            y2 : y1 + h1
          }
          break;
      }
      
      result.x1 = x1;
      result.y1 = y1;
      
      return result;
      
    }//end getMinAreaByTwoBox
    
    
    
    
    //画图
    // var x = 0;
    // for(var i=0; i<images.length; i++){
      // var temp = images[i];
      
      // ctx.drawImage(temp[0], x, 0);
      // x += temp[1] + img_space;
    // }
    
  }, 200);
  
});

























