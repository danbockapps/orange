<?php
require_once("php/config.php");
session_start();

header("Location: " . $helper->getLoginUrl(array("scope" => "email")));
?>
