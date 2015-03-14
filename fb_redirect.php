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
  
  if(fb_user_in_db($info->getId())) {
    // Log in
    $ufqr = user_for_fbid($info->getId());
    
    $_SESSION['userid'] = $ufqr['userid'];
    $_SESSION['fname'] = $ufqr['fname'];
    $_SESSION['lname'] = $ufqr['lname'];
    
    header("Location: " . $ini['homeurl']);
  }
  else {
    $request = new FacebookRequest($session, 'GET', '/me');
    $response = $request->execute();
    $graphObject = $response->getGraphObject(GraphUser::className());
    
    if(email_already_in_db($graphObject->getEmail())) {
      // Add user's FB ID to DB and log in
      set_fbid($graphObject->getEmail(), $info->getId());
      $ueqr = user_for_email($graphObject->getEmail());
      
      $_SESSION['userid'] = $ueqr['userid'];
      $_SESSION['fname'] = $ueqr['fname'];
      $_SESSION['lname'] = $ueqr['lname'];
    
      header("Location: " . $ini['homeurl']);
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
      
      header("Location: " . $ini['homeurl'] . "/#/activate/" . 
          reset_akey($graphObject->getEmail()));
    }
  }
}
else {
  echo("An error occurred. Please click your back button and try again."); 
}

?>
