<?php
       session_start();//we can store variable and information 


       require "classes/DB.php";
       require "classes/User.php";
       $userObj = new \MyApp\User;
       define("BASE_URL","https://localhost/vchat/");




?>