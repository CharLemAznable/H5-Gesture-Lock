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

  Common.urlParam = function(name) {
    var value = "", found = false;
    if (window.location.search.indexOf("?") == 0 && window.location.search.indexOf("=") > 1) {
        var arr = unescape(window.location.search).substring(1, window.location.search.length).split("&");
        for (var i = 0; i < arr.length && !found; i++) {
          arr[i].indexOf("=") > 0 &&
          arr[i].split("=")[0].toLowerCase() == name.toLowerCase() &&
          (value = arr[i].split("=")[1], found = true);
        }
    }
    return value == "" && (value = null), value
  }
})();
