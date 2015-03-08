<?php

session_start();
require_once("php/config.php");

try {
    $session = $helper->getSessionFromRedirect();
    // TODO sometimes there's no session and no exception. why?
    // I think we need to make sure the loginUrl is refreshed after it's been used.
} catch(FacebookRequestException $ex) {
    // When Facebook returns an error
    echo("exception 1");
} catch(\Exception $ex) {
    // When validation fails or other local issues
    echo("exception 2");
    print_r($ex);
}
if ($session) {
  // Logged in.
  $info = $session->getSessionInfo();
  //echo("Session expires at: " . $info->getExpiresAt()->format('Y-m-d H:i:s'));
  
  //TODO login/registration logic
  $_SESSION['userid'] = 9999;
  header("Location: " . $ini['homeurl']);
}
else {
  echo("No session."); 
}

?>
