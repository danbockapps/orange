<?php
$email = email_for_key($_GET['key']);
if($email == null) {
  exit_error(3);
}
else {
  exit(json_encode(array(
    responsestring => "OK",
    email => $email
  )));
}
?>