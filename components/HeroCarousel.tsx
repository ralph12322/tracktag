"use client";

import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";

const heroImages = [
  { imgUrl: "https://i.pinimg.com/736x/c4/95/3e/c4953e3771f301e24511610e2b595cf6.jpg", alt: "shirt" },
  { imgUrl: "https://i.pinimg.com/1200x/2e/c3/9f/2ec39f39eda5ea7089ff9ce874fd329d.jpg", alt: "bag" },
  { imgUrl: "https://i.pinimg.com/1200x/c4/19/8c/c4198cec9fb58fc37631e8128cf7af37.jpg", alt: "bottle" },
  { imgUrl: "https://i.pinimg.com/1200x/f7/38/e8/f738e817dd10e837793141266e97b940.jpg", alt: "air fryer" },
  { imgUrl: "https://i.pinimg.com/1200x/e6/49/3b/e6493b4a8530ff1ad894852c31fbade0.jpg", alt: "chair" },
];

const HeroCarousel = () => {
  return (
    <div className="relative w-full max-w-6xl mx-auto px-4">
      <Carousel
        showThumbs={false}
        autoPlay
        infiniteLoop
        interval={2500}
        showArrows={false}
        showStatus={false}
        className="w-full h-full"
      >
        {heroImages.map((image) => (
          <div
            key={image.alt}
            className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center bg-white rounded-2xl shadow-md"
          >
            <Image
              src={image.imgUrl}
              alt={image.alt}
              width={800}
              height={800}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        ))}
      </Carousel>
    </div>

  );
};

export default HeroCarousel;
