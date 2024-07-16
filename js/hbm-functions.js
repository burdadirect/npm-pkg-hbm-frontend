window.HBM = (function () {
  'use strict';

  // Public
  var module = {};

  module.ajaxSecured = true;

  module.logPrefixEntry = 'HBM';
  module.logPrefixGroup = null;

  module.log = function (data) {
    if (module.logPrefixGroup) {
      console.group(module.logPrefixGroup);
    }
    console.log(module.logPrefixEntry + ': %o', data);
    if (module.logPrefixGroup) {
      console.groupEnd();
    }
  };

  module.flashNotificationFromArray = function (messages) {
    Object.keys(messages).forEach(function (messageIndex) {
      var text = messages[messageIndex]['text'] || null;
      var level = messages[messageIndex]['alert'] || messages[messageIndex]['level'] || null;
      if (text) {
        module.flashNotification(text, level);
      }
    });
  };

  module.flashNotification = function (text, level, showSeconds) {
    if (!level) {
      level = 'primary';
    }

    if (!showSeconds) {
      showSeconds = 2000;
    }

    var message = $('<div class="notification" style="display:none;"><div class="notification-content notification-level-' + level + '">' + text + '</div></div>');
    $('#notifications').append(message);
    message
      .show(
        'slide',
        {direction: 'up', easing: 'easeOutBounce'},
        800
      )
      .delay(showSeconds)
      .hide(
        'slide',
        {direction: 'left', easing: 'easeInQuint'}, // easeInElastic
        800,
        function () {
          message.remove();
        }
      );
  };

  module.initDateTimePicker = function ($element, options) {
    var settings = $.extend({
      yearRange: '-20:+5',
      hour: 0,
      minute: 0,
    }, options);

    $element.find('input.date-picker').each(function() {
      let customOptions = {};
      let customOptionsJson = $(this).attr('data-options-picker');
      if (customOptionsJson !== undefined) {
        customOptions = module.parseJson(customOptionsJson, {}, 'object');
      }

      $(this).datepicker($.extend({
        yearRange: settings['yearRange'],
        dateFormat: 'yy-mm-dd',
        changeYear: true,
        changeMonth: true
      }, customOptions));
    });

    $element.find('input.datetime-picker').each(function(item) {
      let customOptions = {};
      let customOptionsJson = $(this).attr('data-options-picker');
      if (customOptionsJson !== undefined) {
        customOptions = module.parseJson(customOptionsJson, {}, 'object');
      }

      $(this).datetimepicker($.extend({
        yearRange: settings['yearRange'],
        timeFormat: 'HH:mm',
        dateFormat: 'yy-mm-dd',
        changeYear: true,
        changeMonth: true,
        hour: settings['hour'],
        minute: settings['minute'],
      }, customOptions));
    });
  };

  module.initSortables = function ($element, options) {
    var settings = $.extend({
      force: false,
      spinner: 'fa fa-circle-notch fa-spin',
      message: 'Sortierung wurde gespeichert.',
      callback: function () {}
    }, options);

    if (settings.force) {
      $element.find('[data-sort]').sortable('destroy');
    }

    $element.find('[data-sort]:not(.ui-sortable)').sortable({
      handle: '[data-sort-handle]',
      items: '[data-sort-id]',
      axis: 'y',
      cursor: 'move',
      helper: function (event, element) {
        var $helper = $(element).clone();
        $(element).find('td').each(function (index) {
          $helper.find('td').eq(index).css('width', $(this).outerWidth());
        });
        return $helper;
      },
      create: function (event, ui) {
        $(this).find('[data-sort-handle]').css('cursor', 'move').show();
      },
      update: function (event, ui) {
        var ids = [];
        $(this).find('[data-sort-id]').each(function () {
          ids.push($(this).attr('data-sort-id'));
        });

        var $container = $(this);
        var $spinner = $('<i class="' + settings['spinner'] + '" />');
        var $indicator = $container.closest('section').find('.indicator');

        var url = $container.attr('data-sort');

        $container.fadeTo(0, 0.5);
        $indicator.append($spinner);
        $.post(url, {ids: ids}, function (response) {
          $container.fadeTo(0, 1);
          $indicator.empty();
          module.flashNotification(settings['message'], 'success');
          settings['callback'](response);
        });
      }
    });
  };

  module.initAjaxLinks = function ($element) {
    $element.on('click', '[data-ajax-click]', function (event) {
      event.preventDefault();

      if ($(this).get(0).hasAttribute('data-ajax-secured') && module.ajaxSecured) {
        return false;
      }

      // Check if there should be a confirm dialog.
      if ($(this).attr('data-ajax-confirm') && !confirm($(this).attr('data-ajax-confirm'))) {
        return;
      }

      var href = $(this).attr('href');
      var method = $(this).attr('data-ajax-method') || 'GET';
      var context = $(this).attr('data-ajax-click');
      var reset = $(this).get(0).hasAttribute('data-ajax-reset');
      var messages = $(this).attr('data-ajax-messages') | false;

      if (context) {
        var $target = $('[data-ajax-target="' + context + '"]');
        $target.fadeTo(500, 0.3);

        let jqxhr = $.ajax({type: method, url: href});

        jqxhr.done(function (response) {
          $target.html(response);
          $target.fadeTo(500, 1.0);

          var reloadUrls = $target.hbm_attrJson('data-ajax-reload-propagate') || [];
          $.each(reloadUrls, function (index, value) {
            $('[data-ajax-reload-trigger="' + value + '"]').hbm_reload();
          });

          module.flashNotificationsFromResponse(response, messages);
        });

        jqxhr.fail(function (data) {
          if (reset) {
            $target.fadeTo(500, 1.0);
          }
          module.flashNotificationsFromResponse(data.responseJSON, messages);
        });
      }
      else {

        var $reload = $(this).closest('[data-ajax-reload]');
        $reload.fadeTo(500, 0.3);

        let jqxhr = $.ajax({type: method, url: href});

        jqxhr.done(function (response) {
          if (response['success']) {
            $.get($reload.attr('data-ajax-reload'), function (responseReload) {
              $reload.html(responseReload);
              $reload.fadeTo(500, 1.0);
            });

            var reloadUrls = $reload.hbm_attrJson('data-ajax-reload-propagate') || [];
            $.each(reloadUrls, function (index, value) {
              $('[data-ajax-reload-trigger="' + value + '"]').hbm_reload();
            });
          }

          module.flashNotificationsFromResponse(response, messages);
        });

        jqxhr.fail(function (data) {
          if (reset) {
            $reload.fadeTo(500, 1.0);
          }
          module.flashNotificationsFromResponse(data.responseJSON, messages);
        });
      }
    });
  };

  module.initAjaxButtons = function ($element) {
    $element.on('click', 'a.btn.ajax', function (event) {
      event.preventDefault();

      var element = $(this);
      element.blur();

      // Check if there should be a confirm dialog.
      if (element.attr('data-confirm') && !confirm(element.attr('data-confirm'))) {
        return;
      }

      // Start loading animation.
      element.removeClass('loading-bg-success loading-bg-error').addClass('disabled loading-bg');

      $.post(element.attr('href'), function (response) {
        element.removeClass('disabled loading-bg');
        if (response['success']) {
          element.addClass('loading-bg-success');
        }
        else {
          element.addClass('loading-bg-error');
        }

        module.flashNotificationsFromResponse(response);
      });
    });
  };

  module.flashNotificationsFromResponse = function (response, seconds) {
    if (response['messages']) {
      $.each(response['messages'], function (key, value) {
        if (typeof value === 'object') {
          module.flashNotification(value['text'], value['alert'] || value['level'], seconds);
        }
        else {
          module.flashNotification(value, null, seconds);
        }
      });
    }
  };

  module.eventContainsFiles = function (event) {
    if (event.dataTransfer.types) {
      for (var i = 0; i < event.dataTransfer.types.length; i++) {
        if (event.dataTransfer.types[i] === 'Files') {
          return true;
        }
      }
    }

    return false;
  };

  module.escapeHTML = function (s) {
    if (typeof s === 'undefined') {
      return '';
    }

    return s.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  module.blobToDataUrl = function (blob, callback) {
    const a = new FileReader();
    a.onload = function(e) {callback(e.target.result);}
    a.readAsDataURL(blob);
  };

  module.parseJson = function (data, fallback = {}, type = null) {
    try {
      const parsedData = JSON.parse(data);
      if (type && (typeof parsedData !== type)) {
        return fallback;
      }
      return parsedData;
    } catch(e) {
      module.log('Parsing JSON failed: ' + data);
    }

    return fallback;
  };

  module.formatString = function (format, replacements) {
    return format.replace(
      /{(\w+)}/g,
      function (placeholderWithDelimiters, placeholderWithoutDelimiters) {
        return Object.hasOwn(replacements, placeholderWithoutDelimiters) ?
          replacements[placeholderWithoutDelimiters] : placeholderWithDelimiters;
      }
    );
  };

  module.initToggablePasswords = function () {
    $('[type="password"][data-toggable-password]').each(function () {
      let $element = $(this);

      let settings = {
        'template-title': 'Passwort ein-/ausblenden'
      };
      try {
        settings = {...settings, ...JSON.parse($element.attr('data-toggable-password'))};
      }
      catch(e) {
        module.log('initToggablePasswords: options can not be parsed.');
      }

      let $handle = $('<span class="input-group-append" style="cursor:pointer;" title="' + settings['template-title'] + '"><span class="input-group-text"><i class="fa fa-fw fa-eye-slash"></i></span></span>');

      $element.closest('.input-group').find('.input-group-append').before($handle);

      $handle.on('click', function (e) {
        e.preventDefault();

        $element.attr('type', ($element.attr('type') !== 'password') ? 'password' : 'text');
        $handle.find('.fa-eye-slash, .fa-eye').toggleClass('fa-eye-slash fa-eye');
      });
    });
  };

  module.initStrlenCounter = function (options) {
    let optionsDefault = {
      'min-class': 'alert-danger',
      'max-class': 'alert-danger',
      'template-min': 'min: {min}',
      'template-max': 'max: {max}',
      'template-limits': ' ({minAndOrMax})',
      'template-title': 'Anzahl Zeichen{limits}',
      'template-text': '{num} Zeichen'
    };

    let optionsToUse = {...optionsDefault, ...(options || {})};

    $('[type="text"][data-strlen-counter]').each(function () {
      let $element = $(this);

      // Handle options.
      let settings = optionsToUse;
      try {
        settings = {...settings, ...JSON.parse($element.attr('data-strlen-counter'))};
      }
      catch(e) {
        module.log('initStrlenCounter: options can not be parsed.');
      }

      let limitParts = [];
      if ('min' in settings) {
        limitParts.push(module.formatString(settings['template-min'], settings));
      }
      if ('max' in settings) {
        limitParts.push(module.formatString(settings['template-max'], settings));
      }

      let limitText = '';
      if (limitParts.length > 0) {
        limitText = module.formatString(settings['template-limits'], {minAndOrMax: limitParts.join(', ')});
      }

      // Prepare content.
      let $counter = $('<span class="input-group-text">n/a</span>');
      let $handle = $('<span class="input-group-append" title="' + module.formatString(settings['template-title'], {limits: limitText}) + '"></span>');

      $handle.append($counter);
      $element.closest('.input-group').find('.input-group-append').before($handle);

      // Handle event.
      $element.on('input', function () {
        let strlen = $element.val().length;

        if (('min' in settings) && (strlen < settings['min'])) {
          $counter.addClass(settings['min-class']);
        }
        else if (('max' in settings) && (strlen > settings['max'])) {
          $counter.addClass(settings['max-class']);
        }
        else {
          $counter.removeClass(settings['min-class']).removeClass(settings['max-class']);
        }

        $counter.text(module.formatString(settings['template-text'], {num: strlen}));
      });
      $element.trigger('input');
    });
  };

  return module;

})();
