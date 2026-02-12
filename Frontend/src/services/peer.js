// Frontend/src/services/peer.js

class PeerService {
  constructor() {
    // We only create the RTCPeerConnection when it's needed
    this.peer = null;
    
    // Public STUN servers from Google.
    // These are needed to find the best network path between peers.
    this.servers = {
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
          ],
        },
      ],
    };
  }

  /**
   * Creates a new RTCPeerConnection
   */
  createPeerConnection() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection(this.servers);
    }
    return this.peer;
  }

  /**
   * Gets the user's camera and microphone stream.
   */
  async getLocalStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      return stream;
    } catch (error) {
      console.error("Error getting user media:", error);
      throw error;
    }
  }

  /**
   * Gets the user's screen sharing stream.
   */
  async getDisplayStream() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true, // You can also request audio here if needed
      });
      return stream;
    } catch (error) {
      console.error("Error getting display media:", error);
      throw error;
    }
  }

  /**
   * Creates an offer (for the caller)
   */
  async createOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      return offer;
    }
  }

  /**
   * Creates an answer (for the receiver)
   */
  async createAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      return answer;
    }
  }

  /**
   * Sets the remote answer (for the caller)
   */
  async setRemoteDescription(answer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  /**
   * Adds an ICE candidate
   */
  async addIceCandidate(candidate) {
    try {
      if (this.peer && candidate) {
        await this.peer.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  }

  /**
   * Replaces the currently sent track (e.g., camera with screen share)
   */
  replaceTrack(stream, trackType) {
    if (this.peer) {
      const sender = this.peer.getSenders().find((s) => {
        return s.track.kind === trackType;
      });

      if (sender) {
        const newTrack = trackType === 'video' 
          ? stream.getVideoTracks()[0] 
          : stream.getAudioTracks()[0];
        
        sender.replaceTrack(newTrack);
        return newTrack; // Return the new track so we can listen for 'onended'
      }
    }
  }

  /**
   * Adds all tracks from a stream to the peer connection
   */
  addTracksToConnection(stream) {
    if (this.peer && stream) {
      stream.getTracks().forEach((track) => {
        this.peer.addTrack(track, stream);
      });
    }
  }
  
  /**
   * Closes the connection and stops all tracks.
   */
  closeConnection() {
    if (this.peer) {
      this.peer.close();
      this.peer = null;
    }
  }
}

// Export a single instance of the service
export const peerService = new PeerService();