(function ($) {
    window.PDFViewerSwitcher = {
        defaults: {
            account: 'csdemo',
            setName: 'CA-catalogue_set',
            catUrl: 'http://csdemo.a.bigcontent.io/v1/static/CA-catalogue',
            basePath: 'http://dev-solutions.s3.amazonaws.com/ca-demo-site/dist/pdp/index.html#store=csdemo&baseUrl=https://c1.adis.ws&id=',
            path: 'http://i1.adis.ws/',
            jsonData: []
        },
        initViewer: function (opts, jsonData) {
            var self = this;
            var uniqueId = new Date().getTime();

            $('.ajs-pdf-viewer-cont').append('<div class="ajs-pdf-viewer-' + uniqueId + '">\n' +
                '        <div class="swiper-lazy-preloader"></div>\n' +
                '    </div>');

            window.location.hash = '';

            new PDFViewer({
                id: uniqueId,
                useData: 'json',
                jsonData: (typeof jsonData === 'undefined' ? self.defaults.jsonData : jsonData),
                target: '.ajs-pdf-viewer-' + uniqueId,
                buttons: {
                    closeContents: {
                        icoClass: 'apdf-icon-close-contents'
                    },
                    allCatalogs: {
                        txt: 'All Catalogs',
                        linkClass: 'apdf-header-link',
                        icoClass: 'apdf-icon-all-catalogs',
                        url: opts.catUrl
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
                        url: opts.catUrl
                    }
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
                POI: {
                    config: [
                        {
                            name: 'hotspot',
                            callbacks: [{
                                action: 'click',
                                callback: function (evt, settings) {
                                    window.location.href = opts.basePath + settings.hotspot.target;
                                }
                            }]
                        },
                        {
                            name: 'area',
                            callbacks: [{
                                action: 'click',
                                callback: function (evt, settings) {
                                    window.location.href = opts.basePath + settings.area.target;
                                }
                            }]
                        }

                    ]
                }
            });
        },
        destroyViewer: function () {
            $('.ajs-pdf-viewer-cont').empty();
        },
        getData: function (opts, callback) {
            var self = this;
            $.ajax({
                url: (opts.path || 'http://i1.adis.ws/') + 's/' + opts.account + '/' + opts.setName + '.js?v=' + new Date().getTime() + '&deep=true&metadata=true',
                jsonp: "func",
                dataType: "jsonp",
                success: function (response) {
                    var resp = false;
                    if(!response || !response.items || response.items.length < 1){
                        resp = false;
                    }

                    else {
                        resp = response.items;
                    }

                    return callback.call(self, resp);
                },
                error: function(){
                    return callback.call(self, false);
                }
            });
        },

        //Panel behavior
        panelToggle: function ($panelNav, $panel) {
            $panelNav.click(function (e) {
                e.preventDefault();
                $panel.toggle();
            });
        },
        panelError: function () {

        },
        panelApply: function ($panelNav, $panel) {
            var self = this;
            var passed = true;
            var settings = {};
            $panel.find('input:text').each(function(ind, input){
                var $input = $(input);

                var val = $input.val();
                var name = $input.prop('name');
                if(val.length < 1){
                    passed = false;
                    alert('All fields are required');
                    return false;
                }

                settings[name] = val;
            });

            if(!passed){
                return false;
            }

            self.getData(settings, function (jsonData) {

                self.destroyViewer();

                if(!jsonData) {
                    $panelNav.addClass('with-error');
                    self.initViewer(self.defaults);
                }

                else{
                    $panelNav.removeClass('with-error');
                    self.initViewer(settings, jsonData);
                }


            });


        },
        panelInit: function ($panelNav, $panel, $panelButton) {
            var self = this;
            self.panelToggle($panelNav, $panel);


            $panelButton.click(function (e) {
                e.preventDefault();
                self.panelApply($panelNav, $panel);
            });

        },
        initAll: function () {
            var self = this;
            var $panel = $('.js_panel');
            var $panelNav = $('.js_panel_nav');
            var $panelButton = $('.js_panel_submit');

            self.getData(self.defaults, function (jsonData) {
                self.defaults.jsonData = jsonData
                self.initViewer(self.defaults);
            });

            self.panelInit($panelNav, $panel, $panelButton);
        }
    }
}(jQuery));