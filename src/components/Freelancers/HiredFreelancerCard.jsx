import { Card, Button, Badge, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";

export default function HiredFreelancerCard({ hire, userId, refresh }) {
  const API =
    "https://38598d96-2cae-4ccf-b576-296e506cfadb-00-138sqx8aobb0t.sisko.replit.dev";

  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({
    project_description: hire.project_description || "",
    special_request: hire.special_request || "",
    notes: hire.notes || "",
  });

  // Sync form state bila hire prop berubah
  useEffect(() => {
    setForm({
      project_description: hire.project_description || "",
      special_request: hire.special_request || "",
      notes: hire.notes || "",
    });
  }, [hire]);

  // MARK DONE
  const markDone = async () => {
    await fetch(`${API}/hires/${hire.hire_id}/done`, { method: "PUT" });
    refresh();
  };

  // DELETE / CANCEL
  const deleteHire = async () => {
    if (!window.confirm("Cancel this job?")) return;
    await fetch(`${API}/hires/${hire.hire_id}`, { method: "DELETE" });
    refresh();
  };

  // UPDATE BOOKING
  const saveEdit = async () => {
    await fetch(`${API}/hires/${hire.hire_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowEdit(false);
    refresh();
  };

  return (
    <>
      <Card className="p-3 mb-3 position-relative">
        {/* STATUS */}
        <Badge
          bg={hire.status === "done" ? "secondary" : "success"}
          className="position-absolute top-0 end-0 m-2"
        >
          {hire.status}
        </Badge>

        {/* FREELANCER INFO */}
        <h6 className="mb-1">{hire.user_name}</h6>
        <small className="text-muted">{hire.user_skills}</small>

        {/* PROJECT DETAILS */}
        <p className="mt-2 mb-1 small">
          <b>Project:</b> {hire.project_description || "-"}
        </p>
        <p className="mb-1 small">
          <b>Special:</b> {hire.special_request || "-"}
        </p>
        <p className="small text-muted">
          <b>Notes:</b> {hire.notes || "-"}
        </p>

        {/* ACTIONS */}
        {hire.status !== "done" && (
          <div className="mt-2 d-flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowEdit(true)}
            >
              Edit
            </Button>

            <Button size="sm" variant="success" onClick={markDone}>
              Done
            </Button>

            <Button size="sm" variant="danger" onClick={deleteHire}>
              Cancel
            </Button>
          </div>
        )}
      </Card>

      {/* EDIT MODAL */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Project Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Project Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.project_description}
              onChange={(e) =>
                setForm({ ...form, project_description: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Special Request</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.special_request}
              onChange={(e) =>
                setForm({ ...form, special_request: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={saveEdit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

// Note:
// this component displays a hired freelancer card with project details and status.
// it supports editing, marking a job as done, and cancelling a hire.
// local state is used to control the edit modal and form inputs.
// `useEffect` keeps the form data in sync when the `hire` prop changes.
// all actions (update, done, delete) call the backend API
// and trigger `refresh()` to reload the latest data after changes.
