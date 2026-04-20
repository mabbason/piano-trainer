import { useState, useEffect, useCallback } from "react";
import { fetchUsers, createUser, selectUser } from "../utils/auth";
import type { User } from "../utils/auth";
import { AvatarPicker, AVATAR_MAP } from "./AvatarPicker";

interface Props {
  onUserSelected: (userId: number, avatar: string) => void;
}

export function UserPicker({ onUserSelected }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState("piano");
  const [addError, setAddError] = useState("");

  useEffect(() => {
    fetchUsers().then((u) => {
      setUsers(u);
      setLoading(false);
    });
  }, []);

  const handleSelect = useCallback(
    async (userId: number, avatar: string) => {
      setSelecting(userId);
      const result = await selectUser(userId);
      if (result.ok) {
        onUserSelected(userId, avatar);
      }
      setSelecting(null);
    },
    [onUserSelected]
  );

  const handleAdd = useCallback(async () => {
    if (!newName.trim()) return;
    setAddError("");
    try {
      const user = await createUser(newName.trim(), newAvatar);
      setUsers((prev) => [...prev, user]);
      setShowAdd(false);
      setNewName("");
      setNewAvatar("piano");
      handleSelect(user.id, user.avatar);
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : "Failed to create profile");
    }
  }, [newName, newAvatar, handleSelect]);

  return (
    <div className="h-screen bg-n-900 flex items-center justify-center overflow-y-auto py-10">
      <div className="w-full max-w-sm md:max-w-lg px-6">
        <div className="flex justify-center mb-2">
          <img src="/logos/chorda-logo-white-full.png" alt="Chorda" className="h-24 md:h-40" />
        </div>
        <p className="text-n-500 text-center text-sm mb-8">Who's playing?</p>

        {loading ? (
          <div className="text-n-500 text-center">Loading...</div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelect(user.id, user.avatar)}
                  disabled={selecting !== null}
                  className="flex flex-col items-center gap-2 group disabled:opacity-50"
                >
                  <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${
                    selecting === user.id
                      ? "ring-2 ring-purple-light bg-purple-base/20"
                      : "bg-n-800 group-hover:ring-2 group-hover:ring-purple-light"
                  }`}>
                    <span className="text-5xl leading-none">
                      {AVATAR_MAP[user.avatar] || AVATAR_MAP.piano}
                    </span>
                  </div>
                  <span className="text-white text-sm font-medium text-center max-w-[7rem] truncate">
                    {selecting === user.id ? "Loading..." : user.name}
                  </span>
                </button>
              ))}

              {/* Add profile */}
              <button
                onClick={() => setShowAdd(true)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-28 h-28 rounded-full border-2 border-dashed border-n-700 group-hover:border-purple-light flex items-center justify-center transition-all">
                  <span className="text-4xl text-n-500 group-hover:text-purple-light leading-none transition-colors">+</span>
                </div>
                <span className="text-n-500 group-hover:text-purple-light text-sm font-medium transition-colors">Add Profile</span>
              </button>
            </div>

            {/* Add profile form */}
            {showAdd && (
              <div className="bg-n-800 rounded-xl p-5 mb-4 relative">
                <button
                  onClick={() => {
                    setShowAdd(false);
                    setAddError("");
                  }}
                  className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-n-500 hover:text-white hover:bg-n-600 transition-colors"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
                <h3 className="text-white font-medium mb-3">New Profile</h3>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="Name"
                  className="w-full px-3 py-2 bg-n-700 border border-n-600 rounded-lg text-white placeholder-n-500 text-sm focus:outline-none focus:border-purple-light mb-3"
                  autoFocus
                />
                <p className="text-n-400 text-xs mb-2">Pick an avatar</p>
                <AvatarPicker selected={newAvatar} onSelect={setNewAvatar} />
                {addError && (
                  <p className="text-pink-base text-sm mt-3">{addError}</p>
                )}
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  className="w-full py-2 mt-4 bg-purple-base hover:bg-purple-light disabled:bg-n-700 disabled:text-n-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Create
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
