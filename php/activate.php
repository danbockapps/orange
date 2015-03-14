<?php

if($post['email'] != email_for_key($post['key'])['email']) {
  exit_error(3);
}
else {
  $success_password = true;
  $success_name = true;
  $success_survey_u = true;
  $success_survey_s = true;
  
  
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
  
  
  /**** UPDATE SURVEY AND OTHER INFO ****/
  
  if(
    isset($post['age']) &&
    isset($post['sex']) &&
    isset($post['heightinches']) &&
    isset($post['weight']) &&
    isset($post['zip']) &&
    isset($post['activityLevel']) &&
    isset($post['exerciseMins']) &&
    isset($post['exerciseTypes']) &&
    isset($post['fruits'])
  ) {
    $success_survey_u = pdo_upsert("
      update users
      set
        activated = true,
        age = ?,
        sex = ?,
        heightinches = ?
     where email = ? and akey = ?
    ", array(
      $post['age'], 
      $post['sex'], 
      $post['heightinches'], 
      $post['email'], 
      $post['key']
    ));
    
    $success_survey_s = pdo_upsert("
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
  
  if($success_password && $success_name && $success_survey_u && $success_survey_s) {
    reset_akey($post['email']);
  }
  else {
    exit_error(4);
  }
}
?>