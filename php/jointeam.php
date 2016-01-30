<?php
if(!isset($_SESSION['userid']))
  exit_error(15);

if(user_current_team($_SESSION['userid']) != null)
  exit_error(13);

if(tenMembersAlready($post['teamToJoin']))
  exit_error(18);

$qr = select_one_record("
  select count(*) as count
  from teams
  where teamid = ?
", $post['teamToJoin']);

if($qr['count'] == 0)
  exit_error(14);

pdo_upsert("
  insert into team_members (
    teamid,
    userid,
    captain,
    dateuserteamadded
  ) values (?, ?, false, now())
", array($post['teamToJoin'], $_SESSION['userid']));

function tenMembersAlready($teamId) {
  $tmaqr = select_one_record("
    select count(*) as count
    from
      team_members
      natural join teams
    where teamid = ?
  ", $teamId);

  if($tmaqr['count'] >= 10)
    return true;
  else
    return false;
}
?>
