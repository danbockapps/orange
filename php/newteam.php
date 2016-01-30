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
      "Your " . $ini['projectname'] . " Team",
      "Your team, " . $post['teamName'] . ", has been created. " .
      "Tell your friends to go to https://behealthynowalamance.com/points " .
      "to register and join your team. Good luck with the challenge!"
    );
  }
}

$ok_array['joinCode'] = $join_code_candidate;
?>
