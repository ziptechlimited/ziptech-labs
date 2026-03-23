import BackToHomeButton from '../components/BackToHomeButton';

const Contact = () => {
    return (
        <div className="min-h-screen bg-background text-text px-6 py-10">
            <div className="max-w-4xl mx-auto">
                <BackToHomeButton />
                <div className="mt-8 rounded-3xl border border-white/10 bg-surface p-8 md:p-10">
                    <div className="text-xs uppercase tracking-[0.35em] text-muted mb-4">Contact</div>
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-primary mb-5">
                        Get in Touch
                    </h1>
                    <p className="text-muted text-lg leading-relaxed mb-2">Email: ziptechlabs@gmail.com</p>
                    <p className="text-muted text-lg leading-relaxed mb-2">Phone: +234 8061938780</p>
                    <p className="text-muted text-lg leading-relaxed">Support Hours: Mon - Fri, 9:00AM - 5:00PM</p>
                </div>
            </div>
        </div>
    );
};

export default Contact;
