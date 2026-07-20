'use client'

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import HeroSlide from "./HeroSlide";
import { heroSlides } from "./HeroData";
import CategoriesMarquee from "./CategoriesMarquee";

const Hero = () => {
  return (
    <div className="px-4 lg:px-6">

      {/* <div className="max-w-7xl mx-auto my-10"> */}
      <div className="w-full mx-auto my-10">

        {/* <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
        > */}

        <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={1}
            spaceBetween={0}
            centeredSlides={true}
            grabCursor={true}
            loop={true}
            speed={900}
            autoplay={{
                delay: 4500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            }}
            pagination={{
                clickable: true,
            }}
>
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <HeroSlide slide={slide} />
            </SwiperSlide>
          ))}
        </Swiper>

      </div>

      <CategoriesMarquee />

    </div>
  );
};

export default Hero;