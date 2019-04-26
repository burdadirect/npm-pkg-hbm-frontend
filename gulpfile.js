var gulp = require('gulp');
var eslint = require('gulp-eslint');
var notify = require('gulp-notify');

var config = {
  paths: {
    scripts: {
      lint: [
        './gulp/**/*.js',
        './gulpfile.js'
      ],
      watch: [
        './gulp/**/*.js',
        './gulpfile.js'
      ]
    }
  }
};


/* ************************************************************************** */
/* LINT                                                                       */
/* ************************************************************************** */

gulp.task('lint', function () {
  'use strict';

  return gulp.src(config.paths.scripts.lint)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(notify('Gulp linted!'));
});


/* ************************************************************************** */
/* WATCH                                                                      */
/* ************************************************************************** */

gulp.task('watch', function () {
  'use strict';

  return gulp.watch(config.paths.scripts.watch, gulp.series(['lint']));
});


/* ************************************************************************** */
/* DEFAULT                                                                    */
/* ************************************************************************** */

gulp.task('default', gulp.series(['lint', 'watch']));

