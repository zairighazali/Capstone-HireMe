import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HiredClientCard from "../components/Freelancers/HiredClientCard";
import JobCard from "../components/jobs/JobCard";

export default function FreelancerProfile() {
  const { id } = useParams(); // id = firebase_uid dari URL
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.token;

  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(false);
  const [hiredJobs, setHiredJobs] = useState([]);
  const [hirers, setHirers] = useState([]);

  const API = import.meta.env.VITE_API_URL;

  const isOwnProfile = user?.firebaseUser?.uid === id;

  // FETCH FREELANCER PROFILE
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const fetchProfile = async () => {
      const res = await fetch(`${API}/users/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      // convert skills array to string if needed
      setFreelancer({
        ...data,
        skills: Array.isArray(data.skills)
          ? data.skills.join(", ")
          : data.skills || "",
      });
    };

    const fetchOwnData = async () => {
      if (!isOwnProfile) return;
      
      try {
        const [hiredJobsRes, hirersRes] = await Promise.all([
          fetch(`${API}/me/hired-jobs`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/me/hirers`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        
        const hiredJobsData = await hiredJobsRes.json();
        const hirersData = await hirersRes.json();
        
        setHiredJobs(hiredJobsData || []);
        setHirers(hirersData || []);
      } catch (err) {
        console.error("Failed to fetch own data:", err);
      }
    };

    Promise.all([fetchProfile(), fetchOwnData()])
      .catch(() => setFreelancer(null))
      .finally(() => setLoading(false));
  }, [id, token, isOwnProfile]);

  // HIRE FREELANCER
  const handleHire = async () => {
    if (!user?.firebaseUser) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (user.uid === freelancer.firebase_uid) {
      alert("You cannot hire yourself 😅");
      return;
    }

    setHiring(true);

    try {
      const res = await fetch(`${API}/hires`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ hireeId: freelancer.id }),
      });

      if (!res.ok) throw new Error("Hire failed");
      alert("🎉 Freelancer hired successfully!");
      navigate("/profile"); // kembali ke profile sendiri
    } catch (err) {
      console.error(err);
      alert("Hire failed");
    } finally {
      setHiring(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
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

            {!isOwnProfile && (
              <div className="d-grid mt-4">
                <Button size="lg" disabled={hiring} onClick={handleHire}>
                  {hiring ? "Hiring..." : "Hire Me"}
                </Button>
              </div>
            )}
          </Card>

          {isOwnProfile && (
            <>
              <hr />
              <h4>Clients Who Hired Me</h4>
              {hirers.length === 0 && <p className="text-muted">None yet</p>}
              {hirers.map(h => (
                <HiredClientCard
                  key={h.id}
                  hire={h}
                  refresh={() => window.location.reload()}
                />
              ))}

              <hr />

              <h4>Jobs Offered To Me</h4>
              {hiredJobs.length === 0 && <p className="text-muted">No jobs yet</p>}
              {hiredJobs.map(j => (
                <JobCard
                  key={j.id}
                  job={j}
                  refresh={() => window.location.reload()}
                  userId={user.firebaseUser.uid}
                />
              ))}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}