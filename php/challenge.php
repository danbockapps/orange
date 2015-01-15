<?php
$ok_array['challenge'] = select_one_record("
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

