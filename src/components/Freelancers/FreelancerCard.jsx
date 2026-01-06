import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function FreelancerCard({ freelancer }) {
  const navigate = useNavigate();

  return (
    <Card className="h-100">
      <Card.Img
        variant="top"
        src={freelancer.image_url || null}
        style={{
          height: "180px",
          objectFit: "contain",
          backgroundColor: "#f1f1f1",
        }}
      />

      <Card.Body>
        <h5>{freelancer.name}</h5>
        <p className="text-muted small">{freelancer.skills}</p>

        <Button
          variant="outline-primary"
          onClick={() => navigate(`/users/${freelancer.id}`)}
        >
          View Profile
        </Button>
      </Card.Body>
    </Card>
  );
}

// Note:
// this component displays a simple freelancer card on search result using React-Bootstrap.
// it shows the freelancer's image, name, and skills.
// if `image_url` is empty, the image will still render safely without breaking the UI. Line 11 || null
// the "View Profile" button uses `useNavigate` from react-router-dom
// to redirect the user to the freelancer's profile page based on their ID.
