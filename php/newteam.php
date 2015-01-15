<?php
if(user_current_team($_SESSION['userid']) != null)
  exit_error(13);

$found_unique_join_code = false;

while(!$found_unique_join_code) {
  $join_code_candidate = str_pad(mt_rand(0, 999999), 6, "0", STR_PAD_LEFT);
  
  $search = select_one_record("
    select count(*) as count
    from teams
    where joincode = ?
  ", $join_code_candidate);
  
  if($search['count'] == 0) {
    $found_unique_join_code = true;
    
    pdo_upsert("
      insert into teams (
        challengeid,
        teamname,
        joincode,
        dateteamadded
      ) values (?, ?, ?, now())
    ", array(
      current_challengeid(),
      $post['teamName'],
      $join_code_candidate
    ));
    
    $qr = select_one_record(
      "select teamid from teams where joincode = ?",
      $join_code_candidate
    );

    pdo_upsert("
      insert into team_members (
        teamid,
        userid,
        captain,
        dateuserteamadded
      ) values (?, ?, true, now())
    ", array(
      $qr['teamid'],
      $_SESSION['userid']
    ));
    
    sendmail(
      email_for_user($_SESSION['userid']),
      "Your " . $ini['projectname'] . " Join Code",
      "Your team, " . $post['teamName'] . ", has been created. " .
      "Your join code is:\n\n" .
      $join_code_candidate . "\n\n" .
      "Tell your friends to enter the join code to join your team."
    );
  }
}

$ok_array['joinCode'] = $join_code_candidate;
?>
