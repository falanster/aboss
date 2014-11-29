<?php

/**
 * @file
 * Admin pages for moderation
 */

/**
 * Settings form.
 */
function modr8_settings_form($form_state) {

  $form['modr8_default_option'] = array(
    '#type' => 'radios',
    '#title' => t('Default action'),
    '#options' => array(
      'approve' => t('approve'),
      'delete' => t('delete'),
      'nada' => t('no action'),
    ),
    '#default_value' => variable_get('modr8_default_option', 'nada'),
  );

  $form['modr8_nodes_per_page'] = array(
    '#type' => 'select',
    '#title' => t('Number of moderated posts to display per page'),
    '#options' => drupal_map_assoc(array(5, 10, 15, 20, 25, 50, 75, 100, 150, 200)),
    '#default_value' => variable_get('modr8_nodes_per_page', 10),
  );
  $form['modr8_logs_per_page'] = array(
    '#type' => 'select',
    '#title' => t('Number of moderated logs to display per page'),
    '#options' => drupal_map_assoc(array(5, 10, 15, 20, 25, 50, 75, 100, 150, 200)),
    '#default_value' => variable_get('modr8_logs_per_page', 15),
  );
  $period = drupal_map_assoc(array(86400, 172800, 259200, 604800, 1209600, 2419200, 4838400, 7257600), 'format_interval');
  $period[0] = t('Never');
  $form['modr8_log_clear'] = array(
    '#type' => 'select',
    '#title' => t('Discard log entries older than'),
    '#default_value' => variable_get('modr8_log_clear', 0),
    '#options' => $period,
    '#description' => t('The time log entries should be kept. Older entries will be automatically discarded. Requires crontab.'),
  );
  $form['text'] = array(
    '#type' => 'fieldset',
    '#title' => t('E-mail'),
  );

  $form['text']['modr8_email_from'] = array(
    '#type' => 'textfield',
    '#title' => t('Moderator email address'),
    '#description' => t('E-mail notices sent by modr8 will have this as the "From" address. Leave empty to use same "From" address  as is used for user registration other administrative notices as set at <a href="@site-info">Site information</a>.', array('@site-info' => url('admin/config/site-information'))),
    '#default_value' => variable_get('modr8_email_from', ''),
  );

  $form['text']['modr8_send_approve'] = array(
    '#type' => 'checkbox',
    '#title' => t('Send approval messages'),
    '#default_value' => variable_get('modr8_send_approve', FALSE),
  );

  $form['text']['modr8_accepted_subject'] = array(
    '#type' => 'textfield',
    '#title' => t('Acceptance e-mail subject'),
    '#default_value' => variable_get('modr8_accepted_subject', "[%site] %title has been approved"),
  );

  $macros = implode(', ', array_keys(modr8_replacements()));

  $accept_default = modr8_accept_default();

  $form['text']['modr8_accepted_text'] = array(
    '#type' => 'textarea',
    '#title' => t('Acceptance e-mail'),
    '#default_value' => variable_get('modr8_accepted_text', $accept_default),
    '#description' => t('Replacement strings are: %macros', array('%macros' => $macros)),
  );

  $form['text']['modr8_send_deny'] = array(
    '#type' => 'checkbox',
    '#title' => t('Send denial messages'),
    '#default_value' => variable_get('modr8_send_deny', FALSE),
  );

  $form['text']['modr8_denial_subject'] = array(
    '#type' => 'textfield',
    '#title' => t('Denial e-mail subject'),
    '#default_value' => variable_get('modr8_denial_subject', "[%site] %title has been denied"),
  );

  $denial_default = modr8_denial_default();

  $form['text']['modr8_denial_text'] = array(
    '#type' => 'textarea',
    '#title' => t('Denial e-mail'),
    '#default_value' => variable_get('modr8_denial_text', $denial_default),
    '#description' => t('Replacement strings are: %macros', array('%macros' => $macros)),
  );

  $form['text']['modr8_send_noact'] = array(
    '#type' => 'checkbox',
    '#title' => t('Send a message when taking no action, but only if the moderator enters a "Note to author".'),
    '#default_value' => variable_get('modr8_send_noact', FALSE),
  );

  $form['text']['modr8_noact_subject'] = array(
    '#type' => 'textfield',
    '#title' => t('No action e-mail subject'),
    '#default_value' => variable_get('modr8_noact_subject', "[%site] note to author about %title"),
  );

  $noact_default = modr8_noact_default();

  $form['text']['modr8_noact_text'] = array(
    '#type' => 'textarea',
    '#title' => t('No action e-mail note'),
    '#default_value' => variable_get('modr8_noact_text', $noact_default),
    '#description' => t('Replacement strings are: %macros', array('%macros' => $macros)),
  );
  $form['#validate'] = array('modr8_settings_validate');

  return system_settings_form($form);
}

