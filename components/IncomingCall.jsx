"use client";

import { useVideoCallStore, CALL_STATES } from "@/lib/stores/videoCallStore";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";

export function IncomingCall() {
  const { callState, incomingCall, acceptCall, rejectCall } = useVideoCallStore();

  // Only show when there's an incoming call
  if (callState !== CALL_STATES.RINGING || !incomingCall) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center">
      <div className="bg-black border border-white/10 p-10 max-w-sm w-full mx-4">
        {/* Caller Info */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full border border-white/10 flex items-center justify-center">
            <Phone className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-light tracking-wider text-white mb-2">
            {incomingCall.callerName || 'Unknown User'}
          </h2>
          <p className="text-xs text-white/50 font-light tracking-widest uppercase">Incoming Call</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Reject Call */}
          <button
            onClick={rejectCall}
            className="flex-1 h-12 border border-white/10 hover:border-white/20 text-white transition-all font-light tracking-wide text-sm"
          >
            <PhoneOff className="w-4 h-4 inline mr-2" />
            Decline
          </button>

          {/* Accept Call */}
          <button
            onClick={acceptCall}
            className="flex-1 h-12 border border-white/30 bg-white/10 text-white hover:border-white/40 hover:bg-white/20 transition-all font-light tracking-wide text-sm"
          >
            <Phone className="w-4 h-4 inline mr-2" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
