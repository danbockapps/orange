<?php
if(!am_i_admin())
  exit_error(9);

$ok_array['participants'] = pdo_select("
  select
    u.fbid,
    u.fname,
    u.lname,
    u.email,
    u.dateuseradded,
    t.teamname,
    t.teamid
  from
    users u
    natural left join team_members m
    natural left join teams t
  where
    u.activated
    and !u.testuser
");
?>
