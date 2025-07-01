import HeroCarousel from '@/components/HeroCarousel'
import Searchbar from '@/components/Searchbar'
import Image from 'next/image'
import React from 'react'

const Home = () => {
  return (

    <>
      <section className='px-6 md:px-20 py-24'>
        <div className='flex max-xl:flex-col gap-16'>
          <div className='flex flex-col justify-center'>
            <p className='small-text'>
              Smarter buyer comes here
              <Image
                src='/assets/icons/arrow-right.svg'
                alt='arrow-right'
                width={16}
                height={16}
              />
            </p>

            <h1 className='head-text'>
              Unleash the Power of
              <span className='text-primary'> TrackTag</span>
            </h1>

            <p className='mt-6 '>
              “In a world where information is vast and constantly changing, the power no longer lies in having access to data, but in making sense of it. This system empowers online shoppers to go beyond the surface, transforming scattered prices and scattered reviews into meaningful insights, enabling smarter decisions, and ensuring that the best deals are never missed.”
            </p>

            <Searchbar/>
          </div>
          <HeroCarousel />
        </div>

      </section>
      <section className='trending-section'>
        <h2 className='section-text'>Trending</h2>

        <div className='flex flex-wrap gap-x-8 gap-y-16'>
          {['Apple Iphone 15', 'Book', 'Sneakers'].map((product) => (
            <div>{product}</div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Home