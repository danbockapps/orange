<?php
require_once("php/config.php");
session_start();

if($_GET['registering'] == 'yes') {
  $_SESSION['registering'] = true;
}

header("Location: " . $helper->getLoginUrl(array("scope" => "email")));
?>