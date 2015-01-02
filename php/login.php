<?php
$qr = pdo_select("
  select
    userid,
    password,
    activated,
    fname,
    lname
  from users
  where email = ?
", array($post['email']));

if(empty($qr))
  exit_error(8);

if($qr[0]['activated'] != 1)
  exit_error(6);

$salt = substr($qr[0]['password'], 7, 21);
$in_hashd_passwd = crypt($post['password'], BLOWFISH_PRE . $salt . BLOWFISH_SUF);

if($qr[0]['password'] != $in_hashd_passwd)
  exit_error(7);

else {
  // Login successful
  $_SESSION['userid'] = $qr[0]['userid'];
  $_SESSION['fname'] = $qr[0]['fname'];
  $_SESSION['lname'] = $qr[0]['lname'];
  setcookie("loggedIn", true);
}
?>