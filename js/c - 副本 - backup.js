var c_width = 600;
var c_height = 600;
var ctx = document.getElementById("J-canvas").getContext("2d");
var box = document.getElementById("J-drag-box");

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

function getImage(url, callback){
  var img = document.createElement("img");
  img.onload = function(){
    callback && callback(img);
  }
  
  img.src = url;
}

function getImages(url){
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

/*
box.addEventListener("drop", function(e){
  e.preventDefault();
  
  //获取文件列表
  var fileList = e.dataTransfer.files;
  
  console.log(fileList);
    
    
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
    getImages(fileList[i]["name"]);
  }
  setTimeout(function(){
    console.log(images);
  }, 100)
  
});
*/

/*
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
      var s3 = Math.abs( h1 - w2);
      var s4 = Math.abs( h1 - h2);
      var s_min = Math.min( s1, s2, s3, s4 );
      
      switch( s_min ){
        case s1 :
          result = {
            width : _max(w1, w2),
            height : h1 + h2,
            x2 : x1,
            y2 : y1 + h1
          }
          break;
        
        case s2 :
          result = {
            width : _max(w1, h2),
            height : h1 + w2,
            x2 : x1,
            y2 : y1 + h1
          }
          break;
        
        case s3 :
          result = {
            width : w1 + h2,
            height : _max(h1, w2),
            x2 : x1 + w1,
            y2 : y1
          }
          break;
          
        case s4 :
          result = {
            width : w1 + w2,
            height : _max(h1, h2),
            x2 : x1 + w1,
            y2 : y1
          }
          break;
      }
      
      result.x1 = x1;
      result.y1 = y1;
      
      return result;
      
    }//end getMinAreaByTwoBox
*/
