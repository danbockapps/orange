<?php
require_admin();

$regstart = strtotime($post['regstart']);
$regend = strtotime($post['regend']);
$start = strtotime($post['start']);
$end = strtotime($post['end']);

if(!$regstart || !$regend || !$start || !$end) {
  exit_error(10);
}
else if(
  $regstart > $regend ||
  $start > $end ||
  $regstart > $start ||
  $regend > $end
) {
  exit_error(10);
}
else {
  pdo_upsert("
    update challenges
    set deleted=1
  ");
  
  pdo_upsert("
    insert into challenges (regstartdttm, regenddttm, startdttm, enddttm)
    values (?, ?, ?, ?)
  ", array(
    $post['regstart'],
    $post['regend'],
    $post['start'],
    $post['end']
  ));
}
?>
