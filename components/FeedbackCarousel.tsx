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
    >
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6 relative z-10">
            What Our Users Say:
          </h2>
        <div className="relative bg-white rounded-2xl shadow-xl p-8 overflow-hidden">
          {/* Decorative quotes */}
          
          <div className="absolute top-6 left-8 text-6xl text-blue-100 select-none">“</div>

          {/* Animated Feedback */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFeedback._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <p className="text-lg text-gray-700 italic text-center mb-6">
                "{truncateMessage(currentFeedback.message)}"
              </p>

              <div className="text-center">
                <p className="font-semibold text-gray-900 text-base">
                  {currentFeedback.name}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(currentFeedback.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev - 1 + feedbacks.length) % feedbacks.length)
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all"
            aria-label="Previous"
          >
            ←
          </button>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % feedbacks.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all"
            aria-label="Next"
          >
            →
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {feedbacks.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all rounded-full ${
                  currentIndex === index
                    ? 'bg-blue-600 w-6 h-2'
                    : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedbackCarousel;
