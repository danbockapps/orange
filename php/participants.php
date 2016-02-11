<?php
if(!am_i_admin())
  exit_error(9);

$ok_array['participants'] = participants();
?>
