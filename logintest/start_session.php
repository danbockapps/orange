<?php
session_start();
$_SESSION['test'] = "session is on.";
$_SESSION['userid'] = 5;
echo $_SESSION['userid'];
?>