<?php
if(!am_i_admin())
  exit_error(9);

if(!isset($post['userId']) || !isset($post['teamId']))
  exit_error(16);

if(tenMembersAlready($post['teamId']))
  exit_error(18);

$qr = select_one_record("
  select count(*) as count
  from teams
  where teamid = ?
", $post['teamId']);

if($qr['count'] == 0)
  exit_error(14);

pdo_upsert("
  insert into team_members (
    teamid,
    userid,
    captain,
    dateuserteamadded
  ) values (?, ?, false, now())
", array($post['teamId'], $post['userId']));


$ok_array['teams'] = teams();
$ok_array['participants'] = participants();
?>