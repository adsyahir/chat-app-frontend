"use client";

import { create } from 'zustand';
import VideoCallManager from '../webrtc/videoCall';
import { socketAPI } from '../api';

const CALL_STATES = {
  IDLE: 'idle',
  CALLING: 'calling',
  RINGING: 'ringing',
  CONNECTED: 'connected',
  ENDED: 'ended',
};

export const useVideoCallStore = create((set, get) => ({
  // State
  callState: CALL_STATES.IDLE,
  localStream: null,
  remoteStream: null,
  isVideoEnabled: true,
  isAudioEnabled: true,
  callManager: null,
  currentCall: null, // { userId, username, isIncoming }
  incomingCall: null, // { from, signal, callerName }

  // Actions
  initializeCallManager: () => {
    if (!get().callManager) {
      const manager = new VideoCallManager();

      manager.onRemoteStream = (stream) => {
        set({ remoteStream: stream });
      };

      manager.onCallEnded = () => {
        get().endCall();
      };

      set({ callManager: manager });
    }
  },

  // Start an outgoing call
  startCall: async (userId, username, currentUserId, currentUsername) => {
    try {
      const { callManager, initializeCallManager } = get();

      // Initialize manager if not already done
      if (!callManager) {
        initializeCallManager();
      }

      const manager = get().callManager;

      // Get local media stream
      const stream = await manager.getLocalStream();
      set({
        localStream: stream,
        callState: CALL_STATES.CALLING,
        currentCall: { userId, username, isIncoming: false },
      });

      // Create peer connection and get signal
      manager.createCallerPeer((signal) => {
        // Send call initiation to recipient via Socket.io
        socketAPI.emit('call:initiate', {
          to: userId,
          from: currentUserId,
          signal,
          callerName: currentUsername,
        });
      });

    } catch (error) {
      console.error('Error starting call:', error);
      set({ callState: CALL_STATES.ENDED });
      throw error;
    }
  },

  // Accept an incoming call
  acceptCall: async () => {
    try {
      const { incomingCall, callManager, initializeCallManager } = get();

      if (!incomingCall) {
        throw new Error('No incoming call to accept');
      }

      // Initialize manager if not already done
      if (!callManager) {
        initializeCallManager();
      }

      const manager = get().callManager;

      // Get local media stream
      const stream = await manager.getLocalStream();
      set({
        localStream: stream,
        callState: CALL_STATES.CONNECTED,
        currentCall: {
          userId: incomingCall.from,
          username: incomingCall.callerName,
          isIncoming: true,
        },
      });

      // Create receiver peer and answer
      manager.createReceiverPeer(incomingCall.signal, (signal) => {
        // Send answer back to caller
        socketAPI.emit('call:answer', {
          to: incomingCall.from,
          signal,
        });
      });

      // Clear incoming call
      set({ incomingCall: null });

    } catch (error) {
      console.error('Error accepting call:', error);
      get().rejectCall();
      throw error;
    }
  },

  // Reject an incoming call
  rejectCall: () => {
    const { incomingCall } = get();

    if (incomingCall) {
      socketAPI.emit('call:reject', {
        to: incomingCall.from,
      });
    }

    set({
      incomingCall: null,
      callState: CALL_STATES.IDLE,
    });
  },

  // End the current call
  endCall: () => {
    console.log('🔴 End call triggered');
    const { callManager, currentCall, localStream, remoteStream } = get();

    try {
      // Notify the other user
      if (currentCall) {
        console.log('📤 Sending call:end event to:', currentCall.userId);
        socketAPI.emit('call:end', {
          to: currentCall.userId,
        });
      }

      // Stop all tracks in local stream
      if (localStream) {
        console.log('🛑 Stopping local stream tracks');
        localStream.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped track:', track.kind);
        });
      }

      // Stop all tracks in remote stream
      if (remoteStream) {
        console.log('🛑 Stopping remote stream tracks');
        remoteStream.getTracks().forEach(track => {
          track.stop();
        });
      }

      // Clean up call manager
      if (callManager) {
        console.log('🧹 Cleaning up call manager');
        callManager.endCall();
      }

      // Reset state
      console.log('♻️ Resetting call state');
      set({
        callState: CALL_STATES.IDLE,
        localStream: null,
        remoteStream: null,
        currentCall: null,
        incomingCall: null,
        isVideoEnabled: true,
        isAudioEnabled: true,
      });

      console.log('✅ Call ended successfully');
    } catch (error) {
      console.error('❌ Error ending call:', error);
      // Force reset state even if there's an error
      set({
        callState: CALL_STATES.IDLE,
        localStream: null,
        remoteStream: null,
        currentCall: null,
        incomingCall: null,
        isVideoEnabled: true,
        isAudioEnabled: true,
      });
    }
  },

  // Toggle video on/off
  toggleVideo: () => {
    const { callManager } = get();
    if (callManager) {
      const enabled = callManager.toggleVideo();
      set({ isVideoEnabled: enabled });
      return enabled;
    }
    return false;
  },

  // Toggle audio on/off
  toggleAudio: () => {
    const { callManager } = get();
    if (callManager) {
      const enabled = callManager.toggleAudio();
      set({ isAudioEnabled: enabled });
      return enabled;
    }
    return false;
  },

  // Handle incoming call
  handleIncomingCall: (data) => {
    set({
      incomingCall: data,
      callState: CALL_STATES.RINGING,
    });
  },

  // Handle call accepted
  handleCallAccepted: (data) => {
    const { callManager } = get();
    if (callManager && callManager.peer) {
      callManager.answerCall(data.signal);
      set({ callState: CALL_STATES.CONNECTED });
    }
  },

  // Handle call rejected
  handleCallRejected: () => {
    get().endCall();
  },

  // Handle call ended
  handleCallEnded: () => {
    get().endCall();
  },

  // Check WebRTC support
  isWebRTCSupported: () => {
    return VideoCallManager.isSupported();
  },
}));

export { CALL_STATES };