/**
 * Validate function for the settings form.
 */
function modr8_settings_validate($form, &$form_state) {
  if ($form_state['values']['modr8_email_from'] && !valid_email_address($form_state['values']['modr8_email_from'])) {
    form_set_error('modr8_email_from', t('You must either enter a valid e-mail address, or leave the moderator e-mail field empty.'));
  }
}

/**
 * Menu callback; the moderation response page.
 */
function modr8_response_page($node) {
  if ($node->moderate) {
    drupal_set_title(t('Submit response regarding %title', array('%title' => $node->title)), PASS_THROUGH);
    return drupal_get_form('modr8_response_form', $node);
  }
  else {
    drupal_set_title(t('The moderator already approved %title', array('%title' => $node->title)), PASS_THROUGH);
    return '<p>' . t('This post has already been approved by the moderator. No response is needed.') . '</p>';
  }
}

/**
 * Response form
 */
function modr8_response_form($form, $form_state, $node) {
  $form = array();
  $form['title'] = array(
    '#type' => 'textfield',
    '#title' => t('Response title'),
    '#required' => TRUE,
    '#maxlength' => 80,
    '#weight' => -5,
  );
  $form['body'] = array(
    '#type' => 'textarea',
    '#title' => t('Message to the moderator'),
    '#description' => t('Please respond to the moderation messsage you received and provide additional information as appropriate to help the moderator.'),
    '#rows' => 20,
    '#required' => TRUE,
  );
  $form['buttons']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Submit'),
    '#weight' => 5,
  );
  // This flag can be used by modr8, or other modules to change the
  // teaser specifically for when it's being shown in the moderation
  // list.
  $node->modr8_form_teaser = TRUE;
  $teaser = drupal_render(node_view($node, 'teaser'));
  $form['preview'] = array(
    '#type' => 'value',
    '#value' => $teaser,
  );
  $form['author_uid'] = array(
    '#type' => 'value',
    '#value' => $node->uid,
  );
  $form['nid'] = array(
    '#type' => 'value',
    '#value' => $node->nid,
  );

  return $form;
}

/**
 * Form submit handler - log author response.
 *
 * @see.modr8_response_form().
 */
function modr8_response_form_submit($form, &$form_state) {
  $form_state['values']['title'] = check_plain($form_state['values']['title']);
  $message = filter_xss(nl2br($form_state['values']['body']), array('br'));
  modr8_log_action('response', $form_state['values']['nid'], $form_state['values'], $message);
  $form_state['redirect'] = 'node/' . $form_state['values']['nid'];
  drupal_set_message(t('Your response has been logged.'));
}

/**
 * Menu callback; displays the content moderation form.
 */
