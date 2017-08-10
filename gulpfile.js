'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    //uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    cssBase64 = require('gulp-css-base64'),
    sourcemaps = require('gulp-sourcemaps'),
    //rigger = require('gulp-rigger'),
    fileinclude = require('gulp-file-include'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    //mainBowerFiles = require('main-bower-files'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

var path = {
    build: {
        html: './build/',
        js: './build/js/',
        css: './build/css/',
        img: './build/img/',
        fonts: './build/fonts/',
        libs: './build/libs/',
    },
    src: {
        html: './src/*.html',
        js: [
            './bower_components/jquery/dist/jquery.js',
            './bower_components/selectize/dist/js/standalone/selectize.js',
            './bower_components/jquery.scrollbar/jquery.scrollbar.js',
            './bower_components/fancybox/dist/jquery.fancybox.js',
            './src/js/**/*.js',
        ],
        style: [
            './bower_components/bootstrap/dist/css/bootstrap.css',
            './bower_components/selectize/dist/css/selectize.bootstrap3.css',
            './bower_components/jquery.scrollbar/jquery.scrollbar.css',
            './bower_components/fancybox/dist/jquery.fancybox.css',
            './src/style/**/*.sass',
        ],
        img: './src/img/**/*.*',
        fonts: [
            './bower_components/bootstrap/dist/fonts/**/*.*',
            './src/fonts/**/*.*',
        ],
        libs: './src/libs/**/*.*',
    },
    watch: {
        html: './src/**/*.html',
        js: './src/js/**/*.js',
        style: './src/style/**/*.sass',
        img: './src/img/**/*.*',
        fonts: './src/fonts/**/*.*',
        libs: './src/lib/**/*.*',
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: './build'
    },
    host: 'localhost',
    port: 9000
};

gulp.task('webserver', function() {
    browserSync.init(config);
});

gulp.task('clean', function(cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function() {
    return gulp.src(path.src.html) 
        //.pipe(rigger())
        .pipe(fileinclude({
          prefix: '@@',
          basepath: '@file'
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function() {
    return gulp.src(path.src.js) 
        //.pipe(rigger()) 
        .pipe(fileinclude({
          prefix: '@@',
          basepath: '@file'
        }))
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        //.pipe(uglify()) 
        .pipe(sourcemaps.write()) 
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function() {
    return gulp.src(path.src.style) 
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['./src/style/'],
            errLogToConsole: true,
            outputStyle: 'expanded' //compressed
        }))
        .pipe(prefixer())
        .pipe(concat('all.css'))
        .pipe(cssBase64())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function() {
    return gulp.src(path.src.img) 
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img));
});

gulp.task('fonts:build', function() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
        .pipe(reload({stream: true}));
});

gulp.task('libs:build', function() {
    return gulp.src(path.src.libs) 
        .pipe(gulp.dest(path.build.libs))
        .pipe(reload({stream: true}));
});


gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build',
    'libs:build'
]);

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.watch.libs], function(event, cb) {
        gulp.start('libs:build');
    });
});

gulp.task('default', ['clean'], function(){
    gulp.start(['build', 'webserver', 'watch']);
});