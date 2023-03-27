<?php
namespace MyApp;

use PDO ;
class User
{
    public $db, $userID,$sessionID;
// seesionID TO store the users who connected and websocket store here
    public function __construct() {
        $db = new \MyApp\DB;
        $this->db = $db->Connect();
        $this->userID = $this->ID();
        $this->sessionID=$this->getSessionID();
    }
    public function ID()
    {
        //return SessionId
        if ($this->isLoggedIn()) { //if loggedin return ID
            return $_SESSION['userID'];
        }
    }
    public function getSessionID(){
        return session_id(); //used to get current sessionID
            
    }
    public function emailExist($email)
    {
        //prepare SQL qury perform from the DB
        $stmt = $this->db->prepare("SELECT * FROM users WHERE `email` = :email");
        $stmt->bindParam(":email", $email, PDO::PARAM_STR);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_OBJ);
        if (!empty($user)) {
            return $user;
        } else {
            return false;
        }
    }

    public function hash($password)
    {
        return password_hash($password, PASSWORD_DEFAULT);
    }
    public function redirect($location)
    {
        header("Location:  " . BASE_URL . $location);
    }

    public function userData($userID = '')
    {
        $userID = ((!empty($userID)) ? $userID : $this->userID);

        //get the user data from the table

        $stmt = $this->db->prepare("SELECT * FROM users WHERE `userID` = :userID");
        $stmt->bindParam(":userID", $userID, PDO::PARAM_STR);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_OBJ); //return the user data 


    }
    public function isLoggedIn()
    {
        return ((isset($_SESSION['userID']) ? true : false));
        //check the user if is LoggedIn
    }
    public function logout()
    {
        $_SESSION = array();
        session_destroy();
        session_regenerate_id();
        $this->redirect('index.php');
    }
    public function getUsers()
    {
        $stmt = $this->db->prepare("SELECT * FROM users where `userID`!=:userID");
        $stmt->bindParam(":userID", $this->userID, PDO::PARAM_INT);
        //didn't show the user who login in this session 
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_OBJ);

        foreach ($users as $user) {
            echo  '
                <li class="select-none transition hover:bg-green-50 p-4 cursor-pointer select-none">
	<a href="'.BASE_URL.$user->username.'">
		<div class="user-box flex items-center flex-wrap">
		<div class="flex-shrink-0 user-img w-14 h-14 rounded-full border overflow-hidden">
		    <img class="w-full h-full" src="'.BASE_URL.$user->profileImage.'">
		</div>
		<div class="user-name ml-2">
		    <div><span class="flex font-medium">'.$user->name.'</span></div>
		    <div></div>
		</div>
		</div>
	</a>
</li>
                ';
        }
    }
    public function getUserByUsername($username )
    {
        

        //get the user data from the table

        $stmt = $this->db->prepare("SELECT * FROM users WHERE `username` = :username");
        $stmt->bindParam(":username", $username, PDO::PARAM_STR);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_OBJ); //return the user data 


    }
    public function updateSession(){
        $stmt=$this->db->prepare("UPDATE  `users` SET `sessionID`=:sessionID WHERE `userID`=:userID");
        $stmt->bindParam(":sessionID",$this->sessionID,PDO :: PARAM_STR);
        $stmt->bindParam(":userID",$this->userID,PDO :: PARAM_INT);
        $stmt->execute();

    }
    public function  getUserBySession($sessionID){
        $stmt = $this->db->prepare("SELECT * FROM users WHERE `sessionID` = :sessionID");
        $stmt->bindParam(":sessionID", $sessionID, PDO::PARAM_STR);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_OBJ); //return the user data 

    }
    public function updateConnection($connectionID,$userID){
        $stmt=$this->db->prepare("UPDATE  `users` SET `connectionID`=:connectionID WHERE `userID`=:userID");
       $stmt->bindParam(":connectionID",$connectionID,PDO :: PARAM_STR);
        $stmt->bindParam(":userID",$userID,PDO :: PARAM_INT);
        $stmt->execute();

    }
}
