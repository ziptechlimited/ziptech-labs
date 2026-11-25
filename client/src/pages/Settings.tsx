import { FormEvent, ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowUpRight, Copy } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API, errorMessage, reportUrl } from "../lib/api";
import AppShell from "../components/ui/AppShell";
import { Avatar, Eyebrow } from "../components/ui/primitives";
import { STAGES } from "../types/record";

const FIELDS = [
  "name", "headline", "avatarUrl", "bio", "location", "company", "companyOneLiner", "sector",
  "stage", "website", "fundraising", "raiseAmount", "linkedin", "twitter", "isProfilePublic",
] as const;
type FormState = Record<(typeof FIELDS)[number], any>;

const Section = ({ eyebrow, title, body, children }: { eyebrow: string; title: string; body?: string; children: ReactNode }) => (
  <section className="grid gap-6 border-t border-white/5 py-10 lg:grid-cols-[280px_1fr]">
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="display mt-3 text-lg font-medium">{title}</h2>
      {body && <p className="mt-2 text-sm text-faint">{body}</p>}
    </div>
    <div className="grid gap-5 sm:grid-cols-2">{children}</div>
  </section>
);

const Field = ({ label, hint, full, children }: { label: string; hint?: string; full?: boolean; children: ReactNode }) => (
  <label className={full ? "sm:col-span-2" : undefined}>
    <span className="field-label">{label}</span>
    {children}
    {hint && <span className="mt-1.5 block text-xs text-faint">{hint}</span>}
  </label>
);

const Toggle = ({ checked, onChange, label, body }: { checked: boolean; onChange: (v: boolean) => void; label: string; body: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex w-full items-start justify-between gap-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition hover:border-white/15 sm:col-span-2"
  >
    <span>
      <span className="block text-sm text-ink">{label}</span>
      <span className="mt-1 block text-xs text-faint">{body}</span>
    </span>
    <span className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-lime" : "bg-white/10"}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-full transition-all ${checked ? "left-6 bg-bg" : "left-1 bg-white/70"}`} />
    </span>
  </button>
);

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const isFounder = user?.role === "founder";
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(() => {
    const initial = {} as FormState;
    FIELDS.forEach((k) => {
      initial[k] = (user as any)?.[k] ?? (k === "fundraising" ? false : k === "isProfilePublic" ? true : "");
    });
    return initial;
  });

  const set = (k: keyof FormState) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      await axios.patch(`${API}/users/me`, form);
      await refreshUser();
      toast.success("Profile saved");
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't save profile"));
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reportUrl(user?.slug));
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  return (
    <AppShell>
      <form onSubmit={save}>
        <header className="flex flex-col gap-6 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-5">
            <Avatar name={form.name} src={form.avatarUrl || undefined} size={64} />
            <div>
              <Eyebrow>Profile & settings</Eyebrow>
              <h1 className="display mt-2 text-3xl font-medium sm:text-4xl">{form.name || "Your profile"}</h1>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </header>

        {isFounder && user?.slug && (
          <div className="mb-2 flex flex-col gap-3 rounded-2xl border border-lime/20 bg-lime/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="eyebrow text-[10px]">Your shareable execution record</p>
              <p className="num mt-1 truncate text-sm text-ink">{reportUrl(user.slug)}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={copy} className="btn btn-secondary btn-sm"><Copy className="h-3.5 w-3.5" /> Copy</button>
              <Link to={`/f/${user.slug}`} className="btn btn-secondary btn-sm">Open <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        )}

        <Section eyebrow="Identity" title="Who you are" body="Shown at the top of your record and in investor discovery.">
          <Field label="Full name"><input className="input" value={form.name} onChange={set("name")} required maxLength={80} /></Field>
          <Field label="Headline" hint="e.g. Founder & CEO, Ledgerline"><input className="input" value={form.headline} onChange={set("headline")} maxLength={140} /></Field>
          <Field label="Location"><input className="input" value={form.location} onChange={set("location")} maxLength={120} placeholder="Lagos, NG" /></Field>
          <Field label="Avatar URL"><input className="input" value={form.avatarUrl} onChange={set("avatarUrl")} placeholder="https://…" type="url" /></Field>
          <Field label="Bio" full hint={`${(form.bio ?? "").length}/400`}>
            <textarea className="input min-h-28" value={form.bio} onChange={set("bio")} maxLength={400} placeholder="Your background and why you're the person to build this." />
          </Field>
        </Section>

        <Section
          eyebrow={isFounder ? "Company" : "Firm"}
          title={isFounder ? "What you're building" : "Where you invest"}
          body={isFounder ? "Investors filter discovery by stage and sector." : undefined}
        >
          <Field label={isFounder ? "Company" : "Firm"}><input className="input" value={form.company} onChange={set("company")} maxLength={120} /></Field>
          <Field label="Website"><input className="input" value={form.website} onChange={set("website")} maxLength={200} placeholder="company.com" /></Field>
          {isFounder && (
            <>
              <Field label="One-liner" full hint="One sentence. What it does and for whom.">
                <input className="input" value={form.companyOneLiner} onChange={set("companyOneLiner")} maxLength={160} />
              </Field>
              <Field label="Sector"><input className="input" value={form.sector} onChange={set("sector")} maxLength={60} placeholder="Fintech" /></Field>
              <Field label="Stage">
                <select className="input" value={form.stage} onChange={set("stage")}>
                  <option value="">Select stage</option>
                  {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Field>
            </>
          )}
        </Section>

        {isFounder && (
          <Section eyebrow="Fundraising" title="Signal to investors" body="Raising founders get a gold badge and can be filtered in discovery.">
            <Toggle
              checked={!!form.fundraising}
              onChange={(v) => setForm((f) => ({ ...f, fundraising: v }))}
              label="I'm currently raising"
              body="Show a “Raising” badge on your record and in discovery."
            />
            {form.fundraising && (
              <Field label="Target raise"><input className="input" value={form.raiseAmount} onChange={set("raiseAmount")} maxLength={40} placeholder="$750K" /></Field>
            )}
          </Section>
        )}

        <Section eyebrow="Links" title="Elsewhere">
          <Field label="LinkedIn"><input className="input" value={form.linkedin} onChange={set("linkedin")} maxLength={200} placeholder="linkedin.com/in/…" /></Field>
          <Field label="X / Twitter"><input className="input" value={form.twitter} onChange={set("twitter")} maxLength={200} placeholder="x.com/…" /></Field>
        </Section>

        {isFounder && (
          <Section eyebrow="Visibility" title="Who can see your record">
            <Toggle
              checked={!!form.isProfilePublic}
              onChange={(v) => setForm((f) => ({ ...f, isProfilePublic: v }))}
              label="Public execution record"
              body="Anyone with the link can view your record, and investors can find you in discovery. Private commitments and blocker notes are never shown."
            />
          </Section>
        )}

        <div className="flex justify-end border-t border-white/5 pt-8">
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        </div>
      </form>
    </AppShell>
  );
};

export default Settings;
