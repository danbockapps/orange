<?php
use Facebook\FacebookRedirectLoginHelper;
use Facebook\FacebookRequest;
use Facebook\FacebookRequestException;
use Facebook\FacebookSession;
use Facebook\GraphUser;

session_start();
require_once("php/config.php");

try {
    $session = $helper->getSessionFromRedirect();
    // TODO sometimes there's no session and no exception. why?
    // I think we need to make sure the loginUrl is refreshed after it's been used.
} catch(FacebookRequestException $ex) {
    // When Facebook returns an error
    echo("exception 1");
    ?><pre><?php
    print_r($ex);
    ?></pre><?php
} catch(\Exception $ex) {
    // When validation fails or other local issues
    echo("exception 2");
    print_r($ex);
}
if ($session) {
  // Logged in.
  $info = $session->getSessionInfo();
  $request = new FacebookRequest($session, 'GET', '/me');
  $response = $request->execute();
  $graphObject = $response->getGraphObject(GraphUser::className());
  
  if(fb_user_in_db($info->getId())) {
    loginOrActivate($info->getId(), $graphObject->getEmail());
  }
  else {
    // User's FB ID is not in DB
    if(email_already_in_db($graphObject->getEmail())) {
      // Add user's FB ID to DB and log in
      // TODO don't log in if user has not activated
      set_fbid(
        $graphObject->getEmail(), 
        $info->getId(),
        $graphObject->getFirstName(),
        $graphObject->getLastName()
      );
      loginOrActivate($info->getId(), $graphObject->getEmail());
    }
    else {
      // Register new user
      pdo_upsert("
        insert into users (email, password, fname, lname, fbid)
        values (?, ?, ?, ?, ?)",
        array(
          $graphObject->getEmail(),
          "Registered via Facebook",
          $graphObject->getFirstName(),
          $graphObject->getLastName(),
          $info->getId()
        )
      );

      gotoActivate($graphObject->getEmail());
    }
  }
}
else {
  echo("An error occurred. Please click your back button and try again."); 
}

function loginOrActivate($fbid, $email) {
  if(fb_user_activated($fbid)) {
    fbLogin(user_for_fbid($fbid));
  }
  else {
    // User hasn't activated yet.
    gotoActivate($email);
  }
}

function gotoActivate($email) {
  global $ini;
  $headerarg = "Location: " . $ini['homeurl'] . "/#/activate/" . 
          reset_akey($email);
  header($headerarg);
}

function fbLogin($qr) {
  $_SESSION['userid'] = $qr['userid'];
  $_SESSION['fname'] = $qr['fname'];
  $_SESSION['lname'] = $qr['lname'];

  global $ini;
  header("Location: " . $ini['homeurl']);
}

?>
