var gulp = require('gulp');
var del = require('del');
var notify = require('gulp-notify');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var postCss = require('gulp-postcss');
var postCssAutoPrefixer = require('autoprefixer');
var postCssFlexbugsFixes = require('postcss-flexbugs-fixes');
var postCssCssNano = require('cssnano');
var concat = require('gulp-concat');
var rebaseUrls = require('gulp-css-url-rebase');
var adjustUrls = require('gulp-css-url-adjuster');
var filesExist = require('files-exist');


var Tasks = function () {
  'use strict';

  this.functions = {};

  /* ************************************************************************ */
  /* CSS BUILD                                                                */
  /* ************************************************************************ */

  this.functions['dev_styles_build'] = function (config) {
    del(config.paths.styles.output.dir + config.paths.styles.output.file);

    return gulp.src(filesExist(config.paths.styles.source, {root: config.root}), {base: config.root})
      .pipe(rebaseUrls())
      .pipe(adjustUrls({
        replace: [config.paths.vendor.src, config.paths.vendor.web]
      }))
      .pipe(sourcemaps.init())
      .pipe(
        sass({
          includePaths: config.paths.styles.sassInclude,
          relativeAssets: false
        }).on('error', sass.logError))
      .pipe(postCss([
        postCssAutoPrefixer({
          browsers: ['last 2 versions']
        }),
        postCssFlexbugsFixes
      ]))
      .pipe(concat(config.paths.styles.output.file))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(config.paths.styles.output.dir))
      .pipe(notify(config.paths.styles.output.dir + config.paths.styles.output.file + ' compiled!'));
  };

  this.functions['prod_styles_build'] = function (config) {
    del(config.paths.styles.output.dir + config.paths.styles.output.file);

    return gulp.src(filesExist(config.paths.styles.source, {root: config.root}), {base: config.root})
      .pipe(rebaseUrls())
      .pipe(adjustUrls({
        replace: [config.paths.vendor.src, config.paths.vendor.web]
      }))
      .pipe(sourcemaps.init())
      .pipe(sass({
        errLogToConsole: true,
        includePaths: config.paths.styles.sassInclude,
        relativeAssets: false
      }))
      .pipe(postCss([
        postCssAutoPrefixer({
          browsers: ['last 2 versions']
        }),
        postCssFlexbugsFixes,
        postCssCssNano
      ]))
      .pipe(concat(config.paths.styles.output.file))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(config.paths.styles.output.dir));
  };


  /* ************************************************************************ */
  /* COMBINATION                                                              */
  /* ************************************************************************ */

  this.environments = {
    dev_styles: ['dev_styles_build'],
    prod_styles: ['prod_styles_build']
  };

};

module.exports = new Tasks();
