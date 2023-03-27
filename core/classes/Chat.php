<?php
namespace MyApp;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
// <!-- building a real-time chat application using Ratchet, which is a popular
//  PHP library for building WebSocket applications. -->
class Chat implements MessageComponentInterface {
    protected $clients;
    public $userObj,$data ;//store the user data 

    public function __construct() {
        //store the user connection on SplIbjectStorage
         $this->clients = new \SplObjectStorage;
        $this->userObj=new \MyApp\User;
    }

    public function onOpen(ConnectionInterface $conn) {

        // Store the new connection to send messages to later
        $queryString=$conn->httpRequest->getUri()->getQuery();
       // $queryString = $conn->WebSocket->request->getQuery();
        parse_str($queryString,$query);
        

     if (isset($query['token']) && $data = $this->userObj->getUserBySession($query['token'])) {
       
         //   if ( $data = $this->userObj->getUserBySession($query['token'])) {
               
            $this->data=$data;
            $conn->data=$data;
         //   var_dump($this->userObj->userData('1'));

            $this->clients->attach($conn);
             $this->userObj->updateConnection($conn->resourceId,$data->userID);
             
    
            echo "New connection! ({$data->username})\n";
        } else {
            echo "eror";
        }
        
        
    }
   // This code is an event handler for the Ratchet WebSocket server's onMessage event. The onMessage event is
   //  fired whenever a WebSocket client sends a message to the server.

    public function onMessage(ConnectionInterface $from, $msg) {
        $numRecv = count($this->clients) - 1;
        echo sprintf('Connection %d sending message "%s" to %d other connection%s' . "\n"
            , $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's');

            $data=json_decode($msg,true); //because the msg $msg we will send is Json msg "{"sendTo":2,"type":"is-client-ready}to php obj
            $sendTo =$this->userObj->userData($data['sendTo']);//the user who receive the call
            $send['sendTo']= $sendTo->userID;
            $send['by']=$from->data->userID;//the user who send the call and the data from variable i creat bellow
            $send['profileImage']=$from->data-> profileImage;
            $send['username']=$from->data-> username;
            $send['type']=$data['type'];
            $send['data']=$data['data'];


        foreach ($this->clients as $client) {
            if ($from !== $client) {
                // The sender is not the receiver, send to each client connected
                //resourceId is a connectionID : verify the user who receive is the we want to send the msg
                if($client->resourceId==$sendTo->connectionID || $from ==$client ){
                    $client->send(json_encode($send));


                }
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        // The connection is closed, remove it, as we can no longer send it messages
        $this->clients->detach($conn);

        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";

        $conn->close();
    }
}