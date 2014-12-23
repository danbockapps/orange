<?php
session_start();

echo json_encode(array(
  "projectname" => $ini['projectname'],
  "userid" => $_SESSION['userid']
));
?>