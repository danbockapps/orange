<?php
if(!am_i_admin())
  exit_error(9);

if(!isset($post['userId']))
  exit_error(16);

pdo_upsert("
  delete from team_members
  where userid = ?
  limit 1
", $post['userId']);

$ok_array['participants'] = participants();
$ok_array['teams'] = teams();
?>