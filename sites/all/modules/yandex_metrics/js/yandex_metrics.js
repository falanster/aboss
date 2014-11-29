(function ($) {
  $(document).ready(function() {
    var counter_id = $('#yandex_metrics_counter_id').val();
    var filter = $('#yandex_metrics_filter').val();
    // Loads visits chart.
    yandex_metrics_load_data(counter_id, filter, 'visits_chart');
    // Loads traffic sources chart.
    yandex_metrics_load_data(counter_id, filter, 'sources_chart');
    // Loads search phrases table.
    yandex_metrics_load_data(counter_id, filter, 'search_phrases');
    // Loads popular content table.
    yandex_metrics_load_data(counter_id, filter, 'popular_content');
    // Loads geo chart.
    yandex_metrics_load_data(counter_id, filter, 'geo_chart');
  });

  /**
   * Performs request to Ajax callback url and loads data into report placeholder.
   * @param counter_id
   * @param filter
   * @param type
  */
  function yandex_metrics_load_data(counter_id, filter, type) {
    if($('#yandex_metrics_'+type).length == 0) {
      return;
    }
    var basePath = Drupal.settings.basePath;
    // Add ?q= to the url if clean urls are turned off.
    var queryParam = (parseInt(Drupal.settings.yandex_metrics.cleanUrls, 10) == 0) ? "?q=" : "";
    var ajaxCallbackPath = basePath + queryParam + "admin/yandex_metrics_ajax/" + counter_id + "/" + filter + "/" + type;
    var indicatorPath = basePath + Drupal.settings.yandex_metrics.modulePath + "/images/progress-indicator.gif";
    $.ajax({
      url: ajaxCallbackPath,
      beforeSend: function( xhr ) {
        $('#yandex_metrics_'+type).html('<img src="' + indicatorPath + '" width="31" height="31" />');
      },
      success: function( data ) {
        $('#yandex_metrics_'+type).html(data);
      }
    });
  }
}(jQuery));