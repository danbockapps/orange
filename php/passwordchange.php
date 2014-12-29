<?php
$ur = pdo_upsert("
  update users
  set
    password = ?,
    activated = true,
    fname = ?,
    lname = ?
  where akey = ?
", array(
  pwhash($post['newpassword']),
  $post['fname'],
  $post['lname'],
  $post['key']
));

if(!$ur) {
  exit_error(4);
}

reset_akey(email_for_key($post['key'])['email']);
?>