function modr8_page() {
  $is_published = array(0,  1);
  if (!user_access('administer nodes')) {
    // Users who don't have the 'administer nodes' permission can only see published nodes.
    $is_published = 1;
  }
  $qry = db_select('node', 'n')
    ->extend('PagerDefault')
    ->limit(variable_get('modr8_nodes_per_page', 10))
    ->fields('n', array('nid', 'changed'))
    ->condition('n.moderate', 1)
    ->condition('n.status',  $is_published)
    ->addTag('node_access')
    ->addMetaData('base_table', 'node');

  //Apply the filters if its present in $_GET
  foreach (array('modr8_content_type', 'modr8_content_author') as $index => $type) {
    if (empty($_GET[$type]) || $_GET[$type] == '[any]') {
      continue;
    }
    $value = $_GET[$type];
    switch ($type) {
      case 'modr8_content_type':
        if (node_type_load($value)) {
          $qry->condition('n.type', $value);
        }
        else {
          drupal_set_message(t('Content type "@type" doesn\'t exists', array('@type' => $value)), 'warning');
        }
        break;
      case 'modr8_content_author':
        $user = user_load_by_name($value);
        if (isset($user->uid)) {
          $qry->condition('n.uid', $user->uid);
        }
        else {
          drupal_set_message(t('Username "@username" doesn\'t exists', array('@username' => $value)), 'warning');
        }
        break;
    }
  }
  $result = $qry->execute()->fetchAll();
  $output['header'] = array(
    '#markup' => '<p>' . l(t('Show log of all actions on moderated content.'), 'admin/reports/modr8') . '</p>',
  );

  $nid_list = array();
  foreach ($result as $r) {
    $nid_list[] = $r->nid;
  }

  $output['filter'] = drupal_get_form('modr8_filter_form');

  if ($nid_list) {
    $output['form'] = drupal_get_form('modr8_form', $nid_list);
    $output['pager_pager'] = array('#theme' => 'pager');
  }
  else {
    $output['footer'] = array(
      '#markup' => '<p>' . t('@items in moderation', array('@items' => format_plural(0, '1 post', '@count posts'))) . '</p>',
    );
  }
  return $output;
}

/**
 * Content moderation form.
 */
function modr8_form($form, $form_state, $nid_list = array()) {
  $form = array(
    '#theme' => 'modr8_form',
    '#tree' => TRUE,
  );

  foreach ($nid_list as $nid) {
    $op_options = array();
    $node = node_load($nid);
    // This flag can be used by modr8, or other modules to change the teaser specifically
    // for when it's being shown in the moderation list.
    $node->modr8_form_teaser = TRUE;
    $node->build_mode = NODE_BUILD_MODR8_TEASER;
    $teaser = modr8_get_node_teaser($node);

    $form[$node->nid] = array(
      '#tree' => TRUE,
    );

    $op_options['approve'] = t('Approve');
    if (node_access("delete", $node)) {
      $op_options['delete'] = t('Delete');
    }
    $op_options['nada'] = t('No action');

    $form[$node->nid]['ops'] = array(
      '#type' => 'radios',
      '#options' => $op_options,
      '#default_value' => variable_get('modr8_default_option', 'nada'),
    );
    if (variable_get('modr8_send_approve', FALSE) || variable_get('modr8_send_deny', FALSE)) {
      $form[$node->nid]['note'] = array(
        '#type' => 'textarea',
        '#title' => t('Note to author'),
        '#cols' => 15, // keep it narrow
      );
    }
    $form[$node->nid]['preview'] = array(
      '#type' => 'value',
      '#value' => $teaser,
    );

    $form[$node->nid]['log_link'] = array(
      '#markup' => modr8_get_log_link($node),
    );
  }
  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save'),
  );

  return $form;
}

/**
 * Themes the content moderation form.
 */
function theme_modr8_form($variables) {
  $form = $variables['form'];
  $headers = array(
    t('Operations'),
    t('Content'),
  );
  $rows = array();
  foreach (element_children($form) as $key) {
    // Only do this for nodes; not the submit button.
    if (is_numeric($key)) {
      $row = array();
      $note_field = '';
      if (variable_get('modr8_send_approve', FALSE) || variable_get('modr8_send_deny', FALSE)) {
        $note_field .= drupal_render($form[$key]['note']);
      }
      $row[] = array(
        'data' => drupal_render($form[$key]['ops']) . $note_field,
        'style' => 'vertical-align:top;',
      );
      $preview = $form[$key]['preview']['#value'];

      if (!empty($form[$key]['log_link']['#markup'])) {
        $preview .= '<div><em>' . drupal_render($form[$key]['log_link']) . '</em></div>';
      }
      $row[] = array(
        'data' => $preview,
        'style' => 'vertical-align:top;',
      );
      $rows[] = $row;
    }
  }
  $output = theme('table', array('header' => $headers, 'rows' => $rows));
  $output .= drupal_render_children($form);

  return $output;
}

/**
 * Form submit handler, which approves or deletes the node.
 */
