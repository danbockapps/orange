<?php
/*
for each team member:
name
list of activity (date and points)
goal
*/

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
", $tiqr['teamid']);

$ok_array['teamReports'] = pdo_select("
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
", $tiqr['teamid']);
?>
