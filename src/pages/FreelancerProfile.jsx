import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function FreelancerProfile() {
  const { id } = useParams(); // freelancer id dari URL
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")); // logged-in user

  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(false);

  const API =
    "https://38598d96-2cae-4ccf-b576-296e506cfadb-00-138sqx8aobb0t.sisko.replit.dev";

  
  // FETCH FREELANCER PROFILE 
  useEffect(() => {
    setLoading(true);

    fetch(`${API}/users/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setFreelancer(data);
      })
      .catch(() => {
        setFreelancer(null);
      })
      .finally(() => setLoading(false));
  }, [id]);


  // HIRE FREELANCER
  const handleHire = async () => {
    if (!user?.id) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (user.id === freelancer.id) {
      alert("You cannot hire yourself 😅");
      return;
    }

    setHiring(true);

    try {
      const res = await fetch(`${API}/hires`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hirerId: user.id,
          hireeId: freelancer.id,
        }),
      });

      if (!res.ok) throw new Error();

      alert("🎉 Freelancer hired successfully!");
      navigate("/profile"); // back to UserProfile
    } catch (err) {
      alert("Hire failed");
    } finally {
      setHiring(false);
    }
  };

  // UI state
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner />
      </Container>
    );
  }

  if (!freelancer) {
    return (
      <Container className="py-5 text-center">
        <p>Freelancer not found</p>
      </Container>
    );
  }

  // MAIN UI
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-4">
            <div className="text-center mb-4">
              <img
                src={freelancer.image_url || "https://via.placeholder.com/120"}
                alt="Profile"
                width={120}
                height={120}
                className="rounded-circle mb-3"
                style={{ objectFit: "cover" }}
              />

              <h3>{freelancer.name}</h3>
              <p className="text-muted">
                {freelancer.skills || "No skills listed"}
              </p>
            </div>

            <h5>About</h5>
            <p>{freelancer.bio || "No bio provided."}</p>

            <div className="d-grid mt-4">
              <Button
                size="lg"
                disabled={hiring}
                onClick={handleHire}
              >
                {hiring ? "Hiring..." : "Hire Me"}
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

// Note:
// this page displays the detailed profile of a freelancer.
// it fetches freelancer data from the API using the ID from the URL params.
// while data is loading, a Spinner is shown.
// if the freelancer is not found, a "Freelancer not found" message appears.
// logged-in users can hire the freelancer via the "Hire Me" button:
//   - Users must be logged in, otherwise they're redirected to login.
//   - Users cannot hire themselves.
//   - When hiring, the button shows "Hiring..." until the API call finishes.
// upon successful hire, an alert is shown and the user is navigated back to their profile.
// if freelancer image or bio is missing, placeholders are used to keep the UI intact.
// react-Bootstrap components are used for layout, cards, and buttons.
