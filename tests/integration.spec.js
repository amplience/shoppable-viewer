var expectedNumberOfPages = 4;
var viewerData = null;

module.exports = {
    'Viewer tests': function (browser) {
        browser.url('http://localhost:8000/tests/test.html')
            .waitForElementPresent('.apdf-carousel-wrap', 1000)
            .execute('return window.test.viewerData', [], function (response) {
                viewerData = response.value;
                this.assert.ok(viewerData.set.length > 1, "Set Data retrieved successfully");
            })

            .execute([], function (response) {
                this.assert.ok(viewerData.numPages === expectedNumberOfPages, "Viewer has correct number of pages");
            })
            .getAttribute('.swiper-slide[data-hash="3"] img.swiper-slide-img', "src", function (result) {
                this.assert.ok(result.value === null, "Lazyloading check part 1 success. 3-rd image doesn't have attribute src");
            })
            .click('.swiper-button-next')
            .pause(600)
            .getAttribute('.swiper-slide[data-hash="3"] img.swiper-slide-img', "src", function (result) {
                this.assert.ok(result.value.length > 0, "Lazyloading check part 2 success. 3-rd image has proper src attribute, after navigating forward");
            })
            .execute('return window.location.hash', [], function (response) {

                this.assert.ok(response.value === '#2', "Deep linking is working");
                browser.getAttribute(".swiper-slide-active", "data-hash", function (result) {
                    this.assert.ok(result.value === '2', 'Next navigation works as expected');
                })
                    .click('.swiper-button-prev')
                    .pause(600)
                    .getAttribute(".swiper-slide-active", "data-hash", function (result) {
                        this.assert.ok(result.value === '1', 'Previous navigation works as expected');
                    })
            })
            .execute([], function (response) {
                browser.getAttribute(".apdf-icon-download", "download", function (result) {
                    this.assert.ok(result.value === '', 'Download link is present and works as expected');
                })
            })
            .execute([], function (response) {
                browser.click('.ajs-open-contents')
                    .pause(600)
                    .click('.ajs-contents-thumb:nth-of-type(3)')
                    .pause(600)
                    .getAttribute(".swiper-slide-active", "data-hash", function (result) {
                        this.assert.ok(result.value === '3', 'Contents page navigation to a specific page number works as expected');
                    })

            })
            .execute([], function (response) {
                browser.click('.ajs_zoom_init')
                    .pause(1000)
                    .getAttribute("img.ajs-zoomed", "src", function (result) {
                        this.assert.ok(result.value.length > 1, 'Zoom functionality works as expected');
                    })

            })
            .end()
    }
}
