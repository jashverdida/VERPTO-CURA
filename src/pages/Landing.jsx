import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, MapPin, Lock, Users, Radio, Shield, Mail, Linkedin, ChevronRight, Activity, Globe, Zap, ArrowRight, Menu, X } from 'lucide-react';
import JashPhoto from '../devs/Jash.png';
import EijayPhoto from '../devs/eijay (1).png';
import YadoPhoto from '../devs/yado_nobg.png';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Handle scroll effect for navbar and active section
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      const sections = ['home', 'about', 'services', 'team', 'contact'];
      let current = '';
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Adjust threshold to determine active section accurately
          if (rect.top <= window.innerHeight / 3 && rect.bottom >= window.innerHeight / 3) {
            current = section;
          }
        }
      }
      
      // Keep 'home' active if we are very close to top
      if (window.scrollY < 100) {
        current = 'home';
      }
      
      if (current) {
        setActiveSection(current);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const team = [
    { name: 'Eijay Pepito', role: 'Backend Engineer & Systems Architect', photo: EijayPhoto, email: 'eijay.pepito8@gmail.com', linkedin: 'https://www.linkedin.com/in/eijay-pepito-98b538355/' },
    { name: 'Jashmine Verdida', role: 'Chief QA & Frontend Engineer', photo: JashPhoto, email: 'jashmineverdida08@gmail.com', linkedin: 'https://www.linkedin.com/in/jashmine-verdida-820a56352/' },
    { name: 'Lord Christian Beligaño', role: 'AI/ML Engineer', photo: YadoPhoto, email: 'lordchristian88@gmail.com', linkedin: 'https://www.linkedin.com/in/beliga%C3%B1o-lord-christian-64484524a/' },
  ];

  const services = [
    { icon: AlertCircle, title: 'Real-Time Alerts', desc: 'Instant incident notifications dispatched globally within milliseconds.', colSpan: 'col-span-1 md:col-span-2' },
    { icon: MapPin, title: 'Live Mapping', desc: 'High-precision real-time incident visualization and tracking.', colSpan: 'col-span-1 md:col-span-1' },
    { icon: Lock, title: 'Secure Data', desc: 'Enterprise-grade end-to-end encryption for all operational intel.', colSpan: 'col-span-1 md:col-span-1' },
    { icon: Radio, title: 'Unified Comms', desc: 'Multi-agency integrated messaging and coordination.', colSpan: 'col-span-1 md:col-span-2' },
    { icon: Shield, title: 'Priority Management', desc: 'Smart triage powered by intelligent resource allocation systems.', colSpan: 'col-span-1 md:col-span-2' },
    { icon: Users, title: 'Team Sync', desc: 'Seamless cross-agency collaboration and deployment.', colSpan: 'col-span-1 md:col-span-1' },
  ];

  const stats = [
    { number: '1,200+', label: 'Incidents Managed', prefix: '' },
    { number: '350+', label: 'Active Responders', prefix: '' },
    { number: '99.9', label: 'System Uptime', prefix: '%' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter selection:bg-emerald-500/30 overflow-hidden">
      
      {/* Floating Glass Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-500 pt-4 px-4 sm:px-6 lg:px-8 ${scrolled ? 'py-2' : 'py-6'}`}>
        <div className={`max-w-7xl mx-auto rounded-2xl transition-all duration-500 border border-white/5 ${
            scrolled ? 'bg-slate-950/70 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] py-3 px-6' : 'bg-transparent py-4 px-2'
          }`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="#home" className="flex items-center space-x-3 group cursor-pointer">
              <img 
                src="/cura-logo.png" 
                alt="CURA Logo" 
                className="h-10 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300" 
              />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">CURA</span>
            </a>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-1 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-sm">
              {['Home', 'About', 'Services', 'Team', 'Contact'].map((item) => {
                const sectionId = item.toLowerCase();
                const isActive = activeSection === sectionId;
                return (
                  <a 
                    key={item} 
                    href={`#${sectionId}`} 
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? 'text-emerald-400 bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]' 
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item}
                  </a>
                );
              })}
            </div>

            {/* Login Button */}
            <div className="hidden md:flex">
              <Link
                to="/login"
                className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-emerald-600 font-pj rounded-xl hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 ring-offset-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full -ml-20 group-hover:ml-0 transition-all duration-500 ease-out bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 blur-lg opacity-50"></div>
                <span className="relative flex items-center gap-2">
                  Login <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-slate-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl pt-32 px-6 flex flex-col space-y-6 text-center">
          {['Home', 'About', 'Services', 'Team', 'Contact'].map((item) => {
             const sectionId = item.toLowerCase();
             const isActive = activeSection === sectionId;
             return (
               <a 
                 key={item} 
                 href={`#${sectionId}`} 
                 onClick={() => setMobileMenuOpen(false)}
                 className={`text-2xl font-bold transition-colors ${
                   isActive ? 'text-emerald-400' : 'text-slate-300 hover:text-white hover:text-emerald-400'
                 }`}
               >
                 {item}
               </a>
             );
          })}
          <Link
             to="/login"
             onClick={() => setMobileMenuOpen(false)}
             className="mt-8 bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
             Login
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Abstract Background Effects */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] mix-blend-screen animate-blob pointer-events-none" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Content */}
          <div className="text-left space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              System Live & Operational
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Rapid Response <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Reimagined.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed font-light">
              Coordinate multi-agency emergency operations with real-time intelligence, unified communication, and pinpoint accuracy.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <a href="#contact" className="group relative flex-1 min-w-[180px] px-8 py-4 bg-white text-slate-950 font-bold rounded-xl overflow-hidden hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300 text-center">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Authenticate Operator <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-emerald-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>

              <a href="#about" className="flex-1 min-w-[160px] px-8 py-4 rounded-xl font-semibold text-white border border-white/10 hover:bg-white/5 backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-2 group text-center">
                <Globe className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" /> Explore Features
              </a>
            </div>
          </div>

          {/* Hero Visual - Dashboard Mockup */}
          <div className="relative hidden lg:block animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-2xl blur-3xl opacity-20 pointer-events-none"></div>
            <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden transform rotate-y-[-10deg] rotate-x-[5deg] scale-105 transition-transform hover:scale-110 duration-700 pointer-events-none">
              {/* Mockup Header */}
              <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-slate-800/50">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              {/* Mockup Body */}
              <div className="p-6 grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-4">
                  <div className="h-32 rounded-lg bg-slate-800/80 border border-white/5 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-emerald-500/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 rounded-lg bg-emerald-900/30 border border-emerald-500/20 p-4">
                      <div className="w-8 h-2 bg-emerald-400/50 rounded mb-4"></div>
                      <div className="w-16 h-4 bg-white/20 rounded"></div>
                    </div>
                    <div className="h-24 rounded-lg bg-red-900/30 border border-red-500/20 p-4">
                      <div className="w-8 h-2 bg-red-400/50 rounded mb-4"></div>
                      <div className="w-16 h-4 bg-white/20 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-16 rounded-lg bg-slate-800/80 border border-white/5"></div>
                  <div className="h-16 rounded-lg bg-slate-800/80 border border-white/5"></div>
                  <div className="h-20 rounded-lg bg-slate-800/80 border border-white/5"></div>
                </div>
              </div>
              
              {/* Floating UI Element */}
              <div className="absolute -right-12 top-24 bg-slate-800/90 backdrop-blur-md border border-emerald-500/30 p-4 rounded-xl shadow-xl animate-blob" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Status</div>
                    <div className="text-sm font-bold text-white">All Systems Nominal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-20 -mt-20 border-y border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {stats.map((stat, idx) => (
              <div key={idx} className="py-12 flex flex-col items-center justify-center text-center group">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}<span className="text-emerald-500">{stat.prefix}</span>
                </div>
                <div className="text-sm tracking-widest text-slate-400 uppercase font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl transform rotate-3 scale-105 opacity-20 group-hover:rotate-6 transition-all duration-500"></div>
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900 aspect-square flex flex-col justify-center items-center p-8 text-center transition-transform duration-500 group-hover:-translate-y-2">
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
                  <Zap className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Built for the Critical Path</h3>
                <p className="text-slate-400 leading-relaxed">
                  Project CURA replaces fragmented communication channels with a unified, encrypted platform built explicitly for high-stress emergency response environments.
                </p>
                <div className="mt-8 p-4 rounded-xl bg-slate-950/50 border border-white/5 w-full">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400">Response Time Improvement</span>
                    <span className="text-emerald-400 font-bold">+40%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-sm font-bold tracking-widest text-emerald-500 uppercase mb-3">About Project CURA</h2>
                <h3 className="text-4xl font-bold text-white leading-tight mb-6">
                  Next-generation intelligence for first responders.
                </h3>
                <p className="text-lg text-slate-400 leading-relaxed font-light">
                  We engineered CURA to be the central nervous system of emergency management. By integrating live telemetry, inter-agency comms, and predictive triage, we give responders the clarity they need to act decisively.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { title: 'Unified Alerts', desc: 'Break down silos with a single source of truth.' },
                  { title: 'Live Mapping', desc: 'Track assets and incidents in real-time.' },
                  { title: 'Secure Protocol', desc: 'Military-grade encryption for sensitive data.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="mt-1 w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-colors">
                      <ChevronRight className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1 group-hover:text-emerald-400 transition-colors">{item.title}</h4>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section (Bento Grid) */}
      <section id="services" className="py-32 relative bg-slate-900 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold tracking-widest text-emerald-500 uppercase mb-3">Core Capabilities</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Command and Control, Elevated.</h3>
            <p className="text-lg text-slate-400">Everything required to orchestrate complex emergency operations seamlessly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div 
                  key={idx} 
                  className={`${service.colSpan} group relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 p-8 hover:border-emerald-500/30 transition-all duration-500`}
                >
                  {/* Spotlight Hover Effect Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center mb-auto group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-500">
                      <Icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{service.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{service.desc}</p>
                    </div>
                  </div>
                  
                  {/* Glow orb */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold tracking-widest text-emerald-500 uppercase mb-3">Architects</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white">The Minds Behind CURA</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {team.map((member, idx) => (
              <div key={idx} className="group relative">
                {/* Animated Border Gradient */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-3xl opacity-20 group-hover:opacity-100 transition duration-500 blur pointer-events-none"></div>

                <div className="relative bg-slate-900 border border-white/10 rounded-2xl overflow-hidden h-full">
                  <div className="p-8 flex flex-col items-center text-center h-full">
                    {/* Avatar */}
                    <div className="relative mb-6 w-36 h-36 rounded-full overflow-hidden border-4 border-slate-800 group-hover:border-emerald-500/50 transition-colors duration-500">
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter grayscale group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-slate-800 flex items-center justify-center">
                          <span className="text-3xl font-black text-emerald-300">{member.initials}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-emerald-400 font-medium mb-6 uppercase tracking-wider text-xs">{member.role}</p>

                    {/* Links */}
                    <div className="flex gap-4 w-full mt-auto">
                      <a href={`mailto:${member.email}`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-emerald-600 transition-colors duration-300">
                        <Mail className="w-4 h-4" /> Email
                      </a>
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-blue-600 transition-colors duration-300">
                        <Linkedin className="w-4 h-4" /> LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dedicated Contact Section */}
      <section id="contact" className="py-32 relative bg-slate-900 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-emerald-500 uppercase mb-3">Initiate Contact</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Secure Comms Channel.</h3>
              <p className="text-lg text-slate-400 leading-relaxed font-light mb-8">
                Request access, schedule a demonstration, or contact our technical dispatch team for integration inquiries.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Direct Dispatch</h4>
                    <p className="text-slate-400 text-sm">dispatch@projectcura.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Command Center</h4>
                    <p className="text-slate-400 text-sm">Cebu City, Philippines</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
              <div className="relative bg-slate-950 border border-white/10 rounded-2xl p-8 shadow-xl">
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operator Name</label>
                      <input type="text" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agency/Org</label>
                      <input type="text" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" placeholder="Cebu BFP" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Secure Email</label>
                    <input type="email" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" placeholder="operator@agency.gov" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transmission</label>
                    <textarea rows="4" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none" placeholder="Enter your message..."></textarea>
                  </div>
                  <button type="button" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2">
                    Transmit Message <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-slate-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Project CURA
            </div>
            <p>by VERPTO &copy; 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
