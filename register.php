<?php
require_once("config.php");

$contents = file_get_contents("php://input");
$post = json_decode($contents, true);

if(strlen($post['password']) < 8) exit_error("Password too short");
if(email_already_in_db($post['email'])) exit_error("Email already registered");

pdo_upsert(
  "insert into users (email, password) values (?, ?)",
  array(
    $post['email'], 
    pwhash($post['password'])
  )
);

reset_akey($post['email']);

exit(json_encode(array(responsestring=>"OK")));

?>