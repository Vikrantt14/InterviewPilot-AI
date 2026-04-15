import React, { useState } from "react";
import "../auth.form.scss"
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Swal from "sweetalert2";



const Login = () => {

  const { loading, handleLogin } = useAuth()
  const navigate = useNavigate();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // const handleSubmit = async (e) => {
  //   e.preventDefault()
  //   await handleLogin({email, password})
  //   navigate('/')
  // }



 const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ validation
  if (!email || !password) {
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "Please enter email and password"
    });
    return;
  }

  const res = await handleLogin({ email, password });

  // ❌ error case
  if (res?.error) {
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: res.error
    });
    return;
  }

  // ✅ success swal (5 sec → auto redirect to home "/")
  Swal.fire({
    icon: "success",
    title: "Login Successful",
    text: "Redirecting to home...",
    timer: 1500,
    timerProgressBar: true,
    showConfirmButton: false,
  });
      // ⏳ wait 10 sec then navigate
    setTimeout(() => {
      navigate("/");
    }, 1500);
};
  if (loading) {
    return (<main><h1>Loading.....</h1></main>)
  }

  return (
    <main>
      <div className="form-container">
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              onChange={(e) => { setEmail(e.target.value) }}
              type="email" name="email" id="email" placeholder="Enter your email" />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              onChange={(e) => { setPassword(e.target.value) }}
              type="password" name="password" id="password" placeholder="Enter Password" />
          </div>

          {/* <button className="button primary-button">Login</button> */}

          <button
            disabled={!email || !password || loading}
            className="button primary-button"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p>Don't have an account? <Link to="/register">Register</Link></p>

      </div>

    </main>

  )
}


export default Login