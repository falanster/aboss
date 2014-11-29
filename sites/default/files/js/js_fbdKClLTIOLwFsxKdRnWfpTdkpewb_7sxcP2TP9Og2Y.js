(function ($) {
  /**
   * Provide the HTML to create the modal dialog.
   * Clone of function Drupal.theme.prototype.CToolsModalDialog.
   */
  Drupal.theme.prototype.TypoModalDialog = function () {
    var html = ''
    html += '  <div id="ctools-modal">'
    html += '    <div id="typo-modal">'
    html += '      <div class="ctools-modal-content">' // panels-modal-content
    html += '        <div class="modal-header">';
    html += '          <a id="close" href="#">';
    html +=              Drupal.CTools.Modal.currentSettings.closeText + Drupal.CTools.Modal.currentSettings.closeImage;
    html += '          </a>';
    html += '          <span id="modal-title" class="modal-title">&nbsp;</span>';
    html += '        </div>';
    html += '        <div id="typo-modal-content" class="modal-content">';
    html += '        </div>';
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';

    return html;
  }
})(jQuery);;
/**
 * Function finds selected text.
 */
function typo_get_sel_text() {
  if (window.getSelection) {
    txt = window.getSelection();
    selected_text = txt.toString();
    full_text = txt.anchorNode.textContent;
    selection_start = txt.anchorOffset;
    selection_end = txt.focusOffset;
  }
  else if (document.getSelection) {
    txt = document.getSelection();
    selected_text = txt.toString();
    full_text = txt.anchorNode.textContent;
    selection_start = txt.anchorOffset;
    selection_end = txt.focusOffset;
  }
  else if (document.selection) {
    txt = document.selection.createRange();
    selected_text = txt.text;
    full_text = txt.parentElement().innerText;

    var stored_range = txt.duplicate();
    stored_range.moveToElementText(txt.parentElement());
    stored_range.setEndPoint('EndToEnd', txt);
    selection_start = stored_range.text.length - txt.text.length;
    selection_end = selection_start + selected_text.length;
  }
  else {
    return;
  }

  var txt = {
    selected_text: selected_text,
    full_text: full_text,
    selection_start: selection_start,
    selection_end: selection_end
  };

  return txt;
}

/**
 * Function gets a context of selected text.
 */
function typo_get_sel_context(sel) {
  selection_start = sel.selection_start;
  selection_end = sel.selection_end;
  if (selection_start > selection_end) {
    tmp = selection_start;
    selection_start = selection_end;
    selection_end = tmp;
  }
  
  context = sel.full_text;

  context_first = context.substring(0, selection_start);
  context_second = '<strong>' + context.substring(selection_start, selection_end) + '</strong>';
  context_third = context.substring(selection_end, context.length);
  context = context_first + context_second + context_third;
  
  context_start = selection_start - 60;
  if (context_start < 0) {
    context_start = 0;
  }

  context_end = selection_end + 60;
  if (context_end > context.length) {
    context_end = context.length;
  }

  context = context.substring(context_start, context_end);

  context_start = context.indexOf(' ') + 1;

  if (selection_start + 60 < context.length) {
    context_end = context.lastIndexOf(' ', selection_start + 60);
  }
  else {
    context_end = context.length;
  }

  selection_start = context.indexOf('<strong>');
  if (context_start > selection_start) {
    context_start = 0;
  }

  if (context_start) {
    context = context.substring(context_start, context_end);
  }

  return context;
}
;
(function ($) {
  // Show typo report window on Ctrl + Enter.
  // TODO: move this lines to behaviors.
  $(document).keydown(function(event) {
    if (event.ctrlKey && event.keyCode == 13) {
      $.fn.typo_report_window();
    }
  });

  // callback for Drupal ajax_command_invoke function
  $.fn.typo_js_callback = function(res) {
    $('#typo-report-message').css({'display': 'none'});
    $('#typo-report-result').css({'display': 'block'}).html(Drupal.t('Your message has been sent. Thank you.'));
    setTimeout(modalContentClose, 1000);
  };
  
  /**
   * Function restores typo report form if form was shown, but report was not sent.
   */
  function typo_restore_form() {
    if($('#typo-report-result').css('display') == 'none') {
      $('#typo-report-content').appendTo('#typo-report-wrapper');
    }
  }

  /**
   * Function shows modal window.
   */
  $.fn.typo_report_window = function() {
    var sel = typo_get_sel_text();
    if (sel.selected_text.length > Drupal.settings.typo.max_chars) {
      alert(Drupal.t('No more than !max_chars characters can be selected when creating a typo report.', {'!max_chars': Drupal.settings.typo.max_chars}));
    }
    else if (sel.selected_text.length == 0) {
    }
    else {
      // Get selection context.
      var context = typo_get_sel_context(sel);

      // Show dialog.
      Drupal.CTools.Modal.show(Drupal.settings.TypoModal);
      $('#typo-modal-content').html('&nbsp;');
      $('#typo-report-content').appendTo('#typo-modal-content');
      
      $('#typo-context-div').html(context);
      $('#typo-context').val(context);
      $('#typo-url').val(window.location);

      // Close modal by Esc press.
      $(document).keydown(typo_close = function(e) {
        if (e.keyCode == 27) {
          typo_restore_form();
          modalContentClose();
          $(document).unbind('keydown', typo_close);
        }
      });

      // Close modal by clicking outside the window.
      $('#modalBackdrop').click(typo_click_close = function(e) {
        typo_restore_form();
        modalContentClose();
        $('#modalBackdrop').unbind('click', typo_click_close);
      });

      // Close modal by "close" link click.
      $('#close').click(function(e) {
        typo_restore_form();
        modalContentClose();
        $(document).unbind('keydown', typo_close);
      });
    }
  };
})(jQuery);;
(function ($) {

/**
 * A progressbar object. Initialized with the given id. Must be inserted into
 * the DOM afterwards through progressBar.element.
 *
 * method is the function which will perform the HTTP request to get the
 * progress bar state. Either "GET" or "POST".
 *
 * e.g. pb = new progressBar('myProgressBar');
 *      some_element.appendChild(pb.element);
 */
Drupal.progressBar = function (id, updateCallback, method, errorCallback) {
  var pb = this;
  this.id = id;
  this.method = method || 'GET';
  this.updateCallback = updateCallback;
  this.errorCallback = errorCallback;

  // The WAI-ARIA setting aria-live="polite" will announce changes after users
  // have completed their current activity and not interrupt the screen reader.
  this.element = $('<div class="progress" aria-live="polite"></div>').attr('id', id);
  this.element.html('<div class="bar"><div class="filled"></div></div>' +
                    '<div class="percentage"></div>' +
                    '<div class="message">&nbsp;</div>');
};

/**
 * Set the percentage and status message for the progressbar.
 */
Drupal.progressBar.prototype.setProgress = function (percentage, message) {
  if (percentage >= 0 && percentage <= 100) {
    $('div.filled', this.element).css('width', percentage + '%');
    $('div.percentage', this.element).html(percentage + '%');
  }
  $('div.message', this.element).html(message);
  if (this.updateCallback) {
    this.updateCallback(percentage, message, this);
  }
};

/**
 * Start monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.startMonitoring = function (uri, delay) {
  this.delay = delay;
  this.uri = uri;
  this.sendPing();
};

/**
 * Stop monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.stopMonitoring = function () {
  clearTimeout(this.timer);
  // This allows monitoring to be stopped from within the callback.
  this.uri = null;
};

/**
 * Request progress data from server.
 */
Drupal.progressBar.prototype.sendPing = function () {
  if (this.timer) {
    clearTimeout(this.timer);
  }
  if (this.uri) {
    var pb = this;
    // When doing a post request, you need non-null data. Otherwise a
    // HTTP 411 or HTTP 406 (with Apache mod_security) error may result.
    $.ajax({
      type: this.method,
      url: this.uri,
      data: '',
      dataType: 'json',
      success: function (progress) {
        // Display errors.
        if (progress.status == 0) {
          pb.displayError(progress.data);
          return;
        }
        // Update display.
        pb.setProgress(progress.percentage, progress.message);
        // Schedule next timer.
        pb.timer = setTimeout(function () { pb.sendPing(); }, pb.delay);
      },
      error: function (xmlhttp) {
        pb.displayError(Drupal.ajaxError(xmlhttp, pb.uri));
      }
    });
  }
};

/**
 * Display errors on the page.
 */
Drupal.progressBar.prototype.displayError = function (string) {
  var error = $('<div class="messages error"></div>').html(string);
  $(this.element).before(error).hide();

  if (this.errorCallback) {
    this.errorCallback(this);
  }
};

})(jQuery);
;
/**
 * @file
 *
 * Implement a modal form.
 *
 * @see modal.inc for documentation.
 *
 * This javascript relies on the CTools ajax responder.
 */

