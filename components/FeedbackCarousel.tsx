'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Feedback = {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

const FeedbackCarousel = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch('/api/admin/feedback', { method: 'GET' });
        const data = await res.json();
        setFeedbacks(data.data || []);
      } catch (error) {
        console.error('Failed to fetch feedbacks', error);
      }
    };

    fetchFeedbacks();
  }, []);

  // Auto-play every 5s
  useEffect(() => {
    if (isPaused || feedbacks.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % feedbacks.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, feedbacks.length]);

  const truncateMessage = (msg: string, maxLength: number = 160) =>
    msg.length <= maxLength ? msg : msg.slice(0, maxLength) + '...';

  if (feedbacks.length === 0) return null;

  const currentFeedback = feedbacks[currentIndex];

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
            What Our Users Say
          </h2>
          <p className="text-slate-400 text-lg font-light">Real feedback from real users</p>
        </div>

        {/* Feedback Card */}
        <div className="relative group">
          {/* Gradient Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 via-cyan-600/20 to-teal-600/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Card Container */}
          <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 overflow-hidden border border-teal-500/30 group-hover:border-teal-400/60 transition-colors duration-300">
            
            {/* Decorative Elements */}
            <div className="absolute top-6 left-8 text-7xl text-teal-400/10 select-none font-serif">"</div>
            <div className="absolute bottom-6 right-8 text-7xl text-cyan-400/10 select-none font-serif">"</div>

            {/* Animated Feedback Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeedback._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
              >
                {/* Message */}
                <p className="text-lg md:text-xl text-slate-200 italic text-center mb-8 break-words font-light leading-relaxed">
                  "{truncateMessage(currentFeedback.message)}"
                </p>

                {/* User Info */}
                <div className="text-center space-y-2">
                  <p className="font-semibold text-slate-100 text-lg">
                    {currentFeedback.name}
                  </p>
                  <p className="text-sm text-slate-400">
                    {new Date(currentFeedback.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Star Rating */}
                <div className="flex justify-center gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev - 1 + feedbacks.length) % feedbacks.length)
              }
              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 group/btn p-2 rounded-full hover:bg-teal-500/20 transition-all duration-300 z-20"
              aria-label="Previous feedback"
            >
              <svg className="w-6 h-6 text-teal-400 group-hover/btn:text-teal-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % feedbacks.length)}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 group/btn p-2 rounded-full hover:bg-teal-500/20 transition-all duration-300 z-20"
              aria-label="Next feedback"
            >
              <svg className="w-6 h-6 text-teal-400 group-hover/btn:text-teal-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Indicator Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {feedbacks.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all rounded-full ${
                  currentIndex === index
                    ? 'bg-gradient-to-r from-teal-400 to-cyan-400 w-8 h-2'
                    : 'bg-slate-700/50 w-2 h-2 hover:bg-slate-600'
                }`}
                whileHover={{ scale: 1.2 }}
                aria-label={`Go to feedback ${index + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="text-center mt-6">
            <p className="text-sm text-slate-400">
              <span className="text-teal-400 font-semibold">{currentIndex + 1}</span> of{' '}
              <span className="text-teal-400 font-semibold">{feedbacks.length}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedbackCarousel;