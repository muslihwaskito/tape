
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

if (empty($_GET)) {
    $response = [
        'status' => 400,
        'message' => ''
    ];
    echo json_encode($response);
    exit;
}

try {
    $html = file_get_contents('message.php');
    $html = str_replace("https://zipcynft.net/privatesale/confirm.php?token=", "https://zipcynft.net/privatesale/confirm.php?token=".$_GET['token'], $html);
    //Server settings
    // $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
    // $mail->SMTPDebug  = 1;
    $mail->isSMTP();                                            //Send using SMTP
    $mail->Host       = 'sng105.hawkhost.com';                     //Set the SMTP server to send through
    $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
    $mail->Username   = '_mainaccount@globalmoney.finance';                     //SMTP username
    $mail->Password   = 'P076Sxt+NJv4.a';                               //SMTP password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
    $mail->Port       = 465;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

    //Recipients
    $mail->setFrom('no-reply@globalmoney.finance','Admin T-Ape');
    $mail->addAddress($_GET['email']);     //Add a recipient
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