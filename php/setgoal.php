<?php
if(!isset($_SESSION['userid']))
  exit_error(15);

$tqr = select_one_record("
  select distinct tm.teamid
  from
    team_members tm
    natural join teams t
    natural join challenges c
  where
    !c.deleted and
    tm.userid = ?
", $_SESSION['userid']);

$qr = pdo_upsert("
  update team_members
  set goal = ?
  where
    userid = ?
    and teamid = ?
  limit 1
", array($post['goal'], $_SESSION['userid'], $tqr['teamid']));

?>
