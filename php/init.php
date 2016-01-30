<?php
//TODO there are a lot of database queries here that could be consolidated.

$ok_array["projectname"] = $ini['projectname'];

$ok_array["challengeStart"] = convertDatesToISO8601(pdo_select("
  select startdttm
  from challenges
  where !deleted
"), "startdttm")[0]['startdttm'];

$ok_array["goal"] = select_one_record("
  select distinct tm.goal
  from
    team_members tm
    natural join teams t
    natural join challenges c
  where
    !c.deleted
    and tm.userid = ?
", $_SESSION['userid'])['goal'];

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
  $ok_array['teamName'] = user_current_team($_SESSION['userid']);
  $ok_array['userEmail'] = email_for_user($_SESSION['userid']);
  $ok_array['surveyDone'] = survey_done($_SESSION['userid']);
}

?>