var _ = require('lodash');
var del = require('del');
var eslint = require('gulp-eslint');
var notify = require('gulp-notify');
var filesExist = require('files-exist');


module.exports = {
  init: function (gulp, config) {
    'use strict';

    /* ********************************************************************** */
    /* CONFIGS                                                                */
    /* ********************************************************************** */

    // Set vendor paths for url replacements
    _.each(config.configs, function (configValue, configKey) {
      config.configs[configKey].paths.vendor = config.paths.vendor;
    });

    /* ********************************************************************** */
    /* BASICS                                                                 */
    /* ********************************************************************** */

    // Install vendor assets
    gulp.task('install', function () {
      return del([config.paths.vendor.dest]).then(function () {
        _.each(config.configs, function (configValue, configKey) {
          if ('copy' in configValue.paths) {
            _.each(configValue.paths.copy, function (copy) {
              gulp.src(filesExist(copy.source, {root: copy.base}), {base: copy.base})
                .pipe(gulp.dest(config.paths.vendor.dest));
            });
          }
        });
      });
    });

    // Lint gulp tasks and configs
    gulp.task('lint', function () {
      return gulp.src(config.paths.scripts.lint)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(notify('Gulp linted!'));
    });


    /* ********************************************************************** */
    /* PREFIX TASKS                                                           */
    /* ********************************************************************** */

    _.each(config.configs, function (configValue, configKey) {
      _.each(config.tasks, function (taskValue, taskKey) {

        if (taskKey in configValue.paths) {

          // PREFIX TASKS WITH MODULE NAME
          _.each(taskValue.functions, function (functionValue, functionKey) {
            var taskname = configKey + '_' + functionKey;
            gulp.task(taskname, function () {
              return functionValue(configValue);
            });
          });

          // PREFIX ENVIRONMENTS WITH MODULE NAME
          _.each(taskValue.environments, function (envValue, envKey) {
            var subtasks = [];
            _.each(envValue, function (subtask) {
              subtasks.push(configKey + '_' + subtask);
            });
            var taskname = configKey + '_' + envKey;
            gulp.task(taskname, gulp.series(subtasks));
          });

        }

      });
    });


    /* ********************************************************************** */
    /* COMBINE TASKS                                                          */
    /* ********************************************************************** */

    _.each(config.configs, function (configValue, configKey) {
      _.each(config.envs, function (envValue, envKey) {

        var subtasks = [];
        _.each(config.tasks, function (taskValue, taskKey) {
          if (taskKey in configValue.paths) {
            subtasks.push(configKey + '_' + envKey + '_' + taskKey);
          }
        });

        var taskname = configKey + '_' + envKey;
        gulp.task(taskname, gulp.series(subtasks));

      });
    });


    /* ********************************************************************** */
    /* COMBINE CONFIGS                                                        */
    /* ********************************************************************** */

    _.each(config.envs, function (envValue, envKey) {
      var subtasks = [];
      _.each(config.configs, function (configValue, configKey) {
        subtasks.push(configKey + '_' + envKey);
      });

      var taskname = envKey + '';
      gulp.task(taskname, gulp.series(subtasks));

    });


    /* ********************************************************************** */
    /* MAIN                                                                   */
    /* ********************************************************************** */

    // Watch configuration.
    gulp.task('watch', async function () {
      gulp.watch(config.paths.scripts.watch, gulp.series(['lint']));

      _.each(config.configs, function (configValue, configKey) {
        if ('scripts' in configValue.paths) {
          gulp.watch(configValue.paths.scripts.watch, gulp.series([configKey + '_dev_scripts']));
        }
        if ('styles' in configValue.paths) {
          gulp.watch(configValue.paths.styles.watch, gulp.series([configKey + '_dev_styles']));
        }
        if ('svg' in configValue.paths) {
          gulp.watch(configValue.paths.svg.watch, gulp.series([configKey + '_dev_svg']));
        }
      });
    });

    // Default task and watch configuration.
    gulp.task('default', gulp.series(['dev', 'watch']));
  }
};
