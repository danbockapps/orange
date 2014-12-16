<?php
session_start();
$_SESSION['test'] = "session is on.";
echo $_SESSION['test'];
?>