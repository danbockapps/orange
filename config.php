<?php
CRYPT_BLOWFISH or die ('No Blowfish found.');
define("BLOWFISH_PRE", "$2y$05$");
define("BLOWFISH_SUF", "$");

if(!isset($_SERVER['SERVER_NAME'])) {
  exit("No server name found");
}

if($_SERVER['SERVER_NAME'] == "danbock.net") {
  define("ENVIRONMENT", "dev");
  define("DATABASE_NAME", "topbidfa_orange");
}
else {
  exit("No environment.");
}

$ini_array = parse_ini_file("auth.ini");
print_r($ini_array);
?>
