<?php
session_start();
require_once("php/config.php");
$contents = file_get_contents("php://input");

if($_GET['q'] != "init") {
  logtxt(json_encode($_GET) . " " . $contents);
}

$post = json_decode($contents, true);

require("php/" . $_GET['q'] . ".php");

// If the required file didn't already exit:
exit(json_encode(array(
  q => $_GET['q'],
  responsestring => "OK"
)));

?>