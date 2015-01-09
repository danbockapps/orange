<?php
//TODO make sure the team creator is not already on a team
$found_unique_join_code = false;

while(!$found_unique_join_code) {
  $join_code_candidate = mt_rand(0, 999999);
  
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
        captainid,
        teamname,
        joincode,
        dateteamadded
      ) values (?, ?, ?, ?, now())
    ", array(
      current_challengeid(REG_OPEN),
      $_SESSION['userid'],
      $post['teamName'],
      str_pad($join_code_candidate, 6, "0", STR_PAD_LEFT)
    ));
  }

  //TODO add team captain to team_members table

}

$ok_array['joinCode'] = $join_code_candidate;
?>
