import { Modal, Button, ListGroup, Image, Badge } from "react-bootstrap";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JobInterestsModal({ show, onHide, jobId, onHired }) {
  const [users, setUsers] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [jobLocked, setJobLocked] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    if (!show) return;

    const fetchInterests = async () => {
      const token = await getAuth().currentUser.getIdToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/jobs/${jobId}/interests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      // detect job already hired
      if (data.some((u) => u.is_hired)) setJobLocked(true);

      setUsers(data);
    };

    fetchInterests();
  }, [show, jobId]);

  const handleHire = async (userId) => {
    if (!confirm("Hire this freelancer and lock this job?")) return;
    setLoadingId(userId);

    try {
      const token = await getAuth().currentUser.getIdToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/jobs/${jobId}/hire/${userId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to hire");

      // optimistic UI
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          is_hired: u.id === userId,
          is_rejected: u.id !== userId,
        }))
      );
      setJobLocked(true);
      onHired?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleChat = async (u) => {
    try {
      const token = await getAuth().currentUser.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/conversations/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ freelancerId: u.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to start chat");

      // ✅ Pass conversationId + user
      navigate(`/chat/${data.conversationId}`, {
        state: { user: u, conversationId: data.conversationId },
      });

      onHide();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Interested Freelancers</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {users.length === 0 && <p>No interest yet</p>}
        <ListGroup>
          {users.map((u) => (
            <ListGroup.Item
              key={u.id}
              className="d-flex justify-content-between align-items-center"
            >
              <div className="d-flex align-items-center">
                <Image src={u.image_url || "https://via.placeholder.com/40"} roundedCircle width={40} height={40} className="me-2" />
                <div>
                  <div>{u.name}</div>
                  {u.is_hired && <Badge bg="success" className="mt-1">HIRED</Badge>}
                  {u.is_rejected && <Badge bg="secondary" className="mt-1">NOT SELECTED</Badge>}
                </div>
              </div>

              <div>
                <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleChat(u)}>
                  Chat
                </Button>
                <Button
                  size="sm"
                  variant="success"
                  disabled={jobLocked || loadingId === u.id || u.is_hired || u.is_rejected}
                  onClick={() => handleHire(u.id)}
                >
                  Hire
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
