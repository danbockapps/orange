<?php
$dqr = pdo_upsert("
  update challenges
  set deleted = true
  where challengeid = ?
", $post['challengeid']);

if(!$dqr) {
  exit_error(4);
}
?>
