var gulp = require('gulp');
var del = require('del');
var notify = require('gulp-notify');
var sass = require('gulp-sass')(require('sass'));
var sourcemaps = require('gulp-sourcemaps');
var postCss = require('gulp-postcss');
var postCssUrl = require('postcss-url');
var postCssAutoPrefixer = require('autoprefixer');
var postCssFlexbugsFixes = require('postcss-flexbugs-fixes');
var postCssCssNano = require('cssnano');
var concat = require('gulp-concat');
var filesExist = require('files-exist');
var path = require('path');


var Tasks = function () {
  'use strict';

  this.functions = {};

  /* ************************************************************************ */
  /* CSS BUILD                                                                */
  /* ************************************************************************ */

  this.functions['dev_styles_build'] = function (config) {
    var vendorSrcAbsolute = path.resolve(config.paths.vendor.src);

    if (typeof config.paths.styles.output.maps === 'undefined') {
      config.paths.styles.output.maps = config.paths.styles.output.dir + 'maps/';
    }

    del(config.paths.styles.output.dir + config.paths.styles.output.file);
    del(config.paths.styles.output.maps + config.paths.styles.output.file + '.map');

    return gulp.src(filesExist(config.paths.styles.source, {root: config.root}), {base: config.root})
      .pipe(sourcemaps.init())
      .pipe(
        sass({
          includePaths: config.paths.styles.sassInclude,
          relativeAssets: false
        }).on('error', sass.logError))
      .pipe(postCss([
        postCssUrl([{
          url: function(asset, dir, options, decl, warn, result) {
            console.log(asset);
            if (asset.pathname) {
              if (asset.absolutePath.startsWith(vendorSrcAbsolute)) {
                return asset.absolutePath.replace(vendorSrcAbsolute, config.paths.vendor.web);
              } else {
                return asset.url;
              }
            }
          }
        }]),
        postCssAutoPrefixer,
        postCssFlexbugsFixes
      ]))
      .pipe(concat(config.paths.styles.output.file))
      .pipe(sourcemaps.write(config.paths.styles.output.maps))
      .pipe(gulp.dest(config.paths.styles.output.dir))
      .pipe(notify(config.paths.styles.output.dir + config.paths.styles.output.file + ' compiled!'));
  };

  this.functions['prod_styles_build'] = function (config) {
    var vendorSrcAbsolute = path.resolve(config.paths.vendor.src);

    if (typeof config.paths.styles.output.maps === 'undefined') {
      config.paths.styles.output.maps = config.paths.styles.output.dir + 'maps/';
    }

    del(config.paths.styles.output.dir + config.paths.styles.output.file);
    del(config.paths.styles.output.maps + config.paths.styles.output.file + '.map');

    return gulp.src(filesExist(config.paths.styles.source, {root: config.root}), {base: config.root})
      .pipe(sourcemaps.init())
      .pipe(sass({
        errLogToConsole: true,
        includePaths: config.paths.styles.sassInclude,
        relativeAssets: false
      }))
      .pipe(postCss([
        postCssUrl([{
          url: function(asset, dir, options, decl, warn, result) {
            if (asset.absolutePath.startsWith(vendorSrcAbsolute)) {
              return asset.absolutePath.replace(vendorSrcAbsolute, config.paths.vendor.web);
            } else {
              return asset.url;
            }
          }
        }]),
        postCssAutoPrefixer,
        postCssFlexbugsFixes,
        postCssCssNano
      ]))
      .pipe(concat(config.paths.styles.output.file))
      .pipe(sourcemaps.write(config.paths.styles.output.maps))
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
