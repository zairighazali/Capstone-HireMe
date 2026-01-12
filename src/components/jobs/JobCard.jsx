import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { Card, Button, Badge, Modal, Form } from "react-bootstrap";
import JobInterestsModal from "./JobInterestModal";

export default function JobCard({ job, currentUserUid, onUpdated, onDeleted }) {
  const [showInterested, setShowInterested] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  // ===== EDIT FORM STATE =====
  const [title, setTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description);
  const [isRemote, setIsRemote] = useState(job.is_remote);
  const [location, setLocation] = useState(job.location || "");
  const [payment, setPayment] = useState(job.payment_rm || "");

  const isOwner = job.owner_uid === currentUserUid;
  const isOpen = job.status === "open";
  const hasApplied = job.has_applied === true;

  const getToken = async () => {
    const auth = getAuth();
    if (!auth.currentUser) throw new Error("Not logged in");
    return auth.currentUser.getIdToken();
  };

  // ===== EDIT =====
  const handleEdit = async () => {
    if (!confirm("Save changes to this job?")) return;

    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/jobs/${job.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            is_remote: isRemote,
            location: isRemote ? null : location,
            payment_rm: payment || null,
          }),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      const updatedJob = await res.json();
      onUpdated?.(updatedJob);
      setShowEdit(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== DELETE =====
  const handleDelete = async () => {
    if (!confirm("Delete this job?")) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/jobs/${job.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Delete failed");
      onDeleted?.(job.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== INTEREST =====
  const handleInterested = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/jobs/${job.id}/interested`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to apply");
      window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>{job.title}</Card.Title>

          <Card.Subtitle className="mb-2 text-muted">
            {job.is_remote ? "Remote" : `Onsite: ${job.location || "-"}`}
          </Card.Subtitle>

          <Card.Text>{job.description}</Card.Text>

          <Card.Text>
            Payment: {job.payment_rm ? `RM${job.payment_rm}` : "Not specified"}
          </Card.Text>

          {!isOpen && (
            <Badge bg="secondary" className="mb-2">
              {job.status.toUpperCase()}
            </Badge>
          )}

          {/* ===== OWNER ACTIONS ===== */}
          {isOwner && (
            <div className="mt-2">
              {isOpen && (
                <>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => setShowEdit(true)}
                    disabled={loading}
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={handleDelete}
                    disabled={loading}
                    className="me-2"
                  >
                    Delete
                  </Button>
                </>
              )}

              <Button
                size="sm"
                variant="info"
                onClick={() => setShowInterested(true)}
              >
                View Interested
              </Button>
            </div>
          )}

          {/* ===== FREELANCER ACTIONS ===== */}
          {!isOwner && isOpen && !hasApplied && (
            <Button
              size="sm"
              variant="success"
              onClick={handleInterested}
              disabled={loading}
            >
              I'm Interested
            </Button>
          )}

          {!isOwner && isOpen && hasApplied && (
            <Button size="sm" variant="secondary" disabled>
              Applied / Waiting Approval
            </Button>
          )}

          {!isOwner && !isOpen && (
            <Button size="sm" variant="secondary" disabled>
              Locked
            </Button>
          )}
        </Card.Body>
      </Card>

      {/* ===== EDIT MODAL ===== */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Job</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Remote"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              className="mb-2"
            />

            {!isRemote && (
              <Form.Group className="mb-2">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </Form.Group>
            )}

            <Form.Group>
              <Form.Label>Payment (RM)</Form.Label>
              <Form.Control
                type="number"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleEdit} disabled={loading}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== OWNER MODAL ===== */}
      {isOwner && (
        <JobInterestsModal
          show={showInterested}
          onHide={() => setShowInterested(false)}
          jobId={job.id}
          onHired={onUpdated}
        />
      )}
    </>
  );
}
