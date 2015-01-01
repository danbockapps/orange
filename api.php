<?php
session_start();
require_once("php/config.php");
$contents = file_get_contents("php://input");

if($_GET['q'] != "init") {
  logtxt(json_encode($_GET) . " " . $contents);
}

$post = json_decode($contents, true);

// Initialize array that will be returned if no error.
$ok_array = array(
  q => $_GET['q'],
  responsestring => "OK"
);

require("php/" . $_GET['q'] . ".php");

// If the required file didn't already exit:
exit(json_encode($ok_array, JSON_NUMERIC_CHECK));
?>