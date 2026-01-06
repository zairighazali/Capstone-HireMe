import { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const API_BASE_URL =
    "https://38598d96-2cae-4ccf-b576-296e506cfadb-00-138sqx8aobb0t.sisko.replit.dev";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/profile");
    } else {
      alert(data.message);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 400 }}>
      <h3 className="mb-4 text-center">Login</h3>

      <Form onSubmit={handleSubmit}>
        <Form.Control
          className="mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <Form.Control
          type="password"
          className="mb-3"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" className="w-100 mb-3">
          Login
        </Button>
      </Form>

      {/* REGISTER LINK */}
      <p className="text-center small text-muted">
        No account?{" "}
        <Link
          to="/register"
          className="text-primary fw-semibold text-decoration-none"
        >
          Register
        </Link>
      </p>
    </Container>
  );
}

// Note:
// this page renders a login form for users to authenticate.
// it uses local state to keep track of email and password inputs.
// on form submission:
//   - `e.preventDefault()` stops the page from refreshing.
//   - sends a POST request to the API `/auth/login` endpoint with email & password.
//   - if login is successful, the returned user data is stored in localStorage,
//     and the user is redirected to their profile page.
//   - if login fails, an alert shows the error message from the server.
// there's also a link for users without an account to go to the Register page.
// react-Bootstrap is used for styling the form, inputs, and button.
