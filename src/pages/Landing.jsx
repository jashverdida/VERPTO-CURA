import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, MapPin, Lock, Users, Radio, Shield, Mail, Linkedin } from 'lucide-react';
import JashPhoto from '../devs/Jash.png';
import EijayPhoto from '../devs/eijay (1).png';

export default function Landing() {
  const [navActive, setNavActive] = useState(false);

  const team = [
    { name: 'Jashmine Verdida', role: 'Founder & Chief QA', photo: JashPhoto },
    { name: 'Eijay Pepito', role: 'Co-Founder & Creative Director', photo: EijayPhoto },
  ];

  const services = [
    { icon: AlertCircle, title: 'Real-Time Alerts', desc: 'Instant incident notifications to all responders' },
    { icon: MapPin, title: 'Live Mapping', desc: 'Real-time incident location tracking and visualization' },
    { icon: Lock, title: 'Secure Data', desc: 'End-to-end encrypted communication and data storage' },
    { icon: Radio, title: 'Unified Communication', desc: 'Integrated messaging and coordination platform' },
    { icon: Shield, title: 'Priority Management', desc: 'Smart triage and resource allocation system' },
    { icon: Users, title: 'Team Coordination', desc: 'Seamless collaboration across agencies' },
  ];

  const stats = [
    { number: '1,200+', label: 'Incidents Managed' },
    { number: '350+', label: 'Active Responders' },
    { number: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/cura-logo.png" alt="Project CURA Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Project CURA</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-slate-800 hover:text-emerald-600 font-medium transition">Home</a>
            <a href="#about" className="text-slate-800 hover:text-emerald-600 font-medium transition">About</a>
            <a href="#services" className="text-slate-800 hover:text-emerald-600 font-medium transition">Services</a>
            <a href="#team" className="text-slate-800 hover:text-emerald-600 font-medium transition">Team</a>
            <a href="#contact" className="text-slate-800 hover:text-emerald-600 font-medium transition">Contact</a>
          </div>

          {/* Login Button */}
          <Link
            to="/login"
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Login</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background image overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Rapid Incident Response for Safer Communities
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 font-light">
            Coordinate emergency response with real-time intelligence and unified communication
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105">
              Contact Us
            </button>
            <button className="border-2 border-white hover:bg-white hover:text-slate-900 text-white px-8 py-4 rounded-lg font-bold text-lg transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Image placeholder */}
            <div className="rounded-lg overflow-hidden h-96 bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center border border-emerald-200">
              <div className="text-center">
                <AlertCircle className="w-20 h-20 text-emerald-600 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Emergency Response Image</p>
              </div>
            </div>

            {/* Right side - Content */}
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">About Project CURA</h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Project CURA is a modern, high-tech emergency coordination platform designed to streamline multi-agency response to critical incidents. We provide real-time communication, intelligent resource allocation, and secure data management for emergency responders.
              </p>

              {/* Bullet points with icons */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-4">
                  <AlertCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-slate-900">Unified Alerts</h3>
                    <p className="text-slate-600">Instant notification system for coordinated response</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-slate-900">Live Mapping</h3>
                    <p className="text-slate-600">Real-time incident location and responder tracking</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Lock className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-slate-900">Secure Data</h3>
                    <p className="text-slate-600">Enterprise-grade encryption for all communications</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
                    <div className="text-3xl font-bold text-emerald-600">{stat.number}</div>
                    <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section id="services" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Core Services</h2>
            <p className="text-xl text-slate-600">Comprehensive tools for modern emergency coordination</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div key={idx} className="bg-white rounded-lg p-8 border border-slate-200 shadow-card hover:shadow-lg transition transform hover:-translate-y-1">
                  <Icon className="w-12 h-12 text-emerald-600 mb-4" />
                  <h3 className="text-xl font-bold text-emerald-600 mb-3">{service.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{service.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section id="team" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Team</h2>
            <p className="text-xl text-slate-600">Meet the experts behind Project CURA</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, idx) => (
              <div key={idx} className="group">
                <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  {/* Top colored accent bar */}
                  <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500"></div>

                  {/* Content */}
                  <div className="p-6 flex flex-col items-center text-center">
                    {/* Photo - Portrait style */}
                    <div className="relative mb-4 w-40 h-40 rounded-lg overflow-hidden border-2 border-emerald-100">
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>

                    {/* Role */}
                    <p className="text-sm font-semibold text-emerald-600 mb-4">{member.role}</p>

                    {/* Contact Info */}
                    <div className="w-full space-y-2 mb-6 text-sm text-slate-600">
                      <div className="flex items-center justify-center space-x-2">
                        <Mail className="w-4 h-4 text-emerald-600" />
                        <span className="truncate">
                          {member.name === 'Eijay Pepito' ? 'eijay.pepito8@gmail.com' : 'JashmineVerdida08@gmail.com'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full flex gap-3">
                      <a
                        href={member.name === 'Eijay Pepito' ? 'mailto:eijay.pepito8@gmail.com' : 'mailto:JashmineVerdida08@gmail.com'}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border-2 border-emerald-600 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition duration-300"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </a>
                      <a
                        href="#"
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition duration-300"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/Footer Section */}
      <section id="contact" className="py-20 bg-emerald-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold text-white mb-4 transition-all duration-500">Get In Touch</h2>
            <p className="text-emerald-100 text-lg mb-8 transition-all duration-500">
              Ready to transform your emergency response operations?
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Eijay Email */}
            <div className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
              <a href="mailto:eijay.pepito8@gmail.com" className="group flex flex-col items-center space-y-3 p-6 rounded-lg bg-emerald-800/50 hover:bg-emerald-700 transition duration-300 cursor-pointer">
                <Mail className="w-8 h-8 text-emerald-300 group-hover:text-white transition duration-300" />
                <span className="text-white font-semibold">Eijay Pepito</span>
                <span className="text-emerald-200 text-sm group-hover:text-white transition duration-300">eijay.pepito8@gmail.com</span>
              </a>
            </div>

            {/* Jashmine Email */}
            <div className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
              <a href="mailto:JashmineVerdida08@gmail.com" className="group flex flex-col items-center space-y-3 p-6 rounded-lg bg-emerald-800/50 hover:bg-emerald-700 transition duration-300 cursor-pointer">
                <Mail className="w-8 h-8 text-emerald-300 group-hover:text-white transition duration-300" />
                <span className="text-white font-semibold">Jashmine Verdida</span>
                <span className="text-emerald-200 text-sm group-hover:text-white transition duration-300">JashmineVerdida08@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Sponsors & Partners */}
          <div className="pt-12 border-t border-emerald-700 mb-8 animate-fade-in">
            <p className="text-emerald-200 font-semibold mb-6">Trusted by leading organizations</p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-6 py-2 border-2 border-emerald-400 text-emerald-100 rounded-full font-semibold hover:bg-emerald-800 transition-all duration-300 cursor-pointer transform hover:scale-105">
                Cebu BFP
              </div>
              <div className="px-6 py-2 border-2 border-emerald-400 text-emerald-100 rounded-full font-semibold hover:bg-emerald-800 transition-all duration-300 cursor-pointer transform hover:scale-105">
                Local LGU
              </div>
              <div className="px-6 py-2 border-2 border-emerald-400 text-emerald-100 rounded-full font-semibold hover:bg-emerald-800 transition-all duration-300 cursor-pointer transform hover:scale-105">
                Community Volunteers
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-emerald-700">
            <p className="text-emerald-200 text-sm mb-2">
              Crafted with <span className="text-red-400 animate-pulse">❤️</span> by Jashmine & Eijay
            </p>
            <p className="text-emerald-300 text-xs">&copy; 2026 Project CURA. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
