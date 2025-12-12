"use client";

import { useState, useRef, useEffect } from "react";
import { Video, VideoOff, Mic, MicOff, X } from "lucide-react";

export function CameraTest({ isOpen, onClose }) {
  const [stream, setStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  // Initialize camera when component opens
  useEffect(() => {
    if (isOpen) {
      initializeMedia();
    } else {
      cleanup();
    }

    return () => cleanup();
  }, [isOpen]);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // ESC key to close
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  const initializeMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setError("Failed to access camera/microphone. Please check permissions.");
    }
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setError(null);
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center">
      <div className="bg-black border border-white/10 w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="border-b border-white/5 p-4 flex items-center justify-between">
          <h2 className="text-lg font-light tracking-wider text-white">
            Camera Test
          </h2>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Preview */}
        <div className="relative bg-black aspect-video">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white/60 px-6">
                <p className="text-sm font-light">{error}</p>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          )}

          {/* Video off overlay */}
          {!isVideoEnabled && stream && (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <div className="text-center text-white/60">
                <VideoOff className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm font-light">Camera is off</p>
              </div>
            </div>
          )}

          {/* Audio indicator */}
          {!isAudioEnabled && stream && (
            <div className="absolute top-4 left-4 bg-black/80 border border-white/10 px-3 py-2">
              <p className="text-xs text-white/60 font-light tracking-wide">
                <MicOff className="w-3 h-3 inline mr-1" />
                Microphone muted
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="border-t border-white/5 p-6">
          <div className="flex justify-center gap-4 mb-4">
            {/* Toggle Video */}
            <button
              onClick={toggleVideo}
              disabled={!stream}
              className={`w-14 h-14 rounded-full border transition-all ${
                isVideoEnabled
                  ? "border-white/10 hover:border-white/20 text-white"
                  : "border-white/30 bg-white/10 text-white hover:border-white/40"
              } disabled:opacity-30 disabled:cursor-not-allowed`}
              title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
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
              disabled={!stream}
              className={`w-14 h-14 rounded-full border transition-all ${
                isAudioEnabled
                  ? "border-white/10 hover:border-white/20 text-white"
                  : "border-white/30 bg-white/10 text-white hover:border-white/40"
              } disabled:opacity-30 disabled:cursor-not-allowed`}
              title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              {isAudioEnabled ? (
                <Mic className="w-5 h-5 mx-auto" />
              ) : (
                <MicOff className="w-5 h-5 mx-auto" />
              )}
            </button>
          </div>

          <p className="text-center text-xs text-white/40 font-light tracking-wide">
            Test your camera and microphone before making a call
          </p>
        </div>
      </div>
    </div>
  );
}
