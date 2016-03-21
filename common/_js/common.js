;(function(){
  window.Common = {};

  Common.DeviceScale = window.screen.width / 320.0;

  Common.DeviceImage = function(imgSrcPath) {
    var img = new Image();
    var suffixPos = imgSrcPath.lastIndexOf('.');
    img.src = imgSrcPath.substring(0, suffixPos)
              + '-' + window.devicePixelRatio + 'x'
              + imgSrcPath.substring(suffixPos);
    return img;
  }
})();
