<?php
pdo_upsert("
  update reports
  set deleted = true
  where
    reportid = ?
    and userid = ?
", array($post['reportId'], $_SESSION['userid']));

$ok_array['reports'] = reports();
?>
