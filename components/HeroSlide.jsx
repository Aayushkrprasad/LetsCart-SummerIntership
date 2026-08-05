'use client'

import Image from "next/image";
import { ArrowRightIcon, ChevronRightIcon } from "lucide-react";

const HeroSlide = ({ slide }) => {
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6; // max 6 degrees tilt
    const rotateY = ((x - centerX) / centerX) * 6;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    card.style.transition = "none";
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    card.style.transition = "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)";
  };

  const handleMouseEnter = (e) => {
    const card = e.currentTarget;
    card.style.transition = "transform 0.15s ease-out";
  };

  return (
    <div className="w-full p-2">

      {/* Hero Banner with 3D Tilt Effect */}
      <div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        className={`relative flex flex-col ${slide.bg} rounded-3xl xl:min-h-[500px] group shadow-xl transition-all duration-300 overflow-hidden select-none cursor-pointer`}
        style={{ transformStyle: "preserve-3d", transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)" }}
      >
        <div className="p-5 sm:p-16" style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}>

          <div className="inline-flex items-center gap-3 bg-green-300 text-green-700 pr-4 p-1 rounded-full text-xs sm:text-sm">
            <span className="bg-green-600 text-white px-3 py-1 rounded-full">
              {slide.badge}
            </span>

            {slide.offer}

            <ChevronRightIcon
              size={16}
              className="group-hover:ml-2 transition-all"
            />
          </div>

          <h2 className="text-3xl sm:text-5xl leading-[1.2] my-4 font-medium text-slate-800">
            {slide.title}
            <br />
            <span className="text-green-500">
              {slide.subtitle}
            </span>
          </h2>

          <div className="text-slate-800 text-sm font-medium mt-6">
            <p>Starts from</p>
            <p className="text-3xl font-bold">
              {slide.price}
            </p>
          </div>

          <button className="bg-slate-800 text-white py-3 px-8 mt-8 rounded-lg hover:bg-black transition">
            {slide.button}
          </button>

        </div>

        <div 
          className="sm:absolute bottom-0 right-0 md:right-10 w-full sm:max-w-sm pointer-events-none transition-transform duration-300 group-hover:scale-105"
          style={{ transform: "translateZ(70px)", transformStyle: "preserve-3d" }}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            width={500}
            height={500}
            className="w-full h-auto object-contain animate-float-3d"
          />
        </div>
      </div>

      {/* ===========================================================
          RIGHT CARDS (TEMPORARILY DISABLED)
          We'll use these later as separate homepage sections.
      ============================================================ */}

      {/*
      <div className="flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm">

        <div className="flex-1 flex items-center justify-between bg-orange-200 rounded-3xl p-6 group">

          <div>
            <p className="text-3xl font-medium">
              {slide.card1Title}
            </p>

            <p className="flex items-center gap-1 mt-4">
              View more

              <ArrowRightIcon
                size={18}
                className="group-hover:ml-2 transition-all"
              />

            </p>

          </div>

          <Image
            src={slide.card1Image}
            alt=""
            className="w-36"
          />

        </div>

        <div className="flex-1 flex items-center justify-between bg-blue-200 rounded-3xl p-6 group">

          <div>
            <p className="text-3xl font-medium">
              {slide.card2Title}
            </p>

            <p className="flex items-center gap-1 mt-4">
              View more

              <ArrowRightIcon
                size={18}
                className="group-hover:ml-2 transition-all"
              />

            </p>

          </div>

          <Image
            src={slide.card2Image}
            alt=""
            className="w-36"
          />

        </div>

      </div>
      */}

    </div>
  );
};

export default HeroSlide;