<?php
$eqr = pdo_select("
  select akey
  from users
  where email = ?
", $post['email']);

if(empty($eqr))
  exit_error(8);

sendmail(
  $post['email'],
  "Your " . $ini['projectname'] . " account",
  "To reset your password, please follow this link: " .
    $ini['homeurl'] . "/#/passwordrecover/" . $eqr[0]['akey']
);
?>