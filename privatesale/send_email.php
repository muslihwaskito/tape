
<?php
//Import PHPMailer classes into the global namespace
//These must be at the top of your script, not inside a function
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

//Load Composer's autoloader
require 'vendor/autoload.php';

//Create an instance; passing `true` enables exceptions
$mail = new PHPMailer(true);

if (empty($_POST)) {
    $response = [
        'status' => 400,
        'message' => ''
    ];
    echo json_encode($response);
    exit;
}

try {
    $html = file_POST_contents('message.php');
    $html = str_replace("https://t-ape.io/privatesale/confirm.php?token=", "https://t-ape.io/privatesale/confirm.php?token=".$_POST['token'], $html);
    //Server settings
    // $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
    // $mail->SMTPDebug  = 1;
    $mail->isSMTP();                                            //Send using SMTP
    $mail->Host       = 'ams208.hawkhost.com';                     //Set the SMTP server to send through
    $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
    $mail->Username   = 'no-reply@t-ape.io';                     //SMTP username
    $mail->Password   = 'e7-L85w-YzlR4P';                               //SMTP password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
    $mail->Port       = 465;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

    //Recipients
    $mail->setFrom('no-reply@t-ape.io','Admin T-Ape');
    $mail->addAddress($_POST['email']);     //Add a recipient
    // $mail->addAddress('ellen@example.com');               //Name is optional
    // $mail->addReplyTo('info@example.com', 'Information');

    //Content
    $mail->isHTML(true);                                  //Set email format to HTML
    $mail->Subject = 'Registration confirmation T-Ape privatesale';
    $mail->msgHTML($html);
    // $mail->Body    = 'This is the HTML message body <b>in bold!</b>';
    // $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

    $mail->send();
    $response = [
        'status' => 200
    ];
    echo json_encode($response);
} catch (Exception $e) {
    
    $response = [
        'status' => 400,
        'message' => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"
    ];
    echo json_encode($response);
    // echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}