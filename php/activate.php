<?php
if($post['email'] != email_for_key($post['key'])['email']) {
  exit_error(3);
}

else {
  $success = pdo_upsert("
    update users
    set activated = 1, fname = ?, lname = ?
    where email = ? and akey = ?
  ", array($post['fname'], $post['lname'], $post['email'], $post['key']));
  
  if($success) {
    reset_akey($post['email']);
    exit(json_encode(array(responsestring=>"OK")));
  }
  else {
    exit_error(4);
  }
}
?>