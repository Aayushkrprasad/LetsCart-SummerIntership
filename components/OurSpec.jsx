import React from 'react'
import Title from './Title'
import { ourSpecsData } from '@/assets/assets'

const OurSpecs = () => {
    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -12; // tilt max 12 degrees
        const rotateY = ((x - centerX) / centerX) * 12;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.transition = "none";
    };

    const handleMouseLeave = (e) => {
        const card = e.currentTarget;
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        card.style.transition = "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
    };

    const handleMouseEnter = (e) => {
        const card = e.currentTarget;
        card.style.transition = "transform 0.15s ease-out";
    };

    return (
        <div className='px-6 my-20 max-w-6xl mx-auto'>
            <Title visibleButton={false} title='Our Specifications' description="We offer top-tier service and convenience to ensure your shopping experience is smooth, secure and completely hassle-free." />

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 gap-y-10 mt-26'>
                {
                    ourSpecsData.map((spec, index) => {
                        return (
                            <div 
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                onMouseEnter={handleMouseEnter}
                                className='relative h-44 px-8 flex flex-col items-center justify-center w-full text-center border rounded-2xl group shadow-sm transition-all duration-300 select-none cursor-pointer' 
                                style={{ 
                                    backgroundColor: spec.accent + '0d', // 5% opacity
                                    borderColor: spec.accent + '33',     // 20% opacity
                                    transformStyle: "preserve-3d",
                                    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
                                }} 
                                key={index}
                            >
                                <h3 className='text-slate-800 dark:text-slate-200 font-bold tracking-wide' style={{ transform: "translateZ(20px)" }}>{spec.title}</h3>
                                <p className='text-sm text-slate-600 dark:text-slate-400 mt-3 font-medium' style={{ transform: "translateZ(10px)" }}>{spec.description}</p>
                                <div 
                                    className='absolute -top-5 text-white size-12 flex items-center justify-center rounded-2xl transition duration-300' 
                                    style={{ 
                                        backgroundColor: spec.accent,
                                        transform: "translateZ(40px)",
                                        boxShadow: `0 10px 20px -5px ${spec.accent}66`
                                    }}
                                >
                                    <spec.icon size={22} />
                                </div>
                            </div>
                        )
                    })
                }
            </div>

        </div>
    )
}

export default OurSpecs