function modr8_form_submit($form, &$form_state) {
  foreach ($form_state['values'] as $nid => $values) {
    $node = node_load($nid);
    $note = isset($values['note']) ? $values['note'] : '';
    switch ($values['ops']) {
      case 'approve':
        modr8_approve_content($node, $note);
        break;
      case 'delete':
        modr8_delete_content($node, $note);
        break;
      case 'nada':
        if (variable_get('modr8_send_noact', FALSE) && !empty($values['note'])) {
          $message = '';
          $build_values = _modr8_build_values($node, $note);
          $message = modr8_usermail('nada', $nid, $build_values);
          modr8_log_action('nada', $nid, $build_values, $message);
        }
        break;
    }
  }
}

/**
 * Content moderation filter form.
 */
function modr8_filter_form($form, $form_state) {
  $form['#method'] = 'get';
  $form['filters'] = array(
    '#type' => 'fieldset',
    '#title' => t('Show only items where'),
    '#theme' => 'exposed_filters__node',
  );
  $options = array(
    '[any]' => 'Any'
  ) + get_modr8_node_types();
  $form['filters']['modr8_content_type'] = array(
    '#type' => 'select',
    '#title' => t('type'),
    '#default_value' => (isset($_GET['modr8_content_type']) ? $_GET['modr8_content_type'] : '[any]'),
    '#options' => $options,
  );
  $form['filters']['modr8_content_author'] = array(
    '#type' => 'textfield',
    '#title' => t('user'),
    '#default_value' => (isset($_GET['modr8_content_author']) ? $_GET['modr8_content_author'] : ''),
    '#autocomplete_path' => 'user/autocomplete',
    '#size' => 25,
    '#maxlength' => 60,
  );
  $form['filters']['actions'] = array(
    '#type' => 'actions',
    '#attributes' => array('class' => array('container-inline')),
  );
  $form['filters']['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Filter'),
  );
  if (isset($_GET['modr8_content_type']) || isset($_GET['modr8_content_author'])) {
    $form['filters']['actions']['reset'] = array(
      '#markup' => l(t('Reset'), 'admin/content/modr8'),
    );
  }

  $form['#token'] = FALSE;

  return $form;
}

/**
 * To fetch the moderation enaled node type list
 */
function get_modr8_node_types() {
  $node_types = node_type_get_names();
  foreach ($node_types as $type => $name){
    $node_options = variable_get('node_options_' . $type);
      if(!is_array($node_options) || !in_array('moderate', $node_options)){
        unset($node_types[$type]);
      }
  }
  return $node_types;
}

/**
 * Moderation log
 */
function modr8_log_action($op, $nid, $values, $message) {
  global $user;
  $actions = array(
    'approve' => 'Approve',
    'delete' => 'Delete',
    'nada' => 'No action',
    'response' => 'Response',
  );

  $id = db_insert('modr8_log')
  ->fields(array(
    'nid' => $nid,
    'uid' => $user->uid,
    'author_uid' => $values['author_uid'],
    'action' => $actions[$op],
    'title' => $values['title'],
    'message' => $message,
    'teaser' => $values['preview'],
    'timestamp' => REQUEST_TIME,
  ))
  ->execute();
}

/**
 * Sending notification to users.
 */
function modr8_usermail($op, $nid, $values) {
  $node = node_load($nid);

  if (is_object($node)) {

    switch ($op) {
      case 'approve':
        $subject = variable_get('modr8_accepted_subject', '[%site] %title has been approved');
        $message = variable_get('modr8_accepted_text', modr8_accept_default());
        $optype = t('approval');
        break;
      case 'deny':
        $subject = variable_get('modr8_denial_subject', '[%site] %title has been denied');
        $message = variable_get('modr8_denial_text', modr8_denial_default());
        $optype = t('denial');
        break;
      case 'nada':
        $subject = variable_get('modr8_noact_subject', "[%site] note to author about %title");
        $message = variable_get('modr8_noact_text', modr8_noact_default());
        $optype = t('note (no action)');
        break;
    }

    // get the user info for author
    $account = user_load($node->uid);

    $note = theme('modr8_note', array('0' => $values['note']));

    $sendmail_from = '';
    $site_mail = variable_get('modr8_email_from', '');
    if (!$site_mail) {
      $sendmail_from = ini_get('sendmail_from');
      $site_mail = variable_get('site_mail', $sendmail_from);
    }
    if (empty($site_mail) || $site_mail == $sendmail_from) {
      drupal_set_message(t('You should create an administrator mail address for your site! <a href="@url">Do it here</a>.', array('@url' => url('admin/config/site-information'))), 'error');
    }
    // send the email
    $language = user_preferred_language($account);
    $params = array(
      'account' => $account,
      'node' => $node,
      'subject' => $subject,
      'message' => $message,
      'note' => $note,
    );

    if ($account->uid == 0) {
      $message = t('Anonymous user; no %type message was sent.', array('%type' => $optype));
    }
    else {
      $sent = drupal_mail('modr8', 'notify', $account->mail, user_preferred_language($account), $params);
      if (!empty($sent['result'])) {
        drupal_set_message(t('%type message was sent to %username', array('%type' => $optype, '%username' => $account->name)));
        $message = filter_xss(nl2br($sent['body']), array('br', 'a')); // Return sanitized e-mail with HTML breaks added.
      }
      else {
        $message = t('There was a problem sending the %type message to %username', array('%type' => $optype, '%username' => $account->name));
        drupal_set_message($message, 'error');
      }
    }
  }
  else {
    $message = t('An error occurred when trying to load this content.');
    drupal_set_message($message); // this probably won't ever get called
  }
  return $message;
}

