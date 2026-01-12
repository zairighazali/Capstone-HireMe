import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import {
  Container,
  Row,
  Col,
  ListGroup,
  Card,
  Form,
  Button,
  Image,
} from "react-bootstrap";
import { useLocation, useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";

export default function ChatPage() {
  const location = useLocation();
  const { conversationId } = useParams();
  const [users, setUsers] = useState([]); // left panel users
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  // ----- GET CURRENT USER -----
  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) setCurrentUser(auth.currentUser);
    else auth.onAuthStateChanged((user) => user && setCurrentUser(user));
  }, []);

  // ----- FETCH CONTACTS IF EMPTY -----
  useEffect(() => {
    if (!currentUser || users.length > 0) return;

    const fetchContacts = async () => {
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to fetch contacts: ${res.status}`);
        const data = await res.json();
        console.log("Fetched contacts:", data);
        setUsers(Array.isArray(data) ? data : data.conversations || []);
        if (conversationId) {
          const user = data.find(u => u.conversationId === conversationId);
          if (user) setSelectedUser(user);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
        alert("Failed to load contacts. Please check the console for details.");
      }
    };

    fetchContacts();
  }, [currentUser, conversationId, users.length]);

  // ----- FETCH MESSAGES WHEN SELECTED USER CHANGE -----
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const fetchMessages = async () => {
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/conversations/${selectedUser.conversationId}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
        const data = await res.json();
        console.log("Fetched messages:", data);
        setMessages(Array.isArray(data) ? data : data.messages || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
        alert("Failed to load messages. Please check the console for details.");
      }
    };

    fetchMessages();
  }, [selectedUser, currentUser]);

  // ----- SOCKET.IO CONNECTION -----
  useEffect(() => {
    if (!currentUser) return;

    const setupSocket = async () => {
      const token = await currentUser.getIdToken();
      const s = io(import.meta.env.VITE_API_URL, {
        auth: { token },
      });

      setSocket(s);

      s.on("connect", () => {
        console.log("Socket connected:", s.id);
      });

      s.on("receive_message", (msg) => {
        // Only append message if it's part of current conversation
        if (selectedUser && msg.conversation_id === selectedUser.conversationId) {
          setMessages((prev) => [...prev, msg]);
        }
      });

      s.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    };

    setupSocket();

    return () => {
      socket?.disconnect();
    };
  }, [currentUser, selectedUser]);

  // ----- SEND MESSAGE -----
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !socket) return;

    socket.emit("send_message", {
      conversationId: selectedUser.conversationId,
      content: newMessage,
      receiverUid: selectedUser.firebase_uid,
    });

    setMessages((prev) => [
      ...prev,
      {
        content: newMessage,
        sender_uid: currentUser.uid,
        receiver_uid: selectedUser.firebase_uid,
        created_at: new Date(),
      },
    ]);
    setNewMessage("");
  };

  // ----- AUTO SCROLL -----
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container fluid className="py-4">
      <Row>
        {/* USERS LIST */}
        <Col md={4} style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <h5>Contacts</h5>
          <ListGroup>
            {users.map((u) => (
              <ListGroup.Item
                key={u.id}
                action
                active={selectedUser?.id === u.id}
                onClick={() => {
                  setSelectedUser(u);
                  setMessages([]); // will fetch messages
                }}
              >
                <Image
                  src={u.image_url || "https://via.placeholder.com/40"}
                  roundedCircle
                  width={40}
                  height={40}
                  className="me-2"
                />
                {u.name}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        {/* CHAT PANEL */}
        <Col md={8}>
          {selectedUser ? (
            <>
              <h5>{selectedUser.name}</h5>
              <Card
                style={{ maxHeight: "60vh", overflowY: "auto" }}
                className="mb-2"
              >
                <ListGroup variant="flush">
                  {messages.map((msg, idx) => (
                    <ListGroup.Item
                      key={idx}
                      className={`d-flex ${
                        msg.sender_uid === currentUser.uid
                          ? "justify-content-end"
                          : "justify-content-start"
                      }`}
                    >
                      <span
                        className={`px-3 py-1 rounded ${
                          msg.sender_uid === currentUser.uid
                            ? "bg-primary text-white"
                            : "bg-light"
                        }`}
                      >
                        {msg.content}
                      </span>
                    </ListGroup.Item>
                  ))}
                  <div ref={messagesEndRef} />
                </ListGroup>
              </Card>

              <Form onSubmit={handleSend} className="d-flex">
                <Form.Control
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" className="ms-2">
                  Send
                </Button>
              </Form>
            </>
          ) : (
            <p>Select a user to start chatting</p>
          )}
        </Col>
      </Row>
    </Container>
  );
}
