<?php
if(strlen($post['password']) < 8)       exit_error(1);
if(email_already_in_db($post['email'])) exit_error(2);

logtxt($ini['recaptcha_secret']);

$recaptcha_success = json_decode(file_get_contents(
  "https://www.google.com/recaptcha/api/siteverify?secret=" . 
  $ini['recaptcha_secret'] . 
  "&response=" .
  $post['recaptcha_response']
))->success;

if($recaptcha_success != 1)             exit_error(5);

pdo_upsert(
  "insert into users (email, password) values (?, ?)",
  array(
    $post['email'], 
    pwhash($post['password'])
  )
);

$new_key = reset_akey($post['email']);

sendmail(
  $post['email'],
  "Your new account with " . $ini['projectname'],
  "Please click here to activate your new account: " .
    $ini['homeurl'] . "/#/activate/" . $new_key
);

exit(json_encode(array(responsestring=>"OK")));

?>