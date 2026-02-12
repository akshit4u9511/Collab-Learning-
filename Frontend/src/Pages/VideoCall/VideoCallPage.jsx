// Frontend/src/Pages/VideoCall/VideoCallPage.jsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { peerService } from "../../services/peer";
import { socket } from "../../socket";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotesPanel from './components/NotesPanel';
import RecordingControls from './components/RecordingControls';

// Assuming you have a user context or similar to get the user's email
// import { useUser } from "../../context/UserContext";

const VideoCallPage = () => {
  // const { user } = useUser(); // Get logged-in user
  const { roomId } = useParams(); // Get room ID from URL (e.g., /call/:roomId)
  const navigate = useNavigate();

  // -- Mock user for testing --
  // Replace this with your actual user data from your context
  const [user, setUser] = useState({ email: `user-${Math.random().toString(36).substring(7)}@example.com` });
  // -------------------------

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [callStatus, setCallStatus] = useState("waiting"); // 'waiting', 'calling', 'connected', 'ended'

  // Refs for video elements
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Refs for streams
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  // UI state
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // --- 1. Core Functions (Call Handling) ---

  const setupLocalMedia = async () => {
    try {
      const stream = await peerService.getLocalStream();
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Could not get local media:", error);
    }
  };

  const createPeerConnection = useCallback(() => {
    const peer = peerService.createPeerConnection();

    // Setup event handlers for the peer connection
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("video:ice-candidate", {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
      }
    };

    return peer;
  }, [remoteSocketId]);

  const handleCallUser = useCallback(async () => {
    setCallStatus("calling");
    const peer = createPeerConnection();
    peerService.addTracksToConnection(localStreamRef.current);

    const offer = await peerService.createOffer();
    socket.emit("video:offer", { to: remoteSocketId, offer });
  }, [createPeerConnection, remoteSocketId]);

  // --- 2. Socket Event Handlers ---

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`User ${email} joined the room.`);
    setRemoteSocketId(id);
    setCallStatus("calling"); // Another user is here, let's start the call
    handleCallUser();
  }, [handleCallUser]);

  const handleIncomingOffer = useCallback(async ({ from, offer }) => {
    console.log(`Incoming offer from ${from}`);
    setRemoteSocketId(from);
    setCallStatus("connected");

    const peer = createPeerConnection();
    peerService.addTracksToConnection(localStreamRef.current);

    const answer = await peerService.createAnswer(offer);
    socket.emit("video:answer", { to: from, answer });
  }, [createPeerConnection]);

  const handleOfferAccepted = useCallback(async ({ from, answer }) => {
    console.log(`Offer accepted by ${from}`);
    setCallStatus("connected");
    await peerService.setRemoteDescription(answer);
  }, []);

  const handleIceCandidate = useCallback(async ({ from, candidate }) => {
    await peerService.addIceCandidate(candidate);
  }, []);

  const handlePeerDisconnected = useCallback(() => {
    setCallStatus("ended");
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setRemoteSocketId(null);
    peerService.closeConnection();
  }, []);


  // --- 3. useEffect for Setup ---

  useEffect(() => {
    // 1. Get local camera/mic first
    setupLocalMedia().then(() => {
      // 2. Join the room via socket
      socket.emit("video:join-room", { room: roomId, email: user.email });
    });

    // 3. Set up all socket listeners
    socket.on("video:user-joined", handleUserJoined);
    socket.on("video:incoming-offer", handleIncomingOffer);
    socket.on("video:offer-accepted", handleOfferAccepted);
    socket.on("video:ice-candidate", handleIceCandidate);
    socket.on("video:peer-disconnected", handlePeerDisconnected);

    // 4. Cleanup function
    return () => {
      socket.off("video:user-joined", handleUserJoined);
      socket.off("video:incoming-offer", handleIncomingOffer);
      socket.off("video:offer-accepted", handleOfferAccepted);
      socket.off("video:ice-candidate", handleIceCandidate);
      socket.off("video:peer-disconnected", handlePeerDisconnected);

      // Stop media tracks
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      peerService.closeConnection();
    };
  }, [user.email, roomId, handleUserJoined, handleIncomingOffer, handleOfferAccepted, handleIceCandidate, handlePeerDisconnected]);


  // --- 4. UI Control Functions (Your features) ---

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOff(!videoTrack.enabled);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // --- Stop screen sharing ---
      const stream = await peerService.getLocalStream();
      const newVideoTrack = stream.getVideoTracks()[0];

      peerService.replaceTrack(stream, "video");

      // Update local video feed
      localVideoRef.current.srcObject = stream;
      localStreamRef.current = stream; // Update ref

      setIsScreenSharing(false);
    } else {
      // --- Start screen sharing ---
      try {
        const stream = await peerService.getDisplayStream();
        const newVideoTrack = stream.getVideoTracks()[0];

        // Listen for when the user clicks the "Stop sharing" button in the browser
        newVideoTrack.onended = () => {
          toggleScreenShare(); // Revert back to camera
        };

        peerService.replaceTrack(stream, "video");

        // Update local video feed
        localVideoRef.current.srcObject = stream;
        localStreamRef.current = stream; // Update ref

        setIsScreenSharing(true);
      } catch (error) {
        console.error("Could not get display media:", error);
      }
    }
  };

  const handleHangUp = () => {
    socket.emit("video:hang-up", { to: remoteSocketId });
    handlePeerDisconnected(); // Clean up our own state
    navigate(-1); // Navigate back to the previous page
  };

  // --- 5. Render ---
  // This is a simple UI; you can style it as you like.

  return (
    <div style={{ padding: "20px", backgroundColor: "#282c34", color: "white", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2>Video Call - Room: {roomId}</h2>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
        {/* Local Video */}
        <div style={{ border: "2px solid #61dafb", borderRadius: "8px", overflow: "hidden" }}>
          <h3 style={{ textAlign: "center", margin: "5px 0" }}>You</h3>
          <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "100%", maxWidth: "400px", display: "block" }} />
        </div>

        {/* Remote Video */}
        <div style={{ border: "2px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
          <h3 style={{ textAlign: "center", margin: "5px 0" }}>
            {callStatus === 'waiting' ? "Waiting for peer..." : (remoteSocketId ? "Peer" : "Waiting...")}
          </h3>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", maxWidth: "400px", display: "block", backgroundColor: "#333", minHeight: "300px" }} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", backgroundColor: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "8px" }}>
        <button onClick={toggleMute} style={{ padding: "10px 15px", borderRadius: "5px", border: "none", cursor: "pointer" }}>
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <button onClick={toggleCamera} style={{ padding: "10px 15px", borderRadius: "5px", border: "none", cursor: "pointer" }}>
          {isCameraOff ? "Show Camera" : "Hide Camera"}
        </button>
        <button onClick={toggleScreenShare} style={{ padding: "10px 15px", borderRadius: "5px", border: "none", cursor: "pointer" }}>
          {isScreenSharing ? "Stop Sharing" : "Share Screen"}
        </button>
        <button
          onClick={() => setShowNotes(!showNotes)}
          style={{
            padding: "10px 15px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
            backgroundColor: showNotes ? "#3bb4a1" : "#555",
            color: "white"
          }}
        >
          📝 {showNotes ? "Hide Notes" : "Show Notes"}
        </button>
        <RecordingControls roomId={roomId} />
        <button onClick={handleHangUp} style={{ padding: "10px 15px", borderRadius: "5px", border: "none", cursor: "pointer", backgroundColor: "red", color: "white" }}>
          Hang Up
        </button>
      </div>

      <div style={{ marginTop: "20px", backgroundColor: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "8px" }}>
        <p><strong>Status:</strong> {callStatus}</p>
        <p><strong>Your Email:</strong> {user.email}</p>
        <p><strong>Remote Socket ID:</strong> {remoteSocketId || "None"}</p>
      </div>

      <NotesPanel roomId={roomId} isOpen={showNotes} onClose={() => setShowNotes(false)} />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default VideoCallPage;