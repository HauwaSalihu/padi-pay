'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-shadow ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center backdrop-blur-md  rounded-md">
        {/* Logo */}
        <div className="flex-shrink-0">
          <a href="#home">
              <Image
            src="/logo.png"
            alt="Padi-Pay Logo"
            width={100}
            height={47}
            className="object-contai"
          />
          </a>
        
        </div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-6 font-medium items-center rounded-full text-[#181B25] md:text-[12px] lg:text-lg text-lg px-6 py-2 bg-white/40">
          <li className="cursor-pointer hover:text-[#68123D]"><a href="#savings">Savings</a></li>
          <li className="cursor-pointer hover:text-[#68123D]"><a href="#ai">AI Finance</a></li>
          <li className="cursor-pointer hover:text-[#68123D]"><a href="#footer">Contact Us</a></li>
        </ul>

        {/* CTA Button */}
        <div className="hidden md:flex">
          <button className="bg-[#68123D] py-2.5 px-6 rounded-full font-bold text-white hover:bg-[#4e0e2e] transition">
            Join Our Waitlist
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <HiOutlineX size={28} /> : <HiOutlineMenu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white/70 backdrop-blur-md py-4 px-6 flex flex-col gap-4 text-lg text-[#181B25] shadow-md">
          <a href="#savings" className="hover:text-[#68123D]">Savings</a>
          <a href="#ai" className="hover:text-[#68123D]">AI Finance</a>
          <a href="#footer" className="hover:text-[#68123D]">Contact Us</a>
          <button className="bg-[#68123D] mt-2 py-2 px-4 rounded-full font-bold text-white hover:bg-[#4e0e2e] transition">
            Join Our Waitlist
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;