import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const TestimonialsSection = ({ testimonials, translations }) => {
  const sectionRef = useRef(null);

  return (
    <section className="py-6 sm:py-10 text-white relative overflow-hidden border-4 border-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-2 sm:mb-6 max-w-3xl mx-auto">
          <h2 className="text-sm sm:text-2xl lg:text-3xl font-bold tracking-tight font-['Titillium_Web'] text-white">
            {translations.testimonialsTitle}
          </h2>
          <p className="mt-1 sm:mt-2 text-[8px] sm:text-sm lg:text-base text-white/80 font-['Inter']">
            {translations.testimonialsSubtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="p-2 sm:p-4 rounded-lg sm:rounded-xl shadow-lg bg-transparent border-4 border-white/30 relative overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative z-10">
                <div className="flex items-start gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <motion.div 
                    className="h-4 w-4 min-w-[1rem] sm:h-8 sm:w-8 sm:min-w-[2rem] md:h-10 md:w-10 md:min-w-[2.5rem] lg:h-12 lg:w-12 lg:min-w-[3rem] rounded-lg bg-[#E10600] flex items-center justify-center shrink-0 shadow-lg"
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <testimonial.icon className="h-2 w-2 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-white" />
                  </motion.div>
                  
                  <motion.h3 
                    className="text-[9px] sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold font-['Titillium_Web'] flex-grow pt-0.5 sm:pt-0 text-white"
                    animate={{
                      textShadow: [
                        "0 0 0px rgba(255,255,255,0)",
                        "0 0 2px rgba(255,255,255,0.5)",
                        "0 0 0px rgba(255,255,255,0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {testimonial.name}
                  </motion.h3>
                </div>
                
                <div className="pl-[calc(1rem+4px)] sm:pl-[calc(2rem+8px)] md:pl-[calc(2.5rem+8px)] lg:pl-[calc(3rem+8px)]">
                  <p className="text-white/80 font-['Inter'] text-[8px] sm:text-xs md:text-sm lg:text-base leading-tight sm:leading-snug md:leading-normal">
                    {testimonial.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-4 sm:mt-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link
            href="/testimonials"
            className="inline-block bg-[#E10600] hover:bg-[#E10600]/90 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base transition-colors border-4 border-white/30"
          >
            {translations.testimonialsCTA}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 