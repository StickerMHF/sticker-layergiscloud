/******/ (function(modules) { // webpackBootstrap
/******/ 	function hotDisposeChunk(chunkId) {
/******/ 		delete installedChunks[chunkId];
/******/ 	}
/******/ 	var parentHotUpdateCallback = window["webpackHotUpdate"];
/******/ 	window["webpackHotUpdate"] = 
/******/ 	function webpackHotUpdateCallback(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		hotAddUpdateChunk(chunkId, moreModules);
/******/ 		if(parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/ 	} ;
/******/ 	
/******/ 	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
/******/ 		var head = document.getElementsByTagName("head")[0];
/******/ 		var script = document.createElement("script");
/******/ 		script.type = "text/javascript";
/******/ 		script.charset = "utf-8";
/******/ 		script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";
/******/ 		;
/******/ 		head.appendChild(script);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadManifest(requestTimeout) { // eslint-disable-line no-unused-vars
/******/ 		requestTimeout = requestTimeout || 10000;
/******/ 		return new Promise(function(resolve, reject) {
/******/ 			if(typeof XMLHttpRequest === "undefined")
/******/ 				return reject(new Error("No browser support"));
/******/ 			try {
/******/ 				var request = new XMLHttpRequest();
/******/ 				var requestPath = __webpack_require__.p + "" + hotCurrentHash + ".hot-update.json";
/******/ 				request.open("GET", requestPath, true);
/******/ 				request.timeout = requestTimeout;
/******/ 				request.send(null);
/******/ 			} catch(err) {
/******/ 				return reject(err);
/******/ 			}
/******/ 			request.onreadystatechange = function() {
/******/ 				if(request.readyState !== 4) return;
/******/ 				if(request.status === 0) {
/******/ 					// timeout
/******/ 					reject(new Error("Manifest request to " + requestPath + " timed out."));
/******/ 				} else if(request.status === 404) {
/******/ 					// no update available
/******/ 					resolve();
/******/ 				} else if(request.status !== 200 && request.status !== 304) {
/******/ 					// other failure
/******/ 					reject(new Error("Manifest request to " + requestPath + " failed."));
/******/ 				} else {
/******/ 					// success
/******/ 					try {
/******/ 						var update = JSON.parse(request.responseText);
/******/ 					} catch(e) {
/******/ 						reject(e);
/******/ 						return;
/******/ 					}
/******/ 					resolve(update);
/******/ 				}
/******/ 			};
/******/ 		});
/******/ 	}
/******/
/******/ 	
/******/ 	
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "2906a989a0a8d8e3e5cc"; // eslint-disable-line no-unused-vars
/******/ 	var hotRequestTimeout = 10000;
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentChildModule; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParents = []; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParentsTemp = []; // eslint-disable-line no-unused-vars
/******/ 	
/******/ 	function hotCreateRequire(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var me = installedModules[moduleId];
/******/ 		if(!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if(me.hot.active) {
/******/ 				if(installedModules[request]) {
/******/ 					if(installedModules[request].parents.indexOf(moduleId) < 0)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 				} else {
/******/ 					hotCurrentParents = [moduleId];
/******/ 					hotCurrentChildModule = request;
/******/ 				}
/******/ 				if(me.children.indexOf(request) < 0)
/******/ 					me.children.push(request);
/******/ 			} else {
/******/ 				console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		var ObjectFactory = function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for(var name in __webpack_require__) {
/******/ 			if(Object.prototype.hasOwnProperty.call(__webpack_require__, name) && name !== "e") {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId) {
/******/ 			if(hotStatus === "ready")
/******/ 				hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/ 				finishChunkLoading();
/******/ 				throw err;
/******/ 			});
/******/ 	
/******/ 			function finishChunkLoading() {
/******/ 				hotChunksLoading--;
/******/ 				if(hotStatus === "prepare") {
/******/ 					if(!hotWaitingFilesMap[chunkId]) {
/******/ 						hotEnsureUpdateChunk(chunkId);
/******/ 					}
/******/ 					if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 						hotUpdateDownloaded();
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/ 	
/******/ 	function hotCreateModule(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 			_main: hotCurrentChildModule !== moduleId,
/******/ 	
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfAccepted = true;
/******/ 				else if(typeof dep === "function")
/******/ 					hot._selfAccepted = dep;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				else
/******/ 					hot._acceptedDependencies[dep] = callback || function() {};
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfDeclined = true;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 				else
/******/ 					hot._declinedDependencies[dep] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if(!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if(idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		hotCurrentChildModule = undefined;
/******/ 		return hot;
/******/ 	}
/******/ 	
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/ 	
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for(var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/ 	
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailableFilesMap = {};
/******/ 	var hotDeferred;
/******/ 	
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/ 	
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = (+id) + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/ 	
/******/ 	function hotCheck(apply) {
/******/ 		if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
/******/ 		hotApplyOnUpdate = apply;
/******/ 		hotSetStatus("check");
/******/ 		return hotDownloadManifest(hotRequestTimeout).then(function(update) {
/******/ 			if(!update) {
/******/ 				hotSetStatus("idle");
/******/ 				return null;
/******/ 			}
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/ 	
/******/ 			hotSetStatus("prepare");
/******/ 			var promise = new Promise(function(resolve, reject) {
/******/ 				hotDeferred = {
/******/ 					resolve: resolve,
/******/ 					reject: reject
/******/ 				};
/******/ 			});
/******/ 			hotUpdate = {};
/******/ 			var chunkId = 0;
/******/ 			{ // eslint-disable-line no-lone-blocks
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if(hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 			return promise;
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		if(!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for(var moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if(!hotAvailableFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var deferred = hotDeferred;
/******/ 		hotDeferred = null;
/******/ 		if(!deferred) return;
/******/ 		if(hotApplyOnUpdate) {
/******/ 			// Wrap deferred object in Promise to mark it as a well-handled Promise to
/******/ 			// avoid triggering uncaught exception warning in Chrome.
/******/ 			// See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
/******/ 			Promise.resolve().then(function() {
/******/ 				return hotApply(hotApplyOnUpdate);
/******/ 			}).then(
/******/ 				function(result) {
/******/ 					deferred.resolve(result);
/******/ 				},
/******/ 				function(err) {
/******/ 					deferred.reject(err);
/******/ 				}
/******/ 			);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for(var id in hotUpdate) {
/******/ 				if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			deferred.resolve(outdatedModules);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotApply(options) {
/******/ 		if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
/******/ 		options = options || {};
/******/ 	
/******/ 		var cb;
/******/ 		var i;
/******/ 		var j;
/******/ 		var module;
/******/ 		var moduleId;
/******/ 	
/******/ 		function getAffectedStuff(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/ 	
/******/ 			var queue = outdatedModules.slice().map(function(id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while(queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				module = installedModules[moduleId];
/******/ 				if(!module || module.hot._selfAccepted)
/******/ 					continue;
/******/ 				if(module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if(module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for(var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if(!parent) continue;
/******/ 					if(parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if(outdatedModules.indexOf(parentId) >= 0) continue;
/******/ 					if(parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if(!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 	
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/ 	
/******/ 		function addAllToSet(a, b) {
/******/ 			for(var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if(a.indexOf(item) < 0)
/******/ 					a.push(item);
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/ 	
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/ 			console.warn("[HMR] unexpected require(" + result.moduleId + ") to disposed module");
/******/ 		};
/******/ 	
/******/ 		for(var id in hotUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				moduleId = toModuleId(id);
/******/ 				var result;
/******/ 				if(hotUpdate[id]) {
/******/ 					result = getAffectedStuff(moduleId);
/******/ 				} else {
/******/ 					result = {
/******/ 						type: "disposed",
/******/ 						moduleId: id
/******/ 					};
/******/ 				}
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if(result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch(result.type) {
/******/ 					case "self-declined":
/******/ 						if(options.onDeclined)
/******/ 							options.onDeclined(result);
/******/ 						if(!options.ignoreDeclined)
/******/ 							abortError = new Error("Aborted because of self decline: " + result.moduleId + chainInfo);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if(options.onDeclined)
/******/ 							options.onDeclined(result);
/******/ 						if(!options.ignoreDeclined)
/******/ 							abortError = new Error("Aborted because of declined dependency: " + result.moduleId + " in " + result.parentId + chainInfo);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if(options.onUnaccepted)
/******/ 							options.onUnaccepted(result);
/******/ 						if(!options.ignoreUnaccepted)
/******/ 							abortError = new Error("Aborted because " + moduleId + " is not accepted" + chainInfo);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if(options.onAccepted)
/******/ 							options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if(options.onDisposed)
/******/ 							options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if(abortError) {
/******/ 					hotSetStatus("abort");
/******/ 					return Promise.reject(abortError);
/******/ 				}
/******/ 				if(doApply) {
/******/ 					appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for(moduleId in result.outdatedDependencies) {
/******/ 						if(Object.prototype.hasOwnProperty.call(result.outdatedDependencies, moduleId)) {
/******/ 							if(!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(outdatedDependencies[moduleId], result.outdatedDependencies[moduleId]);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if(doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for(i = 0; i < outdatedModules.length; i++) {
/******/ 			moduleId = outdatedModules[i];
/******/ 			if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/ 	
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/ 			if(hotAvailableFilesMap[chunkId] === false) {
/******/ 				hotDisposeChunk(chunkId);
/******/ 			}
/******/ 		});
/******/ 	
/******/ 		var idx;
/******/ 		var queue = outdatedModules.slice();
/******/ 		while(queue.length > 0) {
/******/ 			moduleId = queue.pop();
/******/ 			module = installedModules[moduleId];
/******/ 			if(!module) continue;
/******/ 	
/******/ 			var data = {};
/******/ 	
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for(j = 0; j < disposeHandlers.length; j++) {
/******/ 				cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/ 	
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/ 	
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/ 	
/******/ 			// when disposing there is no need to call dispose handler
/******/ 			delete outdatedDependencies[moduleId];
/******/ 	
/******/ 			// remove "parents" references from all children
/******/ 			for(j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if(!child) continue;
/******/ 				idx = child.parents.indexOf(moduleId);
/******/ 				if(idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// remove outdated dependency from module children
/******/ 		var dependency;
/******/ 		var moduleOutdatedDependencies;
/******/ 		for(moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				module = installedModules[moduleId];
/******/ 				if(module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					for(j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 						dependency = moduleOutdatedDependencies[j];
/******/ 						idx = module.children.indexOf(dependency);
/******/ 						if(idx >= 0) module.children.splice(idx, 1);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/ 	
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/ 	
/******/ 		// insert new code
/******/ 		for(moduleId in appliedUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for(moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				module = installedModules[moduleId];
/******/ 				if(module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					var callbacks = [];
/******/ 					for(i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 						dependency = moduleOutdatedDependencies[i];
/******/ 						cb = module.hot._acceptedDependencies[dependency];
/******/ 						if(cb) {
/******/ 							if(callbacks.indexOf(cb) >= 0) continue;
/******/ 							callbacks.push(cb);
/******/ 						}
/******/ 					}
/******/ 					for(i = 0; i < callbacks.length; i++) {
/******/ 						cb = callbacks[i];
/******/ 						try {
/******/ 							cb(moduleOutdatedDependencies);
/******/ 						} catch(err) {
/******/ 							if(options.onErrored) {
/******/ 								options.onErrored({
/******/ 									type: "accept-errored",
/******/ 									moduleId: moduleId,
/******/ 									dependencyId: moduleOutdatedDependencies[i],
/******/ 									error: err
/******/ 								});
/******/ 							}
/******/ 							if(!options.ignoreErrored) {
/******/ 								if(!error)
/******/ 									error = err;
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Load self accepted modules
/******/ 		for(i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch(err) {
/******/ 				if(typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch(err2) {
/******/ 						if(options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "self-accept-error-handler-errored",
/******/ 								moduleId: moduleId,
/******/ 								error: err2,
/******/ 								orginalError: err, // TODO remove in webpack 4
/******/ 								originalError: err
/******/ 							});
/******/ 						}
/******/ 						if(!options.ignoreErrored) {
/******/ 							if(!error)
/******/ 								error = err2;
/******/ 						}
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				} else {
/******/ 					if(options.onErrored) {
/******/ 						options.onErrored({
/******/ 							type: "self-accept-errored",
/******/ 							moduleId: moduleId,
/******/ 							error: err
/******/ 						});
/******/ 					}
/******/ 					if(!options.ignoreErrored) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if(error) {
/******/ 			hotSetStatus("fail");
/******/ 			return Promise.reject(error);
/******/ 		}
/******/ 	
/******/ 		hotSetStatus("idle");
/******/ 		return new Promise(function(resolve) {
/******/ 			resolve(outdatedModules);
/******/ 		});
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(0)(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["noConflict"] = noConflict;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__MW_Layers_js__ = __webpack_require__(1);
/**
 *@author mhf
 * @copyright mhf
 * @
 */

var oldL = window.MWL;
function noConflict() {
	debugger
	window.MWL = oldL;
	return this;
}
//// Always export us to window global (see #2364)
window.MWL = __WEBPACK_IMPORTED_MODULE_0__MW_Layers_js__;




/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MWLayerAjax", function() { return MWLayerAjax; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MWTileLayer", function() { return MWTileLayer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MWLayer", function() { return MWLayer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MWGlobal", function() { return MWGlobal; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mapway", function() { return mapway; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "common", function() { return common; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__static_layersinfo_json__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__static_layersinfo_json___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__static_layersinfo_json__);


/**
 *@author mhf
 * @copyright mhf
 * @date 2017.12.8
 * Used to load and display tile layers on the map. Extends `leaflet`.
 */
var MWLayerAjax = __WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.TileLayer.extend({
	_requests: [],

	//通过行列号生成并请求数据
	_addTile: function(coords, container) {
		var tilePos = this._getTilePos(coords),
			key = this._tileCoordsToKey(coords);
		this._createTileCanvas();
		var tile = this.createTile(this._wrapCoords(coords), __WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.Util.bind(this._tileReady, this, coords));

		this._initTile(tile);

		// if createTile is defined with a second argument ("done" callback),
		// we know that tile is async and will be ready later; otherwise
		if(this.createTile.length < 2) {
			// mark tile as ready, but delay one frame for opacity animation to happen
			__WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.Util.requestAnimFrame(__WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.Util.bind(this._tileReady, this, coords, null, tile));
		}

		__WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.DomUtil.setPosition(tile, tilePos);

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
		var that = this;
		V._layer = this;
		V.onload = this._tileOnLoad;
		V.onerror = this._tileOnError;
		V._layer = this;
		V.ontileload = function() {
			this._layer._tileOnLoad.call(this);
			//			if(that._layer._oldContainer) {
			//				I(that)
			//			}
			this.ontileload = null;
		};
		if(that.options.visible) {
			that._loadTile(V, U, that)
		}
	},
	//瓦片加载完成事件
	_tileOnLoad: function() {
		var t = this._layer;
		this.src !== __WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.Util.emptyImageUrl && (__WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.DomUtil.addClass(this, "leaflet-tile-loaded"),
				t.fire("tileload", {
					tile: this,
					url: this.src
				})),
			t._tilesLoaded()
	},
	_tilesLoaded: function() {
		this._tilesToLoad--,
			this._tilesToLoad || this.fire("tilesload")
	},
	// 生成地址并发送ajax请求
	_loadTile: function(tile, tilePoint, that) {
		var uri = "";
		//		tile.src = this.getTileUrl(e);

		uri += tilePoint.z + "/" + tilePoint.x + "/" + tilePoint.y;

		that.url2 = MWGlobal.mwlayergroup.url;
		var index = MWGlobal.mwlayergroup.mwlayers.findIndex(item => item.id == that.options.id);
		tile.obj = MWGlobal.mwlayergroup.mwlayers[index].layer;
		tile.obj.layer_info = MWGlobal.mwlayergroup.mwlayers[index].layer_info;
		tile.obj.parent = that;
		tile.zoom = tilePoint.z;
		tile.coord = tilePoint;
		//		tile._loader_id = this.loader_id;
		tile.uri_for_request = uri;
		uri += "/" + that.options.mid;
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
		if(!MWGlobal.mwlayergroup.tile_request[uri]) {
			MWGlobal.mwlayergroup.tile_req_seq++;
			MWGlobal.mwlayergroup.tile_request[uri] = {
				tiles: [],
				layers: [],
				timestamps: [],
				attribs: [],
				seq: MWGlobal.mwlayergroup.tile_req_seq,
				present: {}
			};
			MWGlobal.mwlayergroup.tile_req.push({
				coord: tilePoint,
				tile: tile,
				that: that,
				uri: uri,
				uri_for_request: tile.uri_for_request
			})
		}
		if(!MWGlobal.mwlayergroup.tile_request[uri].present[that.options.id]) {
			MWGlobal.mwlayergroup.tile_request[uri].tiles.push(tile);
			MWGlobal.mwlayergroup.tile_request[uri].layers.push(that.options.id);
			//			this.tile_request[uri].timestamps.push(that.modified);
			MWGlobal.mwlayergroup.tile_request[uri].present[that.options.id] = true;
			//			if(attribs) {
			//				this.tile_request[uri].attribs = attribs.concat(tile_request[uri].attribs)
			//			}
		}
		this._tilesLoaded();
		//this.ajaxLoader(this.url2 + "/" + tile.uri_for_request + ".json", tile, tile.uri);
		//		this._adjustTilePoint(tilePoint);

	},

	//创建canvas
	_createTileCanvas: function() {
		this._tileCanvas = __WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.DomUtil.create("canvas", "leaflet-tile leaflet-tile-loaded");
		var U = this.options.tileSize;
		this._tileCanvas.width = U;
		this._tileCanvas.height = U
	},
	_reset: function() {
		__WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.TileLayer.prototype._reset.apply(this, arguments);
		for(var i = 0; i < this._requests.length; i++) {
			this._requests[i].abort();
		}
		this._requests = [];
	},
	_update: function(center) {
		if(this._map && this._map._panTransition && this._map._panTransition._inProgress) {
			return;
		}
		if(this._tilesToLoad < 0) {
			this._tilesToLoad = 0;
		}

		var map = this._map;
		if(!map) {
			return;
		}
		var zoom = this._clampZoom(map.getZoom());
		if(center === undefined) {
			center = map.getCenter();
		}
		if(this._tileZoom === undefined) {
			return;
		} // if out of minzoom/maxzoom

		var pixelBounds = this._getTiledPixelBounds(center),
			tileRange = this._pxBoundsToTileRange(pixelBounds),
			tileCenter = tileRange.getCenter(),
			queue = [],
			margin = this.options.keepBuffer,
			noPruneRange = new __WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.Bounds(tileRange.getBottomLeft().subtract([margin, -margin]),
				tileRange.getTopRight().add([margin, -margin]));

		// Sanity check: panic if the tile range contains Infinity somewhere.
		if(!(isFinite(tileRange.min.x) &&
				isFinite(tileRange.min.y) &&
				isFinite(tileRange.max.x) &&
				isFinite(tileRange.max.y))) {
			throw new Error('Attempted to load an infinite number of tiles');
		}

		for(var key in this._tiles) {
			var c = this._tiles[key].coords;
			if(c.z !== this._tileZoom || !noPruneRange.contains(new __WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.Point(c.x, c.y))) {
				this._tiles[key].current = false;
			}
		}

		// _update just loads more tiles. If the tile zoom level differs too much
		// from the map's, let _setView reset levels and prune old tiles.
		if(Math.abs(zoom - this._tileZoom) > 1) {
			this._setView(center, zoom);
			return;
		}

		// create a queue of coordinates to load tiles from
		for(var j = tileRange.min.y; j <= tileRange.max.y; j++) {
			for(var i = tileRange.min.x; i <= tileRange.max.x; i++) {
				var coords = new __WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.Point(i, j);
				coords.z = this._tileZoom;

				if(!this._isValidTile(coords)) {
					continue;
				}

				var tile = this._tiles[this._tileCoordsToKey(coords)];
				if(tile) {
					tile.current = true;
				} else {
					queue.push(coords);
				}
			}
		}

		// sort tile queue to load tiles in order of their distance to center
		queue.sort(function(a, b) {
			return a.distanceTo(tileCenter) - b.distanceTo(tileCenter);
		});

		if(queue.length !== 0) {
			// if it's the first batch of tiles to load
			if(!this._loading) {
				this._loading = true;
				// @event loading: Event
				// Fired when the grid layer starts loading tiles.
				this.fire('loading');
			}

			// create DOM fragment to append tiles in one batch
			var fragment = document.createDocumentFragment();
			this._tilesToLoad = queue.length;
			for(i = 0; i < queue.length; i++) {
				this._addTile(queue[i], fragment);
			}

			this._level.el.appendChild(fragment);
		}
	}
});
var MWTileLayer = MWLayerAjax.extend({
	// Store each GeometryCollection's layer by key, if options.unique function is present
	_keyLayers: {},

	// Used to calculate svg path string for clip path elements
	_clipPathRectangles: {},

	initialize: function(url, options, geojsonOptions) {

		this._selectable = true;
		MWLayerAjax.prototype.initialize.call(this, url, options);
		//		this.geojsonLayer = new L.GeoJSON(null, geojsonOptions);
	},
	onAdd: function(map) {
		this.isMouseDown = false;
		this.hoverModifier = {};
		this.modifier = {};
		MWLayerAjax.prototype.onAdd.call(this, map);
		//this._initMapEvent();
		//		this.modifyObject("", {
		//			color: 16760576,
		//			orig_color: 13421772
		//		}, "", true);
		//		map.addLayer(this.geojsonLayer);
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
		if(layer instanceof __WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.Path) {
			func(layer);
		} else if(layer instanceof __WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.LayerGroup) {
			// Recurse each child layer
			layer.getLayers().forEach(this._recurseLayerUntilPath.bind(this, func), this);
		}
	},

	_clipLayerToTileBoundary: function(layer, tilePoint) {
		// Only perform SVG clipping if the browser is using SVG
		if(!__WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.Path.SVG) {
			return;
		}
		if(!this._map) {
			return;
		}

		if(!this._map._pathRoot) {
			this._map._pathRoot = __WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.Path.prototype._createElement('svg');
			this._map._panes.overlayPane.appendChild(this._map._pathRoot);
		}
		var svg = this._map._pathRoot;

		// create the defs container if it doesn't exist
		var defs = null;
		if(svg.getElementsByTagName('defs').length === 0) {
			defs = document.createElementNS(__WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.Path.SVG_NS, 'defs');
			svg.insertBefore(defs, svg.firstChild);
		} else {
			defs = svg.getElementsByTagName('defs')[0];
		}

		// Create the clipPath for the tile if it doesn't exist
		var clipPathId = this._getUniqueId() + 'tileClipPath_' + tilePoint.z + '_' + tilePoint.x + '_' + tilePoint.y;
		var clipPath = document.getElementById(clipPathId);
		if(clipPath === null) {
			clipPath = document.createElementNS(__WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.Path.SVG_NS, 'clipPath');
			clipPath.id = clipPathId;

			// Create a hidden L.Rectangle to represent the tile's area
			var tileSize = this.options.tileSize,
				nwPoint = tilePoint.multiplyBy(tileSize),
				sePoint = nwPoint.add([tileSize, tileSize]),
				nw = this._map.unproject(nwPoint),
				se = this._map.unproject(sePoint);
			this._clipPathRectangles[clipPathId] = new __WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.Rectangle(new __WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.LatLngBounds([nw, se]), {
				opacity: 0,
				fillOpacity: 0,
				clickable: false,
				noClip: true
			});
			this._map.addLayer(this._clipPathRectangles[clipPathId]);

			// Add a clip path element to the SVG defs element
			// With a path element that has the hidden rectangle's SVG path string  
			var path = document.createElementNS(__WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.Path.SVG_NS, 'path');
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
					that.drawImage(tile, that, ctx, d, null, that.modifier[id])
				} else {
					if(last_drawn_id != d.c) {
						that.finishPoly(tile, ctx);
						last_drawn_id = d.c
					}
					var s = that.overrideStyle(tile.styles[d.s], that.modifier[id]);
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
					that.drawCanvasPolygon(tile, ctx, d.p, s, d.s, id, null, 1, use_custom_renderer)
				}
				if(!tile._invalidateRect) {
					tile._invalidateRect = {};
					that.canvasUtils.rectAssign(tile._invalidateRect, d.b, offset)
				} else {
					that.canvasUtils.rectUnion(tile._invalidateRect, d.b, offset)
				}
			}
		}
		if(ctx) {
			that.finishPoly(tile, ctx);
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
				this.drawAcrossTiles(this, toClear, layer_id)
			}
		}
		for(layer_id in this.modifier_layers) {
			this.drawAcrossTiles(this, toClear, layer_id)
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
	//鼠标事件
	handleEvent: function(c, x, y, evt, delta) {
		var that = this;
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
			if(that.hoverModifier.isset) {
				if(c.obj._hoveredElement === selected.c && c.layer === that.hoverModifier.layer) {
					if(c.fields && c.fields[elem.c]) {
						elem.attributes = c.fields[elem.c]
					}
					return elem
				}
				if(shouldHighlight) {
					shouldRedraw = that.clearHover() || shouldRedraw
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
					that.hoverModifier.isset = true;
					that.hoverModifier.color = c.styles[style_index].highlightcolor;
					that.hoverModifier.hover = true;
					that.hoverModifier.orig = c.obj.modifier[selected.c];
					that.hoverModifier.orig_obj = c.obj;
					that.hoverModifier.orig_key = selected.c;
					that.hoverModifier.layer = c.layer;
					that.hoverModifier.layerObj = c.curLayerObj;
					c.obj.modifier[selected.c] = that.hoverModifier;
					c.obj._hoveredElement = selected.c;
					shouldRedraw = that.drawAcrossTiles(c.obj, true) || shouldRedraw
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
		if(that.hoverModifier.isset && c.layer === that.hoverModifier.layer) { //flashnavigator.hasCanvas && 
			shouldRedraw = that.clearHover() || shouldRedraw
		}
		if(shouldRedraw) {
			c.obj.redraw()
		}
		return false
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
	//绘制Geom
	drawGeom: function(el, data, dontRender) {
		var that=this;
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
					that.setupFiltersObject(el, object)
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
			if(this.drawImage(el, el.obj, ctx, data[i], f)) {
				el.featureIds.push(+data[i].c.split("_")[1])
			}
		}
		if(el.obj.modifier) {
			this.drawTileUsingModifier(el, el.obj)
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
			this.drawPointCanvas(ctx, d, obj._layer, imgs);
			if(modifier) {
				var c = this.getImageOverlay(imgs, modifier, d, obj._layer);
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
			this.drawPointCanvas(ic_ctx, d, layer, imgs, 0, 0, true);
			ic_ctx.globalAlpha = 1;
			var style = this.overrideStyle(imgs, modifier);
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
	drawText: function(el) {
		var filter = null;
		if(el.obj.feature_filter && el.obj.feature_filter.filter) {
			filter = el.obj.feature_filter.filter
		}
		var fields = el.fields;
		var d = 100;
		if(el._canvas_offset > d) {
			d = el._canvas_offset
		}
		this.expandCanvas(el, d);
		el.data_type[el.layer] = "text";
		var data = el.data[el.layer];
		var dlen = data.length;
		if(dlen < 1) {
			return
		}
		if(!el.getContext) {
			this.drawTextDOM(el, data, filter);
			return
		}
		var ctx = el.forceCtx || el.getContext("2d");
		ctx.lineWidth = 3;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		var last_feature_id = -1;
		var dx, dy, fs_with_margin;
		for(var i = 0; i < dlen; i++) {
			if(last_feature_id != data[i].i && data[i].i >= 0) {
				last_feature_id = data[i].i;
				var f = el.curLayerObj.features[data[i].i];
				if(f.visible === false) {
					ctx.clearRect(0, 0, el.width, el.height);
					continue
				}
				if(f.outline) {
					ctx.strokeStyle = "#" + f.outline.substr(2)
				}
				if(f.color) {
					ctx.fillStyle = "#" + f.color.substr(2)
				} else {
					ctx.fillStyle = "rgba(255, 255, 255, 0)"
				}
				dx = 0;
				dy = 0;
				f.dx && (dx = f.dx);
				f.dy && (dy = f.dy);
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				var al = f.anchor;
				if(al) {
					if(al == "TL") {
						ctx.textBaseline = "top";
						ctx.textAlign = "left"
					} else {
						if(al == "T") {
							ctx.textBaseline = "top"
						} else {
							if(al == "TR") {
								ctx.textBaseline = "top";
								ctx.textAlign = "right"
							} else {
								if(al == "R") {
									ctx.textAlign = "right"
								} else {
									if(al == "BR") {
										ctx.textBaseline = "bottom";
										ctx.textAlign = "right"
									} else {
										if(al == "B") {
											ctx.textBaseline = "bottom"
										} else {
											if(al == "BL") {
												ctx.textBaseline = "bottom";
												ctx.textAlign = "left"
											} else {
												if(al == "L") {
													ctx.textAlign = "left"
												}
											}
										}
									}
								}
							}
						}
					}
				}
				var fontname = "arial";
				if(f.fontname) {
					fontname = f.fontname
				}
				ctx.font = data[0].fs + "px " + fontname;
				fs_with_margin = data[0].fs * 1 + 2
			}
			var text = data[i].text;
			text = text.split("\n");
			var p = data[i].p;
			var plen = p.length;
			for(var k = 0; k < plen; k++) {
				if(filter) {
					var item = {};
					if(fields && p[k][4]) {
						item.data = fields[p[k][4].replace("||", "_")]
					}
					this.setupFiltersObject(el, item);
					if(!item.data || !filter(item.data)) {
						continue
					}
				}
				el.featureCount += text.length;
				for(var j = 0; j < text.length; j++) {
					ctx.save();
					ctx.translate(p[k][0] + d + dx, p[k][1] + d + dy + fs_with_margin * j);
					ctx.rotate(p[k][2] / 180 * Math.PI);
					if(f.outline) {
						ctx.strokeText(text[j], 0, 0)
					}
					ctx.fillText(text[j], 0, 0);
					ctx.restore()
				}
			}
		}
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
	drawTextDOM: function(el, data, filter) {
		var d = el._offset[el.layer];
		var dx = 0;
		var dy = 0;
		var fields = el.fields;
		var dlen = data.length;
		var last_feature_id = -1;
		var fill, vertical_offset, offsetX, fontname, halign;
		for(var i = 0; i < dlen; i++) {
			if(last_feature_id != data[i].i && data[i].i >= 0) {
				var f = el.curLayerObj.features[data[i].i];
				if(f.color) {
					fill = "#" + f.color.substr(2)
				} else {
					fill = "#000"
				}
				vertical_offset = Math.ceil(data[0].fs / 2);
				var al = f.anchor;
				halign = -1;
				dx = dy = 0;
				f.dx && (dx = f.dx);
				f.dy && (dy = f.dy);
				dy -= vertical_offset;
				if(al) {
					if(al == "TL") {
						dy += vertical_offset;
						halign = 0
					} else {
						if(al == "T") {
							dy += vertical_offset
						} else {
							if(al == "TR") {
								dy += vertical_offset;
								halign = 2
							} else {
								if(al == "R") {
									halign = 2
								} else {
									if(al == "BR") {
										dy -= vertical_offset;
										halign = 2
									} else {
										if(al == "B") {
											dy -= vertical_offset
										} else {
											if(al == "BL") {
												dy -= vertical_offset;
												halign = 0
											} else {
												if(al == "L") {
													halign = 0
												}
											}
										}
									}
								}
							}
						}
					}
				}
				offsetX = 0;
				fontname = "Arial";
				if(f.fontname) {
					fontname = f.fontname
				}
			}
			var text = data[i].text;
			var p = data[i].p;
			var plen = p.length;
			for(var k = 0; k < plen; k++) {
				if(filter) {
					var item = {};
					if(fields && p[k][4]) {
						item.data = fields[p[k][4].replace("||", "_")]
					}
					this.setupFiltersObject(el, item);
					if(!item.data || !filter(item.data)) {
						continue
					}
				}
				var o = __WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.DomUtil.create("span", "", el);
				o.style.fontWeight = "bold";
				o.style.color = fill;
				o.style.fontSize = data[0].fs + "px";
				o.style.fontFamily = fontname;
				o.innerText = text;
				offsetX = halign * o.offsetWidth / 2;
				o.style.position = "absolute";
				o.style.left = (p[k][0] + d + dx + offsetX) + "px";
				o.style.top = (p[k][1] + d + dy) + "px"
			}
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
		this.expandCanvas(el, offset);
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
			d.x = offset + Math.round(((d.x - MWGlobal.mwlayergroup.bounds.xmin) / MWGlobal.mwlayergroup.bounds.max * Math.pow(2, el.zoom) - el.coord.x) * 256);
			d.y = offset + Math.round(((MWGlobal.mwlayergroup.bounds.ymax - d.y) / MWGlobal.mwlayergroup.bounds.max * Math.pow(2, el.zoom) - el.coord.y) * 256);
			d.id = d.id.replace("||", "_");
			d.c = d.id;
			d.ispoint = true;
			if(has_fields) {
				d.data = data.fields[d.id];
				this.setupFiltersObject(el, d)
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
			c = this.newCanvas(el);
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
			this.removeDOM(c)
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
				that.drawPixels(ctx, el, !(el.obj.parent.group))
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
					that.drawCanvasPolygon(el, ctx, object.p, object.curs, object.s, el.lastP, null, 1, user_custom_renderer)
				} else {
					object.visible = false
				}
			}
			that.finishPoly(el, ctx);

			if(el.has_inner_line) {
				for(i = len - 1; i >= 0; i--) {
					object = geom[i];
					if(object.visible) {
						that.drawCanvasPolygon(el, ctx, object.p, object.curs, object.s, el.lastP, null, 2, user_custom_renderer)
					}
				}
				that.finishPoly2(el, ctx)
			}
		}
		if(el.obj.modifier) {
			that.drawTileUsingModifier(el, el.obj)
		}
		if(el._canvas_offset) {
			ctx.restore()
		}
	},
	drawPixels: function(ctx, data, renderDirectOnTile) {
		 var tmp_canvas = null, original_ctx;
        if (!renderDirectOnTile) {
            tmp_canvas = this.newCanvas(ctx.canvas);
            original_ctx = ctx;
            ctx = tmp_canvas.getContext("2d")
        }
        var imgd = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
        var pix = imgd.data;
        var px = data.pixels[data.layer];
        var slen = px.length;
        var c = 0;
        var r, g, b, k, i;
        r = g = b = 0;
        for (i = 1; i < slen; i++) {
            if (px[i] < 0) {
                k = px[i];
                if (px[i + 1] == 0) {
                    i++;
                    r = px[++i];
                    g = px[++i];
                    b = px[++i]
                }
                while (k++) {
                    pix[c * 4] = r;
                    pix[c * 4 + 1] = g;
                    pix[c * 4 + 2] = b;
                    pix[c * 4 + 3] = 255;
                    c++
                }
            } else {
                c += px[i]
            }
        }
        ctx.putImageData(imgd, 0, 0);
        if (!renderDirectOnTile) {
            original_ctx.drawImage(tmp_canvas, 0, 0)
        }
	},
	drawCanvasPolygon: function(el, ctx, d, c, cindex, id, clear, mode, forcerender) {
		if(c.visible === false) {
			return
		}
		var len, j;
		if(el.last_c && el.last_c_index != cindex || forcerender) {
			if(mode != 2) {
				this.finishPoly(el, ctx)
			} else {
				this.finishPoly2(el, ctx)
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
			this.finishPoly(el, ctx);
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
				setTimeout(function() {
					c.pattern = ctx.createPattern(c.icon_image, "repeat");
					ctx.fillStyle = c.pattern;
					ctx.fill();
				}, 1000);
			} else {
				ctx.fillStyle = c.pattern;
				ctx.fill();
			}

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
		var o_obj = this.hoverModifier.orig_obj;
		var shouldRedraw = false;
		if(o_obj.modifier[this.hoverModifier.orig_key] && o_obj.modifier[this.hoverModifier.orig_key].hover) {
			if(this.hoverModifier.orig) {
				o_obj.modifier[this.hoverModifier.orig_key] = this.hoverModifier.orig
			} else {
				o_obj.modifier[this.hoverModifier.orig_key] = null
			}
			shouldRedraw = this.drawAcrossTiles(o_obj, true)
		}
		this.hoverModifier.isset = false;
		return shouldRedraw
	},
	clearTile: function(tile) {
		if(tile._modified && tile._original) {
			var ctx = tile.getContext("2d");
			this.canvasUtils.rectCrop(tile._invalidateRect, 0, ctx.canvas.width);
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
	}

});
let e = undefined;

var MWLayer = __WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.LayerGroup.extend({
	initialize: function(url, options) {
		__WEBPACK_IMPORTED_MODULE_0__static_leaflet_leaflet_js___default.a.Util.setOptions(this, options);
		this._layers = {};
		this.mwlayers = [];
		this.tile_request = {};
		this.tile_req = [];
		this.tile_req_seq = 0;
		this.text_data = {};
		this.loader_id = 0;

		this.lid_map = {};
		this.lid_map[this.options.id] = 1;
		this.url = url;
		this.active_loaders = {};

	},
	//生成layers容器
	addMWLayer: function(url) {
		var that = this;
		var ps = url.substring(url.search("layer")).split("/");
		var lid = ps[0].split(",");
		var zindex = 1;
		var loadindex = 0;
		var mapid = "mapwayid";
		lid.forEach(i => {
			var layerinfo = that.layer_info ? that.layer_info : __WEBPACK_IMPORTED_MODULE_1__static_layersinfo_json___default.a[i];
			var mwl = new MWTileLayer(i, {
				id: __WEBPACK_IMPORTED_MODULE_1__static_layersinfo_json___default.a[i].id,
				mid: mapid,
				visible: true,
				opacity: layerinfo.alpha
			});
			mwl.setZIndex(zindex++);
			mwl.on("tilesload", function(evt) {
				loadindex++;
				if(loadindex == lid.length) {
					that.sendRequests();
					loadindex = 0;
				}
			});

			
			if(layerinfo.has_icon && layerinfo.features) {
				for(var a3 = 0; a3 < layerinfo.features.length; a3++) {
					if(layerinfo.features[a3].icon) {
						layerinfo.features[a3].icon_image = new Image(layerinfo.features[a3].icon);
						layerinfo.features[a3].icon_image.width = 10;
						layerinfo.features[a3].icon_image.height = 10;
						layerinfo.features[a3].icon_image.src = layerinfo.features[a3].icon;
						layerinfo.features[a3].icon_image.feature = layerinfo.features[a3];
					}

					//					if(layer.layer_info.has_icon && layer.layer_info.features) {
					//			for(var a3 = 0; a3 < layer.layer_info.features.length; a3++) {
					//				layer.layer_info.features[a3].icon_image.src = layer.layer_info.features[a3].icon;
					//				layer.layer_info.features[a3].icon_image.feature = layer.layer_info.features[a3];
					//				layer.layer_info.features[a3].icon_image.onload = function() {
					//					layer.layer_info.features[a3].pattern =ctx.createPattern(layer.layer_info.features[a3].icon_image,"repeat");
					//				}
					//			}
					//		}

				}
			}

			that.mwlayers.push({
				id: i,
				mid: mapid,
				layer: mwl,
				layer_info: layerinfo
			});

			that.addLayer(mwl);

		});
		//that.bounds = new mapway.Bounds(this.layer_info.xmin, this.layer_info.ymin, this.layer_info.xmax, this.layer_info.ymax);
		that.bounds1 = {
			xmin: -20037508.3427892,
			ymin: -20037508.3427892,
			xmax: 20037508.3427892,
			ymax: 20037508.3427892,
			max: 40075016.6855784
		};
		that.bounds = {
			max: 40075016.6855784,
			xmax: 20037508.3427892,
			xmin: -20037508.3427892,
			ymax: 20037508.3427892,
			ymin: -20037508.3427892
		};
		that._initMapEvent();
	},
	onAdd: function(map) {
		this._map = map;
		MWGlobal.mwlayergroup = this;
		if(this.url) {
			this.addMWLayer(this.url);
		}

		this.eachLayer(map.addLayer, map);
	},

	sendRequests: function() {
		var r, attribs;
		while((r = MWGlobal.mwlayergroup.tile_req.shift())) {
			attribs = "";
			//              var token = giscloud.tile_token + ":";
			//              token = "";
			if(MWGlobal.mwlayergroup.tile_request[r.uri].attribs.length > 0) {
				$.unique(MWGlobal.mwlayergroup.tile_request[r.uri].attribs);
				attribs = MWGlobal.mwlayergroup.tile_request[r.uri].attribs.join(",") + "/"
			}
			if(r.that.url2) {
				this.ajaxLoader(r.that.url2 + "/" + attribs + r.uri_for_request + ".json", r.tile, r.uri)
			} else {
				if(r.that.url3) {
					this.ajaxLoader(r.that.url3 + MWGlobal.mwlayergroup.tile_request[r.uri].timestamps.join(",") + "/" + r.that.mid + "/" + MWGlobal.mwlayergroup.tile_request[r.uri].layers.join(",") + "/dyn," + r.that.t + "/" + attribs + r.uri_for_request + ".json", r.tile, r.uri)
				} else {
					tile_buffer.push({
						tile: tile,
						uri: uri
					})
				}
			}
			r.tile = null
		}
	},
	//ajax请求
	ajaxLoader: function(url, tile, uri) {
		//		if(giscloud.offlineMode()) {
		//			return offlineMapTileLoader(func, url, tile, uri)
		//		}
		var that = this;
		if(document.getElementById) {
			var x = (window.XDomainRequest) ? new XDomainRequest() : new XMLHttpRequest();
			if(window.XDomainRequest) {
				x.xdomain = 1
			}
		}
		if(x) {
			x.tile_request = MWGlobal.mwlayergroup.tile_request[uri];
			MWGlobal.mwlayergroup.tile_request[uri] = null;
			x.seq = x.tile_request.seq;
			x.tile = tile;
			this.active_loaders[x.seq] = x;
			x.onreadystatechange = function() {
				var el = el || {},
					d;
				if(x.readyState == 4) { //x.xdomain || 
					d = 0;
					if(x.status == 200) { //x.xdomain || 
						el = x.tile;
						if(x.responseText && x.responseText[0] != "<" && x.responseText != "[0]") {
							if(window.JSON) {
								d = window.JSON.parse(x.responseText)
							} else {
								d = eval("(" + x.responseText + ")")
							}
						}
					} else {
						if(x.status === 0 && x.responseText) {
							el = x.tile;
							try {
								d = window.JSON.parse(x.responseText)
							} catch(err) {}
						}
					}
					that._tileLoaded(x, tile, d);
					//					this.handleMapTileResponse(x, func, el, d);
					if(that.active_loaders[this.seq]) {
						delete that.active_loaders[this.seq]
					}
				}
			};
			if(x.xdomain) {
				x.onerror = function() {
					if(that.active_loaders[this.seq]) {
						delete that.active_loaders[this.seq]
					}
				};
				x.ontimeout = function() {
					if(that.active_loaders[that.seq]) {
						delete that.active_loaders[this.seq]
					}
				};
				x.onprogress = function() {};
				x.onload = x.onreadystatechange
			}
			x.open("GET", url);
			x._url = url;
			x.send()
		}

		//		var req = new XMLHttpRequest();
		//		tile.obj._requests.push(req);
		//		req.onreadystatechange = this._xhrHandler(req, tile, tile.coord);
		//		req.open('GET', url, true);
		//		req._url = url;
		//		req.send();
	},
	//瓦片加载完成
	_tileLoaded: function(req, el, mwjson) {
		//		MWLayerAjax.apply(this, arguments);
		if(mwjson === null) {
			return null;
		}
		this.addTileData(req, this.drawTile, el, mwjson);
	},
	//根据瓦片行列号获得数据
	addTileData: function(request, callback_func, tile_container, mwjson) {
		if(mwjson && mwjson.length && !tile_container.obj.dynamic) {
			var tile, i, offset = 0,
				tiles = request.tile_request.tiles;
			for(i = 0; i < tiles.length; i++) {
				tile = tiles[i];
				if(tile.obj && tile.obj.processTiles) {
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
		var that = this;
		layer.layer_info = el.obj.layer_info;
		el.curLayerObj = layer;
		el.curLayerObj.features = el.obj.layer_info.features;
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
				layer.drawText(el, dontRender);
				data.geom = null
			}
			if(data.tile.type == "point") {
				el.data[el.layer] = data.tile.data;
				el.fields = data.fields;
				layer.parsePoint(el, data);
				el.styles = data.styles;
				layer.initStyles(el);
				layer.drawPoint(el);
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
	_initMapEvent: function() {
		let that = this;
		that._map.on("zoomanim", function() {
			//			that.html5ResetLoaders()
		});
		that._map.on("click", function(evt) {
			if(that.T(evt)) {
				var g = that.hoverModifier.layer;
				var a = "selectcolor"; //that.getHighlightColor(that.hoverModifier.layer.substring(5));
				that.modifyObject("", {
					color: 16760576,
					orig_color: 13421772
				}, "", true);
				that.modifyObject(that.hoverModifier.orig_key.split("_")[1], {
					color: a
				}, g ? g : "");
			}
		});
		that._map.on("mousemove", function(aC) {
			if(that.T(aC)) { //&& al
				if(aC.showMousePointer) {
					that._map._container.style.cursor = "pointer";
					//					this.extendgc.aw(aC, "object_over");
					//					J = aC
				} else {
					//					if(!flashnavigator.hasCanvas && (ao._currentTool == "InfoTool" || ao._currentTool == "SelectTool")) {
					//						this._map._container.style.cursor = "default";
					//					} else {
					that._map._container.style.cursor = "default";
					//					}
					//					if(J) {
					//						aw(J, "object_out", I);
					//						J = null
					//					}
				}
			}
			//			获取显示当前鼠标坐标点
			//						if(aC.mp) { // && Z.mousemove
			//							var aA = (1 << this._map._zoom);
			//							var aB = {
			//								x: q.xmin + q.max * aC.mp.x / aA,
			//								y: q.ymax - q.max * aC.mp.y / aA
			//							};
			//							this.extendgc.au("mousemove", aB);
			//						}
		});
	},

	T: function(aJ, aB, aF) {
		if(!this.mwlayers || this.mwlayers == 0) { //!F || 
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
		for(var aA = this.mwlayers.length - 1; aA >= 0; --aA) {
			var aC = this.mwlayers[aA].layer;
			if(aC._tilesToLoad && aC._tilesToLoad > 0) {
				aE = true
			}
			if(!aC.layer_info) {
				break;
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
		}
		return !aE
	},
	ae: function(aB) {
		var aA = this._map.getPixelBounds();
		return {
			x: (aA.min.x + aB.layerPoint.x + this._map._mapPane._leaflet_pos.x) / 256,
			y: (aA.min.y + aB.layerPoint.y + this._map._mapPane._leaflet_pos.y) / 256,
			containerPoint: aB.containerPoint
		}
	},
	aw: function(aB, aC, aD) {
		aD = aD || R;
		if(aD && Z[aC]) {
			var aA = (1 << this._map._zoom);
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

});
var MWGlobal = {

};
var mapway = {
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
var common = {
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

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/* @preserve
 * Leaflet 1.2.0+Detached: 1ac320ba232cb85b73ac81f3d82780c9d07f0d4e.1ac320b, a JS library for interactive maps. http://leafletjs.com
 * (c) 2010-2017 Vladimir Agafonkin, (c) 2010-2011 CloudMade
 */
!function(t,i){ true?i(exports):"function"==typeof define&&define.amd?define(["exports"],i):i(t.L={})}(this,function(t){"use strict";function i(t){var i,e,n,o;for(e=1,n=arguments.length;e<n;e++){o=arguments[e];for(i in o)t[i]=o[i]}return t}function e(t,i){var e=Array.prototype.slice;if(t.bind)return t.bind.apply(t,e.call(arguments,1));var n=e.call(arguments,2);return function(){return t.apply(i,n.length?n.concat(e.call(arguments)):arguments)}}function n(t){return t._leaflet_id=t._leaflet_id||++ti,t._leaflet_id}function o(t,i,e){var n,o,s,r;return r=function(){n=!1,o&&(s.apply(e,o),o=!1)},s=function(){n?o=arguments:(t.apply(e,arguments),setTimeout(r,i),n=!0)}}function s(t,i,e){var n=i[1],o=i[0],s=n-o;return t===n&&e?t:((t-o)%s+s)%s+o}function r(){return!1}function a(t,i){var e=Math.pow(10,i||5);return Math.round(t*e)/e}function h(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}function u(t){return h(t).split(/\s+/)}function l(t,i){t.hasOwnProperty("options")||(t.options=t.options?Qt(t.options):{});for(var e in i)t.options[e]=i[e];return t.options}function c(t,i,e){var n=[];for(var o in t)n.push(encodeURIComponent(e?o.toUpperCase():o)+"="+encodeURIComponent(t[o]));return(i&&-1!==i.indexOf("?")?"&":"?")+n.join("&")}function _(t,i){return t.replace(ii,function(t,e){var n=i[e];if(void 0===n)throw new Error("No value provided for variable "+t);return"function"==typeof n&&(n=n(i)),n})}function d(t,i){for(var e=0;e<t.length;e++)if(t[e]===i)return e;return-1}function p(t){return window["webkit"+t]||window["moz"+t]||window["ms"+t]}function m(t){var i=+new Date,e=Math.max(0,16-(i-oi));return oi=i+e,window.setTimeout(t,e)}function f(t,i,n){if(!n||si!==m)return si.call(window,e(t,i));t.call(i)}function g(t){t&&ri.call(window,t)}function v(){}function y(t){if(L&&L.Mixin){t=ei(t)?t:[t];for(var i=0;i<t.length;i++)t[i]===L.Mixin.Events&&console.warn("Deprecated include of L.Mixin.Events: this property will be removed in future releases, please inherit from L.Evented instead.",(new Error).stack)}}function x(t,i,e){this.x=e?Math.round(t):t,this.y=e?Math.round(i):i}function w(t,i,e){return t instanceof x?t:ei(t)?new x(t[0],t[1]):void 0===t||null===t?t:"object"==typeof t&&"x"in t&&"y"in t?new x(t.x,t.y):new x(t,i,e)}function b(t,i){if(t)for(var e=i?[t,i]:t,n=0,o=e.length;n<o;n++)this.extend(e[n])}function P(t,i){return!t||t instanceof b?t:new b(t,i)}function T(t,i){if(t)for(var e=i?[t,i]:t,n=0,o=e.length;n<o;n++)this.extend(e[n])}function z(t,i){return t instanceof T?t:new T(t,i)}function M(t,i,e){if(isNaN(t)||isNaN(i))throw new Error("Invalid LatLng object: ("+t+", "+i+")");this.lat=+t,this.lng=+i,void 0!==e&&(this.alt=+e)}function C(t,i,e){return t instanceof M?t:ei(t)&&"object"!=typeof t[0]?3===t.length?new M(t[0],t[1],t[2]):2===t.length?new M(t[0],t[1]):null:void 0===t||null===t?t:"object"==typeof t&&"lat"in t?new M(t.lat,"lng"in t?t.lng:t.lon,t.alt):void 0===i?null:new M(t,i,e)}function Z(t,i,e,n){if(ei(t))return this._a=t[0],this._b=t[1],this._c=t[2],void(this._d=t[3]);this._a=t,this._b=i,this._c=e,this._d=n}function E(t,i,e,n){return new Z(t,i,e,n)}function S(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function k(t,i){var e,n,o,s,r,a,h="";for(e=0,o=t.length;e<o;e++){for(n=0,s=(r=t[e]).length;n<s;n++)a=r[n],h+=(n?"L":"M")+a.x+" "+a.y;h+=i?qi?"z":"x":""}return h||"M0 0"}function B(t){return navigator.userAgent.toLowerCase().indexOf(t)>=0}function I(t,i,e,n){return"touchstart"===i?O(t,e,n):"touchmove"===i?W(t,e,n):"touchend"===i&&H(t,e,n),this}function A(t,i,e){var n=t["_leaflet_"+i+e];return"touchstart"===i?t.removeEventListener(Xi,n,!1):"touchmove"===i?t.removeEventListener(Ji,n,!1):"touchend"===i&&(t.removeEventListener($i,n,!1),t.removeEventListener(Qi,n,!1)),this}function O(t,i,n){var o=e(function(t){if("mouse"!==t.pointerType&&t.pointerType!==t.MSPOINTER_TYPE_MOUSE&&t.pointerType!==t.MSPOINTER_TYPE_MOUSE){if(!(te.indexOf(t.target.tagName)<0))return;$(t)}j(t,i)});t["_leaflet_touchstart"+n]=o,t.addEventListener(Xi,o,!1),ee||(document.documentElement.addEventListener(Xi,R,!0),document.documentElement.addEventListener(Ji,D,!0),document.documentElement.addEventListener($i,N,!0),document.documentElement.addEventListener(Qi,N,!0),ee=!0)}function R(t){ie[t.pointerId]=t,ne++}function D(t){ie[t.pointerId]&&(ie[t.pointerId]=t)}function N(t){delete ie[t.pointerId],ne--}function j(t,i){t.touches=[];for(var e in ie)t.touches.push(ie[e]);t.changedTouches=[t],i(t)}function W(t,i,e){var n=function(t){(t.pointerType!==t.MSPOINTER_TYPE_MOUSE&&"mouse"!==t.pointerType||0!==t.buttons)&&j(t,i)};t["_leaflet_touchmove"+e]=n,t.addEventListener(Ji,n,!1)}function H(t,i,e){var n=function(t){j(t,i)};t["_leaflet_touchend"+e]=n,t.addEventListener($i,n,!1),t.addEventListener(Qi,n,!1)}function F(t,i,e){function n(t){var i;if(Wi){if(!Li||"mouse"===t.pointerType)return;i=ne}else i=t.touches.length;if(!(i>1)){var e=Date.now(),n=e-(s||e);r=t.touches?t.touches[0]:t,a=n>0&&n<=h,s=e}}function o(t){if(a&&!r.cancelBubble){if(Wi){if(!Li||"mouse"===t.pointerType)return;var e,n,o={};for(n in r)e=r[n],o[n]=e&&e.bind?e.bind(r):e;r=o}r.type="dblclick",i(r),s=null}}var s,r,a=!1,h=250;return t[re+oe+e]=n,t[re+se+e]=o,t[re+"dblclick"+e]=i,t.addEventListener(oe,n,!1),t.addEventListener(se,o,!1),t.addEventListener("dblclick",i,!1),this}function U(t,i){var e=t[re+oe+i],n=t[re+se+i],o=t[re+"dblclick"+i];return t.removeEventListener(oe,e,!1),t.removeEventListener(se,n,!1),Li||t.removeEventListener("dblclick",o,!1),this}function V(t,i,e,n){if("object"==typeof i)for(var o in i)q(t,o,i[o],e);else for(var s=0,r=(i=u(i)).length;s<r;s++)q(t,i[s],e,n);return this}function G(t,i,e,n){if("object"==typeof i)for(var o in i)K(t,o,i[o],e);else if(i)for(var s=0,r=(i=u(i)).length;s<r;s++)K(t,i[s],e,n);else{for(var a in t[ae])K(t,a,t[ae][a]);delete t[ae]}return this}function q(t,i,e,o){var s=i+n(e)+(o?"_"+n(o):"");if(t[ae]&&t[ae][s])return this;var r=function(i){return e.call(o||t,i||window.event)},a=r;Wi&&0===i.indexOf("touch")?I(t,i,r,s):!Hi||"dblclick"!==i||!F||Wi&&Mi?"addEventListener"in t?"mousewheel"===i?t.addEventListener("onwheel"in t?"wheel":"mousewheel",r,!1):"mouseenter"===i||"mouseleave"===i?(r=function(i){i=i||window.event,ot(t,i)&&a(i)},t.addEventListener("mouseenter"===i?"mouseover":"mouseout",r,!1)):("click"===i&&Pi&&(r=function(t){st(t,a)}),t.addEventListener(i,r,!1)):"attachEvent"in t&&t.attachEvent("on"+i,r):F(t,r,s),t[ae]=t[ae]||{},t[ae][s]=r}function K(t,i,e,o){var s=i+n(e)+(o?"_"+n(o):""),r=t[ae]&&t[ae][s];if(!r)return this;Wi&&0===i.indexOf("touch")?A(t,i,s):Hi&&"dblclick"===i&&U?U(t,s):"removeEventListener"in t?"mousewheel"===i?t.removeEventListener("onwheel"in t?"wheel":"mousewheel",r,!1):t.removeEventListener("mouseenter"===i?"mouseover":"mouseleave"===i?"mouseout":i,r,!1):"detachEvent"in t&&t.detachEvent("on"+i,r),t[ae][s]=null}function Y(t){return t.stopPropagation?t.stopPropagation():t.originalEvent?t.originalEvent._stopped=!0:t.cancelBubble=!0,nt(t),this}function X(t){return q(t,"mousewheel",Y),this}function J(t){return V(t,"mousedown touchstart dblclick",Y),q(t,"click",et),this}function $(t){return t.preventDefault?t.preventDefault():t.returnValue=!1,this}function Q(t){return $(t),Y(t),this}function tt(t,i){if(!i)return new x(t.clientX,t.clientY);var e=i.getBoundingClientRect();return new x(t.clientX-e.left-i.clientLeft,t.clientY-e.top-i.clientTop)}function it(t){return Li?t.wheelDeltaY/2:t.deltaY&&0===t.deltaMode?-t.deltaY/he:t.deltaY&&1===t.deltaMode?20*-t.deltaY:t.deltaY&&2===t.deltaMode?60*-t.deltaY:t.deltaX||t.deltaZ?0:t.wheelDelta?(t.wheelDeltaY||t.wheelDelta)/2:t.detail&&Math.abs(t.detail)<32765?20*-t.detail:t.detail?t.detail/-32765*60:0}function et(t){ue[t.type]=!0}function nt(t){var i=ue[t.type];return ue[t.type]=!1,i}function ot(t,i){var e=i.relatedTarget;if(!e)return!0;try{for(;e&&e!==t;)e=e.parentNode}catch(t){return!1}return e!==t}function st(t,i){var e=t.timeStamp||t.originalEvent&&t.originalEvent.timeStamp,n=di&&e-di;n&&n>100&&n<500||t.target._simulatedClick&&!t._simulated?Q(t):(di=e,i(t))}function rt(t){return"string"==typeof t?document.getElementById(t):t}function at(t,i){var e=t.style[i]||t.currentStyle&&t.currentStyle[i];if((!e||"auto"===e)&&document.defaultView){var n=document.defaultView.getComputedStyle(t,null);e=n?n[i]:null}return"auto"===e?null:e}function ht(t,i,e){var n=document.createElement(t);return n.className=i||"",e&&e.appendChild(n),n}function ut(t){var i=t.parentNode;i&&i.removeChild(t)}function lt(t){for(;t.firstChild;)t.removeChild(t.firstChild)}function ct(t){var i=t.parentNode;i.lastChild!==t&&i.appendChild(t)}function _t(t){var i=t.parentNode;i.firstChild!==t&&i.insertBefore(t,i.firstChild)}function dt(t,i){if(void 0!==t.classList)return t.classList.contains(i);var e=gt(t);return e.length>0&&new RegExp("(^|\\s)"+i+"(\\s|$)").test(e)}function pt(t,i){if(void 0!==t.classList)for(var e=u(i),n=0,o=e.length;n<o;n++)t.classList.add(e[n]);else if(!dt(t,i)){var s=gt(t);ft(t,(s?s+" ":"")+i)}}function mt(t,i){void 0!==t.classList?t.classList.remove(i):ft(t,h((" "+gt(t)+" ").replace(" "+i+" "," ")))}function ft(t,i){void 0===t.className.baseVal?t.className=i:t.className.baseVal=i}function gt(t){return void 0===t.className.baseVal?t.className:t.className.baseVal}function vt(t,i){"opacity"in t.style?t.style.opacity=i:"filter"in t.style&&yt(t,i)}function yt(t,i){var e=!1,n="DXImageTransform.Microsoft.Alpha";try{e=t.filters.item(n)}catch(t){if(1===i)return}i=Math.round(100*i),e?(e.Enabled=100!==i,e.Opacity=i):t.style.filter+=" progid:"+n+"(opacity="+i+")"}function xt(t){for(var i=document.documentElement.style,e=0;e<t.length;e++)if(t[e]in i)return t[e];return!1}function wt(t,i,e){var n=i||new x(0,0);t.style[ce]=(Bi?"translate("+n.x+"px,"+n.y+"px)":"translate3d("+n.x+"px,"+n.y+"px,0)")+(e?" scale("+e+")":"")}function Lt(t,i){t._leaflet_pos=i,Oi?wt(t,i):(t.style.left=i.x+"px",t.style.top=i.y+"px")}function bt(t){return t._leaflet_pos||new x(0,0)}function Pt(){V(window,"dragstart",$)}function Tt(){G(window,"dragstart",$)}function zt(t){for(;-1===t.tabIndex;)t=t.parentNode;t.style&&(Mt(),me=t,fe=t.style.outline,t.style.outline="none",V(window,"keydown",Mt))}function Mt(){me&&(me.style.outline=fe,me=void 0,fe=void 0,G(window,"keydown",Mt))}function Ct(t,i){if(!i||!t.length)return t.slice();var e=i*i;return t=kt(t,e),t=Et(t,e)}function Zt(t,i,e){return Math.sqrt(Rt(t,i,e,!0))}function Et(t,i){var e=t.length,n=new(typeof Uint8Array!=void 0+""?Uint8Array:Array)(e);n[0]=n[e-1]=1,St(t,n,i,0,e-1);var o,s=[];for(o=0;o<e;o++)n[o]&&s.push(t[o]);return s}function St(t,i,e,n,o){var s,r,a,h=0;for(r=n+1;r<=o-1;r++)(a=Rt(t[r],t[n],t[o],!0))>h&&(s=r,h=a);h>e&&(i[s]=1,St(t,i,e,n,s),St(t,i,e,s,o))}function kt(t,i){for(var e=[t[0]],n=1,o=0,s=t.length;n<s;n++)Ot(t[n],t[o])>i&&(e.push(t[n]),o=n);return o<s-1&&e.push(t[s-1]),e}function Bt(t,i,e,n,o){var s,r,a,h=n?ze:At(t,e),u=At(i,e);for(ze=u;;){if(!(h|u))return[t,i];if(h&u)return!1;a=At(r=It(t,i,s=h||u,e,o),e),s===h?(t=r,h=a):(i=r,u=a)}}function It(t,i,e,n,o){var s,r,a=i.x-t.x,h=i.y-t.y,u=n.min,l=n.max;return 8&e?(s=t.x+a*(l.y-t.y)/h,r=l.y):4&e?(s=t.x+a*(u.y-t.y)/h,r=u.y):2&e?(s=l.x,r=t.y+h*(l.x-t.x)/a):1&e&&(s=u.x,r=t.y+h*(u.x-t.x)/a),new x(s,r,o)}function At(t,i){var e=0;return t.x<i.min.x?e|=1:t.x>i.max.x&&(e|=2),t.y<i.min.y?e|=4:t.y>i.max.y&&(e|=8),e}function Ot(t,i){var e=i.x-t.x,n=i.y-t.y;return e*e+n*n}function Rt(t,i,e,n){var o,s=i.x,r=i.y,a=e.x-s,h=e.y-r,u=a*a+h*h;return u>0&&((o=((t.x-s)*a+(t.y-r)*h)/u)>1?(s=e.x,r=e.y):o>0&&(s+=a*o,r+=h*o)),a=t.x-s,h=t.y-r,n?a*a+h*h:new x(s,r)}function Dt(t){return!ei(t[0])||"object"!=typeof t[0][0]&&void 0!==t[0][0]}function Nt(t){return console.warn("Deprecated use of _flat, please use L.LineUtil.isFlat instead."),Dt(t)}function jt(t,i,e){var n,o,s,r,a,h,u,l,c,_=[1,4,2,8];for(o=0,u=t.length;o<u;o++)t[o]._code=At(t[o],i);for(r=0;r<4;r++){for(l=_[r],n=[],o=0,s=(u=t.length)-1;o<u;s=o++)a=t[o],h=t[s],a._code&l?h._code&l||((c=It(h,a,l,i,e))._code=At(c,i),n.push(c)):(h._code&l&&((c=It(h,a,l,i,e))._code=At(c,i),n.push(c)),n.push(a));t=n}return t}function Wt(t,i){var e,n,o,s,r="Feature"===t.type?t.geometry:t,a=r?r.coordinates:null,h=[],u=i&&i.pointToLayer,l=i&&i.coordsToLatLng||Ht;if(!a&&!r)return null;switch(r.type){case"Point":return e=l(a),u?u(t,e):new qe(e);case"MultiPoint":for(o=0,s=a.length;o<s;o++)e=l(a[o]),h.push(u?u(t,e):new qe(e));return new Fe(h);case"LineString":case"MultiLineString":return n=Ft(a,"LineString"===r.type?0:1,l),new Je(n,i);case"Polygon":case"MultiPolygon":return n=Ft(a,"Polygon"===r.type?1:2,l),new $e(n,i);case"GeometryCollection":for(o=0,s=r.geometries.length;o<s;o++){var c=Wt({geometry:r.geometries[o],type:"Feature",properties:t.properties},i);c&&h.push(c)}return new Fe(h);default:throw new Error("Invalid GeoJSON object.")}}function Ht(t){return new M(t[1],t[0],t[2])}function Ft(t,i,e){for(var n,o=[],s=0,r=t.length;s<r;s++)n=i?Ft(t[s],i-1,e):(e||Ht)(t[s]),o.push(n);return o}function Ut(t,i){return i="number"==typeof i?i:6,void 0!==t.alt?[a(t.lng,i),a(t.lat,i),a(t.alt,i)]:[a(t.lng,i),a(t.lat,i)]}function Vt(t,i,e,n){for(var o=[],s=0,r=t.length;s<r;s++)o.push(i?Vt(t[s],i-1,e,n):Ut(t[s],n));return!i&&e&&o.push(o[0]),o}function Gt(t,e){return t.feature?i({},t.feature,{geometry:e}):qt(e)}function qt(t){return"Feature"===t.type||"FeatureCollection"===t.type?t:{type:"Feature",properties:{},geometry:t}}function Kt(t,i){return new Qe(t,i)}function Yt(t,i){return new ln(t,i)}function Xt(t){return Gi?new dn(t):null}function Jt(t){return qi||Ki?new gn(t):null}var $t=Object.freeze;Object.freeze=function(t){return t};var Qt=Object.create||function(){function t(){}return function(i){return t.prototype=i,new t}}(),ti=0,ii=/\{ *([\w_\-]+) *\}/g,ei=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)},ni="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",oi=0,si=window.requestAnimationFrame||p("RequestAnimationFrame")||m,ri=window.cancelAnimationFrame||p("CancelAnimationFrame")||p("CancelRequestAnimationFrame")||function(t){window.clearTimeout(t)},ai=(Object.freeze||Object)({freeze:$t,extend:i,create:Qt,bind:e,lastId:ti,stamp:n,throttle:o,wrapNum:s,falseFn:r,formatNum:a,trim:h,splitWords:u,setOptions:l,getParamString:c,template:_,isArray:ei,indexOf:d,emptyImageUrl:ni,requestFn:si,cancelFn:ri,requestAnimFrame:f,cancelAnimFrame:g});v.extend=function(t){var e=function(){this.initialize&&this.initialize.apply(this,arguments),this.callInitHooks()},n=e.__super__=this.prototype,o=Qt(n);o.constructor=e,e.prototype=o;for(var s in this)this.hasOwnProperty(s)&&"prototype"!==s&&"__super__"!==s&&(e[s]=this[s]);return t.statics&&(i(e,t.statics),delete t.statics),t.includes&&(y(t.includes),i.apply(null,[o].concat(t.includes)),delete t.includes),o.options&&(t.options=i(Qt(o.options),t.options)),i(o,t),o._initHooks=[],o.callInitHooks=function(){if(!this._initHooksCalled){n.callInitHooks&&n.callInitHooks.call(this),this._initHooksCalled=!0;for(var t=0,i=o._initHooks.length;t<i;t++)o._initHooks[t].call(this)}},e},v.include=function(t){return i(this.prototype,t),this},v.mergeOptions=function(t){return i(this.prototype.options,t),this},v.addInitHook=function(t){var i=Array.prototype.slice.call(arguments,1),e="function"==typeof t?t:function(){this[t].apply(this,i)};return this.prototype._initHooks=this.prototype._initHooks||[],this.prototype._initHooks.push(e),this};var hi={on:function(t,i,e){if("object"==typeof t)for(var n in t)this._on(n,t[n],i);else for(var o=0,s=(t=u(t)).length;o<s;o++)this._on(t[o],i,e);return this},off:function(t,i,e){if(t)if("object"==typeof t)for(var n in t)this._off(n,t[n],i);else for(var o=0,s=(t=u(t)).length;o<s;o++)this._off(t[o],i,e);else delete this._events;return this},_on:function(t,i,e){this._events=this._events||{};var n=this._events[t];n||(n=[],this._events[t]=n),e===this&&(e=void 0);for(var o={fn:i,ctx:e},s=n,r=0,a=s.length;r<a;r++)if(s[r].fn===i&&s[r].ctx===e)return;s.push(o)},_off:function(t,i,e){var n,o,s;if(this._events&&(n=this._events[t]))if(i){if(e===this&&(e=void 0),n)for(o=0,s=n.length;o<s;o++){var a=n[o];if(a.ctx===e&&a.fn===i)return a.fn=r,this._firingCount&&(this._events[t]=n=n.slice()),void n.splice(o,1)}}else{for(o=0,s=n.length;o<s;o++)n[o].fn=r;delete this._events[t]}},fire:function(t,e,n){if(!this.listens(t,n))return this;var o=i({},e,{type:t,target:this});if(this._events){var s=this._events[t];if(s){this._firingCount=this._firingCount+1||1;for(var r=0,a=s.length;r<a;r++){var h=s[r];h.fn.call(h.ctx||this,o)}this._firingCount--}}return n&&this._propagateEvent(o),this},listens:function(t,i){var e=this._events&&this._events[t];if(e&&e.length)return!0;if(i)for(var n in this._eventParents)if(this._eventParents[n].listens(t,i))return!0;return!1},once:function(t,i,n){if("object"==typeof t){for(var o in t)this.once(o,t[o],i);return this}var s=e(function(){this.off(t,i,n).off(t,s,n)},this);return this.on(t,i,n).on(t,s,n)},addEventParent:function(t){return this._eventParents=this._eventParents||{},this._eventParents[n(t)]=t,this},removeEventParent:function(t){return this._eventParents&&delete this._eventParents[n(t)],this},_propagateEvent:function(t){for(var e in this._eventParents)this._eventParents[e].fire(t.type,i({layer:t.target},t),!0)}};hi.addEventListener=hi.on,hi.removeEventListener=hi.clearAllEventListeners=hi.off,hi.addOneTimeEventListener=hi.once,hi.fireEvent=hi.fire,hi.hasEventListeners=hi.listens;var ui=v.extend(hi);x.prototype={clone:function(){return new x(this.x,this.y)},add:function(t){return this.clone()._add(w(t))},_add:function(t){return this.x+=t.x,this.y+=t.y,this},subtract:function(t){return this.clone()._subtract(w(t))},_subtract:function(t){return this.x-=t.x,this.y-=t.y,this},divideBy:function(t){return this.clone()._divideBy(t)},_divideBy:function(t){return this.x/=t,this.y/=t,this},multiplyBy:function(t){return this.clone()._multiplyBy(t)},_multiplyBy:function(t){return this.x*=t,this.y*=t,this},scaleBy:function(t){return new x(this.x*t.x,this.y*t.y)},unscaleBy:function(t){return new x(this.x/t.x,this.y/t.y)},round:function(){return this.clone()._round()},_round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this},floor:function(){return this.clone()._floor()},_floor:function(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this},ceil:function(){return this.clone()._ceil()},_ceil:function(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this},distanceTo:function(t){var i=(t=w(t)).x-this.x,e=t.y-this.y;return Math.sqrt(i*i+e*e)},equals:function(t){return(t=w(t)).x===this.x&&t.y===this.y},contains:function(t){return t=w(t),Math.abs(t.x)<=Math.abs(this.x)&&Math.abs(t.y)<=Math.abs(this.y)},toString:function(){return"Point("+a(this.x)+", "+a(this.y)+")"}},b.prototype={extend:function(t){return t=w(t),this.min||this.max?(this.min.x=Math.min(t.x,this.min.x),this.max.x=Math.max(t.x,this.max.x),this.min.y=Math.min(t.y,this.min.y),this.max.y=Math.max(t.y,this.max.y)):(this.min=t.clone(),this.max=t.clone()),this},getCenter:function(t){return new x((this.min.x+this.max.x)/2,(this.min.y+this.max.y)/2,t)},getBottomLeft:function(){return new x(this.min.x,this.max.y)},getTopRight:function(){return new x(this.max.x,this.min.y)},getTopLeft:function(){return this.min},getBottomRight:function(){return this.max},getSize:function(){return this.max.subtract(this.min)},contains:function(t){var i,e;return(t="number"==typeof t[0]||t instanceof x?w(t):P(t))instanceof b?(i=t.min,e=t.max):i=e=t,i.x>=this.min.x&&e.x<=this.max.x&&i.y>=this.min.y&&e.y<=this.max.y},intersects:function(t){t=P(t);var i=this.min,e=this.max,n=t.min,o=t.max,s=o.x>=i.x&&n.x<=e.x,r=o.y>=i.y&&n.y<=e.y;return s&&r},overlaps:function(t){t=P(t);var i=this.min,e=this.max,n=t.min,o=t.max,s=o.x>i.x&&n.x<e.x,r=o.y>i.y&&n.y<e.y;return s&&r},isValid:function(){return!(!this.min||!this.max)}},T.prototype={extend:function(t){var i,e,n=this._southWest,o=this._northEast;if(t instanceof M)i=t,e=t;else{if(!(t instanceof T))return t?this.extend(C(t)||z(t)):this;if(i=t._southWest,e=t._northEast,!i||!e)return this}return n||o?(n.lat=Math.min(i.lat,n.lat),n.lng=Math.min(i.lng,n.lng),o.lat=Math.max(e.lat,o.lat),o.lng=Math.max(e.lng,o.lng)):(this._southWest=new M(i.lat,i.lng),this._northEast=new M(e.lat,e.lng)),this},pad:function(t){var i=this._southWest,e=this._northEast,n=Math.abs(i.lat-e.lat)*t,o=Math.abs(i.lng-e.lng)*t;return new T(new M(i.lat-n,i.lng-o),new M(e.lat+n,e.lng+o))},getCenter:function(){return new M((this._southWest.lat+this._northEast.lat)/2,(this._southWest.lng+this._northEast.lng)/2)},getSouthWest:function(){return this._southWest},getNorthEast:function(){return this._northEast},getNorthWest:function(){return new M(this.getNorth(),this.getWest())},getSouthEast:function(){return new M(this.getSouth(),this.getEast())},getWest:function(){return this._southWest.lng},getSouth:function(){return this._southWest.lat},getEast:function(){return this._northEast.lng},getNorth:function(){return this._northEast.lat},contains:function(t){t="number"==typeof t[0]||t instanceof M||"lat"in t?C(t):z(t);var i,e,n=this._southWest,o=this._northEast;return t instanceof T?(i=t.getSouthWest(),e=t.getNorthEast()):i=e=t,i.lat>=n.lat&&e.lat<=o.lat&&i.lng>=n.lng&&e.lng<=o.lng},intersects:function(t){t=z(t);var i=this._southWest,e=this._northEast,n=t.getSouthWest(),o=t.getNorthEast(),s=o.lat>=i.lat&&n.lat<=e.lat,r=o.lng>=i.lng&&n.lng<=e.lng;return s&&r},overlaps:function(t){t=z(t);var i=this._southWest,e=this._northEast,n=t.getSouthWest(),o=t.getNorthEast(),s=o.lat>i.lat&&n.lat<e.lat,r=o.lng>i.lng&&n.lng<e.lng;return s&&r},toBBoxString:function(){return[this.getWest(),this.getSouth(),this.getEast(),this.getNorth()].join(",")},equals:function(t,i){return!!t&&(t=z(t),this._southWest.equals(t.getSouthWest(),i)&&this._northEast.equals(t.getNorthEast(),i))},isValid:function(){return!(!this._southWest||!this._northEast)}},M.prototype={equals:function(t,i){return!!t&&(t=C(t),Math.max(Math.abs(this.lat-t.lat),Math.abs(this.lng-t.lng))<=(void 0===i?1e-9:i))},toString:function(t){return"LatLng("+a(this.lat,t)+", "+a(this.lng,t)+")"},distanceTo:function(t){return ci.distance(this,C(t))},wrap:function(){return ci.wrapLatLng(this)},toBounds:function(t){var i=180*t/40075017,e=i/Math.cos(Math.PI/180*this.lat);return z([this.lat-i,this.lng-e],[this.lat+i,this.lng+e])},clone:function(){return new M(this.lat,this.lng,this.alt)}};var li={latLngToPoint:function(t,i){var e=this.projection.project(t),n=this.scale(i);return this.transformation._transform(e,n)},pointToLatLng:function(t,i){var e=this.scale(i),n=this.transformation.untransform(t,e);return this.projection.unproject(n)},project:function(t){return this.projection.project(t)},unproject:function(t){return this.projection.unproject(t)},scale:function(t){return 256*Math.pow(2,t)},zoom:function(t){return Math.log(t/256)/Math.LN2},getProjectedBounds:function(t){if(this.infinite)return null;var i=this.projection.bounds,e=this.scale(t);return new b(this.transformation.transform(i.min,e),this.transformation.transform(i.max,e))},infinite:!1,wrapLatLng:function(t){var i=this.wrapLng?s(t.lng,this.wrapLng,!0):t.lng;return new M(this.wrapLat?s(t.lat,this.wrapLat,!0):t.lat,i,t.alt)},wrapLatLngBounds:function(t){var i=t.getCenter(),e=this.wrapLatLng(i),n=i.lat-e.lat,o=i.lng-e.lng;if(0===n&&0===o)return t;var s=t.getSouthWest(),r=t.getNorthEast();return new T(new M(s.lat-n,s.lng-o),new M(r.lat-n,r.lng-o))}},ci=i({},li,{wrapLng:[-180,180],R:6371e3,distance:function(t,i){var e=Math.PI/180,n=t.lat*e,o=i.lat*e,s=Math.sin(n)*Math.sin(o)+Math.cos(n)*Math.cos(o)*Math.cos((i.lng-t.lng)*e);return this.R*Math.acos(Math.min(s,1))}}),_i={R:6378137,MAX_LATITUDE:85.0511287798,project:function(t){var i=Math.PI/180,e=this.MAX_LATITUDE,n=Math.max(Math.min(e,t.lat),-e),o=Math.sin(n*i);return new x(this.R*t.lng*i,this.R*Math.log((1+o)/(1-o))/2)},unproject:function(t){var i=180/Math.PI;return new M((2*Math.atan(Math.exp(t.y/this.R))-Math.PI/2)*i,t.x*i/this.R)},bounds:function(){var t=6378137*Math.PI;return new b([-t,-t],[t,t])}()};Z.prototype={transform:function(t,i){return this._transform(t.clone(),i)},_transform:function(t,i){return i=i||1,t.x=i*(this._a*t.x+this._b),t.y=i*(this._c*t.y+this._d),t},untransform:function(t,i){return i=i||1,new x((t.x/i-this._b)/this._a,(t.y/i-this._d)/this._c)}};var di,pi,mi,fi,gi=i({},ci,{code:"EPSG:3857",projection:_i,transformation:function(){var t=.5/(Math.PI*_i.R);return E(t,.5,-t,.5)}()}),vi=i({},gi,{code:"EPSG:900913"}),yi=document.documentElement.style,xi="ActiveXObject"in window,wi=xi&&!document.addEventListener,Li="msLaunchUri"in navigator&&!("documentMode"in document),bi=B("webkit"),Pi=B("android"),Ti=B("android 2")||B("android 3"),zi=!!window.opera,Mi=B("chrome"),Ci=B("gecko")&&!bi&&!zi&&!xi,Zi=!Mi&&B("safari"),Ei=B("phantom"),Si="OTransition"in yi,ki=0===navigator.platform.indexOf("Win"),Bi=xi&&"transition"in yi,Ii="WebKitCSSMatrix"in window&&"m11"in new window.WebKitCSSMatrix&&!Ti,Ai="MozPerspective"in yi,Oi=!window.L_DISABLE_3D&&(Bi||Ii||Ai)&&!Si&&!Ei,Ri="undefined"!=typeof orientation||B("mobile"),Di=Ri&&bi,Ni=Ri&&Ii,ji=!window.PointerEvent&&window.MSPointerEvent,Wi=!(!window.PointerEvent&&!ji),Hi=!window.L_NO_TOUCH&&(Wi||"ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch),Fi=Ri&&zi,Ui=Ri&&Ci,Vi=(window.devicePixelRatio||window.screen.deviceXDPI/window.screen.logicalXDPI)>1,Gi=!!document.createElement("canvas").getContext,qi=!(!document.createElementNS||!S("svg").createSVGRect),Ki=!qi&&function(){try{var t=document.createElement("div");t.innerHTML='<v:shape adj="1"/>';var i=t.firstChild;return i.style.behavior="url(#default#VML)",i&&"object"==typeof i.adj}catch(t){return!1}}(),Yi=(Object.freeze||Object)({ie:xi,ielt9:wi,edge:Li,webkit:bi,android:Pi,android23:Ti,opera:zi,chrome:Mi,gecko:Ci,safari:Zi,phantom:Ei,opera12:Si,win:ki,ie3d:Bi,webkit3d:Ii,gecko3d:Ai,any3d:Oi,mobile:Ri,mobileWebkit:Di,mobileWebkit3d:Ni,msPointer:ji,pointer:Wi,touch:Hi,mobileOpera:Fi,mobileGecko:Ui,retina:Vi,canvas:Gi,svg:qi,vml:Ki}),Xi=ji?"MSPointerDown":"pointerdown",Ji=ji?"MSPointerMove":"pointermove",$i=ji?"MSPointerUp":"pointerup",Qi=ji?"MSPointerCancel":"pointercancel",te=["INPUT","SELECT","OPTION"],ie={},ee=!1,ne=0,oe=ji?"MSPointerDown":Wi?"pointerdown":"touchstart",se=ji?"MSPointerUp":Wi?"pointerup":"touchend",re="_leaflet_",ae="_leaflet_events",he=ki&&Mi?2*window.devicePixelRatio:Ci?window.devicePixelRatio:1,ue={},le=(Object.freeze||Object)({on:V,off:G,stopPropagation:Y,disableScrollPropagation:X,disableClickPropagation:J,preventDefault:$,stop:Q,getMousePosition:tt,getWheelDelta:it,fakeStop:et,skipped:nt,isExternalTarget:ot,addListener:V,removeListener:G}),ce=xt(["transform","WebkitTransform","OTransform","MozTransform","msTransform"]),_e=xt(["webkitTransition","transition","OTransition","MozTransition","msTransition"]),de="webkitTransition"===_e||"OTransition"===_e?_e+"End":"transitionend";if("onselectstart"in document)pi=function(){V(window,"selectstart",$)},mi=function(){G(window,"selectstart",$)};else{var pe=xt(["userSelect","WebkitUserSelect","OUserSelect","MozUserSelect","msUserSelect"]);pi=function(){if(pe){var t=document.documentElement.style;fi=t[pe],t[pe]="none"}},mi=function(){pe&&(document.documentElement.style[pe]=fi,fi=void 0)}}var me,fe,ge=(Object.freeze||Object)({TRANSFORM:ce,TRANSITION:_e,TRANSITION_END:de,get:rt,getStyle:at,create:ht,remove:ut,empty:lt,toFront:ct,toBack:_t,hasClass:dt,addClass:pt,removeClass:mt,setClass:ft,getClass:gt,setOpacity:vt,testProp:xt,setTransform:wt,setPosition:Lt,getPosition:bt,disableTextSelection:pi,enableTextSelection:mi,disableImageDrag:Pt,enableImageDrag:Tt,preventOutline:zt,restoreOutline:Mt}),ve=ui.extend({run:function(t,i,e,n){this.stop(),this._el=t,this._inProgress=!0,this._duration=e||.25,this._easeOutPower=1/Math.max(n||.5,.2),this._startPos=bt(t),this._offset=i.subtract(this._startPos),this._startTime=+new Date,this.fire("start"),this._animate()},stop:function(){this._inProgress&&(this._step(!0),this._complete())},_animate:function(){this._animId=f(this._animate,this),this._step()},_step:function(t){var i=+new Date-this._startTime,e=1e3*this._duration;i<e?this._runFrame(this._easeOut(i/e),t):(this._runFrame(1),this._complete())},_runFrame:function(t,i){var e=this._startPos.add(this._offset.multiplyBy(t));i&&e._round(),Lt(this._el,e),this.fire("step")},_complete:function(){g(this._animId),this._inProgress=!1,this.fire("end")},_easeOut:function(t){return 1-Math.pow(1-t,this._easeOutPower)}}),ye=ui.extend({options:{crs:gi,center:void 0,zoom:void 0,minZoom:void 0,maxZoom:void 0,layers:[],maxBounds:void 0,renderer:void 0,zoomAnimation:!0,zoomAnimationThreshold:4,fadeAnimation:!0,markerZoomAnimation:!0,transform3DLimit:8388608,zoomSnap:1,zoomDelta:1,trackResize:!0},initialize:function(t,i){i=l(this,i),this._initContainer(t),this._initLayout(),this._onResize=e(this._onResize,this),this._initEvents(),i.maxBounds&&this.setMaxBounds(i.maxBounds),void 0!==i.zoom&&(this._zoom=this._limitZoom(i.zoom)),i.center&&void 0!==i.zoom&&this.setView(C(i.center),i.zoom,{reset:!0}),this._handlers=[],this._layers={},this._zoomBoundLayers={},this._sizeChanged=!0,this.callInitHooks(),this._zoomAnimated=_e&&Oi&&!Fi&&this.options.zoomAnimation,this._zoomAnimated&&(this._createAnimProxy(),V(this._proxy,de,this._catchTransitionEnd,this)),this._addLayers(this.options.layers)},setView:function(t,e,n){return e=void 0===e?this._zoom:this._limitZoom(e),t=this._limitCenter(C(t),e,this.options.maxBounds),n=n||{},this._stop(),this._loaded&&!n.reset&&!0!==n&&(void 0!==n.animate&&(n.zoom=i({animate:n.animate},n.zoom),n.pan=i({animate:n.animate,duration:n.duration},n.pan)),this._zoom!==e?this._tryAnimatedZoom&&this._tryAnimatedZoom(t,e,n.zoom):this._tryAnimatedPan(t,n.pan))?(clearTimeout(this._sizeTimer),this):(this._resetView(t,e),this)},setZoom:function(t,i){return this._loaded?this.setView(this.getCenter(),t,{zoom:i}):(this._zoom=t,this)},zoomIn:function(t,i){return t=t||(Oi?this.options.zoomDelta:1),this.setZoom(this._zoom+t,i)},zoomOut:function(t,i){return t=t||(Oi?this.options.zoomDelta:1),this.setZoom(this._zoom-t,i)},setZoomAround:function(t,i,e){var n=this.getZoomScale(i),o=this.getSize().divideBy(2),s=(t instanceof x?t:this.latLngToContainerPoint(t)).subtract(o).multiplyBy(1-1/n),r=this.containerPointToLatLng(o.add(s));return this.setView(r,i,{zoom:e})},_getBoundsCenterZoom:function(t,i){i=i||{},t=t.getBounds?t.getBounds():z(t);var e=w(i.paddingTopLeft||i.padding||[0,0]),n=w(i.paddingBottomRight||i.padding||[0,0]),o=this.getBoundsZoom(t,!1,e.add(n));if((o="number"==typeof i.maxZoom?Math.min(i.maxZoom,o):o)===1/0)return{center:t.getCenter(),zoom:o};var s=n.subtract(e).divideBy(2),r=this.project(t.getSouthWest(),o),a=this.project(t.getNorthEast(),o);return{center:this.unproject(r.add(a).divideBy(2).add(s),o),zoom:o}},fitBounds:function(t,i){if(!(t=z(t)).isValid())throw new Error("Bounds are not valid.");var e=this._getBoundsCenterZoom(t,i);return this.setView(e.center,e.zoom,i)},fitWorld:function(t){return this.fitBounds([[-90,-180],[90,180]],t)},panTo:function(t,i){return this.setView(t,this._zoom,{pan:i})},panBy:function(t,i){if(t=w(t).round(),i=i||{},!t.x&&!t.y)return this.fire("moveend");if(!0!==i.animate&&!this.getSize().contains(t))return this._resetView(this.unproject(this.project(this.getCenter()).add(t)),this.getZoom()),this;if(this._panAnim||(this._panAnim=new ve,this._panAnim.on({step:this._onPanTransitionStep,end:this._onPanTransitionEnd},this)),i.noMoveStart||this.fire("movestart"),!1!==i.animate){pt(this._mapPane,"leaflet-pan-anim");var e=this._getMapPanePos().subtract(t).round();this._panAnim.run(this._mapPane,e,i.duration||.25,i.easeLinearity)}else this._rawPanBy(t),this.fire("move").fire("moveend");return this},flyTo:function(t,i,e){function n(t){var i=(g*g-m*m+(t?-1:1)*x*x*v*v)/(2*(t?g:m)*x*v),e=Math.sqrt(i*i+1)-i;return e<1e-9?-18:Math.log(e)}function o(t){return(Math.exp(t)-Math.exp(-t))/2}function s(t){return(Math.exp(t)+Math.exp(-t))/2}function r(t){return o(t)/s(t)}function a(t){return m*(s(w)/s(w+y*t))}function h(t){return m*(s(w)*r(w+y*t)-o(w))/x}function u(t){return 1-Math.pow(1-t,1.5)}function l(){var e=(Date.now()-L)/P,n=u(e)*b;e<=1?(this._flyToFrame=f(l,this),this._move(this.unproject(c.add(_.subtract(c).multiplyBy(h(n)/v)),p),this.getScaleZoom(m/a(n),p),{flyTo:!0})):this._move(t,i)._moveEnd(!0)}if(!1===(e=e||{}).animate||!Oi)return this.setView(t,i,e);this._stop();var c=this.project(this.getCenter()),_=this.project(t),d=this.getSize(),p=this._zoom;t=C(t),i=void 0===i?p:i;var m=Math.max(d.x,d.y),g=m*this.getZoomScale(p,i),v=_.distanceTo(c)||1,y=1.42,x=y*y,w=n(0),L=Date.now(),b=(n(1)-w)/y,P=e.duration?1e3*e.duration:1e3*b*.8;return this._moveStart(!0),l.call(this),this},flyToBounds:function(t,i){var e=this._getBoundsCenterZoom(t,i);return this.flyTo(e.center,e.zoom,i)},setMaxBounds:function(t){return(t=z(t)).isValid()?(this.options.maxBounds&&this.off("moveend",this._panInsideMaxBounds),this.options.maxBounds=t,this._loaded&&this._panInsideMaxBounds(),this.on("moveend",this._panInsideMaxBounds)):(this.options.maxBounds=null,this.off("moveend",this._panInsideMaxBounds))},setMinZoom:function(t){return this.options.minZoom=t,this._loaded&&this.getZoom()<this.options.minZoom?this.setZoom(t):this},setMaxZoom:function(t){return this.options.maxZoom=t,this._loaded&&this.getZoom()>this.options.maxZoom?this.setZoom(t):this},panInsideBounds:function(t,i){this._enforcingBounds=!0;var e=this.getCenter(),n=this._limitCenter(e,this._zoom,z(t));return e.equals(n)||this.panTo(n,i),this._enforcingBounds=!1,this},invalidateSize:function(t){if(!this._loaded)return this;t=i({animate:!1,pan:!0},!0===t?{animate:!0}:t);var n=this.getSize();this._sizeChanged=!0,this._lastCenter=null;var o=this.getSize(),s=n.divideBy(2).round(),r=o.divideBy(2).round(),a=s.subtract(r);return a.x||a.y?(t.animate&&t.pan?this.panBy(a):(t.pan&&this._rawPanBy(a),this.fire("move"),t.debounceMoveend?(clearTimeout(this._sizeTimer),this._sizeTimer=setTimeout(e(this.fire,this,"moveend"),200)):this.fire("moveend")),this.fire("resize",{oldSize:n,newSize:o})):this},stop:function(){return this.setZoom(this._limitZoom(this._zoom)),this.options.zoomSnap||this.fire("viewreset"),this._stop()},locate:function(t){if(t=this._locateOptions=i({timeout:1e4,watch:!1},t),!("geolocation"in navigator))return this._handleGeolocationError({code:0,message:"Geolocation not supported."}),this;var n=e(this._handleGeolocationResponse,this),o=e(this._handleGeolocationError,this);return t.watch?this._locationWatchId=navigator.geolocation.watchPosition(n,o,t):navigator.geolocation.getCurrentPosition(n,o,t),this},stopLocate:function(){return navigator.geolocation&&navigator.geolocation.clearWatch&&navigator.geolocation.clearWatch(this._locationWatchId),this._locateOptions&&(this._locateOptions.setView=!1),this},_handleGeolocationError:function(t){var i=t.code,e=t.message||(1===i?"permission denied":2===i?"position unavailable":"timeout");this._locateOptions.setView&&!this._loaded&&this.fitWorld(),this.fire("locationerror",{code:i,message:"Geolocation error: "+e+"."})},_handleGeolocationResponse:function(t){var i=new M(t.coords.latitude,t.coords.longitude),e=i.toBounds(t.coords.accuracy),n=this._locateOptions;if(n.setView){var o=this.getBoundsZoom(e);this.setView(i,n.maxZoom?Math.min(o,n.maxZoom):o)}var s={latlng:i,bounds:e,timestamp:t.timestamp};for(var r in t.coords)"number"==typeof t.coords[r]&&(s[r]=t.coords[r]);this.fire("locationfound",s)},addHandler:function(t,i){if(!i)return this;var e=this[t]=new i(this);return this._handlers.push(e),this.options[t]&&e.enable(),this},remove:function(){if(this._initEvents(!0),this._containerId!==this._container._leaflet_id)throw new Error("Map container is being reused by another instance");try{delete this._container._leaflet_id,delete this._containerId}catch(t){this._container._leaflet_id=void 0,this._containerId=void 0}ut(this._mapPane),this._clearControlPos&&this._clearControlPos(),this._clearHandlers(),this._loaded&&this.fire("unload");var t;for(t in this._layers)this._layers[t].remove();for(t in this._panes)ut(this._panes[t]);return this._layers=[],this._panes=[],delete this._mapPane,delete this._renderer,this},createPane:function(t,i){var e=ht("div","leaflet-pane"+(t?" leaflet-"+t.replace("Pane","")+"-pane":""),i||this._mapPane);return t&&(this._panes[t]=e),e},getCenter:function(){return this._checkIfLoaded(),this._lastCenter&&!this._moved()?this._lastCenter:this.layerPointToLatLng(this._getCenterLayerPoint())},getZoom:function(){return this._zoom},getBounds:function(){var t=this.getPixelBounds();return new T(this.unproject(t.getBottomLeft()),this.unproject(t.getTopRight()))},getMinZoom:function(){return void 0===this.options.minZoom?this._layersMinZoom||0:this.options.minZoom},getMaxZoom:function(){return void 0===this.options.maxZoom?void 0===this._layersMaxZoom?1/0:this._layersMaxZoom:this.options.maxZoom},getBoundsZoom:function(t,i,e){t=z(t),e=w(e||[0,0]);var n=this.getZoom()||0,o=this.getMinZoom(),s=this.getMaxZoom(),r=t.getNorthWest(),a=t.getSouthEast(),h=this.getSize().subtract(e),u=P(this.project(a,n),this.project(r,n)).getSize(),l=Oi?this.options.zoomSnap:1,c=h.x/u.x,_=h.y/u.y,d=i?Math.max(c,_):Math.min(c,_);return n=this.getScaleZoom(d,n),l&&(n=Math.round(n/(l/100))*(l/100),n=i?Math.ceil(n/l)*l:Math.floor(n/l)*l),Math.max(o,Math.min(s,n))},getSize:function(){return this._size&&!this._sizeChanged||(this._size=new x(this._container.clientWidth||0,this._container.clientHeight||0),this._sizeChanged=!1),this._size.clone()},getPixelBounds:function(t,i){var e=this._getTopLeftPoint(t,i);return new b(e,e.add(this.getSize()))},getPixelOrigin:function(){return this._checkIfLoaded(),this._pixelOrigin},getPixelWorldBounds:function(t){return this.options.crs.getProjectedBounds(void 0===t?this.getZoom():t)},getPane:function(t){return"string"==typeof t?this._panes[t]:t},getPanes:function(){return this._panes},getContainer:function(){return this._container},getZoomScale:function(t,i){var e=this.options.crs;return i=void 0===i?this._zoom:i,e.scale(t)/e.scale(i)},getScaleZoom:function(t,i){var e=this.options.crs;i=void 0===i?this._zoom:i;var n=e.zoom(t*e.scale(i));return isNaN(n)?1/0:n},project:function(t,i){return i=void 0===i?this._zoom:i,this.options.crs.latLngToPoint(C(t),i)},unproject:function(t,i){return i=void 0===i?this._zoom:i,this.options.crs.pointToLatLng(w(t),i)},layerPointToLatLng:function(t){var i=w(t).add(this.getPixelOrigin());return this.unproject(i)},latLngToLayerPoint:function(t){return this.project(C(t))._round()._subtract(this.getPixelOrigin())},wrapLatLng:function(t){return this.options.crs.wrapLatLng(C(t))},wrapLatLngBounds:function(t){return this.options.crs.wrapLatLngBounds(z(t))},distance:function(t,i){return this.options.crs.distance(C(t),C(i))},containerPointToLayerPoint:function(t){return w(t).subtract(this._getMapPanePos())},layerPointToContainerPoint:function(t){return w(t).add(this._getMapPanePos())},containerPointToLatLng:function(t){var i=this.containerPointToLayerPoint(w(t));return this.layerPointToLatLng(i)},latLngToContainerPoint:function(t){return this.layerPointToContainerPoint(this.latLngToLayerPoint(C(t)))},mouseEventToContainerPoint:function(t){return tt(t,this._container)},mouseEventToLayerPoint:function(t){return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(t))},mouseEventToLatLng:function(t){return this.layerPointToLatLng(this.mouseEventToLayerPoint(t))},_initContainer:function(t){var i=this._container=rt(t);if(!i)throw new Error("Map container not found.");if(i._leaflet_id)throw new Error("Map container is already initialized.");V(i,"scroll",this._onScroll,this),this._containerId=n(i)},_initLayout:function(){var t=this._container;this._fadeAnimated=this.options.fadeAnimation&&Oi,pt(t,"leaflet-container"+(Hi?" leaflet-touch":"")+(Vi?" leaflet-retina":"")+(wi?" leaflet-oldie":"")+(Zi?" leaflet-safari":"")+(this._fadeAnimated?" leaflet-fade-anim":""));var i=at(t,"position");"absolute"!==i&&"relative"!==i&&"fixed"!==i&&(t.style.position="relative"),this._initPanes(),this._initControlPos&&this._initControlPos()},_initPanes:function(){var t=this._panes={};this._paneRenderers={},this._mapPane=this.createPane("mapPane",this._container),Lt(this._mapPane,new x(0,0)),this.createPane("tilePane"),this.createPane("shadowPane"),this.createPane("overlayPane"),this.createPane("markerPane"),this.createPane("tooltipPane"),this.createPane("popupPane"),this.options.markerZoomAnimation||(pt(t.markerPane,"leaflet-zoom-hide"),pt(t.shadowPane,"leaflet-zoom-hide"))},_resetView:function(t,i){Lt(this._mapPane,new x(0,0));var e=!this._loaded;this._loaded=!0,i=this._limitZoom(i),this.fire("viewprereset");var n=this._zoom!==i;this._moveStart(n)._move(t,i)._moveEnd(n),this.fire("viewreset"),e&&this.fire("load")},_moveStart:function(t){return t&&this.fire("zoomstart"),this.fire("movestart")},_move:function(t,i,e){void 0===i&&(i=this._zoom);var n=this._zoom!==i;return this._zoom=i,this._lastCenter=t,this._pixelOrigin=this._getNewPixelOrigin(t),(n||e&&e.pinch)&&this.fire("zoom",e),this.fire("move",e)},_moveEnd:function(t){return t&&this.fire("zoomend"),this.fire("moveend")},_stop:function(){return g(this._flyToFrame),this._panAnim&&this._panAnim.stop(),this},_rawPanBy:function(t){Lt(this._mapPane,this._getMapPanePos().subtract(t))},_getZoomSpan:function(){return this.getMaxZoom()-this.getMinZoom()},_panInsideMaxBounds:function(){this._enforcingBounds||this.panInsideBounds(this.options.maxBounds)},_checkIfLoaded:function(){if(!this._loaded)throw new Error("Set map center and zoom first.")},_initEvents:function(t){this._targets={},this._targets[n(this._container)]=this;var i=t?G:V;i(this._container,"click dblclick mousedown mouseup mouseover mouseout mousemove contextmenu keypress",this._handleDOMEvent,this),this.options.trackResize&&i(window,"resize",this._onResize,this),Oi&&this.options.transform3DLimit&&(t?this.off:this.on).call(this,"moveend",this._onMoveEnd)},_onResize:function(){g(this._resizeRequest),this._resizeRequest=f(function(){this.invalidateSize({debounceMoveend:!0})},this)},_onScroll:function(){this._container.scrollTop=0,this._container.scrollLeft=0},_onMoveEnd:function(){var t=this._getMapPanePos();Math.max(Math.abs(t.x),Math.abs(t.y))>=this.options.transform3DLimit&&this._resetView(this.getCenter(),this.getZoom())},_findEventTargets:function(t,i){for(var e,o=[],s="mouseout"===i||"mouseover"===i,r=t.target||t.srcElement,a=!1;r;){if((e=this._targets[n(r)])&&("click"===i||"preclick"===i)&&!t._simulated&&this._draggableMoved(e)){a=!0;break}if(e&&e.listens(i,!0)){if(s&&!ot(r,t))break;if(o.push(e),s)break}if(r===this._container)break;r=r.parentNode}return o.length||a||s||!ot(r,t)||(o=[this]),o},_handleDOMEvent:function(t){if(this._loaded&&!nt(t)){var i=t.type;"mousedown"!==i&&"keypress"!==i||zt(t.target||t.srcElement),this._fireDOMEvent(t,i)}},_mouseEvents:["click","dblclick","mouseover","mouseout","contextmenu"],_fireDOMEvent:function(t,e,n){if("click"===t.type){var o=i({},t);o.type="preclick",this._fireDOMEvent(o,o.type,n)}if(!t._stopped&&(n=(n||[]).concat(this._findEventTargets(t,e))).length){var s=n[0];"contextmenu"===e&&s.listens(e,!0)&&$(t);var r={originalEvent:t};if("keypress"!==t.type){var a=s.options&&"icon"in s.options;r.containerPoint=a?this.latLngToContainerPoint(s.getLatLng()):this.mouseEventToContainerPoint(t),r.layerPoint=this.containerPointToLayerPoint(r.containerPoint),r.latlng=a?s.getLatLng():this.layerPointToLatLng(r.layerPoint)}for(var h=0;h<n.length;h++)if(n[h].fire(e,r,!0),r.originalEvent._stopped||!1===n[h].options.bubblingMouseEvents&&-1!==d(this._mouseEvents,e))return}},_draggableMoved:function(t){return(t=t.dragging&&t.dragging.enabled()?t:this).dragging&&t.dragging.moved()||this.boxZoom&&this.boxZoom.moved()},_clearHandlers:function(){for(var t=0,i=this._handlers.length;t<i;t++)this._handlers[t].disable()},whenReady:function(t,i){return this._loaded?t.call(i||this,{target:this}):this.on("load",t,i),this},_getMapPanePos:function(){return bt(this._mapPane)||new x(0,0)},_moved:function(){var t=this._getMapPanePos();return t&&!t.equals([0,0])},_getTopLeftPoint:function(t,i){return(t&&void 0!==i?this._getNewPixelOrigin(t,i):this.getPixelOrigin()).subtract(this._getMapPanePos())},_getNewPixelOrigin:function(t,i){var e=this.getSize()._divideBy(2);return this.project(t,i)._subtract(e)._add(this._getMapPanePos())._round()},_latLngToNewLayerPoint:function(t,i,e){var n=this._getNewPixelOrigin(e,i);return this.project(t,i)._subtract(n)},_latLngBoundsToNewLayerBounds:function(t,i,e){var n=this._getNewPixelOrigin(e,i);return P([this.project(t.getSouthWest(),i)._subtract(n),this.project(t.getNorthWest(),i)._subtract(n),this.project(t.getSouthEast(),i)._subtract(n),this.project(t.getNorthEast(),i)._subtract(n)])},_getCenterLayerPoint:function(){return this.containerPointToLayerPoint(this.getSize()._divideBy(2))},_getCenterOffset:function(t){return this.latLngToLayerPoint(t).subtract(this._getCenterLayerPoint())},_limitCenter:function(t,i,e){if(!e)return t;var n=this.project(t,i),o=this.getSize().divideBy(2),s=new b(n.subtract(o),n.add(o)),r=this._getBoundsOffset(s,e,i);return r.round().equals([0,0])?t:this.unproject(n.add(r),i)},_limitOffset:function(t,i){if(!i)return t;var e=this.getPixelBounds(),n=new b(e.min.add(t),e.max.add(t));return t.add(this._getBoundsOffset(n,i))},_getBoundsOffset:function(t,i,e){var n=P(this.project(i.getNorthEast(),e),this.project(i.getSouthWest(),e)),o=n.min.subtract(t.min),s=n.max.subtract(t.max);return new x(this._rebound(o.x,-s.x),this._rebound(o.y,-s.y))},_rebound:function(t,i){return t+i>0?Math.round(t-i)/2:Math.max(0,Math.ceil(t))-Math.max(0,Math.floor(i))},_limitZoom:function(t){var i=this.getMinZoom(),e=this.getMaxZoom(),n=Oi?this.options.zoomSnap:1;return n&&(t=Math.round(t/n)*n),Math.max(i,Math.min(e,t))},_onPanTransitionStep:function(){this.fire("move")},_onPanTransitionEnd:function(){mt(this._mapPane,"leaflet-pan-anim"),this.fire("moveend")},_tryAnimatedPan:function(t,i){var e=this._getCenterOffset(t)._floor();return!(!0!==(i&&i.animate)&&!this.getSize().contains(e))&&(this.panBy(e,i),!0)},_createAnimProxy:function(){var t=this._proxy=ht("div","leaflet-proxy leaflet-zoom-animated");this._panes.mapPane.appendChild(t),this.on("zoomanim",function(t){var i=ce,e=this._proxy.style[i];wt(this._proxy,this.project(t.center,t.zoom),this.getZoomScale(t.zoom,1)),e===this._proxy.style[i]&&this._animatingZoom&&this._onZoomTransitionEnd()},this),this.on("load moveend",function(){var t=this.getCenter(),i=this.getZoom();wt(this._proxy,this.project(t,i),this.getZoomScale(i,1))},this),this._on("unload",this._destroyAnimProxy,this)},_destroyAnimProxy:function(){ut(this._proxy),delete this._proxy},_catchTransitionEnd:function(t){this._animatingZoom&&t.propertyName.indexOf("transform")>=0&&this._onZoomTransitionEnd()},_nothingToAnimate:function(){return!this._container.getElementsByClassName("leaflet-zoom-animated").length},_tryAnimatedZoom:function(t,i,e){if(this._animatingZoom)return!0;if(e=e||{},!this._zoomAnimated||!1===e.animate||this._nothingToAnimate()||Math.abs(i-this._zoom)>this.options.zoomAnimationThreshold)return!1;var n=this.getZoomScale(i),o=this._getCenterOffset(t)._divideBy(1-1/n);return!(!0!==e.animate&&!this.getSize().contains(o))&&(f(function(){this._moveStart(!0)._animateZoom(t,i,!0)},this),!0)},_animateZoom:function(t,i,n,o){n&&(this._animatingZoom=!0,this._animateToCenter=t,this._animateToZoom=i,pt(this._mapPane,"leaflet-zoom-anim")),this.fire("zoomanim",{center:t,zoom:i,noUpdate:o}),setTimeout(e(this._onZoomTransitionEnd,this),250)},_onZoomTransitionEnd:function(){this._animatingZoom&&(mt(this._mapPane,"leaflet-zoom-anim"),this._animatingZoom=!1,this._move(this._animateToCenter,this._animateToZoom),f(function(){this._moveEnd(!0)},this))}}),xe=v.extend({options:{position:"topright"},initialize:function(t){l(this,t)},getPosition:function(){return this.options.position},setPosition:function(t){var i=this._map;return i&&i.removeControl(this),this.options.position=t,i&&i.addControl(this),this},getContainer:function(){return this._container},addTo:function(t){this.remove(),this._map=t;var i=this._container=this.onAdd(t),e=this.getPosition(),n=t._controlCorners[e];return pt(i,"leaflet-control"),-1!==e.indexOf("bottom")?n.insertBefore(i,n.firstChild):n.appendChild(i),this},remove:function(){return this._map?(ut(this._container),this.onRemove&&this.onRemove(this._map),this._map=null,this):this},_refocusOnMap:function(t){this._map&&t&&t.screenX>0&&t.screenY>0&&this._map.getContainer().focus()}}),we=function(t){return new xe(t)};ye.include({addControl:function(t){return t.addTo(this),this},removeControl:function(t){return t.remove(),this},_initControlPos:function(){function t(t,o){var s=e+t+" "+e+o;i[t+o]=ht("div",s,n)}var i=this._controlCorners={},e="leaflet-",n=this._controlContainer=ht("div",e+"control-container",this._container);t("top","left"),t("top","right"),t("bottom","left"),t("bottom","right")},_clearControlPos:function(){for(var t in this._controlCorners)ut(this._controlCorners[t]);ut(this._controlContainer),delete this._controlCorners,delete this._controlContainer}});var Le=xe.extend({options:{collapsed:!0,position:"topright",autoZIndex:!0,hideSingleBase:!1,sortLayers:!1,sortFunction:function(t,i,e,n){return e<n?-1:n<e?1:0}},initialize:function(t,i,e){l(this,e),this._layerControlInputs=[],this._layers=[],this._lastZIndex=0,this._handlingClick=!1;for(var n in t)this._addLayer(t[n],n);for(n in i)this._addLayer(i[n],n,!0)},onAdd:function(t){this._initLayout(),this._update(),this._map=t,t.on("zoomend",this._checkDisabledLayers,this);for(var i=0;i<this._layers.length;i++)this._layers[i].layer.on("add remove",this._onLayerChange,this);return this._container},addTo:function(t){return xe.prototype.addTo.call(this,t),this._expandIfNotCollapsed()},onRemove:function(){this._map.off("zoomend",this._checkDisabledLayers,this);for(var t=0;t<this._layers.length;t++)this._layers[t].layer.off("add remove",this._onLayerChange,this)},addBaseLayer:function(t,i){return this._addLayer(t,i),this._map?this._update():this},addOverlay:function(t,i){return this._addLayer(t,i,!0),this._map?this._update():this},removeLayer:function(t){t.off("add remove",this._onLayerChange,this);var i=this._getLayer(n(t));return i&&this._layers.splice(this._layers.indexOf(i),1),this._map?this._update():this},expand:function(){pt(this._container,"leaflet-control-layers-expanded"),this._form.style.height=null;var t=this._map.getSize().y-(this._container.offsetTop+50);return t<this._form.clientHeight?(pt(this._form,"leaflet-control-layers-scrollbar"),this._form.style.height=t+"px"):mt(this._form,"leaflet-control-layers-scrollbar"),this._checkDisabledLayers(),this},collapse:function(){return mt(this._container,"leaflet-control-layers-expanded"),this},_initLayout:function(){var t="leaflet-control-layers",i=this._container=ht("div",t),e=this.options.collapsed;i.setAttribute("aria-haspopup",!0),J(i),X(i);var n=this._form=ht("form",t+"-list");e&&(this._map.on("click",this.collapse,this),Pi||V(i,{mouseenter:this.expand,mouseleave:this.collapse},this));var o=this._layersLink=ht("a",t+"-toggle",i);o.href="#",o.title="Layers",Hi?(V(o,"click",Q),V(o,"click",this.expand,this)):V(o,"focus",this.expand,this),e||this.expand(),this._baseLayersList=ht("div",t+"-base",n),this._separator=ht("div",t+"-separator",n),this._overlaysList=ht("div",t+"-overlays",n),i.appendChild(n)},_getLayer:function(t){for(var i=0;i<this._layers.length;i++)if(this._layers[i]&&n(this._layers[i].layer)===t)return this._layers[i]},_addLayer:function(t,i,n){this._map&&t.on("add remove",this._onLayerChange,this),this._layers.push({layer:t,name:i,overlay:n}),this.options.sortLayers&&this._layers.sort(e(function(t,i){return this.options.sortFunction(t.layer,i.layer,t.name,i.name)},this)),this.options.autoZIndex&&t.setZIndex&&(this._lastZIndex++,t.setZIndex(this._lastZIndex)),this._expandIfNotCollapsed()},_update:function(){if(!this._container)return this;lt(this._baseLayersList),lt(this._overlaysList),this._layerControlInputs=[];var t,i,e,n,o=0;for(e=0;e<this._layers.length;e++)n=this._layers[e],this._addItem(n),i=i||n.overlay,t=t||!n.overlay,o+=n.overlay?0:1;return this.options.hideSingleBase&&(t=t&&o>1,this._baseLayersList.style.display=t?"":"none"),this._separator.style.display=i&&t?"":"none",this},_onLayerChange:function(t){this._handlingClick||this._update();var i=this._getLayer(n(t.target)),e=i.overlay?"add"===t.type?"overlayadd":"overlayremove":"add"===t.type?"baselayerchange":null;e&&this._map.fire(e,i)},_createRadioElement:function(t,i){var e='<input type="radio" class="leaflet-control-layers-selector" name="'+t+'"'+(i?' checked="checked"':"")+"/>",n=document.createElement("div");return n.innerHTML=e,n.firstChild},_addItem:function(t){var i,e=document.createElement("label"),o=this._map.hasLayer(t.layer);t.overlay?((i=document.createElement("input")).type="checkbox",i.className="leaflet-control-layers-selector",i.defaultChecked=o):i=this._createRadioElement("leaflet-base-layers",o),this._layerControlInputs.push(i),i.layerId=n(t.layer),V(i,"click",this._onInputClick,this);var s=document.createElement("span");s.innerHTML=" "+t.name;var r=document.createElement("div");return e.appendChild(r),r.appendChild(i),r.appendChild(s),(t.overlay?this._overlaysList:this._baseLayersList).appendChild(e),this._checkDisabledLayers(),e},_onInputClick:function(){var t,i,e=this._layerControlInputs,n=[],o=[];this._handlingClick=!0;for(var s=e.length-1;s>=0;s--)t=e[s],i=this._getLayer(t.layerId).layer,t.checked?n.push(i):t.checked||o.push(i);for(s=0;s<o.length;s++)this._map.hasLayer(o[s])&&this._map.removeLayer(o[s]);for(s=0;s<n.length;s++)this._map.hasLayer(n[s])||this._map.addLayer(n[s]);this._handlingClick=!1,this._refocusOnMap()},_checkDisabledLayers:function(){for(var t,i,e=this._layerControlInputs,n=this._map.getZoom(),o=e.length-1;o>=0;o--)t=e[o],i=this._getLayer(t.layerId).layer,t.disabled=void 0!==i.options.minZoom&&n<i.options.minZoom||void 0!==i.options.maxZoom&&n>i.options.maxZoom},_expandIfNotCollapsed:function(){return this._map&&!this.options.collapsed&&this.expand(),this},_expand:function(){return this.expand()},_collapse:function(){return this.collapse()}}),be=xe.extend({options:{position:"topleft",zoomInText:"+",zoomInTitle:"Zoom in",zoomOutText:"&#x2212;",zoomOutTitle:"Zoom out"},onAdd:function(t){var i="leaflet-control-zoom",e=ht("div",i+" leaflet-bar"),n=this.options;return this._zoomInButton=this._createButton(n.zoomInText,n.zoomInTitle,i+"-in",e,this._zoomIn),this._zoomOutButton=this._createButton(n.zoomOutText,n.zoomOutTitle,i+"-out",e,this._zoomOut),this._updateDisabled(),t.on("zoomend zoomlevelschange",this._updateDisabled,this),e},onRemove:function(t){t.off("zoomend zoomlevelschange",this._updateDisabled,this)},disable:function(){return this._disabled=!0,this._updateDisabled(),this},enable:function(){return this._disabled=!1,this._updateDisabled(),this},_zoomIn:function(t){!this._disabled&&this._map._zoom<this._map.getMaxZoom()&&this._map.zoomIn(this._map.options.zoomDelta*(t.shiftKey?3:1))},_zoomOut:function(t){!this._disabled&&this._map._zoom>this._map.getMinZoom()&&this._map.zoomOut(this._map.options.zoomDelta*(t.shiftKey?3:1))},_createButton:function(t,i,e,n,o){var s=ht("a",e,n);return s.innerHTML=t,s.href="#",s.title=i,s.setAttribute("role","button"),s.setAttribute("aria-label",i),J(s),V(s,"click",Q),V(s,"click",o,this),V(s,"click",this._refocusOnMap,this),s},_updateDisabled:function(){var t=this._map,i="leaflet-disabled";mt(this._zoomInButton,i),mt(this._zoomOutButton,i),(this._disabled||t._zoom===t.getMinZoom())&&pt(this._zoomOutButton,i),(this._disabled||t._zoom===t.getMaxZoom())&&pt(this._zoomInButton,i)}});ye.mergeOptions({zoomControl:!0}),ye.addInitHook(function(){this.options.zoomControl&&(this.zoomControl=new be,this.addControl(this.zoomControl))});var Pe=xe.extend({options:{position:"bottomleft",maxWidth:100,metric:!0,imperial:!0},onAdd:function(t){var i=ht("div","leaflet-control-scale"),e=this.options;return this._addScales(e,"leaflet-control-scale-line",i),t.on(e.updateWhenIdle?"moveend":"move",this._update,this),t.whenReady(this._update,this),i},onRemove:function(t){t.off(this.options.updateWhenIdle?"moveend":"move",this._update,this)},_addScales:function(t,i,e){t.metric&&(this._mScale=ht("div",i,e)),t.imperial&&(this._iScale=ht("div",i,e))},_update:function(){var t=this._map,i=t.getSize().y/2,e=t.distance(t.containerPointToLatLng([0,i]),t.containerPointToLatLng([this.options.maxWidth,i]));this._updateScales(e)},_updateScales:function(t){this.options.metric&&t&&this._updateMetric(t),this.options.imperial&&t&&this._updateImperial(t)},_updateMetric:function(t){var i=this._getRoundNum(t),e=i<1e3?i+" m":i/1e3+" km";this._updateScale(this._mScale,e,i/t)},_updateImperial:function(t){var i,e,n,o=3.2808399*t;o>5280?(i=o/5280,e=this._getRoundNum(i),this._updateScale(this._iScale,e+" mi",e/i)):(n=this._getRoundNum(o),this._updateScale(this._iScale,n+" ft",n/o))},_updateScale:function(t,i,e){t.style.width=Math.round(this.options.maxWidth*e)+"px",t.innerHTML=i},_getRoundNum:function(t){var i=Math.pow(10,(Math.floor(t)+"").length-1),e=t/i;return e=e>=10?10:e>=5?5:e>=3?3:e>=2?2:1,i*e}}),Te=xe.extend({options:{position:"bottomright",prefix:'<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'},initialize:function(t){l(this,t),this._attributions={}},onAdd:function(t){t.attributionControl=this,this._container=ht("div","leaflet-control-attribution"),J(this._container);for(var i in t._layers)t._layers[i].getAttribution&&this.addAttribution(t._layers[i].getAttribution());return this._update(),this._container},setPrefix:function(t){return this.options.prefix=t,this._update(),this},addAttribution:function(t){return t?(this._attributions[t]||(this._attributions[t]=0),this._attributions[t]++,this._update(),this):this},removeAttribution:function(t){return t?(this._attributions[t]&&(this._attributions[t]--,this._update()),this):this},_update:function(){if(this._map){var t=[];for(var i in this._attributions)this._attributions[i]&&t.push(i);var e=[];this.options.prefix&&e.push(this.options.prefix),t.length&&e.push(t.join(", ")),this._container.innerHTML=e.join(" | ")}}});ye.mergeOptions({attributionControl:!0}),ye.addInitHook(function(){this.options.attributionControl&&(new Te).addTo(this)});xe.Layers=Le,xe.Zoom=be,xe.Scale=Pe,xe.Attribution=Te,we.layers=function(t,i,e){return new Le(t,i,e)},we.zoom=function(t){return new be(t)},we.scale=function(t){return new Pe(t)},we.attribution=function(t){return new Te(t)};var ze,Me=v.extend({initialize:function(t){this._map=t},enable:function(){return this._enabled?this:(this._enabled=!0,this.addHooks(),this)},disable:function(){return this._enabled?(this._enabled=!1,this.removeHooks(),this):this},enabled:function(){return!!this._enabled}}),Ce={Events:hi},Ze=Hi?"touchstart mousedown":"mousedown",Ee={mousedown:"mouseup",touchstart:"touchend",pointerdown:"touchend",MSPointerDown:"touchend"},Se={mousedown:"mousemove",touchstart:"touchmove",pointerdown:"touchmove",MSPointerDown:"touchmove"},ke=ui.extend({options:{clickTolerance:3},initialize:function(t,i,e,n){l(this,n),this._element=t,this._dragStartTarget=i||t,this._preventOutline=e},enable:function(){this._enabled||(V(this._dragStartTarget,Ze,this._onDown,this),this._enabled=!0)},disable:function(){this._enabled&&(ke._dragging===this&&this.finishDrag(),G(this._dragStartTarget,Ze,this._onDown,this),this._enabled=!1,this._moved=!1)},_onDown:function(t){if(!t._simulated&&this._enabled&&(this._moved=!1,!dt(this._element,"leaflet-zoom-anim")&&!(ke._dragging||t.shiftKey||1!==t.which&&1!==t.button&&!t.touches||(ke._dragging=this,this._preventOutline&&zt(this._element),Pt(),pi(),this._moving)))){this.fire("down");var i=t.touches?t.touches[0]:t;this._startPoint=new x(i.clientX,i.clientY),V(document,Se[t.type],this._onMove,this),V(document,Ee[t.type],this._onUp,this)}},_onMove:function(t){if(!t._simulated&&this._enabled)if(t.touches&&t.touches.length>1)this._moved=!0;else{var i=t.touches&&1===t.touches.length?t.touches[0]:t,e=new x(i.clientX,i.clientY).subtract(this._startPoint);(e.x||e.y)&&(Math.abs(e.x)+Math.abs(e.y)<this.options.clickTolerance||($(t),this._moved||(this.fire("dragstart"),this._moved=!0,this._startPos=bt(this._element).subtract(e),pt(document.body,"leaflet-dragging"),this._lastTarget=t.target||t.srcElement,window.SVGElementInstance&&this._lastTarget instanceof SVGElementInstance&&(this._lastTarget=this._lastTarget.correspondingUseElement),pt(this._lastTarget,"leaflet-drag-target")),this._newPos=this._startPos.add(e),this._moving=!0,g(this._animRequest),this._lastEvent=t,this._animRequest=f(this._updatePosition,this,!0)))}},_updatePosition:function(){var t={originalEvent:this._lastEvent};this.fire("predrag",t),Lt(this._element,this._newPos),this.fire("drag",t)},_onUp:function(t){!t._simulated&&this._enabled&&this.finishDrag()},finishDrag:function(){mt(document.body,"leaflet-dragging"),this._lastTarget&&(mt(this._lastTarget,"leaflet-drag-target"),this._lastTarget=null);for(var t in Se)G(document,Se[t],this._onMove,this),G(document,Ee[t],this._onUp,this);Tt(),mi(),this._moved&&this._moving&&(g(this._animRequest),this.fire("dragend",{distance:this._newPos.distanceTo(this._startPos)})),this._moving=!1,ke._dragging=!1}}),Be=(Object.freeze||Object)({simplify:Ct,pointToSegmentDistance:Zt,closestPointOnSegment:function(t,i,e){return Rt(t,i,e)},clipSegment:Bt,_getEdgeIntersection:It,_getBitCode:At,_sqClosestPointOnSegment:Rt,isFlat:Dt,_flat:Nt}),Ie=(Object.freeze||Object)({clipPolygon:jt}),Ae={project:function(t){return new x(t.lng,t.lat)},unproject:function(t){return new M(t.y,t.x)},bounds:new b([-180,-90],[180,90])},Oe={R:6378137,R_MINOR:6356752.314245179,bounds:new b([-20037508.34279,-15496570.73972],[20037508.34279,18764656.23138]),project:function(t){var i=Math.PI/180,e=this.R,n=t.lat*i,o=this.R_MINOR/e,s=Math.sqrt(1-o*o),r=s*Math.sin(n),a=Math.tan(Math.PI/4-n/2)/Math.pow((1-r)/(1+r),s/2);return n=-e*Math.log(Math.max(a,1e-10)),new x(t.lng*i*e,n)},unproject:function(t){for(var i,e=180/Math.PI,n=this.R,o=this.R_MINOR/n,s=Math.sqrt(1-o*o),r=Math.exp(-t.y/n),a=Math.PI/2-2*Math.atan(r),h=0,u=.1;h<15&&Math.abs(u)>1e-7;h++)i=s*Math.sin(a),i=Math.pow((1-i)/(1+i),s/2),a+=u=Math.PI/2-2*Math.atan(r*i)-a;return new M(a*e,t.x*e/n)}},Re=(Object.freeze||Object)({LonLat:Ae,Mercator:Oe,SphericalMercator:_i}),De=i({},ci,{code:"EPSG:3395",projection:Oe,transformation:function(){var t=.5/(Math.PI*Oe.R);return E(t,.5,-t,.5)}()}),Ne=i({},ci,{code:"EPSG:4326",projection:Ae,transformation:E(1/180,1,-1/180,.5)}),je=i({},li,{projection:Ae,transformation:E(1,0,-1,0),scale:function(t){return Math.pow(2,t)},zoom:function(t){return Math.log(t)/Math.LN2},distance:function(t,i){var e=i.lng-t.lng,n=i.lat-t.lat;return Math.sqrt(e*e+n*n)},infinite:!0});li.Earth=ci,li.EPSG3395=De,li.EPSG3857=gi,li.EPSG900913=vi,li.EPSG4326=Ne,li.Simple=je;var We=ui.extend({options:{pane:"overlayPane",attribution:null,bubblingMouseEvents:!0},addTo:function(t){return t.addLayer(this),this},remove:function(){return this.removeFrom(this._map||this._mapToAdd)},removeFrom:function(t){return t&&t.removeLayer(this),this},getPane:function(t){return this._map.getPane(t?this.options[t]||t:this.options.pane)},addInteractiveTarget:function(t){return this._map._targets[n(t)]=this,this},removeInteractiveTarget:function(t){return delete this._map._targets[n(t)],this},getAttribution:function(){return this.options.attribution},_layerAdd:function(t){var i=t.target;if(i.hasLayer(this)){if(this._map=i,this._zoomAnimated=i._zoomAnimated,this.getEvents){var e=this.getEvents();i.on(e,this),this.once("remove",function(){i.off(e,this)},this)}this.onAdd(i),this.getAttribution&&i.attributionControl&&i.attributionControl.addAttribution(this.getAttribution()),this.fire("add"),i.fire("layeradd",{layer:this})}}});ye.include({addLayer:function(t){if(!t._layerAdd)throw new Error("The provided object is not a Layer.");var i=n(t);return this._layers[i]?this:(this._layers[i]=t,t._mapToAdd=this,t.beforeAdd&&t.beforeAdd(this),this.whenReady(t._layerAdd,t),this)},removeLayer:function(t){var i=n(t);return this._layers[i]?(this._loaded&&t.onRemove(this),t.getAttribution&&this.attributionControl&&this.attributionControl.removeAttribution(t.getAttribution()),delete this._layers[i],this._loaded&&(this.fire("layerremove",{layer:t}),t.fire("remove")),t._map=t._mapToAdd=null,this):this},hasLayer:function(t){return!!t&&n(t)in this._layers},eachLayer:function(t,i){for(var e in this._layers)t.call(i,this._layers[e]);return this},_addLayers:function(t){for(var i=0,e=(t=t?ei(t)?t:[t]:[]).length;i<e;i++)this.addLayer(t[i])},_addZoomLimit:function(t){!isNaN(t.options.maxZoom)&&isNaN(t.options.minZoom)||(this._zoomBoundLayers[n(t)]=t,this._updateZoomLevels())},_removeZoomLimit:function(t){var i=n(t);this._zoomBoundLayers[i]&&(delete this._zoomBoundLayers[i],this._updateZoomLevels())},_updateZoomLevels:function(){var t=1/0,i=-1/0,e=this._getZoomSpan();for(var n in this._zoomBoundLayers){var o=this._zoomBoundLayers[n].options;t=void 0===o.minZoom?t:Math.min(t,o.minZoom),i=void 0===o.maxZoom?i:Math.max(i,o.maxZoom)}this._layersMaxZoom=i===-1/0?void 0:i,this._layersMinZoom=t===1/0?void 0:t,e!==this._getZoomSpan()&&this.fire("zoomlevelschange"),void 0===this.options.maxZoom&&this._layersMaxZoom&&this.getZoom()>this._layersMaxZoom&&this.setZoom(this._layersMaxZoom),void 0===this.options.minZoom&&this._layersMinZoom&&this.getZoom()<this._layersMinZoom&&this.setZoom(this._layersMinZoom)}});var He=We.extend({initialize:function(t){this._layers={};var i,e;if(t)for(i=0,e=t.length;i<e;i++)this.addLayer(t[i])},addLayer:function(t){var i=this.getLayerId(t);return this._layers[i]=t,this._map&&this._map.addLayer(t),this},removeLayer:function(t){var i=t in this._layers?t:this.getLayerId(t);return this._map&&this._layers[i]&&this._map.removeLayer(this._layers[i]),delete this._layers[i],this},hasLayer:function(t){return!!t&&(t in this._layers||this.getLayerId(t)in this._layers)},clearLayers:function(){for(var t in this._layers)this.removeLayer(this._layers[t]);return this},invoke:function(t){var i,e,n=Array.prototype.slice.call(arguments,1);for(i in this._layers)(e=this._layers[i])[t]&&e[t].apply(e,n);return this},onAdd:function(t){for(var i in this._layers)t.addLayer(this._layers[i])},onRemove:function(t){for(var i in this._layers)t.removeLayer(this._layers[i])},eachLayer:function(t,i){for(var e in this._layers)t.call(i,this._layers[e]);return this},getLayer:function(t){return this._layers[t]},getLayers:function(){var t=[];for(var i in this._layers)t.push(this._layers[i]);return t},setZIndex:function(t){return this.invoke("setZIndex",t)},getLayerId:function(t){return n(t)}}),Fe=He.extend({addLayer:function(t){return this.hasLayer(t)?this:(t.addEventParent(this),He.prototype.addLayer.call(this,t),this.fire("layeradd",{layer:t}))},removeLayer:function(t){return this.hasLayer(t)?(t in this._layers&&(t=this._layers[t]),t.removeEventParent(this),He.prototype.removeLayer.call(this,t),this.fire("layerremove",{layer:t})):this},setStyle:function(t){return this.invoke("setStyle",t)},bringToFront:function(){return this.invoke("bringToFront")},bringToBack:function(){return this.invoke("bringToBack")},getBounds:function(){var t=new T;for(var i in this._layers){var e=this._layers[i];t.extend(e.getBounds?e.getBounds():e.getLatLng())}return t}}),Ue=v.extend({initialize:function(t){l(this,t)},createIcon:function(t){return this._createIcon("icon",t)},createShadow:function(t){return this._createIcon("shadow",t)},_createIcon:function(t,i){var e=this._getIconUrl(t);if(!e){if("icon"===t)throw new Error("iconUrl not set in Icon options (see the docs).");return null}var n=this._createImg(e,i&&"IMG"===i.tagName?i:null);return this._setIconStyles(n,t),n},_setIconStyles:function(t,i){var e=this.options,n=e[i+"Size"];"number"==typeof n&&(n=[n,n]);var o=w(n),s=w("shadow"===i&&e.shadowAnchor||e.iconAnchor||o&&o.divideBy(2,!0));t.className="leaflet-marker-"+i+" "+(e.className||""),s&&(t.style.marginLeft=-s.x+"px",t.style.marginTop=-s.y+"px"),o&&(t.style.width=o.x+"px",t.style.height=o.y+"px")},_createImg:function(t,i){return i=i||document.createElement("img"),i.src=t,i},_getIconUrl:function(t){return Vi&&this.options[t+"RetinaUrl"]||this.options[t+"Url"]}}),Ve=Ue.extend({options:{iconUrl:"marker-icon.png",iconRetinaUrl:"marker-icon-2x.png",shadowUrl:"marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],tooltipAnchor:[16,-28],shadowSize:[41,41]},_getIconUrl:function(t){return Ve.imagePath||(Ve.imagePath=this._detectIconPath()),(this.options.imagePath||Ve.imagePath)+Ue.prototype._getIconUrl.call(this,t)},_detectIconPath:function(){var t=ht("div","leaflet-default-icon-path",document.body),i=at(t,"background-image")||at(t,"backgroundImage");return document.body.removeChild(t),i=null===i||0!==i.indexOf("url")?"":i.replace(/^url\([\"\']?/,"").replace(/marker-icon\.png[\"\']?\)$/,"")}}),Ge=Me.extend({initialize:function(t){this._marker=t},addHooks:function(){var t=this._marker._icon;this._draggable||(this._draggable=new ke(t,t,!0)),this._draggable.on({dragstart:this._onDragStart,drag:this._onDrag,dragend:this._onDragEnd},this).enable(),pt(t,"leaflet-marker-draggable")},removeHooks:function(){this._draggable.off({dragstart:this._onDragStart,drag:this._onDrag,dragend:this._onDragEnd},this).disable(),this._marker._icon&&mt(this._marker._icon,"leaflet-marker-draggable")},moved:function(){return this._draggable&&this._draggable._moved},_onDragStart:function(){this._oldLatLng=this._marker.getLatLng(),this._marker.closePopup().fire("movestart").fire("dragstart")},_onDrag:function(t){var i=this._marker,e=i._shadow,n=bt(i._icon),o=i._map.layerPointToLatLng(n);e&&Lt(e,n),i._latlng=o,t.latlng=o,t.oldLatLng=this._oldLatLng,i.fire("move",t).fire("drag",t)},_onDragEnd:function(t){delete this._oldLatLng,this._marker.fire("moveend").fire("dragend",t)}}),qe=We.extend({options:{icon:new Ve,interactive:!0,draggable:!1,keyboard:!0,title:"",alt:"",zIndexOffset:0,opacity:1,riseOnHover:!1,riseOffset:250,pane:"markerPane",bubblingMouseEvents:!1},initialize:function(t,i){l(this,i),this._latlng=C(t)},onAdd:function(t){this._zoomAnimated=this._zoomAnimated&&t.options.markerZoomAnimation,this._zoomAnimated&&t.on("zoomanim",this._animateZoom,this),this._initIcon(),this.update()},onRemove:function(t){this.dragging&&this.dragging.enabled()&&(this.options.draggable=!0,this.dragging.removeHooks()),delete this.dragging,this._zoomAnimated&&t.off("zoomanim",this._animateZoom,this),this._removeIcon(),this._removeShadow()},getEvents:function(){return{zoom:this.update,viewreset:this.update}},getLatLng:function(){return this._latlng},setLatLng:function(t){var i=this._latlng;return this._latlng=C(t),this.update(),this.fire("move",{oldLatLng:i,latlng:this._latlng})},setZIndexOffset:function(t){return this.options.zIndexOffset=t,this.update()},setIcon:function(t){return this.options.icon=t,this._map&&(this._initIcon(),this.update()),this._popup&&this.bindPopup(this._popup,this._popup.options),this},getElement:function(){return this._icon},update:function(){if(this._icon){var t=this._map.latLngToLayerPoint(this._latlng).round();this._setPos(t)}return this},_initIcon:function(){var t=this.options,i="leaflet-zoom-"+(this._zoomAnimated?"animated":"hide"),e=t.icon.createIcon(this._icon),n=!1;e!==this._icon&&(this._icon&&this._removeIcon(),n=!0,t.title&&(e.title=t.title),t.alt&&(e.alt=t.alt)),pt(e,i),t.keyboard&&(e.tabIndex="0"),this._icon=e,t.riseOnHover&&this.on({mouseover:this._bringToFront,mouseout:this._resetZIndex});var o=t.icon.createShadow(this._shadow),s=!1;o!==this._shadow&&(this._removeShadow(),s=!0),o&&(pt(o,i),o.alt=""),this._shadow=o,t.opacity<1&&this._updateOpacity(),n&&this.getPane().appendChild(this._icon),this._initInteraction(),o&&s&&this.getPane("shadowPane").appendChild(this._shadow)},_removeIcon:function(){this.options.riseOnHover&&this.off({mouseover:this._bringToFront,mouseout:this._resetZIndex}),ut(this._icon),this.removeInteractiveTarget(this._icon),this._icon=null},_removeShadow:function(){this._shadow&&ut(this._shadow),this._shadow=null},_setPos:function(t){Lt(this._icon,t),this._shadow&&Lt(this._shadow,t),this._zIndex=t.y+this.options.zIndexOffset,this._resetZIndex()},_updateZIndex:function(t){this._icon.style.zIndex=this._zIndex+t},_animateZoom:function(t){var i=this._map._latLngToNewLayerPoint(this._latlng,t.zoom,t.center).round();this._setPos(i)},_initInteraction:function(){if(this.options.interactive&&(pt(this._icon,"leaflet-interactive"),this.addInteractiveTarget(this._icon),Ge)){var t=this.options.draggable;this.dragging&&(t=this.dragging.enabled(),this.dragging.disable()),this.dragging=new Ge(this),t&&this.dragging.enable()}},setOpacity:function(t){return this.options.opacity=t,this._map&&this._updateOpacity(),this},_updateOpacity:function(){var t=this.options.opacity;vt(this._icon,t),this._shadow&&vt(this._shadow,t)},_bringToFront:function(){this._updateZIndex(this.options.riseOffset)},_resetZIndex:function(){this._updateZIndex(0)},_getPopupAnchor:function(){return this.options.icon.options.popupAnchor||[0,0]},_getTooltipAnchor:function(){return this.options.icon.options.tooltipAnchor||[0,0]}}),Ke=We.extend({options:{stroke:!0,color:"#3388ff",weight:3,opacity:1,lineCap:"round",lineJoin:"round",dashArray:null,dashOffset:null,fill:!1,fillColor:null,fillOpacity:.2,fillRule:"evenodd",interactive:!0,bubblingMouseEvents:!0},beforeAdd:function(t){this._renderer=t.getRenderer(this)},onAdd:function(){this._renderer._initPath(this),this._reset(),this._renderer._addPath(this)},onRemove:function(){this._renderer._removePath(this)},redraw:function(){return this._map&&this._renderer._updatePath(this),this},setStyle:function(t){return l(this,t),this._renderer&&this._renderer._updateStyle(this),this},bringToFront:function(){return this._renderer&&this._renderer._bringToFront(this),this},bringToBack:function(){return this._renderer&&this._renderer._bringToBack(this),this},getElement:function(){return this._path},_reset:function(){this._project(),this._update()},_clickTolerance:function(){return(this.options.stroke?this.options.weight/2:0)+(Hi?10:0)}}),Ye=Ke.extend({options:{fill:!0,radius:10},initialize:function(t,i){l(this,i),this._latlng=C(t),this._radius=this.options.radius},setLatLng:function(t){return this._latlng=C(t),this.redraw(),this.fire("move",{latlng:this._latlng})},getLatLng:function(){return this._latlng},setRadius:function(t){return this.options.radius=this._radius=t,this.redraw()},getRadius:function(){return this._radius},setStyle:function(t){var i=t&&t.radius||this._radius;return Ke.prototype.setStyle.call(this,t),this.setRadius(i),this},_project:function(){this._point=this._map.latLngToLayerPoint(this._latlng),this._updateBounds()},_updateBounds:function(){var t=this._radius,i=this._radiusY||t,e=this._clickTolerance(),n=[t+e,i+e];this._pxBounds=new b(this._point.subtract(n),this._point.add(n))},_update:function(){this._map&&this._updatePath()},_updatePath:function(){this._renderer._updateCircle(this)},_empty:function(){return this._radius&&!this._renderer._bounds.intersects(this._pxBounds)},_containsPoint:function(t){return t.distanceTo(this._point)<=this._radius+this._clickTolerance()}}),Xe=Ye.extend({initialize:function(t,e,n){if("number"==typeof e&&(e=i({},n,{radius:e})),l(this,e),this._latlng=C(t),isNaN(this.options.radius))throw new Error("Circle radius cannot be NaN");this._mRadius=this.options.radius},setRadius:function(t){return this._mRadius=t,this.redraw()},getRadius:function(){return this._mRadius},getBounds:function(){var t=[this._radius,this._radiusY||this._radius];return new T(this._map.layerPointToLatLng(this._point.subtract(t)),this._map.layerPointToLatLng(this._point.add(t)))},setStyle:Ke.prototype.setStyle,_project:function(){var t=this._latlng.lng,i=this._latlng.lat,e=this._map,n=e.options.crs;if(n.distance===ci.distance){var o=Math.PI/180,s=this._mRadius/ci.R/o,r=e.project([i+s,t]),a=e.project([i-s,t]),h=r.add(a).divideBy(2),u=e.unproject(h).lat,l=Math.acos((Math.cos(s*o)-Math.sin(i*o)*Math.sin(u*o))/(Math.cos(i*o)*Math.cos(u*o)))/o;(isNaN(l)||0===l)&&(l=s/Math.cos(Math.PI/180*i)),this._point=h.subtract(e.getPixelOrigin()),this._radius=isNaN(l)?0:Math.max(Math.round(h.x-e.project([u,t-l]).x),1),this._radiusY=Math.max(Math.round(h.y-r.y),1)}else{var c=n.unproject(n.project(this._latlng).subtract([this._mRadius,0]));this._point=e.latLngToLayerPoint(this._latlng),this._radius=this._point.x-e.latLngToLayerPoint(c).x}this._updateBounds()}}),Je=Ke.extend({options:{smoothFactor:1,noClip:!1},initialize:function(t,i){l(this,i),this._setLatLngs(t)},getLatLngs:function(){return this._latlngs},setLatLngs:function(t){return this._setLatLngs(t),this.redraw()},isEmpty:function(){return!this._latlngs.length},closestLayerPoint:function(t){for(var i,e,n=1/0,o=null,s=Rt,r=0,a=this._parts.length;r<a;r++)for(var h=this._parts[r],u=1,l=h.length;u<l;u++){var c=s(t,i=h[u-1],e=h[u],!0);c<n&&(n=c,o=s(t,i,e))}return o&&(o.distance=Math.sqrt(n)),o},getCenter:function(){if(!this._map)throw new Error("Must add layer to map before using getCenter()");var t,i,e,n,o,s,r,a=this._rings[0],h=a.length;if(!h)return null;for(t=0,i=0;t<h-1;t++)i+=a[t].distanceTo(a[t+1])/2;if(0===i)return this._map.layerPointToLatLng(a[0]);for(t=0,n=0;t<h-1;t++)if(o=a[t],s=a[t+1],e=o.distanceTo(s),(n+=e)>i)return r=(n-i)/e,this._map.layerPointToLatLng([s.x-r*(s.x-o.x),s.y-r*(s.y-o.y)])},getBounds:function(){return this._bounds},addLatLng:function(t,i){return i=i||this._defaultShape(),t=C(t),i.push(t),this._bounds.extend(t),this.redraw()},_setLatLngs:function(t){this._bounds=new T,this._latlngs=this._convertLatLngs(t)},_defaultShape:function(){return Dt(this._latlngs)?this._latlngs:this._latlngs[0]},_convertLatLngs:function(t){for(var i=[],e=Dt(t),n=0,o=t.length;n<o;n++)e?(i[n]=C(t[n]),this._bounds.extend(i[n])):i[n]=this._convertLatLngs(t[n]);return i},_project:function(){var t=new b;this._rings=[],this._projectLatlngs(this._latlngs,this._rings,t);var i=this._clickTolerance(),e=new x(i,i);this._bounds.isValid()&&t.isValid()&&(t.min._subtract(e),t.max._add(e),this._pxBounds=t)},_projectLatlngs:function(t,i,e){var n,o,s=t[0]instanceof M,r=t.length;if(s){for(o=[],n=0;n<r;n++)o[n]=this._map.latLngToLayerPoint(t[n]),e.extend(o[n]);i.push(o)}else for(n=0;n<r;n++)this._projectLatlngs(t[n],i,e)},_clipPoints:function(){var t=this._renderer._bounds;if(this._parts=[],this._pxBounds&&this._pxBounds.intersects(t))if(this.options.noClip)this._parts=this._rings;else{var i,e,n,o,s,r,a,h=this._parts;for(i=0,n=0,o=this._rings.length;i<o;i++)for(e=0,s=(a=this._rings[i]).length;e<s-1;e++)(r=Bt(a[e],a[e+1],t,e,!0))&&(h[n]=h[n]||[],h[n].push(r[0]),r[1]===a[e+1]&&e!==s-2||(h[n].push(r[1]),n++))}},_simplifyPoints:function(){for(var t=this._parts,i=this.options.smoothFactor,e=0,n=t.length;e<n;e++)t[e]=Ct(t[e],i)},_update:function(){this._map&&(this._clipPoints(),this._simplifyPoints(),this._updatePath())},_updatePath:function(){this._renderer._updatePoly(this)},_containsPoint:function(t,i){var e,n,o,s,r,a,h=this._clickTolerance();if(!this._pxBounds||!this._pxBounds.contains(t))return!1;for(e=0,s=this._parts.length;e<s;e++)for(n=0,o=(r=(a=this._parts[e]).length)-1;n<r;o=n++)if((i||0!==n)&&Zt(t,a[o],a[n])<=h)return!0;return!1}});Je._flat=Nt;var $e=Je.extend({options:{fill:!0},isEmpty:function(){return!this._latlngs.length||!this._latlngs[0].length},getCenter:function(){if(!this._map)throw new Error("Must add layer to map before using getCenter()");var t,i,e,n,o,s,r,a,h,u=this._rings[0],l=u.length;if(!l)return null;for(s=r=a=0,t=0,i=l-1;t<l;i=t++)e=u[t],n=u[i],o=e.y*n.x-n.y*e.x,r+=(e.x+n.x)*o,a+=(e.y+n.y)*o,s+=3*o;return h=0===s?u[0]:[r/s,a/s],this._map.layerPointToLatLng(h)},_convertLatLngs:function(t){var i=Je.prototype._convertLatLngs.call(this,t),e=i.length;return e>=2&&i[0]instanceof M&&i[0].equals(i[e-1])&&i.pop(),i},_setLatLngs:function(t){Je.prototype._setLatLngs.call(this,t),Dt(this._latlngs)&&(this._latlngs=[this._latlngs])},_defaultShape:function(){return Dt(this._latlngs[0])?this._latlngs[0]:this._latlngs[0][0]},_clipPoints:function(){var t=this._renderer._bounds,i=this.options.weight,e=new x(i,i);if(t=new b(t.min.subtract(e),t.max.add(e)),this._parts=[],this._pxBounds&&this._pxBounds.intersects(t))if(this.options.noClip)this._parts=this._rings;else for(var n,o=0,s=this._rings.length;o<s;o++)(n=jt(this._rings[o],t,!0)).length&&this._parts.push(n)},_updatePath:function(){this._renderer._updatePoly(this,!0)},_containsPoint:function(t){var i,e,n,o,s,r,a,h,u=!1;if(!this._pxBounds.contains(t))return!1;for(o=0,a=this._parts.length;o<a;o++)for(s=0,r=(h=(i=this._parts[o]).length)-1;s<h;r=s++)e=i[s],n=i[r],e.y>t.y!=n.y>t.y&&t.x<(n.x-e.x)*(t.y-e.y)/(n.y-e.y)+e.x&&(u=!u);return u||Je.prototype._containsPoint.call(this,t,!0)}}),Qe=Fe.extend({initialize:function(t,i){l(this,i),this._layers={},t&&this.addData(t)},addData:function(t){var i,e,n,o=ei(t)?t:t.features;if(o){for(i=0,e=o.length;i<e;i++)((n=o[i]).geometries||n.geometry||n.features||n.coordinates)&&this.addData(n);return this}var s=this.options;if(s.filter&&!s.filter(t))return this;var r=Wt(t,s);return r?(r.feature=qt(t),r.defaultOptions=r.options,this.resetStyle(r),s.onEachFeature&&s.onEachFeature(t,r),this.addLayer(r)):this},resetStyle:function(t){return t.options=i({},t.defaultOptions),this._setLayerStyle(t,this.options.style),this},setStyle:function(t){return this.eachLayer(function(i){this._setLayerStyle(i,t)},this)},_setLayerStyle:function(t,i){"function"==typeof i&&(i=i(t.feature)),t.setStyle&&t.setStyle(i)}}),tn={toGeoJSON:function(t){return Gt(this,{type:"Point",coordinates:Ut(this.getLatLng(),t)})}};qe.include(tn),Xe.include(tn),Ye.include(tn),Je.include({toGeoJSON:function(t){var i=!Dt(this._latlngs),e=Vt(this._latlngs,i?1:0,!1,t);return Gt(this,{type:(i?"Multi":"")+"LineString",coordinates:e})}}),$e.include({toGeoJSON:function(t){var i=!Dt(this._latlngs),e=i&&!Dt(this._latlngs[0]),n=Vt(this._latlngs,e?2:i?1:0,!0,t);return i||(n=[n]),Gt(this,{type:(e?"Multi":"")+"Polygon",coordinates:n})}}),He.include({toMultiPoint:function(t){var i=[];return this.eachLayer(function(e){i.push(e.toGeoJSON(t).geometry.coordinates)}),Gt(this,{type:"MultiPoint",coordinates:i})},toGeoJSON:function(t){var i=this.feature&&this.feature.geometry&&this.feature.geometry.type;if("MultiPoint"===i)return this.toMultiPoint(t);var e="GeometryCollection"===i,n=[];return this.eachLayer(function(i){if(i.toGeoJSON){var o=i.toGeoJSON(t);if(e)n.push(o.geometry);else{var s=qt(o);"FeatureCollection"===s.type?n.push.apply(n,s.features):n.push(s)}}}),e?Gt(this,{geometries:n,type:"GeometryCollection"}):{type:"FeatureCollection",features:n}}});var en=Kt,nn=We.extend({options:{opacity:1,alt:"",interactive:!1,crossOrigin:!1,errorOverlayUrl:"",zIndex:1,className:""},initialize:function(t,i,e){this._url=t,this._bounds=z(i),l(this,e)},onAdd:function(){this._image||(this._initImage(),this.options.opacity<1&&this._updateOpacity()),this.options.interactive&&(pt(this._image,"leaflet-interactive"),this.addInteractiveTarget(this._image)),this.getPane().appendChild(this._image),this._reset()},onRemove:function(){ut(this._image),this.options.interactive&&this.removeInteractiveTarget(this._image)},setOpacity:function(t){return this.options.opacity=t,this._image&&this._updateOpacity(),this},setStyle:function(t){return t.opacity&&this.setOpacity(t.opacity),this},bringToFront:function(){return this._map&&ct(this._image),this},bringToBack:function(){return this._map&&_t(this._image),this},setUrl:function(t){return this._url=t,this._image&&(this._image.src=t),this},setBounds:function(t){return this._bounds=z(t),this._map&&this._reset(),this},getEvents:function(){var t={zoom:this._reset,viewreset:this._reset};return this._zoomAnimated&&(t.zoomanim=this._animateZoom),t},setZIndex:function(t){return this.options.zIndex=t,this._updateZIndex(),this},getBounds:function(){return this._bounds},getElement:function(){return this._image},_initImage:function(){var t=this._image=ht("img","leaflet-image-layer "+(this._zoomAnimated?"leaflet-zoom-animated":"")+(this.options.className||""));t.onselectstart=r,t.onmousemove=r,t.onload=e(this.fire,this,"load"),t.onerror=e(this._overlayOnError,this,"error"),this.options.crossOrigin&&(t.crossOrigin=""),this.options.zIndex&&this._updateZIndex(),t.src=this._url,t.alt=this.options.alt},_animateZoom:function(t){var i=this._map.getZoomScale(t.zoom),e=this._map._latLngBoundsToNewLayerBounds(this._bounds,t.zoom,t.center).min;wt(this._image,e,i)},_reset:function(){var t=this._image,i=new b(this._map.latLngToLayerPoint(this._bounds.getNorthWest()),this._map.latLngToLayerPoint(this._bounds.getSouthEast())),e=i.getSize();Lt(t,i.min),t.style.width=e.x+"px",t.style.height=e.y+"px"},_updateOpacity:function(){vt(this._image,this.options.opacity)},_updateZIndex:function(){this._image&&void 0!==this.options.zIndex&&null!==this.options.zIndex&&(this._image.style.zIndex=this.options.zIndex)},_overlayOnError:function(){this.fire("error");var t=this.options.errorOverlayUrl;t&&this._url!==t&&(this._url=t,this._image.src=t)}}),on=nn.extend({options:{autoplay:!0,loop:!0},_initImage:function(){var t="VIDEO"===this._url.tagName,i=this._image=t?this._url:ht("video");if(i.class=i.class||"",i.class+="leaflet-image-layer "+(this._zoomAnimated?"leaflet-zoom-animated":""),i.onselectstart=r,i.onmousemove=r,i.onloadeddata=e(this.fire,this,"load"),!t){ei(this._url)||(this._url=[this._url]),i.autoplay=!!this.options.autoplay,i.loop=!!this.options.loop;for(var n=0;n<this._url.length;n++){var o=ht("source");o.src=this._url[n],i.appendChild(o)}}}}),sn=We.extend({options:{offset:[0,7],className:"",pane:"popupPane"},initialize:function(t,i){l(this,t),this._source=i},onAdd:function(t){this._zoomAnimated=t._zoomAnimated,this._container||this._initLayout(),t._fadeAnimated&&vt(this._container,0),clearTimeout(this._removeTimeout),this.getPane().appendChild(this._container),this.update(),t._fadeAnimated&&vt(this._container,1),this.bringToFront()},onRemove:function(t){t._fadeAnimated?(vt(this._container,0),this._removeTimeout=setTimeout(e(ut,void 0,this._container),200)):ut(this._container)},getLatLng:function(){return this._latlng},setLatLng:function(t){return this._latlng=C(t),this._map&&(this._updatePosition(),this._adjustPan()),this},getContent:function(){return this._content},setContent:function(t){return this._content=t,this.update(),this},getElement:function(){return this._container},update:function(){this._map&&(this._container.style.visibility="hidden",this._updateContent(),this._updateLayout(),this._updatePosition(),this._container.style.visibility="",this._adjustPan())},getEvents:function(){var t={zoom:this._updatePosition,viewreset:this._updatePosition};return this._zoomAnimated&&(t.zoomanim=this._animateZoom),t},isOpen:function(){return!!this._map&&this._map.hasLayer(this)},bringToFront:function(){return this._map&&ct(this._container),this},bringToBack:function(){return this._map&&_t(this._container),this},_updateContent:function(){if(this._content){var t=this._contentNode,i="function"==typeof this._content?this._content(this._source||this):this._content;if("string"==typeof i)t.innerHTML=i;else{for(;t.hasChildNodes();)t.removeChild(t.firstChild);t.appendChild(i)}this.fire("contentupdate")}},_updatePosition:function(){if(this._map){var t=this._map.latLngToLayerPoint(this._latlng),i=w(this.options.offset),e=this._getAnchor();this._zoomAnimated?Lt(this._container,t.add(e)):i=i.add(t).add(e);var n=this._containerBottom=-i.y,o=this._containerLeft=-Math.round(this._containerWidth/2)+i.x;this._container.style.bottom=n+"px",this._container.style.left=o+"px"}},_getAnchor:function(){return[0,0]}}),rn=sn.extend({options:{maxWidth:300,minWidth:50,maxHeight:null,autoPan:!0,autoPanPaddingTopLeft:null,autoPanPaddingBottomRight:null,autoPanPadding:[5,5],keepInView:!1,closeButton:!0,autoClose:!0,className:""},openOn:function(t){return t.openPopup(this),this},onAdd:function(t){sn.prototype.onAdd.call(this,t),t.fire("popupopen",{popup:this}),this._source&&(this._source.fire("popupopen",{popup:this},!0),this._source instanceof Ke||this._source.on("preclick",Y))},onRemove:function(t){sn.prototype.onRemove.call(this,t),t.fire("popupclose",{popup:this}),this._source&&(this._source.fire("popupclose",{popup:this},!0),this._source instanceof Ke||this._source.off("preclick",Y))},getEvents:function(){var t=sn.prototype.getEvents.call(this);return(void 0!==this.options.closeOnClick?this.options.closeOnClick:this._map.options.closePopupOnClick)&&(t.preclick=this._close),this.options.keepInView&&(t.moveend=this._adjustPan),t},_close:function(){this._map&&this._map.closePopup(this)},_initLayout:function(){var t="leaflet-popup",i=this._container=ht("div",t+" "+(this.options.className||"")+" leaflet-zoom-animated"),e=this._wrapper=ht("div",t+"-content-wrapper",i);if(this._contentNode=ht("div",t+"-content",e),J(e),X(this._contentNode),V(e,"contextmenu",Y),this._tipContainer=ht("div",t+"-tip-container",i),this._tip=ht("div",t+"-tip",this._tipContainer),this.options.closeButton){var n=this._closeButton=ht("a",t+"-close-button",i);n.href="#close",n.innerHTML="&#215;",V(n,"click",this._onCloseButtonClick,this)}},_updateLayout:function(){var t=this._contentNode,i=t.style;i.width="",i.whiteSpace="nowrap";var e=t.offsetWidth;e=Math.min(e,this.options.maxWidth),e=Math.max(e,this.options.minWidth),i.width=e+1+"px",i.whiteSpace="",i.height="";var n=t.offsetHeight,o=this.options.maxHeight;o&&n>o?(i.height=o+"px",pt(t,"leaflet-popup-scrolled")):mt(t,"leaflet-popup-scrolled"),this._containerWidth=this._container.offsetWidth},_animateZoom:function(t){var i=this._map._latLngToNewLayerPoint(this._latlng,t.zoom,t.center),e=this._getAnchor();Lt(this._container,i.add(e))},_adjustPan:function(){if(!(!this.options.autoPan||this._map._panAnim&&this._map._panAnim._inProgress)){var t=this._map,i=parseInt(at(this._container,"marginBottom"),10)||0,e=this._container.offsetHeight+i,n=this._containerWidth,o=new x(this._containerLeft,-e-this._containerBottom);o._add(bt(this._container));var s=t.layerPointToContainerPoint(o),r=w(this.options.autoPanPadding),a=w(this.options.autoPanPaddingTopLeft||r),h=w(this.options.autoPanPaddingBottomRight||r),u=t.getSize(),l=0,c=0;s.x+n+h.x>u.x&&(l=s.x+n-u.x+h.x),s.x-l-a.x<0&&(l=s.x-a.x),s.y+e+h.y>u.y&&(c=s.y+e-u.y+h.y),s.y-c-a.y<0&&(c=s.y-a.y),(l||c)&&t.fire("autopanstart").panBy([l,c])}},_onCloseButtonClick:function(t){this._close(),Q(t)},_getAnchor:function(){return w(this._source&&this._source._getPopupAnchor?this._source._getPopupAnchor():[0,0])}});ye.mergeOptions({closePopupOnClick:!0}),ye.include({openPopup:function(t,i,e){return t instanceof rn||(t=new rn(e).setContent(t)),i&&t.setLatLng(i),this.hasLayer(t)?this:(this._popup&&this._popup.options.autoClose&&this.closePopup(),this._popup=t,this.addLayer(t))},closePopup:function(t){return t&&t!==this._popup||(t=this._popup,this._popup=null),t&&this.removeLayer(t),this}}),We.include({bindPopup:function(t,i){return t instanceof rn?(l(t,i),this._popup=t,t._source=this):(this._popup&&!i||(this._popup=new rn(i,this)),this._popup.setContent(t)),this._popupHandlersAdded||(this.on({click:this._openPopup,keypress:this._onKeyPress,remove:this.closePopup,move:this._movePopup}),this._popupHandlersAdded=!0),this},unbindPopup:function(){return this._popup&&(this.off({click:this._openPopup,keypress:this._onKeyPress,remove:this.closePopup,move:this._movePopup}),this._popupHandlersAdded=!1,this._popup=null),this},openPopup:function(t,i){if(t instanceof We||(i=t,t=this),t instanceof Fe)for(var e in this._layers){t=this._layers[e];break}return i||(i=t.getCenter?t.getCenter():t.getLatLng()),this._popup&&this._map&&(this._popup._source=t,this._popup.update(),this._map.openPopup(this._popup,i)),this},closePopup:function(){return this._popup&&this._popup._close(),this},togglePopup:function(t){return this._popup&&(this._popup._map?this.closePopup():this.openPopup(t)),this},isPopupOpen:function(){return!!this._popup&&this._popup.isOpen()},setPopupContent:function(t){return this._popup&&this._popup.setContent(t),this},getPopup:function(){return this._popup},_openPopup:function(t){var i=t.layer||t.target;this._popup&&this._map&&(Q(t),i instanceof Ke?this.openPopup(t.layer||t.target,t.latlng):this._map.hasLayer(this._popup)&&this._popup._source===i?this.closePopup():this.openPopup(i,t.latlng))},_movePopup:function(t){this._popup.setLatLng(t.latlng)},_onKeyPress:function(t){13===t.originalEvent.keyCode&&this._openPopup(t)}});var an=sn.extend({options:{pane:"tooltipPane",offset:[0,0],direction:"auto",permanent:!1,sticky:!1,interactive:!1,opacity:.9},onAdd:function(t){sn.prototype.onAdd.call(this,t),this.setOpacity(this.options.opacity),t.fire("tooltipopen",{tooltip:this}),this._source&&this._source.fire("tooltipopen",{tooltip:this},!0)},onRemove:function(t){sn.prototype.onRemove.call(this,t),t.fire("tooltipclose",{tooltip:this}),this._source&&this._source.fire("tooltipclose",{tooltip:this},!0)},getEvents:function(){var t=sn.prototype.getEvents.call(this);return Hi&&!this.options.permanent&&(t.preclick=this._close),t},_close:function(){this._map&&this._map.closeTooltip(this)},_initLayout:function(){var t="leaflet-tooltip "+(this.options.className||"")+" leaflet-zoom-"+(this._zoomAnimated?"animated":"hide");this._contentNode=this._container=ht("div",t)},_updateLayout:function(){},_adjustPan:function(){},_setPosition:function(t){var i=this._map,e=this._container,n=i.latLngToContainerPoint(i.getCenter()),o=i.layerPointToContainerPoint(t),s=this.options.direction,r=e.offsetWidth,a=e.offsetHeight,h=w(this.options.offset),u=this._getAnchor();"top"===s?t=t.add(w(-r/2+h.x,-a+h.y+u.y,!0)):"bottom"===s?t=t.subtract(w(r/2-h.x,-h.y,!0)):"center"===s?t=t.subtract(w(r/2+h.x,a/2-u.y+h.y,!0)):"right"===s||"auto"===s&&o.x<n.x?(s="right",t=t.add(w(h.x+u.x,u.y-a/2+h.y,!0))):(s="left",t=t.subtract(w(r+u.x-h.x,a/2-u.y-h.y,!0))),mt(e,"leaflet-tooltip-right"),mt(e,"leaflet-tooltip-left"),mt(e,"leaflet-tooltip-top"),mt(e,"leaflet-tooltip-bottom"),pt(e,"leaflet-tooltip-"+s),Lt(e,t)},_updatePosition:function(){var t=this._map.latLngToLayerPoint(this._latlng);this._setPosition(t)},setOpacity:function(t){this.options.opacity=t,this._container&&vt(this._container,t)},_animateZoom:function(t){var i=this._map._latLngToNewLayerPoint(this._latlng,t.zoom,t.center);this._setPosition(i)},_getAnchor:function(){return w(this._source&&this._source._getTooltipAnchor&&!this.options.sticky?this._source._getTooltipAnchor():[0,0])}});ye.include({openTooltip:function(t,i,e){return t instanceof an||(t=new an(e).setContent(t)),i&&t.setLatLng(i),this.hasLayer(t)?this:this.addLayer(t)},closeTooltip:function(t){return t&&this.removeLayer(t),this}}),We.include({bindTooltip:function(t,i){return t instanceof an?(l(t,i),this._tooltip=t,t._source=this):(this._tooltip&&!i||(this._tooltip=new an(i,this)),this._tooltip.setContent(t)),this._initTooltipInteractions(),this._tooltip.options.permanent&&this._map&&this._map.hasLayer(this)&&this.openTooltip(),this},unbindTooltip:function(){return this._tooltip&&(this._initTooltipInteractions(!0),this.closeTooltip(),this._tooltip=null),this},_initTooltipInteractions:function(t){if(t||!this._tooltipHandlersAdded){var i=t?"off":"on",e={remove:this.closeTooltip,move:this._moveTooltip};this._tooltip.options.permanent?e.add=this._openTooltip:(e.mouseover=this._openTooltip,e.mouseout=this.closeTooltip,this._tooltip.options.sticky&&(e.mousemove=this._moveTooltip),Hi&&(e.click=this._openTooltip)),this[i](e),this._tooltipHandlersAdded=!t}},openTooltip:function(t,i){if(t instanceof We||(i=t,t=this),t instanceof Fe)for(var e in this._layers){t=this._layers[e];break}return i||(i=t.getCenter?t.getCenter():t.getLatLng()),this._tooltip&&this._map&&(this._tooltip._source=t,this._tooltip.update(),this._map.openTooltip(this._tooltip,i),this._tooltip.options.interactive&&this._tooltip._container&&(pt(this._tooltip._container,"leaflet-clickable"),this.addInteractiveTarget(this._tooltip._container))),this},closeTooltip:function(){return this._tooltip&&(this._tooltip._close(),this._tooltip.options.interactive&&this._tooltip._container&&(mt(this._tooltip._container,"leaflet-clickable"),this.removeInteractiveTarget(this._tooltip._container))),this},toggleTooltip:function(t){return this._tooltip&&(this._tooltip._map?this.closeTooltip():this.openTooltip(t)),this},isTooltipOpen:function(){return this._tooltip.isOpen()},setTooltipContent:function(t){return this._tooltip&&this._tooltip.setContent(t),this},getTooltip:function(){return this._tooltip},_openTooltip:function(t){var i=t.layer||t.target;this._tooltip&&this._map&&this.openTooltip(i,this._tooltip.options.sticky?t.latlng:void 0)},_moveTooltip:function(t){var i,e,n=t.latlng;this._tooltip.options.sticky&&t.originalEvent&&(i=this._map.mouseEventToContainerPoint(t.originalEvent),e=this._map.containerPointToLayerPoint(i),n=this._map.layerPointToLatLng(e)),this._tooltip.setLatLng(n)}});var hn=Ue.extend({options:{iconSize:[12,12],html:!1,bgPos:null,className:"leaflet-div-icon"},createIcon:function(t){var i=t&&"DIV"===t.tagName?t:document.createElement("div"),e=this.options;if(i.innerHTML=!1!==e.html?e.html:"",e.bgPos){var n=w(e.bgPos);i.style.backgroundPosition=-n.x+"px "+-n.y+"px"}return this._setIconStyles(i,"icon"),i},createShadow:function(){return null}});Ue.Default=Ve;var un=We.extend({options:{tileSize:256,opacity:1,updateWhenIdle:Ri,updateWhenZooming:!0,updateInterval:200,zIndex:1,bounds:null,minZoom:0,maxZoom:void 0,maxNativeZoom:void 0,minNativeZoom:void 0,noWrap:!1,pane:"tilePane",className:"",keepBuffer:2},initialize:function(t){l(this,t)},onAdd:function(){this._initContainer(),this._levels={},this._tiles={},this._resetView(),this._update()},beforeAdd:function(t){t._addZoomLimit(this)},onRemove:function(t){this._removeAllTiles(),ut(this._container),t._removeZoomLimit(this),this._container=null,this._tileZoom=null},bringToFront:function(){return this._map&&(ct(this._container),this._setAutoZIndex(Math.max)),this},bringToBack:function(){return this._map&&(_t(this._container),this._setAutoZIndex(Math.min)),this},getContainer:function(){return this._container},setOpacity:function(t){return this.options.opacity=t,this._updateOpacity(),this},setZIndex:function(t){return this.options.zIndex=t,this._updateZIndex(),this},isLoading:function(){return this._loading},redraw:function(){return this._map&&(this._removeAllTiles(),this._update()),this},getEvents:function(){var t={viewprereset:this._invalidateAll,viewreset:this._resetView,zoom:this._resetView,moveend:this._onMoveEnd};return this.options.updateWhenIdle||(this._onMove||(this._onMove=o(this._onMoveEnd,this.options.updateInterval,this)),t.move=this._onMove),this._zoomAnimated&&(t.zoomanim=this._animateZoom),t},createTile:function(){return document.createElement("div")},getTileSize:function(){var t=this.options.tileSize;return t instanceof x?t:new x(t,t)},_updateZIndex:function(){this._container&&void 0!==this.options.zIndex&&null!==this.options.zIndex&&(this._container.style.zIndex=this.options.zIndex)},_setAutoZIndex:function(t){for(var i,e=this.getPane().children,n=-t(-1/0,1/0),o=0,s=e.length;o<s;o++)i=e[o].style.zIndex,e[o]!==this._container&&i&&(n=t(n,+i));isFinite(n)&&(this.options.zIndex=n+t(-1,1),this._updateZIndex())},_updateOpacity:function(){if(this._map&&!wi){vt(this._container,this.options.opacity);var t=+new Date,i=!1,e=!1;for(var n in this._tiles){var o=this._tiles[n];if(o.current&&o.loaded){var s=Math.min(1,(t-o.loaded)/200);vt(o.el,s),s<1?i=!0:(o.active?e=!0:this._onOpaqueTile(o),o.active=!0)}}e&&!this._noPrune&&this._pruneTiles(),i&&(g(this._fadeFrame),this._fadeFrame=f(this._updateOpacity,this))}},_onOpaqueTile:r,_initContainer:function(){this._container||(this._container=ht("div","leaflet-layer "+(this.options.className||"")),this._updateZIndex(),this.options.opacity<1&&this._updateOpacity(),this.getPane().appendChild(this._container))},_updateLevels:function(){var t=this._tileZoom,i=this.options.maxZoom;if(void 0!==t){for(var e in this._levels)this._levels[e].el.children.length||e===t?(this._levels[e].el.style.zIndex=i-Math.abs(t-e),this._onUpdateLevel(e)):(ut(this._levels[e].el),this._removeTilesAtZoom(e),this._onRemoveLevel(e),delete this._levels[e]);var n=this._levels[t],o=this._map;return n||((n=this._levels[t]={}).el=ht("div","leaflet-tile-container leaflet-zoom-animated",this._container),n.el.style.zIndex=i,n.origin=o.project(o.unproject(o.getPixelOrigin()),t).round(),n.zoom=t,this._setZoomTransform(n,o.getCenter(),o.getZoom()),n.el.offsetWidth,this._onCreateLevel(n)),this._level=n,n}},_onUpdateLevel:r,_onRemoveLevel:r,_onCreateLevel:r,_pruneTiles:function(){if(this._map){var t,i,e=this._map.getZoom();if(e>this.options.maxZoom||e<this.options.minZoom)this._removeAllTiles();else{for(t in this._tiles)(i=this._tiles[t]).retain=i.current;for(t in this._tiles)if((i=this._tiles[t]).current&&!i.active){var n=i.coords;this._retainParent(n.x,n.y,n.z,n.z-5)||this._retainChildren(n.x,n.y,n.z,n.z+2)}for(t in this._tiles)this._tiles[t].retain||this._removeTile(t)}}},_removeTilesAtZoom:function(t){for(var i in this._tiles)this._tiles[i].coords.z===t&&this._removeTile(i)},_removeAllTiles:function(){for(var t in this._tiles)this._removeTile(t)},_invalidateAll:function(){for(var t in this._levels)ut(this._levels[t].el),this._onRemoveLevel(t),delete this._levels[t];this._removeAllTiles(),this._tileZoom=null},_retainParent:function(t,i,e,n){var o=Math.floor(t/2),s=Math.floor(i/2),r=e-1,a=new x(+o,+s);a.z=+r;var h=this._tileCoordsToKey(a),u=this._tiles[h];return u&&u.active?(u.retain=!0,!0):(u&&u.loaded&&(u.retain=!0),r>n&&this._retainParent(o,s,r,n))},_retainChildren:function(t,i,e,n){for(var o=2*t;o<2*t+2;o++)for(var s=2*i;s<2*i+2;s++){var r=new x(o,s);r.z=e+1;var a=this._tileCoordsToKey(r),h=this._tiles[a];h&&h.active?h.retain=!0:(h&&h.loaded&&(h.retain=!0),e+1<n&&this._retainChildren(o,s,e+1,n))}},_resetView:function(t){var i=t&&(t.pinch||t.flyTo);this._setView(this._map.getCenter(),this._map.getZoom(),i,i)},_animateZoom:function(t){this._setView(t.center,t.zoom,!0,t.noUpdate)},_clampZoom:function(t){var i=this.options;return void 0!==i.minNativeZoom&&t<i.minNativeZoom?i.minNativeZoom:void 0!==i.maxNativeZoom&&i.maxNativeZoom<t?i.maxNativeZoom:t},_setView:function(t,i,e,n){var o=this._clampZoom(Math.round(i));(void 0!==this.options.maxZoom&&o>this.options.maxZoom||void 0!==this.options.minZoom&&o<this.options.minZoom)&&(o=void 0);var s=this.options.updateWhenZooming&&o!==this._tileZoom;n&&!s||(this._tileZoom=o,this._abortLoading&&this._abortLoading(),this._updateLevels(),this._resetGrid(),void 0!==o&&this._update(t),e||this._pruneTiles(),this._noPrune=!!e),this._setZoomTransforms(t,i)},_setZoomTransforms:function(t,i){for(var e in this._levels)this._setZoomTransform(this._levels[e],t,i)},_setZoomTransform:function(t,i,e){var n=this._map.getZoomScale(e,t.zoom),o=t.origin.multiplyBy(n).subtract(this._map._getNewPixelOrigin(i,e)).round();Oi?wt(t.el,o,n):Lt(t.el,o)},_resetGrid:function(){var t=this._map,i=t.options.crs,e=this._tileSize=this.getTileSize(),n=this._tileZoom,o=this._map.getPixelWorldBounds(this._tileZoom);o&&(this._globalTileRange=this._pxBoundsToTileRange(o)),this._wrapX=i.wrapLng&&!this.options.noWrap&&[Math.floor(t.project([0,i.wrapLng[0]],n).x/e.x),Math.ceil(t.project([0,i.wrapLng[1]],n).x/e.y)],this._wrapY=i.wrapLat&&!this.options.noWrap&&[Math.floor(t.project([i.wrapLat[0],0],n).y/e.x),Math.ceil(t.project([i.wrapLat[1],0],n).y/e.y)]},_onMoveEnd:function(){this._map&&!this._map._animatingZoom&&this._update()},_getTiledPixelBounds:function(t){var i=this._map,e=i._animatingZoom?Math.max(i._animateToZoom,i.getZoom()):i.getZoom(),n=i.getZoomScale(e,this._tileZoom),o=i.project(t,this._tileZoom).floor(),s=i.getSize().divideBy(2*n);return new b(o.subtract(s),o.add(s))},_update:function(t){var i=this._map;if(i){var e=this._clampZoom(i.getZoom());if(void 0===t&&(t=i.getCenter()),void 0!==this._tileZoom){var n=this._getTiledPixelBounds(t),o=this._pxBoundsToTileRange(n),s=o.getCenter(),r=[],a=this.options.keepBuffer,h=new b(o.getBottomLeft().subtract([a,-a]),o.getTopRight().add([a,-a]));if(!(isFinite(o.min.x)&&isFinite(o.min.y)&&isFinite(o.max.x)&&isFinite(o.max.y)))throw new Error("Attempted to load an infinite number of tiles");for(var u in this._tiles){var l=this._tiles[u].coords;l.z===this._tileZoom&&h.contains(new x(l.x,l.y))||(this._tiles[u].current=!1)}if(Math.abs(e-this._tileZoom)>1)this._setView(t,e);else{for(var c=o.min.y;c<=o.max.y;c++)for(var _=o.min.x;_<=o.max.x;_++){var d=new x(_,c);d.z=this._tileZoom,this._isValidTile(d)&&(this._tiles[this._tileCoordsToKey(d)]||r.push(d))}if(r.sort(function(t,i){return t.distanceTo(s)-i.distanceTo(s)}),0!==r.length){this._loading||(this._loading=!0,this.fire("loading"));var p=document.createDocumentFragment();for(_=0;_<r.length;_++)this._addTile(r[_],p);this._level.el.appendChild(p)}}}}},_isValidTile:function(t){var i=this._map.options.crs;if(!i.infinite){var e=this._globalTileRange;if(!i.wrapLng&&(t.x<e.min.x||t.x>e.max.x)||!i.wrapLat&&(t.y<e.min.y||t.y>e.max.y))return!1}if(!this.options.bounds)return!0;var n=this._tileCoordsToBounds(t);return z(this.options.bounds).overlaps(n)},_keyToBounds:function(t){return this._tileCoordsToBounds(this._keyToTileCoords(t))},_tileCoordsToBounds:function(t){var i=this._map,e=this.getTileSize(),n=t.scaleBy(e),o=n.add(e),s=new T(i.unproject(n,t.z),i.unproject(o,t.z));return this.options.noWrap||i.wrapLatLngBounds(s),s},_tileCoordsToKey:function(t){return t.x+":"+t.y+":"+t.z},_keyToTileCoords:function(t){var i=t.split(":"),e=new x(+i[0],+i[1]);return e.z=+i[2],e},_removeTile:function(t){var i=this._tiles[t];i&&(ut(i.el),delete this._tiles[t],this.fire("tileunload",{tile:i.el,coords:this._keyToTileCoords(t)}))},_initTile:function(t){pt(t,"leaflet-tile");var i=this.getTileSize();t.style.width=i.x+"px",t.style.height=i.y+"px",t.onselectstart=r,t.onmousemove=r,wi&&this.options.opacity<1&&vt(t,this.options.opacity),Pi&&!Ti&&(t.style.WebkitBackfaceVisibility="hidden")},_addTile:function(t,i){var n=this._getTilePos(t),o=this._tileCoordsToKey(t),s=this.createTile(this._wrapCoords(t),e(this._tileReady,this,t));this._initTile(s),this.createTile.length<2&&f(e(this._tileReady,this,t,null,s)),Lt(s,n),this._tiles[o]={el:s,coords:t,current:!0},i.appendChild(s),this.fire("tileloadstart",{tile:s,coords:t})},_tileReady:function(t,i,n){if(this._map){i&&this.fire("tileerror",{error:i,tile:n,coords:t});var o=this._tileCoordsToKey(t);(n=this._tiles[o])&&(n.loaded=+new Date,this._map._fadeAnimated?(vt(n.el,0),g(this._fadeFrame),this._fadeFrame=f(this._updateOpacity,this)):(n.active=!0,this._pruneTiles()),i||(pt(n.el,"leaflet-tile-loaded"),this.fire("tileload",{tile:n.el,coords:t})),this._noTilesToLoad()&&(this._loading=!1,this.fire("load"),wi||!this._map._fadeAnimated?f(this._pruneTiles,this):setTimeout(e(this._pruneTiles,this),250)))}},_getTilePos:function(t){return t.scaleBy(this.getTileSize()).subtract(this._level.origin)},_wrapCoords:function(t){var i=new x(this._wrapX?s(t.x,this._wrapX):t.x,this._wrapY?s(t.y,this._wrapY):t.y);return i.z=t.z,i},_pxBoundsToTileRange:function(t){var i=this.getTileSize();return new b(t.min.unscaleBy(i).floor(),t.max.unscaleBy(i).ceil().subtract([1,1]))},_noTilesToLoad:function(){for(var t in this._tiles)if(!this._tiles[t].loaded)return!1;return!0}}),ln=un.extend({options:{minZoom:0,maxZoom:18,subdomains:"abc",errorTileUrl:"",zoomOffset:0,tms:!1,zoomReverse:!1,detectRetina:!1,crossOrigin:!1},initialize:function(t,i){this._url=t,(i=l(this,i)).detectRetina&&Vi&&i.maxZoom>0&&(i.tileSize=Math.floor(i.tileSize/2),i.zoomReverse?(i.zoomOffset--,i.minZoom++):(i.zoomOffset++,i.maxZoom--),i.minZoom=Math.max(0,i.minZoom)),"string"==typeof i.subdomains&&(i.subdomains=i.subdomains.split("")),Pi||this.on("tileunload",this._onTileRemove)},setUrl:function(t,i){return this._url=t,i||this.redraw(),this},createTile:function(t,i){var n=document.createElement("img");return V(n,"load",e(this._tileOnLoad,this,i,n)),V(n,"error",e(this._tileOnError,this,i,n)),this.options.crossOrigin&&(n.crossOrigin=""),n.alt="",n.setAttribute("role","presentation"),n.src=this.getTileUrl(t),n},getTileUrl:function(t){var e={r:Vi?"@2x":"",s:this._getSubdomain(t),x:t.x,y:t.y,z:this._getZoomForUrl()};if(this._map&&!this._map.options.crs.infinite){var n=this._globalTileRange.max.y-t.y;this.options.tms&&(e.y=n),e["-y"]=n}return _(this._url,i(e,this.options))},_tileOnLoad:function(t,i){wi?setTimeout(e(t,this,null,i),0):t(null,i)},_tileOnError:function(t,i,e){var n=this.options.errorTileUrl;n&&i.src!==n&&(i.src=n),t(e,i)},_onTileRemove:function(t){t.tile.onload=null},_getZoomForUrl:function(){var t=this._tileZoom,i=this.options.maxZoom,e=this.options.zoomReverse,n=this.options.zoomOffset;return e&&(t=i-t),t+n},_getSubdomain:function(t){var i=Math.abs(t.x+t.y)%this.options.subdomains.length;return this.options.subdomains[i]},_abortLoading:function(){var t,i;for(t in this._tiles)this._tiles[t].coords.z!==this._tileZoom&&((i=this._tiles[t].el).onload=r,i.onerror=r,i.complete||(i.src=ni,ut(i)))}}),cn=ln.extend({defaultWmsParams:{service:"WMS",request:"GetMap",layers:"",styles:"",format:"image/jpeg",transparent:!1,version:"1.1.1"},options:{crs:null,uppercase:!1},initialize:function(t,e){this._url=t;var n=i({},this.defaultWmsParams);for(var o in e)o in this.options||(n[o]=e[o]);e=l(this,e),n.width=n.height=e.tileSize*(e.detectRetina&&Vi?2:1),this.wmsParams=n},onAdd:function(t){this._crs=this.options.crs||t.options.crs,this._wmsVersion=parseFloat(this.wmsParams.version);var i=this._wmsVersion>=1.3?"crs":"srs";this.wmsParams[i]=this._crs.code,ln.prototype.onAdd.call(this,t)},getTileUrl:function(t){var i=this._tileCoordsToBounds(t),e=this._crs.project(i.getNorthWest()),n=this._crs.project(i.getSouthEast()),o=(this._wmsVersion>=1.3&&this._crs===Ne?[n.y,e.x,e.y,n.x]:[e.x,n.y,n.x,e.y]).join(","),s=ln.prototype.getTileUrl.call(this,t);return s+c(this.wmsParams,s,this.options.uppercase)+(this.options.uppercase?"&BBOX=":"&bbox=")+o},setParams:function(t,e){return i(this.wmsParams,t),e||this.redraw(),this}});ln.WMS=cn,Yt.wms=function(t,i){return new cn(t,i)};var _n=We.extend({options:{padding:.1},initialize:function(t){l(this,t),n(this),this._layers=this._layers||{}},onAdd:function(){this._container||(this._initContainer(),this._zoomAnimated&&pt(this._container,"leaflet-zoom-animated")),this.getPane().appendChild(this._container),this._update(),this.on("update",this._updatePaths,this)},onRemove:function(){this.off("update",this._updatePaths,this),this._destroyContainer()},getEvents:function(){var t={viewreset:this._reset,zoom:this._onZoom,moveend:this._update,zoomend:this._onZoomEnd};return this._zoomAnimated&&(t.zoomanim=this._onAnimZoom),t},_onAnimZoom:function(t){this._updateTransform(t.center,t.zoom)},_onZoom:function(){this._updateTransform(this._map.getCenter(),this._map.getZoom())},_updateTransform:function(t,i){var e=this._map.getZoomScale(i,this._zoom),n=bt(this._container),o=this._map.getSize().multiplyBy(.5+this.options.padding),s=this._map.project(this._center,i),r=this._map.project(t,i).subtract(s),a=o.multiplyBy(-e).add(n).add(o).subtract(r);Oi?wt(this._container,a,e):Lt(this._container,a)},_reset:function(){this._update(),this._updateTransform(this._center,this._zoom);for(var t in this._layers)this._layers[t]._reset()},_onZoomEnd:function(){for(var t in this._layers)this._layers[t]._project()},_updatePaths:function(){for(var t in this._layers)this._layers[t]._update()},_update:function(){var t=this.options.padding,i=this._map.getSize(),e=this._map.containerPointToLayerPoint(i.multiplyBy(-t)).round();this._bounds=new b(e,e.add(i.multiplyBy(1+2*t)).round()),this._center=this._map.getCenter(),this._zoom=this._map.getZoom()}}),dn=_n.extend({getEvents:function(){var t=_n.prototype.getEvents.call(this);return t.viewprereset=this._onViewPreReset,t},_onViewPreReset:function(){this._postponeUpdatePaths=!0},onAdd:function(){_n.prototype.onAdd.call(this),this._draw()},_initContainer:function(){var t=this._container=document.createElement("canvas");V(t,"mousemove",o(this._onMouseMove,32,this),this),V(t,"click dblclick mousedown mouseup contextmenu",this._onClick,this),V(t,"mouseout",this._handleMouseOut,this),this._ctx=t.getContext("2d")},_destroyContainer:function(){delete this._ctx,ut(this._container),G(this._container),delete this._container},_updatePaths:function(){if(!this._postponeUpdatePaths){this._redrawBounds=null;for(var t in this._layers)this._layers[t]._update();this._redraw()}},_update:function(){if(!this._map._animatingZoom||!this._bounds){this._drawnLayers={},_n.prototype._update.call(this);var t=this._bounds,i=this._container,e=t.getSize(),n=Vi?2:1;Lt(i,t.min),i.width=n*e.x,i.height=n*e.y,i.style.width=e.x+"px",i.style.height=e.y+"px",Vi&&this._ctx.scale(2,2),this._ctx.translate(-t.min.x,-t.min.y),this.fire("update")}},_reset:function(){_n.prototype._reset.call(this),this._postponeUpdatePaths&&(this._postponeUpdatePaths=!1,this._updatePaths())},_initPath:function(t){this._updateDashArray(t),this._layers[n(t)]=t;var i=t._order={layer:t,prev:this._drawLast,next:null};this._drawLast&&(this._drawLast.next=i),this._drawLast=i,this._drawFirst=this._drawFirst||this._drawLast},_addPath:function(t){this._requestRedraw(t)},_removePath:function(t){var i=t._order,e=i.next,n=i.prev;e?e.prev=n:this._drawLast=n,n?n.next=e:this._drawFirst=e,delete t._order,delete this._layers[L.stamp(t)],this._requestRedraw(t)},_updatePath:function(t){this._extendRedrawBounds(t),t._project(),t._update(),this._requestRedraw(t)},_updateStyle:function(t){this._updateDashArray(t),this._requestRedraw(t)},_updateDashArray:function(t){if(t.options.dashArray){var i,e=t.options.dashArray.split(","),n=[];for(i=0;i<e.length;i++)n.push(Number(e[i]));t.options._dashArray=n}},_requestRedraw:function(t){this._map&&(this._extendRedrawBounds(t),this._redrawRequest=this._redrawRequest||f(this._redraw,this))},_extendRedrawBounds:function(t){if(t._pxBounds){var i=(t.options.weight||0)+1;this._redrawBounds=this._redrawBounds||new b,this._redrawBounds.extend(t._pxBounds.min.subtract([i,i])),this._redrawBounds.extend(t._pxBounds.max.add([i,i]))}},_redraw:function(){this._redrawRequest=null,this._redrawBounds&&(this._redrawBounds.min._floor(),this._redrawBounds.max._ceil()),this._clear(),this._draw(),this._redrawBounds=null},_clear:function(){var t=this._redrawBounds;if(t){var i=t.getSize();this._ctx.clearRect(t.min.x,t.min.y,i.x,i.y)}else this._ctx.clearRect(0,0,this._container.width,this._container.height)},_draw:function(){var t,i=this._redrawBounds;if(this._ctx.save(),i){var e=i.getSize();this._ctx.beginPath(),this._ctx.rect(i.min.x,i.min.y,e.x,e.y),this._ctx.clip()}this._drawing=!0;for(var n=this._drawFirst;n;n=n.next)t=n.layer,(!i||t._pxBounds&&t._pxBounds.intersects(i))&&t._updatePath();this._drawing=!1,this._ctx.restore()},_updatePoly:function(t,i){if(this._drawing){var e,n,o,s,r=t._parts,a=r.length,h=this._ctx;if(a){for(this._drawnLayers[t._leaflet_id]=t,h.beginPath(),e=0;e<a;e++){for(n=0,o=r[e].length;n<o;n++)s=r[e][n],h[n?"lineTo":"moveTo"](s.x,s.y);i&&h.closePath()}this._fillStroke(h,t)}}},_updateCircle:function(t){if(this._drawing&&!t._empty()){var i=t._point,e=this._ctx,n=t._radius,o=(t._radiusY||n)/n;this._drawnLayers[t._leaflet_id]=t,1!==o&&(e.save(),e.scale(1,o)),e.beginPath(),e.arc(i.x,i.y/o,n,0,2*Math.PI,!1),1!==o&&e.restore(),this._fillStroke(e,t)}},_fillStroke:function(t,i){var e=i.options;e.fill&&(t.globalAlpha=e.fillOpacity,t.fillStyle=e.fillColor||e.color,t.fill(e.fillRule||"evenodd")),e.stroke&&0!==e.weight&&(t.setLineDash&&t.setLineDash(i.options&&i.options._dashArray||[]),t.globalAlpha=e.opacity,t.lineWidth=e.weight,t.strokeStyle=e.color,t.lineCap=e.lineCap,t.lineJoin=e.lineJoin,t.stroke())},_onClick:function(t){for(var i,e,n=this._map.mouseEventToLayerPoint(t),o=this._drawFirst;o;o=o.next)(i=o.layer).options.interactive&&i._containsPoint(n)&&!this._map._draggableMoved(i)&&(e=i);e&&(et(t),this._fireEvent([e],t))},_onMouseMove:function(t){if(this._map&&!this._map.dragging.moving()&&!this._map._animatingZoom){var i=this._map.mouseEventToLayerPoint(t);this._handleMouseHover(t,i)}},_handleMouseOut:function(t){var i=this._hoveredLayer;i&&(mt(this._container,"leaflet-interactive"),this._fireEvent([i],t,"mouseout"),this._hoveredLayer=null)},_handleMouseHover:function(t,i){for(var e,n,o=this._drawFirst;o;o=o.next)(e=o.layer).options.interactive&&e._containsPoint(i)&&(n=e);n!==this._hoveredLayer&&(this._handleMouseOut(t),n&&(pt(this._container,"leaflet-interactive"),this._fireEvent([n],t,"mouseover"),this._hoveredLayer=n)),this._hoveredLayer&&this._fireEvent([this._hoveredLayer],t)},_fireEvent:function(t,i,e){this._map._fireDOMEvent(i,e||i.type,t)},_bringToFront:function(t){var i=t._order,e=i.next,n=i.prev;e&&(e.prev=n,n?n.next=e:e&&(this._drawFirst=e),i.prev=this._drawLast,this._drawLast.next=i,i.next=null,this._drawLast=i,this._requestRedraw(t))},_bringToBack:function(t){var i=t._order,e=i.next,n=i.prev;n&&(n.next=e,e?e.prev=n:n&&(this._drawLast=n),i.prev=null,i.next=this._drawFirst,this._drawFirst.prev=i,this._drawFirst=i,this._requestRedraw(t))}}),pn=function(){try{return document.namespaces.add("lvml","urn:schemas-microsoft-com:vml"),function(t){return document.createElement("<lvml:"+t+' class="lvml">')}}catch(t){return function(t){return document.createElement("<"+t+' xmlns="urn:schemas-microsoft.com:vml" class="lvml">')}}}(),mn={_initContainer:function(){this._container=ht("div","leaflet-vml-container")},_update:function(){this._map._animatingZoom||(_n.prototype._update.call(this),this.fire("update"))},_initPath:function(t){var i=t._container=pn("shape");pt(i,"leaflet-vml-shape "+(this.options.className||"")),i.coordsize="1 1",t._path=pn("path"),i.appendChild(t._path),this._updateStyle(t),this._layers[n(t)]=t},_addPath:function(t){var i=t._container;this._container.appendChild(i),t.options.interactive&&t.addInteractiveTarget(i)},_removePath:function(t){var i=t._container;ut(i),t.removeInteractiveTarget(i),delete this._layers[n(t)]},_updateStyle:function(t){var i=t._stroke,e=t._fill,n=t.options,o=t._container;o.stroked=!!n.stroke,o.filled=!!n.fill,n.stroke?(i||(i=t._stroke=pn("stroke")),o.appendChild(i),i.weight=n.weight+"px",i.color=n.color,i.opacity=n.opacity,n.dashArray?i.dashStyle=ei(n.dashArray)?n.dashArray.join(" "):n.dashArray.replace(/( *, *)/g," "):i.dashStyle="",i.endcap=n.lineCap.replace("butt","flat"),i.joinstyle=n.lineJoin):i&&(o.removeChild(i),t._stroke=null),n.fill?(e||(e=t._fill=pn("fill")),o.appendChild(e),e.color=n.fillColor||n.color,e.opacity=n.fillOpacity):e&&(o.removeChild(e),t._fill=null)},_updateCircle:function(t){var i=t._point.round(),e=Math.round(t._radius),n=Math.round(t._radiusY||e);this._setPath(t,t._empty()?"M0 0":"AL "+i.x+","+i.y+" "+e+","+n+" 0,23592600")},_setPath:function(t,i){t._path.v=i},_bringToFront:function(t){ct(t._container)},_bringToBack:function(t){_t(t._container)}},fn=Ki?pn:S,gn=_n.extend({getEvents:function(){var t=_n.prototype.getEvents.call(this);return t.zoomstart=this._onZoomStart,t},_initContainer:function(){this._container=fn("svg"),this._container.setAttribute("pointer-events","none"),this._rootGroup=fn("g"),this._container.appendChild(this._rootGroup)},_destroyContainer:function(){ut(this._container),G(this._container),delete this._container,delete this._rootGroup},_onZoomStart:function(){this._update()},_update:function(){if(!this._map._animatingZoom||!this._bounds){_n.prototype._update.call(this);var t=this._bounds,i=t.getSize(),e=this._container;this._svgSize&&this._svgSize.equals(i)||(this._svgSize=i,e.setAttribute("width",i.x),e.setAttribute("height",i.y)),Lt(e,t.min),e.setAttribute("viewBox",[t.min.x,t.min.y,i.x,i.y].join(" ")),this.fire("update")}},_initPath:function(t){var i=t._path=fn("path");t.options.className&&pt(i,t.options.className),t.options.interactive&&pt(i,"leaflet-interactive"),this._updateStyle(t),this._layers[n(t)]=t},_addPath:function(t){this._rootGroup||this._initContainer(),this._rootGroup.appendChild(t._path),t.addInteractiveTarget(t._path)},_removePath:function(t){ut(t._path),t.removeInteractiveTarget(t._path),delete this._layers[n(t)]},_updatePath:function(t){t._project(),t._update()},_updateStyle:function(t){var i=t._path,e=t.options;i&&(e.stroke?(i.setAttribute("stroke",e.color),i.setAttribute("stroke-opacity",e.opacity),i.setAttribute("stroke-width",e.weight),i.setAttribute("stroke-linecap",e.lineCap),i.setAttribute("stroke-linejoin",e.lineJoin),e.dashArray?i.setAttribute("stroke-dasharray",e.dashArray):i.removeAttribute("stroke-dasharray"),e.dashOffset?i.setAttribute("stroke-dashoffset",e.dashOffset):i.removeAttribute("stroke-dashoffset")):i.setAttribute("stroke","none"),e.fill?(i.setAttribute("fill",e.fillColor||e.color),i.setAttribute("fill-opacity",e.fillOpacity),i.setAttribute("fill-rule",e.fillRule||"evenodd")):i.setAttribute("fill","none"))},_updatePoly:function(t,i){this._setPath(t,k(t._parts,i))},_updateCircle:function(t){var i=t._point,e=t._radius,n="a"+e+","+(t._radiusY||e)+" 0 1,0 ",o=t._empty()?"M0 0":"M"+(i.x-e)+","+i.y+n+2*e+",0 "+n+2*-e+",0 ";this._setPath(t,o)},_setPath:function(t,i){t._path.setAttribute("d",i)},_bringToFront:function(t){ct(t._path)},_bringToBack:function(t){_t(t._path)}});Ki&&gn.include(mn),ye.include({getRenderer:function(t){var i=t.options.renderer||this._getPaneRenderer(t.options.pane)||this.options.renderer||this._renderer;return i||(i=this._renderer=this.options.preferCanvas&&Xt()||Jt()),this.hasLayer(i)||this.addLayer(i),i},_getPaneRenderer:function(t){if("overlayPane"===t||void 0===t)return!1;var i=this._paneRenderers[t];return void 0===i&&(i=gn&&Jt({pane:t})||dn&&Xt({pane:t}),this._paneRenderers[t]=i),i}});var vn=$e.extend({initialize:function(t,i){$e.prototype.initialize.call(this,this._boundsToLatLngs(t),i)},setBounds:function(t){return this.setLatLngs(this._boundsToLatLngs(t))},_boundsToLatLngs:function(t){return t=z(t),[t.getSouthWest(),t.getNorthWest(),t.getNorthEast(),t.getSouthEast()]}});gn.create=fn,gn.pointsToPath=k,Qe.geometryToLayer=Wt,Qe.coordsToLatLng=Ht,Qe.coordsToLatLngs=Ft,Qe.latLngToCoords=Ut,Qe.latLngsToCoords=Vt,Qe.getFeature=Gt,Qe.asFeature=qt,ye.mergeOptions({boxZoom:!0});var yn=Me.extend({initialize:function(t){this._map=t,this._container=t._container,this._pane=t._panes.overlayPane,this._resetStateTimeout=0,t.on("unload",this._destroy,this)},addHooks:function(){V(this._container,"mousedown",this._onMouseDown,this)},removeHooks:function(){G(this._container,"mousedown",this._onMouseDown,this)},moved:function(){return this._moved},_destroy:function(){ut(this._pane),delete this._pane},_resetState:function(){this._resetStateTimeout=0,this._moved=!1},_clearDeferredResetState:function(){0!==this._resetStateTimeout&&(clearTimeout(this._resetStateTimeout),this._resetStateTimeout=0)},_onMouseDown:function(t){if(!t.shiftKey||1!==t.which&&1!==t.button)return!1;this._clearDeferredResetState(),this._resetState(),pi(),Pt(),this._startPoint=this._map.mouseEventToContainerPoint(t),V(document,{contextmenu:Q,mousemove:this._onMouseMove,mouseup:this._onMouseUp,keydown:this._onKeyDown},this)},_onMouseMove:function(t){this._moved||(this._moved=!0,this._box=ht("div","leaflet-zoom-box",this._container),pt(this._container,"leaflet-crosshair"),this._map.fire("boxzoomstart")),this._point=this._map.mouseEventToContainerPoint(t);var i=new b(this._point,this._startPoint),e=i.getSize();Lt(this._box,i.min),this._box.style.width=e.x+"px",this._box.style.height=e.y+"px"},_finish:function(){this._moved&&(ut(this._box),mt(this._container,"leaflet-crosshair")),mi(),Tt(),G(document,{contextmenu:Q,mousemove:this._onMouseMove,mouseup:this._onMouseUp,keydown:this._onKeyDown},this)},_onMouseUp:function(t){if((1===t.which||1===t.button)&&(this._finish(),this._moved)){this._clearDeferredResetState(),this._resetStateTimeout=setTimeout(e(this._resetState,this),0);var i=new T(this._map.containerPointToLatLng(this._startPoint),this._map.containerPointToLatLng(this._point));this._map.fitBounds(i).fire("boxzoomend",{boxZoomBounds:i})}},_onKeyDown:function(t){27===t.keyCode&&this._finish()}});ye.addInitHook("addHandler","boxZoom",yn),ye.mergeOptions({doubleClickZoom:!0});var xn=Me.extend({addHooks:function(){this._map.on("dblclick",this._onDoubleClick,this)},removeHooks:function(){this._map.off("dblclick",this._onDoubleClick,this)},_onDoubleClick:function(t){var i=this._map,e=i.getZoom(),n=i.options.zoomDelta,o=t.originalEvent.shiftKey?e-n:e+n;"center"===i.options.doubleClickZoom?i.setZoom(o):i.setZoomAround(t.containerPoint,o)}});ye.addInitHook("addHandler","doubleClickZoom",xn),ye.mergeOptions({dragging:!0,inertia:!Ti,inertiaDeceleration:3400,inertiaMaxSpeed:1/0,easeLinearity:.2,worldCopyJump:!1,maxBoundsViscosity:0});var wn=Me.extend({addHooks:function(){if(!this._draggable){var t=this._map;this._draggable=new ke(t._mapPane,t._container),this._draggable.on({dragstart:this._onDragStart,drag:this._onDrag,dragend:this._onDragEnd},this),this._draggable.on("predrag",this._onPreDragLimit,this),t.options.worldCopyJump&&(this._draggable.on("predrag",this._onPreDragWrap,this),t.on("zoomend",this._onZoomEnd,this),t.whenReady(this._onZoomEnd,this))}pt(this._map._container,"leaflet-grab leaflet-touch-drag"),this._draggable.enable(),this._positions=[],this._times=[]},removeHooks:function(){mt(this._map._container,"leaflet-grab"),mt(this._map._container,"leaflet-touch-drag"),this._draggable.disable()},moved:function(){return this._draggable&&this._draggable._moved},moving:function(){return this._draggable&&this._draggable._moving},_onDragStart:function(){var t=this._map;if(t._stop(),this._map.options.maxBounds&&this._map.options.maxBoundsViscosity){var i=z(this._map.options.maxBounds);this._offsetLimit=P(this._map.latLngToContainerPoint(i.getNorthWest()).multiplyBy(-1),this._map.latLngToContainerPoint(i.getSouthEast()).multiplyBy(-1).add(this._map.getSize())),this._viscosity=Math.min(1,Math.max(0,this._map.options.maxBoundsViscosity))}else this._offsetLimit=null;t.fire("movestart").fire("dragstart"),t.options.inertia&&(this._positions=[],this._times=[])},_onDrag:function(t){if(this._map.options.inertia){var i=this._lastTime=+new Date,e=this._lastPos=this._draggable._absPos||this._draggable._newPos;this._positions.push(e),this._times.push(i),i-this._times[0]>50&&(this._positions.shift(),this._times.shift())}this._map.fire("move",t).fire("drag",t)},_onZoomEnd:function(){var t=this._map.getSize().divideBy(2),i=this._map.latLngToLayerPoint([0,0]);this._initialWorldOffset=i.subtract(t).x,this._worldWidth=this._map.getPixelWorldBounds().getSize().x},_viscousLimit:function(t,i){return t-(t-i)*this._viscosity},_onPreDragLimit:function(){if(this._viscosity&&this._offsetLimit){var t=this._draggable._newPos.subtract(this._draggable._startPos),i=this._offsetLimit;t.x<i.min.x&&(t.x=this._viscousLimit(t.x,i.min.x)),t.y<i.min.y&&(t.y=this._viscousLimit(t.y,i.min.y)),t.x>i.max.x&&(t.x=this._viscousLimit(t.x,i.max.x)),t.y>i.max.y&&(t.y=this._viscousLimit(t.y,i.max.y)),this._draggable._newPos=this._draggable._startPos.add(t)}},_onPreDragWrap:function(){var t=this._worldWidth,i=Math.round(t/2),e=this._initialWorldOffset,n=this._draggable._newPos.x,o=(n-i+e)%t+i-e,s=(n+i+e)%t-i-e,r=Math.abs(o+e)<Math.abs(s+e)?o:s;this._draggable._absPos=this._draggable._newPos.clone(),this._draggable._newPos.x=r},_onDragEnd:function(t){var i=this._map,e=i.options,n=!e.inertia||this._times.length<2;if(i.fire("dragend",t),n)i.fire("moveend");else{var o=this._lastPos.subtract(this._positions[0]),s=(this._lastTime-this._times[0])/1e3,r=e.easeLinearity,a=o.multiplyBy(r/s),h=a.distanceTo([0,0]),u=Math.min(e.inertiaMaxSpeed,h),l=a.multiplyBy(u/h),c=u/(e.inertiaDeceleration*r),_=l.multiplyBy(-c/2).round();_.x||_.y?(_=i._limitOffset(_,i.options.maxBounds),f(function(){i.panBy(_,{duration:c,easeLinearity:r,noMoveStart:!0,animate:!0})})):i.fire("moveend")}}});ye.addInitHook("addHandler","dragging",wn),ye.mergeOptions({keyboard:!0,keyboardPanDelta:80});var Ln=Me.extend({keyCodes:{left:[37],right:[39],down:[40],up:[38],zoomIn:[187,107,61,171],zoomOut:[189,109,54,173]},initialize:function(t){this._map=t,this._setPanDelta(t.options.keyboardPanDelta),this._setZoomDelta(t.options.zoomDelta)},addHooks:function(){var t=this._map._container;t.tabIndex<=0&&(t.tabIndex="0"),V(t,{focus:this._onFocus,blur:this._onBlur,mousedown:this._onMouseDown},this),this._map.on({focus:this._addHooks,blur:this._removeHooks},this)},removeHooks:function(){this._removeHooks(),G(this._map._container,{focus:this._onFocus,blur:this._onBlur,mousedown:this._onMouseDown},this),this._map.off({focus:this._addHooks,blur:this._removeHooks},this)},_onMouseDown:function(){if(!this._focused){var t=document.body,i=document.documentElement,e=t.scrollTop||i.scrollTop,n=t.scrollLeft||i.scrollLeft;this._map._container.focus(),window.scrollTo(n,e)}},_onFocus:function(){this._focused=!0,this._map.fire("focus")},_onBlur:function(){this._focused=!1,this._map.fire("blur")},_setPanDelta:function(t){var i,e,n=this._panKeys={},o=this.keyCodes;for(i=0,e=o.left.length;i<e;i++)n[o.left[i]]=[-1*t,0];for(i=0,e=o.right.length;i<e;i++)n[o.right[i]]=[t,0];for(i=0,e=o.down.length;i<e;i++)n[o.down[i]]=[0,t];for(i=0,e=o.up.length;i<e;i++)n[o.up[i]]=[0,-1*t]},_setZoomDelta:function(t){var i,e,n=this._zoomKeys={},o=this.keyCodes;for(i=0,e=o.zoomIn.length;i<e;i++)n[o.zoomIn[i]]=t;for(i=0,e=o.zoomOut.length;i<e;i++)n[o.zoomOut[i]]=-t},_addHooks:function(){V(document,"keydown",this._onKeyDown,this)},_removeHooks:function(){G(document,"keydown",this._onKeyDown,this)},_onKeyDown:function(t){if(!(t.altKey||t.ctrlKey||t.metaKey)){var i,e=t.keyCode,n=this._map;if(e in this._panKeys){if(n._panAnim&&n._panAnim._inProgress)return;i=this._panKeys[e],t.shiftKey&&(i=w(i).multiplyBy(3)),n.panBy(i),n.options.maxBounds&&n.panInsideBounds(n.options.maxBounds)}else if(e in this._zoomKeys)n.setZoom(n.getZoom()+(t.shiftKey?3:1)*this._zoomKeys[e]);else{if(27!==e||!n._popup)return;n.closePopup()}Q(t)}}});ye.addInitHook("addHandler","keyboard",Ln),ye.mergeOptions({scrollWheelZoom:!0,wheelDebounceTime:40,wheelPxPerZoomLevel:60});var bn=Me.extend({addHooks:function(){V(this._map._container,"mousewheel",this._onWheelScroll,this),this._delta=0},removeHooks:function(){G(this._map._container,"mousewheel",this._onWheelScroll,this)},_onWheelScroll:function(t){var i=it(t),n=this._map.options.wheelDebounceTime;this._delta+=i,this._lastMousePos=this._map.mouseEventToContainerPoint(t),this._startTime||(this._startTime=+new Date);var o=Math.max(n-(+new Date-this._startTime),0);clearTimeout(this._timer),this._timer=setTimeout(e(this._performZoom,this),o),Q(t)},_performZoom:function(){var t=this._map,i=t.getZoom(),e=this._map.options.zoomSnap||0;t._stop();var n=this._delta/(4*this._map.options.wheelPxPerZoomLevel),o=4*Math.log(2/(1+Math.exp(-Math.abs(n))))/Math.LN2,s=e?Math.ceil(o/e)*e:o,r=t._limitZoom(i+(this._delta>0?s:-s))-i;this._delta=0,this._startTime=null,r&&("center"===t.options.scrollWheelZoom?t.setZoom(i+r):t.setZoomAround(this._lastMousePos,i+r))}});ye.addInitHook("addHandler","scrollWheelZoom",bn),ye.mergeOptions({tap:!0,tapTolerance:15});var Pn=Me.extend({addHooks:function(){V(this._map._container,"touchstart",this._onDown,this)},removeHooks:function(){G(this._map._container,"touchstart",this._onDown,this)},_onDown:function(t){if(t.touches){if($(t),this._fireClick=!0,t.touches.length>1)return this._fireClick=!1,void clearTimeout(this._holdTimeout);var i=t.touches[0],n=i.target;this._startPos=this._newPos=new x(i.clientX,i.clientY),n.tagName&&"a"===n.tagName.toLowerCase()&&pt(n,"leaflet-active"),this._holdTimeout=setTimeout(e(function(){this._isTapValid()&&(this._fireClick=!1,this._onUp(),this._simulateEvent("contextmenu",i))},this),1e3),this._simulateEvent("mousedown",i),V(document,{touchmove:this._onMove,touchend:this._onUp},this)}},_onUp:function(t){if(clearTimeout(this._holdTimeout),G(document,{touchmove:this._onMove,touchend:this._onUp},this),this._fireClick&&t&&t.changedTouches){var i=t.changedTouches[0],e=i.target;e&&e.tagName&&"a"===e.tagName.toLowerCase()&&mt(e,"leaflet-active"),this._simulateEvent("mouseup",i),this._isTapValid()&&this._simulateEvent("click",i)}},_isTapValid:function(){return this._newPos.distanceTo(this._startPos)<=this._map.options.tapTolerance},_onMove:function(t){var i=t.touches[0];this._newPos=new x(i.clientX,i.clientY),this._simulateEvent("mousemove",i)},_simulateEvent:function(t,i){var e=document.createEvent("MouseEvents");e._simulated=!0,i.target._simulatedClick=!0,e.initMouseEvent(t,!0,!0,window,1,i.screenX,i.screenY,i.clientX,i.clientY,!1,!1,!1,!1,0,null),i.target.dispatchEvent(e)}});Hi&&!Wi&&ye.addInitHook("addHandler","tap",Pn),ye.mergeOptions({touchZoom:Hi&&!Ti,bounceAtZoomLimits:!0});var Tn=Me.extend({addHooks:function(){pt(this._map._container,"leaflet-touch-zoom"),V(this._map._container,"touchstart",this._onTouchStart,this)},removeHooks:function(){mt(this._map._container,"leaflet-touch-zoom"),G(this._map._container,"touchstart",this._onTouchStart,this)},_onTouchStart:function(t){var i=this._map;if(t.touches&&2===t.touches.length&&!i._animatingZoom&&!this._zooming){var e=i.mouseEventToContainerPoint(t.touches[0]),n=i.mouseEventToContainerPoint(t.touches[1]);this._centerPoint=i.getSize()._divideBy(2),this._startLatLng=i.containerPointToLatLng(this._centerPoint),"center"!==i.options.touchZoom&&(this._pinchStartLatLng=i.containerPointToLatLng(e.add(n)._divideBy(2))),this._startDist=e.distanceTo(n),this._startZoom=i.getZoom(),this._moved=!1,this._zooming=!0,i._stop(),V(document,"touchmove",this._onTouchMove,this),V(document,"touchend",this._onTouchEnd,this),$(t)}},_onTouchMove:function(t){if(t.touches&&2===t.touches.length&&this._zooming){var i=this._map,n=i.mouseEventToContainerPoint(t.touches[0]),o=i.mouseEventToContainerPoint(t.touches[1]),s=n.distanceTo(o)/this._startDist;if(this._zoom=i.getScaleZoom(s,this._startZoom),!i.options.bounceAtZoomLimits&&(this._zoom<i.getMinZoom()&&s<1||this._zoom>i.getMaxZoom()&&s>1)&&(this._zoom=i._limitZoom(this._zoom)),"center"===i.options.touchZoom){if(this._center=this._startLatLng,1===s)return}else{var r=n._add(o)._divideBy(2)._subtract(this._centerPoint);if(1===s&&0===r.x&&0===r.y)return;this._center=i.unproject(i.project(this._pinchStartLatLng,this._zoom).subtract(r),this._zoom)}this._moved||(i._moveStart(!0),this._moved=!0),g(this._animRequest);var a=e(i._move,i,this._center,this._zoom,{pinch:!0,round:!1});this._animRequest=f(a,this,!0),$(t)}},_onTouchEnd:function(){this._moved&&this._zooming?(this._zooming=!1,g(this._animRequest),G(document,"touchmove",this._onTouchMove),G(document,"touchend",this._onTouchEnd),this._map.options.zoomAnimation?this._map._animateZoom(this._center,this._map._limitZoom(this._zoom),!0,this._map.options.zoomSnap):this._map._resetView(this._center,this._map._limitZoom(this._zoom))):this._zooming=!1}});ye.addInitHook("addHandler","touchZoom",Tn),ye.BoxZoom=yn,ye.DoubleClickZoom=xn,ye.Drag=wn,ye.Keyboard=Ln,ye.ScrollWheelZoom=bn,ye.Tap=Pn,ye.TouchZoom=Tn;var zn=window.L;window.L=t,Object.freeze=$t,t.version="1.2.0+HEAD.1ac320b",t.noConflict=function(){return window.L=zn,this},t.Control=xe,t.control=we,t.Browser=Yi,t.Evented=ui,t.Mixin=Ce,t.Util=ai,t.Class=v,t.Handler=Me,t.extend=i,t.bind=e,t.stamp=n,t.setOptions=l,t.DomEvent=le,t.DomUtil=ge,t.PosAnimation=ve,t.Draggable=ke,t.LineUtil=Be,t.PolyUtil=Ie,t.Point=x,t.point=w,t.Bounds=b,t.bounds=P,t.Transformation=Z,t.transformation=E,t.Projection=Re,t.LatLng=M,t.latLng=C,t.LatLngBounds=T,t.latLngBounds=z,t.CRS=li,t.GeoJSON=Qe,t.geoJSON=Kt,t.geoJson=en,t.Layer=We,t.LayerGroup=He,t.layerGroup=function(t){return new He(t)},t.FeatureGroup=Fe,t.featureGroup=function(t){return new Fe(t)},t.ImageOverlay=nn,t.imageOverlay=function(t,i,e){return new nn(t,i,e)},t.VideoOverlay=on,t.videoOverlay=function(t,i,e){return new on(t,i,e)},t.DivOverlay=sn,t.Popup=rn,t.popup=function(t,i){return new rn(t,i)},t.Tooltip=an,t.tooltip=function(t,i){return new an(t,i)},t.Icon=Ue,t.icon=function(t){return new Ue(t)},t.DivIcon=hn,t.divIcon=function(t){return new hn(t)},t.Marker=qe,t.marker=function(t,i){return new qe(t,i)},t.TileLayer=ln,t.tileLayer=Yt,t.GridLayer=un,t.gridLayer=function(t){return new un(t)},t.SVG=gn,t.svg=Jt,t.Renderer=_n,t.Canvas=dn,t.canvas=Xt,t.Path=Ke,t.CircleMarker=Ye,t.circleMarker=function(t,i){return new Ye(t,i)},t.Circle=Xe,t.circle=function(t,i,e){return new Xe(t,i,e)},t.Polyline=Je,t.polyline=function(t,i){return new Je(t,i)},t.Polygon=$e,t.polygon=function(t,i){return new $e(t,i)},t.Rectangle=vn,t.rectangle=function(t,i){return new vn(t,i)},t.Map=ye,t.map=function(t,i){return new ye(t,i)}});

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = {"layer2097728":{"id":"layer2097728","alpha":0.6,"visible":true,"has_icon":true,"timestamp":"1509032773","src":"s5","features":[{"type":"polygon","icon":"http://editor.giscloud.com/rest/1/icons/landcover/Bush_fill.png?color=%23006f9e&size=32","styleName":"layer2097728_style0","fillcolor":"#938953","strokecolor":"#000000","linewidth":0,"expression":"tipo_de__n='Aprovechamiento de Recursos Forestales No Maderables'","expressionLabel":"Aprovechamiento de Recursos Forestales No Maderables"}],"xmin":-13037205.31871,"ymin":1638295.69674,"xmax":-9659828.8523,"ymax":3847482.98071,"oldLayer":null},"layer2097731":{"id":"layer2097731","alpha":0.58,"visible":false,"timestamp":"1509033045","src":"s7","features":[{"type":"polygon","styleName":"layer2097731_style0","fillcolor":"#FF0000","strokecolor":"#000000","linewidth":0,"expression":"tipo_de__n='Cambio de Uso de Suelo'","expressionLabel":"Cambio de Uso de Suelo"}],"xmin":-13037205.31871,"ymin":1638295.69674,"xmax":-9659828.8523,"ymax":3847482.98071,"oldLayer":null},"layer2097556":{"id":"layer2097556","alpha":0.6,"visible":false,"timestamp":"1509033232","src":"s9","features":[{"type":"polygon","styleName":"layer2097556_style0","fillcolor":"#FFFF00","strokecolor":"#000000","linewidth":0,"expression":"tipo_de__n='NotificaciÃ³n de Saneamiento Forestal'","expressionLabel":"Saneamiento Forestal"}],"xmin":-13037205.31871,"ymin":1638295.69674,"xmax":-9659828.8523,"ymax":3847482.98071,"oldLayer":null},"layer2097560":{"id":"layer2097560","alpha":0.6,"visible":false,"timestamp":"1509033164","src":"s11","features":[{"type":"polygon","styleName":"layer2097560_style0","fillcolor":"#66FFFF","strokecolor":"#000000","linewidth":0,"expression":"tipo_de__n='Plantaciones Forestales Comerciales'","expressionLabel":"Plantación Forestal Comercial"}],"xmin":-13037205.31871,"ymin":1638295.69674,"xmax":-9659828.8523,"ymax":3847482.98071,"oldLayer":null},"layer1977849":{"id":"layer1977849","alpha":1,"visible":false,"timestamp":"1501018751","src":"s15","tooltip":"tipo","features":[{"type":"point","styleName":"pointstyle1977849-0","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2F2564d747e0504b9a17a3a4e334c0bc12%2FLayers_738924%2FuploadedSymbols%2Fsymbol_4a39e449a591db1545d6d61b724d6a0f.png","dx":-10.5,"dy":-10.5}],"has_icon":true,"xmin":-13032005.82349,"ymin":1700406.69598,"xmax":-9666032.73904,"ymax":3843005.78424,"oldLayer":null},"layer1147071":{"id":"layer1147071","alpha":1,"visible":false,"timestamp":"1496937920","src":"s21","tooltip":"sitio,energia","features":[{"type":"point","styleName":"pointstyle1147071-0","expression":"energia='Solar'","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=http%3A%2F%2Feditor.giscloud.com%2Frest%2F1%2Ficons%2Fpower%2Fstation_solar.png%3Fcolor%3D%2523ffc000%26size%3D20","dx":-5,"dy":-5}],"has_icon":true,"xmin":-13033443.721795,"ymin":1689200.139608,"xmax":-9654916.323171,"ymax":3842686.200843,"oldLayer":null},"layer1147080":{"id":"layer1147080","alpha":1,"visible":false,"timestamp":"1496937921","src":"s23","tooltip":"sitio,energia","features":[{"type":"point","styleName":"pointstyle1147080-0","expression":"energia='Eólica'","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2F2564d747e0504b9a17a3a4e334c0bc12%2FSENER%2FuploadedSymbols%2Feolica.png","dx":-10.5,"dy":-10.5}],"has_icon":true,"xmin":-13033443.721795,"ymin":1689200.139608,"xmax":-9654916.323171,"ymax":3842686.200843,"oldLayer":null},"layer1147079":{"id":"layer1147079","alpha":1,"visible":false,"timestamp":"1496937920","src":"s25","tooltip":"sitio,energia","features":[{"type":"point","styleName":"pointstyle1147079-0","expression":"energia='Geotérmica'","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2F2564d747e0504b9a17a3a4e334c0bc12%2FSENER%2FuploadedSymbols%2Fgeotermica.png","dx":-8.5,"dy":-8.5}],"has_icon":true,"xmin":-13033443.721795,"ymin":1689200.139608,"xmax":-9654916.323171,"ymax":3842686.200843,"oldLayer":null},"layer1147077":{"id":"layer1147077","alpha":1,"visible":false,"timestamp":"1496937921","src":"s27","tooltip":"sitio,energia","features":[{"type":"point","styleName":"pointstyle1147077-0","expression":"(energia='Hidráulica' and tipo='Grande Hidroeléctrica')","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2F2564d747e0504b9a17a3a4e334c0bc12%2FSENER%2FuploadedSymbols%2Fhidro_grande.png","dx":-10.5,"dy":-10.5}],"has_icon":true,"xmin":-13033443.721795,"ymin":1689200.139608,"xmax":-9654916.323171,"ymax":3842686.200843,"oldLayer":null},"layer1147078":{"id":"layer1147078","alpha":1,"visible":false,"timestamp":"1496937920","src":"s29","tooltip":"sitio,energia","features":[{"type":"point","styleName":"pointstyle1147078-0","expression":"(energia='Hidráulica' and tipo='Pequeña Hidroeléctrica')","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2F2564d747e0504b9a17a3a4e334c0bc12%2FSENER%2FuploadedSymbols%2Fhidro_pequ.png","dx":-10.5,"dy":-10.5}],"has_icon":true,"xmin":-13033443.721795,"ymin":1689200.139608,"xmax":-9654916.323171,"ymax":3842686.200843,"oldLayer":null},"layer1147081":{"id":"layer1147081","alpha":1,"visible":false,"timestamp":"1496937920","src":"s31","tooltip":"sitio,energia","features":[{"type":"point","styleName":"pointstyle1147081-0","expression":"energia='Biomasa'","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2F2564d747e0504b9a17a3a4e334c0bc12%2FSENER%2FuploadedSymbols%2Fbiomasa.png","dx":-11.5,"dy":-11.5}],"has_icon":true,"xmin":-13033443.721795,"ymin":1689200.139608,"xmax":-9654916.323171,"ymax":3842686.200843,"oldLayer":null},"layer1147073":{"id":"layer1147073","alpha":1,"visible":false,"timestamp":"1496937920","src":"s33","tooltip":"sitio,energia","features":[{"type":"point","clustering":14,"fillcolor":"#e20000","styleName":"pointstyle1147073-0","width":10,"expression":"energia='Oceánica'","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=http%3A%2F%2Feditor.giscloud.com%2Frest%2F1%2Ficons%2Fwater%2Fweir.png%3Fcolor%3D%2523ff0000%26size%3D32","dx":-5,"dy":-5}],"has_icon":true,"xmin":-13033443.721795,"ymin":1689200.139608,"xmax":-9654916.323171,"ymax":3842686.200843,"oldLayer":null},"layer1147637":{"id":"layer1147637","alpha":1,"visible":false,"timestamp":"1496937920","src":"s37","tooltip":"nombre,tipo","features":[{"type":"point","styleName":"pointstyle1147637-0","expression":"energia='Solar'","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=http%3A%2F%2Feditor.giscloud.com%2Frest%2F1%2Ficons%2Fpower%2Fstation_solar.png%3Fcolor%3D%2523ffc000%26size%3D20","dx":-5,"dy":-5}],"has_icon":true,"xmin":-13015288.737361,"ymin":1684742.580532,"xmax":-9669446.744985,"ymax":3834929.266458,"oldLayer":null},"layer1147638":{"id":"layer1147638","alpha":1,"visible":false,"timestamp":"1496937920","src":"s39","tooltip":"nombre,tipo","features":[{"type":"point","styleName":"pointstyle1147638-0","expression":"energia='Eólica'","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2F2564d747e0504b9a17a3a4e334c0bc12%2FSENER%2FuploadedSymbols%2Feolica.png","dx":-10.5,"dy":-10.5}],"has_icon":true,"xmin":-13015288.737361,"ymin":1684742.580532,"xmax":-9669446.744985,"ymax":3834929.266458,"oldLayer":null},"layer1147639":{"id":"layer1147639","alpha":1,"visible":false,"timestamp":"1496937920","src":"s41","tooltip":"nombre,tipo","features":[{"type":"point","styleName":"pointstyle1147639-0","expression":"energia='Geotérmica'","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2F2564d747e0504b9a17a3a4e334c0bc12%2FSENER%2FuploadedSymbols%2Fgeotermica.png","dx":-8.5,"dy":-8.5}],"has_icon":true,"xmin":-13015288.737361,"ymin":1684742.580532,"xmax":-9669446.744985,"ymax":3834929.266458,"oldLayer":null},"layer1147640":{"id":"layer1147640","alpha":1,"visible":false,"timestamp":"1496937920","src":"s43","tooltip":"nombre,tipo","features":[{"type":"point","styleName":"pointstyle1147640-0","expression":"(energia='Hidráulica' and tipo='Grande Hidroeléctrica')","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2F2564d747e0504b9a17a3a4e334c0bc12%2FSENER%2FuploadedSymbols%2Fhidro_grande.png","dx":-10.5,"dy":-10.5}],"has_icon":true,"xmin":-13015288.737361,"ymin":1684742.580532,"xmax":-9669446.744985,"ymax":3834929.266458,"oldLayer":null},"layer1147641":{"id":"layer1147641","alpha":1,"visible":false,"timestamp":"1496937920","src":"s45","tooltip":"nombre,tipo","features":[{"type":"point","styleName":"pointstyle1147641-0","expression":"(energia='Hidráulica' and tipo='Pequeña Hidroeléctrica')","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2F2564d747e0504b9a17a3a4e334c0bc12%2FSENER%2FuploadedSymbols%2Fhidro_pequ.png","dx":-10.5,"dy":-10.5}],"has_icon":true,"xmin":-13015288.737361,"ymin":1684742.580532,"xmax":-9669446.744985,"ymax":3834929.266458,"oldLayer":null},"layer1147642":{"id":"layer1147642","alpha":1,"visible":false,"timestamp":"1496937920","src":"s47","tooltip":"nombre,tipo","features":[{"type":"point","styleName":"pointstyle1147642-0","expression":"energia='Biomasa'","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2F2564d747e0504b9a17a3a4e334c0bc12%2FSENER%2FuploadedSymbols%2Fbiomasa.png","dx":-11.5,"dy":-11.5}],"has_icon":true,"xmin":-13015288.737361,"ymin":1684742.580532,"xmax":-9669446.744985,"ymax":3834929.266458,"oldLayer":null},"layer1147106":{"id":"layer1147106","alpha":1,"visible":false,"timestamp":"1496937921","src":"s51","tooltip":"titular,voldesc,tip_desc","features":[{"type":"point","styleName":"pointstyle1147106-0","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&type=box&color=255,192,0&border=0,0,0&bw=1&size=4","dx":-3,"dy":-3}],"has_icon":true,"xmin":-13036804.913632,"ymin":0,"xmax":0,"ymax":4266733.285253,"oldLayer":null},"layer1147105":{"id":"layer1147105","alpha":1,"visible":false,"timestamp":"1496937920","src":"s53","tooltip":"titular,volextanua,uso","features":[{"type":"point","styleName":"pointstyle1147105-1","expression":"archivo='AprovSuperf'","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&type=circle&color=0,112,192&border=0,0,0&bw=1&size=4","dx":-3,"dy":-3},{"type":"point","styleName":"pointstyle1147105-0","expression":"archivo='AprovSubterr'","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&type=circle&color=255,0,0&border=0,0,0&bw=1&size=4","dx":-3,"dy":-3}],"has_icon":true,"xmin":-13852875.733042,"ymin":0,"xmax":0,"ymax":6620605.851952,"oldLayer":null},"layer1147076":{"id":"layer1147076","alpha":1,"visible":false,"timestamp":"1496937921","src":"s57","tooltip":"sitio,energia","features":[{"type":"point","styleName":"pointstyle1147076-0","expression":"energia='Nuclear'","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2F2564d747e0504b9a17a3a4e334c0bc12%2FSENER%2FuploadedSymbols%2Furanio.png","dx":-9.5,"dy":-9.5}],"has_icon":true,"xmin":-13033443.721795,"ymin":1689200.139608,"xmax":-9654916.323171,"ymax":3842686.200843,"oldLayer":null},"layer1081035":{"id":"layer1081035","alpha":0.49,"visible":false,"timestamp":"1496937919","src":"s59","tooltip":"aptt_min","features":[{"type":"polygon","styleName":"layer1081035_style3","fillcolor":"#0000FF","strokecolor":"#6E6E6E","linewidth":0,"expression":"(APTT_MIN  = 'BAJO' )","expressionLabel":"BAJO","icon":"http://editor.giscloud.com/rest/1/icons/landcover/Grass.png?color=%23006f9e&size=32"},{"type":"polygon","styleName":"layer1081035_style2","fillcolor":"#00DDFF","strokecolor":"#6E6E6E","linewidth":0,"expression":"(APTT_MIN  = 'MEDIO' )","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2Ficons%2Fdefaulticon.png","expressionLabel":"MEDIO"},{"type":"polygon","styleName":"layer1081035_style1","fillcolor":"#CFFF30","strokecolor":"#6E6E6E","linewidth":0,"expression":"(APTT_MIN  = 'ALTO' )","icon":"http://editor.giscloud.com/rest/1/icons/landcover/Grass.png?color=%23006f9e&size=32","expressionLabel":"ALTO"},{"type":"polygon","styleName":"layer1081035_style0","fillcolor":"#E60000","strokecolor":"#6E6E6E","linewidth":0,"expression":"(APTT_MIN  = 'MUY ALTO' )","expressionLabel":"MUY ALTO"}],"has_icon":true,"xmin":-13038871.682356,"ymin":1589781.719584,"xmax":-9490178.513658,"ymax":3833584.998161,"oldLayer":null},"layer1081034":{"id":"layer1081034","alpha":0.6,"visible":false,"timestamp":"1496937920","src":"s61","features":[{"type":"polygon","styleName":"layer1081034_style0","fillcolor":"#FFFF00","strokecolor":"#6E6E6E","linewidth":0}],"xmin":-12982646.416138,"ymin":1609268.14373,"xmax":-9757856.472584,"ymax":3827797.79427,"oldLayer":null},"layer1146650":{"id":"layer1146650","alpha":0.6,"visible":false,"timestamp":"1496937921","src":"s63","features":[{"type":"polygon","styleName":"layer1146650_style0","fillcolor":"#FFCCCC","strokecolor":"#FFC000","linewidth":0}],"xmin":-12982646.416138,"ymin":1735846.52658,"xmax":-9748672.882572,"ymax":3826869.098866,"oldLayer":null},"layer1081033":{"id":"layer1081033","alpha":0.6,"visible":false,"timestamp":"1496937921","src":"s65","tooltip":"titular,sust1","features":[{"type":"polygon","styleName":"layer1081033_style0","fillcolor":"#FFFFBE","strokecolor":"#FFFF00","linewidth":0}],"xmin":-12784650.448246,"ymin":1727560.866897,"xmax":-10104024.451611,"ymax":3801342.049199,"oldLayer":null},"layer1834863":{"id":"layer1834863","alpha":0.57,"visible":false,"timestamp":"1502398416","src":"s67","features":[{"type":"polygon","styleName":"layer1834863_style0","fillcolor":"#E36C09","strokecolor":"#FF0000","linewidth":0}],"xmin":-13021218.8994,"ymin":1621878.71361,"xmax":-9763275.80021,"ymax":3846928.36345,"oldLayer":null},"layer1977854":{"id":"layer1977854","alpha":1,"visible":false,"timestamp":"1501012743","src":"s71","tooltip":"name","features":[{"type":"point","styleName":"pointstyle1977854-0","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&type=circle&color=192,0,0&border=0,0,0&bw=1&size=10","dx":-6,"dy":-6}],"has_icon":true,"xmin":-11704363.029185,"ymin":1830034.168507,"xmax":-10295818.142586,"ymax":3207094.956663,"oldLayer":null},"layer1977851":{"id":"layer1977851","alpha":1,"visible":false,"timestamp":"1501012840","src":"s73","tooltip":"name","features":[{"type":"point","styleName":"pointstyle1977851-0","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&type=circle&color=255,255,0&border=0,0,0&bw=1&size=10","dx":-6,"dy":-6}],"has_icon":true,"xmin":-11704363.029185,"ymin":1830034.168507,"xmax":-10295818.142586,"ymax":3207094.956663,"oldLayer":null},"layer1977850":{"id":"layer1977850","alpha":1,"visible":false,"timestamp":"1501020172","src":"s75","tooltip":"name","features":[{"type":"point","styleName":"pointstyle1977850-0","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&type=circle&color=102,255,51&border=0,0,0&bw=1&size=10","dx":-6,"dy":-6}],"has_icon":true,"xmin":-11704363.029185,"ymin":1830034.168507,"xmax":-10295818.142586,"ymax":3207094.956663,"oldLayer":null},"layer1977856":{"id":"layer1977856","alpha":1,"visible":false,"timestamp":"1501011082","src":"s77","tooltip":"name","features":[{"type":"point","styleName":"pointstyle1977856-0","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&type=box&color=227,108,9&border=0,0,0&bw=1&size=8","dx":-5,"dy":-5}],"has_icon":true,"xmin":-13032086.291924,"ymin":1657681.849479,"xmax":-9981005.06415,"ymax":3839691.858986,"oldLayer":null},"layer1977855":{"id":"layer1977855","alpha":1,"visible":false,"timestamp":"1501011390","src":"s79","tooltip":"kml_folder,name","features":[{"type":"point","styleName":"pointstyle1977855-0","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&type=box&color=0,255,255&border=0,0,0&bw=1&size=8","dx":-5,"dy":-5}],"has_icon":true,"xmin":-13032402.884556,"ymin":1830202.967857,"xmax":-10372570.148501,"ymax":3812617.642878,"oldLayer":null},"layer1977852":{"id":"layer1977852","alpha":1,"visible":false,"timestamp":"1501019792","src":"s81","tooltip":"etiqueta","features":[{"type":"point","styleName":"pointstyle1977852-0","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=http%3A%2F%2Feditor.giscloud.com%2Frest%2F1%2Ficons%2Fplace_of_worship%2Funknown3.png%3Fcolor%3D%2523e36c09%26size%3D20","dx":-5,"dy":-5}],"has_icon":true,"xmin":-11495254.835635,"ymin":1921542.079519,"xmax":-10013681.400419,"ymax":3346630.536557,"oldLayer":null},"layer1146756":{"id":"layer1146756","alpha":1,"visible":false,"timestamp":"1503423292","src":"s83","tooltip":"well_name","features":[{"type":"point","styleName":"pointstyle1146756-0","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2F2564d747e0504b9a17a3a4e334c0bc12%2FHidrocarburos%2FuploadedSymbols%2FPozo_Azul.png","dx":-13.5,"dy":-13.5}],"has_icon":true,"xmin":-12820369.98991,"ymin":546712.30119,"xmax":-9765215.09661,"ymax":3812857.22467,"oldLayer":null},"layer1146736":{"id":"layer1146736","alpha":0.7,"visible":false,"timestamp":"1496937920","src":"s85","tooltip":"name","features":[{"type":"polygon","styleName":"layer1146736_style0","fillcolor":"#FFAA00","strokecolor":"#000000","linewidth":0}],"xmin":-11374120.401407,"ymin":1969453.938585,"xmax":-10233386.609925,"ymax":3373162.065331,"oldLayer":null},"layer1978101":{"id":"layer1978101","alpha":1,"visible":false,"timestamp":"1501023629","src":"s89","tooltip":"tipo,nomlabel","features":[{"type":"line","styleName":"layer1978101_style0","strokecolor":"#4DAF4A","linewidth":2,"expression":"tipo='Oleogasoducto'","expressionLabel":"Oleogasoducto"}],"xmin":-13052258.31081,"ymin":1625433.37804,"xmax":-9500324.67517,"ymax":3832031.21874,"oldLayer":null},"layer1978105":{"id":"layer1978105","alpha":1,"visible":false,"timestamp":"1501023681","src":"s91","tooltip":"tipo,nomlabel","features":[{"type":"line","styleName":"layer1978105_style0","strokecolor":"#FF7F00","linewidth":2,"expression":"tipo='Otro'","expressionLabel":"Otro"}],"xmin":-13052258.31081,"ymin":1625433.37804,"xmax":-9500324.67517,"ymax":3832031.21874,"oldLayer":null},"layer1977720":{"id":"layer1977720","alpha":1,"visible":false,"timestamp":"1501023709","src":"s93","tooltip":"tipo,nomlabel","features":[{"type":"line","styleName":"layer1977720_style0","strokecolor":"#984EA3","linewidth":2,"expression":"tipo='Poliducto'","expressionLabel":"Poliducto"}],"xmin":-13052258.31081,"ymin":1625433.37804,"xmax":-9500324.67517,"ymax":3832031.21874,"oldLayer":null},"layer1978104":{"id":"layer1978104","alpha":1,"visible":false,"timestamp":"1501023543","src":"s95","tooltip":"tipo,nomlabel","features":[{"type":"line","styleName":"layer1978104_style0","strokecolor":"#E41A1C","linewidth":2,"expression":"tipo='Oleoducto'","expressionLabel":"Oleoducto"}],"xmin":-13052258.31081,"ymin":1625433.37804,"xmax":-9500324.67517,"ymax":3832031.21874,"oldLayer":null},"layer1978103":{"id":"layer1978103","alpha":1,"visible":false,"timestamp":"1501023511","src":"s97","tooltip":"tipo,nomlabel","features":[{"type":"line","styleName":"layer1978103_style0","strokecolor":"#377EB8","linewidth":2,"expression":"tipo='Gasoducto'","expressionLabel":"Gasoducto"}],"xmin":-13052258.31081,"ymin":1625433.37804,"xmax":-9500324.67517,"ymax":3832031.21874,"oldLayer":null},"layer2009246":{"id":"layer2009246","alpha":1,"visible":false,"timestamp":"1503423615","src":"s101","tooltip":"well_name","features":[{"type":"point","styleName":"pointstyle2009246-0","expression":"fracking='S'","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2F2564d747e0504b9a17a3a4e334c0bc12%2FHidrocarburos%2FuploadedSymbols%2FPozo_Rojo.png","dx":-13.5,"dy":-13.5}],"has_icon":true,"xmin":-12820369.98991,"ymin":546712.30119,"xmax":-9765215.09661,"ymax":3812857.22467,"oldLayer":null},"layer1146763":{"id":"layer1146763","alpha":0.59,"visible":false,"timestamp":"1496937921","src":"s103","tooltip":"tipo,cuenca","features":[{"type":"polygon","styleName":"layer1146763_style3","fillcolor":"#FFFF73","strokecolor":"#6E6E6E","linewidth":0,"expression":"(Tipo  = 'Gas seco' )","expressionLabel":"Gas seco"},{"type":"polygon","styleName":"layer1146763_style2","fillcolor":"#AB7D5C","strokecolor":"#6E6E6E","linewidth":0,"expression":"(Tipo  = 'Gas húmedo y condensado' )","expressionLabel":"Gas húmedo y condensado"},{"type":"polygon","styleName":"layer1146763_style1","fillcolor":"#E69800","strokecolor":"#FFAA00","linewidth":0,"expression":"(Tipo  = 'En estudio' )","expressionLabel":"En estudio"},{"type":"polygon","styleName":"layer1146763_style0","fillcolor":"#38A800","strokecolor":"#6E6E6E","linewidth":0,"expression":"(Tipo  = 'Aceite' )","expressionLabel":"Aceite"}],"xmin":-12113280.79112,"ymin":1956837.428564,"xmax":-10492929.84784,"ymax":3729277.006427,"oldLayer":null},"layer1147000":{"id":"layer1147000","alpha":0.7,"visible":false,"timestamp":"1496937921","src":"s105","tooltip":"id_area","features":[{"type":"polygon","styleName":"layer1147000_style3","fillcolor":"#73004C","strokecolor":"#730026","linewidth":0,"expression":"(RONDA  = 'Ronda 4'  AND TIPO  = 'Exploración' )","expressionLabel":"Ronda 4, Exploración"},{"type":"polygon","styleName":"layer1147000_style2","fillcolor":"#445C89","strokecolor":"#4C0073","linewidth":0,"expression":"(RONDA  = 'Ronda 3'  AND TIPO  = 'Exploración' AND area='No convencional')","expressionLabel":"Ronda 3, Exploración"},{"type":"polygon","styleName":"layer1147000_style1","fillcolor":"#E36C09","strokecolor":"#953734","linewidth":0,"expression":"(RONDA  = 'Ronda 2'  AND TIPO  = 'Exploración' AND area='No convencional')","expressionLabel":"Ronda 2, Exploración"},{"type":"polygon","styleName":"layer1147000_style0","fillcolor":"#00FFAA","strokecolor":"#00FF55","linewidth":0,"expression":"(RONDA  = 'Ronda 1'  AND TIPO  = 'Exploración' AND area='No convencional')","expressionLabel":"Ronda 1, Exploración"}],"xmin":-11210800.385269,"ymin":1885097.454965,"xmax":-10211707.955399,"ymax":3375646.034919,"oldLayer":null},"layer1146757":{"id":"layer1146757","alpha":1,"visible":false,"timestamp":"1496937921","src":"s107","tooltip":"pozo","features":[{"type":"point","styleName":"pointstyle1146757-0","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2F2564d747e0504b9a17a3a4e334c0bc12%2FHidrocarburos%2FuploadedSymbols%2FPozo_Rojo.png","dx":-13.5,"dy":-13.5}],"has_icon":true,"xmin":-11363259.615576,"ymin":2024995.888328,"xmax":-10284659.25419,"ymax":3351664.228914,"oldLayer":null},"layer1146735":{"id":"layer1146735","alpha":0.6,"visible":false,"timestamp":"1496937921","src":"s109","features":[{"type":"polygon","styleName":"layer1146735_style0","fillcolor":"#FF0000","strokecolor":"#FFC000","linewidth":0}],"xmin":-11368700.671911,"ymin":2019698.556224,"xmax":-10279565.167932,"ymax":3357274.19352,"oldLayer":null},"layer1909370":{"id":"layer1909370","alpha":0.77,"visible":false,"timestamp":"1496937920","src":"s113","tooltip":"sector,clave_bloq","features":[{"type":"polygon","styleName":"layer1909370_style3","fillcolor":"#E36C09","strokecolor":"#0C0C0C","linewidth":0,"expression":"categoria='TERRESTRE NO CONVENCIONAL'","expressionLabel":"Terrestre no convencional"},{"type":"polygon","styleName":"layer1909370_style2","fillcolor":"#FBD5B5","strokecolor":"#0C0C0C","linewidth":0,"expression":"categoria='TERRESTRE CONVENCIONAL'","expressionLabel":"Terrestre convencional"},{"type":"polygon","styleName":"layer1909370_style1","fillcolor":"#B8CCE4","strokecolor":"#0C0C0C","linewidth":0,"expression":"categoria='AGUAS SOMERAS'","expressionLabel":"Aguas someras"},{"type":"polygon","styleName":"layer1909370_style0","fillcolor":"#4BACC6","strokecolor":"#0C0C0C","linewidth":0,"expression":"categoria='AGUAS PROFUNDAS'","expressionLabel":"Aguas profundas"}],"xmin":-11230408.264838,"ymin":1927204.311062,"xmax":-10192459.866949,"ymax":3404216.763483,"oldLayer":null},"layer1909382":{"id":"layer1909382","alpha":0.7,"visible":false,"timestamp":"1495736692","src":"s115","tooltip":"lici_ganad","features":[{"type":"polygon","styleName":"layer1909382_style0","fillcolor":"#FFCC00","strokecolor":"#FF0000","linewidth":0}],"xmin":-11054025.435772,"ymin":1965493.324828,"xmax":-10226550.554246,"ymax":3002177.630126,"oldLayer":null},"layer1909371":{"id":"layer1909371","alpha":0.7,"visible":false,"timestamp":"1495735845","src":"s117","tooltip":"region","features":[{"type":"polygon","styleName":"layer1909371_style7","fillcolor":"#336600","strokecolor":"#0C0C0C","linewidth":0,"expression":"region='Áreas terrestres'","expressionLabel":"'Áreas terrestres"},{"type":"polygon","styleName":"layer1909371_style6","fillcolor":"#FF0033","strokecolor":"#0C0C0C","linewidth":0,"expression":"region='Áreas de resguardo'","expressionLabel":"Áreas de resguardo"},{"type":"polygon","styleName":"layer1909371_style5","fillcolor":"#3333CC","strokecolor":"#0C0C0C","linewidth":0,"expression":"region='Terrestre convencional'","expressionLabel":"Terrestre convencional"},{"type":"polygon","styleName":"layer1909371_style4","fillcolor":"#CC00FF","strokecolor":"#0C0C0C","linewidth":0,"expression":"region='No convencionales'","expressionLabel":"No convencionales"},{"type":"polygon","styleName":"layer1909371_style3","fillcolor":"#CC9900","strokecolor":"#0C0C0C","linewidth":0,"expression":"region='Gas no asociado'","expressionLabel":"Gas no asociado"},{"type":"polygon","styleName":"layer1909371_style2","fillcolor":"#33CCFF","strokecolor":"#0C0C0C","linewidth":0,"expression":"region='Chicontepec'","expressionLabel":"Chicontepec"},{"type":"polygon","styleName":"layer1909371_style1","fillcolor":"#66FF66","strokecolor":"#0C0C0C","linewidth":0,"expression":"region='Aguas someras'","expressionLabel":"Aguas someras"},{"type":"polygon","styleName":"layer1909371_style0","fillcolor":"#990033","strokecolor":"#0C0C0C","linewidth":0,"expression":"region='Aguas profundas'","expressionLabel":"Aguas profundas"}],"xmin":-11327685.850639,"ymin":1967437.531395,"xmax":-10204286.656087,"ymax":3312159.859818,"oldLayer":null},"layer1081042":{"id":"layer1081042","alpha":0.6,"visible":false,"timestamp":"1498751279","src":"s121","tooltip":"nombre","features":[{"type":"polygon","styleName":"layer1081042_style0","fillcolor":"#92D050","strokecolor":"#267300","linewidth":0}],"xmin":-13206318.3487,"ymin":1342135.01701,"xmax":-9506376.36673,"ymax":3826924.20247,"oldLayer":null},"layer1146635":{"id":"layer1146635","alpha":0.6,"visible":false,"timestamp":"1501006113","src":"s123","tooltip":"nom_anp","features":[{"type":"polygon","styleName":"layer1146635_style0","fillcolor":"#D3FFBE","strokecolor":"#55FF00","linewidth":0}],"xmin":-12354832.49333,"ymin":1634509.6165,"xmax":-9654305.13684,"ymax":3410914.84801,"oldLayer":null},"layer1977779":{"id":"layer1977779","alpha":0.6,"visible":false,"timestamp":"1501006341","src":"s125","tooltip":"nom_anp","features":[{"type":"polygon","styleName":"layer1977779_style0","fillcolor":"#FFFF00","strokecolor":"#66FF33","linewidth":0}],"xmin":-12282917.55283,"ymin":1670113.60327,"xmax":-9817641.7935,"ymax":3054514.24876,"oldLayer":null},"layer1081039":{"id":"layer1081039","alpha":0.6,"visible":false,"timestamp":"1496937920","src":"s129","tooltip":"nombre","features":[{"type":"polygon","styleName":"layer1081039_style0","fillcolor":"#A87000","strokecolor":"#9C9C9C","linewidth":0}],"xmin":-13025422.960064,"ymin":1666141.317378,"xmax":-9661071.942045,"ymax":3841346.152174,"oldLayer":null},"layer1081040":{"id":"layer1081040","alpha":0.6,"visible":false,"timestamp":"1496937920","src":"s131","tooltip":"nombre","features":[{"type":"polygon","styleName":"layer1081040_style0","fillcolor":"#A3FF73","strokecolor":"#38A8E1","linewidth":0}],"xmin":-13182600.155559,"ymin":1659076.099681,"xmax":-9652217.946921,"ymax":3848590.244831,"oldLayer":null},"layer1081038":{"id":"layer1081038","alpha":0.6,"visible":false,"timestamp":"1496937921","src":"s133","tooltip":"nombre","features":[{"type":"polygon","styleName":"layer1081038_style0","fillcolor":"#73B2FF","strokecolor":"#005CE6","linewidth":0}],"xmin":-12954201.715725,"ymin":1635876.76405,"xmax":-9617364.257567,"ymax":3858051.075848,"oldLayer":null},"layer1081037":{"id":"layer1081037","alpha":0.34,"visible":false,"timestamp":"1496937920","src":"s137","tooltip":"tiponucleo,nombrenucl","features":[{"type":"polygon","styleName":"layer1081037_style0","fillcolor":"#FFFF73","strokecolor":"#343434","linewidth":0}],"xmin":-13036332.675,"ymin":1591055.914244,"xmax":-9501541.07778,"ymax":3833731.269397,"oldLayer":null},"layer1081293":{"id":"layer1081293","alpha":0.6,"visible":false,"timestamp":"1496937919","src":"s139","tooltip":"lengua","features":[{"type":"polygon","styleName":"layer1081293_style60","fillcolor":"#E6842E","strokecolor":"#9B5213","linewidth":0,"expression":"lengua='Zoque'"},{"type":"polygon","styleName":"layer1081293_style59","fillcolor":"#2E34E6","strokecolor":"#13179B","linewidth":0,"expression":"lengua='Zapoteco'"},{"type":"polygon","styleName":"layer1081293_style58","fillcolor":"#E6562E","strokecolor":"#9B3013","linewidth":0,"expression":"lengua='Yaqui'"},{"type":"polygon","styleName":"layer1081293_style57","fillcolor":"#8DE62E","strokecolor":"#599B13","linewidth":0,"expression":"lengua='Tzotzil'"},{"type":"polygon","styleName":"layer1081293_style56","fillcolor":"#2EE6C7","strokecolor":"#139B85","linewidth":0,"expression":"lengua='Tzeltal'"},{"type":"polygon","styleName":"layer1081293_style55","fillcolor":"#E62E90","strokecolor":"#9B135C","linewidth":0,"expression":"lengua='Triqui'"},{"type":"polygon","styleName":"layer1081293_style54","fillcolor":"#E6372E","strokecolor":"#9B1913","linewidth":0,"expression":"lengua='Totonaca'"},{"type":"polygon","styleName":"layer1081293_style53","fillcolor":"#D1E62E","strokecolor":"#8B9B13","linewidth":0,"expression":"lengua='Tojolabal'"},{"type":"polygon","styleName":"layer1081293_style52","fillcolor":"#31E62E","strokecolor":"#159B13","linewidth":0,"expression":"lengua='Tlapaneco'"},{"type":"polygon","styleName":"layer1081293_style51","fillcolor":"#E6A92E","strokecolor":"#9B6E13","linewidth":0,"expression":"lengua='Tepehuán'"},{"type":"polygon","styleName":"layer1081293_style50","fillcolor":"#E6992E","strokecolor":"#9B6213","linewidth":0,"expression":"lengua='Tepehua'"},{"type":"polygon","styleName":"layer1081293_style49","fillcolor":"#2E2EE6","strokecolor":"#13139B","linewidth":0,"expression":"lengua='Tarahumara'"},{"type":"polygon","styleName":"layer1081293_style48","fillcolor":"#E6652E","strokecolor":"#9B3C13","linewidth":0,"expression":"lengua='Seri'"},{"type":"polygon","styleName":"layer1081293_style47","fillcolor":"#E62EB5","strokecolor":"#9B1377","linewidth":0,"expression":"lengua='Quiché'"},{"type":"polygon","styleName":"layer1081293_style46","fillcolor":"#2EE637","strokecolor":"#139B19","linewidth":0,"expression":"lengua='Purépecha'"},{"type":"polygon","styleName":"layer1081293_style45","fillcolor":"#E62E3A","strokecolor":"#9B131C","linewidth":0,"expression":"lengua='Popoluca'"},{"type":"polygon","styleName":"layer1081293_style44","fillcolor":"#E6A32E","strokecolor":"#9B6913","linewidth":0,"expression":"lengua='Popoloca'"},{"type":"polygon","styleName":"layer1081293_style43","fillcolor":"#2EE6C4","strokecolor":"#139B82","linewidth":0,"expression":"lengua='Pima'"},{"type":"polygon","styleName":"layer1081293_style42","fillcolor":"#E62E47","strokecolor":"#9B1325","linewidth":0,"expression":"lengua='Pame'"},{"type":"polygon","styleName":"layer1081293_style41","fillcolor":"#E62E56","strokecolor":"#9B1330","linewidth":0,"expression":"lengua='Paipai'"},{"type":"polygon","styleName":"layer1081293_style40","fillcolor":"#E65C2E","strokecolor":"#9B3513","linewidth":0,"expression":"lengua='Otomí'"},{"type":"polygon","styleName":"layer1081293_style39","fillcolor":"#2E71E6","strokecolor":"#13459B","linewidth":0,"expression":"lengua='Náhuatl de Michoacan'"},{"type":"polygon","styleName":"layer1081293_style38","fillcolor":"#2EE696","strokecolor":"#139B60","linewidth":0,"expression":"lengua='Náhuatl de Durango'"},{"type":"polygon","styleName":"layer1081293_style37","fillcolor":"#2EE662","strokecolor":"#139B39","linewidth":0,"expression":"lengua='Náhuatl Zongolica - Pico de Orizaba'"},{"type":"polygon","styleName":"layer1081293_style36","fillcolor":"#E62ECA","strokecolor":"#9B1387","linewidth":0,"expression":"lengua='Náhuatl SLP, SNP, NVER'"},{"type":"polygon","styleName":"layer1081293_style35","fillcolor":"#2EE6B2","strokecolor":"#139B75","linewidth":0,"expression":"lengua='Náhuatl GRO, Altiplano, EDOMEX, OAX'"},{"type":"polygon","styleName":"layer1081293_style34","fillcolor":"#2EE6B5","strokecolor":"#139B77","linewidth":0,"expression":"lengua='Náhuatl  del Sur  de Veracruz'"},{"type":"polygon","styleName":"layer1081293_style33","fillcolor":"#A92EE6","strokecolor":"#6E139B","linewidth":0,"expression":"lengua='Mixteco de la Mixteca Alta'"},{"type":"polygon","styleName":"layer1081293_style32","fillcolor":"#84E62E","strokecolor":"#529B13","linewidth":0,"expression":"lengua='Mixteco'"},{"type":"polygon","styleName":"layer1081293_style31","fillcolor":"#84E62E","strokecolor":"#529B13","linewidth":0,"expression":"lengua='Mixe'"},{"type":"polygon","styleName":"layer1081293_style30","fillcolor":"#62E62E","strokecolor":"#399B13","linewidth":0,"expression":"lengua='Mazateco'"},{"type":"polygon","styleName":"layer1081293_style29","fillcolor":"#2E9FE6","strokecolor":"#13679B","linewidth":0,"expression":"lengua='Mazahua'"},{"type":"polygon","styleName":"layer1081293_style28","fillcolor":"#622EE6","strokecolor":"#39139B","linewidth":0,"expression":"lengua='Mayo'"},{"type":"polygon","styleName":"layer1081293_style27","fillcolor":"#E6592E","strokecolor":"#9B3313","linewidth":0,"expression":"lengua='Maya Lacandón'"},{"type":"polygon","styleName":"layer1081293_style26","fillcolor":"#E6932E","strokecolor":"#9B5E13","linewidth":0,"expression":"lengua='Maya'"},{"type":"polygon","styleName":"layer1081293_style25","fillcolor":"#2EB2E6","strokecolor":"#13759B","linewidth":0,"expression":"lengua='Matlatzinca'"},{"type":"polygon","styleName":"layer1081293_style24","fillcolor":"#2EE65F","strokecolor":"#139B37","linewidth":0,"expression":"lengua='Mame'"},{"type":"polygon","styleName":"layer1081293_style23","fillcolor":"#E62EAC","strokecolor":"#9B1370","linewidth":0,"expression":"lengua='Kumiai'"},{"type":"polygon","styleName":"layer1081293_style22","fillcolor":"#E62EE6","strokecolor":"#9B139B","linewidth":0,"expression":"lengua='Kiliwa'"},{"type":"polygon","styleName":"layer1081293_style21","fillcolor":"#2EAFE6","strokecolor":"#13729B","linewidth":0,"expression":"lengua='Kikapu'"},{"type":"polygon","styleName":"layer1081293_style20","fillcolor":"#56E62E","strokecolor":"#309B13","linewidth":0,"expression":"lengua='Kekchi'"},{"type":"polygon","styleName":"layer1081293_style19","fillcolor":"#E6AF2E","strokecolor":"#9B7213","linewidth":0,"expression":"lengua='Kanjobal'"},{"type":"polygon","styleName":"layer1081293_style18","fillcolor":"#2EA3E6","strokecolor":"#13699B","linewidth":0,"expression":"lengua='Jacalteco'"},{"type":"polygon","styleName":"layer1081293_style17","fillcolor":"#E64D2E","strokecolor":"#9B2913","linewidth":0,"expression":"lengua='Huichol'"},{"type":"polygon","styleName":"layer1081293_style16","fillcolor":"#7EE62E","strokecolor":"#4E9B13","linewidth":0,"expression":"lengua='Huave'"},{"type":"polygon","styleName":"layer1081293_style15","fillcolor":"#2EE3E6","strokecolor":"#13999B","linewidth":0,"expression":"lengua='Huasteco'"},{"type":"polygon","styleName":"layer1081293_style14","fillcolor":"#E62ED4","strokecolor":"#9B138E","linewidth":0,"expression":"lengua='Guarijio'"},{"type":"polygon","styleName":"layer1081293_style13","fillcolor":"#E66E2E","strokecolor":"#9B4213","linewidth":0,"expression":"lengua='Cuicateco'"},{"type":"polygon","styleName":"layer1081293_style12","fillcolor":"#E62E53","strokecolor":"#9B132E","linewidth":0,"expression":"lengua='Cucapa'"},{"type":"polygon","styleName":"layer1081293_style11","fillcolor":"#E62E6B","strokecolor":"#9B1340","linewidth":0,"expression":"lengua='Cora'"},{"type":"polygon","styleName":"layer1081293_style10","fillcolor":"#2E71E6","strokecolor":"#13459B","linewidth":0,"expression":"lengua='Cochimi'"},{"type":"polygon","styleName":"layer1081293_style9","fillcolor":"#E6902E","strokecolor":"#9B5C13","linewidth":0,"expression":"lengua='Chuj - Kanjobal'"},{"type":"polygon","styleName":"layer1081293_style8","fillcolor":"#2EE67E","strokecolor":"#139B4E","linewidth":0,"expression":"lengua='Chuj'"},{"type":"polygon","styleName":"layer1081293_style7","fillcolor":"#E6CA2E","strokecolor":"#9B8713","linewidth":0,"expression":"lengua='Chontal de Tabasco'"},{"type":"polygon","styleName":"layer1081293_style6","fillcolor":"#2E93E6","strokecolor":"#135E9B","linewidth":0,"expression":"lengua='Chontal de Oaxaca'"},{"type":"polygon","styleName":"layer1081293_style5","fillcolor":"#E62EAF","strokecolor":"#9B1372","linewidth":0,"expression":"lengua='Chol'"},{"type":"polygon","styleName":"layer1081293_style4","fillcolor":"#2EE63A","strokecolor":"#139B1C","linewidth":0,"expression":"lengua='Chocho'"},{"type":"polygon","styleName":"layer1081293_style3","fillcolor":"#E6A62E","strokecolor":"#9B6C13","linewidth":0,"expression":"lengua='Chinanteco'"},{"type":"polygon","styleName":"layer1081293_style2","fillcolor":"#C7E62E","strokecolor":"#859B13","linewidth":0,"expression":"lengua='Chichimeca Jonaz'"},{"type":"polygon","styleName":"layer1081293_style1","fillcolor":"#E62ECD","strokecolor":"#9B1389","linewidth":0,"expression":"lengua='Chatino'"},{"type":"polygon","styleName":"layer1081293_style0","fillcolor":"#E62EA6","strokecolor":"#9B136C","linewidth":0,"expression":"lengua='Amuzgo'"}],"xmin":-12993100.960609,"ymin":1702557.888457,"xmax":-9517394.381358,"ymax":3795050.141621,"oldLayer":null},"layer1081291":{"id":"layer1081291","alpha":1,"visible":true,"timestamp":"1441047764","src":"s141","features":[{"type":"polygon","styleName":"layer1081291_style0","strokecolor":"#FFFFFF","linewidth":0}],"xmin":-13181079.254032,"ymin":1635334.466414,"xmax":-9652558.161141,"ymax":3858019.19792,"oldLayer":null},"layer1081292":{"id":"layer1081292","alpha":1,"visible":false,"timestamp":"1440954830","src":"s143","tooltip":"nom_mun","features":[{"type":"polygon","styleName":"layer1081292_style0","strokecolor":"#FFFF00","linewidth":0}],"xmin":-13181079.254032,"ymin":1635334.466414,"xmax":-9652558.161141,"ymax":3858019.19792,"oldLayer":null},"layer1929948":{"id":"layer1929948","alpha":1,"visible":false,"src":"s145","timestamp":"1496937919","features":[],"xmin":-20037508.3427892,"ymin":-20037508.3427892,"xmax":20037508.3427892,"ymax":20037508.3427892,"oldLayer":null},"layer1083148":{"id":"layer1083148","alpha":1,"visible":false,"src":"s147","timestamp":"1434850410","features":[],"xmin":-20037508.3427892,"ymin":-20037508.3427892,"xmax":20037508.3427892,"ymax":20037508.3427892,"oldLayer":null},"layer1083149":{"id":"layer1083149","alpha":1,"visible":false,"src":"s149","timestamp":"1434850466","features":[],"xmin":-20037508.3427892,"ymin":-20037508.3427892,"xmax":20037508.3427892,"ymax":20037508.3427892,"oldLayer":null},"layer1081120":{"id":"layer1081120","alpha":1,"visible":true,"src":"s151","timestamp":"1434647513","features":[],"xmin":-20037508.3427892,"ymin":-20037508.3427892,"xmax":20037508.3427892,"ymax":20037508.3427892,"oldLayer":null},"llayer1081034":{"id":"llayer1081034","alpha":1,"visible":false,"timestamp":"1496937920","src":"s61","features":[{"type":"label","styleName":"label_text_style1081034_0","outline":"0xFFFFFF","fontname":"Arial Black","fontsize":12,"color":"0xFF0000","anchor":"B"}],"xmin":-12982646.416138,"ymin":1609268.14373,"xmax":-9757856.472584,"ymax":3827797.79427,"oldLayer":null},"llayer1146650":{"id":"llayer1146650","alpha":1,"visible":false,"timestamp":"1496937921","src":"s63","features":[{"type":"label","styleName":"label_text_style1146650_0","outline":"0xFFFFFF","fontname":"Arial Black","fontsize":12,"color":"0xE36C09"}],"xmin":-12982646.416138,"ymin":1735846.52658,"xmax":-9748672.882572,"ymax":3826869.098866,"oldLayer":null},"llayer1081292":{"id":"llayer1081292","alpha":1,"visible":false,"timestamp":"1440954830","src":"s143","features":[{"type":"label","styleName":"label_text_style1081292_0","outline":"0xFFFFFF","fontname":"Arial Black","fontsize":12,"color":"0x000000","anchor":"B"}],"xmin":-13181079.254032,"ymin":1635334.466414,"xmax":-9652558.161141,"ymax":3858019.19792,"oldLayer":null},"layer2097562":{"id":"layer2097562","alpha":0.3,"visible":true,"timestamp":"1509032678","src":"s3","features":[{"type":"polygon","styleName":"layer2097562_style0","fillcolor":"#00B050","strokecolor":"#000000","linewidth":0,"icon":"http://editor.giscloud.com/rest/1/icons/landcover/Grass.png?color=%23006f9e&size=32","expression":"tipo_de__n='Aprovechamiento de Recursos Forestales Maderables' OR tipo_de__n='Aprovechamiento de Recursos Forestales Maderables Unificado' OR tipo_de__n='Modificaciones de Aprovechamiento Forestal Maderable' OR tipo_de__n='Refrendo de Aprovechamiento Forestal Maderable'","expressionLabel":"Aprovechamiento de Recursos Forestales Maderables"}],"has_icon":false,"xmin":-13037205.31871,"ymin":1638295.69674,"xmax":-9659828.8523,"ymax":3847482.98071,"oldLayer":null},"llayer1036216":{"id":"llayer1036216","alpha":1,"visible":true,"timestamp":"1513566744","src":"s1","features":[{"type":"label","styleName":"label_text_style1036216_0","outline":"0xFFFFFF","fontname":"Arial","fontsize":12,"color":"0x000000","anchor":"B"}],"xmin":-8879130.90315,"ymin":4935561.06357,"xmax":-7990233.74854,"ymax":5624019.45148,"oldLayer":null},"layer1036216":{"id":"layer1036216","alpha":0.74,"visible":true,"timestamp":"1513566744","src":"s1","features":[{"type":"polygon","styleName":"layer1036216_style0","fillcolor":"#C3E6B3","strokecolor":"#B9FF99","linewidth":0,"icon":"http://editor.giscloud.com/rest/1/icons/landusing/Rice.png?color=%23006f9e&size=32","expressionLabel":""}],"has_icon":true,"xmin":-8879130.90315,"ymin":4935561.06357,"xmax":-7990233.74854,"ymax":5624019.45148,"oldLayer":null},"layer10362161":{"id":"layer1036216","alpha":0.77,"visible":true,"timestamp":"1325168292","src":"s1","features":[{"type":"polygon","styleName":"layer1036216_style61","fillcolor":"#CC7066","strokecolor":"#CC1400","linewidth":0,"expression":"COUNTYFP10='099'"},{"type":"polygon","styleName":"layer1036216_style60","fillcolor":"#CC6666","strokecolor":"#CC0000","linewidth":0,"expression":"COUNTYFP10='033'"},{"type":"polygon","styleName":"layer1036216_style59","fillcolor":"#CC6670","strokecolor":"#CC0014","linewidth":0,"expression":"COUNTYFP10='097'"},{"type":"polygon","styleName":"layer1036216_style58","fillcolor":"#CC667A","strokecolor":"#CC0029","linewidth":0,"expression":"COUNTYFP10='019'"},{"type":"polygon","styleName":"layer1036216_style57","fillcolor":"#CC6685","strokecolor":"#CC003D","linewidth":0,"expression":"COUNTYFP10='081'"},{"type":"polygon","styleName":"layer1036216_style56","fillcolor":"#CC668F","strokecolor":"#CC0052","linewidth":0,"expression":"COUNTYFP10='053'"},{"type":"polygon","styleName":"layer1036216_style55","fillcolor":"#CC6699","strokecolor":"#CC0066","linewidth":0,"expression":"COUNTYFP10='079'"},{"type":"polygon","styleName":"layer1036216_style54","fillcolor":"#CC66A3","strokecolor":"#CC007A","linewidth":0,"expression":"COUNTYFP10='029'"},{"type":"polygon","styleName":"layer1036216_style53","fillcolor":"#CC66AD","strokecolor":"#CC008F","linewidth":0,"expression":"COUNTYFP10='027'"},{"type":"polygon","styleName":"layer1036216_style52","fillcolor":"#CC66B8","strokecolor":"#CC00A3","linewidth":0,"expression":"COUNTYFP10='035'"},{"type":"polygon","styleName":"layer1036216_style51","fillcolor":"#CC66C2","strokecolor":"#CC00B8","linewidth":0,"expression":"COUNTYFP10='041'"},{"type":"polygon","styleName":"layer1036216_style50","fillcolor":"#CC66CC","strokecolor":"#CC00CC","linewidth":0,"expression":"COUNTYFP10='059'"},{"type":"polygon","styleName":"layer1036216_style49","fillcolor":"#C266CC","strokecolor":"#B800CC","linewidth":0,"expression":"COUNTYFP10='021'"},{"type":"polygon","styleName":"layer1036216_style48","fillcolor":"#B866CC","strokecolor":"#A300CC","linewidth":0,"expression":"COUNTYFP10='051'"},{"type":"polygon","styleName":"layer1036216_style47","fillcolor":"#AD66CC","strokecolor":"#8F00CC","linewidth":0,"expression":"COUNTYFP10='009'"},{"type":"polygon","styleName":"layer1036216_style46","fillcolor":"#A366CC","strokecolor":"#7A00CC","linewidth":0,"expression":"COUNTYFP10='031'"},{"type":"polygon","styleName":"layer1036216_style45","fillcolor":"#9966CC","strokecolor":"#6600CC","linewidth":0,"expression":"COUNTYFP10='015'"},{"type":"polygon","styleName":"layer1036216_style44","fillcolor":"#8F66CC","strokecolor":"#5200CC","linewidth":0,"expression":"COUNTYFP10='091'"},{"type":"polygon","styleName":"layer1036216_style43","fillcolor":"#8566CC","strokecolor":"#3D00CC","linewidth":0,"expression":"COUNTYFP10='119'"},{"type":"polygon","styleName":"layer1036216_style42","fillcolor":"#7A66CC","strokecolor":"#2900CC","linewidth":0,"expression":"COUNTYFP10='067'"},{"type":"polygon","styleName":"layer1036216_style41","fillcolor":"#7066CC","strokecolor":"#1400CC","linewidth":0,"expression":"COUNTYFP10='123'"},{"type":"polygon","styleName":"layer1036216_style40","fillcolor":"#6666CC","strokecolor":"#0000CC","linewidth":0,"expression":"COUNTYFP10='013'"},{"type":"polygon","styleName":"layer1036216_style39","fillcolor":"#6670CC","strokecolor":"#0014CC","linewidth":0,"expression":"COUNTYFP10='085'"},{"type":"polygon","styleName":"layer1036216_style38","fillcolor":"#667ACC","strokecolor":"#0029CC","linewidth":0,"expression":"COUNTYFP10='109'"},{"type":"polygon","styleName":"layer1036216_style37","fillcolor":"#6685CC","strokecolor":"#003DCC","linewidth":0,"expression":"COUNTYFP10='005'"},{"type":"polygon","styleName":"layer1036216_style36","fillcolor":"#668FCC","strokecolor":"#0052CC","linewidth":0,"expression":"COUNTYFP10='121'"},{"type":"polygon","styleName":"layer1036216_style35","fillcolor":"#6699CC","strokecolor":"#0066CC","linewidth":0,"expression":"COUNTYFP10='075'"},{"type":"polygon","styleName":"layer1036216_style34","fillcolor":"#66A3CC","strokecolor":"#007ACC","linewidth":0,"expression":"COUNTYFP10='055'"},{"type":"polygon","styleName":"layer1036216_style33","fillcolor":"#66ADCC","strokecolor":"#008FCC","linewidth":0,"expression":"COUNTYFP10='049'"},{"type":"polygon","styleName":"layer1036216_style32","fillcolor":"#66B8CC","strokecolor":"#00A3CC","linewidth":0,"expression":"COUNTYFP10='105'"},{"type":"polygon","styleName":"layer1036216_style31","fillcolor":"#66C2CC","strokecolor":"#00B8CC","linewidth":0,"expression":"COUNTYFP10='045'"},{"type":"polygon","styleName":"layer1036216_style30","fillcolor":"#66CCCC","strokecolor":"#00CCCC","linewidth":0,"expression":"COUNTYFP10='087'"},{"type":"polygon","styleName":"layer1036216_style29","fillcolor":"#66CCC2","strokecolor":"#00CCB8","linewidth":0,"expression":"COUNTYFP10='077'"},{"type":"polygon","styleName":"layer1036216_style28","fillcolor":"#66CCB8","strokecolor":"#00CCA3","linewidth":0,"expression":"COUNTYFP10='117'"},{"type":"polygon","styleName":"layer1036216_style27","fillcolor":"#66CCAD","strokecolor":"#00CC8F","linewidth":0,"expression":"COUNTYFP10='061'"},{"type":"polygon","styleName":"layer1036216_style26","fillcolor":"#66CCA3","strokecolor":"#00CC7A","linewidth":0,"expression":"COUNTYFP10='115'"},{"type":"polygon","styleName":"layer1036216_style25","fillcolor":"#66CC99","strokecolor":"#00CC66","linewidth":0,"expression":"COUNTYFP10='003'"},{"type":"polygon","styleName":"layer1036216_style24","fillcolor":"#66CC8F","strokecolor":"#00CC52","linewidth":0,"expression":"COUNTYFP10='103'"},{"type":"polygon","styleName":"layer1036216_style23","fillcolor":"#66CC85","strokecolor":"#00CC3D","linewidth":0,"expression":"COUNTYFP10='011'"},{"type":"polygon","styleName":"layer1036216_style22","fillcolor":"#66CC7A","strokecolor":"#00CC29","linewidth":0,"expression":"COUNTYFP10='023'"},{"type":"polygon","styleName":"layer1036216_style21","fillcolor":"#66CC70","strokecolor":"#00CC14","linewidth":0,"expression":"COUNTYFP10='043'"},{"type":"polygon","styleName":"layer1036216_style20","fillcolor":"#66CC66","strokecolor":"#00CC00","linewidth":0,"expression":"COUNTYFP10='093'"},{"type":"polygon","styleName":"layer1036216_style19","fillcolor":"#70CC66","strokecolor":"#14CC00","linewidth":0,"expression":"COUNTYFP10='095'"},{"type":"polygon","styleName":"layer1036216_style18","fillcolor":"#7ACC66","strokecolor":"#29CC00","linewidth":0,"expression":"COUNTYFP10='057'"},{"type":"polygon","styleName":"layer1036216_style17","fillcolor":"#85CC66","strokecolor":"#3DCC00","linewidth":0,"expression":"COUNTYFP10='065'"},{"type":"polygon","styleName":"layer1036216_style16","fillcolor":"#8FCC66","strokecolor":"#52CC00","linewidth":0,"expression":"COUNTYFP10='073'"},{"type":"polygon","styleName":"layer1036216_style15","fillcolor":"#99CC66","strokecolor":"#66CC00","linewidth":0,"expression":"COUNTYFP10='069'"},{"type":"polygon","styleName":"layer1036216_style14","fillcolor":"#A3CC66","strokecolor":"#7ACC00","linewidth":0,"expression":"COUNTYFP10='025'"},{"type":"polygon","styleName":"layer1036216_style13","fillcolor":"#ADCC66","strokecolor":"#8FCC00","linewidth":0,"expression":"COUNTYFP10='101'"},{"type":"polygon","styleName":"layer1036216_style12","fillcolor":"#B8CC66","strokecolor":"#A3CC00","linewidth":0,"expression":"COUNTYFP10='071'"},{"type":"polygon","styleName":"layer1036216_style11","fillcolor":"#C2CC66","strokecolor":"#B8CC00","linewidth":0,"expression":"COUNTYFP10='039'"},{"type":"polygon","styleName":"layer1036216_style10","fillcolor":"#CCCC66","strokecolor":"#CCCC00","linewidth":0,"expression":"COUNTYFP10='001'"},{"type":"polygon","styleName":"layer1036216_style9","fillcolor":"#CCC266","strokecolor":"#CCB800","linewidth":0,"expression":"COUNTYFP10='111'"},{"type":"polygon","styleName":"layer1036216_style8","fillcolor":"#CCB866","strokecolor":"#CCA300","linewidth":0,"expression":"COUNTYFP10='107'"},{"type":"polygon","styleName":"layer1036216_style7","fillcolor":"#CCAD66","strokecolor":"#CC8F00","linewidth":0,"expression":"COUNTYFP10='047'"},{"type":"polygon","styleName":"layer1036216_style6","fillcolor":"#CCA366","strokecolor":"#CC7A00","linewidth":0,"expression":"COUNTYFP10='017'"},{"type":"polygon","styleName":"layer1036216_style5","fillcolor":"#CC9966","strokecolor":"#CC6600","linewidth":0,"expression":"COUNTYFP10='037'"},{"type":"polygon","styleName":"layer1036216_style4","fillcolor":"#CC8F66","strokecolor":"#CC5200","linewidth":0,"expression":"COUNTYFP10='089'"},{"type":"polygon","styleName":"layer1036216_style3","fillcolor":"#CC8566","strokecolor":"#CC3D00","linewidth":0,"expression":"COUNTYFP10='063'"},{"type":"polygon","styleName":"layer1036216_style2","fillcolor":"#CC7A66","strokecolor":"#CC2900","linewidth":0,"expression":"COUNTYFP10='007'"},{"type":"polygon","styleName":"layer1036216_style1","fillcolor":"#CC7066","strokecolor":"#CC1400","linewidth":0,"expression":"COUNTYFP10='083'"},{"type":"polygon","styleName":"layer1036216_style0","fillcolor":"#CC6666","strokecolor":"#CC0000","linewidth":0,"expression":"COUNTYFP10='113'"}],"xmin":-8879130.90315,"ymin":4935561.06357,"xmax":-7990233.74854,"ymax":5624019.45148,"oldLayer":null},"layer1036215":{"id":"layer1036215","alpha":1,"visible":true,"timestamp":"1325191598","src":"s1","features":[{"type":"polygon","styleName":"layer1036215_style4","fillcolor":"#F71E1E","strokecolor":"#BF002D","linewidth":0,"expression":"unemployme>=20 AND unemployme <= 31","expressionLabel":"unemployme>=24.86 AND unemployme <= 30.799999999999997"},{"type":"polygon","styleName":"layer1036215_style3","fillcolor":"#FFA01C","strokecolor":"#C9560E","linewidth":0,"expression":"unemployme>=15 AND unemployme < 20","expressionLabel":"unemployme>=18.92 AND unemployme < 24.86"},{"type":"polygon","styleName":"layer1036215_style2","fillcolor":"#FFEB36","strokecolor":"#FFC640","linewidth":0,"expression":"unemployme>=10 AND unemployme < 15","expressionLabel":"unemployme>=12.979999999999999 AND unemployme < 18.919999999999998"},{"type":"polygon","styleName":"layer1036215_style1","fillcolor":"#9CF233","strokecolor":"#54D404","linewidth":0,"expression":"unemployme>=5 AND unemployme < 10","expressionLabel":"unemployme>=7.039999999999999 AND unemployme < 12.979999999999999"},{"type":"polygon","styleName":"layer1036215_style0","fillcolor":"#1CE63A","strokecolor":"#20BA2F","linewidth":0,"expression":"unemployme>=1 AND unemployme < 5","expressionLabel":"unemployme>=1.1 AND unemployme < 7.039999999999999"}],"xmin":-179.23109,"ymin":17.84427,"xmax":179.85968,"ymax":71.43884,"oldLayer":null},"layer1036207":{"id":"layer1036207","alpha":1,"visible":true,"src":"s9","timestamp":"1325120450","features":[],"xmin":-20037508.3427892,"ymin":-20037508.3427892,"xmax":20037508.3427892,"ymax":20037508.3427892,"oldLayer":null},"layer1036209":{"id":"layer1036209","alpha":1,"visible":false,"type":"raster","src":"s7","timestamp":"1325120453","features":[{}],"xmin":-17631532.08179,"ymin":2416275.734433,"xmax":-17538730.517952,"ymax":2487569.382571,"oldLayer":null,"format":"jpg"},"layer1036208":{"id":"layer1036208","alpha":1,"visible":false,"timestamp":"1325120683","src":"s5","features":[{"type":"line","styleName":"layer1036208_style0","strokecolor":"#1000F0","linewidth":2}],"xmin":-17612935.727055,"ymin":2422466.550545,"xmax":-17553802.803536,"ymax":2473473.896863,"oldLayer":null},"layer1036211":{"id":"layer1036211","alpha":1,"visible":true,"timestamp":"1325155366","src":"s3","features":[{"type":"line","styleName":"layer1036211_style0","strokecolor":"#00FF0D","linewidth":2}],"xmin":-17612924.63338,"ymin":2422469.711874,"xmax":-17553802.518719,"ymax":2473616.524572,"oldLayer":null},"layer1036210":{"id":"layer1036210","alpha":1,"visible":true,"timestamp":"1325120452","src":"s1","features":[{"type":"point","styleName":"pointstyle1036210-0","icon":"http://resources.giscloud.com/assets/icon.php?cors=1&p=%2Ficons%2Fdefaulticon.png","dx":-5,"dy":-5}],"has_icon":true,"xmin":-17612920.321522,"ymin":2422506.061896,"xmax":-17553821.677483,"ymax":2473616.530726,"oldLayer":null}}

/***/ })
/******/ ]);