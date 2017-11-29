require('../sass/styles.scss');
require('dom4');

const Promise = require('core-js/es6/promise');
const template = require('./../templates/viewer.hbs');
const modules = require('./config');
const settings = require('./settings');
const helpers = modules.shared;


class PDFViewer {
    constructor(params) {
        //Generic

        this.options = Object.assign({}, settings, params);

        this.set = null;
        this.carousel = null;
        this.contents = null;

        this.sizes = {
            tall: null,
            narrow: null
        };

        this.pages = [];

        this.zoomModules = [];
        this.zoomedIn = -1;

        this.carouselImgDimensions = typeof this.options.carouselImgDimensions.width === 'string' ? null : this.options.carouselImgDimensions;
        this.aspectRatio = this.carouselImgDimensions ? (this.carouselImgDimensions.width / this.options.carouselImgDimensions.height) : null;

        //DOM

        this.$elems = {
            target: typeof this.options.target === 'string'
                ? document.querySelectorAll(this.options.target)[0]
                : self.options.target
        };

        //Init
        this.init();
    }

    getSetData() {
        //Use clients preformatted json\js object
        if (this.options.useData === 'json' && this.options.jsonData.length > 0) {
            if (typeof this.options.jsonData === 'string')
                return Promise.resolve(JSON.parse(this.options.jsonData));
            else
                return Promise.resolve(this.options.jsonData);
        }

        //Use Amplience set functionality
        var url = encodeURI(helpers.singleLineString`${this.options.setData.path}
        ${this.options.setData.type}/
        ${this.options.setData.account}/
        ${this.options.setData.name}
        .js?v=${this.options.cache}
        &deep=true&func=json`).replace(/[!'()*]/g, escape);

        if (this.options.POI.config.length > 0) {
            url += '&metadata=true';
        }

        var timeout = 100;
        var retries = 0;
        return new Promise((res, rej) => {
            var ajaxObj = {
                url: url,
                type: 'jsonp',
                jsonpCallback: 'func',
                jsonpCallbackName: 'json',
                error: (err) => {
                    var ajax = this;
                    if (retries < 9) {
                        setTimeout(() => {
                            modules.Ajax(ajaxObj);
                            timeout *= 2;
                            retries += 1;
                        }, timeout);
                    }
                    else {
                        console.error('Error retrieving a set', err);
                    }
                },
                success: (resp) => {
                    res(resp.items);
                }
            }

            modules.Ajax(ajaxObj);
        });
    }

    populateSetData() {
        var imgWidths = [];
        var imgHeights = [];

        this.set.forEach((v, i) => {
            if (isNaN(v.width))
                return;

            imgWidths.push(v.width);
            imgHeights.push(v.height);
            this.zoomModules.push(null);
        });

        this._populatePages(imgWidths, imgHeights);
    }

    cacheTags() {
        this.$elems.swiperContainer = this.$elems.target.queryAll('.swiper-container')[0]
        this.$elems.swiperWrapper = this.$elems.swiperContainer.queryAll('.swiper-wrapper')[0];
        this.$elems.swiperSlides = this.$elems.swiperContainer.queryAll('.swiper-slide');
        this.$elems.pageNumLast = this.$elems.target.queryAll('.ajs-pdf-last-page')[0];
        this.$elems.zoomButton = this.$elems.target.queryAll('.ajs_zoom_init')[0];
        this.$elems.pageNumCurrent = this.$elems.target.queryAll('.ajs-pdf-current-page')[0];
    }

    populateSlideHashTags() {
        if (this.options.carousel.hashnav) {
            this.$elems.swiperSlides.forEach((v, i) => {
                v.setAttribute('data-hash', this.pages[i].num);
            });
        }
    }

    initCarousel() {
        var self = this;
        this.$elems.swiperContainer.setAttribute('id', 'swiper_container_' + self.options.id);


        this.options.carousel.onInit = (swiper) => {
            self.options.carouselCallbacks.onInit(swiper, self);
        }

        this.options.carousel.onSlideChangeStart = (swiper) => {
            self.zoomOutActive(true);
            self.options.carouselCallbacks.onSlideChangeStart(swiper, self);

        }

        this.options.carousel.onSlideChangeEnd = (swiper) => {
            self.pager.current(swiper.activeIndex);
            self.options.carouselCallbacks.onSlideChangeEnd(swiper, self);
        }

        this.options.carousel.nextButton = this.options.carousel.nextButton + this.options.id;
        this.options.carousel.prevButton = this.options.carousel.prevButton + this.options.id;


        this.carousel = new Swiper('#swiper_container_' + self.options.id, this.options.carousel);

        this.applyAspectRatio();
    }

    carouselPaging() {
        var self = this;
        return {
            current: ((index) => {
                if (self.pages[index].type === 'single') {
                    self.$elems.pageNumCurrent.textContent = self.pages[index].num;
                } else {
                    self.$elems.pageNumCurrent.textContent = (self.pages[index].num - 1) + '/' + self.pages[index].num;
                }
            }),
            last: (() => {
                self.$elems.pageNumLast.textContent = self.pages[self.pages.length - 1].num;
            })
        }
    }

    resizeHandler() {
        var self = this;
        var timeout;

        var onResizeCallback = function () {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                self.zoomOutActive();
                self.applyAspectRatio();
                self.destroyZoomModules();
            }, 500);
        }

        window.addEventListener('resize', () => {
            onResizeCallback();
        }, true);

        window.addEventListener("orientationchange", () => {
            onResizeCallback();
        });

    }

