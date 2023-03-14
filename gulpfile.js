'use strict'

const gulp = require('gulp'),
  concat = require('gulp-concat'),
  prefixer = require('gulp-autoprefixer'),
  uglify = require('gulp-uglify'),
  sass = require('gulp-sass')(require('node-sass')),
  cssmin = require('gulp-clean-css'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  rimraf = require('rimraf'),
  sourcemaps = require('gulp-sourcemaps'),
  browserSync = require("browser-sync").create(),
  reload = browserSync.reload;

let path = {
  build: {
    html: './build',
    css: './build/styles/css/',
    img: './build/img/',
    js: './build/js'
  },
  src: {
    html: './src/*.html',
    style: './src/styles/scss/main.scss',
    img: './src/img/**/*.*',
    js: 'src/js/main.js'
  },
  watch: {
    html: './src/*.html',
    style: './src/styles/scss/*.scss',
    img: './src/img/**/*.*',
    js: './src/js/**/*.js'
  },
  clean: './build'
}

let config = {
  server: {
    baseDir: "./build",
    index: "index.html"
  },
  tunnel: true,
  host: 'localhost',
  port: 9000
}

function buildHtml() {
  return gulp.src(path.src.html)
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({ stream: true }));
}

function buildCss() {
  return gulp.src(path.src.style)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(prefixer())
    .pipe(cssmin())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({ stream: true }));
}

function buildImg() {
  return gulp.src(path.src.img)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngquant()],
      interlaced: true
    }))
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({ stream: true }));
}

function buildJS() {
  return gulp.src(path.src.js)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({ stream: true }));
}

function serve() {
  return browserSync.init(config);
}

function watch() {
  gulp.watch(path.watch.html, buildHtml);
  gulp.watch(path.watch.style, buildCss);
  gulp.watch(path.watch.img, buildImg);
  gulp.watch(path.watch.js, buildJS);
}

function clean() {
  return rimraf(path.clean);
}

exports.build = gulp.series(buildHtml, buildCss, buildImg, buildJS);
exports.clean = clean;
exports.watch = watch;
exports.buildHtml = buildHtml;
exports.buildCss = buildCss;
exports.buildImg = buildImg;
exports.buildJS = buildJS;
exports.serve = serve;
exports.default = gulp.series(clean, gulp.series(buildHtml, buildCss, buildImg, buildJS), serve, watch);