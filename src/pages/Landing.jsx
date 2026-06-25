import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, MapPin, Lock, Users, Radio, Shield, Mail, Linkedin, ChevronLeft, ChevronRight, Activity, Globe, Zap, ArrowRight, Menu, X } from 'lucide-react';
import landingVideo from '../video-assets/landing-page.mp4';
import JashPhoto from '../devs/Jash.png';
import EijayPhoto from '../devs/eijay (1).png';
import YadoPhoto from '../devs/yado_nobg.png';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const heroVideoA = useRef(null);
  const heroVideoB = useRef(null);
  const [heroActive, setHeroActive] = useState('a');
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [slideVisible, setSlideVisible] = useState(true);
  const carouselTouchStart = useRef(null);

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

  useEffect(() => {
    const a = heroVideoA.current;
    const b = heroVideoB.current;
    if (!a || !b) return;

    a.play().catch(() => {});

    let switching = false;

    const makeHandler = (current, next, activateLabel) => () => {
      if (!switching && !isNaN(current.duration) && current.duration - current.currentTime < 1) {
        switching = true;
        next.currentTime = 0;
        next.play().catch(() => {});
        setHeroActive(activateLabel);
        setTimeout(() => { switching = false; }, 1500);
      }
    };

    const handlerA = makeHandler(a, b, 'b');
    const handlerB = makeHandler(b, a, 'a');

    a.addEventListener('timeupdate', handlerA);
    b.addEventListener('timeupdate', handlerB);

    return () => {
      a.removeEventListener('timeupdate', handlerA);
      b.removeEventListener('timeupdate', handlerB);
      a.pause();
      b.pause();
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setSlideVisible(false);
      setTimeout(() => {
        setCarouselIdx((prev) => (prev + 1) % 6);
        setSlideVisible(true);
      }, 250);
    }, 5000);
    return () => clearInterval(t);
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

  const overviewSlides = [
    {
      icon: Zap,
      tag: 'Overview',
      title: 'Built for the Critical Path',
      desc: 'A unified, encrypted platform built for high-stress emergency response. Replaces fragmented communication channels with a single source of truth.',
      metric: { label: 'Response Time Improvement', value: '+40%', width: '85%' },
    },
    {
      icon: AlertCircle,
      tag: 'Alerts',
      title: 'Real-Time Alert System',
      desc: 'Incident notifications dispatched to all active responders within milliseconds of detection. Zero lag between report and response.',
      metric: { label: 'Alert Dispatch Speed', value: '<100ms', width: '95%' },
    },
    {
      icon: MapPin,
      tag: 'Mapping',
      title: 'Live Incident Mapping',
      desc: 'High-precision geospatial visualization of all active incidents, responder positions, and coverage zones across the operational area.',
      metric: { label: 'Positioning Accuracy', value: '99.8%', width: '99%' },
    },
    {
      icon: Lock,
      tag: 'Security',
      title: 'Secure Data Infrastructure',
      desc: 'Enterprise-grade end-to-end encryption for every message, alert, and packet. No sensitive intel ever transmitted in plaintext.',
      metric: { label: 'Encryption Coverage', value: '100%', width: '100%' },
    },
    {
      icon: Radio,
      tag: 'Comms',
      title: 'Unified Communications',
      desc: 'A single integrated platform for cross-agency messaging, coordination, and status updates. Eliminate radio fragmentation across agencies.',
      metric: { label: 'Inter-Agency Sync Rate', value: '+60%', width: '75%' },
    },
    {
      icon: Shield,
      tag: 'Triage',
      title: 'Smart Priority Triage',
      desc: 'Intelligent resource allocation powered by severity scoring. The right units are dispatched to the right locations every time.',
      metric: { label: 'Dispatch Accuracy', value: '97%', width: '97%' },
    },
  ];

  const changeSlide = (newIdx) => {
    setSlideVisible(false);
    setTimeout(() => {
      setCarouselIdx(newIdx);
      setSlideVisible(true);
    }, 250);
  };

  const nextCarousel = () => changeSlide((carouselIdx + 1) % overviewSlides.length);
  const prevCarousel = () => changeSlide((carouselIdx - 1 + overviewSlides.length) % overviewSlides.length);

  const onCarouselTouchStart = (e) => { carouselTouchStart.current = e.touches[0].clientX; };
  const onCarouselTouchEnd = (e) => {
    if (carouselTouchStart.current === null) return;
    const dx = carouselTouchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) dx > 0 ? nextCarousel() : prevCarousel();
    carouselTouchStart.current = null;
  };

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

          {/* Hero Visual - Video */}
          <div className="relative hidden lg:block animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-2xl blur-3xl opacity-20 pointer-events-none"></div>
            <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden scale-105 transition-transform hover:scale-110 duration-700 pointer-events-none">
              {/* Mockup Header */}
              <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-slate-800/50">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              {/* Video Body - crossfade loop */}
              <div className="relative aspect-video bg-slate-950">
                <video
                  ref={heroVideoA}
                  src={landingVideo}
                  muted
                  playsInline
                  preload="auto"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${heroActive === 'a' ? 'opacity-100' : 'opacity-0'}`}
                />
                <video
                  ref={heroVideoB}
                  src={landingVideo}
                  muted
                  playsInline
                  preload="auto"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${heroActive === 'b' ? 'opacity-100' : 'opacity-0'}`}
                />
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
            <div className="relative group select-none">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl transform rotate-3 scale-105 opacity-20 group-hover:rotate-6 transition-all duration-500 pointer-events-none"></div>
              <div
                className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900 flex flex-col transition-transform duration-500 group-hover:-translate-y-2"
                onTouchStart={onCarouselTouchStart}
                onTouchEnd={onCarouselTouchEnd}
              >
                {/* Slide content */}
                {(() => {
                  const slide = overviewSlides[carouselIdx];
                  const SlideIcon = slide.icon;
                  return (
                    <div className={`flex flex-col justify-center items-center p-8 text-center transition-all duration-300 ${slideVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                      <div className="mb-4">
                        <span className="text-xs font-bold tracking-widest text-emerald-500 uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                          {slide.tag}
                        </span>
                      </div>
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                        <SlideIcon className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{slide.title}</h3>
                      <p className="text-slate-400 leading-relaxed text-sm">{slide.desc}</p>
                      <div className="mt-6 p-4 rounded-xl bg-slate-950/50 border border-white/5 w-full">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-400">{slide.metric.label}</span>
                          <span className="text-emerald-400 font-bold">{slide.metric.value}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                            style={{ width: slide.metric.width, boxShadow: '0 0 10px rgba(16,185,129,0.8)' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Navigation bar */}
                <div className="px-8 pb-6 flex items-center justify-between gap-4">
                  <button
                    onClick={prevCarousel}
                    className="w-8 h-8 rounded-full border border-white/10 bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all duration-200 shrink-0"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex gap-1.5 items-center">
                    {overviewSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => changeSlide(i)}
                        className={`rounded-full transition-all duration-300 ${
                          i === carouselIdx
                            ? 'w-5 h-2 bg-emerald-500'
                            : 'w-2 h-2 bg-slate-600 hover:bg-slate-400'
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextCarousel}
                    className="w-8 h-8 rounded-full border border-white/10 bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all duration-200 shrink-0"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
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
