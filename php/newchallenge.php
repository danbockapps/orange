<?php
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