<?php

/**
 * @file
 * Building forms
 */

/**
 * An additional form submit handler for webform settings.
 * Make sure to create default fields nodes for all content type that are webform-enabled.
 */
function webform_default_fields_form_webform_admin_settings_submit($form, $form_state) {
  $type = $form_state['input']['type'];
  if (isset($form_state['input']['webform_node'])) {
    _webform_default_fields_container_node($type, FALSE);
  }
  else {
    _webform_default_fields_delete_container_node($type, FALSE);
  }
  menu_rebuild(); 
}