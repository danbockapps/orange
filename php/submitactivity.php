<?php
if(!isset($_SESSION['userid']))
  exit_error(15);

if(!isset($post['activityId']))
  exit_error(16);

pdo_upsert("
  insert into reports (userid, challengeid, activityid, units)
  values (?, ?, ?, ?)
", array($_SESSION['userid'], current_challengeid(), $post['activityId'], 1));

$ok_array['reports'] = reports();

?>