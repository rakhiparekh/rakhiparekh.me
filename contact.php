<?php

  //*****************************************************
  $your_site_name = "www.rakhiparekh.me";              // please change!
  $your_email = "hello@rakhiparekh.me";   // please change!
  //*****************************************************

  // post vars
  $the_msg = isset($_POST['msg']) ? trim($_POST['msg']) : "";
  $the_mail = isset($_POST['mail']) ? trim($_POST['mail']) : "";
  $the_name = isset($_POST['name']) ? trim($_POST['name']) : "";

  // check post values
  if (strlen($the_msg) < 1 || strlen($the_mail) < 1 || strlen($the_name) < 1) {
    $error['strlen'] = true;
  }

  if (preg_match('/[a-z0-9&\'\.\-_\+]+@[a-z0-9\-]+\.([a-z0-9\-]+\.)*+[a-z]{2,4}/im', $the_mail, $matches)) {
    $the_mail = $matches[0];
  } else {
    $error['email'] = true;
  }

  if (!isset($error)) {

    // no errors! good! you may add here special contact functional.

    // an email example:
    $header  = "MIME-Version: 1.0\r\n";
    $header .= "Content-type: text/html; charset=utf-8\r\n";
    $header .= "From: {$the_name} <{$the_mail}>\r\n";

    //   to       subject               message       header
    $result = mail($your_email, "Message from ".$your_site_name, nl2br($the_msg), $header);
  }
?>
<p>Your Message has been Sent.</br><strong>Thank you.</strong></p>
<p>I will respond to you shortly.</p>
