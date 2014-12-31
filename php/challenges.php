<?php
$ok_array['challenges'] = pdo_select("
  select
    challengeid,
    regstartdttm,
    regenddttm,
    startdttm,
    enddttm
  from challenges
  where !deleted
");
?>

