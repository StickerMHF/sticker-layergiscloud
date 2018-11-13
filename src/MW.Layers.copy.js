import L from '../static/leaflet/leaflet.js';
import LayerInfo from '../static/layersinfo.json';
/**
 *@author mhf
 * @copyright mhf
 * @date 2017.12.8
 * Used to load and display tile layers on the map. Extends `leaflet`.
 */
export var MWLayerAjax = L.TileLayer.extend({
	_requests: [],
	//生成layers容器
	_initContainer: function() {
		mwself.mwlayers.forEach(l => {
			debugger
			var c = L.DomUtil.create('div', 'leaflet-layer ' + (mwself.options.className || ''));
			mwself.options.zIndex=mwself.options.zIndex+1;
			c.style.zIndex=mwself.options.zIndex;
			mwself.getPane().appendChild(c);
			l._container=c;
		});

	},
	//通过行列号生成并请求数据
	_addTile: function(coords, container) {
		var tilePos = this._getTilePos(coords),
			key = this._tileCoordsToKey(coords);
		var tile = this.createTile(this._wrapCoords(coords), L.Util.bind(this._tileReady, this, coords));

		this._initTile(tile);

		// if createTile is defined with a second argument ("done" callback),
		// we know that tile is async and will be ready later; otherwise
		if(this.createTile.length < 2) {
			// mark tile as ready, but delay one frame for opacity animation to happen
			L.Util.requestAnimFrame(L.Util.bind(this._tileReady, this, coords, null, tile));
		}

		L.DomUtil.setPosition(tile, tilePos);

		// save tile in cache
		this._tiles[key] = {
			el: tile,
			coords: coords,
			current: true
		};
		this._initloadTile(tile, coords),
			tile.parentNode !== this._container && container.appendChild(tile)
		//container.appendChild(tile);//原来的方法
	},
	//为每一个瓦片生成一个canvas
	createTile: function(t, i) {
		return this._tileCanvas.cloneNode(false);
	},
	//请求瓦片事件
	_initloadTile: function(V, U) {
		V._layer = this;
		V.onload = this._tileOnLoad;
		V.onerror = this._tileOnError;
		V._layer = this;
		V.ontileload = function() {
			this._layer._tileOnLoad.call(this);
			if(this._layer._oldContainer) {
				I(this)
			}
			this.ontileload = null
		};
		if(this.options.visible) {
			this._loadTile(V, U, this)
		}
	},
	// 生成地址并发送ajax请求
	_loadTile: function(tile, tilePoint, that) {
		var uri = "";
		//		tile.src = this.getTileUrl(e);

		uri += tilePoint.z + "/" + tilePoint.x + "/" + tilePoint.y;

		tile.obj = that;
		tile.obj.parent = {};
		tile.zoom = tilePoint.z;
		tile.coord = tilePoint;
		tile._loader_id = this.loader_id;
		tile.uri_for_request = uri;
		uri += "/" + that.mid;
		tile.uri = uri;
		//		if(tile.obj.parent.group) {
		//			var lids = [];
		//			var timestamps = [];
		//			for(var i = 0; i < tile.obj.parent.group.length; i++) {
		//				if(tile.obj.parent._tileShouldBeLoaded(coord, tile.obj.parent.group[i])) {
		//					lids.push(tile.obj.parent.group[i].options.id);
		//					timestamps.push(tile.obj.parent.group[i].options.modified)
		//				}
		//			}
		//			if(lids.length == 0) {
		//				return
		//			}
		//			that.lid = lids.join(",");
		//			that.modified = timestamps.join(",")
		//		}
		if(!this.tile_request[uri]) {
			this.tile_req_seq++;
			this.tile_request[uri] = {
				tiles: [],
				layers: [],
				timestamps: [],
				attribs: [],
				seq: this.tile_req_seq,
				present: {}
			};
			this.tile_req.push({
				coord: tilePoint,
				tile: tile,
				that: that,
				uri: uri,
				uri_for_request: tile.uri_for_request
			})
		}
		if(!this.tile_request[uri].present[that.lid]) {
			this.tile_request[uri].tiles.push(tile);
			this.tile_request[uri].layers.push(that.lid);
			//			this.tile_request[uri].timestamps.push(that.modified);
			this.tile_request[uri].present[that.lid] = true;
			//			if(attribs) {
			//				this.tile_request[uri].attribs = attribs.concat(tile_request[uri].attribs)
			//			}
		}
		this.ajaxLoader(this.url2 + "/" + tile.uri_for_request + ".json", tile, tile.uri);
		//		this._adjustTilePoint(tilePoint);

	},
	//ajax请求
	ajaxLoader: function(url, tile, uri) {
		var req = new XMLHttpRequest();
		this._requests.push(req);
		req.onreadystatechange = this._xhrHandler(req, tile, tile.coord);
		req.open('GET', url, true);
		req._url = url;
		req.send();
	},
	// ajax请求完成得到数据
	_xhrHandler: function(req, tile, tilePoint) {
		let that = this;

		return function() {
			var el = el || {},
				mwjson;
			if(req.readyState !== 4) {
				return;
			} else {
				mwjson = 0;
			}
			var s = req.status;
			if((s >= 200 && s < 300 && s != 204) || s === 304) {
				//				el = req.dest;
				var reg = /<(.*)>.*<\/(.*)>/;
				if((!reg.test(req.responseText)) && req.responseText !== "0") {
					mwjson = JSON.parse(req.responseText);
				}

			}
			that._tileLoaded(req, tile, mwjson);
		};
	},

	//瓦片加载完成事件
	_tileOnLoad: function() {
		var t = this._layer;
		this.src !== L.Util.emptyImageUrl && (L.DomUtil.addClass(this, "leaflet-tile-loaded"),
				t.fire("tileload", {
					tile: this,
					url: this.src
				})),
			t._tileLoaded()
	},

	//创建canvas
	_createTileCanvas: function() {
		this._tileCanvas = L.DomUtil.create("canvas", "leaflet-tile leaflet-tile-loaded");
		var U = this.options.tileSize;
		this._tileCanvas.width = U;
		this._tileCanvas.height = U
	},
	_reset: function() {
		L.TileLayer.prototype._reset.apply(this, arguments);
		for(var i = 0; i < this._requests.length; i++) {
			this._requests[i].abort();
		}
		this._requests = [];
	},
	_update: function() {
		if(this._map && this._map._panTransition && this._map._panTransition._inProgress) {
			return;
		}
		if(this._tilesToLoad < 0) {
			this._tilesToLoad = 0;
		}
		L.TileLayer.prototype._update.apply(this, arguments);
	}
});
export var MWTileLayer = MWLayerAjax.extend({
	// Store each GeometryCollection's layer by key, if options.unique function is present
	_keyLayers: {},

	// Used to calculate svg path string for clip path elements
	_clipPathRectangles: {},

	initialize: function(url, options, geojsonOptions) {
		MWLayerAjax.prototype.initialize.call(this, url, options);
		//		this.geojsonLayer = new L.GeoJSON(null, geojsonOptions);
	},
	onAdd: function(map) {
		mwself = this;
		mwself._map = map;
		mwself.tile_request = {};
		mwself.tile_req = [];
		mwself.tile_req_seq = 0;
		mwself.text_data = {};
		mwself.loader_id = 0;
		mwself._selectable = true;
		mwself.isMouseDown = false;
		mwself.hoverModifier = {};
		mwself.modifier = {};
		mwself.lid_map = {};
		mwself.lid_map[this.options.id] = 1;
		mwself.mwlayers = [];
		mwself.layer_info = mwself.layer_info ? mwself.layer_info : LayerInfo[mwself.options.id];
		mwself.bounds = new mapway.Bounds(mwself.layer_info.xmin, mwself.layer_info.ymin, mwself.layer_info.xmax, mwself.layer_info.ymax);
		mwself.bounds = {
			xmin: -20037508.3427892,
			ymin: -20037508.3427892,
			xmax: 20037508.3427892,
			ymax: 20037508.3427892,
			max: 40075016.6855784
		}
		if(mwself.layer_info.has_icon && mwself.layer_info.features) {
			for(var a3 = 0; a3 < mwself.layer_info.features.length; a3++) {
				if(mwself.layer_info.features[a3].icon) {
					mwself.layer_info.features[a3].icon_image = new Image(mwself.layer_info.features[a3].icon);
					mwself.layer_info.features[a3].icon_image.width = 10;
					mwself.layer_info.features[a3].icon_image.height = 10;
					mwself.layer_info.features[a3].icon_image.src = mwself.layer_info.features[a3].icon;
					mwself.layer_info.features[a3].icon_image.feature = mwself.layer_info.features[a3];
					//					K.push({
					//						img: mwself.layer_info.features[a3].icon_image,
					//						url: mwself.layer_info.features[a3].icon
					//					})
				}
			}
		}
		if(typeof(this._url) == "string") {

		}
		common.tileurl = this._url;
		this.url2 = common.tileSite();
		var ps = this.url2.split("/");
		var lid = ps[ps.length - 1].split(",");
		lid.forEach(i=>{
			mwself.mwlayers.push({id:i});
		});
		

		this._createTileCanvas();
		MWLayerAjax.prototype.onAdd.call(this, map);
		this._initMapEvent();
		//		this.modifyObject("", {
		//			color: 16760576,
		//			orig_color: 13421772
		//		}, "", true);
		//		map.addLayer(this.geojsonLayer);
	},
	_initMapEvent: function() {
		let that = this;
		mwself._map.on("zoomanim", function() {
			mwself.html5ResetLoaders()
		});
		mwself._map.on("click", function(evt) {
			if(mwself.extendgc.T(evt)) {
				var g = mwself.hoverModifier.layer;
				var a = "selectcolor"; //that.getHighlightColor(that.hoverModifier.layer.substring(5));
				mwself.modifyObject("", {
					color: 16760576,
					orig_color: 13421772
				}, "", true);
				mwself.modifyObject(mwself.hoverModifier.orig_key.split("_")[1], {
					color: a
				}, g ? g : "");
			}
		});
		mwself._map.on("mousemove", function(aC) {
			if(mwself.extendgc.T(aC)) { //&& al
				if(aC.showMousePointer) {
					mwself._map._container.style.cursor = "pointer";
					//					mwself.extendgc.aw(aC, "object_over");
					//					J = aC
				} else {
					//					if(!flashnavigator.hasCanvas && (ao._currentTool == "InfoTool" || ao._currentTool == "SelectTool")) {
					//						mwself._map._container.style.cursor = "default";
					//					} else {
					mwself._map._container.style.cursor = "";
					//					}
					//					if(J) {
					//						aw(J, "object_out", I);
					//						J = null
					//					}
				}
			}
			//			获取显示当前鼠标坐标点
			//						if(aC.mp) { // && Z.mousemove
			//							var aA = (1 << mwself._map._zoom);
			//							var aB = {
			//								x: q.xmin + q.max * aC.mp.x / aA,
			//								y: q.ymax - q.max * aC.mp.y / aA
			//							};
			//							mwself.extendgc.au("mousemove", aB);
			//						}
		});
	},
	checkForEvent: function(evt, force, delta) {
		if(!force && this.isMouseDown) {
			return
		}
		var c = evt.currentTile;
		if(!c.el.data) {
			return
		}
		var x, y;
		if(evt.offsetX >= 0) {
			x = evt.offsetX;
			y = evt.offsetY
		} else {
			x = evt.layerX;
			y = evt.layerY
		}
		x += c.el._offset[c.layer];
		y += c.el._offset[c.layer];
		return this.handleEvent(c.el, x, y, evt, delta)
	},
	onMouseMove: function(evt, force, offset, layer) {
		if(this._selectable) {
			return this.checkForEvent(evt, force, offset)
		} else {
			return false
		}
	},
	//鼠标事件
	handleEvent: function(c, x, y, evt, delta) {
		if(c.data_type[c.layer] == "text") { //!selectionEnabled || 
			return false
		}
		var cc = c;
		var d = 0;
		if(c.data) {
			d = c.data[c.layer]
		}
		if(!d) {
			return false
		}
		var r = 4;
		if(!delta) {
			delta = 0
		}
		if(c.data_type[c.layer] == "point") {
			r = delta
		}
		var xr = x + r;
		var xl = x - r;
		var yt = y - r;
		var yb = y + r;
		var minpoint_dist = 100000;
		var last_point_index = -1;
		var candidate = -1;
		var candidate_feature_id = null;
		var feature_id;
		var i;
		var shouldRedraw = false;
		var shouldHighlight = true; // !c.obj.parent.viewer.isUsingMapEngineGroupedLayers;
		for(i = d.length - 1; i >= 0; i--) {
			if(d[i].visible && xr >= d[i].b.xmin && xl <= d[i].b.xmax && yb >= d[i].b.ymin && yt <= d[i].b.ymax && (d[i].ispoint || (d[i].ispoly && !d[i].ispoint && mapway.math.util.isPointInsidePolygon(d[i].p, {
					x: x,
					y: y
				})) || (!d[i].ispoly && !d[i].ispoint && mapway.math.util.isPointTouchingPath(d[i].p, {
					x: x,
					y: y
				}, r)))) {
				if(d[i].ispoint) {
					var dist = mapway.math.util.pointDistance(d[i].x, d[i].y, x, y);
					if(dist < minpoint_dist) {
						candidate = i;
						minpoint_dist = dist
					}
				} else {
					feature_id = d[i].c;
					if(d[i].curs && d[i].curs.type === "line") {
						if(candidate_feature_id) {
							break
						}
					} else {
						if(feature_id == candidate_feature_id) {
							candidate = -1;
							candidate_feature_id = null;
							continue
						} else {
							if(candidate_feature_id) {
								break
							}
						}
					}
					candidate = i;
					candidate_feature_id = feature_id
				}
			}
		}
		if(candidate >= 0) {
			var elem = null;
			var firstElem = candidate;
			elem = d[candidate];
			var selected = d[firstElem];
			//			          if (flashnavigator.hasCanvas) {
			if(mwself.hoverModifier.isset) {
				if(c.obj._hoveredElement === selected.c && c.layer === mwself.hoverModifier.layer) {
					if(c.fields && c.fields[elem.c]) {
						elem.attributes = c.fields[elem.c]
					}
					return elem
				}
				if(shouldHighlight) {
					shouldRedraw = mwself.clearHover() || shouldRedraw
				}
			}
			if(!c.obj.modifier[selected.c]) {
				var style_index = 0;
				if(selected.ispoint) {
					style_index = selected.i
				} else {
					style_index = selected.s
				}
				c.styles = c.styles_data[c.layer];
				if(shouldHighlight) {
					mwself.hoverModifier.isset = true;
					mwself.hoverModifier.color = c.styles[style_index].highlightcolor;
					mwself.hoverModifier.hover = true;
					mwself.hoverModifier.orig = c.obj.modifier[selected.c];
					mwself.hoverModifier.orig_obj = c.obj;
					mwself.hoverModifier.orig_key = selected.c;
					mwself.hoverModifier.layer = c.layer;
					mwself.hoverModifier.layerObj = c.curLayerObj;
					c.obj.modifier[selected.c] = mwself.hoverModifier;
					c.obj._hoveredElement = selected.c;
					shouldRedraw = mwself.drawAcrossTiles(c.obj, true) || shouldRedraw
				}
			} else {
				c.obj._hoverModifier = null
			}
			//          }
			if(c.fields && c.fields[elem.c]) {
				elem.attributes = c.fields[elem.c]
			}
			if(shouldRedraw) {
				c.obj.redraw()
			}
			return elem
		}
		if(mwself.hoverModifier.isset && c.layer === mwself.hoverModifier.layer) { //flashnavigator.hasCanvas && 
			shouldRedraw = mwself.clearHover() || shouldRedraw
		}
		if(shouldRedraw) {
			c.obj.redraw()
		}
		return false
	},
	html5ResetLoaders: function() {
		var r;
		//      for (r in active_loaders) {
		//          if (!active_loaders[r]) {
		//              continue
		//          }
		//          if (active_loaders[r].dest) {
		//              active_loaders[r].dest._layer._tileOnError.call(active_loaders[r].dest)
		//          }
		//          if (active_loaders[r].abort) {
		//              active_loaders[r].abort()
		//          }
		//          active_loaders[r] = null
		//      }
		this.loader_id++;
		this.tile_req = [];
		this.tile_request = {}
	},
	onRemove: function(map) {
		//		map.removeLayer(this.geojsonLayer);
		MWLayerAjax.prototype.onRemove.call(this, map);
	},

	_reset: function() {
		this._keyLayers = {};
		MWLayerAjax.prototype._reset.apply(this, arguments);
	},

	_getUniqueId: function() {
		return String(this._leaflet_id || ''); // jshint ignore:line
	},

	// Recurse LayerGroups and call func() on L.Path layer instances
	_recurseLayerUntilPath: function(func, layer) {
		if(layer instanceof L.Path) {
			func(layer);
		} else if(layer instanceof L.LayerGroup) {
			// Recurse each child layer
			layer.getLayers().forEach(this._recurseLayerUntilPath.bind(this, func), this);
		}
	},

	_clipLayerToTileBoundary: function(layer, tilePoint) {
		// Only perform SVG clipping if the browser is using SVG
		if(!L.Path.SVG) {
			return;
		}
		if(!this._map) {
			return;
		}

		if(!this._map._pathRoot) {
			this._map._pathRoot = L.Path.prototype._createElement('svg');
			this._map._panes.overlayPane.appendChild(this._map._pathRoot);
		}
		var svg = this._map._pathRoot;

		// create the defs container if it doesn't exist
		var defs = null;
		if(svg.getElementsByTagName('defs').length === 0) {
			defs = document.createElementNS(L.Path.SVG_NS, 'defs');
			svg.insertBefore(defs, svg.firstChild);
		} else {
			defs = svg.getElementsByTagName('defs')[0];
		}

		// Create the clipPath for the tile if it doesn't exist
		var clipPathId = this._getUniqueId() + 'tileClipPath_' + tilePoint.z + '_' + tilePoint.x + '_' + tilePoint.y;
		var clipPath = document.getElementById(clipPathId);
		if(clipPath === null) {
			clipPath = document.createElementNS(L.Path.SVG_NS, 'clipPath');
			clipPath.id = clipPathId;

			// Create a hidden L.Rectangle to represent the tile's area
			var tileSize = this.options.tileSize,
				nwPoint = tilePoint.multiplyBy(tileSize),
				sePoint = nwPoint.add([tileSize, tileSize]),
				nw = this._map.unproject(nwPoint),
				se = this._map.unproject(sePoint);
			this._clipPathRectangles[clipPathId] = new L.Rectangle(new L.LatLngBounds([nw, se]), {
				opacity: 0,
				fillOpacity: 0,
				clickable: false,
				noClip: true
			});
			this._map.addLayer(this._clipPathRectangles[clipPathId]);

			// Add a clip path element to the SVG defs element
			// With a path element that has the hidden rectangle's SVG path string  
			var path = document.createElementNS(L.Path.SVG_NS, 'path');
			var pathString = this._clipPathRectangles[clipPathId].getPathString();
			path.setAttribute('d', pathString);
			clipPath.appendChild(path);
			defs.appendChild(clipPath);
		}

		// Add the clip-path attribute to reference the id of the tile clipPath
		this._recurseLayerUntilPath(function(pathLayer) {
			pathLayer._container.setAttribute('clip-path', 'url(' + window.location.href + '#' + clipPathId + ')');
		}, layer);
	},

	//根据瓦片行列号获得数据
	addTileData: function(request, callback_func, tile_container, mwjson) {
		if(mwjson && mwjson.length && !tile_container.obj.dynamic) {
			var tile, i, offset = 0,
				tiles = request.tile_request.tiles;
			for(i = 0; i < tiles.length; i++) {
				tile = tiles[i];
				if(tile.obj && tile.obj.processTiles) {
					debugger
					offset += tile.obj.processTiles(callback_func, request.tile_request, mwjson, i, offset)
				} else {
					if(mwjson[i]) {
						callback_func(tile, mwjson[i], tile.obj.parent)
					}
				}
				if(tile && tile.ontileload) {
					tile.ontileload()
				}
			}
		} else {
			if(tile_container) {
				if(tile_container.obj && tile_container.obj.processTiles) {
					debugger
					tile_container.obj.processTiles(callback_func, request.tile_request, mwjson, 0, 0, true)
				} else {
					if(mwjson) {
						callback_func(tile_container, mwjson, tile_container.obj); //tile_container.obj.parent
					}
				}
				if(tile_container.ontileload) {
					tile_container.ontileload()
				}
			}
		}
	},
	//得到数据回调，绘制图形
	drawTile: function(el, data, layer, dontRender, offset) {
		el.curLayerObj = layer;
		el.curLayerObj.features = layer.layer_info.features;
		//el.layer = el.layer || el.obj.parent.id;
		el.layer = el.layer || el.obj.layer_info.id;
		el.data = el.data || {};
		el.data_type = el.data_type || {};
		el._offset = el._offset || {};
		el._canvas_offset = el._canvas_offset || 0;
		el.featureCount = 0;
		el.featureIds = [];
		if(offset) {
			expandCanvas(el, offset)
		}
		//		if(layer.loader_id === el._loader_id) {
		el._offset[el.layer] = 0;
		//			if(flashnavigator.hasCanvas) {
		let ctx = el.getContext("2d");
		if(el._drawn && !dontRender) {
			ctx.clearRect(0, 0, el.width, el.height)
		}
		//			}
		el._drawn = true;
		if(el.curLayerObj.options.dynamic && data[1]) {
			el.dyndata = data[1];
			data = data[0]
		}
		//			if(flashnavigator.newLabelingMode) {
		//				giscloud.util.mediator.publish("tile/loaded", el, data, layer, renderLabelTile)
		//			}
		if(layer.layer_info.hiddenGeometry) {
			return
		}
		if(data.tile) {
			if(data.tile.type == "text") {
				el.data[el.layer] = data.tile.data;
				el.fields = data.fields;
				drawText(el, dontRender);
				data.geom = null
			}
			if(data.tile.type == "point") {
				el.data[el.layer] = data.tile.data;
				el.fields = data.fields;
				mwself.parsePoint(el, data);
				el.styles = data.styles;
				mwself.initStyles(el);
				mwself.drawPoint(el);
				data.geom = null
			}
		}
		if(data.geom) {
			layer.setupTile(el, data);
			el.styles = data.styles;
			layer.initStyles(el);
			//				if(!flashnavigator.hasCanvas) {
			//					el.img = L.DomUtil.create("img", "", el);
			//					el.img_url = el.obj.url + el.zoom + "/" + el.coord.x + "/" + el.coord.y + ".png";
			//					el.img.src = el.img_url
			//				}
			layer.drawGeom(el, data, dontRender)
		}
		//		}
		data.tile = null;
		data.fields = null;
		data = null
	},
	//绘制Geom
	drawGeom: function(el, data, dontRender) {
		var geom = data.geom;
		el.lista = el.lista || {};
		el.data = el.data || {};
		el.data_type = el.data_type || {};
		el.pixels = el.pixels || {};
		el.data[el.layer] = geom;
		if(!el.lista[el.layer]) {
			el.lista[el.layer] = []
		}
		el.data_type[el.layer] = "geom";
		el.fields = data.fields;
		var lista = el.lista[el.layer];
		var that = el.obj;
		var len = geom.length;
		var sindex = -1;
		var s = null;
		var object, g;
		var i, j, glen, b;
		var offset = 0;
		var precision = 0;
		if(el.curLayerObj.options.offset) {
			offset = el.curLayerObj.options.offset
		}
		if(el.curLayerObj.options.precision) {
			precision = el.curLayerObj.options.precision
		}
		if(data.tile && data.tile.pixels) {
			el.pixels[el.layer] = data.tile.pixels;
			data.tile.pixels = null
		}
		var has_fields = 0;
		if(data.fields) {
			has_fields = 1
		}
		el.featureCount = len;
		for(i = len - 1; i >= 0; i--) {
			object = geom[i];
			if(object.s >= 0) {
				sindex = object.s
			} else {
				object.s = sindex
			}
			b = {};
			if(!lista[object.c]) {
				lista[object.c] = []
			}
			lista[object.c].push(i);
			if(sindex != -1) {
				s = el.styles[sindex]
			}
			if(s.type == "polygon") {
				object.ispoly = 1
			}
			if(!object.initialized) {
				var g = object.p;
				glen = g.length;
				if(precision > 0) {
					for(j = 0; j < glen; j++) {
						g[j] /= precision
					}
				}
				if(offset > 0) {
					doOffset(object, offset)
				}
				g = object.p;
				b = {};
				b.xmin = b.xmax = g[0];
				b.ymin = b.ymax = g[1];
				el.featureIds.push(+object.c.split("_")[1]);
				for(j = 2; j < glen; j += 2) {
					if(g[j] < b.xmin) {
						b.xmin = g[j]
					} else {
						if(g[j] > b.xmax) {
							b.xmax = g[j]
						}
					}
					if(g[j + 1] < b.ymin) {
						b.ymin = g[j + 1]
					} else {
						if(g[j + 1] > b.ymax) {
							b.ymax = g[j + 1]
						}
					}
				}
				b.xmin = Math.floor(b.xmin);
				b.ymin = Math.floor(b.ymin);
				b.xmax = Math.ceil(b.xmax);
				b.ymax = Math.ceil(b.ymax);
				object.initialized = true;
				object.b = b;
				object.visible = true;
				if(has_fields) {
					object.data = el.fields[object.c];
					setupFiltersObject(el, object)
				}
			}
		}
		el.data[el.layer] = geom;
		geom = null;
		data.geom = null;
		data.style = null;
		if(!dontRender) {
			this.drawGeomInternal(el)
		}
	},

	drawPoint: function(el, use_modifier) {
		//      if (!flashnavigator.hasCanvas) {
		//          drawPointDOM(el, use_modifier);
		//          return
		//      }
		var ctx = el.forceCtx || el.getContext("2d");
		if(el.curLayerObj.isGroupLayer) {
			ctx.globalAlpha = el.curLayerObj.options.opacity
		} else {
			ctx.globalAlpha = 1
		}
		var f = null;
		if(el.obj.feature_filter && el.obj.feature_filter.filter) {
			f = el.obj.feature_filter.filter
		}
		var data = el.data[el.layer];
		el.featureCount += data.length;
		for(var i = 0; i < data.length; i++) {
			if(mwself.drawImage(el, el.obj, ctx, data[i], f)) {
				el.featureIds.push(+data[i].c.split("_")[1])
			}
		}
		if(el.obj.modifier) {
			mwself.drawTileUsingModifier(el, el.obj)
		}
	},
	drawImage: function(el, obj, ctx, d, f, modifier) {
		if(el.styles && el.styles[d.i] && el.styles[d.i].visible === false) {
			return 0
		}
		if(!f) {
			if(obj.feature_filter && obj.feature_filter.filter) {
				f = obj.feature_filter.filter
			}
		}
		var imgs = el.curLayerObj.features[d.i];
		if((!f || (d.data && f(d.data)))) { //imgs.iready && 
			var img = imgs.icon_image;
			d.b = {
				xmin: Math.floor(d.x - img.width / 2),
				ymin: Math.floor(d.y - img.height / 2),
				xmax: d.x + img.width / 2,
				ymax: d.y + img.height / 2
			};
			mwself.drawPointCanvas(ctx, d, obj._layer, imgs);
			if(modifier) {
				var c = mwself.getImageOverlay(imgs, modifier, d, obj._layer);
				ctx.drawImage(c, d.b.xmin, d.b.ymin, d.b.xmax - d.b.xmin, d.b.ymax - d.b.ymin)
			}
			d.visible = true
		} else {
			d.visible = false
		}
		return 1
	},
	getImageOverlay: function(imgs, modifier, d, layer) {
		var c;
		var key = modifier.color;
		if(d.cl > 0) {
			key += "_cluster"
		}
		if(imgs.icon_image_overlay && imgs.icon_image_overlay[key]) {
			c = imgs.icon_image_overlay[key]
		} else {
			c = document.createElement("canvas");
			c.width = d.b.xmax - d.b.xmin;
			c.height = d.b.ymax - d.b.ymin;
			var ic_ctx = c.getContext("2d");
			mwself.drawPointCanvas(ic_ctx, d, layer, imgs, 0, 0, true);
			ic_ctx.globalAlpha = 0.7;
			var style = mwself.overrideStyle(imgs, modifier);
			ic_ctx.fillStyle = style.color;
			ic_ctx.beginPath();
			ic_ctx.rect(0, 0, c.width, c.height);
			ic_ctx.globalCompositeOperation = "source-in";
			ic_ctx.fill();
			if(!imgs.icon_image_overlay) {
				imgs.icon_image_overlay = []
			}
			imgs.icon_image_overlay[key] = c
		}
		return c
	},
	drawPointCanvas: function(ctx, d, layer, object, x, y, overlay) {
		if(!d.b) {
			return
		}
		if(x == undefined) {
			x = d.b.xmin
		}
		if(y == undefined) {
			y = d.b.ymin
		}
		var img = object.icon_image,
			style, feature_id_a, feature, visible = true;
		var use_custom_renderer = mapway.mapFeatureRenderer != null;
		if(!overlay || !d.cl || !object.clustering) {
			if(use_custom_renderer) {
				feature_id_a = d.c.split("_");
				feature = {
					featureId: feature_id_a[1] * 1,
					layerId: parseInt(feature_id_a[0].replace("layer", "").replace("l", "")),
					geometry: [d.x, d.y],
					bounds: d.b,
					visible: visible
				};
				if(d.data) {
					feature.attributes = d.data
				}
				style = {
					icon: object.icon_image
				};
				mapway.mapFeatureRenderer(feature, style);
				img = style.icon;
				visible = feature.visible
			}
			if(visible) {
				ctx.drawImage(img, x, y)
			}
		}
		if(d.cl && object.clustering > 0) {
			var cluster = object.clustering;
			var text = d.cl + 1;
			ctx.save();
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			var cx = x + (d.b.ymax - d.b.ymin * 1) / 2;
			var cy = y + (d.b.ymax - d.b.ymin * 1) / 2;
			ctx.beginPath();
			ctx.arc(cx, cy, cluster - 2, 0, 2 * Math.PI, false);
			ctx.fillStyle = object.predominantColor;
			ctx.fill();
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#003300";
			ctx.stroke();
			if(!overlay) {
				ctx.lineWidth = 1;
				ctx.fillStyle = "#fff";
				ctx.strokeStyle = "#000";
				ctx.strokeText(text, cx, cy);
				ctx.fillText(text, cx, cy);
				if(img.width / 2 < cluster) {
					d.b.xmin = Math.floor(d.x - cluster);
					d.b.xmax = d.x + cluster
				}
				if(img.height / 2 < cluster) {
					d.b.ymin = Math.floor(d.y - cluster);
					d.b.ymax = d.y + cluster
				}
			}
			ctx.restore()
		}
	},
	parsePoint: function(el, data) {
		var offset = 10;
		var i, d;
		var has_fields = 0;
		var f;
		i = 0;
		while(1) {
			f = el.curLayerObj.features[i++];
			if(!f) {
				break
			}
			if(f.clustering > offset) {
				offset = f.clustering
			}
		}
		if(el._canvas_offset > offset) {
			offset = el._canvas_offset
		}
		mwself.expandCanvas(el, offset);
		el.data_type[el.layer] = "point";
		var tileData = el.data[el.layer];
		el.lista = el.lista || {};
		if(!el.lista[el.layer]) {
			el.lista[el.layer] = []
		}
		var lista = el.lista[el.layer];
		if(data.fields) {
			has_fields = 1
		}
		for(i = 0; i < tileData.length; i++) {
			d = tileData[i];
			d.x = offset + Math.round(((d.x - mwself.bounds.xmin) / mwself.bounds.max * Math.pow(2, el.zoom) - el.coord.x) * 256);
			d.y = offset + Math.round(((mwself.bounds.ymax - d.y) / mwself.bounds.max * Math.pow(2, el.zoom) - el.coord.y) * 256);
			d.id = d.id.replace("||", "_");
			d.c = d.id;
			d.ispoint = true;
			if(has_fields) {
				d.data = data.fields[d.id];
				mwself.setupFiltersObject(el, d)
			}
			if(!lista[d.c]) {
				lista[d.c] = []
			}
			lista[d.c].push(i)
		}
	},
	expandCanvas: function(el, d) {
		var c, ctx;
		el._offset[el.layer] = d;
		el.activeLayerId = null;
		if(d <= el._canvas_offset) {
			return
		}
		el.style.marginLeft = "-" + d + "px";
		el.style.marginTop = "-" + d + "px";
		if(!el.getContext) {
			el.style.width = el.width + "px";
			el.style.height = el.height + "px"
		} else {
			c = mwself.newCanvas(el);
			ctx = c.getContext("2d");
			ctx.drawImage(el, 0, 0)
		}
		el.width = el._layer.options.tileSize + d * 2;
		el.height = el._layer.options.tileSize + d * 2;
		el.style.width = (el._layer.options.tileSize + d * 2) + "px";
		el.style.height = (el._layer.options.tileSize + d * 2) + "px";
		if(ctx) {
			ctx = el.getContext("2d");
			ctx.drawImage(c, d, d);
			mwself.removeDOM(c)
		}
		el._canvas_offset = d
	},
	removeDOM: function(el) {
		if(!el.remove) {
			el = $(el)
		}
		el.remove()
	},
	setupFiltersObject: function(el, d) {
		if(el.feature_filter_attributes_array) {
			var i, feature_filter_attributes_array = el.feature_filter_attributes_array;
			if(!d.data) {
				d.data = {}
			}
			for(i = 0; i < feature_filter_attributes_array.length; i++) {
				if(d.data[feature_filter_attributes_array[i]] === undefined) {
					d.data[feature_filter_attributes_array[i]] = null
				}
			}
		}
	},
	setupTile: function(el, data) {
		if(!el.dyndata) {
			return
		}
		el.styles = el.curLayerObj.features;
		var g = data.geom;
		var c = 0;
		var s;
		var sindex;
		var l = null;
		var slen = 0;
		if(data.tile) {
			l = data.tile.l;
			slen = l.length - 1
		}
		var style = 0;
		var id;
		for(var i = 0, len = g.length; i < len; i++) {
			var c = g[i].c.split("_")[1];
			if(el.dyndata[c]) {
				g[i].dyn = el.dyndata[c]
			}
		}
		for(var i = 0; i < slen; i += 5) {
			if(l[i] < 0) {
				id = -l[i];
				style = l[i + 1];
				i++
			} else {
				id = l[i]
			}
			var x = l[i + 1];
			var y = l[i + 2];
			var dx = l[i + 3];
			var dy = l[i + 4];
			var o = {
				p: [x, y, x + dx, y + dy],
				id: id,
				s: style,
				c: el.curLayerObj.id + "_" + id,
				px: true
			};
			if(el.dyndata[o.id] >= 0) {
				o.dyn = el.dyndata[o.id]
			}
			g.push(o)
		}
		data.geom.sort(function(a, b) {
			return b.dyn - a.dyn
		});
		el.pixels2 = null;
		if(data.tile) {
			data.tile.pixels = null
		}
	},
	initStyles: function(el) {
		el.styles_data = el.styles_data || {};
		if(el.styles) {
			adjustLegacyStyles(el.styles)
		} else {
			el.styles = el.curLayerObj.features
		}
		for(var i = 0, len = el.styles.length; i < len; i++) {
			if(el.styles[i].type == "polygon") {
				if(!el.styles[i].linewidth) {
					el.styles[i].linewidth = 1
				}
				if(el.styles[i].fillcolor) {
					el.styles[i].predominantColor = el.styles[i].fillcolor
				} else {
					el.styles[i].predominantColor = el.styles[i].strokecolor
				}
			} else {
				if(el.styles[i].innerstrokecolor && el.styles[i].innerlinewidth > 0) {
					el.has_inner_line = true
				}
			}
			if(!el.styles[i].predominantColor) {
				if(el.styles[i].strokecolor) {
					el.styles[i].predominantColor = el.styles[i].strokecolor
				} else {
					if(el.styles[i].color) {
						el.styles[i].predominantColor = el.styles[i].color
					} else {
						el.styles[i].predominantColor = "#000000"
					}
				}
			}
			var c = common.getHighlightAndSelectColors(el.styles[i].predominantColor);
			el.styles[i].highlightcolor = c[0];
			el.styles[i].selectcolor = c[1]
		}
		el.styles_data[el.layer] = el.styles
	},
	overrideStyle: function(orig, o) {
		var r = {};
		if(o.color) {
			var color;
			if(o.color === "selectcolor") {
				color = orig.selectcolor
			} else {
				color = o.color
			}
			r.color = color;
			if(orig.strokecolor) {
				if(orig.type != "polygon") {
					r.strokecolor = color
				} else {
					r.strokecolor = orig.strokecolor
				}
			}
			if(orig.fillcolor) {
				r.fillcolor = color
			}
		} else {
			if(orig.strokecolor && o.strokecolor) {
				r.strokecolor = o.strokecolor
			} else {
				r.strokecolor = orig.strokecolor
			}
			if(orig.fillcolor && o.fillcolor) {
				r.fillcolor = o.fillcolor
			} else {
				r.fillcolor = orig.fillcolor
			}
			r.innerlinewidth = orig.innerlinewidth
		}
		if(o.dashed) {
			r.dashed = o.dashed
		} else {
			r.dashed = orig.dashed
		}
		r.linewidth = orig.linewidth;
		r.type = orig.type;
		r.visible = orig.visible;
		return r
	},
	drawGeomInternal: function(el) {
		var that = this;
		var geom, ctx, len, user_custom_renderer, feature, feature_id_a, s;
		if(!el.data) {
			return
		}
		geom = el.data[el.layer];
		el.styles = el.styles_data[el.layer];
		el._original = null;
		if(!geom) {
			return
		}
		var filter = null;
		if(el.obj.feature_filter && el.obj.feature_filter.filter) {
			filter = el.obj.feature_filter.filter
		}
		if(el.getContext) {
			ctx = el.forceCtx || el.getContext("2d");
			if(el._canvas_offset) {
				ctx.save();
				ctx.beginPath();
				ctx.rect(el._canvas_offset, el._canvas_offset, 256, 256);
				ctx.clip()
			}
			if(el.curLayerObj.isGroupLayer) {
				ctx.globalAlpha = el.curLayerObj.options.opacity
			} else {
				ctx.globalAlpha = 1
			}
			len = geom.length;
			if(!filter && el.pixels[el.layer]) {
				mwself.drawPixels(ctx, el, !(el.obj.parent.group))
			}
			user_custom_renderer = mapway.mapFeatureRenderer != null;
			for(var i = len - 1; i >= 0; i--) {
				let object = geom[i];
				let sindex = object.s;
				if(sindex != -1) {
					s = el.styles[sindex]
				}
				if(user_custom_renderer) {
					var w = {};
					for(var k in s) {
						w[k] = s[k]
					}
					s = w;
					feature_id_a = object.c.split("_");
					let feature = {
						featureId: feature_id_a[1] * 1,
						layerId: parseInt(feature_id_a[0].replace("layer", "").replace("l", "")),
						geometry: object.p,
						bounds: object.b,
						visible: object.visible
					};
					if(object.data) {
						feature.attributes = object.data
					}
					mapway.mapFeatureRenderer(feature, s);
					object.visible = feature.visible
				}
				object.curs = s;
				if(!filter || (object.data && filter(object.data))) {
					object.visible = true;
					mwself.drawCanvasPolygon(el, ctx, object.p, object.curs, object.s, el.lastP, null, 1, user_custom_renderer)
				} else {
					object.visible = false
				}
			}
			mwself.finishPoly(el, ctx);
			if(el.has_inner_line) {
				for(i = len - 1; i >= 0; i--) {
					object = geom[i];
					if(object.visible) {
						mwself.drawCanvasPolygon(el, ctx, object.p, object.curs, object.s, el.lastP, null, 2, user_custom_renderer)
					}
				}
				mwself.finishPoly2(el, ctx)
			}
		}
		if(el.obj.modifier) {
			mwself.drawTileUsingModifier(el, el.obj)
		}
		if(el._canvas_offset) {
			ctx.restore()
		}
	},
	drawPixels: function() {

	},
	drawCanvasPolygon: function(el, ctx, d, c, cindex, id, clear, mode, forcerender) {
		if(c.visible === false) {
			return
		}
		var len, j;
		if(el.last_c && el.last_c_index != cindex || forcerender) {
			if(mode != 2) {
				mwself.finishPoly(el, ctx)
			} else {
				mwself.finishPoly2(el, ctx)
			}
		}
		if(!el._path) {
			if(clear) {
				ctx.globalCompositeOperation = "destination-out"
			}
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.beginPath();
			el._path = 1;
			el.last_c = c;
			el.last_c_index = cindex
		}
		len = d.length;
		if(el._canvas_offset) {
			var offset = el._canvas_offset;
			ctx.moveTo(offset + d[0], offset + d[1]);
			for(j = 2; j < len; j += 2) {
				ctx.lineTo(offset + d[j], offset + d[j + 1])
			}
		} else {
			ctx.moveTo(d[0], d[1]);
			for(j = 2; j < len; j += 2) {
				ctx.lineTo(d[j], d[j + 1])
			}
		}
		if(clear) {
			mwself.finishPoly(el, ctx);
			ctx.globalCompositeOperation = "source-over"
		}
		el.lastP = id
	},
	finishPoly: function(el, ctx) {
		if(!el.last_c) {
			return
		}
		var c = el.last_c;
		if(c.icon && c.icon_image) {
			if(!c.pattern) {
				c.pattern = ctx.createPattern(c.icon_image, "repeat")
			}
			ctx.fillStyle = c.pattern;
			ctx.fill()
		} else {
			if(c.fillcolor) {
				ctx.fillStyle = c.fillcolor;
				ctx.fill()
			}
		}
		if(c.strokecolor && c.linewidth > 0) {
			if(c.dashed) {
				if(ctx.setLineDash) {
					ctx.setLineDash(c.dashed)
				} else {
					ctx.mozDash = c.dashed;
					ctx.webkitLineDash = c.dashed
				}
			}
			ctx.lineWidth = c.linewidth;
			if(!c.fillcolor && c.color) {
				ctx.strokeStyle = c.color
			} else {
				ctx.strokeStyle = c.strokecolor
			}
			ctx.stroke();
			if(c.dashed) {
				if(ctx.setLineDash) {
					ctx.setLineDash([])
				} else {
					ctx.mozDash = [];
					ctx.webkitLineDash = []
				}
			}
		}
		el.last_c = null;
		el.last_c_index = null;
		el._path = 0
	},
	finishPoly2: function(el, ctx) {
		if(!el.last_c) {
			return
		}
		var c = el.last_c;
		if(c.innerstrokecolor) {
			if(c.dashed) {
				if(ctx.setLineDash) {
					ctx.setLineDash(c.dashed)
				} else {
					ctx.mozDash = c.dashed;
					ctx.webkitLineDash = c.dashed
				}
			}
			ctx.strokeStyle = c.innerstrokecolor;
			ctx.lineWidth = c.innerlinewidth;
			ctx.stroke();
			if(c.dashed) {
				if(ctx.setLineDash) {
					ctx.setLineDash([])
				} else {
					ctx.mozDash = [];
					ctx.webkitLineDash = []
				}
			}
		}
		el.last_c = null;
		el.last_c_index = null;
		el._path = 0
	},
	drawAcrossTiles: function(that, toClear) {
		//      if (that.parent.group) {
		//          that.activeLayer = hoverModifier.isset ? hoverModifier.layerObj : null;
		//          return true
		//      }
		var i;
		var c = that.getCanvases();
		for(i in c) {
			toClear && this.clearTile(c[i].el);
			this.drawTileUsingModifier(c[i].el, that)
		}
		return false
	},
	clearHover: function() {
		var o_obj = mwself.hoverModifier.orig_obj;
		var shouldRedraw = false;
		if(o_obj.modifier[mwself.hoverModifier.orig_key] && o_obj.modifier[mwself.hoverModifier.orig_key].hover) {
			if(mwself.hoverModifier.orig) {
				o_obj.modifier[mwself.hoverModifier.orig_key] = mwself.hoverModifier.orig
			} else {
				o_obj.modifier[mwself.hoverModifier.orig_key] = null
			}
			shouldRedraw = mwself.drawAcrossTiles(o_obj, true)
		}
		mwself.hoverModifier.isset = false;
		return shouldRedraw
	},
	clearTile: function(tile) {
		if(tile._modified && tile._original) {
			var ctx = tile.getContext("2d");
			mwself.canvasUtils.rectCrop(tile._invalidateRect, 0, ctx.canvas.width);
			var w = tile._invalidateRect.xmax - tile._invalidateRect.xmin;
			var h = tile._invalidateRect.ymax - tile._invalidateRect.ymin;
			if(w > 0 && h > 0) {
				var offset = tile._canvas_offset - tile._offset[tile.layer];
				ctx.clearRect(offset + tile._invalidateRect.xmin, offset + tile._invalidateRect.ymin, w, h);
				ctx.drawImage(tile._original, offset + tile._invalidateRect.xmin, offset + tile._invalidateRect.ymin, w, h, offset + tile._invalidateRect.xmin, offset + tile._invalidateRect.ymin, w, h)
			}
			tile._invalidateRect = null;
			tile._modified = false
		}
		if(tile._modified && tile.img && tile.data_type[tile.layer] != "point") {
			if(tile.img.src != tile.img_url) {
				tile.img.src = tile.img_url
			}
			tile._invalidateRect = null;
			tile._modified = false
		}
	},
	drawTileUsingModifier: function(tile, that) {
		if(!tile.lista) {
			return
		}
		if(!tile.getContext) {
			return this.drawTileUsingModifierNonCanvas(tile, that)
		}
		var ctx, id, j, lst, use_custom_renderer, layer, last_drawn_id;
		tile._path = null;
		ctx = null;
		use_custom_renderer = mapway.mapFeatureRenderer != null;
		var lista = tile.lista[tile.layer];
		for(id in that.modifier) {
			if(!that.modifier[id] || !lista || !lista[id] || lista[id].length == 0) {
				continue
			}
			lst = lista[id];
			layer = id.split("_")[0];
			if(!tile.data[layer]) {
				continue
			}
			tile.styles = tile.styles_data[tile.layer];
			if(!tile._original) {
				tile._original = document.createElement("canvas");
				tile._original.width = tile.width;
				tile._original.height = tile.height;
				tile._original.getContext("2d").drawImage(tile, 0, 0)
			}
			if(!ctx) {
				ctx = tile.forceCtx || tile.getContext("2d");
				if(tile._canvas_offset && tile.obj.parent.group) {
					ctx.beginPath();
					ctx.rect(tile._canvas_offset, tile._canvas_offset, 256, 256);
					ctx.clip()
				}
			}
			last_drawn_id = null;
			for(j in lst) {
				var d = tile.data[layer][lst[j]];
				if(!d || !d.b) {
					continue
				}
				tile._modified = true;
				var offset = 0;
				if(d.ispoint) {
					mwself.drawImage(tile, that, ctx, d, null, that.modifier[id])
				} else {
					if(last_drawn_id != d.c) {
						mwself.finishPoly(tile, ctx);
						last_drawn_id = d.c
					}
					var s = mwself.overrideStyle(tile.styles[d.s], that.modifier[id]);
					offset = 0;
					if(use_custom_renderer && mapway.mapFeatureRendererHighlight) {
						var w = {};
						for(var k in s) {
							w[k] = s[k]
						}
						s = w;
						mapway.mapFeatureRendererHighlight(d, s)
					}
					s.linewidth && (offset = s.linewidth);
					s.width && (offset += s.width);
					mwself.drawCanvasPolygon(tile, ctx, d.p, s, d.s, id, null, 1, use_custom_renderer)
				}
				if(!tile._invalidateRect) {
					tile._invalidateRect = {};
					mwself.canvasUtils.rectAssign(tile._invalidateRect, d.b, offset)
				} else {
					mwself.canvasUtils.rectUnion(tile._invalidateRect, d.b, offset)
				}
			}
		}
		if(ctx) {
			mwself.finishPoly(tile, ctx);
		}
	},
	getHighlightColor: function(g) {
		var a = "selectcolor",
			b = fnl.getLayerById(g),
			f = this,
			j = fn.getMap(),
			e = b && b.options ? b.options : null;
		if(this.layersColor[g]) {
			return this.layersColor[g]
		}
		if(e) {
			$.each(e, function(l, o) {
				if(o.option_name == "HIGHLIGHT_COLOR") {
					a = Number(o.option_value);
					return -1
				}
			})
		}
		if(a == "selectcolor" && j && j.options && j.options.HIGHLIGHT_COLOR) {
			a = Number(j.options.HIGHLIGHT_COLOR)
		}
		if(isNaN(a)) {
			a = "selectcolor"
		}
		return f.layersColor[g] = a
	},
	modifyObject: function(feature_list, style, layer_id, clear, e, f) {
		layer_id = layer_id ? (layer_id + "").split("||")[0] : "";
		if(layer_id && !this.lid_map[layer_id]) {
			return
		}
		feature_list = feature_list ? feature_list + "" : "";
		if(clear && !this.has_modifier && !feature_list) {
			return
		}
		var i, color, sign, toClear = null,
			toClearLayers = null,
			had_modifier = false;
		if(isNaN(style.color)) {
			color = style.color
		} else {
			color = "#" + style.color.toString(16)
		}
		//		if(this.parent.group) {
		//			sign = feature_list + color + layer_id + clear + e + f;
		//			if(this.modify_sign == sign) {
		//				return
		//			}
		//			this.modify_sign = sign
		//		}
		if(clear) {
			toClear = this.modifier;
			toClearLayers = this.modifier_layers;
			had_modifier = this.has_modifier;
			this.modifier = {};
			this.has_modifier = false
		}
		this.modifier_layers = {};
		if(feature_list) {
			feature_list = feature_list.split(",");
			style = {
				color: color,
				linewidth: 1
			};
			for(i = 0; i < feature_list.length; i++) {
				if(feature_list[i] === "") {
					continue
				}
				this.modifier[layer_id + "_" + feature_list[i]] = style;
				this.modifier_layers[layer_id] = 1;
				this.has_modifier = true
			}
		}
		//		if(!this.parent.group) {
		if(toClearLayers) {
			for(layer_id in toClearLayers) {
				mwself.drawAcrossTiles(this, toClear, layer_id)
			}
		}
		for(layer_id in this.modifier_layers) {
			mwself.drawAcrossTiles(this, toClear, layer_id)
		}
		//		} else {
		//			if(had_modifier || this.has_modifier) {
		//				this.activeLayer = null;
		//				this.redraw()
		//			}
		//		}
		toClear = null
	},
	getCanvases: function() {
		return this._tiles;
	},
	newCanvas: function(oldCanvas) {
		var newCanvas = document.createElement("canvas");
		newCanvas.width = oldCanvas.width;
		newCanvas.height = oldCanvas.height;
		return newCanvas
	},
	//瓦片加载完成
	_tileLoaded: function(req, el, mwjson) {
		MWLayerAjax.apply(this, arguments);
		if(mwjson === null) {
			return null;
		}
		this.addTileData(req, this.drawTile, el, mwjson);
	},
	canvasUtils: {
		rectUnion: function(a, b, offset) {
			if(b.xmin - offset < a.xmin) {
				a.xmin = b.xmin - offset
			}
			if(b.ymin - offset < a.ymin) {
				a.ymin = b.ymin - offset
			}
			if(b.xmax + offset > a.xmax) {
				a.xmax = b.xmax + offset
			}
			if(b.ymax + offset > a.ymax) {
				a.ymax = b.ymax + offset
			}
		},
		rectCrop: function(a, min, max) {
			var i;
			for(i in a) {
				if(a[i] < min) {
					a[i] = min
				} else {
					if(a[i] > max) {
						a[i] = max
					}
				}
			}
		},
		rectAssign: function(a, b, offset) {
			a.xmin = b.xmin - offset;
			a.ymin = b.ymin - offset;
			a.xmax = b.xmax + offset;
			a.ymax = b.ymax + offset
		}
	},
	extendgc: {
		T: function(aJ, aB, aF) {
			if(!mwself._map._layers || mwself._map._layers.length == 0) { //!F || 
				return 0
			}
			aJ.mp = this.ae(aJ);
			//          ap = aJ.mp;
			var aI = Math.floor(aJ.mp.x);
			var aG = Math.floor(aJ.mp.y);
			var aZ = aJ.target._zoom;
			aJ.offsetX = 256 * (aJ.mp.x - aI);
			aJ.offsetY = 256 * (aJ.mp.y - aG);
			aJ.showMousePointer = 0;
			var I = null;
			var R = null;
			var aE = false;
			var aK;
			//          for (var aA = 0; aA < ar.length; ++aA) {
			var aC = mwself;
			if(aC._tilesToLoad && aC._tilesToLoad > 0) {
				aE = true
			}

			if(aC._tiles && aC.options.visible && aC._tiles[aI + ":" + aG + ":" + aZ] && aC._tiles[aI + ":" + aG + ":" + aZ].el.obj) {
				aK = aC._tiles[aI + ":" + aG + ":" + aZ];
				aJ.currentTile = aK;
				var aH = aK.el.obj.parent;
				aK.layer = aC.layer_info.id;
				aK.curLayerObj = aC;
				var aD = aK.el.obj.onMouseMove(aJ, aB, aF, aC);
				aK.el.obj.parent = aH;
				if(aD) {
					aD._offset = aJ.currentTile.el._offset[aK.layer];
					aD.coord = aJ.currentTile.el.coord;
					R = aD;
					aJ.showMousePointer = 1;
					return !(I && aD.c == I.c)
				}
			}
			//          }
			return !aE
		},
		ae: function(aB) {
			var aA = mwself._map.getPixelBounds();
			return {
				x: (aA.min.x + aB.layerPoint.x + mwself._map._mapPane._leaflet_pos.x) / 256,
				y: (aA.min.y + aB.layerPoint.y + mwself._map._mapPane._leaflet_pos.y) / 256,
				containerPoint: aB.containerPoint
			}
		},
		aw: function(aB, aC, aD) {
			aD = aD || R;
			if(aD && Z[aC]) {
				var aA = (1 << mwself._map._zoom);
				var aE = {
					id: aD.c ? aD.c.replace("_", "||") : "",
					object: aD
				};
				if(ap) {
					aE.x = q.xmin + q.max * ap.x / aA;
					aE.y = q.ymax - q.max * ap.y / aA;
					if(aD.coord) {
						aE.bounds = {
							xmin: q.xmin + ((aE.object.b.xmin - aD._offset) / 256 + aD.coord.x) * q.max / aA,
							xmax: q.xmin + ((aE.object.b.xmax - aD._offset) / 256 + aD.coord.x) * q.max / aA,
							ymin: q.ymax - ((aE.object.b.ymax - aD._offset) / 256 + aD.coord.y) * q.max / aA,
							ymax: q.ymax - ((aE.object.b.ymin - aD._offset) / 256 + aD.coord.y) * q.max / aA
						}
					}
				}
				if(aB && (aB.ctrlKey || (aB.originalEvent && aB.originalEvent.ctrlKey) || (aB.originalEvent && aB.originalEvent.metaKey))) {
					aE.key = 17
				}
				au(aC, aE);
				return
			}
		}
	}
});
let e = undefined;
let mwself = null;

