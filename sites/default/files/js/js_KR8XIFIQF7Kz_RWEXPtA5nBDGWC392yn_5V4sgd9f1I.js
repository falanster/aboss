(function ($) {

/**
 * Provide the HTML to create the modal dialog.
 * Clone of function Drupal.theme.prototype.CToolsModalDialog.
 */
Drupal.theme.prototype.HybridAuthModalDialog = function () {
  var html = '';
  html += '  <div id="ctools-modal">';
  html += '    <div id="hybridauth-modal">';
  html += '      <div class="ctools-modal-content">';
  html += '        <div class="modal-header">';
  html += '          <a class="close" href="#">';
  html += Drupal.CTools.Modal.currentSettings.closeText + Drupal.CTools.Modal.currentSettings.closeImage;
  html += '          </a>';
  html += '          <span id="modal-title" class="modal-title"></span>';
  html += '        </div>';
  html += '        <div id="modal-content" class="modal-content">';
  html += '        </div>';
  html += '      </div>';
  html += '    </div>';
  html += '  </div>';

  return html;
};

})(jQuery);
;
(function ($) {

  Drupal.behaviors.hybridauth_onclick = {};
  Drupal.behaviors.hybridauth_onclick.attach = function(context, settings) {
    $('.hybridauth-onclick-current', context).bind('click', function() {
      $(this).parents('.hybridauth-widget').after('<div>' + Drupal.t('Contacting') + ' ' + this.title + '...</div>');
    });
    $('.hybridauth-onclick-popup', context).bind('click', function() {
      var width = $(this).attr('data-hybridauth-width'), height = $(this).attr('data-hybridauth-height');
      var popup_window = window.open(
        this.href,
        'hybridauth',
        'location=no,menubar=no,resizable=yes,scrollbars=yes,status=no,titlebar=yes,toolbar=no,channelmode=yes,fullscreen=yes,width=' + width + ',height=' + height
      );
      popup_window.focus();
      return false;
    });

    // Last used provider feature.
    var last_provider = $.cookie('hybridauth_last_provider');
    if (last_provider != null) {
      $('[data-hybridauth-provider="' + last_provider + '"]').addClass('hybridauth-last-provider');
    }
    $('.hybridauth-widget-provider', context).bind('click', function() {
      $.cookie('hybridauth_last_provider', $(this).attr('data-hybridauth-provider'), {expires: 30, path: '/'});
    });
  };

})(jQuery);
;
(function ($) {
Drupal.settings.views = Drupal.settings.views || {'ajax_path': '/views/ajax'};

Drupal.quicktabs = Drupal.quicktabs || {};

Drupal.quicktabs.getQTName = function (el) {
  return el.id.substring(el.id.indexOf('-') +1);
}

Drupal.behaviors.quicktabs = {
  attach: function (context, settings) {
    $.extend(true, Drupal.settings, settings);
    $('.quicktabs-wrapper', context).once(function(){
      Drupal.quicktabs.prepare(this);
    });
  }
}

// Setting up the inital behaviours
Drupal.quicktabs.prepare = function(el) {
  // el.id format: "quicktabs-$name"
  var qt_name = Drupal.quicktabs.getQTName(el);
  var $ul = $(el).find('ul.quicktabs-tabs:first');
  $ul.find('li a').each(function(i, element){
    element.myTabIndex = i;
    element.qt_name = qt_name;
    var tab = new Drupal.quicktabs.tab(element);
    var parent_li = $(element).parents('li').get(0);
    if ($(parent_li).hasClass('active')) {
      $(element).addClass('quicktabs-loaded');
    }
    $(element).once(function() {$(this).bind('click', {tab: tab}, Drupal.quicktabs.clickHandler);});
  });
}

Drupal.quicktabs.clickHandler = function(event) {
  var tab = event.data.tab;
  var element = this;
  // Set clicked tab to active.
  $(this).parents('li').siblings().removeClass('active');
  $(this).parents('li').addClass('active');

  // Hide all tabpages.
  tab.container.children().addClass('quicktabs-hide');
  
  if (!tab.tabpage.hasClass("quicktabs-tabpage")) {
    tab = new Drupal.quicktabs.tab(element);
  }

  tab.tabpage.removeClass('quicktabs-hide');
  return false;
}

// Constructor for an individual tab
Drupal.quicktabs.tab = function (el) {
  this.element = el;
  this.tabIndex = el.myTabIndex;
  var qtKey = 'qt_' + el.qt_name;
  var i = 0;
  for (var i = 0; i < Drupal.settings.quicktabs[qtKey].tabs.length; i++) {
    if (i == this.tabIndex) {
      this.tabObj = Drupal.settings.quicktabs[qtKey].tabs[i];
      this.tabKey = i;
    }
  }
  this.tabpage_id = 'quicktabs-tabpage-' + el.qt_name + '-' + this.tabKey;
  this.container = $('#quicktabs-container-' + el.qt_name);
  this.tabpage = this.container.find('#' + this.tabpage_id);
}

if (Drupal.ajax) {
  /**
   * Handle an event that triggers an AJAX response.
   *
   * We unfortunately need to override this function, which originally comes from
   * misc/ajax.js, in order to be able to cache loaded tabs, i.e. once a tab
   * content has loaded it should not need to be loaded again.
   *
   * I have removed all comments that were in the original core function, so that
   * the only comments inside this function relate to the Quicktabs modification
   * of it.
   */
  Drupal.ajax.prototype.eventResponse = function (element, event) {
    var ajax = this;

    if (ajax.ajaxing) {
      return false;
    }
  
    try {
      if (ajax.form) {
        if (ajax.setClick) {
          element.form.clk = element;
        }
  
        ajax.form.ajaxSubmit(ajax.options);
      }
      else {
        // Do not perform an ajax request for already loaded Quicktabs content.
        if (!$(element).hasClass('quicktabs-loaded')) {
          ajax.beforeSerialize(ajax.element, ajax.options);
          $.ajax(ajax.options);
          if ($(element).parents('ul').hasClass('quicktabs-tabs')) {
            $(element).addClass('quicktabs-loaded');
          }
        }
      }
    }
    catch (e) {
      ajax.ajaxing = false;
      alert("An error occurred while attempting to process " + ajax.options.url + ": " + e.message);
    }
    return false;
  };
}


})(jQuery);
;
