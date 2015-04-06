<?php
if(!isset($_SESSION['userid']))
  exit_error(15);

if(!isset($post['activityId']))
  exit_error(16);

if(tooMuchActivity($post['activityId']))
  exit_error(17);

pdo_upsert("
  insert into reports (userid, challengeid, activityid, units)
  values (?, ?, ?, ?)
", array($_SESSION['userid'], current_challengeid(), $post['activityId'], 1));

$ok_array['reports'] = reports();

function tooMuchActivity($activityId) {
  $tmaqr = select_one_record("
    select maxperweek
    from activities
    where activityid = ?
  ", $activityId);
  
  if($tmaqr['maxperweek'] == 0)
    return false;
  
  $tmrqr = select_one_record("
    select count(*) as count
    from reports
    where
      !deleted
      and userid = ?
      and activityid = ?
      and reportdttm between date_sub(now(), interval 7 day) and now()
      and challengeid in (
        select challengeid
        from challenges
        where !deleted
      )
  ", array($_SESSION['userid'], $activityId));
  
  if($tmrqr['count'] >= $tmaqr['maxperweek'])
    return true;
  else
    return false;  
}

?>