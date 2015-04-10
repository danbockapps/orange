<?php
require_once("php/config.php");
session_start();

$contents = file_get_contents("php://input");
$post = json_decode($contents, true);

// Initialize array that will be returned if no error.
$ok_array = array(
  q => $_GET['q'],
  responseString => "OK"
);

$start_time = microtime(true);
require("php/" . $_GET['q'] . ".php");
$end_time = microtime(true);

logtxt(
  number_format($end_time - $start_time, 4) .
  " " .
  json_encode($_GET) .
  " " .
  $contents
);

// If the required file didn't already exit:
exit(json_encode($ok_array, JSON_NUMERIC_CHECK));
?>
