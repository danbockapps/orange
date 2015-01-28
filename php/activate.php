<?php
if($post['email'] != email_for_key($post['key'])['email']) {
  exit_error(3);
}

else {
  $sqlArray = array(pwhash($post['password']));
  
  if(isset($post['fname']) && isset($post['lname'])) {
    // User is activating for the first time and is submitting all this info
    $surveyFields = "
      ,fname = ?
      ,lname = ?
      ,age = ?
      ,sex = ?
      ,heightinches = ?
    ";
    $sqlArray = array_merge($sqlArray, array(
      $post['fname'],
      $post['lname'],
      $post['age'],
      $post['sex'],
      $post['heightinches']
    ));
  }
  else {
    // User has activated in the past. fname, lname, etc. should already be
    // in database.
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