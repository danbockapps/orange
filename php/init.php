<?php
echo json_encode(array(
  "responsestring" => "OK",
  "projectname" => $ini['projectname'],
  "userid" => $_SESSION['userid'],
  "fname" => $_SESSION['fname'],
  "lname" => $_SESSION['lname']
));
?>