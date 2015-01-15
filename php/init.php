<?php
$ok_array["projectname"] = $ini['projectname'];
$ok_array = array_merge($ok_array, $_SESSION);

// Is a challenge open for registration? Is one currently going on?
$qr = select_one_record("
  select
    case
      when sum(regOpen) is null then 0
      else sum(regOpen)
    end as regOpen,
    case
      when sum(chalCurrent) is null then 0
      else sum(chalCurrent)
    end as chalCurrent
  from (
    select
      case
        when regstartdttm < now() and regenddttm > now() then 1
        else 0
      end as regOpen,
      case
        when startdttm < now() and enddttm > now() then 1
        else 0
      end as chalCurrent
    from challenges
    where !deleted
  ) current_challenges
");

$ok_array = array_merge($ok_array, $qr);

if(isset($_SESSION['userid'])) {
  $ok_array['team_id'] = user_current_team($_SESSION['userid']);
  $ok_array['userEmail'] = email_for_user($_SESSION['userid']);
}
?>