<?php
CRYPT_BLOWFISH or die ('No Blowfish found.');
define("BLOWFISH_PRE", "$2y$05$");
define("BLOWFISH_SUF", "$");
$ini = parse_ini_file("auth.ini");

function pwhash($password) {
  $allowed_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./';
  $salt = "";

  for($i=0; $i<21; $i++) { // 21 is standard salt length
    $salt .= $allowed_chars[mt_rand(0,strlen($allowed_chars)-1)];
  }
  return crypt($password, BLOWFISH_PRE . $salt . BLOWFISH_SUF);
}


function pdo_connect() {
  global $ini;
  try {
    $dbh = new PDO(
      "mysql:host=localhost;dbname=" . $ini['databasename'],
      $ini['databaseusername'],
      $ini['databasepassword']
    );
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  }
  catch(PDOException $e) {
    echo $e->getMessage();
  }

  return $dbh;
}

function pdo_upsert($sql, $qs) {
  $dbh = pdo_connect();
  $sth = $dbh->prepare($sql);
  return $sth->execute($qs);
}

function pdo_select($query, $qs) {
   $dbh = pdo_connect();
   $sth = $dbh->prepare($query);
   $sth->setFetchMode(PDO::FETCH_ASSOC);
   $sth->execute($qs);
   return $sth->fetchAll();
}

function logtxt($string) {
  file_put_contents(
    "log.txt",
    date("Y-m-d G:i:s") . " " . $string,
    FILE_APPEND
  );
}

function email_already_in_db($email) {
  $email_search = pdo_select("
    select count(*) as count
    from users
    where email = ?
  ", array($email));
  return $email_search[0]['count'];
}

function reset_akey($email) {
  $done = false;
  
  while(!$done) {
    $key_candidate = md5(uniqid(rand(), true));
    
    //Make sure the key is unique
    $key_search = pdo_select("
      select count(*) as count
      from users
      where akey = ?
    ", array($key_candidate));
    
    if($key_search[0]['count'] == 0) {
      logtxt("Key for " . $email . " is " . $key_candidate);
      $done = true;
      pdo_upsert("
        update users
        set akey = ?
        where email = ?
      ", array($key_candidate, $email));
    }
  }
}

function exit_error($responsecode) {
  $returnable['responsestring'] = "ERROR";
  $returnable['responsecode'] = $responsecode;
  
  if($responsecode == 1)
    $returnable['explanation'] = "Password is too short";
  if($responsecode == 2)
    $returnable['explanation'] = "Email is already registered";
  
  exit(json_encode($returnable));
}
?>
