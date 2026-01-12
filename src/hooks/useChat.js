import { ref, push } from "firebase/database";
import { getAuth } from "firebase/auth";
import { db } from "../firebase"; // path ke firebase.js kau
import { useNavigate } from "react-router-dom";

// helper bersihkan object sebelum push
const cleanObject = (obj) => {
  const result = {};
  for (const key in obj) {
    result[key] = obj[key] ?? null; // undefined → null
  }
  return result;
};

export const useChat = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  // START CONVERSATION
  const startConversation = async (user) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/conversations/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ freelancerId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to start conversation");

      // navigate ke chat page, pass user sebagai state
      navigate(`/chat/${data.conversationId}`, { state: { user } });
    } catch (err) {
      alert(err.message);
      console.error("startConversation error:", err);
    }
  };

  // SEND MESSAGE
  const sendMessage = async ({ conversationId, content, receiverId }) => {
    if (!content?.trim()) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const senderUid = auth.currentUser.uid;

      // 1️⃣ Push ke backend Postgres
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send message to backend");

      // 2️⃣ Push ke Firebase Realtime Database untuk realtime update
      const firebaseData = cleanObject({
        conversation_id: conversationId,
        sender_uid: senderUid,
        receiver_uid: receiverId,
        content: content,
        created_at: Date.now(),
      });

      await push(ref(db, "messages"), firebaseData);

      return data; // optional: return backend message
    } catch (err) {
      console.error("sendMessage error:", err);
      alert(err.message);
    }
  };

  return { startConversation, sendMessage };
};
