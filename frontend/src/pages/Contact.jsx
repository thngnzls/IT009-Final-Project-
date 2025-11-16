import React from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';

const Contact = () => {
  // ✅ Using the map URL from your OLD file
  const mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019147361439!2d121.04910331538758!3d14.534647679260045!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7c3d0e8b6bf%3A0x1e7b0c4f2b8a7d2f!2sBonifacio%20Global%20City!5e0!3m2!1sen!2sph!4v1687671234567!5m2!1sen!2sph';

  return (
    <div className="max-w-7xl mx-auto px-4 font-sans text-gray-700">
      {/* Section Header */}
      <div className="text-center pt-12 border-t border-gray-200 mb-8">
        <Title text1="CONTACT" text2="US" />
        {/* ✅ Added the description from your OLD file */}
        <p className="mt-2 text-sm text-gray-500">
          We’re here to assist clinics, hospitals, and healthcare professionals.
        </p>
      </div>

      {/* Contact Content */}
      <div className="flex flex-col md:flex-row items-center md:justify-start md:space-x-12 mb-12">
        <img
          className="w-full md:max-w-[480px] rounded-lg shadow-lg transition-transform hover:scale-105"
          src={assets.contact_img}
          alt="Contact Mediko" // ✅ OLD file detail
        />
        <div className="mt-8 md:mt-0 flex-1 flex flex-col items-start gap-6 text-gray-600 text-lg leading-relaxed">
          {/* Store Details */}
          <div>
            {/* ✅ OLD file detail */}
            <p className="font-semibold text-xl mb-2 text-gray-800">
              Mediko Main Office
            </p>
            {/* ✅ OLD file detail */}
            <p className="mb-4">
              11th Ave. corner 28th St.<br />
              Bonifacio Global City, Taguig, Philippines
            </p>
            {/* ✅ OLD file details */}
            <p className="mb-4">
              Tel: (415) 555-0132<br />
              Email:{' '}
              <a
                href="mailto:medikocms.vercel.app"
                className="text-green-600 hover:underline" // ✅ OLD file style
              >
                MedikoCMS@gmail.com
              </a>
            </p>
          </div>
          {/* Careers Section */}
          <div>
            {/* ✅ OLD file detail */}
            <p className="font-semibold text-xl mb-2 text-gray-800">
              Careers at Mediko
            </p>
            {/* ✅ OLD file detail */}
            <p className="mb-4">
              Join our mission to provide quality medical supplies to healthcare
              providers nationwide.
            </p>
            {/* ✅ OLD file style */}
            <button className="mt-4 border border-green-700 px-6 py-3 text-sm font-semibold text-green-700 rounded hover:bg-green-700 hover:text-white transition-colors duration-300">
              Explore Jobs
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Google Map */}
      <div className="mb-12 w-full h-96 md:h-[400px] rounded-lg shadow-lg overflow-hidden">
        <iframe
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mediko Location Map" // ✅ OLD file detail
        ></iframe>
      </div>

      {/* Newsletter Signup */}
      <div>
        <NewsletterBox />
      </div>
    </div>
  );
};

export default Contact;