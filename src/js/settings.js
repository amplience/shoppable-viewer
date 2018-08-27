const helpers = require('./config').shared;
var id = helpers.generateId();
module.exports = {
    id: id,
    useData: 'set', // set || json
    setData: {
        account: 'csdemo',
        name: 'CA-catalogue_set',
        path: 'https://i1.adis.ws/',
        type: 's'
    },
    https:true,
    cache: Date.now(),
    jsonData: [
        {
            "type": "img",
            "src": "http://i1.adis.ws/i/csdemo/CA-catalogue_page1",
            "width": 1240,
            "height": 1500,
            "format": "JPEG",
            "opaque": "true"
        }, {
            "type": "img",
            "src": "http://i1.adis.ws/i/csdemo/CA-catalogue_page2",
            "width": 2479,
            "height": 1500,
            "format": "JPEG",
            "opaque": "true"
        }],
    target: ".ajs-pdf-viewer",
    templateClass: 'apdf-standard-template',
    wrapperClass: 'apdf-carousel-wrap',
    title: 'Catalog #123',
    titleClass: 'apdf-catalog-title',
    pageOfTxt: 'of',
    pagingClasses: {
        current: 'apdf-current-page',
        last: 'apdf-last-page',
        of: 'apdf-page-of'
    },
    initCallback: (viewer) => {
        console.log('Pdf viewer initialized. You can play with it =>', viewer);
    },
    allCatalogsCallback: (viewer) => {
        console.log('All catalogs loaded');
    },
    zoomLevel: 2,
    zoom: {
        activate: [false, false],
        deactivate: ['dblclick', 'doubletap'],
        move: ['drag', 'touchmove']
    },
    aspectRatio: true,
    carouselImgDimensions: {
        width: 'auto',
        height: 'auto'
    },
    carouselClass: {
        next: 'swiper-button-next swiper-button-black apdf-swiper-next-custom',
        prev: 'swiper-button-prev swiper-button-black apdf-swiper-prev-custom'
    },
    carousel: {
        nextButton: '.ajs-swiper-next-',
        prevButton: '.ajs-swiper-prev-',
        speed: 300,
        slidesPerView: 1,
        paginationClickable: true,
        spaceBetween: 30,
        loop: false,
        hashnav: true,
        hashnavWatchState: true,
        preloadImages: false,
        lazyLoading: true,
        lazyLoadingInPrevNext: true,
        lazyLoadingInPrevNextAmount: 1,
        lazyLoadingOnTransitionStart: true,
        simulateTouch: false
    },

    carouselCallbacks: {
        onInit: (swiper, viewer) => {
            console.log('Carousel initiated');
        },
        onSlideChangeStart: (swiper, viewer) => {
            console.log('Slide change start');
        },
        onSlideChangeEnd: (swiper, viewer) => {
            console.log('Slide change end');
        }
    },

    contents: {
        blockClass: 'apdf-contents-thumb',
        pagingClass: 'apdf-contents-paging'
    },

    buttons: {
        closeContents: {
            icoClass: 'apdf-icon-close-contents'
        },
        allCatalogs: {
            txt: 'All Catalogs',
            linkClass: 'apdf-header-link',
            icoClass: 'apdf-icon-all-catalogs',
            url: '#1'
        },
        viewContent: {
            txt: 'View Contents',
            linkClass: 'apdf-header-link',
            icoClass: 'apdf-icon-view-contents'
        },
        zoom: {
            txt: 'Zoom',
            linkClass: 'apdf-header-link',
            icoClass: 'apdf-icon-zoom-in',
            icoClassOut: 'apdf-icon-zoom-out'
        },
        download: {
            txt: 'Download',
            linkClass: 'apdf-header-link',
            icoClass: 'apdf-icon-download',
            url: '#2'
        }
    },

    ampTemplates: {
        thumb: '$index-thumb$',
        mainPic: [
            {
                name: 'xl',
                tpl: 'w=1600&qlt=60',
                tpl2x: 'w=3200&qlt=60',
                minWidth: 1600
            },
            {
                name: 'l',
                tpl: 'w=1280&qlt=60',
                tpl2x: 'w=2560&qlt=60',
                minWidth: 1280
            },
            {
                name: 'm',
                tpl: 'w=1024&qlt=60',
                tpl2x: 'w=2048&qlt=60',
                minWidth: 1024
            },
            {
                name: 's',
                tpl: 'w=768&qlt=60',
                tpl2x: 'w=1536&qlt=60',
                minWidth: 768
            },
            {
                name: 'xs',
                tpl: 'w=320&qlt=60',
                tpl2x: 'w=640&qlt=60',
                minWidth: 1
            },
            {
                name: 'default',
                tpl: 'w=1600&qlt=60',
                tpl2x: 'w=3200&qlt=60',
            }
        ]
    },
    POI: {
        config: [
            {
                name: 'hotspot',
                callbacks: [{
                    action: 'click',
                    callback: function (evt, settings) {
                        console.log('clicked', settings);
                    },
                    initCallback: function (settings) {
                        console.log('initialized', settings);
                    }
                }]
            },
            {
                name: 'area',
                callbacks: [{
                    action: 'click',
                    callback: function (evt, settings) {
                        console.log('clicked', settings);
                    },
                    initCallback: function (settings) {
                        console.log('initialized', settings);
                    }
                }]
            }

        ]
    }
};