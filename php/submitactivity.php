<?php

if(!isset($_SESSION['userid']) || !isset($post['activityId']))
  //TODO change this error code
  exit_error(4);

pdo_upsert("
  insert into reports (userid, challengeid, activityid, units)
  values (?, ?, ?, ?)
", array($_SESSION['userid'], current_challengeid(), $post['activityId'], 1));

$ok_array['reports'] = reports();

?>