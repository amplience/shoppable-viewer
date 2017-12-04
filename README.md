
# Shoppable viewer accelerator

This repository is intended as an accelerated starting point for creating responsive viewers to view [Amplience](http://www.amplience.com) media sets. These media sets can have imagery augmented with metadata using the Amplience POI application or automated processes. This will allow hotspots and polygons to be overlaid on the images which activate custom functionality on click or hover. It's quick to set up, easy to style and has lots of useful configuration options.

<div align="center">
    <a href="http://amplience.com/">
        <img src="http://i1.adis.ws/i/csdemo/pdf viewer?v=2" alt="Amplience Content Authoring" title="Amplience" style="margin-left:auto; margin-right:auto; display:block;" width="890px" height="300px" />
    </a>
</div>


## Table of Contents
- [Quick Start](#quick-start)
- [Demo](#demo)
- [Dependencies](#dependencies)
- [3rd-party libs](#3rd-party-libs)
- [Usage](#usage)
    - [Development](#development)
    - [Tests](#tests)
    - [Bug / Feature Request](#bug--feature-request)
- [Configuration](#configuration)
	- [Data](#data)
	- [Styling and Internationalisation](#styling-and-internationalisation)
	- [Imagery](#imagery)
	- [Carousel](#carousel)
- [License](#license)

## Quick Start

```bash
# Install dependencies
$ npm install

# Build project
$ gulp
```
[http://localhost:9100](http://localhost:9100)

## Demo
View our [demo](http://dev-solutions.s3.amazonaws.com/ca-demo-site/dist/shoppable-viewer/index.html#1)

## Dependencies
There is a 3rd party slider dependency ([http://idangero.us/swiper/](http://idangero.us/swiper/)), jquery or and other large libraries are not required.
The [Amplience POI js lib](https://github.com/amplience/poi-js-lib) is also used to render POI data and allow configuration of callbacks.

### 3rd-party libs
All 3d-party libs are pulled as npm dependencies and can be found in package.json.

## Usage
### Development
Want to contribute? Great!
To fix a bug or enhance an existing module, follow these steps:
- Fork the repo
- Create a new branch on your fork (`git checkout -b feature/improve-feature`)
- Make the appropriate changes in the files
- Add changes to reflect the changes made
- Commit your changes (`git commit -am 'Improve feature'`)
- Push to the branch (`git push origin improve-feature`)
- Create a Pull Request to the develop branch

### Tests
```bash
$ npm run server
$ npm run test
```

### Bug / Feature Request
If you find a bug, kindly open an issue [here](tc@amplience.com) by including your steps to reproduce and the expected result.
If you’d like to request a new function, feel free to do so by opening an issue [here](tc@amplience.com)

## Configuration

The following sections define the configuration options for the shoppable viewer. The configuration for the hotspots and polygons is included on the [Amplience POI js lib](https://github.com/amplience/poi-js-lib) page.

### Data

The viewer can be configured to use an Amplience media set or a list of Amplience assets.
```
useData: 'set' || 'json'
```

If set to use set the following configuration can be added to specify an Amplience media set.

```
setData: {
        type: 's',
        account: 'csdemo',
        path: 'http://i1.adis.ws/',
        name: 'CA-catalogue_set',
    }
```

If set to use JSON to specify a list of assets.

```
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
        }]
 ```

### Styling and Internationalisation

The main elements of the viewer can be styled using the following parameters which allow your own CSS classes to be defined. The target parameter specifies the container where the viewer will be placed. The text values can be specified to facilitate internationalisation. There are also 2 url properties to link to external pages; all catalogs is intended as a page listing the catalogs available, download is the link to staticly published PDF if one exists, so that a customer can download the original. If these elements are not defined they will not be rendered so that the listing page and PDF download links can easily be omitted

```
target: ".ajs-pdf-viewer",
templateClass: 'apdf-standard-template',
wrapperClass: 'apdf-carousel-wrap',
titleClass: 'apdf-catalog-title',
title: 'Catalog',
pageOfTxt: 'of',
pagingClasses: {
	current: 'apdf-current-page',
	last: 'apdf-last-page',
	of: 'apdf-page-of'
},
carouselClass: {
	next: 'swiper-button-next apdf-swiper-next-custom',
	prev: 'swiper-button-prev apdf-swiper-prev-custom',
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
}
```

### Imagery

The imagery in the viewer can be configured using the ampTemplates object This contains a property called thumb which defines the Amplience dynamic media parameters to be appended to the images in the contents page, in the example below we have used an Amplience transformation template. It also contains an array which represents the breakpoints for images and the parameters to be used for each, plus a fallback for older browsers. The tpl and tpl2x parameters specify the normal and 2x resolution parameters, these can be Amplience transformation templates or a list of Amplience dynamic media parameters.

```
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
		tpl2x: 'w=3200&qlt=60'
	}
	]
}
```

### Carousel

The parameters for the carousel have been exposed from a select list we have chosen to make available from this list of [swiper params](http://idangero.us/swiper/api/#parameters)

```
carousel: {
	nextButton: '.ajs-swiper-next-' + id,
	prevButton: '.ajs-swiper-prev-' + id,
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
	lazyLoadingOnTransitionStart: true
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
}
```

### License ###
This software is provided under Apache License, Version 2.0. More details in ```LICENSE.MD```