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
    offset: 0
  }, options);

  this.each(function () {
    var $element = jQuery(this);

    jQuery('html,body').animate({
      scrollTop: $element.eq(0).offset().top + settings['offset']
    }, settings['duration']);
  });

  return this;
};


jQuery.fn.hbm_initCollapsibleCards = function () {
  'use strict';

  this.each(function () {
    var $element = jQuery(this);

    $element.find('[data-card-collapsible="closed"]').each(function () {
      var icon = '<i class="fa fa-chevron-down"></i>';
      jQuery(this).find('> .card-header.hbm-form-header').append('<span class="btn btn-secondary float-right" data-card-collapsible-toggle="">' + icon + '</span>');
    });

    $element.find('[data-card-collapsible="open"]').each(function () {
      var icon = '<i class="fa fa-chevron-up"></i>';
      jQuery(this).find('> .card-header.hbm-form-header').append('<span class="btn btn-secondary float-right" data-card-collapsible-toggle="">' + icon + '</span>');
    });

    $element.on('click', '[data-card-collapsible-toggle]', function (event) {
      event.preventDefault();

      jQuery(this).closest('[data-card-collapsible]').find('> .card-body.hbm-form-body.hbm-form-body-collapsible').toggle();
      jQuery(this).find('.fa-chevron-up,.fa-chevron-down').toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
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
