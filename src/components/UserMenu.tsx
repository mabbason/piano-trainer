import { useState, useRef, useEffect } from "react";
import { AVATAR_MAP } from "./AvatarPicker";

interface Props {
  avatar?: string | null;
  onDashboard?: () => void;
  onSwitchUser?: () => void;
  onDeleteProfile?: () => void;
  onLogout: () => void;
}

function UserIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function UserMenu({ avatar, onDashboard, onSwitchUser, onDeleteProfile, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmDelete(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setConfirmDelete(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-9 h-9 rounded-full bg-n-700 hover:bg-n-600 text-n-300 hover:text-white flex items-center justify-center transition-colors"
        title="Menu"
        aria-label="Profile menu"
      >
        {avatar && AVATAR_MAP[avatar] ? (
          <span className="text-xl leading-none">{AVATAR_MAP[avatar]}</span>
        ) : (
          <UserIcon />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-n-800 border border-n-700 rounded-lg shadow-lg py-1 z-50">
          {onDashboard && (
            <button
              onClick={() => { setOpen(false); onDashboard(); }}
              className="w-full text-left px-4 py-2 text-sm text-n-300 hover:bg-n-700 hover:text-white"
            >
              Dashboard
            </button>
          )}
          {onSwitchUser && (
            <button
              onClick={() => { setOpen(false); onSwitchUser(); }}
              className="w-full text-left px-4 py-2 text-sm text-n-300 hover:bg-n-700 hover:text-white"
            >
              Switch Profile
            </button>
          )}
          {onDeleteProfile && (
            <>
              <div className="border-t border-n-700 my-1" />
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full text-left px-4 py-2 text-sm text-pink-base hover:bg-n-700 hover:text-pink-light"
                >
                  Delete Profile
                </button>
              ) : (
                <div className="px-3 py-2">
                  <p className="text-xs text-n-400 mb-2">Delete this profile?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setOpen(false);
                        setConfirmDelete(false);
                        onDeleteProfile();
                      }}
                      className="flex-1 py-1 text-xs bg-pink-base hover:bg-pink-light text-white rounded font-medium"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-1 text-xs bg-n-700 hover:bg-n-600 text-n-300 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          <div className="border-t border-n-700 my-1" />
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full text-left px-4 py-2 text-sm text-n-300 hover:bg-n-700 hover:text-white"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
