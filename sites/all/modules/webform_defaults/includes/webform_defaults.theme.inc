<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Nico Heulsen
 * Date: 31/01/13
 * Time: 07:14
 */

function theme_webform_defaults_components_page($variables) {
  $output = '';
  $output .= drupal_render($variables['selector_form']);
  $output .= drupal_render($variables['components_form']);

  return $output;
}


function theme_webform_defaults_selector_form_table($variables) {
  $output = '';
  $form = $variables['form'];

  $rows = array();
  $rows[] = array(
    'markup' => t('Select the webform of which you want to duplicate the fields:'),
    'webform' => drupal_render($form['webform']),
    'submit' => drupal_render($form['submit'])
  );

  $output .= theme('table', array('header' => array(), 'rows' => $rows, 'attributes' => array('id' => 'webform-default-selecor')));
  $output .= '<div class="hidden">'. drupal_render_children($form) .'</div>';

  return $output;
}
