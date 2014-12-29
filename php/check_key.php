<?php
$ckqr = email_for_key($_GET['key']);
if($ckqr['email'] == null) {
  exit_error(3);
}
else {
  exit(json_encode(array(
    responsestring => "OK",
    email => $ckqr['email'],
    fname => $ckqr['fname'],
    lname => $ckqr['lname']
  )));
}
?>