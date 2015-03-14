<?php
$ckqr = email_for_key($_GET['key']);
if($ckqr['email'] == null) {
  // This might cause a problem if Facebook gives no email address
  // Solution: user can create another account
  exit_error(3);
}
else {
  $ok_array = array_merge($ok_array, $ckqr);
}
?>