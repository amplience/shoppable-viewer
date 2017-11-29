var buildConfig = require('json-loader!../build.json');

var modules = {};

buildConfig.modules.forEach(function (v, i) {
    modules[v] = require(`./../_modules/${v}/${v}.js`);
});

module.exports = modules;