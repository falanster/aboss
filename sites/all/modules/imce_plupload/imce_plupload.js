imce.uploadValidate = function (data, form, options) {  
  jQuery.each(data, function (index) {
    var msg = data[index].name;
    if (msg.indexOf('_name') === -1) return;
    var path = data[index].value;
    if (!path) return;
    if (imce.conf.extensions != '*') {
      var ext = path.substr(path.lastIndexOf('.') + 1);
      if ((' '+ imce.conf.extensions +' ').indexOf(' '+ ext.toLowerCase() +' ') == -1) {
        imce.setMessage(Drupal.t('Only files with the following extensions are allowed: %files-allowed.', {'%files-allowed': imce.conf.extensions}), 'error');
      }
    }
    var sep = path.indexOf('/') == -1 ? '\\' : '/';
    options.url = imce.ajaxURL('upload'); //make url contain current dir.
    imce.fopLoading('upload', true);
  });
  
  return true;
};