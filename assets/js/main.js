//define p2p connection ..the WebRTC connection
"use strict"; //we don't need to define variable

//button for the call video
let callBtn = $("#callBtn");
let callBox = $("#callBox");
let answerBtn = $("#answerBtn");
let declineBtn = $("#declineBtn");
let alertBox = $("#alertBox");

let pc; //for WebRTC connection P2P Connection
let sendTo = callBtn.data("user"); //the userID who receive the call(user value from the data )
let localStream; //store the camera feed from the client

//video elements
const localVideo = document.querySelector("#localVideo"); //the user who make the call
const remoteVideo = document.querySelector("#remoteVideo"); //the user who receive  the call
//mediaInfo
const mediaConst = {
  video: true,
  audio:true

};
//info about stun servers
//a STUN (Session Traversal Utilities for NAT) server is an important component of WebRTC 
//that helps peers to overcome the challenges posed by NAT devices and establish a successful peer-to-peer connection.
//NAT is a technique used by routers to allow multiple devices on a local network to share a single public IP address.
// NAT devices can cause problems for WebRTC because they can interfere with the establishment of direct peer-to-peer connections. 
//STUN servers help to solve this problem by providing a way for the peers to discover their public IP addresses and port numbers.
const config = {
	iceServers:[
		{urls:'stun:stun1.l.google.com:19302'},
	]
}
//what to receive from other clients
const options = {
  offerToReceiveVideo: 1, //we want receive video from other clients
  offerToReceiveAudio: 1

};

//create webRtc connection object
function getConn() {
  if (!pc) {
    pc = new RTCPeerConnection(config); //the object from the browser use to get cam feed and mic feed and stream
  }
}

//ask for media input
async function getCam() {
  let mediaStream;
  try {
    if (!pc) {
      await getConn();
    }
    mediaStream = await navigator.mediaDevices.getUserMedia(mediaConst);
    // method that prompts the user for permission to access their media devices (such as a camera or micr)
    localVideo.srcObject = mediaStream;
    //  srcObject property is used to specify the media source of an HTML video or audio element
    localStream = mediaStream;
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    // For each MediaStreamTrack, the addTrack() method of a RTCPeerConnection object called pc is called,
    //  with the track and localStream objects as arguments.
    //  This adds the MediaStreamTrack to the RTCPeerConnection object
  } catch (error) {
    console.log(error);
  }
}
async function createOffer(sendTo) {
  //who send the offer share the information about media
  await sendIceCandidate(sendTo); //info about IP and the port
  await pc.createOffer(options); //sdp about media adress , ice candidate
  await pc.setLocalDescription(pc.localDescription); //generate the offer info about media  when set this
  //information the function function sendIceCandidate(sendTo) called
  send("client-offer", pc.localDescription, sendTo);
}
//ICE Candidate and LocalDescription are two important concepts in WebRTC technology.

// An ICE candidate is a combination of IP address and port number that a WebRTC endpoint (peer)
//  uses to identify itself on the internet. The ICE candidate contains information about the transport
//  protocol (TCP or UDP) and the priority of the endpoint. ICE candidates are exchanged between peers
//   during the WebRTC signaling process, which helps the peers to discover the best possible path for media
//   communication.

// The sendIceCandidate function in the createOffer function generates ICE candidates and sends them to
// the specified client sendTo. This is necessary for establishing a successful WebRTC connection between peers.

// On the other hand, a LocalDescription is a set of session descriptions that are generated
// by a WebRTC endpoint (peer) and are used to describe the local media stream.

// The LocalDescription contains information about the type of media (audio or video), its format (codec),
//  and other media transport information. The LocalDescription is exchanged between peers during
//  the WebRTC signaling process to negotiate and establish the connection.

// In the createOffer function, the pc.createOffer method is used to generate a LocalDescription
//  that describes the media stream. The pc.setLocalDescription method is then used to set the LocalDescription

//  as the local description of the PeerConnection object pc. The pc.localDescription is sent to the specified
//  client sendTo using the send function with the 'client-offer' tag. This enables the remote peer to know the
//  media stream type and format and to negotiate the connection accordingly.

async function createAnswer(sendTo, data) {
  if (!pc) {
    await getConn();
  }
  if (!localStream) {
    await getCam();
  }
  await sendIceCandidate(sendTo);
  await pc.setRemoteDescription(data); //when accept the call send the request and set the information

  await pc.createAnswer();
  await pc.setLocalDescription(pc.localDescription);
  send("client-answer", pc.localDescription, sendTo);
}