export var MWLayer=LayerGroup.extend({
	initialize: function (url, options) {
		L.Util.setOptions(this, options);

		this._layers = {};

		if (geojson) {
			this.addData(geojson);
		}
	}
});
export var mapway = {
	Color: {
		constructor: function(C, E, q, z) {
			var I, O, Q, R, N, P, J, K, G, F, S, B, M, H, D, u;
			if(C !== e && typeof C == "number") {
				if(C > 255) {
					I = 255
				} else {
					if(C < 0) {
						I = 0
					} else {
						I = Math.round(C)
					}
				}
				M = true;
				H = true;
				u = true
			} else {
				D = true
			}
			if(E !== e && typeof E == "number") {
				if(E > 255) {
					O = 255
				} else {
					if(E < 0) {
						O = 0
					} else {
						O = Math.round(E)
					}
				}
				M = true;
				H = true;
				u = true
			} else {
				D = true
			}
			if(q !== e && typeof q == "number") {
				if(q > 255) {
					Q = 255
				} else {
					if(q < 0) {
						Q = 0
					} else {
						Q = Math.round(q)
					}
				}
				M = true;
				H = true;
				u = true
			} else {
				D = true
			}
			if(z !== e && typeof z == "number") {
				if(z > 100) {
					R = 100
				} else {
					if(z < 0) {
						R = 0
					} else {
						R = Math.round(z)
					}
				}
			} else {
				R = 100
			}
			M = true;
			H = true;
			u = true;
			this.hex = function() {
				var T = arguments[0],
					v = /^((#)|(0x))?([a-f0-9]{3}$)|([a-f0-9]{6}$)/i,
					r;
				if(T && typeof T == "string") {
					if(T.match(v)) {
						r = mapway.Color.hexToRgb(T);
						I = r[0];
						O = r[1];
						Q = r[2];
						M = true;
						H = true;
						u = true;
						return this
					} else {
						return mapway.Color.rgbToHex(this.rgb(), T)
					}
				} else {
					return mapway.Color.rgbToHex(this.rgb(), T)
				}
			};
			this.rgb = function() {
				var r, v;
				if(arguments.length > 0) {
					for(r = 0; r < 3; r++) {
						v = arguments[r];
						if(v !== e && v !== null && typeof v == "number") {
							if(v > 255) {
								v = 255
							} else {
								if(v < 0) {
									v = 0
								} else {
									v = Math.round(v)
								}
							}
							switch(r) {
								case 0:
									I = v;
									break;
								case 1:
									O = v;
									break;
								case 2:
									Q = v;
									break
							}
							M = true;
							H = true;
							u = true
						}
					}
					return this
				} else {
					if(D) {
						if(!M) {
							v = mapway.Color.hslToRgb(N, P, K)
						} else {
							if(!H) {
								v = mapway.Color.hsvToRgb(N, J, G)
							} else {
								if(!u) {
									v = mapway.Color.labToRgb(F, S, B)
								}
							}
						}
						I = v[0];
						O = v[1];
						Q = v[2];
						D = false
					}
					return [I, O, Q]
				}
			};
			this.rgba = function() {
				if(arguments.length > 0) {
					this.rgb.apply(this, Array.prototype.slice(arguments));
					if(arguments[3] != null) {
						this.alpha(arguments[3])
					}
					return this
				}
				if(D) {
					if(!M) {
						c = mapway.Color.hslToRgb(N, P, K)
					} else {
						if(!H) {
							c = mapway.Color.hsvToRgb(N, J, G)
						} else {
							if(!u) {
								c = mapway.Color.labToRgb(F, S, B)
							}
						}
					}
					I = c[0];
					O = c[1];
					Q = c[2];
					D = false
				}
				return [I, O, Q, R]
			};
			this.hsl = function(r) {
				var v, T;
				if(arguments.length === 3) {
					for(v = 0; v < 3; v++) {
						T = arguments[v];
						if(T !== e && T !== null && typeof T == "number") {
							if(v === 0) {
								if(T >= 360) {
									T -= 360
								} else {
									if(T < 0) {
										T += 360
									} else {
										T = Math.round(T)
									}
								}
								N = T
							} else {
								if(T > 100) {
									T = 100
								} else {
									if(T < 0) {
										T = 0
									}
								}
								if(v === 1) {
									P = T
								} else {
									K = T
								}
							}
							D = true;
							H = true;
							u = true
						}
					}
					M = false;
					return this
				} else {
					if(M) {
						if(!D) {
							T = mapway.Color.rgbToHsl(I, O, Q)
						} else {
							if(!H) {
								T = mapway.Color.hsvToHsl(N, J, G)
							} else {
								if(!u) {
									T = mapway.Color.labToHsl(F, S, B)
								}
							}
						}
						N = T[0];
						P = T[1];
						K = T[2];
						M = false
					}
					if(r) {
						return [Math.round(N), Math.round(P), Math.round(K)]
					} else {
						return [N, P, K]
					}
				}
			};
			this.hsv = function(r) {
				var v, T;
				if(arguments.length === 3) {
					for(v = 0; v < 3; v++) {
						T = arguments[v];
						if(T !== e && T !== null && typeof T == "number") {
							if(v === 0) {
								if(T >= 360) {
									T -= 360
								} else {
									if(T < 0) {
										T += 360
									} else {
										T = Math.round(T)
									}
								}
								N = T
							} else {
								if(T > 100) {
									T = 100
								} else {
									if(T < 0) {
										T = 0
									}
								}
								if(v === 1) {
									J = T
								} else {
									G = T
								}
							}
							D = true;
							M = true;
							u = true
						}
					}
					H = false;
					return this
				} else {
					if(H) {
						if(!D) {
							T = mapway.Color.rgbToHsv(I, O, Q)
						} else {
							if(!M) {
								T = mapway.Color.hslToHsv(N, P, K)
							} else {
								if(!u) {
									T = mapway.Color.labToRgb(F, S, B)
								}
							}
						}
						N = T[0];
						J = T[1];
						G = T[2];
						H = false
					}
					if(r) {
						return [Math.round(N), Math.round(J), Math.round(G)]
					} else {
						return [N, J, G]
					}
				}
			};
			this.lab = function(r) {
				var v, T;
				if(arguments.length === 3) {
					for(v = 0; v < 3; v++) {
						T = arguments[v];
						if(T !== e && T !== null && typeof T == "number") {
							if(v === 0) {
								F = T
							} else {
								if(v === 1) {
									S = T
								} else {
									B = T
								}
							}
							D = true;
							M = true;
							H = true
						}
					}
					u = false;
					return this
				} else {
					if(u) {
						if(!D) {
							T = mapway.Color.rgbToLab(I, O, Q)
						} else {
							if(!M) {
								T = mapway.Color.hslToLab(N, P, K)
							} else {
								if(!H) {
									T.mapway.Color.hsvToLab(N, J, G)
								}
							}
						}
						F = T[0];
						S = T[1];
						B = T[2];
						u = false
					}
					if(r) {
						return [Math.round(F), Math.round(S), Math.round(B)]
					} else {
						return [F, S, B]
					}
				}
			};
			this.alpha = function(r) {
				if(r !== e && typeof r == "number") {
					if(r > 100) {
						R = 100
					} else {
						if(r < 0) {
							R = 0
						} else {
							R = Math.round(r)
						}
					}
				} else {
					return R
				}
			};
			this.brighter = function o(r) {
				var q = this.hsl();
				r = r || 20;
				return mapway.Color.fromHsl(q[0], q[1], q[2] + r)
			};
			this.clone = function() {
				var r = this.rgba();
				return new mapway.Color.constructor(r[0], r[1], r[2], r[3])
			}
		},
		fromString: function(q) {
			return null || mapway.Color.fromRgbaString(q) || mapway.Color.fromRgbString(q) || mapway.Color.fromHex(q)
		},
		fromHex: function(r) {
			var q = mapway.Color.hexToRgb(r);
			return q && new mapway.Color.constructor(q[0], q[1], q[2])
		},
		fromRgbString: function(r) {
			var u = /^rgb\((\d+)[,\s]*(\d+)[,\s]*(\d+)\)$/i,
				q = r && r.match && r.match(u);
			if(q && q.length === 4) {
				return new mapway.Color.constructor(parseInt(q[1]), parseInt(q[2]), parseInt(q[3]))
			} else {
				return null
			}
		},
		fromRgbaString: function(v) {
			var u = /^rgba\((\d+)[,\s]*(\d+)[,\s]*(\d+)[,\s]*(\d+)\)$/i,
				q = v && v.match && v.match(u),
				r;
			if(q && q.length === 5) {
				r = parseInt(q[4]) < 1 ? parseInt(q[4]) * 100 : parseInt(q[4]);
				return new mapway.Color.constructor(parseInt(q[1]), parseInt(q[2]), parseInt(q[3]), r)
			} else {
				return null
			}
		},
		fromHsl: function(v, u, q) {
			var r = new mapway.Color.constructor();
			r.hsl(v, u, q);
			return r
		},
		hexToRgb: function(B) {
			var z, v, u, q;
			if(typeof B == "string") {
				q = B.match(/^(?:#|0x)?(?:([a-f0-9]{1,2})([a-f0-9]{1,2})([a-f0-9]{1,2}))$/i);
				if(q && q.length === 4) {
					z = parseInt(q[1], 16);
					v = parseInt(q[2], 16);
					u = parseInt(q[3], 16);
					return [z, v, u]
				} else {
					return null
				}
			} else {
				if(typeof B == "number") {
					z = (B & 16711680) >> 16;
					v = (B & 65280) >> 8;
					u = (B & 255);
					return(!isNaN(z + v + u) && [z, v, u]) || null
				}
			}
		},
		rgbToHsl: function(v, z, I) {
			var q, D, F, B, G, E, H, C, J, u;
			if(v.length && v.length === 3) {
				q = v[0] / 255;
				D = v[1] / 255;
				F = v[2] / 255
			} else {
				q = v / 255;
				D = z / 255;
				F = I / 255
			}
			B = Math.min(q, D, F);
			G = Math.max(q, D, F);
			E = G - B;
			H = G + B;
			u = H / 2;
			if(E === 0) {
				C = 0;
				J = 0
			} else {
				switch(G) {
					case q:
						C = (D - F) / E;
						break;
					case D:
						C = 2 + (F - q) / E;
						break;
					case F:
						C = 4 + (q - D) / E;
						break
				}
				C = Math.min(Math.round(C * 60), 360);
				C = (C < 0) ? C + 360 : C;
				if(u <= 0.5) {
					J = E / H
				} else {
					J = E / (2 - H)
				}
			}
			return [C, J * 100, u * 100]
		},
		hsvToHsl: function(r, B, C) {
			var z, u, q;
			if(r.length && r.length === 3) {
				z = r[0];
				u = r[1];
				q = r[2]
			} else {
				z = r;
				u = B;
				q = C
			}
			return mapway.Color.rgbToHsl(mapway.Color.hsvToRgb(z, u, q))
		},
		hsvToRgb: function(D, C, F) {
			var E, z, r, I, H, B, J, G;
			if(D.length && D.length === 3) {
				B = D[0];
				J = D[1] / 100;
				G = D[2] / 100
			} else {
				B = D;
				J = C / 100;
				G = F / 100
			}
			H = Math.floor(B / 60) % 6;
			E = B / 60 - Math.floor(B / 60);
			z = Math.round(255 * G * (1 - J));
			r = Math.round(255 * G * (1 - (J * E)));
			I = Math.round(255 * G * (1 - (J * (1 - E))));
			G = Math.round(255 * G);
			switch(H) {
				case 0:
					return [G, I, z];
				case 1:
					return [r, G, z];
				case 2:
					return [z, G, I];
				case 3:
					return [z, r, G];
				case 4:
					return [I, z, G];
				case 5:
					return [G, z, r]
			}
		},
		labToHsl: function(u, r, q) {
			var v = mapway.Color.labToXyz(u, r, q);
			return mapway.Color.rgbToHsv(mapway.Color.xyzToRgb(v))
		},
		xyzToRgb: function(u, D, C) {
			var B, v, q;
			if(u.length && u.length === 3) {
				D = u[1] / 100;
				C = u[2] / 100;
				u = u[0] / 100
			} else {
				u = u / 100;
				D = D / 100;
				C = C / 100
			}
			B = u * 3.2406 + D * -1.5372 + C * -0.4986;
			v = u * -0.9689 + D * 1.8758 + C * 0.0415;
			q = u * 0.0557 + D * -0.204 + C * 1.057;
			if(B > 0.0031308) {
				B = 1.055 * Math.pow(B, 1 / 2.4) - 0.055
			} else {
				B = 12.92 * B
			}
			if(v > 0.0031308) {
				v = 1.055 * Math.pow(v, 1 / 2.4) - 0.055
			} else {
				v = 12.92 * v
			}
			if(q > 0.0031308) {
				q = 1.055 * Math.pow(q, 1 / 2.4) - 0.055
			} else {
				q = 12.92 * q
			}
			B = B * 255;
			v = v * 255;
			q = q * 255;
			return [B, v, q]
		},
		labToXyz: function(v, u, r) {
			var q, C, B;
			if(v.length && v.length === 3) {
				u = v[1];
				r = v[2];
				v = v[0]
			}
			C = (v + 16) / 116;
			q = u / 500 + C;
			B = C - r / 200;
			if(C * C * C > 0.008856) {
				C = C * C * C
			} else {
				C = (C - 16 / 116) / 7.787
			}
			if(q * q * q > 0.008856) {
				q = q * q * q
			} else {
				q = (q - 16 / 116) / 7.787
			}
			if(B * B * B > 0.008856) {
				B = B * B * B
			} else {
				B = (B - 16 / 116) / 7.787
			}
			q = 95.047 * q;
			C = 100 * C;
			B = 108.883 * B;
			return [q, C, B]
		},
		rgbToHsv: function(u, z, H) {
			var q, D, F, B, G, E, C, J, I;
			if(u.length && u.length === 3) {
				q = u[0];
				D = u[1];
				F = u[2]
			} else {
				q = u;
				D = z;
				F = H
			}
			B = Math.min(q, D, F);
			G = Math.max(q, D, F);
			E = G - B;
			if(G === 0) {
				J = 0
			} else {
				J = E / G * 100
			}
			if(E === 0) {
				C = 0
			} else {
				switch(G) {
					case q:
						C = (D - F) / E;
						break;
					case D:
						C = 2 + (F - q) / E;
						break;
					case F:
						C = 4 + (q - D) / E;
						break
				}
				C = Math.min(Math.round(C * 60), 360);
				C = (C < 0) ? C + 360 : C
			}
			I = G / 255 * 100;
			return [C, J, I]
		},
		hslToRgb: function(F, B, H) {
			var q, D, G, E, C, u, z, I, v;
			if(F.length && F.length === 3) {
				z = F[0] / 360;
				I = F[1] / 100;
				v = F[2] / 100
			} else {
				z = F / 360;
				I = B / 100;
				v = H / 100
			}
			if(I === 0) {
				q = D = G = Math.round(v * 255);
				return [q, D, G]
			} else {
				C = (v < 0.5) ? v * (1 + I) : v + I - v * I;
				E = 2 * v - C;
				u = function(K, J, r) {
					var M;
					if(r < 0) {
						r = r + 1
					} else {
						if(r > 1) {
							r = r - 1
						}
					}
					if(6 * r < 1) {
						M = K + (J - K) * 6 * r
					} else {
						if(2 * r < 1) {
							M = J
						} else {
							if(3 * r < 2) {
								M = K + (J - K) * (2 / 3 - r) * 6
							} else {
								M = K
							}
						}
					}
					return M
				};
				q = u(E, C, z + 1 / 3);
				D = u(E, C, z);
				G = u(E, C, z - 1 / 3);
				return [Math.round(q * 255), Math.round(D * 255), Math.round(G * 255)]
			}
		},
		labToRgb: function(u, r, q) {
			var v = mapway.Color.labToXyz(u, r, q);
			return mapway.Color.xyzToRgb(v)
		},
		rgbToHex: function(C, B, q, D) {
			var v, u, z;
			if(C.length && C.length === 3) {
				if(typeof B == "string") {
					D = B
				}
				B = C[1];
				q = C[2];
				C = C[0]
			}
			v = (C > 15) ? C.toString(16) : "0" + C.toString(16);
			u = (B > 15) ? B.toString(16) : "0" + B.toString(16);
			z = (q > 15) ? q.toString(16) : "0" + q.toString(16);
			if(D === e || D === null) {
				D = "#"
			}
			return D + v + u + z
		}
	},
	math: {
		util: {
			clamp: function(val, low, high) {
				return Math.min(Math.max(val, low), high)
			},

			between: function(val, low, high) {
				return((val >= low) && (val <= high))
			},

			isPointInsidePolygon: function(polygon, point) {
				var nvert = polygon.length / 2,
					c = false,
					i, j;
				for(i = 0,
					j = nvert - 1; i < nvert; j = i++) {
					if(((polygon[i * 2 + 1] >= point.y) !== (polygon[j * 2 + 1] >= point.y)) && (point.x <= (polygon[j * 2] - polygon[i * 2]) * (point.y - polygon[i * 2 + 1]) / (polygon[j * 2 + 1] - polygon[i * 2 + 1]) + polygon[i * 2])) {
						c = !c
					}
				}
				return c
			},

			isProjectedPointInSegment: function(v1, v2, point) {
				var val, area, e1, e2;
				e1 = [v2[0] - v1[0], v2[1] - v1[1]];
				e2 = [point[0] - v1[0], point[1] - v1[1]];
				area = e1[0] * e1[0] + e1[1] * e1[1];
				val = e1[0] * e2[0] + e1[1] * e2[1];
				return(val > 0 && val < area)
			},

			isPointTouchingPath: function(path, point, radius) {
				var i, x, y, x1, y1, x2, y2, dx, dy, distance;
				x = point.x;
				y = point.y;
				for(i = 0; i < (path.length >> 1) - 1; i++) {
					x1 = path[((i + 0) << 1) + 0];
					y1 = path[((i + 0) << 1) + 1];
					x2 = path[((i + 1) << 1) + 0];
					y2 = path[((i + 1) << 1) + 1];
					if(this.isProjectedPointInSegment([x1, y1], [x2, y2], [x, y])) {
						dx = x2 - x1;
						dy = y2 - y1;
						distance = Math.abs((dy * x) - (dx * y) + (x2 * y1) - (y2 * x1)) / Math.sqrt(dy * dy + dx * dx);
						if(distance < radius) {
							return true
						}
					}
				}
				return false
			},
			pointDistance: function(x1, y1, x2, y2) {
				var dx = x1 - x2;
				var dy = y1 - y2;
				return Math.sqrt(dx * dx + dy * dy)
			},
			_boundedCenterOfGravity: function(polygon, offset, bounds) {
				var i, A2, areasum2 = 0,
					n = polygon.length - 2,
					centerOfGravity = {
						x: null,
						y: null,
						area: null
					},
					p1 = {
						x: clamp(offset.x + polygon[0], bounds.xmin, bounds.xmax),
						y: clamp(offset.y + polygon[1], bounds.ymin, bounds.ymax)
					},
					p2 = {
						x: null,
						y: null
					},
					p3 = {
						x: null,
						y: null
					};
				for(i = 2; i < n; i += 2) {
					p2.x = clamp(offset.x + polygon[i], bounds.xmin, bounds.xmax);
					p2.y = clamp(offset.y + polygon[i + 1], bounds.ymin, bounds.ymax);
					p3.x = clamp(offset.x + polygon[i + 2], bounds.xmin, bounds.xmax);
					p3.y = clamp(offset.y + polygon[i + 3], bounds.ymin, bounds.ymax);
					A2 = (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
					centerOfGravity.x += A2 * (p1.x + p2.x + p3.x);
					centerOfGravity.x += A2 * (p1.y + p2.y + p3.y);
					areasum2 += A2
				}
				centerOfGravity.area = areasum2;
				return centerOfGravity
			},

			_unboundedCenterOfGravity: function(polygon, offset) {
				var i, A2, areasum2 = 0,
					n = polygon.length - 2,
					centerOfGravity = {
						x: null,
						y: null,
						area: null
					},
					p1 = {
						x: offset.x + polygon[0],
						y: offset.y + polygon[1]
					},
					p2 = {
						x: null,
						y: null
					},
					p3 = {
						x: null,
						y: null
					};
				for(i = 2; i < n; i += 2) {
					p2.x = offset.x + polygon[i];
					p2.y = offset.y + polygon[i + 1];
					p3.x = offset.x + polygon[i + 2];
					p3.y = offset.y + polygon[i + 3];
					A2 = (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
					centerOfGravity.x += A2 * (p1.x + p2.x + p3.x);
					centerOfGravity.x += A2 * (p1.y + p2.y + p3.y);
					areasum2 += A2
				}
				centerOfGravity.area = areasum2;
				return centerOfGravity
			},

			findCenterOfGravity: function(polygon, offset, bounds) {
				offset = offset || {
					x: 0,
					y: 0
				};
				return(bounds ? this._boundedCenterOfGravity(polygon, offset, bounds) : this._unboundedCenterOfGravity(polygon, offset))
			},

			findCentroidOfPolygon: function(polygon, viewBounds) {
				var x = 0,
					y = 0,
					area = 0,
					bounds, points;
				for(i = 0; i < polygon.length; ++i) {
					bounds = polygon[j].p[0].b;
					points = polygon[j].p[0];
					if(!bounds.c || bounds.xmin < viewBounds.xmin || bounds.xmax > viewBounds.xmax || bounds.ymin < viewBounds.ymin || bounds.ymax > viewBounds.ymax) {
						bounds.c = this.findCG(points.p, points.cx, points.cy, viewBounds)
					}
					x += bounds.c[0];
					y += bounds.c[1];
					area += b.c[2]
				}
				x /= 3 * area;
				y /= 3 * area;
				return {
					x: x,
					y: y
				}
			}
		}
	},
	Bounds: function(h, d, e, g) {
		var f;
		if(h instanceof mapway.Bounds) {
			this.left = h.left;
			this.bottom = h.bottom;
			this.right = h.right;
			this.top = h.top
		} else {
			if(Array.isArray(h) && h.length) {
				f = mapway.fromBounds(h);
				if(!f.valid()) {
					return
				}
				this.left = f.left;
				this.bottom = f.bottom;
				this.right = f.right;
				this.top = f.top
			} else {
				this.left = (typeof h === "number") ? h : (parseFloat(h));
				this.bottom = (typeof d === "number") ? d : (parseFloat(d));
				this.right = (typeof e === "number") ? e : (parseFloat(e));
				this.top = (typeof g === "number") ? g : (parseFloat(g))
			}
		}
	},
	fromBounds: function(g) {
		var f, e, d;
		if(!g) {
			return new mapway.Bounds()
		}
		if(g instanceof mapway.Bounds) {
			return new mapway.Bounds(g)
		}
		if(Array.isArray(g)) {
			d = new mapway.Bounds();
			for(f = 0,
				e = g.length; f < e; f++) {
				if(!d.valid()) {
					d = new mapway.Bounds(g[f])
				} else {
					d.left = Math.min(d.left, g[f].left);
					d.bottom = Math.min(d.bottom, g[f].bottom);
					d.right = Math.max(d.right, g[f].right);
					d.top = Math.max(d.top, g[f].top)
				}
			}
			return d
		}
		return new mapway.Bounds(g.left, g.bottom, g.right, g.top)
	}

};
export var common = {
	getHighlightAndSelectColors: function(C) {
		var D;
		if(C && C.length) {
			D = mapway.Color.fromString(C);
			return [D.brighter(15).hex(), "#C9FFE5"]
		}
		return null
	},
	highlight: function(D, F, E, C) {
		D.modifyObject(F.toString(), {
			color: "selectcolor",
			alpha: 100,
			from_color: 13421772,
			glow: {
				color: 65280,
				strength: 2,
				blurX: 10,
				blurY: 10
			}
		}, E === null ? "" : ("layer" + E + "||"), C)
	},
	highlightMultiple: function(D, F, E, C) {
		D.modifyObject(F.join(), {
			color: "selectcolor",
			alpha: 100,
			from_color: 13421772,
			glow: {
				color: 65280,
				strength: 2,
				blurX: 10,
				blurY: 10
			}
		}, E === null ? "" : ("layer" + E + "||"), C)
	},
	tileSite: function() {
		var domain = "" || "giscloud.com";
		var subdomain_pattern = new RegExp("\\S+\\." + domain.replace(/\./g, "\\.") + "$", "i");
		//        alert(subdomain_pattern + "\n" + document.location.host + " " + (document.location.host.match(subdomain_pattern) ? "matches" : "does NOT match") );
		if(document && document.location && document.location.host && document.location.host !== "dev.giscloud.com" && document.location.host.match(subdomain_pattern)) {

			return document.location.protocol + "//" + document.location.host + "/";
		}

		return common.tileurl;
	},
	tileurl: "http://editor.giscloud.com/t/1325168292/map384888/layer1036216"
};