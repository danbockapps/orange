<?php
if(isset($_SESSION['userid']))
  $ok_array['loggedIn'] = true;
else
  $ok_array['loggedIn'] = false;

if($_GET['teamId'] > 0) {
  $team_id = $_GET['teamId'];
}
else {
  $tiqr = select_one_record("
    select distinct tm.teamid
    from
      team_members tm
      natural join teams t
      natural join challenges c
    where
      !c.deleted
      and tm.userid = ?
  ", $_SESSION['userid']);
  $team_id = $tiqr['teamid'];
}

$ok_array['teamMembers'] = pdo_select("
  select distinct
    u.userid,
    u.fname,
    u.lname,
    tm.goal
  from
    users u
    natural join team_members tm
    natural join teams t
  where
    tm.teamid = ?
", $team_id);

$team_reports = pdo_select("
  select distinct
    r.userid,
    r.reportdttm,
    a.pointvalue
  from
    reports r
    natural join activities a
    natural join team_members tm
  where 
    !r.deleted
    and tm.teamid = ?
", $team_id);

$ok_array['teamReports'] = 
    convertDatesToISO8601($team_reports, "reportdttm");
?>