//ICE (Interactive Connectivity Establishment) is a technique used for establishing real-time communication
// sessions between two peers over the internet.
// In WebRTC, ICE is used to establish a peer-to-peer connection for media sharing.
function sendIceCandidate(sendTo) {
  pc.onicecandidate = (e) => {
    if (e.candidate !== null) {
      // send ice candidate to other clients
      send("client-candidate", e.candidate, sendTo);
    }
  };
  pc.ontrack = (e) => {
    $("#video").removeClass("hidden");
    $("#profile").addClass("hidden");
    remoteVideo.srcObject = e.streams[0];
  };
}
function hangup() {
  send("client-hangup", null, sendTo);
  pc.close();
  pc = null;
}

$("#callBtn").on("click", () => {
  getCam();
  send("is-client-ready", null, sendTo); //check the other user not on call
});
$("#hangupBtn").on("click", () => {
  hangup();
  location.reload(true);
});
conn.onopen = (e) => {
  console.log("connected to websocket");
};

//recieve the data
conn.onmessage = async (e) => {
  let message = JSON.parse(e.data);
  let by = message.by;//the user who send the call
  let data = message.data;
  let type = message.type;
  let profileImage = message.profileImage;
  let username = message.username;
  $("#username").text(username);
  $("#profileImage").attr("src", profileImage);
  switch(type){
    case 'client-candidate':
        if(pc.localDescription){
            await pc.addIceCandidate(new RTCIceCandidate(data));
            //set a remote description we get from the other client
        //set the IceCondidate to establish p2p connection
        }
    break;
    case 'is-client-ready':
         
        if(!pc){
            await getConn();
        }

        if(pc.iceConnectionState === "connected"){
            send('client-already-oncall', null, by);
        }else{
         
            //display popup
            displayCall();
            if(window.location.href.indexOf(username) > -1){//found the username in the url
                answerBtn.on('click', () =>{
                    callBox.addClass('hidden');
                    $('.wrapper').removeClass('glass');
                    send('client-is-ready', null, sendTo);
                });
            }else{
                answerBtn.on('click', () =>{
                    callBox.addClass('hidden');
                    redirectToCall(username, by);
                });
            }

            declineBtn.on('click', () => {
                send('client-rejected', null, sendTo);
                location.reload(true);
            });
        }
    break;

    case 'client-answer':
        if(pc.localDescription){
            await pc.setRemoteDescription(data);
            $('#callTimer').timer({format: '%m:%s'});
        }
    break;

    case 'client-offer':
        createAnswer(sendTo, data);
        $('#callTimer').timer({format: '%m:%s'});

    break;

    case 'client-is-ready':
        createOffer(sendTo);// generate SDP (Session Description Protocol)
    break;

    case 'client-already-oncall':
        //display popup right here
        displayAlert(username, profileImage, 'is on another call');
        setTimeout('window.location.reload(true)', 2000);
    break;

    case 'client-rejected':
        displayAlert(username, profileImage, 'is busy');
        setTimeout('window.location.reload(true)', 2000);
    break;

    case 'client-hangup':
        //display popup right here
        displayAlert(username, profileImage, 'Disconnected the call');
        setTimeout('window.location.reload(true)', 2000);
    break;
}

  
};
//send the data through web socket in real Time  to other clients
function send(type, data, sendTo) {
  //type to check if the user available
  //data:te webRTC data
  //will be sendTo the userId
  conn.send(
    JSON.stringify({
      sendTo: sendTo,
      type: type,
      data: data,
    })
  );
}
function displayCall() {
  callBox.removeClass("hidden");
  $(".wrapper").addClass("glass");
}
function displayAlert(username, profileImage, message) {
  alertBox.find("#alertName").text(username);
  alertBox.find("#alertImage").attr("src", profileImage);
  alertBox.find("#alertMessage").text(message);
  alertBox.removeClass("hidden");
  $(".wrapper").addClass("glass");
  $("#video").addClass("glass");
  $("#profile").removeClass("hidden");
}
function redirectToCall(username,sendTo){
    if(window.location.href.indexOf(username) == -1){
        sessionStorage.setItem('redirect',true);
        sessionStorage.setItem('sendTo',sendTo);
        window.location.href='/vchat/'+username

    }
}
if(sessionStorage.getItem('redirect')){
    sendTo =sessionStorage.getItem('sendTo')
    let waitForWs = setInterval(()=>{// check fi websocket connect to the server
        if(conn.readyState===1){
            send('client-is-ready',null,sendTo)
            clearInterval(waitForWs)
        }

    },500)
    sessionStorage.removeItem('redirect')
    sessionStorage.removeItem('sendTo')

}