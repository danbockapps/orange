<?php
CRYPT_BLOWFISH or die ('No Blowfish found.');
define("BLOWFISH_PRE", "$2y$05$");
define("BLOWFISH_SUF", "$");
$ini = parse_ini_file("auth.ini");
date_default_timezone_set("America/New_York");

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
    date("Y-m-d G:i:s") . " " . $string . "\n",
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
      $done = true;
      pdo_upsert("
        update users
        set akey = ?
        where email = ?
      ", array($key_candidate, $email));
    }
  }
  
  return $key_candidate;
}

function exit_error($responsecode) {
  $returnable['responsestring'] = "ERROR";
  $returnable['responsecode'] = $responsecode;
  
  if($responsecode == 1)
    $returnable['explanation'] = "Password is too short";
  if($responsecode == 2)
    $returnable['explanation'] = "Email is already registered";
  if($responsecode == 3)
    $returnable['explanation'] = "Key not found";
  if($responsecode == 4)
    $returnable['explanation'] = "Database error";
  
  exit(json_encode($returnable));
}

function sendmail($to, $subject, $body) {
  require_once("Mail.php");
  global $ini;

  /* mail setup recipients, subject etc */
  $bcc = $ini['emaillogger'];
  $recipients = $to.",".$bcc;
  $headers["From"] = $ini['mailfrom'];
  $headers["To"] = $to;
  $headers["Subject"] = $subject;
  $mailmsg = $body;

  /* SMTP server name, port, user/passwd */
  $smtpinfo["host"] = $ini['mailhost'];
  $smtpinfo["port"] = $ini['mailport'];
  $smtpinfo["auth"] = true;
  $smtpinfo["username"] = $ini['mailusername'];
  $smtpinfo["password"] = $ini['mailpassword'];

  /* Create the mail object using the Mail::factory method */
  $mail_object =& Mail::factory("smtp", $smtpinfo);

  /* Ok send mail */
  $mail_object->send($recipients, $headers, $mailmsg);
}

function email_for_key($key) {
  $key_search = pdo_select("
    select email
    from users
    where akey = ?
  ", array($key));
  
  
  if(count($key_search) != 1) {
    return null;
  }
  else {
    return $key_search[0]['email'];
  }
}


?>
