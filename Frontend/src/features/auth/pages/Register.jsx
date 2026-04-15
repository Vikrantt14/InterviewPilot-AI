import React, { useState } from "react";
import "../auth.form.scss";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Swal from "sweetalert2";

const Register = () => {

  const navigate = useNavigate();
  const { loading, handleRegister } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setpassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ 1. Check empty fields
    if (!username || !email || !password || !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all the fields"
      });
      return;
    }

    // ✅ 2. Password match check
    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "Passwords do not match"
      });
      return;
    }

    // ✅ 3. Call API
    const res = await handleRegister({ username, email, password });

    // ✅ 4. Handle backend response
    if (res?.error) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: res.error   // coming from backend
      });
      return;
    }

    // ✅ 5. Success
    Swal.fire({
      icon: "success",
      title: "Registered Successfully",
      text: "Redirecting to login...",
      timer: 1500,            // ⏱ 10 seconds
      timerProgressBar: true,
      showConfirmButton: false
    });

    // ⏳ wait 10 sec then navigate
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  if (loading) {
    return (<main><h1>Loading.....</h1></main>);
  }

  return (
    <main>
      <div className="form-container">
        <h1>Register</h1>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label>Full Name</label>
            <input onChange={(e) => setUsername(e.target.value)} type="text" />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input onChange={(e) => setpassword(e.target.value)} type="password" />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input onChange={(e) => setConfirmPassword(e.target.value)} type="password" />
          </div>

          <button
            disabled={
              !username || !email || !password || !confirmPassword || loading
            }
            className="button primary-button"
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </main>
  );
};

export default Register;