/**
 * Implements hook_mail().
 */
function modr8_mail($key, &$message, $params) {
  $language = $message['language'];
  $node = $params['node'];
  $account = $params['account'];
  $note = $params['note'];
  //$message['headers']['Content-Type'] = 'text/html; charset=UTF-8; format=flowed';
  switch ($key) {
    case 'notify':
      // eval the replacements
      $replacements_raw = modr8_replacements();
      foreach ($replacements_raw as $key => $val) {
        eval('$replacements["$key"] = ' . $val . ';');
      }
      $params['subject'] = strtr($params['subject'], $replacements);
      $params['message'] = strtr($params['message'], $replacements);
      $message['subject'] = $params['subject'];
      $message['body'] = array($params['message']);
    break;
  }
}

/**
 * Theming for modr8 note.
 */
function theme_modr8_note($variables) {
  $note = $variables['0'];
  if ($note) {
    // Do not filter here (use !) since this note is sanitized after e-mailing
    $note = t("Note:
  !note", array('!note' => $note));
  }
  return $note;
}

/**
 * Modr8 replacements
 */
function modr8_replacements() {
  return array(
    '%title' => '$node->title',
    '%teaser' => 'modr8_get_node_teaser($node)',
    '%body' => '$node->body[$node->language][0]["value"]',
    '%short_date' => 'format_date($node->created, "short")',
    '%medium_date' => 'format_date($node->created, "medium")',
    '%long_date' => 'format_date($node->created, "long")',
    '%type' => 'node_type_get_name($node)',
    '%node_url' => 'url("node/". $node->nid, array("absolute" => TRUE))',
    '%nid' => '$node->nid',
    '%author_name' => '$account->name',
    '%author_mail' => '$account->mail',
    '%author_url' => 'url("user/". $account->uid, array("absolute" => TRUE))',
    '%site' => 'variable_get("site_name", "Drupal")',
    '%note' => '$note',
    '%response_url' => 'url("node/". $node->nid ."/log/response/". modr8_response_token($node->nid, $account->uid), array("absolute" => TRUE))',
  );
}

/**
 * Default message for accept.
 */
function modr8_accept_default() {
  return t(
'Your %type entry entitled "%title" has been approved by our content moderator! Other visitors to %site will now be able to view it.

You can visit %node_url to view it yourself.

%note

Regards,
The %site team');
}

/**
 * Default message for denial.
 */
function modr8_denial_default() {
  return t(
'Your %type entry entitled "%title" has been denied by our content moderator. The content has been deleted from our site.

%note

Regards,
The %site team');
}

/**
 * Default message for no action.
 */
function modr8_noact_default() {
  return t(
'Your %type entry entitled "%title" has been reviewed by our content moderator, but not yet approved.

%note

To respond to the moderator, you can visit %response_url

You can visit %node_url to view it yourself, but is is not yet visible to other site visitors.

Regards,
The %site team');
}


/**
 * menu callback for moderation log.
 */
function modr8_log_view($op = '', $id = 0) {

  switch ($op) {
    case '':
      return modr8_log_overview();
    case 'node':
      if (is_numeric($id)) {
        $node = node_load($id);
        if (!empty($node->title)) {
          drupal_set_title($node->title);
        }
        return modr8_log_overview($id);
      }
      break;
    case 'event':
      if (is_numeric($id)) {
        drupal_set_title(t('Moderation log event'));
        return modr8_log_event($id);

      }
      break;
  }
  drupal_not_found();
}

/**
 * Moderation log overview.
 */
function modr8_log_overview($nid = 0) {

  $header = array(
    array('data' => t('Action')),
    array(
      'data' => t('User'),
      'field' => 'u.name',
    ),
    array(
      'data' => t('Date'),
      'field' => 'ml.modid',
      'sort' => 'desc',
    ),
    array('data' => t('Title (view event)')),
  );
  $events = db_select('modr8_log', 'ml')
    ->extend('TableSort')
    ->extend('PagerDefault')
    ->limit(variable_get('modr8_logs_per_page', 15))
    ->addTag('node_access')
    ->addMetaData('base_table', 'modr8_log');
  $events->leftJoin('users',  'u',  'ml.uid = u.uid');
  $events->fields('ml',  array('modid',  'action',  'title',  'timestamp'))
     ->fields('u',  array('name',  'uid'))
     ->orderByHeader($header);

  //If nid is present show the logs for that node alone
  if ($nid) {
    $events->condition('ml.nid', $nid);
  }

  $events  =  $events->execute();

  foreach ($events  as  $event) {
    $rows[] = array(
      t($event->action),
      theme('username', array('account' => $event)),
      format_date($event->timestamp, 'short'),
      l(truncate_utf8($event->title, 50, TRUE, TRUE), 'admin/reports/modr8/event/' . $event->modid, array(), NULL, NULL, FALSE, TRUE),
    );
  }

  if (!$rows) {
    $rows[] = array(array(
        'data' => t('No log messages available.'),
        'colspan' => 4,
      ));
  }
  $output = '';
  $output .= theme('table', array('header' => $header, 'rows' => $rows));
  $output .= theme('pager', array('tags' => NULL, 'element' => 0));

  return $output;
}

/**
 * Moderation event log.
 */
function modr8_log_event($modid) {

  if (is_numeric($modid)) {
    $qry  =  db_select('modr8_log', 'ml')
      ->condition('ml.modid',  $modid)
      ->addTag('node_access')
      ->addMetaData('base_table', 'modr8_log');
    $qry->join('users', 'u', 'u.uid = ml.uid');
    $qry->fields('ml')
      ->fields('u',  array('name'));
    $events  =  $qry->execute()->fetchAll();
    if ($events) {
      $event = $events[0];
      $qry  =  db_select('users', 'u')
        ->condition('u.uid',  $event->author_uid)
        ->fields('u',  array('name',  'uid'))
        ->execute()
        ->fetchAll();
      if ($qry) {
        $event->author  =  $qry[0];
      }
      return theme('moderation_event', array('0' => $event));
    }
  }

  drupal_not_found();
}

/**
 * Theming for moderation event.
 */
function theme_moderation_event($variables) {
  $event = $variables['0'];

  $rows[] = array(array(
      'data' => l(t('Overview of all moderation log events for this post'), 'node/' . $event->nid . '/modr8/'),
      'colspan' => 2,
    ));
  $rows[] = array(t('Action:'), t($event->action));
  $rows[] = array(t('Date:'), format_date($event->timestamp, 'short'));
  if ($event->action == 'Response') {
    $rows[] = array(t('Author:'), theme('username', array('account' => $event)));
    $rows[] = array(t('Response title:'), $event->title);
    $rows[] = array(
      'data' => array(t('Response message:'), $event->message),
      'style' => 'vertical-align:top;',
    );
    $rows[] = array(
      'data' => array(t('Teaser (as of response):'), $event->teaser),
      'style' => 'vertical-align:top;',
    );
  }
  else {
    $rows[] = array(t('Moderator:'), theme('username', array('account' => $event)));
    $rows[] = array(
      'data' => array(t('E-mail message:'), $event->message),
      'style' => 'vertical-align:top;',
    );
    $rows[] = array(t('Author:'), theme('username', array('account' => $event->author)));
    $rows[] = array(
      'data' => array(t('Teaser (as reviewed):'), $event->teaser),
      'style' => 'vertical-align:top;',
    );
  }

  return theme('table', array('header' => NULL, 'rows' => $rows));
}
