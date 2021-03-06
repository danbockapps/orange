<?php

if(
  isset($post['age']) &&
  isset($post['sex']) &&
  isset($post['heightinches']) &&
  isset($post['weight']) &&
  isset($post['zip']) &&
  isset($post['activityLevel']) &&
  isset($post['exerciseMins']) &&
  isset($post['exerciseTypes']) &&
  isset($post['fruits']) &&
  isset($post['goal']) &&
  isset($_SESSION['userid'])
) {
  pdo_upsert("
    update users
    set
      age = ?,
      sex = ?,
      heightinches = ?
   where userid = ?
  ", array(
    $post['age'],
    $post['sex'],
    $post['heightinches'],
    $_SESSION['userid']
  ));

  pdo_upsert("
    insert into surveys (
      challengeid,
      userid,
      weight,
      zip,
      activitylevel,
      exercisemins,
      exercisetypes,
      fruits
    ) values (?, ?, ?, ?, ?, ?, ?, ?)
  ", array(
    current_challengeid(),
    $_SESSION['userid'],
    $post['weight'],
    $post['zip'],
    $post['activityLevel'],
    $post['exerciseMins'],
    $post['exerciseTypes'],
    $post['fruits']
  ));

  pdo_upsert("
    update team_members
    set goal = ?
    where
      userid = ?
      and teamid = ?
  ", array(
    $post['goal'],
    $_SESSION['userid'],
    user_current_teamid($_SESSION['userid'])
  ));
}

?>