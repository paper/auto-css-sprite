/**==========================================================================
  Fast Optimizing Rectangle Packing
  
  Author      paper
  Date        2014-08
  Site        https://github.com/paper
  
  Reference   http://www.99css.com/archives/977
              http://www.aaai.org/Papers/ICAPS/2003/ICAPS03-029.pdf
              http://www.google.com
=============================================================================*/ 

;(function(global, undefined){
  
  /*----------------------------------------------------------
    ！注意！

    var arr = [{a:1}, {b:3}];
    var clone = arr.slice(0); // or arr.concat();
    clone[0]['a'] = 66;

    console.log(arr);    // [{a:66}, {b:3}];
    console.log(clone);  // [{a:66}, {b:3}];
    
    如果数组含有对象，仅仅 concat 或者 slice 是不能进行复制的
  -------------------------------------------------------------*/
  function cloneArr(r){
    return JSON.parse( JSON.stringify(r) );
  }
  
  /**-------------------------------------------------------------
    @r {array} 矩形宽度和高度的数组集合
    Example: r = [ [10,20], [3,1], [4,8], ... ];

    @callback 处理完后的回调函数，里面会有 @nice 参数

    @nice {object}
    nice = {
        s : totalArea,  // 图片总和面积
        w : box.w,      // 容器最小宽度
        h : box.h,      // 容器最小高度
        r : boxIn,      // [ { w:160, h:160, p:0, x:10, y:20}, 
                             { w:128, h:128, p:50, x:13, y:21}, 
                             { w:50, h:50, p:9, x:33, y:12} ... ]
        u : +parseFloat( totalArea / ( box.w * box.h ) ).toFixed(3) //利用率
        space : space   // 边界
    }
  -------------------------------------------------------------*/
  global.FORP = function(r, callback){
  
    //重新对 r 整理排序的对象数组
    var r2 = [];
    
    var length = r.length;
    
    function init(){
      
      // (w, h, p)(宽度，高度，第几个)
      // 添加第3个数据，来记录这个数组是原来的第几个 
      // 这样随便移动数组，都知道之前的是在哪个矩形
      r.forEach(function(v,i){
        var w = v[0];
        var h = v[1];
        
        r2.push( {w:w, h:h, p:i } );
      });
      
    }//end init
    
    function letsgo(){
      
      // 按高度排序 的 数据样本
      var sampleArr = sortByHeight(r2);
      
      // 最高的那个矩形
      var maxHeightRect = sampleArr[0];
      
      // 容器初始化高度
      var boxInitHeight = maxHeightRect.h;
      
      // 最佳样本
      var nice = { u:0 };
      
      // 临时样本
      var niceTemp = null;
      
      // box 每次递增的高度（标准图标的最小高度）
      // 如果想要得到最佳值，boxHeightStep = 1 而且 sampleMax >= 160，但这会消耗很大性能
      var boxHeightStep = 16;
       
      // 样本个数
      var sampleMax = 10;
      
      var i = 0;
      
      // 采样
      function sampling( cb ){
        niceTemp = baseAlgo(sampleArr, boxInitHeight + boxHeightStep * i);
        
        console.log("样本%d: 利用率:%.3f, 宽度:%d, 高度:%d", i, niceTemp.u, niceTemp.w, niceTemp.h);
        
        if( niceTemp.u > nice.u ){
          nice = niceTemp;
        }

        // 如果已找到最优解，立即结束
        if( nice.u == 1 ){
          callback(nice);
          return;
        }
        
        /*------------------------------------------------------
          如果利用率大于 0.9（已经很不错了） ，可以立马停下来了，由你自己决定
          
          if( nice.u > 0.9 ){
            callback(nice);
            return;
          }
        --------------------------------------------------------*/
        
        // 延迟采样，防止浏览器假死
        setTimeout(function(){
          i++;
          
          if( i >= sampleMax ){
            cb();
            return;
          }
          
          sampling(cb);
          
        }, 10);
      }//end sampling
      
      sampling(function(){
        callback(nice);
      });
      
    }//end letsgo
    
    /**===============================================================
      基本算法
      @r 按高度排序的矩形 [ {w:10,h:20,p:0}, {w:5,h:10,p:2}, {w:30,h:5,p:1}... ]
      
      1. 先把最高的矩形(A)放在左上角
      2. 找第2高(B)的矩形放在右边
      3. 第3高的矩形(C)，如果可以放在B下面就放，放不了就放在B的右边
      4. 第4高的矩形(D)，同样从左判断，是否能放在某个矩形的下面，如果不行，就放到C的右边
    ===============================================================*/
    function baseAlgo(r, height){
      
      height = height || 0;
      
      var cloneArr = JSON.parse(JSON.stringify(r));
      
      // 最大宽度，最大高度，最小宽度
      var MAXW = 10000;
      var MAXH = 0;
      var MINH = 0;
      
      //总面积，总宽 和 总高
      var totalArea = 0;
      var totalWidth = 0;
      var totalHeight = 0;
      
      // 图片之间的间隙
      var space = 1;
      
      // 加上间隙，有助于查看sprite
      cloneArr.forEach(function(v,i){
        var w = v.w + space;
        var h = v.h + space;
        
        // 修改了宽高。在最终获取的时候，可以减去 space 获得真实 width 和 height
        cloneArr[i].w = w;
        cloneArr[i].h = h;
        
        // 受 间隙space的影响，总面积，总宽度，总高度，也需要相应改变
        totalArea += w * h;
        totalWidth += w;
        totalHeight += h;
      });

      var maxHeightRect = cloneArr[0];
      
      MAXH = Math.max(height, maxHeightRect.h);
      MINH = cloneArr[length-1].h;
      
      // 盒子容器的初始大小
      var box = { w:maxHeightRect.w, h:MAXH };
      
      // boxIn 是指已经在 box 里面的矩形集合
      // 初始化第一个矩形的位置更新后的状态. (w, h, p, x, y) p是指原来数组的位置
      var boxIn = [ {w:maxHeightRect.w, h:maxHeightRect.h, p:maxHeightRect.p, x:0, y:0} ];
      
      // xWrap 是指长条移动过程中，肯定不能放置任何矩形 采集的 x 值
      var xWrap = [];
      
      // 长条移动的步长
      var xStep = 2;
      
      for(var i = 1; i<length; i++){
      
        var temp = cloneArr[i];
        var temp_w = temp.w;
        var temp_h = temp.h;
        var temp_p = temp.p;
        
        // 核心算法理念：
        // 判断 矩形 能不能放到 box 的最左且最高的空余位置，如果可以就放
        // 如果不行，就放在 box 的最右边，盒子容器宽度延长
        
        // 长度为1，高度为 MAXH 的 长条(L) 从左向右移动
        for(var x = 0; x < MAXW; x += xStep){
          
          // 如果 x 值已经知道没有了位置可以放矩形，后续的就不判断了，直接pass
          if( xWrap.indexOf(x) > -1 ) continue;
          
          // 填满了
          if( boxIn.length === length ) break;
          
          // 如果移到了最右边
          if( x == box.w ){
            boxIn.push( {w:temp_w, h:temp_h, p:temp_p, x:x, y:0} );
            
            box.w += temp_w;
            break;
          }
          
          // 判断 L 在哪些 boxIn 的矩形范围内，找到这些矩形
          var tempBoxInRect = [];
          boxIn.forEach(function(v){
            if( x >= v.x && x < v.w + v.x ){
              tempBoxInRect.push( v );
            }
          });
          
          // tempBoxInRect 的总高度
          var tempBoxInRectTotalHeight = 0;
          
          //求出 L 与 tempBoxInRect 相交的点的 y轴 线段组。 初始化线段两边的两个点
          var tempBoxInRectLine = [ [0, 0], [MAXH, MAXH] ];
          
          tempBoxInRect.forEach(function(v){
            tempBoxInRectTotalHeight += v.h;
            
            tempBoxInRectLine.push( [ v.y, v.y + v.h ] );
          });
          
          // 判断 tempBoxInRectTotalHeight 加上 最小矩形高度 MINH 是不是小于 MAXH
          // 如果大于，说明剩余空间不可能再放置任何矩形了
          if( tempBoxInRectTotalHeight + MINH > MAXH ){
            xWrap.push(x);
            continue;
          }

          if( checkTempBoxInRectLine( temp, x, tempBoxInRectLine) ) break;
          
        }//长条移动

      }//所有的矩形放置循环 for
      
      // 判断 L 与 tempBoxInRect 相交的点的 y轴 线段组 之间的间隙，可否放置矩形
      function checkTempBoxInRectLine(rect, x, tempBoxInRectLine){
        var key = false;
        
        // tempBoxInRectLine 排序 从小到大
        tempBoxInRectLine.sort(function(a, b){
          return a[0] - b[0];
        });
        
        for(var i=0, len=tempBoxInRectLine.length; i<len; i++){
          
          //把 rect 需要插入的矩形，放到长条移动到的空位，得到一个 rect 的相关数据
          var w = rect.w;
          var h = rect.h;
          var p = rect.p;
          var x = x;
          var y = tempBoxInRectLine[i][1];
          
          // 判断是否溢出box
          if( y + h > MAXH ) continue;
          
          // 如果两个线段之间的间隙，小于需要插入矩形的高度，就肯定没有后续判断插入后是否碰撞的必要了
          if( tempBoxInRectLine[i+1] && (tempBoxInRectLine[i+1][0] - y) < h) continue;

          // 判断这个 rect 矩形，是否和 boxIn 里面的矩形发生碰撞(覆盖)
          var noCover = boxIn.every(function(v){
            return x >= v.x + v.w || y >= v.y + v.h || x + w <= v.x || y + h <= v.y;
          });
          
          // 如果没有碰撞
          if( noCover ){
            boxIn.push( {w:w, h:h, p:p, x:x, y:y} );
            
            // 修改 box 边界
            if( x + w > box.w ){
              box.w = x + w;
            }
            key = true;
            break;
          }
        }
        
        return key;
        
      }//end checkTempBoxInRectLine
      
      return {
        s : totalArea,
        w : box.w - space, // 剔除边界 space
        h : box.h - space,
        r : boxIn,
        u : +parseFloat( totalArea / ( box.w * box.h ) ).toFixed(3),
        space : space
      };
      
    }//end baseAlgo
    
    
    function sortByFilter(r, filter){
      var result = [];
      var r = cloneArr(r);

      function funcIn(){
        if( r.length == 1 ){
          result.push(r[0]);
          return;
        }
        
        var k = filter(r);
        
        result.push(r[k]);
        r.splice(k, 1);
        
        funcIn();
      }
      
      funcIn();
      
      return result;
    }

    //图片按照高度排序 高 -> 低
    function sortByHeight(r){
      return sortByFilter(r, function(r){
        var h = 0;
        var max = 0;
        var k = 0;
        
        r.forEach(function(v, i){
          h = v.h;
          
          if( h > max ){
            max = h;
            k = i;
          }
        });
        
        return k;
      });
    }//end sortByHeight
    
    //图片按照宽度排序 高 -> 低
    function sortByWidth(r){
      return sortByFilter(r, function(r){
        var w = 0;
        var max = 0;
        var k = 0;
        
        r.forEach(function(v, i){
          w = v.w;
          
          if( w > max ){
            max = w;
            k = i;
          }
        });
        
        return k;
      });
    }//end sortByWidth
    
    
    init();
    letsgo();
    
  }//end FORP
  
  
})(this);



