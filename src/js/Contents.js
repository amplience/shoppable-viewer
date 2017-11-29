require('dom4');

const Promise = require('core-js/es6/promise');
const template = require('./../templates/contents.hbs');
const settings = require('./settings');
const helpers = require('./config').shared;

class Contents {
    constructor(params = {}) {
        this.loaded = false;
        this.imgHeights = [];
        this.pages = [];
        this.options = params;
        this.$elems = {
            pdfWrapper: params.$wrapper
        }

        this.sizes = {
            narrow: null,
            tall: null,
        }

        this.$elems.target = this.$elems.pdfWrapper.queryAll('.ajs-contents')[0];
        this.$elems.openButton = this.$elems.pdfWrapper.queryAll('.ajs-open-contents')[0];
        this.$elems.closeButton = this.$elems.pdfWrapper.queryAll('.ajs-close-contents')[0];

        this.init();
    }

    show(evt) {
        evt.preventDefault();
        this.$elems.pdfWrapper.classList.remove('ajs-without-contents');
        this.$elems.pdfWrapper.classList.add('ajs-with-contents');
    }

    hide(evt) {
        if (evt)
            evt.preventDefault();
        this.$elems.pdfWrapper.classList.add('ajs-without-contents');
        this.$elems.pdfWrapper.classList.remove('ajs-with-contents');
    }

    attachShowEvent() {
        var self = this;
        var showCallback = ((evt) => {
            if (self.loading) {
                return;
            }

            self.show(evt);

            if (!self.loaded) {
                self.loading = true;
                self.preloadImages().then((res) => {
                    self.generateHtml();
                    self.removePreloader();
                    self.loading = false;
                    self.options.PDFViewer.options.allCatalogsCallback(self.options.PDFViewer);
                });
            }
            else {
                self.$elems.thumbs.forEach(($thumb, ind) => {
                    self.selectActiveThumb($thumb, ind);
                });
                self.options.PDFViewer.options.allCatalogsCallback(self.options.PDFViewer);
            }
        });

        if (helpers.isTouchDevice())
            this.$elems.openButton.addEventListener('touchstart', showCallback.bind(self));
        else
            this.$elems.openButton.addEventListener('click', showCallback.bind(self));
    }

    attachHideEvent() {

        if (helpers.isTouchDevice())
            this.$elems.closeButton.addEventListener('touchstart', this.hide.bind(this));
        else
            this.$elems.closeButton.addEventListener('click', this.hide.bind(this));
    }

    preloadImages(set) {
        var self = this;
        var promises = [];

        var callback = ((height, ind) => {
            self.imgHeights[ind] = height;
        });

        this.options.set.forEach((v, ind) => {
            let promise = new Promise((res) => {

                let $img = new Image();

                $img.onload = (() => {
                    if ($img) {
                        callback($img.height, ind);
                        $img = null;
                        res();
                    }
                });

                $img.onerror = (() => {
                    callback($img.height, ind);
                    $img = null;
                    res();
                });

                $img.src = self.options.set[ind].src + '?' + self.options.htmlData.ampTemplates.thumb;

                if ($img.complete || $img.readyState === 4) {
                    callback($img.height, ind);
                    $img = null;
                    res();
                }
            });

            promises.push(promise);
        });

        return new Promise((res) => {
            Promise.all(promises).then(values => {

                this.sizes.tall = Math.max.apply(Math, self.imgHeights);
                this.sizes.narrow = Math.min.apply(Math, self.imgHeights);

                var currentPage = 0;

                self.imgHeights.forEach((v, i) => {
                    if (v == this.sizes.tall) {
                        currentPage += 1;
                        this.pages.push({
                            type: 'single',
                            num: currentPage
                        });
                    }
                    else {
                        currentPage += 2;
                        this.pages.push({
                            num: currentPage,
                            type: 'double'
                        });
                    }
                });

                self.loaded = true;
                res(values);
            });
        });
    }

    selectActiveThumb($thumb, ind) {
        if (ind === this.options.PDFViewer.carousel.activeIndex)
            $thumb.classList.add('selected');
        else
            $thumb.classList.remove('selected');
    }

    generateHtml() {
        var self = this;

        var $html = document.createElement('div');
        $html.innerHTML = template(this.options.htmlData);
        $html = $html.firstChild;

        self.$elems.thumbs = [... $html.querySelectorAll('.ajs-contents-thumb')];

        self.$elems.thumbs.forEach(($thumb, ind) => {
            self.selectActiveThumb($thumb, ind);
            self.attachThumbEvent($thumb, ind);
            self.applyPaging($thumb, self.pages[ind]);
            let height = self.calculateThumbHeight(ind);
            if (height)
                $thumb.queryAll('> img')[0].style.height = height + 'px';
        });

        this.$elems.target.appendChild($html);
    }

    attachThumbEvent($target, index) {
        var self = this;
        var thumbEvt = ((evt) => {
            self.hide(evt);
            self.options.PDFViewer.carousel.slideTo(index);
            self.$elems.pdfWrapper.scrollIntoView();
        });

        if (helpers.isTouchDevice()) {
            helpers.touchHelpers({
                elem: $target,
                evt: 'tap',
                callback: thumbEvt
            })
        }
        else
            $target.addEventListener('click', thumbEvt);
    }

    applyPaging($thumb, currentPage) {
        var $page = $thumb.queryAll('.ajs-contents-paging')[0]
        if (currentPage.type === 'single')
            $page.textContent = currentPage.num;
        else
            $page.textContent = (currentPage.num - 1) + '-' + currentPage.num;
    }

    calculateThumbHeight(index) {
        if (this.imgHeights[index] === this.sizes.tall)
            return this.sizes.narrow;
        else
            return false;
    }

    removePreloader() {
        this.$elems.target.queryAll('> .swiper-lazy-preloader')[0].remove();
    }

    init() {
        var self = this;
        self.attachShowEvent();
        self.attachHideEvent();
        self.hide();
    }
}

module.exports = Contents;






