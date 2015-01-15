<?php
$qr = select_one_record("
  select
    teamid,
    teamname
  from teams
  where joincode = ?
", $post['joinCode']);

if($qr == null)
  exit_error(14);

pdo_upsert("
  insert into team_members (
    teamid, 
    userid, 
    captain,
    dateuserteamadded
  ) values (?, ?, false, now())
", array($qr['teamid'], $_SESSION['userid']));

$ok_array['teamName'] = $qr['teamname'];
?>
