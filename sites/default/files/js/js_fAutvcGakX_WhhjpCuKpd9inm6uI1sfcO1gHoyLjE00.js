(function ($) {

/**
 * Attach handlers to evaluate the strength of any password fields and to check
 * that its confirmation is correct.
 */
Drupal.behaviors.password = {
  attach: function (context, settings) {
    var translate = settings.password;
    $('input.password-field', context).once('password', function () {
      var passwordInput = $(this);
      var innerWrapper = $(this).parent();
      var outerWrapper = $(this).parent().parent();

      // Add identifying class to password element parent.
      innerWrapper.addClass('password-parent');

      // Add the password confirmation layer.
      $('input.password-confirm', outerWrapper).parent().prepend('<div class="password-confirm">' + translate['confirmTitle'] + ' <span></span></div>').addClass('confirm-parent');
      var confirmInput = $('input.password-confirm', outerWrapper);
      var confirmResult = $('div.password-confirm', outerWrapper);
      var confirmChild = $('span', confirmResult);

      // Add the description box.
      var passwordMeter = '<div class="password-strength"><div class="password-strength-text" aria-live="assertive"></div><div class="password-strength-title">' + translate['strengthTitle'] + '</div><div class="password-indicator"><div class="indicator"></div></div></div>';
      $(confirmInput).parent().after('<div class="password-suggestions description"></div>');
      $(innerWrapper).prepend(passwordMeter);
      var passwordDescription = $('div.password-suggestions', outerWrapper).hide();

      // Check the password strength.
      var passwordCheck = function () {

        // Evaluate the password strength.
        var result = Drupal.evaluatePasswordStrength(passwordInput.val(), settings.password);

        // Update the suggestions for how to improve the password.
        if (passwordDescription.html() != result.message) {
          passwordDescription.html(result.message);
        }

        // Only show the description box if there is a weakness in the password.
        if (result.strength == 100) {
          passwordDescription.hide();
        }
        else {
          passwordDescription.show();
        }

        // Adjust the length of the strength indicator.
        $(innerWrapper).find('.indicator').css('width', result.strength + '%');

        // Update the strength indication text.
        $(innerWrapper).find('.password-strength-text').html(result.indicatorText);

        passwordCheckMatch();
      };

      // Check that password and confirmation inputs match.
      var passwordCheckMatch = function () {

        if (confirmInput.val()) {
          var success = passwordInput.val() === confirmInput.val();

          // Show the confirm result.
          confirmResult.css({ visibility: 'visible' });

          // Remove the previous styling if any exists.
          if (this.confirmClass) {
            confirmChild.removeClass(this.confirmClass);
          }

          // Fill in the success message and set the class accordingly.
          var confirmClass = success ? 'ok' : 'error';
          confirmChild.html(translate['confirm' + (success ? 'Success' : 'Failure')]).addClass(confirmClass);
          this.confirmClass = confirmClass;
        }
        else {
          confirmResult.css({ visibility: 'hidden' });
        }
      };

      // Monitor keyup and blur events.
      // Blur must be used because a mouse paste does not trigger keyup.
      passwordInput.keyup(passwordCheck).focus(passwordCheck).blur(passwordCheck);
      confirmInput.keyup(passwordCheckMatch).blur(passwordCheckMatch);
    });
  }
};

/**
 * Evaluate the strength of a user's password.
 *
 * Returns the estimated strength and the relevant output message.
 */
Drupal.evaluatePasswordStrength = function (password, translate) {
  var weaknesses = 0, strength = 100, msg = [];

  var hasLowercase = /[a-z]+/.test(password);
  var hasUppercase = /[A-Z]+/.test(password);
  var hasNumbers = /[0-9]+/.test(password);
  var hasPunctuation = /[^a-zA-Z0-9]+/.test(password);

  // If there is a username edit box on the page, compare password to that, otherwise
  // use value from the database.
  var usernameBox = $('input.username');
  var username = (usernameBox.length > 0) ? usernameBox.val() : translate.username;

  // Lose 5 points for every character less than 6, plus a 30 point penalty.
  if (password.length < 6) {
    msg.push(translate.tooShort);
    strength -= ((6 - password.length) * 5) + 30;
  }

  // Count weaknesses.
  if (!hasLowercase) {
    msg.push(translate.addLowerCase);
    weaknesses++;
  }
  if (!hasUppercase) {
    msg.push(translate.addUpperCase);
    weaknesses++;
  }
  if (!hasNumbers) {
    msg.push(translate.addNumbers);
    weaknesses++;
  }
  if (!hasPunctuation) {
    msg.push(translate.addPunctuation);
    weaknesses++;
  }

  // Apply penalty for each weakness (balanced against length penalty).
  switch (weaknesses) {
    case 1:
      strength -= 12.5;
      break;

    case 2:
      strength -= 25;
      break;

    case 3:
      strength -= 40;
      break;

    case 4:
      strength -= 40;
      break;
  }

  // Check if password is the same as the username.
  if (password !== '' && password.toLowerCase() === username.toLowerCase()) {
    msg.push(translate.sameAsUsername);
    // Passwords the same as username are always very weak.
    strength = 5;
  }

  // Based on the strength, work out what text should be shown by the password strength meter.
  if (strength < 60) {
    indicatorText = translate.weak;
  } else if (strength < 70) {
    indicatorText = translate.fair;
  } else if (strength < 80) {
    indicatorText = translate.good;
  } else if (strength <= 100) {
    indicatorText = translate.strong;
  }

  // Assemble the final message.
  msg = translate.hasWeaknesses + '<ul><li>' + msg.join('</li><li>') + '</li></ul>';
  return { strength: strength, message: msg, indicatorText: indicatorText };

};

/**
 * Field instance settings screen: force the 'Display on registration form'
 * checkbox checked whenever 'Required' is checked.
 */
Drupal.behaviors.fieldUserRegistration = {
  attach: function (context, settings) {
    var $checkbox = $('form#field-ui-field-edit-form input#edit-instance-settings-user-register-form');

    if ($checkbox.length) {
      $('input#edit-instance-required', context).once('user-register-form-checkbox', function () {
        $(this).bind('change', function (e) {
          if ($(this).attr('checked')) {
            $checkbox.attr('checked', true);
          }
        });
      });

    }
  }
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
