import React from 'react'
import Image from 'next/image'

type Props = {}

function CrowdFund({}: Props) {
  return (
    <div className='container mx-auto pt-24 pb-10'>
      
      {/* Header Section */}
      <div className='flex flex-col md:flex-row items-center justify-between px-4 m-5 md:px-0'>
        <h1 className='text-3xl md:text-4xl w-full md:w-[50%] font-bold mb-8'>
          Crowdfunding
        </h1>
        <p className='text-lg md:text-xl w-full md:w-[50%] text-gray-700 mb-12'>
          Join our community to fund and support innovative projects.
          Raise funds for your next big idea, or back campaigns that align with your values. It’s easy to launch, share, and support trusted initiatives that drive real impact.
        </p>
      </div>

      {/* Content Box with Background Vector Behind */}
      <div className="relative">
        {/* The vector image placed BEHIND the content */}
        <div className="absolute top-15 left-0 w-full h-full z-0 overflow-visible pointer-events-none">
          <div className="relative w-full h-full">
            <Image
              src="/Vector 19.png"
              alt="vector"
              width={400}
              height={300}
              className="absolute -bottom-16 left-1/2 -translate-x-1/2"
            />
          </div>
        </div>

        {/* Foreground Content */}
        <div className='relative z-10 grid grid-cols-1 p-6 md:p-16 rounded-3xl m-5 bg-[#FFF5F9] md:grid-cols-2 gap-10 overflow-hidden'>
          <div className='flex flex-col gap-4 w-full'>
            <h3 className='font-bold text-3xl md:text-4xl tracking-[-1%] text-[#181B25]'>
              Raise Funds for your Business
            </h3>
            <p className='text-medium text-xl text-[#2B303B] tracking-[-1.5%]'>
              Got a business idea or need support for your existing hustle? Start a crowdfunding campaign, tell your story, and let your community back you with funds, no loan, no pressure.
              Whether you're starting small or scaling big, people who believe in your vision can now chip in to help make it real.
            </p>
            <ul className='text-medium text-xl text-[#2B303B] tracking-[-1.5%] list-disc pl-5'>
              <li><b>Create your campaign:</b> Add a campaign title, amount you’re raising, short description, and any document to show your business is legit.</li>
              <li><b>Launch it:</b> Go live and let the support roll in.</li>
              <li><b>Share it:</b> Post your campaign link or let people on the app discover and support you.</li>
            </ul>
          </div>

          <div className='w-full pl-0 md:pl-10 flex justify-center'>
            <Image
              src="/medium-shot-black-woman-running-small-business 1.svg"
              alt='crowdfunding'
              height={462}
              width={526}
            />
          </div>
        </div>
      </div>

      <div className='flex flex-col md:flex-row items-center justify-between m-5 md:px-0 mt-16 gap-10'>
        <div className='flex justify-end px-30 w-full md:w-[50%]'>
          <Image src="/crowd-img.svg" alt='img' height={100} width={200} />
        </div>
        <div className='flex flex-col gap-5 w-full md:w-[50%]'>
          <h3 className='font-bold text-4xl tracking-[-1%] text-[#181B25]'>Support Vetted Businesses</h3>
          <p className='font-medium tracking-[-1.5%] text-xl'>Your support can go a long way. Discover real businesses started by real people around you, from fashion to food, tech to trade to every industry.</p>
          <p className='font-medium tracking-[-1.5%] text-xl'>Help them grow by contributing any amount to their crowdfunding campaign. You’re not just giving money, you’re helping someone’s hustle thrive.</p>
          <ul className="flex flex-col gap-4 text-lg text-[#2B303B] tracking-[-1.5%] list-disc pl-5">
            How to support:
            <li><b>Explore campaigns:</b> Browse through stories and goals that matter to you.</li>
            <li><b>Pick one:</b> Find a business you believe in.</li>
            <li><b>Support it:</b> Contribute directly from your wallet and share with others</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CrowdFund