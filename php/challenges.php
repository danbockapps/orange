<?php
$ok_array['challenges'] = pdo_select("
  select
    challengeid as id,
    regstartdttm as regStart,
    regenddttm as regEnd,
    startdttm as start,
    enddttm as end
  from challenges
  where !deleted
");
?>

