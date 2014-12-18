<?php
session_start();
require_once("config.php");

echo json_encode(array(
  "projectname" => $ini_array['projectname'],
  "userid" => $_SESSION['userid']
));

?>