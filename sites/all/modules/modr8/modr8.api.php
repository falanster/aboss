<?php

/**
 * @file
 *   Defines API hooks for the Modr8 module.
 */

/**
 * React to a content being approved.
 *
 * @param $node
 *   The node object that was being approved.
 * @param $values
 *   An associative array containing:
 *   - note: Note to the content author
 *   - author_uid: UID of the content author
 *   - log_link: Content moderation log link for the approved content.
 *   - title: Title of the approved content
 *   - type: Type of the approved content
 *   - preview: Teaser preview of the approved content
 * @param $message
 *   The message which was send to the content author. Empty if
 *   Send approval messages
 * @see modr8_approve_content()
 */
function hook_modr8_approve($node, $values, $message) {
  drupal_set_message(t('Content has been approved.'));
}

/**
 * React to a content being deleted.
 *
 * @param $node
 *   The node object that was being deleted.
 * @param $values
 *   An associative array containing:
 *   - note: Note to the content author
 *   - author_uid: UID of the content author
 *   - log_link: Content moderation log link for the deleted content.
 *   - title: Title of the deleted content
 *   - type: Type of the deleted content
 *   - preview: Teaser preview of the deleted content
 * @param $message
 *   The message which was send to the content author. Empty if
 *   Send denial messages
 * @see modr8_delete_content()
 */
function hook_modr8_delete($node, $values, $message) {
  drupal_set_message(t('Content has been deleted.'));
}

/**
 * React to a content being added to content moderation queue.
 *
 * @param $node
 *   The node object that was being added.
 * @see modr8_node_insert()
 */
function hook_modr8_insert($node) {
  drupal_set_message(t('Content has been added to content moderation queue.'));
}
