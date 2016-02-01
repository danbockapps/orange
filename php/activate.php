<?php

if($post['email'] != email_for_key($post['key'])['email']) {
  exit_error(3);
}
else {
  $success_password = true;
  $success_name = true;


  /**** UPDATE PASSWORD ****/

  if(isset($post['password'])) {
    $success_password = pdo_upsert("
      update users
      set
        activated = true,
        password = ?
      where email = ? and akey = ?
    ", array(pwhash($post['password']), $post['email'], $post['key']));
  }


  /**** UPDATE FIRST AND LAST NAME ****/

  if(isset($post['fname']) && isset($post['lname'])) {
    $success_name = pdo_upsert("
      update users
      set
        activated = true,
        fname = ?,
        lname = ?
      where email = ? and akey = ?
    ", array($post['fname'], $post['lname'], $post['email'], $post['key']));
  }


  if($success_password && $success_name) {
    reset_akey($post['email']);
  }
  else {
    exit_error(4);
  }
}
?>