<?php
$key_search = pdo_select("
  select email
  from users
  where akey = ?
", array($post['key']));

if(empty($key_search)) {
  exit_error(3);
}
else {
  pdo_upsert("
    update users
    set activated = 1
    where email = ?
  ", array($key_search[0]['email']));
  
  reset_akey($key_search[0]['email']);
  
  exit(json_encode(array(responsestring=>"OK")));
}
?>