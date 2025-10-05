var gulp = require('gulp');
var del = require('del');
var eslint = require('gulp-eslint');
var concat = require('gulp-concat');
var notify = require('gulp-notify');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var filesExist = require('files-exist');


var Tasks = function () {
  'use strict';

  this.functions = {};

  /* ************************************************************************ */
  /* JS LINT                                                                  */
  /* ************************************************************************ */

  this.functions['dev_scripts_lint'] = function (config) {
    return gulp.src(config.paths.scripts.lint)
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(notify(config.name + ' scripts linted!'));
  };

  this.functions['prod_scripts_lint'] = function (config) {
    return gulp.src(config.paths.scripts.lint)
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  };


  /* ************************************************************************ */
  /* JS BUILD                                                                 */
  /* ************************************************************************ */

  this.functions['dev_scripts_build'] = function (config) {
    if (typeof config.paths.scripts.output.maps === 'undefined') {
      config.paths.scripts.output.maps = './maps/';
    }

    del(config.paths.scripts.output.dir + config.paths.scripts.output.file);
    del(config.paths.scripts.output.dir + config.paths.scripts.output.maps + config.paths.scripts.output.file + '.map');

    return gulp.src(filesExist(config.paths.scripts.source, {root: config.root}), {base: config.root})
      .pipe(sourcemaps.init())
      .pipe(concat(config.paths.scripts.output.file))
      .pipe(sourcemaps.write(config.paths.scripts.output.maps))
      .pipe(gulp.dest(config.paths.scripts.output.dir))
      .pipe(notify(config.paths.scripts.output.dir + config.paths.scripts.output.file + ' compiled!'));
  };

  this.functions['prod_scripts_build'] = function (config) {
    if (typeof config.paths.scripts.output.maps === 'undefined') {
      config.paths.scripts.output.maps = './maps/';
    }

    del(config.paths.scripts.output.dir + config.paths.scripts.output.file);
    del(config.paths.scripts.output.dir + config.paths.scripts.output.maps + config.paths.scripts.output.file + '.map');

    return gulp.src(filesExist(config.paths.scripts.source, {root: config.root}), {base: config.root})
      .pipe(sourcemaps.init())
      .pipe(concat(config.paths.scripts.output.file))
      .pipe(uglify())
      .pipe(sourcemaps.write(config.paths.scripts.output.maps))
      .pipe(gulp.dest(config.paths.scripts.output.dir));
  };


  /* ************************************************************************ */
  /* COMBINATION                                                              */
  /* ************************************************************************ */

  this.environments = {
    dev_scripts: ['dev_scripts_lint', 'dev_scripts_build'],
    prod_scripts: ['prod_scripts_lint', 'prod_scripts_build']
  };

};

module.exports = new Tasks();
