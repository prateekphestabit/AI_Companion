import { useState } from "react";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login(e) {
    e.preventDefault();

    try {
      const res = await fetch(import.meta.env.VITE_LOGIN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Login failed: " + data.message);
        console.log("Login failed:", data.message);
        return;
      }
      console.log("Login successful:");
      window.location.href = "/dashboard";

    } catch (err) {
      console.error("Error:", err);
    }
  }

  return (
    <div>
      <form onSubmit={login}>
        <label htmlFor="email">Email:</label>
        <input id="email" type="email" name="email" placeholder="Email" autoComplete="email" onChange={(e) => setEmail(e.target.value)}/>
        <label htmlFor="password">Password:</label>
        <input id="password" type="password" name="password" placeholder="Password" autoComplete="current-password" onChange={(e) => setPassword(e.target.value)}/>
        <button type="submit">Login</button>
      </form>
        
      <button onClick={() => window.location.href = "/signup"}>New User ?</button>
    </div>
  );
};

export default Login;