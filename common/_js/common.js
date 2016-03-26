;(function(){
  window.Common = {};

  Common.iDeviceScale = window.screen.width < 375.0 ? 1.0 : (window.screen.width < 414.0 ? 1.171875 : 1.29375);

  Common.DeviceImage = function(imgSrcPath) {
    var img = new Image();
    var suffixPos = imgSrcPath.lastIndexOf('.');
    img.src = imgSrcPath.substring(0, suffixPos)
              + '-' + Math.floor(window.devicePixelRatio) + 'x'
              + imgSrcPath.substring(suffixPos);
    return img;
  }

  Common.urlParam = function(name) {
    var value = "", found = false;
    if (window.location.search.indexOf("?") == 0 && window.location.search.indexOf("=") > 1) {
        var arr = window.location.search.substring(1, window.location.search.length).split("&");
        for (var i = 0; i < arr.length && !found; i++) {
          arr[i].indexOf("=") > 0 &&
          arr[i].split("=")[0].toLowerCase() == name.toLowerCase() &&
          (value = arr[i].split("=")[1], found = true);
        }
    }
    return value == "" && (value = null), value
  }
})();
