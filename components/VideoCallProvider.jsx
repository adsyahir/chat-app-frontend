"use client";

import { useEffect } from "react";
import { useVideoCallStore } from "@/lib/stores/videoCallStore";
import { socketAPI } from "@/lib/api";
import { VideoCall } from "./VideoCall";
import { IncomingCall } from "./IncomingCall";
import { CameraTest } from "./CameraTest";

export function VideoCallProvider({ children }) {
  const {
    handleIncomingCall,
    handleCallAccepted,
    handleCallRejected,
    handleCallEnded,
  } = useVideoCallStore();

  useEffect(() => {
    // Set up Socket.io listeners for video call events
    socketAPI.on("call:incoming", (data) => {
      console.log("Incoming call from:", data.callerName);
      handleIncomingCall(data);
    });

    socketAPI.on("call:accepted", (data) => {
      console.log("Call accepted");
      handleCallAccepted(data);
    });

    socketAPI.on("call:rejected", () => {
      console.log("Call rejected");
      handleCallRejected();
    });

    socketAPI.on("call:ended", () => {
      console.log("Call ended by remote user");
      handleCallEnded();
    });

    // Cleanup listeners on unmount
    return () => {
      socketAPI.off("call:incoming");
      socketAPI.off("call:accepted");
      socketAPI.off("call:rejected");
      socketAPI.off("call:ended");
    };
  }, [handleIncomingCall, handleCallAccepted, handleCallRejected, handleCallEnded]);

  return (
    <>
      {children}
      <IncomingCall />
      <VideoCall />
      <CameraTest />
    </>
  );
}
