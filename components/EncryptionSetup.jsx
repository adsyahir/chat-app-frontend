"use client";

import { useState } from "react";
import { useEncryptionStore } from "@/lib/stores/encryptionStore";
import { Button } from "@/components/ui/button";

export function EncryptionSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const { isEncryptionEnabled, enableEncryption } = useEncryptionStore();

  // Don't show if already enabled
  if (isEncryptionEnabled) return null;

  const handleEnableEncryption = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await enableEncryption();

      if (result.success) {
        setShowDialog(false);
        alert('Encryption enabled successfully! Your messages are now end-to-end encrypted.');
      } else {
        setError(result.error || 'Failed to enable encryption');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showDialog) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900">Enable End-to-End Encryption</h3>
            <p className="text-sm text-blue-700">
              Secure your messages with encryption. Only you and your recipients can read them.
            </p>
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Enable
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Enable End-to-End Encryption</h2>

        <div className="space-y-4 mb-6">
          <div>
            <h4 className="font-medium mb-2">What happens:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>A unique encryption key will be generated</li>
              <li>Your messages will be encrypted before sending</li>
              <li>Only recipients with your key can read messages</li>
              <li>Keys are stored securely in your browser</li>
            </ul>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <strong>Important:</strong> Keep this device secure. If you lose access or clear
            browser data, you won't be able to read encrypted messages on new devices.
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDialog(false)}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleEnableEncryption}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Enabling...' : 'Enable Encryption'}
          </Button>
        </div>
      </div>
    </div>
  );
}
