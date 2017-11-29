
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
    - [Tests](#development)
    - [Bug / Feature Request](#bug--feature-request)
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
View our [demo](http://dev-solutions.s3.amazonaws.com/ca-demo-site/dist/shoppable-pdf-viewer/index.html#1)

## Dependencies
There is a 3rd party slider dependency, jquery or and other large libraries are not required.
The [Amplience POI js lib](https://github.com/amplience/poi-js-lib) is also used to render POI data and allow configuration of callbacks.

### 3rd-party libs
All 3d-party libs are pulled as npm dependencies and can be found in package.json

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

### License ###
This software is provided under Apache License, Version 2.0. More details in ```LICENSE.MD```