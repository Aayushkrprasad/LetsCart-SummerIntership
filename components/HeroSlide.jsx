'use client'

import Image from "next/image";
import { ArrowRightIcon, ChevronRightIcon } from "lucide-react";

const HeroSlide = ({ slide }) => {
  return (
    <div className="w-full">

      {/* Hero Banner */}
      <div className={`relative flex flex-col ${slide.bg} rounded-3xl xl:min-h-[500px] group`}>
        <div className="p-5 sm:p-16">

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

          <h2 className="text-3xl sm:text-5xl leading-[1.2] my-4 font-medium">
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

        <Image
          src={slide.image}
          alt={slide.title}
          className="sm:absolute bottom-0 right-0 md:right-10 w-full sm:max-w-sm"
        />
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