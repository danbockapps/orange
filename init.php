<?php
session_start();
require_once("config.php");

echo json_encode(array(
  "projectname" => $ini['projectname'],
  "userid" => $_SESSION['userid']
));

?>