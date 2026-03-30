import { useState } from "react";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signup(e) {
    e.preventDefault();

    try {
      const res = await fetch(import.meta.env.VITE_SIGNUP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!data.success) {
        alert("Signup failed: " + data.message);
        console.log("Signup failed:", data.message);
        return;
      }

      window.location.href = "/dashboard";

    } catch (err) {
      console.error("Error:", err);
    }
  }

  return (
    <div>
      <form onSubmit={signup}>
        <label htmlFor="name">Name:</label>
        <input id="name" type="text" name="name" placeholder="Name" autoComplete="name" onChange={(e) => setName(e.target.value)}/>
        <label htmlFor="email">Email:</label>
        <input id="email" type="email" name="email" placeholder="Email" autoComplete="email" onChange={(e) => setEmail(e.target.value)}/>
        <label htmlFor="password">Password:</label>
        <input id="password" type="password" name="password" placeholder="Password" autoComplete="new-password" onChange={(e) => setPassword(e.target.value)}/>
        <button type="submit">SignUP</button>
      </form>
        
      <button onClick={() => window.location.href = "/login"}>Already have an account ?</button>
    </div>
  );
};

export default Signup;