    zoomWrapArea(slideIndex, $img) {
        var $zoomWrap = this.carousel.slides[slideIndex].queryAll('.ajs-pdf-zoom-wrap')[0];
        $zoomWrap.style.width = $img.clientWidth + 'px';
        return $zoomWrap;
    }

    zoomedImgSrc(index, $img) {
        var src = this.set[index].src;
        var width = $img.width * this.options.zoomLevel;
        var height = $img.height * this.options.zoomLevel;
        return `${src}?w=${width}&h=${height}`;
    }

    zoomOutActive(zoomOut = false) {
        var self = this;
        var zoomedIndex = this.zoomedIn;
        if (this.zoomedIn !== -1) {
            if (zoomOut)
                this.zoomModules[this.zoomedIn].zoomOut(false);
            this.carousel.enableTouchControl();
            this.zoomedIn = -1;
            self.$elems.zoomButton.classList.remove(self.options.buttons.zoom.icoClassOut);
            setTimeout(() => {
                self.carousel.slides[zoomedIndex].queryAll('.ajs-pdf-zoom-wrap')[0].style.width = 'auto';
            }, 500);
        }
    }

    destroyZoomModules() {
        this.zoomModules.forEach((v, i) => {
            if (v === null)
                return;
            v.destroy();
            this.zoomModules[i] = null;

            if (i == this.zoomedIn) {
                this.carousel.slides[this.zoomedIn].queryAll('.ajs-pdf-zoom-wrap')[0].style.width = 'auto';
            }

            this.zoomedIn = -1;
        });
    }

    initZoom() {
        var self = this;
        var zoomInit = () => {
            var slideIndex = this.carousel.activeIndex;
            var $currentImg = this.carousel.slides[slideIndex].queryAll('.swiper-slide-img')[0];
            var $zoomWrap = this.zoomWrapArea(slideIndex, $currentImg);

            if (this.zoomModules[slideIndex] === null) {
                let zoomOptions = this.options.zoom;
                zoomOptions.target = $currentImg;
                zoomOptions.parent = $zoomWrap;

                zoomOptions.zoomOutCallback = (() => {
                    self.zoomOutActive.call(self);
                })

                zoomOptions.src = this.zoomedImgSrc(slideIndex, $currentImg);

                this.zoomModules[slideIndex] = new modules.Zoom(zoomOptions);
                this.zoomModules[slideIndex].init();
            }

            if (this.zoomedIn == -1) {
                this.zoomModules[slideIndex].zoomIn();
                this.carousel.disableTouchControl();
                this.zoomedIn = slideIndex;
                self.$elems.zoomButton.classList.add(self.options.buttons.zoom.icoClassOut);
            }

            else {
                this.zoomModules[slideIndex].zoomOut();
            }
        };

        var zoomEvt = (e) => {
            e.preventDefault();
            zoomInit.call(self);
        };

        if (helpers.isTouchDevice())
            this.$elems.zoomButton.addEventListener('touchstart', zoomEvt);
        else
            this.$elems.zoomButton.addEventListener('click', zoomEvt);
    }

    _populatePages(imgWidths = [], imgHeights = []) {

        this.sizes.narrow = Math.max.apply(Math, imgWidths);
        this.sizes.tall = Math.min.apply(Math, imgWidths);

        var applyAspectRatio = ((width, height) => {
            this.carouselImgDimensions = {
                width: width,
                height: height
            };
            this.aspectRatio = width / height;
        });

        var currentPage = 0;

        imgWidths.forEach((v, i) => {
            if (v == this.sizes.tall) {
                currentPage += 1;
                this.pages.push({
                    type: 'single',
                    num: currentPage
                });

                if (this.sizes.tall === this.sizes.narrow && i === imgWidths.length - 1) {
                    applyAspectRatio.call(this, v, imgHeights[i]);
                }
            }
            else {
                currentPage += 2;
                this.pages.push({
                    num: currentPage,
                    type: 'double'
                });

                applyAspectRatio.call(this, v, imgHeights[i]);
            }
        });
    }

    initHtml() {
        this.htmlData = Object.assign({}, this.options, {set: this.set});
        var $html = document.createElement('div');
        $html.innerHTML = template(this.htmlData);
        $html = $html.firstChild;
        this.$elems.target.appendChild($html);
    }

    applyAspectRatio() {
        var height = this.$elems.swiperWrapper.clientWidth / this.aspectRatio;
        this.$elems.swiperWrapper.style.height = height + 'px';
    }

    removeMainPreloader() {
        this.$elems.target.queryAll('> .swiper-lazy-preloader')[0].remove();
    }

    init() {
        var self = this;
        this.getSetData().then((resp) => {
            self.set = resp;
            self.populateSetData();
            self.initHtml();
            self.cacheTags();
            self.populateSlideHashTags();
            self.pager = self.carouselPaging();
            self.pager.last();
            self.initCarousel();
            self.pager.current(self.carousel.activeIndex);
            self.resizeHandler();


            if (modules.Zoom && self.options.buttons.zoom)
                self.initZoom();

            self.options.initCallback(self);
            self.removeMainPreloader();

            if (self.options.buttons.viewContent) {
                const Contents = require('./Contents');
                self.contents = new Contents({
                    PDFViewer: self,
                    $wrapper: self.$elems.target,
                    htmlData: self.htmlData,
                    set: self.set
                });
            }

            if (self.options.POI.config.length > 0) {
                const POI = new modules.POI({
                    setData: resp,
                    config: self.options.POI.config
                });
                POI.initAll();
            }
        });
    }
}

window.PDFViewer = PDFViewer;





