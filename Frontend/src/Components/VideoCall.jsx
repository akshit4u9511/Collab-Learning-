import { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const SIGNAL_SERVER_URL = "http://localhost:5001";

function VideoCall({ roomId }) {
  const userVideo = useRef(null);
  const partnerVideo = useRef(null);
  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    socketRef.current = io(SIGNAL_SERVER_URL);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-room", roomId);
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
        setStreaming(true);

        socketRef.current.on("user-joined", () => {
          const peer = new Peer({ initiator: true, trickle: false, stream });
          peer.on("signal", (data) => {
            socketRef.current.emit("signal", { roomId, data });
          });
          peer.on("stream", (remoteStream) => {
            if (partnerVideo.current) {
              partnerVideo.current.srcObject = remoteStream;
            }
          });
          socketRef.current.on("signal", ({ data }) => {
            peer.signal(data);
          });
          peerRef.current = peer;
        });

        socketRef.current.on("signal", ({ data }) => {
          if (!peerRef.current) {
            const peer = new Peer({ initiator: false, trickle: false, stream });
            peer.on("signal", (signalData) => {
              socketRef.current.emit("signal", { roomId, data: signalData });
            });
            peer.on("stream", (remoteStream) => {
              if (partnerVideo.current) {
                partnerVideo.current.srcObject = remoteStream;
              }
            });
            peer.signal(data);
            peerRef.current = peer;
          } else {
            peerRef.current.signal(data);
          }
        });
      })
      .catch((err) => {
        setError("Camera/mic not accessible: " + err.message);
        setStreaming(false);
      });

    return () => {
      socketRef.current.disconnect();
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [roomId]);

  return (
    <div>
      <video ref={userVideo} autoPlay playsInline muted style={{ width: "300px" }} />
      <video ref={partnerVideo} autoPlay playsInline style={{ width: "300px" }} />
      <div>
        {error
          ? error
          : streaming
          ? "Streaming started"
          : "Starting camera..."}
      </div>
    </div>
  );
}

VideoCall.propTypes = {
  roomId: PropTypes.string.isRequired,
};

export default VideoCall;
