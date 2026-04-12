import { useState, useEffect, useRef } from "react";
import { changePassphrase } from "../utils/auth";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ChangePassphraseModal({ open, onClose }: Props) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setCurrent("");
      setNext("");
      setConfirm("");
      setError("");
      setSuccess(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (next.length < 4) {
      setError("New passphrase must be at least 4 characters");
      return;
    }
    if (next !== confirm) {
      setError("Passphrases don't match");
      return;
    }

    setSubmitting(true);
    const result = await changePassphrase(current, next);
    setSubmitting(false);

    if (result.ok) {
      setSuccess(true);
      setTimeout(onClose, 1500);
    } else {
      setError(result.error || "Failed to change passphrase");
    }
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <div
          className="bg-n-800 border border-n-700 rounded-xl shadow-xl w-full max-w-sm p-6 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-white font-semibold text-base mb-4">Change Passphrase</h2>

          {success ? (
            <p className="text-brand-green-base text-sm text-center py-4">Passphrase updated!</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                ref={inputRef}
                type="password"
                placeholder="Current passphrase"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="w-full bg-n-700 border border-n-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-n-500 focus:outline-none focus:border-purple-light"
              />
              <input
                type="password"
                placeholder="New passphrase (min 4 characters)"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                className="w-full bg-n-700 border border-n-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-n-500 focus:outline-none focus:border-purple-light"
              />
              <input
                type="password"
                placeholder="Confirm new passphrase"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-n-700 border border-n-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-n-500 focus:outline-none focus:border-purple-light"
              />

              {error && <p className="text-pink-base text-xs">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting || !current || !next || !confirm}
                  className="flex-1 bg-purple-base hover:bg-purple-light disabled:opacity-40 text-white text-sm py-2.5 rounded-lg font-medium transition-colors"
                >
                  {submitting ? "Saving..." : "Update"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-n-700 hover:bg-n-600 text-n-300 text-sm py-2.5 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
