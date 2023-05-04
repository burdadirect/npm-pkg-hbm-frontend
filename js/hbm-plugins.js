jQuery.fn.hbm_attrJson = function (attr) {
  'use strict';

  var attrStr = jQuery(this).eq(0).attr(attr);
  var hashObj = null;

  try {
    hashObj = JSON.parse(attrStr.replace(/'/g, '"'));
  }
  catch (e) {
    // Do nothing.
  }

  return hashObj;
};


jQuery.fn.hbm_reload = function (options) {
  'use strict';

  var settings = jQuery.extend({
    to: 0.3,
    speed: 500,
    callback: function () {}
  }, options);

  this.each(function () {
    var $element = jQuery(this);
    var reload = $element.attr('data-ajax-reload');
    if (reload) {
      $element.fadeTo(settings['speed'], settings['to']);
      jQuery.get(reload, function (response) {
        $element.html(response);
        $element.fadeTo(settings['speed'], 1.0);
        settings['callback']();
      });
    }
  });

  return this;
};


jQuery.fn.hbm_scrollTo = function (options) {
  'use strict';

  var settings = jQuery.extend({
    duration: 1000,
    offset: 0,
    withoutMargin: true,
    container: 'html,body',
    relative: false
  }, options);

  this.each(function () {
    var $element = jQuery(this);

    var offset = $element.eq(0).offset().top;
    if (settings['relative']) {
      offset = $element.eq(0).position().top;
    }

    var marginCorrection = 0;
    if (settings['withoutMargin']) {
      marginCorrection = parseInt($element.eq(0).css('margin-top'));
    }

    jQuery(settings['container']).animate({
      scrollTop: offset - marginCorrection + settings['offset']
    }, settings['duration']);
  });

  return this;
};


jQuery.fn.hbm_initCollapsibleCards = function (options) {
  'use strict';

  var defaults = jQuery.extend({
    btn: 'btn btn-secondary float-right',
    iconOpen: 'fa fa-chevron-down',
    iconClose: 'fa fa-chevron-up',
  }, options);

  this.each(function () {
    var $element = jQuery(this);

    var optionsCustom = {};
    var optionsString = $element.attr('data-card-collapsible-options');
    if (optionsString) {
      optionsCustom = JSON.parse(optionsString);
    }

    var settings = jQuery.extend({}, defaults, optionsCustom);

    var state = $element.attr('data-card-collapsible');

    var icon = null;
    if (state === 'closed') {
      icon = '<i class="card-collapsible-icon ' + settings['iconOpen'] + '"></i>';
    }
    if (state === 'open') {
      icon = '<i class="card-collapsible-icon ' + settings['iconClose'] + '"></i>';
    }
    if (icon) {
      $element.find('> .card-header').append('<span class="' + settings['btn'] + '" data-card-collapsible-toggle="">' + icon + '</span>');
    }

    $element.on('click', '> .card-header [data-card-collapsible-toggle]', function (event) {
      event.preventDefault();

      jQuery(this).closest('[data-card-collapsible]').find('> .card-body.card-body-collapsible').toggle();
      jQuery(this).find('.card-collapsible-icon').toggleClass(settings['iconOpen']).toggleClass(settings['iconClose']);
    });
  });

  return this;
};


jQuery.fn.hbm_initToggables = function (options) {
  'use strict';

  var settings = jQuery.extend({
    target: 'body',
  }, options);

  var $target = jQuery(settings['target']);

  this.each(function () {
    var $element = jQuery(this);

    $element.on('click', '[data-toggable]', function (event) {
      event.preventDefault();

      var what = jQuery(this).attr('data-toggable');
      jQuery('[data-toggable="' + what + '"]').toggleClass('active');
      $target.toggleClass('visible-' + what);
    });
  });

  return this;
};
