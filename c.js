var canvas = document.getElementById("J-canvas");
var c_width = canvas.width;
var c_height = canvas.height;

var ctx = canvas.getContext("2d");
var box = document.getElementById("J-drag-box");

var spriteCssTextarea = document.getElementById("J-sprite-css");
var spriteCss = "";

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
var img_space = 1;

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
  canvas.width = c_width;
  canvas.height = c_height;
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
      var file = fileList[i];
      
      var img_name = file.name;
    　var reader = new FileReader();
    　var img = document.createElement('img');

    　reader.onload = function(e) {
        img.onload = function(){
          img.name = img_name;
          //console.log(img.name);
          images.push([img, img.width, img.height]);
        }
      
    　　img.src = this.result;
    　}
    　reader.readAsDataURL(file);
    
    })()
  }
  
  //后续再判断如果加载完毕，再
  setTimeout(function(){

    
    //图片安装面积排序
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
    
    /**
      找出最接近的2个矩形。
      里面重叠面积求差值，2个矩形左上角对其重叠。
      如果重叠面积差是0，说明2个矩形一模一样，差值最小。
      如果不一样大，2个矩形面积，减去重叠面积。
      
      返回数组 r 的下标
      example : r = [ [1,2], [5,6], [7,8] ]  //1,2  5,6 方便是指2个矩形的宽和高
    */
    function findClosestTwoRect(r){
      var r = r.concat();
      var len = r.length;
      if(len<=1) return false;
      if(len == 2) return "0-1";
      
      //差值集合
      var s = [];
      
      /*
        下标对于矩形的差值。比如：
        下标0，和下标1 ，2个矩形的差值是 34
        {
          "0-1" : 34
        }
      */
      var obj = {};
      
      for(var i=0; i<len-1; i++){
        for(var j=i+1; j<len; j++){
          var rect1 = r[i];
          var rect2 = r[j];
          
          var rect1_w = rect1[0];
          var rect1_h = rect1[1];
          
          var rect2_w = rect2[0];
          var rect2_h = rect2[1];
          
          var w_min = _min(rect1_w, rect2_w);
          var h_min = _min(rect1_h, rect2_h);
          
          var ss = rect1_w * rect1_h + rect2_w * rect2_h - w_min * h_min * 2;
          
          s.push(ss);
          
          obj[i.toString() + "-" + j.toString()] = ss;
        }
      }
      
      //面积差 从左到右排序了 排序了
      s.sort(function(a, b){
        return a - b;
      });
      
      //再取面积最小的那个
      
      
      var min_ss = s[0];
      
      for(var k in obj){
        if( obj[k] === min_ss ){
          return k;
        }
        
      }
      
    }//end findClosestTwoRect;
    
    
    //var images2 =  sortImg(images).reverse();
    
    var images2 =  images.concat();
      
    //找到面积尽量小的
    //动态规划算法
    function findTwoMiniBoxes(){

      if( images2.length <= 1 ) return;
      
      var images3 = [];
      images2.forEach(function(v){
        images3.push( [ v[1], v[2] ] );
      });

      var mm = findClosestTwoRect(images3).split("-");
      var mm_1 = +mm[0];
      var mm_2 = +mm[1];
      
      //console.log(mm);
      
      var p1 = images2[ mm_1 ];
      var p2 = images2[ mm_2 ];
      
      var p1_img = p1[ 0 ];
      var p2_img = p2[ 0 ];
      
      var p1_width = p1[1] + img_space;
      var p1_height = p1[2] + img_space;
      
      var p2_width = p2[1] + img_space;
      var p2_height = p2[2] + img_space;
      
      //images2.splice(0,2);
      images2.splice(mm_1,1);
      images2.splice(mm_2 - 1,1);
      
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
        
        p1_img.msg = {
          name : p1_img.name,
          x : x1,
          y : y1,
          w : p1_img.width,
          h : p1_img.height
        }
        //console.log( p1_img.msg );
      }else{
        //[object ImageData]
        ctx.putImageData(p1_img, x1, y1);

        (function(){
          var p1_img_r = [];
          
          //修改里面图片的坐标，然后返回
          var inImagesP1 = p1_img.inImagedataImages;
          for(var i =0; i<inImagesP1.length; i++){
            var inImagesP1Temp = inImagesP1[i];
            inImagesP1Temp.x = inImagesP1Temp.x + x1;
            inImagesP1Temp.y = inImagesP1Temp.y + y1;
            
            p1_img_r.push( inImagesP1Temp );
          }
          
          p1_img.inImagedataImages = p1_img_r;
        })();
        
        
      }
      
      if( Object.prototype.toString.call(p2_img) == "[object HTMLImageElement]" ){
        ctx.drawImage(p2_img, x2, y2);
        
        p2_img.msg = {
          name : p2_img.name,
          x : x2,
          y : y2,
          w : p2_img.width,
          h : p2_img.height
        }
        
        //console.log( p2_img.msg );
      }else{
        ctx.putImageData(p2_img, x2, y2);
        
        (function(){
          var p2_img_r = [];
          
          //修改里面图片的坐标，然后返回
          var inImagesP2 = p2_img.inImagedataImages;
          for(var i =0; i<inImagesP2.length; i++){
            var inImagesP2Temp = inImagesP2[i];
            inImagesP2Temp.x = inImagesP2Temp.x + x2;
            inImagesP2Temp.y = inImagesP2Temp.y + y2;
            
            p2_img_r.push( inImagesP2Temp );
          }
          
          p2_img.inImagedataImages = p2_img_r;
        })();

      }
      
      
      var imagedata = ctx.getImageData(0, 0, w, h);
      var doneImg = [ imagedata, w, h ];
      
      var inImagedataImages = imagedata.inImagedataImages || [];
      
      if( p1_img.msg ){
        inImagedataImages.push( p1_img.msg );
      }else if(p1_img.inImagedataImages){
        inImagedataImages = inImagedataImages.concat( p1_img.inImagedataImages );
      }
      
      if( p2_img.msg ){
        inImagedataImages.push( p2_img.msg );
      }else if(p2_img.inImagedataImages){
        inImagedataImages = inImagedataImages.concat( p2_img.inImagedataImages );
      }
      
      imagedata.inImagedataImages = inImagedataImages;
      
      console.log("===")
      console.log( imagedata.inImagedataImages );

      //console.log( imagedata.inImagedataImages )
      
      if( images2.length == 0 ){
        canvas.width = w;
        canvas.height = h;
        
        ctx.putImageData(doneImg[0], 0, 0);
        
        console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxx")
        console.log( doneImg[0].inImagedataImages );
        
        return;
      }

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
      
      setTimeout(function(){
        findTwoMiniBoxes();
      }, 0);
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









