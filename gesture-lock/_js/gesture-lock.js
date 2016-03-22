;(function(){
  window.GestureLock = function(obj) {
    this.lockId = obj.lockId;
    this.root = obj.root;
    this.canvasSize = obj.canvasSize || 300;
    this.lockSize = obj.lockSize || 3;

    this.uninteractive = obj.uninteractive || false;
    this.repeatable = obj.repeatable || false;
    this.error = false;
    this.nodeRadius = obj.nodeRadius || 32.5;
    this.lineWidth = obj.lineWidth || 6;
    this.routeHidden = obj.routeHidden || false;

    this.touchPoint = {x: -1, y: -1};

    this.errorColor = obj.errorColor || '#ff0000';
    this.normalColor = obj.normalColor || '#00d1de';
    this.errorImage = obj.errorImage || Common.DeviceImage('./_img/gesture-error.png');
    this.selectedImage = obj.selectedImage || Common.DeviceImage('./_img/gesture-selected.png');
    this.normalImage = obj.normalImage || Common.DeviceImage('./_img/gesture-normal.png');

    this.delegate = obj.delegate || {};
  }

  GestureLock.prototype.init = function() {
    this.initDOM();
    this.canvas = document.getElementById(this.lockId);
    this.ctx = this.canvas.getContext('2d');
    this.initNodes();
    this.updateCanvas();
    this.bindEvent();
  }

  GestureLock.prototype.reset = function() {
    this.error = false;
    this.touchPoint = {x: -1, y: -1};
    this.initNodes();
    this.updateCanvas();
  }

  GestureLock.prototype.showError = function() {
    this.error = true;
    this.updateCanvas();
  }

  GestureLock.prototype.showPassword = function(password) {
    this.initNodes();
    var passwords = password.split(',');
    for (var i = 0; i < passwords.length; i++) {
      var index = Number(passwords[i]);
      if (index <= 0 || index > this.nodes.length) continue;
      this.nodes[index - 1].selected = true;
      this.selectedNodes.push(this.nodes[index -1]);
    }
    this.updateCanvas();
  }

  GestureLock.prototype.initDOM = function(){
    var frame = document.createElement('div');
    var style = ' style="display:inline-block;"';
    var width = ' width="' + this.canvasSize * Common.DeviceScale + '"';
    var height = ' height="' + this.canvasSize * Common.DeviceScale + '"';
    frame.innerHTML = '<canvas id="' + this.lockId + '"' + style + width + height + '></canvas>';
    this.root.appendChild(frame);
  }

  GestureLock.prototype.initNodes = function() {
    this.nodes = [];
    this.selectedNodes = [];
    this.nodeGap = (this.canvasSize - this.lockSize * this.nodeRadius * 2) / (this.lockSize + 1);
    var count = 0;
    for (var i = 0; i < this.lockSize; i++) {
      for (var j = 0; j < this.lockSize; j++) {
        count++;
        var node = {
          index: count,
          selected: false,
          y: (this.nodeRadius * 2 + this.nodeGap) * i + this.nodeGap,
          x: (this.nodeRadius * 2 + this.nodeGap) * j + this.nodeGap
        };
        this.nodes.push(node);
      }
    }
  }

  GestureLock.prototype.updateCanvas = function() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.drawNodes();
    this.drawLines();
  }

  GestureLock.prototype.bindEvent = function() {
    var self = this;
    this.errorImage.onload = function() { self.updateCanvas(); };
    this.selectedImage.onload = function() { self.updateCanvas(); };
    this.normalImage.onload = function() { self.updateCanvas(); };

    this.canvas.addEventListener("touchstart", function(e) { self.touchStart(e); }, false);
    this.canvas.addEventListener("touchmove", function(e) { self.touchMove(e); }, false);
    this.canvas.addEventListener("touchend", function(e) { self.touchEnd(e); }, false);

    document.addEventListener('touchmove', function(e) { e.preventDefault(); }, false);
  }

  GestureLock.prototype.drawNodes = function() {
    for (var i = 0; i < this.nodes.length; i++) {
      var node = this.nodes[i];
      this.ctx.shadowColor = node.selected ? (this.error ? this.errorColor : this.normalColor) : '#000000';
      this.ctx.shadowBlur = node.selected ? 3 : 0;
      this.ctx.drawImage(node.selected ? (this.error ? this.errorImage : this.selectedImage) : this.normalImage,
        node.x * Common.DeviceScale, node.y * Common.DeviceScale,
        this.nodeRadius * 2 * Common.DeviceScale,
        this.nodeRadius * 2 * Common.DeviceScale
      );
    }
    this.ctx.shadowColor = '#000000';
    this.ctx.shadowBlur = 0;
  }

  GestureLock.prototype.drawLines = function() {
    if (this.selectedNodes.length <= 0 || this.routeHidden) return;

    this.ctx.beginPath();
    this.ctx.strokeStyle = this.error ? this.errorColor : this.normalColor;
    this.ctx.globalAlpha = 0.45;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineJoin = 'round';
    var center = this.nodeCenterPoint(this.selectedNodes[0]);
    this.ctx.moveTo(center.x, center.y);
    for (var i = 1; i < this.selectedNodes.length; i++) {
      center = this.nodeCenterPoint(this.selectedNodes[i]);
      this.ctx.lineTo(center.x, center.y);
    }
    if (this.touchPoint.x != -1 && this.touchPoint.y != -1) {
      this.ctx.lineTo(this.touchPoint.x, this.touchPoint.y);
    }
    this.ctx.stroke();
    this.ctx.globalAlpha = 1.0;
    this.ctx.closePath();
  }

  GestureLock.prototype.touchStart = function(event) {
    event.preventDefault();// adaptation for android
    if (this.uninteractive) return;
    var pos = this.touchPosition(event);
    for (var i = 0; i < this.nodes.length; i++) {
      if (this.nodeContainsPosition(this.nodes[i], pos)) {
        this.nodes[i].selected = !this.routeHidden;
        this.selectedNodes.push(this.nodes[i]);
        this.delegate.touchStarted && this.delegate.touchStarted(self);
        break;
      }
    }
    this.touchPoint = {x: pos.x, y: pos.y};
    this.updateCanvas();
  }

  GestureLock.prototype.touchMove = function(event) {
    if (this.uninteractive) return;
    var pos = this.touchPosition(event);
    for (var i = 0; i < this.nodes.length; i++) {
      if (this.nodeContainsPosition(this.nodes[i], pos)
          && this.selectedNodes[this.selectedNodes.length - 1].index != this.nodes[i].index // 连续不可相同
          && (this.repeatable || !this.nodes[i].selected)) { // 是否可重复选中
        this.nodes[i].selected = !this.routeHidden;
        this.selectedNodes.push(this.nodes[i]);
        if (this.selectedNodes.length == 1) {
          this.delegate.touchStarted && this.delegate.touchStarted(self);
        }
        break;
      }
    }
    this.touchPoint = {x: pos.x, y: pos.y};
    this.updateCanvas();
  }

  GestureLock.prototype.touchEnd = function(event) {
    if (this.uninteractive || this.selectedNodes.length <= 0) return;
    var passwords = [];
    for (var i = 0; i < this.selectedNodes.length; i++) {
      passwords.push(this.selectedNodes[i].index);
    }
    if (this.delegate.touchEnded) {
      this.delegate.touchEnded(this, passwords.join(','));
    } else {
      this.reset();
    }
  }

  GestureLock.prototype.touchPosition = function(e) {
    var rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }

  GestureLock.prototype.nodeContainsPosition = function(node, pos) {
    return calcuDistance(pos, this.nodeCenterPoint(node)) < this.nodeRadius * Common.DeviceScale;
  }

  GestureLock.prototype.nodeCenterPoint = function(node) {
    return {x: (node.x + this.nodeRadius) * Common.DeviceScale,
            y: (node.y + this.nodeRadius) * Common.DeviceScale};
  }

  function calcuDistance(a, b){return Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2));}
})();
