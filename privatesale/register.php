<?php
	require_once 'config.php';
	// Create connection
	$mysql = new mysqli($servername, $username, $password, $database);

	// Check connection
	if ($mysql->connect_error) {
		$die("Connection failed: " . $mysql->connect_error);
	}

    if (!empty($_POST)) {        
    // if (true) {        
        $email = $_POST['email'];
        $name = $_POST['name'];
        // $email = 'muslihwaskito@gmail.com';
        // $name = 'muslih';
        $token = md5($email);
    
        $query = mysqli_query($mysql, "SELECT * FROM users WHERE email = '$email'");
        $result = mysqli_fetch_assoc($query);
        if ($result) {
            
            if ($result['is_active'] == '0') {
                $response = [
                    'status' => 200,
                    'message' => 'email '.$email.' is exist !',
                    'token' => $token,
                    'email' => $email
                ];
            } else {
                $response = [
                    'status' => 201,
                    'message' => 'email '.$email.' is exist !'
                ];
            }
            echo json_encode($response);
        } else {
            $insert = mysqli_query($mysql, "INSERT INTO users(email, name, is_active, token) VALUES('$email', '$name', 0, '$token')");
            if ($insert) {
                
                $response = [
                    'status' => 200,
                    'message' => 'Register successfully!',
                    'token' => $token,
                    'email' => $email
                ];
                echo json_encode($response);
            } else {
                echo mysqli_error($mysql);
                $response = [
                    'status' => 401,
                    'message' => 'Server error, please try again later!'
                ];
                echo json_encode($response);
            }
        }
    } else {
        $response = [
			'status' => 401,
			'message' => 'Email or password can\'t empty!'
		];
		echo json_encode($response);
    }
	
?>