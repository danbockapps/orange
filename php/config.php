<?php
CRYPT_BLOWFISH or die ('No Blowfish found.');
define("BLOWFISH_PRE", "$2y$05$");
define("BLOWFISH_SUF", "$");
$ini = parse_ini_file("auth.ini");
ini_set("include_path", $ini['add_to_ipath'] . ini_get("include_path") );
date_default_timezone_set("America/New_York");

require __DIR__ . '/facebook-php-sdk-v4-4.0-dev/autoload.php';
use Facebook\FacebookRedirectLoginHelper;
use Facebook\FacebookRequest;
use Facebook\FacebookRequestException;
use Facebook\FacebookSession;
use Facebook\GraphUser;
FacebookSession::setDefaultApplication($ini['fb_app_id'], $ini['fb_secret']);
$fb_redirect_url = $ini['homeurl'] . "/fb_redirect.php";
$helper = new FacebookRedirectLoginHelper(
    $fb_redirect_url, $ini['fb_app_id'], $ini['fb_secret']);

function pwhash($password) {
  $allowed_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' .
    'abcdefghijklmnopqrstuvwxyz0123456789./';
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

function pdo_upsert($sql, $qs = null) {
  $dbh = pdo_connect();
  $sth = $dbh->prepare($sql);
  return $sth->execute(is_array($qs) ? $qs : array($qs));
}

function pdo_select($query, $qs = null) {
  $dbh = pdo_connect();
  $sth = $dbh->prepare($query);
  $sth->setFetchMode(PDO::FETCH_ASSOC);
  $sth->execute(is_array($qs) ? $qs : array($qs));
  return $sth->fetchAll();
}

function select_one_record($query, $qs = null) {
  $sorqr = pdo_select($query, $qs);
  if(count($sorqr) == 0)
    return null;
  else if(count($sorqr) == 1)
    return $sorqr[0];
  else
    throw new Exception("Unexpected records returned.");
}

function logtxt($string) {
  file_put_contents(
    "log.txt",
    date("Y-m-d G:i:s") . " " . $_SERVER['REMOTE_ADDR'] . " " .
        $_SESSION['userid'] . " " . $string . "\n",
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
  global $start_time, $contents;
  logtxt(
    number_format(microtime(true) - $start_time, 4) . 
    " " .
    json_encode($_GET) .
    " " .
    $contents .
    " ERROR" .
    $responsecode
  );

  $returnable['q'] = $_GET['q'];
  $returnable['responseString'] = "ERROR";
  $returnable['responseCode'] = $responsecode;

  // None of these "explanations" are displayed to the user; they are here to
  // make the code and JSON more human-readable.
  if($responsecode == 1)
    $returnable['explanation'] = "Password is too short";
  if($responsecode == 2)
    $returnable['explanation'] = "Email is already registered";
  if($responsecode == 3)
    $returnable['explanation'] = "Key not found";
  if($responsecode == 4)
    $returnable['explanation'] = "Database error";
  if($responsecode == 5)
    $returnable['explanation'] = "Recaptcha error";
  if($responsecode == 6)
    $returnable['explanation'] = "Account not activated";
  if($responsecode == 7)
    $returnable['explanation'] = "Wrong password";
  if($responsecode == 8)
    $returnable['explanation'] = "Email not found in users table";
  if($responsecode == 9)
    $returnable['explanation'] = "Not logged in as administrator";
  if($responsecode == 10)
    $returnable['explanation'] = "Date error";
  if($responsecode == 13)
    $returnable['explanation'] = "User already on a team";
  if($responsecode == 14)
    $returnable['explanation'] = "Join Code not found";
  if($responsecode == 15)
    $returnable['explanation'] = "User not logged in";
  if($responsecode == 16)
    $returnable['explanation'] = "An unknown error occurred";
  if($responsecode == 17)
    $returnable['explanation'] = "Too much of that activity (7)";
  if($responsecode == 18)
    $returnable['explanation'] = "Already ten people on that team";

  exit(json_encode($returnable));
}

function am_i_admin() {
  $qr = select_one_record("
    select admin
    from users
    where userid = ?
  ", $_SESSION['userid']);

  return $qr['admin'];
}

function sendmail($to, $subject, $body) {
  // Prevent email-related "strict" errors from showing in the log
  $old_error_level = error_reporting(E_ALL & ~E_STRICT);

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

  error_reporting($old_error_level);
}

function email_for_key($key) {
  return select_one_record("
    select
      email,
      fname,
      lname,
      activated,
      fbid
    from users
    where akey = ?
  ", array($key));
}

function key_for_email($email) {
  return select_one_record("
    select
      akey
    from users
    where email = ?
  ", $email);
}

function email_for_user($userid) {
  $qr = select_one_record("
    select email
    from users
    where userid = ?
  ", $userid);
  return $qr['email'];
}

function userid_for_email($email) {
  $qr = select_one_record("
    select userid
    from users
    where email = ?
  ", $email);
  return $qr['userid'];
}

function user_for_email($email) {
  return select_one_record("
    select
      userid,
      fname,
      lname
    from users
    where email = ?
  ", $email);
}

function user_current_team($userid) {
  $qr = select_one_record("
    select teamname
    from
      team_members tm
      natural join teams t
    where
      t.challengeid = ? and
      tm.userid = ?
  ", array(current_challengeid(), $userid));

  // If no team is found, this will return null.
  return $qr['teamname'];
}

function current_challengeid() {
  $qr = select_one_record("select challengeid from challenges where !deleted");
  return $qr['challengeid'];
}

function user_for_fbid($fbid) {
  return select_one_record("
    select
      userid,
      fname,
      lname
    from users
    where fbid = ?
  ", $fbid);
}

function fb_user_in_db($fbid) {
  $qr = select_one_record("
    select count(*) as count
    from users
    where fbid = ?
  ", $fbid);
  return $qr['count'];
}

function set_fbid($email, $fbid, $fname, $lname) {
  pdo_upsert("
    update users
    set
      fbid = ?,
      fname = ?,
      lname = ?
    where email = ?
  ", array($fbid, $fname, $lname, $email));
}

function fb_user_activated($fbid) {
  $qr = select_one_record("
    select count(*) as count
    from users
    where activated and fbid = ?
  ", $fbid);
  return $qr['count'];
}

function reports() {
  $qr = pdo_select("
    select
      r.reportid,
      r.reportdttm,
      a.shortdesc,
      a.pointvalue
    from
      reports r
      natural join activities a
    where
      !r.deleted and
      r.userid = ? and
      r.challengeid = ?
  ", array($_SESSION['userid'], current_challengeid()));
  
  $qr = convertDatesToISO8601($qr, "reportdttm");
  
  return $qr;
}

function challenge() {
  return select_one_record("
    select
      challengeid as id,
      regstartdttm as regStart,
      regenddttm as regEnd,
      startdttm as start,
      enddttm as end
    from challenges
    where !deleted
  ");
}

function convertDatesToISO8601($arrayWithDates, $dateElemName) {
  foreach($arrayWithDates as &$row) {
    $row[$dateElemName] = date('c', strtotime($row[$dateElemName]));
  }
  
  return $arrayWithDates;
}

?>
