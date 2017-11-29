var gulp = require('gulp');
var webpack = require('webpack');
var browserSync = require('browser-sync').create();
var watch = require('gulp-watch');
var connect = require('gulp-connect');
var modulesConfig = require('./src/build.json');
var clean = require('gulp-clean');
var processhtml = require('gulp-processhtml');
var rename = require('gulp-rename');
var minifyCss = require('gulp-clean-css');
var uglifyJs = require('gulp-uglifyjs');

var production = false;
var prodIndex = process.argv.indexOf("--prod");
if (prodIndex > -1) {
    production = true;
}

var webpackConfig = require('./webpack.config')(production);

gulp.task('webpack', ['copy'], function (done) {
    return webpack(webpackConfig, function (error) {
        if (error) {
            console.error(error);
        }

        if (done) {
            done();
        }
    });
});

gulp.task('server', function () {
    return connect.server({
        port: 9100,
        hostname: '0.0.0.0',
        base: './src',
        livereload: true,
        debug: true
    });
});

gulp.task('clean', function () {
    return gulp.src('./src/_modules', {read: false})
        .pipe(clean({force: true}));
});

gulp.task('copy', ['clean'], function () {
    var modules = [];
    modulesConfig.modules.forEach(function (v) {
        var route = 'modules/' + v + '/**/*';
        modules.push(route);
    });

    return gulp.src(modules, {
        base: 'modules'
    })
        .pipe(gulp.dest('./src/_modules/'));
});


gulp.task('watch', function (done) {
    watch(['./modules', './src/js/**/*', './src/sass/**/*', './src/templates/**/*', './index.html'], function () {
        gulp.start('build');
    });
});


gulp.task('build', ['webpack', 'minifyCSS'], function () {
    return gulp.src(['./src/js/*.*'])
        .pipe(connect.reload())
});


gulp.task('minifyCSS', ['webpack'], function () {
    return gulp.src(['./dist/*.css', '!./dist/*.min.css'])
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist'))
});

gulp.task('uglifyJs', ['webpack'], function () {
    return gulp.src(['./dist/*.js', '!./dist/*.min.js'])
        .pipe(uglifyJs('bundle.min.js', {
            outSourceMap: true
        }))
        .pipe(gulp.dest('./dist'))
});


gulp.task('processhtml', function () {
    return gulp.src('./*.html')
        .pipe(processhtml())
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['webpack', 'watch', 'server', 'processhtml', 'minifyCSS', 'uglifyJs']);