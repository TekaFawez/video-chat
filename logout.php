<?php

include 'core/int.php';
if(!$userObj->isLoggedIn()){
    $userObj->redirect('index.php');

}
$userObj->logout()



?>