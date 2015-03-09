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
  
  $success_users = pdo_upsert("
    update users
    set
      activated = true, 
      password = ?
      " . $surveyFields . "
    where email = ? and akey = ?
  ", $sqlArray);
  
  // TODO move these changing metrics to a separate survey page for repeat
  // participants
  $success_survey = true;
  if(
    isset($post['weight']) &&
    isset($post['zip']) &&
    isset($post['activityLevel']) &&
    isset($post['exerciseMins']) &&
    isset($post['exerciseTypes']) &&
    isset($post['fruits'])
  ) {
    // Update surveys table
    $success_survey = pdo_upsert("
      insert into surveys (
        challengeid,
        userid,
        weight, 
        zip, 
        activitylevel, 
        exercisemins, 
        exercisetypes,
        fruits
      ) values (?, ?, ?, ?, ?, ?, ?, ?)
    ", array(
      current_challengeid(),
      userid_for_email($post['email']),
      $post['weight'],
      $post['zip'],
      $post['activityLevel'],
      $post['exerciseMins'],
      $post['exerciseTypes'],
      $post['fruits']
    ));
  }
  
  if($success_users && $success_survey) {
    reset_akey($post['email']);
  }
  else {
    exit_error(4);
  }
}
?>