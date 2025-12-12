"use client";

import { useEffect, useRef } from "react";
import { useVideoCallStore, CALL_STATES } from "@/lib/stores/videoCallStore";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Phone } from "lucide-react";

export function VideoCall() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const {
    callState,
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    currentCall,
    toggleVideo,
    toggleAudio,
    endCall,
  } = useVideoCallStore();

  const handleEndCall = () => {
    console.log('🔴 End call button clicked');
    endCall();
  };

  // Add ESC key listener to end call
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        console.log('⌨️ ESC pressed - ending call');
        handleEndCall();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(err => {
        console.error("Error playing local video:", err);
      });
    }
  }, [localStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(err => {
        console.error("Error playing remote video:", err);
      });
    }
  }, [remoteStream]);

  // Don't render if no active call or if ringing (show IncomingCall modal instead)
  if (callState === CALL_STATES.IDLE || callState === CALL_STATES.RINGING) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black border-b border-white/5 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-light tracking-wider">
              {currentCall?.username || 'Unknown User'}
            </h2>
            <p className="text-xs text-white/50 font-light mt-1 tracking-wide">
              {callState === CALL_STATES.CALLING && 'Calling...'}
              {callState === CALL_STATES.RINGING && 'Incoming call...'}
              {callState === CALL_STATES.CONNECTED && 'Connected'}
            </p>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-black">
        {/* Remote Video (full screen) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Local Video (picture-in-picture) */}
        <div className="absolute top-4 right-4 w-40 h-32 bg-black overflow-hidden border border-white/10">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
        </div>

        {/* Call state overlay (for calling/ringing) */}
        {(callState === CALL_STATES.CALLING || callState === CALL_STATES.RINGING) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90">
            <div className="text-center text-white">
              <div className="w-20 h-20 mx-auto mb-8 rounded-full border border-white/10 flex items-center justify-center">
                <Phone className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-light tracking-wider mb-3">
                {currentCall?.username || 'Unknown User'}
              </h3>
              <p className="text-xs font-light tracking-widest uppercase text-white/50">
                {callState === CALL_STATES.CALLING && 'Calling'}
                {callState === CALL_STATES.RINGING && 'Ringing'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black border-t border-white/5 p-6">
        <div className="flex justify-center gap-4">
          {/* Toggle Video */}
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full border transition-all ${
              isVideoEnabled
                ? 'border-white/10 hover:border-white/20 text-white'
                : 'border-white/30 bg-white/10 text-white hover:border-white/40'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? (
              <Video className="w-5 h-5 mx-auto" />
            ) : (
              <VideoOff className="w-5 h-5 mx-auto" />
            )}
          </button>

          {/* Toggle Audio */}
          <button
            onClick={toggleAudio}
            className={`w-14 h-14 rounded-full border transition-all ${
              isAudioEnabled
                ? 'border-white/10 hover:border-white/20 text-white'
                : 'border-white/30 bg-white/10 text-white hover:border-white/40'
            }`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? (
              <Mic className="w-5 h-5 mx-auto" />
            ) : (
              <MicOff className="w-5 h-5 mx-auto" />
            )}
          </button>

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full border border-white/30 bg-white/10 text-white hover:border-white/40 hover:bg-white/20 transition-all"
            title="End call (ESC)"
          >
            <PhoneOff className="w-5 h-5 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}
