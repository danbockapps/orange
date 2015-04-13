<?php
if(!am_i_admin())
  exit_error(9);

$ok_array['users'] = pdo_select("
  select
    u.fname,
    u.lname,
    u.email
  from users u
  where u.userid in (
    select userid
    from current_team_members
  )
  order by
    u.lname,
    u.fname
");
?>
