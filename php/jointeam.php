<?php
if(!isset($_SESSION['userid']))
  exit_error(15);

if(user_current_team($_SESSION['userid']) != null)
  exit_error(13);

if(tenMembersAlready($post['joinCode']))
  exit_error(18);

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


function tenMembersAlready($joinCode) {
  $tmaqr = select_one_record("
    select count(*) as count
    from
      team_members
      natural join teams
    where joincode = ?
  ", $joinCode);
  
  if($tmaqr['count'] >= 10)
    return true;
  else
    return false;
}
?>
