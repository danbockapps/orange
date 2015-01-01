<?php
$ok_array["projectname"] = $ini['projectname'];
$ok_array = array_merge($ok_array, $_SESSION);

// Is a challenge open for registration? Is one currently going on?
$qr = select_one_record("
  select
    case
      when sum(reg_open) is null then 0
      else sum(reg_open)
    end as reg_open,
    case
      when sum(chal_current) is null then 0
      else sum(chal_current)
    end as chal_current
  from (
    select
      case
        when regstartdttm < now() and regenddttm > now() then 1
        else 0
      end as reg_open,
      case
        when startdttm < now() and enddttm > now() then 1
        else 0
      end as chal_current
    from challenges
    where !deleted
  ) current_challenges
", array());

$ok_array = array_merge($ok_array, $qr);
?>