(function ($) {
  // Make sure our objects are defined.
  Drupal.CTools = Drupal.CTools || {};
  Drupal.CTools.Modal = Drupal.CTools.Modal || {};

  /**
   * Display the modal
   *
   * @todo -- document the settings.
   */
  Drupal.CTools.Modal.show = function(choice) {
    var opts = {};

    if (choice && typeof choice == 'string' && Drupal.settings[choice]) {
      // This notation guarantees we are actually copying it.
      $.extend(true, opts, Drupal.settings[choice]);
    }
    else if (choice) {
      $.extend(true, opts, choice);
    }

    var defaults = {
      modalTheme: 'CToolsModalDialog',
      throbberTheme: 'CToolsModalThrobber',
      animation: 'show',
      animationSpeed: 'fast',
      modalSize: {
        type: 'scale',
        width: .8,
        height: .8,
        addWidth: 0,
        addHeight: 0,
        // How much to remove from the inner content to make space for the
        // theming.
        contentRight: 25,
        contentBottom: 45
      },
      modalOptions: {
        opacity: .55,
        background: '#fff'
      }
    };

    var settings = {};
    $.extend(true, settings, defaults, Drupal.settings.CToolsModal, opts);

    if (Drupal.CTools.Modal.currentSettings && Drupal.CTools.Modal.currentSettings != settings) {
      Drupal.CTools.Modal.modal.remove();
      Drupal.CTools.Modal.modal = null;
    }

    Drupal.CTools.Modal.currentSettings = settings;

    var resize = function(e) {
      // When creating the modal, it actually exists only in a theoretical
      // place that is not in the DOM. But once the modal exists, it is in the
      // DOM so the context must be set appropriately.
      var context = e ? document : Drupal.CTools.Modal.modal;

      if (Drupal.CTools.Modal.currentSettings.modalSize.type == 'scale') {
        var width = $(window).width() * Drupal.CTools.Modal.currentSettings.modalSize.width;
        var height = $(window).height() * Drupal.CTools.Modal.currentSettings.modalSize.height;
      }
      else {
        var width = Drupal.CTools.Modal.currentSettings.modalSize.width;
        var height = Drupal.CTools.Modal.currentSettings.modalSize.height;
      }

      // Use the additionol pixels for creating the width and height.
      $('div.ctools-modal-content', context).css({
        'width': width + Drupal.CTools.Modal.currentSettings.modalSize.addWidth + 'px',
        'height': height + Drupal.CTools.Modal.currentSettings.modalSize.addHeight + 'px'
      });
      $('div.ctools-modal-content .modal-content', context).css({
        'width': (width - Drupal.CTools.Modal.currentSettings.modalSize.contentRight) + 'px',
        'height': (height - Drupal.CTools.Modal.currentSettings.modalSize.contentBottom) + 'px'
      });
    }

    if (!Drupal.CTools.Modal.modal) {
      Drupal.CTools.Modal.modal = $(Drupal.theme(settings.modalTheme));
      if (settings.modalSize.type == 'scale') {
        $(window).bind('resize', resize);
      }
    }

    resize();

    $('span.modal-title', Drupal.CTools.Modal.modal).html(Drupal.CTools.Modal.currentSettings.loadingText);
    Drupal.CTools.Modal.modalContent(Drupal.CTools.Modal.modal, settings.modalOptions, settings.animation, settings.animationSpeed);
    $('#modalContent .modal-content').html(Drupal.theme(settings.throbberTheme));

    // Position autocomplete results based on the scroll position of the modal.
    $('#modalContent .modal-content').delegate('input.form-autocomplete', 'keyup', function() {
      $('#autocomplete').css('top', $(this).position().top + $(this).outerHeight() + $(this).offsetParent().filter('#modal-content').scrollTop());
    });
  };

  /**
   * Hide the modal
   */
  Drupal.CTools.Modal.dismiss = function() {
    if (Drupal.CTools.Modal.modal) {
      Drupal.CTools.Modal.unmodalContent(Drupal.CTools.Modal.modal);
    }
  };

  /**
   * Provide the HTML to create the modal dialog.
   */
  Drupal.theme.prototype.CToolsModalDialog = function () {
    var html = ''
    html += '  <div id="ctools-modal">'
    html += '    <div class="ctools-modal-content">' // panels-modal-content
    html += '      <div class="modal-header">';
    html += '        <a class="close" href="#">';
    html +=            Drupal.CTools.Modal.currentSettings.closeText + Drupal.CTools.Modal.currentSettings.closeImage;
    html += '        </a>';
    html += '        <span id="modal-title" class="modal-title">&nbsp;</span>';
    html += '      </div>';
    html += '      <div id="modal-content" class="modal-content">';
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';

    return html;
  }

  /**
   * Provide the HTML to create the throbber.
   */
  Drupal.theme.prototype.CToolsModalThrobber = function () {
    var html = '';
    html += '  <div id="modal-throbber">';
    html += '    <div class="modal-throbber-wrapper">';
    html +=        Drupal.CTools.Modal.currentSettings.throbber;
    html += '    </div>';
    html += '  </div>';

    return html;
  };

  /**
   * Figure out what settings string to use to display a modal.
   */
  Drupal.CTools.Modal.getSettings = function (object) {
    var match = $(object).attr('class').match(/ctools-modal-(\S+)/);
    if (match) {
      return match[1];
    }
  }

  /**
   * Click function for modals that can be cached.
   */
  Drupal.CTools.Modal.clickAjaxCacheLink = function () {
    Drupal.CTools.Modal.show(Drupal.CTools.Modal.getSettings(this));
    return Drupal.CTools.AJAX.clickAJAXCacheLink.apply(this);
  };

  /**
   * Handler to prepare the modal for the response
   */
  Drupal.CTools.Modal.clickAjaxLink = function () {
    Drupal.CTools.Modal.show(Drupal.CTools.Modal.getSettings(this));
    return false;
  };

  /**
   * Submit responder to do an AJAX submit on all modal forms.
   */
  Drupal.CTools.Modal.submitAjaxForm = function(e) {
    var $form = $(this);
    var url = $form.attr('action');

    setTimeout(function() { Drupal.CTools.AJAX.ajaxSubmit($form, url); }, 1);
    return false;
  }

  /**
   * Bind links that will open modals to the appropriate function.
   */
  Drupal.behaviors.ZZCToolsModal = {
    attach: function(context) {
      // Bind links
      // Note that doing so in this order means that the two classes can be
      // used together safely.
      /*
       * @todo remimplement the warm caching feature
       $('a.ctools-use-modal-cache', context).once('ctools-use-modal', function() {
         $(this).click(Drupal.CTools.Modal.clickAjaxCacheLink);
         Drupal.CTools.AJAX.warmCache.apply(this);
       });
        */

      $('area.ctools-use-modal, a.ctools-use-modal', context).once('ctools-use-modal', function() {
        var $this = $(this);
        $this.click(Drupal.CTools.Modal.clickAjaxLink);
        // Create a drupal ajax object
        var element_settings = {};
        if ($this.attr('href')) {
          element_settings.url = $this.attr('href');
          element_settings.event = 'click';
          element_settings.progress = { type: 'throbber' };
        }
        var base = $this.attr('href');
        Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
      });

      // Bind buttons
      $('input.ctools-use-modal, button.ctools-use-modal', context).once('ctools-use-modal', function() {
        var $this = $(this);
        $this.click(Drupal.CTools.Modal.clickAjaxLink);
        var button = this;
        var element_settings = {};

        // AJAX submits specified in this manner automatically submit to the
        // normal form action.
        element_settings.url = Drupal.CTools.Modal.findURL(this);
        if (element_settings.url == '') {
          element_settings.url = $(this).closest('form').attr('action');
        }
        element_settings.event = 'click';
        element_settings.setClick = true;

        var base = $this.attr('id');
        Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);

        // Make sure changes to settings are reflected in the URL.
        $('.' + $(button).attr('id') + '-url').change(function() {
          Drupal.ajax[base].options.url = Drupal.CTools.Modal.findURL(button);
        });
      });

      // Bind our custom event to the form submit
      $('#modal-content form', context).once('ctools-use-modal', function() {
        var $this = $(this);
        var element_settings = {};

        element_settings.url = $this.attr('action');
        element_settings.event = 'submit';
        element_settings.progress = { 'type': 'throbber' }
        var base = $this.attr('id');

        Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
        Drupal.ajax[base].form = $this;

        $('input[type=submit], button', this).click(function(event) {
          Drupal.ajax[base].element = this;
          this.form.clk = this;
          // An empty event means we were triggered via .click() and
          // in jquery 1.4 this won't trigger a submit.
          if (event.bubbles == undefined) {
            $(this.form).trigger('submit');
            return false;
          }
        });
      });

      // Bind a click handler to allow elements with the 'ctools-close-modal'
      // class to close the modal.
      $('.ctools-close-modal', context).once('ctools-close-modal')
        .click(function() {
          Drupal.CTools.Modal.dismiss();
          return false;
        });
    }
  };

  // The following are implementations of AJAX responder commands.

  /**
   * AJAX responder command to place HTML within the modal.
   */
  Drupal.CTools.Modal.modal_display = function(ajax, response, status) {
    if ($('#modalContent').length == 0) {
      Drupal.CTools.Modal.show(Drupal.CTools.Modal.getSettings(ajax.element));
    }
    $('#modal-title').html(response.title);
    // Simulate an actual page load by scrolling to the top after adding the
    // content. This is helpful for allowing users to see error messages at the
    // top of a form, etc.
    $('#modal-content').html(response.output).scrollTop(0);

    // Attach behaviors within a modal dialog.
    var settings = response.settings || ajax.settings || Drupal.settings;
    Drupal.attachBehaviors('#modalContent', settings);
  }

  /**
   * AJAX responder command to dismiss the modal.
   */
  Drupal.CTools.Modal.modal_dismiss = function(command) {
    Drupal.CTools.Modal.dismiss();
    $('link.ctools-temporary-css').remove();
  }

  /**
   * Display loading
   */
  //Drupal.CTools.AJAX.commands.modal_loading = function(command) {
  Drupal.CTools.Modal.modal_loading = function(command) {
    Drupal.CTools.Modal.modal_display({
      output: Drupal.theme(Drupal.CTools.Modal.currentSettings.throbberTheme),
      title: Drupal.CTools.Modal.currentSettings.loadingText
    });
  }

  /**
   * Find a URL for an AJAX button.
   *
   * The URL for this gadget will be composed of the values of items by
   * taking the ID of this item and adding -url and looking for that
   * class. They need to be in the form in order since we will
   * concat them all together using '/'.
   */
  Drupal.CTools.Modal.findURL = function(item) {
    var url = '';
    var url_class = '.' + $(item).attr('id') + '-url';
    $(url_class).each(
      function() {
        var $this = $(this);
        if (url && $this.val()) {
          url += '/';
        }
        url += $this.val();
      });
    return url;
  };


  /**
   * modalContent
   * @param content string to display in the content box
   * @param css obj of css attributes
   * @param animation (fadeIn, slideDown, show)
   * @param speed (valid animation speeds slow, medium, fast or # in ms)
   */
  Drupal.CTools.Modal.modalContent = function(content, css, animation, speed) {
    // If our animation isn't set, make it just show/pop
    if (!animation) {
      animation = 'show';
    }
    else {
      // If our animation isn't "fadeIn" or "slideDown" then it always is show
      if (animation != 'fadeIn' && animation != 'slideDown') {
        animation = 'show';
      }
    }

    if (!speed) {
      speed = 'fast';
    }

    // Build our base attributes and allow them to be overriden
    css = jQuery.extend({
      position: 'absolute',
      left: '0px',
      margin: '0px',
      background: '#000',
      opacity: '.55'
    }, css);

    // Add opacity handling for IE.
    css.filter = 'alpha(opacity=' + (100 * css.opacity) + ')';
    content.hide();

    // if we already ahve a modalContent, remove it
    if ( $('#modalBackdrop')) $('#modalBackdrop').remove();
    if ( $('#modalContent')) $('#modalContent').remove();

    // position code lifted from http://www.quirksmode.org/viewport/compatibility.html
    if (self.pageYOffset) { // all except Explorer
    var wt = self.pageYOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) { // Explorer 6 Strict
      var wt = document.documentElement.scrollTop;
    } else if (document.body) { // all other Explorers
      var wt = document.body.scrollTop;
    }

    // Get our dimensions

    // Get the docHeight and (ugly hack) add 50 pixels to make sure we dont have a *visible* border below our div
    var docHeight = $(document).height() + 50;
    var docWidth = $(document).width();
    var winHeight = $(window).height();
    var winWidth = $(window).width();
    if( docHeight < winHeight ) docHeight = winHeight;

    // Create our divs
    $('body').append('<div id="modalBackdrop" style="z-index: 1000; display: none;"></div><div id="modalContent" style="z-index: 1001; position: absolute;">' + $(content).html() + '</div>');

    // Keyboard and focus event handler ensures focus stays on modal elements only
    modalEventHandler = function( event ) {
      target = null;
      if ( event ) { //Mozilla
        target = event.target;
      } else { //IE
        event = window.event;
        target = event.srcElement;
      }

      var parents = $(target).parents().get();
      for (var i = 0; i < parents.length; ++i) {
        var position = $(parents[i]).css('position');
        if (position == 'absolute' || position == 'fixed') {
          return true;
        }
      }
      if( $(target).filter('*:visible').parents('#modalContent').size()) {
        // allow the event only if target is a visible child node of #modalContent
        return true;
      }
      if ( $('#modalContent')) $('#modalContent').get(0).focus();
      return false;
    };
    $('body').bind( 'focus', modalEventHandler );
    $('body').bind( 'keypress', modalEventHandler );

    // Create our content div, get the dimensions, and hide it
    var modalContent = $('#modalContent').css('top','-1000px');
    var mdcTop = wt + ( winHeight / 2 ) - (  modalContent.outerHeight() / 2);
    var mdcLeft = ( winWidth / 2 ) - ( modalContent.outerWidth() / 2);
    $('#modalBackdrop').css(css).css('top', 0).css('height', docHeight + 'px').css('width', docWidth + 'px').show();
    modalContent.css({top: mdcTop + 'px', left: mdcLeft + 'px'}).hide()[animation](speed);

    // Bind a click for closing the modalContent
    modalContentClose = function(){close(); return false;};
    $('.close').bind('click', modalContentClose);

    // Bind a keypress on escape for closing the modalContent
    modalEventEscapeCloseHandler = function(event) {
      if (event.keyCode == 27) {
        close();
        return false;
      }
    };

    $(document).bind('keydown', modalEventEscapeCloseHandler);

    // Close the open modal content and backdrop
    function close() {
      // Unbind the events
      $(window).unbind('resize',  modalContentResize);
      $('body').unbind( 'focus', modalEventHandler);
      $('body').unbind( 'keypress', modalEventHandler );
      $('.close').unbind('click', modalContentClose);
      $('body').unbind('keypress', modalEventEscapeCloseHandler);
      $(document).trigger('CToolsDetachBehaviors', $('#modalContent'));

      // Set our animation parameters and use them
      if ( animation == 'fadeIn' ) animation = 'fadeOut';
      if ( animation == 'slideDown' ) animation = 'slideUp';
      if ( animation == 'show' ) animation = 'hide';

      // Close the content
      modalContent.hide()[animation](speed);

      // Remove the content
      $('#modalContent').remove();
      $('#modalBackdrop').remove();
    };

    // Move and resize the modalBackdrop and modalContent on resize of the window
     modalContentResize = function(){
      // Get our heights
      var docHeight = $(document).height();
      var docWidth = $(document).width();
      var winHeight = $(window).height();
      var winWidth = $(window).width();
      if( docHeight < winHeight ) docHeight = winHeight;

      // Get where we should move content to
      var modalContent = $('#modalContent');
      var mdcTop = ( winHeight / 2 ) - (  modalContent.outerHeight() / 2);
      var mdcLeft = ( winWidth / 2 ) - ( modalContent.outerWidth() / 2);

      // Apply the changes
      $('#modalBackdrop').css('height', docHeight + 'px').css('width', docWidth + 'px').show();
      modalContent.css('top', mdcTop + 'px').css('left', mdcLeft + 'px').show();
    };
    $(window).bind('resize', modalContentResize);

    $('#modalContent').focus();
  };

  /**
   * unmodalContent
   * @param content (The jQuery object to remove)
   * @param animation (fadeOut, slideUp, show)
   * @param speed (valid animation speeds slow, medium, fast or # in ms)
   */
  Drupal.CTools.Modal.unmodalContent = function(content, animation, speed)
  {
    // If our animation isn't set, make it just show/pop
    if (!animation) { var animation = 'show'; } else {
      // If our animation isn't "fade" then it always is show
      if (( animation != 'fadeOut' ) && ( animation != 'slideUp')) animation = 'show';
    }
    // Set a speed if we dont have one
    if ( !speed ) var speed = 'fast';

    // Unbind the events we bound
    $(window).unbind('resize', modalContentResize);
    $('body').unbind('focus', modalEventHandler);
    $('body').unbind('keypress', modalEventHandler);
    $('.close').unbind('click', modalContentClose);
    $(document).trigger('CToolsDetachBehaviors', $('#modalContent'));

    // jQuery magic loop through the instances and run the animations or removal.
    content.each(function(){
      if ( animation == 'fade' ) {
        $('#modalContent').fadeOut(speed, function() {
          $('#modalBackdrop').fadeOut(speed, function() {
            $(this).remove();
          });
          $(this).remove();
        });
      } else {
        if ( animation == 'slide' ) {
          $('#modalContent').slideUp(speed,function() {
            $('#modalBackdrop').slideUp(speed, function() {
              $(this).remove();
            });
            $(this).remove();
          });
        } else {
          $('#modalContent').remove();
          $('#modalBackdrop').remove();
        }
      }
    });
  };

$(function() {
  Drupal.ajax.prototype.commands.modal_display = Drupal.CTools.Modal.modal_display;
  Drupal.ajax.prototype.commands.modal_dismiss = Drupal.CTools.Modal.modal_dismiss;
});

})(jQuery);
;
(function ($) {

/**
 * Toggle the visibility of a fieldset using smooth animations.
 */
Drupal.toggleFieldset = function (fieldset) {
  var $fieldset = $(fieldset);
  if ($fieldset.is('.collapsed')) {
    var $content = $('> .fieldset-wrapper', fieldset).hide();
    $fieldset
      .removeClass('collapsed')
      .trigger({ type: 'collapsed', value: false })
      .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Hide'));
    $content.slideDown({
      duration: 'fast',
      easing: 'linear',
      complete: function () {
        Drupal.collapseScrollIntoView(fieldset);
        fieldset.animating = false;
      },
      step: function () {
        // Scroll the fieldset into view.
        Drupal.collapseScrollIntoView(fieldset);
      }
    });
  }
  else {
    $fieldset.trigger({ type: 'collapsed', value: true });
    $('> .fieldset-wrapper', fieldset).slideUp('fast', function () {
      $fieldset
        .addClass('collapsed')
        .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Show'));
      fieldset.animating = false;
    });
  }
};

/**
 * Scroll a given fieldset into view as much as possible.
 */
Drupal.collapseScrollIntoView = function (node) {
  var h = document.documentElement.clientHeight || document.body.clientHeight || 0;
  var offset = document.documentElement.scrollTop || document.body.scrollTop || 0;
  var posY = $(node).offset().top;
  var fudge = 55;
  if (posY + node.offsetHeight + fudge > h + offset) {
    if (node.offsetHeight > h) {
      window.scrollTo(0, posY);
    }
    else {
      window.scrollTo(0, posY + node.offsetHeight - h + fudge);
    }
  }
};

Drupal.behaviors.collapse = {
  attach: function (context, settings) {
    $('fieldset.collapsible', context).once('collapse', function () {
      var $fieldset = $(this);
      // Expand fieldset if there are errors inside, or if it contains an
      // element that is targeted by the URI fragment identifier.
      var anchor = location.hash && location.hash != '#' ? ', ' + location.hash : '';
      if ($fieldset.find('.error' + anchor).length) {
        $fieldset.removeClass('collapsed');
      }

      var summary = $('<span class="summary"></span>');
      $fieldset.
        bind('summaryUpdated', function () {
          var text = $.trim($fieldset.drupalGetSummary());
          summary.html(text ? ' (' + text + ')' : '');
        })
        .trigger('summaryUpdated');

      // Turn the legend into a clickable link, but retain span.fieldset-legend
      // for CSS positioning.
      var $legend = $('> legend .fieldset-legend', this);

      $('<span class="fieldset-legend-prefix element-invisible"></span>')
        .append($fieldset.hasClass('collapsed') ? Drupal.t('Show') : Drupal.t('Hide'))
        .prependTo($legend)
        .after(' ');

      // .wrapInner() does not retain bound events.
      var $link = $('<a class="fieldset-title" href="#"></a>')
        .prepend($legend.contents())
        .appendTo($legend)
        .click(function () {
          var fieldset = $fieldset.get(0);
          // Don't animate multiple times.
          if (!fieldset.animating) {
            fieldset.animating = true;
            Drupal.toggleFieldset(fieldset);
          }
          return false;
        });

      $legend.append(summary);
    });
  }
};

})(jQuery);
;
(function ($) {

Drupal.Nucleus.tempSaved = Drupal.Nucleus.tempSaved || [];
Drupal.Nucleus.currentOpenedButton = false;
Drupal.Nucleus.tempHiddenPopup = false;

Drupal.behaviors.nucleusGridAction = {
  attach: function (context) {
    $('.rb-setting-sub-form .rb-setting-btn').click(function(event) {
      var this_id = $(this).attr('id');
      Drupal.Nucleus.eventStopPropagation(event);
      if (Drupal.Nucleus.currentOpenedButton) {
      	current_id = Drupal.Nucleus.currentOpenedButton; 
        Drupal.Nucleus.hidePopup();
        if (current_id == this_id) {
          Drupal.Nucleus.currentOpenedButton = false;
          return;
        }
      }
      params = Drupal.Nucleus.parseButtonInfo($(this));
      Drupal.Nucleus.showPopup(params);
    });

    $(document).bind('click', function() {
      Drupal.Nucleus.hidePopup();
    });
    $('.tb-popup-wrap').click(function(event) {
      Drupal.Nucleus.eventStopPropagation(event);
    });
    $('#nucleus_popup_save').click(function(event) {
      Drupal.Nucleus.savePopup(event);
      return false;
    });
    $('#nucleus_popup_close').click(function(event) {
      Drupal.Nucleus.cancelPopup(event);
      return false;
    });
    $('select[name="popup_block_style_selector"]').change(function(event) {
     Drupal.Nucleus.changeBlockStyle();
    });
    $('select[name="popup_region_selector"]').change(function(event) {
      Drupal.Nucleus.changeBlockRegion();
    });
  }
};

Drupal.Nucleus.changeBlockRegion = function(event) {
  var popup = $('#nucleus_form_popup_wrapper');
  var type = popup.find('#nucleus_popup_type').val();
  var page_prefix = popup.find('#nucleus_popup_page').val();
  var key = popup.find('#nucleus_popup_key').val();

  var hidden_name = page_prefix + "region_block_hidden_" + key;
  var current_region_key = $('input[name="' + hidden_name + '"]').val();
  var new_region_key = popup.find('select[name="popup_region_selector"]').val();
  
  var current_blocks_container = $('#draggable_region_' + current_region_key);
  var new_blocks_container = $('#draggable_region_' + new_region_key);
  var block_preview_wrapper = $('#block_preview_wrapper_' + key);
  block_preview_wrapper.appendTo('#draggable_region_' + new_region_key);
  Drupal.Nucleus.smoothScroll('#block_preview_wrapper_' + key, 50, -50);
//  Drupal.Nucleus.moveBlockAction(page_prefix, key, hidden_name, current_region_key, new_region_key);
  Drupal.Nucleus.hidePopup();
  params = Drupal.Nucleus.parseButtonInfo(block_preview_wrapper.find('.rb-setting-sub-form .rb-setting-btn'));
  Drupal.Nucleus.showPopup(params);
}

Drupal.Nucleus.parseButtonInfo = function(button) {
  params = {};
  button_id = button.attr('id');
  page_prefix = Drupal.Nucleus.currentPagePrefix();
  constant_key = "_setting_btn_" + page_prefix;
  constant_key_pos = button_id.indexOf(constant_key);
  constant_key_len = constant_key.length;
  var page_review_container = $("#" + page_prefix + "page_preview_container");

  params.button_id = button_id;
  params.button_top = button.position().top;
  params.button_left = button.position().left;
  params.button_height = button.height();
  params.type = button_id.substr(0, constant_key_pos);
  params.key = button_id.substr(constant_key_pos + constant_key_len);
  params.page_prefix = page_prefix;
  params.preview_left = page_review_container.offset().left;
  params.preview_width = page_review_container.width();
  return params;
}

Drupal.Nucleus.clearPopup = function(button) {
}

Drupal.Nucleus.eventStopPropagation = function(event) {
  if (event.stopPropagation) {
    event.stopPropagation();
  }
  else if (window.event) {
    window.event.cancelBubble = true;
  }
}

Drupal.Nucleus.showPopup = function(params) {
  Drupal.Nucleus.currentOpenedButton = params.button_id;
  var popup = $('#nucleus_form_popup_wrapper');
  var popup_width = popup.width();
  var popup_height = popup.height();

  var popup_left = params.button_left;
  var popup_top = params.button_top + params.button_height + 4;
  if (params.button_left + popup_width > params.preview_width) {
    popup_left -= params.button_left + popup_width - params.preview_width;
  }
  popup.css({top: popup_top + "px", left: popup_left + "px"});
  popup.find('#nucleus_popup_type').val(params.type);
  popup.find('#nucleus_popup_page').val(params.page_prefix);
  popup.find('#nucleus_popup_key').val(params.key);

  var temp_name = params.page_prefix + params.type + "_" + params.key;
  if(Drupal.Nucleus.tempSaved[temp_name] != undefined) {
	this.loadTempForm(popup, params, temp_name);
  }
  else {
    this.loadRegionWidth(popup, params);
    this.loadBlockRegion(popup, params);
    this.loadBlockStyle(popup, params);  
  }
  popup.show();
}

Drupal.Nucleus.loadTempForm = function(popup, params, temp_name) {
  for(x in Drupal.Nucleus.tempSaved[temp_name]) {
	if(popup.find('input[type="radio"][name="' + x + '"]').length) {
      popup.find('input[type="radio"][name="' + x + '"][value="' + Drupal.Nucleus.tempSaved[temp_name][x] + '"]').attr('checked', 'checked');
    }
    else {
	  popup.find('[name="' + x + '"]').val(Drupal.Nucleus.tempSaved[temp_name][x]);
    }
  }
  if(params.type == 'block') {
    popup.find('.form-item-popup-region-selector').show();
  }
  else {
    popup.find('.form-item-popup-region-selector').hide();
  }

  if($('input[name="' + params.page_prefix + params.key + '_width"]').length) {
    popup.find('.form-item-popup-region-width-selector').show();
  }
  else {
    popup.find('.form-item-popup-region-width-selector').hide();
  }

  var style = popup.find('select[name="popup_block_style_selector"]').val();
  style = style == '' ? 'default' : style;
  style = Drupal.Nucleus.getApplyingBlockStyle(params.page_prefix, params.type, params.key, style);
  Drupal.Nucleus.handleShowHideGroupExtendClass(style);
}

Drupal.Nucleus.hidePopup = function() {
  if(Drupal.Nucleus.currentOpenedButton) {
    var popup = $('#nucleus_form_popup_wrapper');
    var type = popup.find('#nucleus_popup_type').val();
    var page_prefix = popup.find('#nucleus_popup_page').val();
    var key = popup.find('#nucleus_popup_key').val();
    var temp_name = page_prefix + type + "_" + key;
    var temp = [];
    popup.find('input:radio:checked, select').each(function() {
      if($(this).val() != '') {
        temp[$(this).attr('name')] = $(this).val();
      }
    });
    Drupal.Nucleus.tempSaved[temp_name] = temp;
    popup.hide();
    Drupal.Nucleus.currentOpenedButton = false;
  }
}

Drupal.Nucleus.loadBlockRegion = function(popup, params) {
  if(params.type == 'block') {
    var wrapper = popup.find('.form-item-popup-region-selector');
    wrapper.find('select[name="popup_region_selector"]').val($('input[name="' + params.page_prefix + "region_block_hidden_" + params.key + '"]').val());
    wrapper.show();
  }
  else {
    popup.find('.form-item-popup-region-selector').hide();
  }
}

Drupal.Nucleus.loadRegionWidth = function(popup, params) {
  if($('input[name="' + params.page_prefix + params.key + '_width"]').length) {
    var wrapper = popup.find('.form-item-popup-region-width-selector');
    wrapper.find('select[name="popup_region_width_selector"]').val($('input[name="' + params.page_prefix + params.key + '_width"]').val());
    wrapper.show();
  }
  else {
    popup.find('.form-item-popup-region-width-selector').hide();
  }
}

Drupal.Nucleus.loadBlockStyle = function(popup, params) {
  var style = $('input[name="' + params.page_prefix + params.type + "_" + params.key + '_style"]').val();
  var extend_class = $('input[name="' + params.page_prefix + params.type + "_" + params.key + '_extend_class"]').val();
  var parts = extend_class.split(" ");
  popup.find('input[type="radio"]').attr("checked", false);
  for(var i = 0; i < parts.length - 1; i += 2) {
    popup.find('#group-' + parts[i] + '-' + parts[i + 1] + '-radio').attr('checked', 'checked');
  }
  style = style == '' ? 'default' : style;
  popup.find('select[name="popup_block_style_selector"]').val(style);
  style = Drupal.Nucleus.getApplyingBlockStyle(params.page_prefix, params.type, params.key, style);
  Drupal.Nucleus.handleShowHideGroupExtendClass(style);
}

Drupal.Nucleus.savePopup = function(event) {
  var popup = $('#nucleus_form_popup_wrapper');
  var type = popup.find('#nucleus_popup_type').val();
  var page_prefix = popup.find('#nucleus_popup_page').val();
  var key = popup.find('#nucleus_popup_key').val();
  
  var style_name = page_prefix + type + "_" + key + "_style";
  var width_name = page_prefix + key + "_width";
  var extend_class_name = page_prefix + type + "_" + key + '_extend_class';

  var selector_width = $('select[name="popup_region_width_selector"]');
  if (selector_width.length) {
    $('input[name="' + width_name + '"]').val(selector_width.val());
  }

  var style = Drupal.Nucleus.getApplyingBlockStyle(page_prefix, type, key, popup.find('select[name="popup_block_style_selector"]').val());
  $('input[name="' + style_name + '"]').val(style);
  var group_name_list = Drupal.Nucleus.extendClassSupportGroups[style];
  var support_some_group = false;
  var values = [];
  for (var x in group_name_list) {
    var group = group_name_list[x];
    var radio = $('input:radio[name="' + group + '-radio"]:checked');
    if (radio.length) {
      var value = radio.val();
      if (value != undefined && value != '') {
        var text = Drupal.Nucleus.extendClassesList[value];
        values.push(group);
        values.push(value);
      }
    }
  }
  $('input:hidden[name="' + extend_class_name + '"]').attr("value", values.join(' '));

  Drupal.Nucleus.hidePopup();
  Drupal.Nucleus.eventStopPropagation(event);
  $('#' + type + '_setting_btn_' + page_prefix + key).addClass('changed-settings');
  return false;
}

Drupal.Nucleus.cancelPopup = function(event) {
  Drupal.Nucleus.hidePopup();
}

Drupal.Nucleus.changeBlockStyle = function() {
  var popup = $('#nucleus_form_popup_wrapper');
  var type = popup.find('#nucleus_popup_type').val();
  var page_prefix = popup.find('#nucleus_popup_page').val();
  var key = popup.find('#nucleus_popup_key').val();
  var style = Drupal.Nucleus.getApplyingBlockStyle(page_prefix, type, key, popup.find('select[name="popup_block_style_selector"]').val());
  Drupal.Nucleus.handleShowHideGroupExtendClass(style);
}

Drupal.Nucleus.handleShowHideGroupExtendClass = function(style) {
  var popup = $('#nucleus_form_popup_wrapper');
  var groups_list = Drupal.Nucleus.extendClassSupportGroups[style];
  var all_groups_list = Drupal.Nucleus.extendClassGroupsNameList;
  for (var x in all_groups_list) {
    popup.find('#' + all_groups_list[x] + "-group").hide();
  }
  var empty = true;
  for (var x in groups_list) { 
    popup.find('#' + groups_list[x] + "-group").show();
    empty = false;
  }
  if(empty) {
    popup.find('#tb-extend-class').hide();
  }
  else {
    popup.find('#tb-extend-class').show();
  }
}

Drupal.Nucleus.getApplyingBlockStyle = function(page_prefix, type, key, style) {
  if(type == 'block' && (style == 'default' || style == '')) {
    var region_key = Drupal.Nucleus.regionsBlocksList['blocks'][key];
    region_key = region_key.replace(/-/gi, '_');
    var temp_name = page_prefix + "region_" + region_key;
    if(Drupal.Nucleus.tempSaved[temp_name] != undefined) {
      return Drupal.Nucleus.tempSaved[temp_name]['popup_block_style_selector'];
    }
    style = $('input[name="' + page_prefix + "region_" + region_key + '_style"]').val();
  };
  return style == '' ? "default" : style;
}

Drupal.Nucleus.currentPagePrefix = function() {
  return "";
}

Drupal.Nucleus.getCurrentYPos = function() {
  if (self.pageYOffset) {
    return self.pageYOffset;
  }
  if (document.documentElement && document.documentElement.scrollTop) {
    return document.documentElement.scrollTop;
  }
  if (document.body.scrollTop) {
    return document.body.scrollTop;
  }
  return 0;
}

Drupal.Nucleus.getElementYPos = function(eID) {
  return $(eID).offset().top;
}

Drupal.Nucleus.smoothScroll = function(eID, duration, delta) {
  if (!duration) {
    duration = 500;
  }
  if (!delta) {
    delta = 0;
  }
  var startY = Drupal.Nucleus.getCurrentYPos();
  var stopY = Drupal.Nucleus.getElementYPos(eID) + delta;
  var distance = stopY - startY;
  var speed = Math.round(duration / 33);
  var step  = Math.round(distance / speed);
  if (!step) {
    scrollTo(0, stopY); return;
  }
  var leapY = startY;
  var timer = 0;
  while (leapY != stopY) {
    leapY += step;
    if ((stopY > startY && leapY > stopY) || (stopY < startY && leapY < stopY)) {
      leapY = stopY;
    }
    setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
    timer++;
  }
  return;
}
Drupal.Nucleus.moveBlockAction = function(page_prefix, block_key, hidden_name, current_region_key, new_region_key) {
  var current_region_name = current_region_key.replace(/_/gi, '-');
  var new_region_name = new_region_key.replace(/_/gi, '-');
  $('input[name="' + hidden_name + '"]').val(new_region_key);
  var style_name = page_prefix + "region_" + new_region_key + "_style";
  var region_style = $('input[name="' + style_name + '"]').val();
  region_style = (region_style == '') ? 'default' : region_style;

  Drupal.Nucleus.regionsBlocksList['blocks'][block_key] = new_region_name;
  Drupal.Nucleus.regionsBlocksList['regions'][current_region_name][block_key] = 0;
  Drupal.Nucleus.regionsBlocksList['regions'][new_region_name][block_key] = 1;
  var popup = $('#nucleus_form_popup_wrapper');
  var type = popup.find('#nucleus_popup_type').val();
  var page_prefix = popup.find('#nucleus_popup_page').val();
  var key = popup.find('#nucleus_popup_key').val();
  var style = Drupal.Nucleus.getApplyingBlockStyle(page_prefix, type, key, popup.find('select[name="popup_block_style_selector"]').val());
  Drupal.Nucleus.handleShowHideGroupExtendClass(style);  
}
})(jQuery);
;
