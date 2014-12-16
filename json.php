<?php
session_start();
echo json_encode(array(
  "response" => "OK",
  "sessionvar" => $_SESSION['test']
));