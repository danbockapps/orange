<?php
/*
$data = json_encode($_POST);
echo $data;
*/

$postdata = file_get_contents("php://input");
file_put_contents("log.txt", "\npostdata: " . $postdata, FILE_APPEND);

$request = json_decode($postdata);
//file_put_contents("log.txt", "\nrequest: " . $request, FILE_APPEND);

echo json_encode($request);



/*
749<br />
<form action="logintest.php" method="post">
<input type="hidden" name="a" value="b" />
<input type="submit" />
</form>
*/
?>

