var POILib = require('poi-js-lib/dist/poi-lib.min.js');

class POI {
    constructor(params = {}) {
        this.params = params;
        this.imgItems = params.setData;
        this.callbacks = {};
        this.imagesReady = [];
    }

    populateCallbacks(type) {
        var self = this;
        if (typeof type !== 'undefined') {
            self.params.config.forEach(function (config) {
                self.callbacks[config.name] = [];
                config.callbacks.forEach(function (callback) {
                    self.callbacks[config.name].push({
                        target: "*",
                        action: callback.action,
                        callback: callback.callback,
                        initCallback: function (params) {
                            if (callback.initCallback) {
                                callback.initCallback(params);
                            }
                        }
                    });
                });
            });
        }
    }

    configPOI() {
        var self = this;
        self.imgItems.forEach(function (v, i) {
            if (typeof v.metadata.hotSpots === 'undefined' || v.metadata.hotSpots.hotSpots === null) {
                return;
            }
            var name = v.src.match(/[^\/]*$/)[0]
            var img = {
                data: v,
                name: name
            }

            if (self.callbacks.hotspot.length > 0) {
                img.hotspotCallbacks = self.callbacks.hotspot;
            }

            if (self.callbacks.area.length > 0) {
                img.areaCallbacks = self.callbacks.area;
            }

            self.imagesReady.push(img);
        });
    }

    initPOI() {
        var self = this;
        var poi = new POILib({
            containerClass: 'ajs-pdf-zoom-wrap',
            imgClass: 'swiper-slide-img',
            images: self.imagesReady,
            imgAttribute: 'data-src'
        });
        poi.init();
    }

    initAll() {
        this.populateCallbacks('hotspot');
        this.populateCallbacks('area');

        this.configPOI();
        this.initPOI();
    }
}

module.exports = POI;