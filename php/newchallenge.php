<?php
if(!am_i_admin())
  exit_error(9);

pdo_upsert("
  insert into challenges (regstartdttm, regenddttm, startdttm, enddttm)
  values (?, ?, ?, ?)
", array(
  $post['regstart'],
  $post['regend'],
  $post['start'],
  $post['end']
));
?>