import Peer from 'simple-peer';

/**
 * WebRTC Video Call Manager using SimplePeer
 */
class VideoCallManager {
  constructor() {
    this.peer = null;
    this.localStream = null;
    this.remoteStream = null;
    this.onRemoteStream = null;
    this.onCallEnded = null;
  }

  /**
   * Initialize local media stream (camera + microphone)
   * @param {Object} constraints - Media constraints
   * @returns {Promise<MediaStream>}
   */
  async getLocalStream(constraints = { video: true, audio: true }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Failed to access camera/microphone. Please check permissions.');
    }
  }

  /**
   * Create a peer connection as the caller (initiator)
   * @param {Function} onSignal - Callback for signaling data
   * @returns {Peer}
   */
  createCallerPeer(onSignal) {
    if (!this.localStream) {
      throw new Error('Local stream not initialized. Call getLocalStream() first.');
    }

    this.peer = new Peer({
      initiator: true,
      trickle: false,
      stream: this.localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    this.setupPeerListeners(onSignal);
    return this.peer;
  }

  /**
   * Create a peer connection as the receiver
   * @param {Object} callerSignal - Signal data from caller
   * @param {Function} onSignal - Callback for signaling data
   * @returns {Peer}
   */
  createReceiverPeer(callerSignal, onSignal) {
    if (!this.localStream) {
      throw new Error('Local stream not initialized. Call getLocalStream() first.');
    }

    this.peer = new Peer({
      initiator: false,
      trickle: false,
      stream: this.localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    this.setupPeerListeners(onSignal);

    // Signal the caller
    this.peer.signal(callerSignal);

    return this.peer;
  }

  /**
   * Set up peer event listeners
   * @param {Function} onSignal - Callback for signaling data
   */
  setupPeerListeners(onSignal) {
    this.peer.on('signal', (data) => {
      if (onSignal) {
        onSignal(data);
      }
    });

    this.peer.on('stream', (stream) => {
      this.remoteStream = stream;
      if (this.onRemoteStream) {
        this.onRemoteStream(stream);
      }
    });

    this.peer.on('error', (err) => {
      console.error('Peer connection error:', err);
      this.endCall();
    });

    this.peer.on('close', () => {
      console.log('Peer connection closed');
      this.endCall();
    });
  }

  /**
   * Answer an incoming call with the caller's signal
   * @param {Object} signal - Signal data from caller
   */
  answerCall(signal) {
    if (this.peer) {
      this.peer.signal(signal);
    }
  }

  /**
   * Toggle video on/off
   * @returns {boolean} New video state
   */
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  /**
   * Toggle audio on/off
   * @returns {boolean} New audio state
   */
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  /**
   * End the call and clean up resources
   */
  endCall() {
    // Stop local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Destroy peer connection
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    // Clear remote stream
    this.remoteStream = null;

    // Trigger callback
    if (this.onCallEnded) {
      this.onCallEnded();
    }
  }

  /**
   * Check if browser supports WebRTC
   * @returns {boolean}
   */
  static isSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.RTCPeerConnection
    );
  }
}

export default VideoCallManager;
