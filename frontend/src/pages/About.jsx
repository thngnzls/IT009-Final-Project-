import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 font-sans text-gray-700">
      
      {/* Section Header */}
      <div className="text-3xl md:text-4xl text-center pt-12 border-t border-gray-200 mb-8">
        <Title text1="ABOUT" text2="US" />
      </div>

      {/* About Content */}
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-12 mb-16">
        <img
          className="w-full md:max-w-[450px] rounded-lg shadow-lg transition-transform hover:scale-105"
          src={assets.about_img}
          alt="About Us"
        />
        <div className="mt-8 md:mt-0 flex-1 flex flex-col justify-center gap-6 text-gray-600 text-lg leading-relaxed">
          <p>
            Sophistiqueluxe was born out of a passion for innovation and a desire to revolutionize the way people shop online. Our journey began with a simple idea: to provide a platform where customers can easily discover, explore, and purchase a wide range of products from the comfort of their homes.
          </p>
          <p>
            Since our inception, we've worked tirelessly to curate a diverse selection of high-quality products that cater to every taste and preference. Our products focus on formal attire, ensuring you look your best for every occasion. We source our collections from trusted brands and suppliers to guarantee quality and style.
          </p>
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Mission</h3>
            <p>
              Our mission at Sophistiqueluxe is to empower customers with choice, convenience, and confidence. We're dedicated to providing a seamless shopping experience that exceeds expectations, from browsing and ordering to delivery and beyond.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="text-3xl md:text-4xl text-center py-8 border-t border-gray-200 mb-12">
        <Title text1="WHY" text2="CHOOSE US" />
      </div>

      {/* Features Cards */}
      <div className="flex flex-col md:flex-row md:space-x-8 mb-20 px-4 max-w-7xl mx-auto">
        {[
          {
            title: 'Quality Assurance',
            description:
              'We meticulously select and vet each product to ensure it meets our stringent quality standards.',
          },
          {
            title: 'Convenience',
            description:
              'With our user-friendly interface and hassle-free ordering process, shopping has never been easier.',
          },
          {
            title: 'Exceptional Customer Service',
            description:
              'Our team of dedicated professionals is here to assist you the way, ensuring your satisfaction is our top priority.',
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg shadow-md p-6 mb-6 md:mb-0 flex-1 transition-transform hover:shadow-xl hover:-translate-y-1"
          >
            <h4 className="text-lg font-semibold mb-3 text-gray-800">{feature.title}</h4>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Newsletter Signup */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <NewsletterBox />
      </div>
    </div>
  )
}

export default About