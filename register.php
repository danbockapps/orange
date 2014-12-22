<?php
require_once("config.php");

$contents = file_get_contents("php://input");
$post = json_decode($contents, true);

file_put_contents(
  "log.txt", 
  $contents . "\n", 
  FILE_APPEND
);

if(strlen($post['password']) < 8) exit("Password too short");

pdo_insert(
  "insert into users (email, password, akey) values (?, ?, ?)",
  array(
    $post['email'], 
    pwhash($post['password']), 
    md5(uniqid(rand(), true))
  )
);

echo("register.php done");

?>