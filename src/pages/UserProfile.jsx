import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Modal,
  Form,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HiredFreelancerCard from "../components/Freelancers/HiredFreelancerCard";

export default function UserProfile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const API =
    "https://38598d96-2cae-4ccf-b576-296e506cfadb-00-138sqx8aobb0t.sisko.replit.dev";

  const CLOUD_NAME = "dyv5qchav";
  const UPLOAD_PRESET = "profile_upload";

  const [showEdit, setShowEdit] = useState(false);
  const [profile, setProfile] = useState({});
  const [hired, setHired] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  // NOT LOGGED IN
  useEffect(() => {
    if (!user?.id) navigate("/login");
  }, []);

  // FETCH HIRES + JOBS
  const fetchHiresAndJobs = () => {
    if (!user?.id) return;

    fetch(`${API}/users/${user.id}/hires`)
      .then(res => res.json())
      .then(setHired);

    fetch(`${API}/users/${user.id}/jobs`)
      .then(res => res.json())
      .then(setJobs);
  };

  // FETCH PROFILE 
  useEffect(() => {
    if (!user?.id) return;

    fetch(`${API}/users/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setImagePreview(data.image_url);
      });

    fetchHiresAndJobs();
  }, [user?.id]);

  // IMAGE UPLOAD
  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();

      setProfile(prev => ({ ...prev, image_url: data.secure_url }));
      setImagePreview(data.secure_url);
    } catch {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  // SAVE PROFILE
  const handleSaveProfile = async () => {
    const res = await fetch(`${API}/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    const updated = await res.json();

    localStorage.setItem(
      "user",
      JSON.stringify({ ...user, name: updated.name })
    );

    setProfile(updated);
    setShowEdit(false);
  };

  return (
    <Container className="pt-5 mt-4">
      <Row className="g-4">
        {/* LEFT */}
        <Col md={6}>
          <Card className="p-4 text-center">
            <img
              src={profile.image_url || "https://via.placeholder.com/120"}
              width={120}
              height={120}
              className="rounded-circle mb-3"
            />
            <h4>{profile.name}</h4>
            <p className="text-muted">{profile.skills}</p>
            <p>{profile.bio}</p>
            <Button onClick={() => setShowEdit(true)}>Edit Profile</Button>
          </Card>
        </Col>

        {/* RIGHT SECTION */}
        <Col md={6}>
          <h4>People I Hired</h4>
          {hired.length === 0 && <p className="text-muted">None yet</p>}
          {hired.map(h => (
            <HiredFreelancerCard
              key={h.hire_id}
              hire={h}
              userId={user.id}
              refresh={fetchHiresAndJobs}
            />
          ))}

          <hr />

          <h4>Jobs Offered To Me</h4>
          {jobs.length === 0 && <p className="text-muted">No jobs yet</p>}
          {jobs.map(j => (
            <HiredFreelancerCard
              key={j.hire_id}
              hire={j}
              userId={user.id}
              refresh={fetchHiresAndJobs}
            />
          ))}
        </Col>
      </Row>

      {/* EDIT MODAL */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <img
              src={imagePreview || "https://via.placeholder.com/100"}
              width={100}
              height={100}
              className="rounded-circle mb-3"
            />
            <Form.Control
              type="file"
              onChange={e => handleImageUpload(e.target.files[0])}
            />
            <Form.Control
              className="mt-3"
              value={profile.name || ""}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
            />
            <Form.Control
              className="mt-2"
              value={profile.skills || ""}
              onChange={e => setProfile({ ...profile, skills: e.target.value })}
            />
            <Form.Control
              className="mt-2"
              as="textarea"
              rows={4}
              value={profile.bio || ""}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSaveProfile}>Save</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

// Note:
// LEFT COLUMN: Shows the user's profile with image, name, skills, bio, and an "Edit Profile" button.
// RIGHT COLUMN: Shows two sections:
//   1. People the user has hired.
//   2. Jobs offered to the user.
// Each hire/job is rendered using the HiredFreelancerCard component, with refresh functionality.
// Profile data is fetched from the API when the page loads, and hires/jobs are fetched separately.
// Users can edit their profile via a modal:
//   - Upload a new profile image (Cloudinary used for storage).
//   - Update name, skills, and bio.
//   - Changes are saved via a PUT request to the API, and localStorage is updated accordingly.
// If the user is not logged in, they are redirected to the login page.

