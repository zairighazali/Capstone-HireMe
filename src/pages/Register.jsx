import { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const API_BASE_URL =
    "https://38598d96-2cae-4ccf-b576-296e506cfadb-00-138sqx8aobb0t.sisko.replit.dev";

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    navigate("/login");
  };

  return (
    <Container className="py-5" style={{ maxWidth: 400 }}>
      <h3 className="mb-4">Register</h3>

      <Form onSubmit={handleSubmit}>
        <Form.Control
          className="mb-3"
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Form.Control
          className="mb-3"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Form.Control
          type="password"
          className="mb-3"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <Button type="submit" className="w-100">
          Register
        </Button>
      </Form>
    </Container>
  );
}

// Note:
// it keeps the form data (name, email, password) in local state.
// on form submission:
//   - `e.preventDefault()` prevents the page from refreshing.
//   - sends a POST request to the API `/auth/register` endpoint with the form data.
//   - after successful registration, the user is redirected to the login page.
// react-Bootstrap is used for the form, inputs, and button.
