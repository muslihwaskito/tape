<?php
    require_once 'config.php';
	// Create connection
	$mysql = new mysqli($servername, $username, $password, $database);

	// Check connection
	if ($mysql->connect_error) {
		$die("Connection failed: " . $mysql->connect_error);
	}

    if (!empty($_GET)) {        
    // if (true) {        
        $token = $_GET['token'];
    
        $query = mysqli_query($mysql, "SELECT * FROM users WHERE token = '$token'");
        $result = mysqli_fetch_assoc($query);
        if ($result) {
            $update = mysqli_query($mysql, "UPDATE users SET is_active=1 WHERE token = '$token'");
            if ($update) {
                header("Location: https://t-ape.io/privatesale");
                die();
            } else {
                echo "Confirmation failed! Please try again!";
            }
            echo json_encode($response);
        } else {
            echo "ERROR 404!";
        }
    } else {
		echo "ERROR 404!";
    }
?>