require('./zoom.scss');
require('dom4');
const Promise = require('core-js/es6/promise');
const Template = require('./zoom.hbs');
const Helpers = require('../shared/shared.js');


class Zoom {
    constructor(params) {
        let self = this;
        let defaults = {
            activate: ['mouseover', 'tap'], // [mouseover, click, dblclick, false] and [tap, doubletap touchstart]
            deactivate: ['mouseout', 'doubletap'], // [mouseout, click, dblclick, false] and  [tap, doubletap touchstart]
            move: ['drag', 'touchmove'], //  [mousemove, drag] and [touchmove]
            target: '.ajs-zoom-img',
            parent: null,
            //closeButton: true,  TODO
            moveToEvent: true,
            zoomInCallback: () => {

            },
            zoomOutCallback: () => {

            }
        };

        this.options = Object.assign({}, defaults, params);

        this.cssClass = {
            img: 'ajs-zoom-img',
            parent: 'ajs-zoom-box',
            active: 'ajs-active',
            loaded: 'ajs-loaded',
            zoomedImg: 'ajs-zoomed',
            hidden: 'ajs-hidden',
            animateOpacity: 'ajs-animate-opacity',
            fadeIn: 'ajs-opacity-1',
            fadeOut: 'ajs-opacity-0'
        };

        this.loaded = false;
        this.animating = false;
        this.attachedEvents = {};
        this.attachedMobileEvents = {};
        this.evt = null;
    }

    _initElems() {
        let self = this;
        this.$elems = {
            elem: typeof this.options.target === 'string'
                ? document.querySelectorAll(this.options.target)[0]
                : self.options.target
        };

        this.$elems.parentElem = this.options.parent ? this.options.parent : this.$elems.elem.parentElement;

        this.$elems.elem.classList.add(this.cssClass.img, this.cssClass.animateOpacity);


        if (!this.$elems.parentElem.classList.contains(this.cssClass.parent))
            this.$elems.parentElem.classList.add(this.cssClass.parent);
    }

    _attachEvtHelper(elem, evt, callback, attachedEvtName) {
        this.$elems[elem].addEventListener(evt, callback);
        this.attachedEvents[attachedEvtName] = {elem: elem, evt: evt, callback: callback};
    }

    _mobileAttachEvtHelper(elem, evt, callback, attachedEvtName) {
        let createEvt = Helpers.touchHelpers({
            elem,
            evt,
            callback
        });

        createEvt.forEach((v, i) => {
            this.attachedMobileEvents[attachedEvtName + '_' + i] = {
                elem: createEvt[i]['elem'],
                evt: createEvt[i]['evt'],
                callback: createEvt[i]['callback']
            };
        });
    }

