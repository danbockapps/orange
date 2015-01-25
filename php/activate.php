<?php
if($post['email'] != email_for_key($post['key'])['email']) {
  exit_error(3);
}

else {
  $sqlArray = array(pwhash($post['password']));
  
  if(isset($post['fname']) && isset($post['lname'])) {
    $surveyFields = "
      ,fname = ?
      ,lname = ?
    ";
    $sqlArray = array_merge($sqlArray, array(
      $post['fname'],
      $post['lname']
    ));
  }
  else {
    $surveyFields = "";
  }
  $sqlArray = array_merge($sqlArray, array(
    $post['email'],
    $post['key']
  ));
  
  $success = pdo_upsert("
    update users
    set
      activated = true, 
      password = ?
      " . $surveyFields . "
    where email = ? and akey = ?
  ", $sqlArray);
  
  if($success) {
    reset_akey($post['email']);
  }
  else {
    exit_error(4);
  }
}
?>