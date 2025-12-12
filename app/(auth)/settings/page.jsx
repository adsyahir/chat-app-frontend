"use client";

import { useState } from "react";
import { useEncryptionStore } from "@/lib/stores/encryptionStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Key, CheckCircle2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { isEncryptionEnabled, enableEncryption, publicKey } = useEncryptionStore();
  const [isEnabling, setIsEnabling] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleEnableEncryption = async () => {
    setIsEnabling(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await enableEncryption();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to enable encryption");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsEnabling(false);
    }
  };

  return (
    <SidebarInset className="flex flex-col h-screen">
      <header className="bg-background sticky top-0 z-10 flex items-center gap-2 border-b p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account and privacy settings
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 bg-white">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Account Section */}
          <div className="border border-black/10 bg-white p-8">
            <h2 className="text-lg font-light tracking-wider text-black mb-6">
              Account Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-black/5">
                <span className="text-sm text-black/50 font-light tracking-wide">Username</span>
                <span className="text-sm text-black font-light">{user?.username || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-black/50 font-light tracking-wide">Email</span>
                <span className="text-sm text-black font-light">{user?.email || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Encryption Section */}
          <div className="border border-black/10 bg-white p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-black/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-lg font-light tracking-wider text-black">
                  End-to-End Encryption
                </h2>
                <p className="text-xs text-black/40 font-light mt-0.5">
                  Secure your conversations
                </p>
              </div>
            </div>

            <p className="text-sm text-black/60 font-light mb-8 leading-relaxed">
              Enable end-to-end encryption to secure your messages. When enabled, only you
              and the recipient can read your messages. Both parties must have encryption
              enabled for messages to be encrypted.
            </p>

            {/* Status */}
            <div className="mb-6 p-6 border border-black/5 bg-black/[0.01]">
              <div className="flex items-center gap-3 mb-4">
                {isEncryptionEnabled ? (
                  <>
                    <div className="w-8 h-8 border border-black flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <span className="text-sm font-light text-black tracking-wide block">
                        Encryption Enabled
                      </span>
                      <span className="text-xs text-black/40 font-light">
                        Your messages are protected
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 border border-black/20 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-black/40" />
                    </div>
                    <div>
                      <span className="text-sm font-light text-black/60 tracking-wide block">
                        Encryption Disabled
                      </span>
                      <span className="text-xs text-black/40 font-light">
                        Messages are not encrypted
                      </span>
                    </div>
                  </>
                )}
              </div>

              {isEncryptionEnabled && publicKey && (
                <div className="mt-4 pt-4 border-t border-black/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-black/40 font-light tracking-wide">
                      Your Public Key
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(publicKey)}
                      className="text-xs text-black/60 hover:text-black font-light tracking-wide transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="p-3 bg-black/[0.02] border border-black/5">
                    <p className="text-xs text-black/50 font-mono break-all leading-relaxed">
                      {publicKey}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Enable Button */}
            {!isEncryptionEnabled && (
              <button
                onClick={handleEnableEncryption}
                disabled={isEnabling}
                className="w-full h-12 border border-black bg-black hover:bg-black/90 text-white transition-all font-light tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEnabling ? (
                  "Enabling..."
                ) : (
                  <>
                    <Lock className="w-4 h-4 inline mr-2" />
                    Enable End-to-End Encryption
                  </>
                )}
              </button>
            )}

            {/* Success Message */}
            {success && (
              <div className="mt-4 p-4 border border-black/10 bg-black/[0.02]">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-black mt-0.5" />
                  <p className="text-sm text-black font-light leading-relaxed">
                    Encryption enabled successfully! You can now send encrypted messages to
                    contacts who also have encryption enabled.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 border border-black/20 bg-black/[0.02]">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-black/60 mt-0.5" />
                  <p className="text-sm text-black/80 font-light">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="border border-black/5 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 border border-black/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Key className="w-4 h-4 text-black/40" />
              </div>
              <div>
                <h3 className="text-sm font-light text-black mb-2 tracking-wide">
                  Important Security Information
                </h3>
                <p className="text-sm text-black/50 font-light leading-relaxed">
                  Your encryption keys are stored locally on your device. If you clear
                  your browser data or use a different device, you'll need to re-enable
                  encryption. Keep your private key secure and never share it with anyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
