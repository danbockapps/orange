<?php
session_start();
require_once("php/config.php");

header("Location: " . $helper->getLoginUrl(array("scope" => "email")));

?>
