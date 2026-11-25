import { ReactNode } from "react";
import { Logo } from "../components/ui/primitives";
import WeeklyBars from "../components/ui/WeeklyBars";

const DEMO_WEEKS = [1, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2].map((c, i) => ({
  weekOf: `w${i}`,
  commitments: c,
  delivered: [1, 1, 2, 0, 2, 1, 2, 1, 2, 2, 1, 2][i],
}));

// Split-screen shell for sign-in and registration.
const AuthLayout = ({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children: ReactNode }) => (
  <div className="grid min-h-screen bg-bg lg:grid-cols-[1.05fr_1fr]">
    <aside className="grid-bg relative hidden overflow-hidden border-r border-white/5 p-12 lg:flex lg:flex-col">
      <div className="glow-lime pointer-events-none absolute -left-40 bottom-0 h-[520px] w-[520px]" />
      <Logo />
      <div className="relative mt-auto max-w-md">
        <p className="eyebrow"><span className="text-lime">✦</span> The execution record</p>
        <p className="display mt-6 text-5xl font-medium leading-[1.02]">
          Pitch decks promise.
          <span className="block text-lime">Records prove.</span>
        </p>
        <div className="glass mt-12 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-subtle">Last 12 weeks · sample founder</span>
            <span className="num text-lime">87 · Exceptional</span>
          </div>
          <div className="mt-4">
            <WeeklyBars weekly={DEMO_WEEKS} height={56} />
          </div>
        </div>
      </div>
      <p className="eyebrow relative mt-12 text-[10px] text-faint">Lagos · Accra · Nairobi · Kigali</p>
    </aside>
    <main className="flex flex-col px-5 py-8 sm:px-12">
      <div className="lg:hidden"><Logo /></div>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
        <p className="eyebrow"><span className="text-lime">✦</span> {eyebrow}</p>
        <h1 className="display mt-4 text-3xl font-medium sm:text-4xl">{title}</h1>
        <div className="mt-10 animate-rise">{children}</div>
      </div>
    </main>
  </div>
);

export default AuthLayout;
