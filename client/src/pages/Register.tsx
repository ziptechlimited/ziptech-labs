import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Rocket, Telescope } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types/shared";
import { cn, errorMessage } from "../lib/api";
import AuthLayout from "./AuthLayout";

const ROLES = [
  { value: UserRole.FOUNDER, icon: Rocket, title: "Founder", body: "Commit weekly and build a record." },
  { value: UserRole.INVESTOR, icon: Telescope, title: "Investor", body: "Discover founders by execution." },
];

const Register = () => {
  const [params] = useSearchParams();
  const invite = params.get("invite");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [role, setRole] = useState<UserRole>(params.get("role") === "investor" && !invite ? UserRole.INVESTOR : UserRole.FOUNDER);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (invite) localStorage.setItem("pendingInvite", invite);
  }, [invite]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Use at least 8 characters for your password");
      return;
    }
    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password, role);
      toast.success("Account created. Check your inbox to verify your email.");
      navigate(role === UserRole.INVESTOR ? "/discover" : "/dashboard", { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout eyebrow={invite ? "You've been invited" : "Create your account"} title={invite ? "Join your cohort." : "Start your record."}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {!invite && (
          <fieldset>
            <legend className="field-label">I'm joining as</legend>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <label key={r.value} className={cn("cursor-pointer rounded-2xl border p-4 transition", role === r.value ? "border-lime/50 bg-lime/[0.06]" : "border-white/[0.08] hover:border-white/15")}>
                  <input type="radio" name="role" className="sr-only" checked={role === r.value} onChange={() => setRole(r.value)} />
                  <r.icon className={cn("h-4 w-4", role === r.value ? "text-lime" : "text-subtle")} />
                  <span className="mt-3 block text-sm text-ink">{r.title}</span>
                  <span className="mt-1 block text-xs text-faint">{r.body}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {invite && (
          <p className="rounded-2xl border border-lime/20 bg-lime/[0.05] p-4 text-sm text-subtle">
            Invite code <span className="num text-lime">{invite}</span> will be applied once you verify your email.
          </p>
        )}
        <label className="block">
          <span className="field-label">Full name</span>
          <input autoComplete="name" required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="block">
          <span className="field-label">Email</span>
          <input type="email" autoComplete="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="block">
          <span className="field-label">Password</span>
          <input type="password" autoComplete="new-password" required minLength={8} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <span className="mt-1.5 block text-xs text-faint">At least 8 characters.</span>
        </label>
        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-8 text-sm text-subtle">
        Already have an account? <Link to="/login" className="text-lime hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
