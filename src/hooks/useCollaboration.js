import { useState, useEffect } from 'react';
import { ref, onValue, set, onDisconnect } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export function useCollaboration(roomId) {
  const { user, profile } = useAuth();
  const [activeUsers, setActiveUsers] = useState({});
  const [remoteCode, setRemoteCode] = useState(null);

  useEffect(() => {
    if (!roomId || !user) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    const myPresenceRef = ref(db, `rooms/${roomId}/users/${user.uid}`);
    const connectedRef = ref(db, '.info/connected');

    // Handle Presence
    const connectedUnsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        // When disconnected, remove our presence
        onDisconnect(myPresenceRef).remove().then(() => {
          // Once disconnect is set up, set our presence
          const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
          set(myPresenceRef, {
            name: profile?.name || user.email || 'Anonymous Student',
            color: randomColor,
            lastActive: Date.now()
          });
        });
      }
    });

    // Listen for other users
    const usersRef = ref(db, `rooms/${roomId}/users`);
    const usersUnsubscribe = onValue(usersRef, (snap) => {
      if (snap.exists()) {
        setActiveUsers(snap.val());
      } else {
        setActiveUsers({});
      }
    });

    // Listen for code changes (basic scaffold)
    const codeRef = ref(db, `rooms/${roomId}/content`);
    const codeUnsubscribe = onValue(codeRef, (snap) => {
      if (snap.exists() && snap.val().senderId !== user.uid) {
        setRemoteCode(snap.val().code);
      }
    });

    return () => {
      connectedUnsubscribe();
      usersUnsubscribe();
      codeUnsubscribe();
      // Manually remove presence on unmount
      set(myPresenceRef, null);
    };
  }, [roomId, user, profile]);

  const broadcastCode = (code) => {
    if (!roomId || !user) return;
    set(ref(db, `rooms/${roomId}/content`), {
      code,
      senderId: user.uid,
      timestamp: Date.now()
    });
  };

  const broadcastCursor = (position) => {
    if (!roomId || !user) return;
    set(ref(db, `rooms/${roomId}/cursors/${user.uid}`), position);
  };

  return { activeUsers, remoteCode, broadcastCode, broadcastCursor };
}