    attachEvents() {
        let self = this;

        return {
            move: () => {
                if (self.options.move[0] === 'mousemove' && !self.attachedEvents.move) {
                    self.moveZoom();

                    let moveInit = self._move.bind(self);
                    self._attachEvtHelper.apply(self, ['zoomContent', self.options.move[0], moveInit, 'move']);
                }

                else if (!self.attachedEvents.move) {
                    self.moveZoom();

                    let moveInit = self._moveDrag();
                    let moveHandler = moveInit.bind(self);

                    let moveEvt = (() => {
                        self.$elems.zoomContent.addEventListener('mousemove', moveHandler);
                    });

                    let unbindMoveEvt = (() => {
                        self.$elems.zoomContent.removeEventListener('mousemove', moveHandler);
                        moveInit = self._moveDrag();
                        moveHandler = moveInit.bind(self);
                    });

                    self._attachEvtHelper.apply(self, ['zoomContent', 'mousedown', moveEvt, 'move']);
                    self._attachEvtHelper.apply(self, ['zoomContent', 'mouseup', unbindMoveEvt, 'moveStop']);
                    self._attachEvtHelper.apply(self, ['zoomContent', 'mouseout', unbindMoveEvt, 'moveStopOut']);
                }

                //mobile
                if (Helpers.isTouchDevice() && self.options.move[1] && !self.attachedMobileEvents['moveMobile']) {

                    let moveInit = self._moveDrag();
                    let moveHandler = moveInit.bind(self);

                    let clearMoveEvt = (() => {
                        self.$elems.zoomContent.removeEventListener(self.options.move[1], moveHandler);
                        moveInit = self._moveDrag();
                        moveHandler = moveInit.bind(self);
                        self._mobileAttachEvtHelper.apply(self, [self.$elems.zoomContent, self.options.move[1], moveHandler, 'moveMobile']);
                    });

                    self._mobileAttachEvtHelper.apply(self, [self.$elems.zoomContent, 'touchstart', clearMoveEvt, 'moveMobileStart']);
                }

            },

            getCursorPosition: () => {

                if (this.attachedEvents.getCursorPosition)
                    return;

                let moveHandler = ((e) => {
                    this.evt = e;
                });

                self._attachEvtHelper.apply(self, ['parentElem', 'mousemove', moveHandler, 'getCursorPosition']);
            },

            activate: () => {
                if (self.options.activate[0] && !self.attachedEvents.activate) {
                    let zoomInInit = self.zoomIn.bind(self);
                    self._attachEvtHelper.apply(self, ['elem', self.options.activate[0], zoomInInit, 'activate']);
                }

                //mobile

                if (Helpers.isTouchDevice() && self.options.activate[1] && !self.attachedMobileEvents['activateMobile_0']) {
                    let zoomInInit = self.zoomIn.bind(self);
                    self._mobileAttachEvtHelper.apply(self, [self.$elems.elem, self.options.activate[1], zoomInInit, 'activateMobile']);
                }
            },

            deactivate: () => {

                if (self.options.deactivate[0] && !self.attachedEvents.deactivate && !Helpers.isTouchDevice()) {

                    if (self.options.deactivate[0] === 'click') {
                        let seconds = new Date().getTime() / 1000;
                        let coords = {
                            x: null,
                            y: null
                        };

                        let startCount = ((e) => {
                            seconds = new Date().getTime() / 1000;
                            coords = {
                                x: e.offsetX,
                                y: e.offsetY
                            }
                        });

                        let endCount = ((e) => {
                            if (!self.loaded)
                                return;

                            let newCoords = {
                                x: e.offsetX,
                                y: e.offsetY
                            };

                            if ((new Date().getTime() / 1000 - seconds) <= 0.5
                                && Math.abs(newCoords.x - coords.x) < 2
                                && Math.abs(newCoords.y - coords.y) < 2) {
                                self.zoomOut.apply(self);
                            }
                        });

                        self._attachEvtHelper.apply(self, ['zoomContent', 'mousedown', startCount, 'deactivate']);
                        self._attachEvtHelper.apply(self, ['zoomContent', 'mouseup', endCount, 'deactivateEnd']);
                    }

                    else {
                        let zoomOutInit = self.zoomOut.bind(self);
                        self._attachEvtHelper.apply(self, ['zoomContent', self.options.deactivate[0], zoomOutInit, 'deactivateEnd']);
                    }
                }

                //mobile

                if (Helpers.isTouchDevice() && self.options.deactivate[1] && !self.attachedMobileEvents['deactivateMobile_0']) {
                    let zoomOutInit = self.zoomOut.bind(self);
                    self._mobileAttachEvtHelper.apply(self, [self.$elems.zoomContent, self.options.deactivate[1], zoomOutInit, 'deactivateMobile']);
                }
            }
        }
    }

    moveZoom(val) {
        let self = this;
        if (val) {
            let move = this._moveDrag(val);
            move();
        }

        else if (this.options.move[0] === 'mousemove' && !Helpers.isTouchDevice()) {
            this._move(this.evt);
        }

        else {
            let pos = {
                x: -((self.$elems.zoomedImg.clientWidth / 2) - (self.$elems.elem.clientWidth / 2)),
                y: -((self.$elems.zoomedImg.clientHeight / 2) - (self.$elems.elem.clientHeight / 2)),
            };

            let move = this._moveDrag(pos);
            move();
        }
    }

    _appendZoomHtml() {
        let template = Template();
        let $html = document.createElement('div');
        $html.innerHTML = template;
        $html = $html.firstChild;
        this.$elems.parentElem.appendChild($html);
        this.$elems.zoomContent = $html;
    }

    preloadImg(src, appendTo) {
        let self = this;

        let promiseCallback = ((resolve, $img) => {
            self.$elems.zoomContent.classList.add(this.cssClass.loaded);
            appendTo.append($img);
            window.getComputedStyle($img).opacity;
            self.$elems.zoomedImg = $img;
            self.loaded = true;
            resolve();
        });

        return new Promise((resolve, reject) => {

            if (self.loaded)
                return resolve();

            let $img = new Image();

            $img.classList.add(self.cssClass.zoomedImg, self.cssClass.animateOpacity);

            $img.onload = (() => {
                if (self.loaded)
                    return resolve();

                return promiseCallback(resolve, $img);

            });

            $img.src = src;

            if (($img.complete || $img.readyState === 4) && !self.loaded)
                return promiseCallback(resolve, $img);
        });
    }

    _move(e) {
        if(!e){
            return;
        }

        if (e.preventDefault) {
            e.preventDefault();
        }

        if(typeof e.offsetX == 'undefined'){
            return;
        }

        let mouseX = e.offsetX;
        let mouseY = e.offsetY;

        let zoomBoxWidth = this.$elems.elem.clientWidth;
        let zoomBoxHeight = this.$elems.elem.clientHeight;

        let leftOffset = mouseX / (zoomBoxWidth / 100);
        let topOffset = mouseY / (zoomBoxHeight / 100);

        let zoomPositionLeft = ((this.$elems.zoomedImg.clientWidth / 100) * leftOffset) - mouseX;
        let zoomPositionTop = ((this.$elems.zoomedImg.clientHeight / 100) * topOffset) - mouseY;

        this.$elems.zoomedImg.style.top = (-zoomPositionTop) + 'px';
        this.$elems.zoomedImg.style.left = (-zoomPositionLeft) + 'px';
    }

