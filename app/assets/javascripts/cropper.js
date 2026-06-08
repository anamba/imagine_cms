var Cropper = {};
var onEndCrop;
var cropper;

Cropper.Img = function (imageId, options) {
  this.img = document.getElementById(imageId);
  this.options = Object.assign({
    ratioDim: { x: 0, y: 0 },
    minWidth: 0,
    minHeight: 0,
    displayOnInit: false,
    onEndCrop: function () { },
    onloadCoords: null,
    maxWidth: 0,
    maxHeight: 0
  }, options || {});

  this.areaCoords = { x1: 0, y1: 0, x2: 0, y2: 0 };
  this.dragging = false;
  this.moving = false;
  this.moveOffset = { x: 0, y: 0 };
  this.clickCoords = { x: 0, y: 0 };

  if (!this.img) return;
  if (this.img.complete) this.onLoad();
  else this.img.addEventListener('load', this.onLoad.bind(this), { once: true });
};

Cropper.Img.prototype = {
  onLoad: function () {
    console.log('cropper v2.1');

    this.imgW = this.img.naturalWidth || this.img.width;
    this.imgH = this.img.naturalHeight || this.img.height;

    this.wrap = document.createElement('div');
    this.wrap.className = 'imgCrop_wrap';
    this.wrap.style.cssText = 'position: relative; display: inline-block; overflow: hidden; width: ' + this.img.width + 'px; height: ' + this.img.height + 'px;';

    this.img.parentNode.insertBefore(this.wrap, this.img);
    this.wrap.appendChild(this.img);

    this.north = document.createElement('div');
    this.north.className = 'imgCrop_north';
    this.north.style.cssText = 'position: absolute; left: 0; top: 0; width: 100%; background: rgba(0,0,0,.45);';
    this.wrap.appendChild(this.north);

    this.east = document.createElement('div');
    this.east.className = 'imgCrop_east';
    this.east.style.cssText = 'position: absolute; top: 0; background: rgba(0,0,0,.45);';
    this.wrap.appendChild(this.east);

    this.south = document.createElement('div');
    this.south.className = 'imgCrop_south';
    this.south.style.cssText = 'position: absolute; left: 0; width: 100%; background: rgba(0,0,0,.45);';
    this.wrap.appendChild(this.south);

    this.west = document.createElement('div');
    this.west.className = 'imgCrop_west';
    this.west.style.cssText = 'position: absolute; top: 0; background: rgba(0,0,0,.45);';
    this.wrap.appendChild(this.west);

    this.selArea = document.createElement('div');
    this.selArea.className = 'imgCrop_selArea';
    this.selArea.style.cssText = 'position: absolute; border: 1px dashed #fff; box-sizing: border-box; cursor: move; display: none;';
    this.selArea.show = function () {
      this.style.display = 'block';
      this._cropper.handles.forEach(function (h) { h.style.display = 'block'; });
    };
    this.selArea.hide = function () {
      this.style.display = 'none';
      [this._cropper.north, this._cropper.east, this._cropper.south, this._cropper.west].forEach(function (el) {
        el.style.display = 'none';
      });
      this._cropper.handles.forEach(function (h) { h.style.display = 'none'; });
    }.bind({ _cropper: this });
    this.wrap.appendChild(this.selArea);

    this.handles = [];
    var handleSize = 8;
    var halfSize = handleSize / 2;
    var handlePositions = [
      { name: 'n', cursor: 'n-resize', left: '50%', top: -halfSize + 'px', marginLeft: -halfSize + 'px' },
      { name: 'ne', cursor: 'ne-resize', left: '100%', top: -halfSize + 'px', marginLeft: -halfSize + 'px' },
      { name: 'e', cursor: 'e-resize', left: '100%', top: '50%', marginLeft: -halfSize + 'px', marginTop: -halfSize + 'px' },
      { name: 'se', cursor: 'se-resize', left: '100%', top: '100%', marginLeft: -halfSize + 'px', marginTop: -halfSize + 'px' },
      { name: 's', cursor: 's-resize', left: '50%', top: '100%', marginLeft: -halfSize + 'px', marginTop: -halfSize + 'px' },
      { name: 'sw', cursor: 'sw-resize', left: 0, top: '100%', marginLeft: -halfSize + 'px', marginTop: -halfSize + 'px' },
      { name: 'w', cursor: 'w-resize', left: -halfSize + 'px', top: '50%', marginTop: -halfSize + 'px' },
      { name: 'nw', cursor: 'nw-resize', left: -halfSize + 'px', top: -halfSize + 'px' }
    ];

    handlePositions.forEach(function (pos) {
      var handle = document.createElement('div');
      handle.className = 'imgCrop_handle imgCrop_handle-' + pos.name;
      handle.style.cssText = 'position: absolute; width: ' + handleSize + 'px; height: ' + handleSize + 'px; background: #fff; border: 1px solid #333; cursor: ' + pos.cursor + '; display: none;';
      handle.style.left = pos.left;
      handle.style.top = pos.top;
      if (pos.marginLeft) handle.style.marginLeft = pos.marginLeft;
      if (pos.marginTop) handle.style.marginTop = pos.marginTop;
      handle.dataset.handleName = pos.name;
      this.selArea.appendChild(handle);
      this.handles.push(handle);
    }.bind(this));

    this.startDragBind = this.startDrag.bind(this);
    this.onDragBind = this.onDrag.bind(this);
    this.endCropBind = this.endCrop.bind(this);
    this.wrap.addEventListener('mousedown', this.startDragBind);
    document.addEventListener('mousemove', this.onDragBind);
    document.addEventListener('mouseup', this.endCropBind);

    if (this.options.onloadCoords) {
      this.setAreaCoords(this.cloneCoords(this.options.onloadCoords), false, false, 1);
      this.drawArea();
      if (this.options.displayOnInit) {
        this.selArea.style.display = 'block';
        [this.north, this.east, this.south, this.west].forEach(function (el) { el.style.display = 'block'; });
      }
      this.endCrop();
    }
  },

  remove: function () {
    if (!this.wrap || !this.wrap.parentNode) return;
    this.wrap.removeEventListener('mousedown', this.startDragBind);
    document.removeEventListener('mousemove', this.onDragBind);
    document.removeEventListener('mouseup', this.endCropBind);
    this.wrap.parentNode.insertBefore(this.img, this.wrap);
    this.wrap.parentNode.removeChild(this.wrap);
  },

  reset: function () {
    this.setAreaCoords({ x1: 0, y1: 0, x2: 0, y2: 0 }, false, false, 1);
    if (this.selArea) this.selArea.hide();
    this.endCrop();
  },

  cloneCoords: function (coords) {
    return {
      x1: parseInt(coords.x1, 10) || 0,
      y1: parseInt(coords.y1, 10) || 0,
      x2: parseInt(coords.x2, 10) || 0,
      y2: parseInt(coords.y2, 10) || 0
    };
  },

  calcW: function () {
    return Math.max(0, this.areaCoords.x2 - this.areaCoords.x1);
  },

  calcH: function () {
    return Math.max(0, this.areaCoords.y2 - this.areaCoords.y1);
  },

  setAreaCoords: function (coords) {
    coords = this.cloneCoords(coords);
    coords.x1 = Math.max(0, Math.min(coords.x1, this.imgW));
    coords.y1 = Math.max(0, Math.min(coords.y1, this.imgH));
    coords.x2 = Math.max(0, Math.min(coords.x2, this.imgW));
    coords.y2 = Math.max(0, Math.min(coords.y2, this.imgH));

    if (coords.x2 < coords.x1) {
      var x = coords.x1;
      coords.x1 = coords.x2;
      coords.x2 = x;
    }
    if (coords.y2 < coords.y1) {
      var y = coords.y1;
      coords.y1 = coords.y2;
      coords.y2 = y;
    }

    if (this.options.ratioDim && this.options.ratioDim.x > 0 && this.options.ratioDim.y > 0) {
      var width = coords.x2 - coords.x1;
      var height = Math.round(width * this.options.ratioDim.y / this.options.ratioDim.x);
      coords.y2 = Math.min(this.imgH, coords.y1 + height);
    }

    this.areaCoords = coords;
  },

  drawArea: function () {
    if (!this.selArea) return;
    var x1 = this.areaCoords.x1;
    var y1 = this.areaCoords.y1;
    var x2 = this.areaCoords.x2;
    var y2 = this.areaCoords.y2;
    var w = this.calcW();
    var h = this.calcH();

    this.selArea.style.left = x1 + 'px';
    this.selArea.style.top = y1 + 'px';
    this.selArea.style.width = w + 'px';
    this.selArea.style.height = h + 'px';

    this.north.style.height = y1 + 'px';
    this.west.style.left = '0';
    this.west.style.top = y1 + 'px';
    this.west.style.width = x1 + 'px';
    this.west.style.height = h + 'px';
    this.east.style.left = x2 + 'px';
    this.east.style.top = y1 + 'px';
    this.east.style.width = Math.max(0, this.imgW - x2) + 'px';
    this.east.style.height = h + 'px';
    this.south.style.top = y2 + 'px';
    this.south.style.height = Math.max(0, this.imgH - y2) + 'px';
  },

  startDrag: function (event) {
    var t = event.target;
    var handleName = t.dataset && t.dataset.handleName;
    var isHandle = handleName && this.handles.indexOf(t) >= 0;
    
    if (t !== this.img && t !== this.wrap && t !== this.selArea &&
      t !== this.north && t !== this.east && t !== this.south && t !== this.west &&
      !isHandle) return;
    event.preventDefault();
    this.clickCoords = this.getCurPos(event);
    
    var hasSelection = this.areaCoords.x2 > this.areaCoords.x1 && this.areaCoords.y2 > this.areaCoords.y1;
    var insideSelection = hasSelection &&
      this.clickCoords.x >= this.areaCoords.x1 && this.clickCoords.x <= this.areaCoords.x2 &&
      this.clickCoords.y >= this.areaCoords.y1 && this.clickCoords.y <= this.areaCoords.y2;
    
    if (isHandle) {
      this.dragging = true;
      this.resizing = true;
      this.resizeHandle = handleName;
      this.resizeStartCoords = {
        x1: this.areaCoords.x1,
        y1: this.areaCoords.y1,
        x2: this.areaCoords.x2,
        y2: this.areaCoords.y2
      };
    } else if (insideSelection) {
      this.dragging = true;
      this.moving = true;
      this.moveOffset = {
        x: this.clickCoords.x - this.areaCoords.x1,
        y: this.clickCoords.y - this.areaCoords.y1
      };
    } else {
      this.dragging = true;
      this.setAreaCoords({ x1: this.clickCoords.x, y1: this.clickCoords.y, x2: this.clickCoords.x, y2: this.clickCoords.y });
      this.selArea.style.display = 'block';
      [this.north, this.east, this.south, this.west].forEach(function (el) { el.style.display = 'block'; });
      this.handles.forEach(function (h) { h.style.display = 'block'; });
      this.drawArea();
    }
  },

  onDrag: function (event) {
    if (!this.dragging) return;
    var pos = this.getCurPos(event);
    
    if (this.resizing) {
      var x1 = this.resizeStartCoords.x1;
      var y1 = this.resizeStartCoords.y1;
      var x2 = this.resizeStartCoords.x2;
      var y2 = this.resizeStartCoords.y2;
      var handle = this.resizeHandle;
      
      if (handle.indexOf('w') >= 0) x1 = Math.max(0, Math.min(pos.x, x2 - 10));
      if (handle.indexOf('e') >= 0) x2 = Math.min(this.imgW, Math.max(pos.x, x1 + 10));
      if (handle.indexOf('n') >= 0) y1 = Math.max(0, Math.min(pos.y, y2 - 10));
      if (handle.indexOf('s') >= 0) y2 = Math.min(this.imgH, Math.max(pos.y, y1 + 10));
      
      this.setAreaCoords({ x1: x1, y1: y1, x2: x2, y2: y2 });
    } else if (this.moving) {
      var w = this.calcW();
      var h = this.calcH();
      var newX = pos.x - this.moveOffset.x;
      var newY = pos.y - this.moveOffset.y;
      
      newX = Math.max(0, Math.min(newX, this.imgW - w));
      newY = Math.max(0, Math.min(newY, this.imgH - h));
      
      this.setAreaCoords({ x1: newX, y1: newY, x2: newX + w, y2: newY + h });
    } else {
      this.setAreaCoords({ x1: this.clickCoords.x, y1: this.clickCoords.y, x2: pos.x, y2: pos.y });
    }
    
    this.drawArea();
  },

  getCurPos: function (event) {
    var rect = this.wrap.getBoundingClientRect();
    return {
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top)
    };
  },

  endCrop: function () {
    if (!this.areaCoords) return;
    this.dragging = false;
    this.moving = false;
    this.resizing = false;
    this.resizeHandle = null;
    this.options.onEndCrop(this.areaCoords, { width: this.calcW(), height: this.calcH() });
  }
};
