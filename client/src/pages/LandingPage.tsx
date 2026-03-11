import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Users, Target, Activity } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur">
        <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
          <Link to="/" className="flex items-baseline gap-3">
            <span className="text-xs uppercase tracking-[0.35em] text-muted">
              Ziptech
            </span>
            <span className="text-lg font-semibold tracking-[-0.02em] text-primary">
              Labs
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-muted hover:text-primary transition"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-surface px-5 py-2.5 text-sm font-semibold text-primary hover:border-white/20 hover:bg-white/5 transition"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-5 text-xs uppercase tracking-[0.35em] text-muted">
            Accountability infrastructure
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-[-0.03em] leading-[0.92] text-primary mb-6">
            Perfect momentum
            <br />
            for builders.
          </h1>
          <p className="text-lg md:text-xl text-muted mb-8 leading-relaxed max-w-xl">
            Join a cohort, set weekly goals, and verify progress with peers. Stay
            focused on shipping—week after week.
          </p>
          <div className="flex gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm md:text-base font-semibold text-black hover:brightness-95 transition"
            >
              Join a cohort <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm md:text-base font-semibold text-primary hover:bg-white/10 transition"
            >
              Learn more
            </a>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden md:block"
        >
           {/* Abstract illustration placeholder using pure CSS/SVG/Divs if needed or just a clean card UI mock */}
           <div className="relative rounded-3xl border border-white/10 bg-surface p-8 shadow-2xl shadow-black/40 rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              <div className="relative flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                 <div className="w-12 h-12 bg-accent/15 rounded-full flex items-center justify-center text-accent">
                    <Target className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-semibold text-lg text-primary">Weekly Goal</h3>
                    <p className="text-muted text-sm">Ship MVP landing page</p>
                 </div>
                 <div className="ml-auto px-3 py-1 bg-white/10 text-muted text-xs font-semibold rounded-full">
                    IN PROGRESS
                 </div>
              </div>
              
              <div className="relative space-y-4">
                 <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-white/25" />
                    <span className="text-muted line-through">Design hero section</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span className="text-primary font-medium">Implement auth flow</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-white/15" />
                    <span className="text-muted">Deploy</span>
                 </div>
              </div>
           </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="py-20 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.35em] text-muted mb-4">
              Our system
            </div>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-primary mb-5">
              Complex work.
              <br className="hidden md:block" /> Elegant accountability.
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Keep goals public, progress verifiable, and cohorts aligned—without
              adding process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             <FeatureCard 
               icon={<Users className="w-8 h-8 text-accent" />}
               title="Join a Cohort"
               description="Group up with 5-10 other founders. Share updates, get feedback, and keep each other accountable."
             />
             <FeatureCard 
               icon={<Target className="w-8 h-8 text-accent" />}
               title="Set Weekly Goals"
               description="Commit to one major public goal every week. Break it down into verifiable tasks."
             />
             <FeatureCard 
               icon={<Activity className="w-8 h-8 text-accent" />}
               title="Track Progress"
               description="Visual progress tracking. See your streak build up and celebrate small wins."
             />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 text-muted py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="text-primary font-semibold tracking-[-0.02em]">Ziptech Labs</div>
           <p className="text-sm">© {new Date().getFullYear()} Ziptech Labs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-8 rounded-3xl bg-surface border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
  >
    <div className="mb-6 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-primary mb-3 tracking-[-0.02em]">{title}</h3>
    <p className="text-muted leading-relaxed">{description}</p>
  </motion.div>
);

export default LandingPage;
