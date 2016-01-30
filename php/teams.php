<?php
$ok_array['teams'] = pdo_select("
  select
    t.teamname,
    t.teamid,
    u.fname,
    substring(u.lname, 1, 1) as linitial
  from
    teams t
    natural join team_members tm
    natural join users u
  where
    t.challengeid = ?
    and tm.captain
", current_challengeid());
?>