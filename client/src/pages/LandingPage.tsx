import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Users, Target, Activity } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          <span className="text-blue-600">Ziptech</span> Labs
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium">Log In</Link>
          <Link to="/register" className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
            Build Faster. <br/>
            <span className="text-blue-600">Ship Together.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            The ultimate accountability platform for builders and founders. 
            Join a cohort, set weekly goals, and verify your progress with peers.
          </p>
          <div className="flex gap-4">
            <Link to="/register" className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25">
              Join a Cohort <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#how-it-works" className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-all">
              Learn More
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
           <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                 <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Target className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-900">Weekly Goal</h3>
                    <p className="text-slate-500 text-sm">Ship MVP Landing Page</p>
                 </div>
                 <div className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    IN PROGRESS
                 </div>
              </div>
              
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-slate-300" />
                    <span className="text-slate-500 line-through">Design Hero Section</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-slate-800 font-medium">Implement Auth Flow</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>
                    <span className="text-slate-400">Deploy to Vercel</span>
                 </div>
              </div>
           </div>
        </motion.div>
      </header>

      {/* Features */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Simple, effective, and distraction-free. Focus on what matters: shipping.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             <FeatureCard 
               icon={<Users className="w-8 h-8 text-indigo-600" />}
               title="Join a Cohort"
               description="Group up with 5-10 other founders. Share updates, get feedback, and keep each other accountable."
             />
             <FeatureCard 
               icon={<Target className="w-8 h-8 text-blue-600" />}
               title="Set Weekly Goals"
               description="Commit to one major public goal every week. Break it down into verifiable tasks."
             />
             <FeatureCard 
               icon={<Activity className="w-8 h-8 text-emerald-600" />}
               title="Track Progress"
               description="Visual progress tracking. See your streak build up and celebrate small wins."
             />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="text-white font-bold text-xl">Ziptech Labs</div>
           <p className="text-sm">© {new Date().getFullYear()} Ziptech Labs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all"
  >
    <div className="mb-6 bg-white w-16 h-16 rounded-xl flex items-center justify-center shadow-sm">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </motion.div>
);

export default LandingPage;
