<?php
$ckqr = email_for_key($_GET['key']);
if($ckqr['email'] == null) {
  exit_error(3);
}
else {
  $ok_array['email'] = $ckqr['email'];
  $ok_array['fname'] = $ckqr['fname'];
  $ok_array['lname'] = $ckqr['lname'];
}
?>