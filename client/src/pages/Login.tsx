import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../lib/api";
import AuthLayout from "./AuthLayout";

const VERIFY_MESSAGES: Record<string, [string, "success" | "error"]> = {
  ok: ["Email verified. Sign in to continue.", "success"],
  expired: ["That verification link expired. Sign in to request a new one.", "error"],
  invalid: ["That verification link is invalid.", "error"],
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  useEffect(() => {
    const v = params.get("verified");
    if (v && VERIFY_MESSAGES[v]) {
      const [msg, kind] = VERIFY_MESSAGES[v];
      toast[kind](msg, { id: "verify" });
    }
  }, [params]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate((location.state as any)?.from || "/dashboard", { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout eyebrow="Welcome back" title="Sign in to your record.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="field-label">Email</span>
          <input type="email" autoComplete="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="field-label">Password</span>
          <input type="password" autoComplete="current-password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-8 text-sm text-subtle">
        New to Ziptech Labs? <Link to="/register" className="text-lime hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
