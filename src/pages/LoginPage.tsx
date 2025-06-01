import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      alert("Login failed!");
    }
  };

  return (
    <div className="p-4 flex flex-col items-center gap-2">
      <h2 className="text-xl">Login</h2>
      <input className="p-2 border" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input className="p-2 border" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button className="bg-blue-500 text-white px-4 py-2" onClick={handleLogin}>Login</button>
    </div>
  );
}
