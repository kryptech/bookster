<html>
<head>
    <title>Generate Password Hash</title>
</head>
<body>

<title>Generate Password Hash</title>

<form method="post">
<input name="p" placeholder="Text to hash"> <input type="submit" value="Hash!">
</form>

<?php
$password = $_POST['p'];
if ($password != '') {
    echo '<input readonly value="' . password_hash($password, PASSWORD_DEFAULT) . '">';
}
?>

</body>
</html>