    _moveDrag(values) {
        var lastPosition = {
            x: values ? values.x : null,
            y: values ? values.y : null
        };

        return (e) => {
            if (e && e.preventDefault) {
                e.preventDefault();
            }
            if (lastPosition.x !== null) {
                if (e) {
                    var deltaX = lastPosition.x - (e.touches ? e.touches[0].pageX : e.offsetX);
                    var deltaY = lastPosition.y - (e.touches ? e.touches[0].pageY : e.offsetY);
                }

                let posLeft = values ? values.x : (this.$elems.zoomedImg.offsetLeft - deltaX);
                let posTop = values ? values.y : (this.$elems.zoomedImg.offsetTop - deltaY);

                if (posTop >= 0) {
                    posTop = 0;
                }

                else if (this.$elems.zoomedImg.clientHeight + posTop <= this.$elems.elem.clientHeight)
                    posTop = -(this.$elems.zoomedImg.clientHeight - this.$elems.elem.clientHeight)

                if (posLeft >= 0)
                    posLeft = 0;

                else if (this.$elems.zoomedImg.clientWidth + posLeft <= this.$elems.elem.clientWidth)
                    posLeft = -(this.$elems.zoomedImg.clientWidth - this.$elems.elem.clientWidth)

                this.$elems.zoomedImg.style.top = (posTop) + 'px';
                this.$elems.zoomedImg.style.left = (posLeft) + 'px';
            }

            if (e) {
                lastPosition.x = e.touches ? e.touches[0].pageX : e.offsetX;
                lastPosition.y = e.touches ? e.touches[0].pageY : e.offsetY;
            }
        }
    }

    zoomIn(callback = true) {
        let self = this;
        if (this.animating) {
            clearTimeout(this.animating);
        }

        this.$elems.parentElem.classList.add(this.cssClass.active);

        return new Promise((res) => {
            this.preloadImg(this.options.src, this.$elems.zoomContent).then(() => {
                this.$elems.parentElem.classList.add(this.cssClass.active);
                this.$elems.elem.classList.remove(this.cssClass.fadeIn);
                this.$elems.elem.classList.add(this.cssClass.fadeOut);

                this.$elems.zoomedImg.classList.remove(this.cssClass.fadeOut);
                this.$elems.zoomedImg.classList.add(this.cssClass.fadeIn);

                this.attachEvents().move();
                if (callback)
                    this.options.zoomInCallback(this);
                res();
            });
        });
    }

    zoomOut(callback = true) {
        let self = this;

        if (!this.loaded)
            return;

        if (this.animating) {
            clearTimeout(this.animating);
        }

        this.$elems.elem.classList.remove(this.cssClass.fadeOut);
        this.$elems.elem.classList.add(this.cssClass.fadeIn);

        if (this.$elems.zoomedImg) {
            this.$elems.zoomedImg.classList.remove(this.cssClass.fadeIn);
            this.$elems.zoomedImg.classList.add(this.cssClass.fadeOut);
        }
        if (callback)
            this.options.zoomOutCallback(this);

        self.animating = setTimeout(() => {
            self.$elems.parentElem.classList.remove(self.cssClass.active);
            self.animating = false;
        }, 500);

        return Promise.resolve();
    }

    _destroyEvents() {
        for (let x in this.attachedEvents) {
            this.$elems[this.attachedEvents[x].elem].removeEventListener(this.attachedEvents[x].evt, this.attachedEvents[x].callback);
        }

        for (let y in this.attachedMobileEvents) {
            this.attachedMobileEvents[y].elem.removeEventListener(this.attachedMobileEvents[y].evt, this.attachedMobileEvents[y].callback);
        }

        this.attachedEvents = {};
        this.attachedMobileEvents = {};
    }

    destroy() {
        this._destroyEvents();
        this.$elems.parentElem.classList.remove(this.cssClass.parent, this.cssClass.active);
        this.$elems.parentElem.classList.remove(this.cssClass.parent);
        this.$elems.elem.classList.remove(this.cssClass.img, this.cssClass.animateOpacity, this.cssClass.fadeIn, this.cssClass.fadeOut)
        this.$elems.zoomContent.remove();
        delete this.$elems;
        this.loaded = false;
    }

    _logic() {
        this._initElems();
        this._appendZoomHtml();
        this.attachEvents().activate();
        this.attachEvents().deactivate();
        if (this.options.move[0] === 'mousemove') {
            this.attachEvents().getCursorPosition();
        }
    }

    init() {
        this._logic();
        if (this.options.preload) {
            this.preloadImg(this.options.src, this.$elems.zoomContent);
        }
    }
}

module.exports = Zoom;
