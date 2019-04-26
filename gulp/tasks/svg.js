var gulp = require('gulp');
var del = require('del');
var notify = require('gulp-notify');
var svgSprite = require('gulp-svg-sprite');


var Tasks = function () {
  'use strict';

  this.functions = {};

  /* ************************************************************************ */
  /* GENERAL                                                                  */
  /* ************************************************************************ */

  var svg_stack = function (config) {
    del(config.paths.svg.output.path + config.paths.svg.output.file);

    return gulp.src(config.paths.svg.source)
      .pipe(svgSprite({
        mode: {
          symbol: {
            dest: '.',
            sprite: config.paths.svg.output.file
          }
        }
      }))
      .pipe(gulp.dest(config.paths.svg.output.dir))
      .pipe(notify(config.paths.svg.output.dir + config.paths.svg.output.file + ' stacked!'));
  };

  /* ************************************************************************ */
  /* SVG STACK                                                                */
  /* ************************************************************************ */

  this.functions['dev_svg_stack'] = svg_stack;

  this.functions['prod_svg_stack'] = svg_stack;


  /* ************************************************************************ */
  /* COMBINATION                                                              */
  /* ************************************************************************ */

  this.environments = {
    dev_svg: ['dev_svg_stack'],
    prod_svg: ['prod_svg_stack']
  };

};

module.exports = new Tasks();
