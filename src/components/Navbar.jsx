import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function AppNavbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    if (!window.confirm("Logout? why???!")) return;

    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Navbar expand="lg" bg="dark" variant="dark" fixed="top">
      <Container>
        {/* Brand / Logo Soon, no idea yet*/}
        <Navbar.Brand as={Link} to="/">
          HireME!
        </Navbar.Brand>

        {/* Hamburger yummy */}
        <Navbar.Toggle aria-controls="main-navbar" />

        {/* Menu */}
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto align-items-lg-center gap-2">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>

            {user ? (
              <>
                <Nav.Link as={NavLink} to="/profile">
                  Profile
                </Nav.Link>

                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={NavLink} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}