<?php
      namespace MyApp;
      use PDO ;
      use PDOException;
      class DB{
        function Connect (){
            $servername = "127.0.0.1";
$username = "root";
 try {
   $db = new PDO("mysql:host=$servername;dbname=vchat", $username, ''); 
   // set the PDO error mode to exception
   $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
//$db = new PDO("mysql:host=127.0.0.1 ; dbname=vchat", "root", '');
//$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  // echo "Connected successfully"; 
   return $db ;
 }
catch(PDOException $e)
{
  echo "Connection failed: " . $e->getMessage();
}

          // $db= new PDO(" dbname=vchat ;mysql:host=127.0.0.1 " ,
          //   "root"," ");//PDO object to connect with dataBase
            //$db = new PDO("mysql:host=127.0.0.1 ; dbname=vchat", "root", '');
          //  return $db ;
        }

      }
?>