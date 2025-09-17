"use client"

import "react-responsive-carousel/lib/styles/carousel.min.css"; 
import { Carousel } from 'react-responsive-carousel';
import Image from "next/image";

const heroImages = [
  { imgUrl: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?cs=srgb&dl=pexels-madebymath-90946.jpg&fm=jpg', alt: 'smartwatch'},
  { imgUrl: 'https://m.media-amazon.com/images/I/71f5Eu5lJSL._AC_SL1500_.jpg', alt: 'bag'},
  { imgUrl: 'https://www.fishingstation.com.au/cdn/shop/files/Yeti_Rambler_36oz_1L_Reuseable_Bottle_with_Chug_Cap_-_Lowcountry_Peach_1500x.webp?v=1727931148', alt: 'lamp'},
  { imgUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D', alt: 'air fryer'},
  { imgUrl: '/assets/images/hero-5.svg', alt: 'chair'},
]

const HeroCarousel = () => {
  return (
    <div className="relative w-full max-w-[600px] h-[500px] md:h-[600px] mx-auto">
      <Carousel
        showThumbs={false}
        autoPlay={true}
        infiniteLoop={true}
        interval={2500}
        showArrows={false}
        showStatus={false}
        className="w-full h-full"
      >
        {heroImages.map((image) => (
          <div key={image.alt} className="w-full h-full flex items-center justify-center bg-white rounded-2xl shadow-md">
            <Image 
              src={image.imgUrl}
              alt={image.alt}
              width={600}
              height={600}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </Carousel>

      <Image 
        src="assets/icons/hand-drawn-arrow.svg"
        alt="arrow"
        width={175}
        height={175}
        className="max-xl:hidden absolute -top-30 -left-20 z-0"
      />
    </div>
  )
}

export default HeroCarousel;
