'use client';

import React from 'react'
import Image from 'next/image'
import { BiTransfer, BiLineChart, BiSolidGroup } from 'react-icons/bi';
import { RiHandCoinFill } from 'react-icons/ri';
import { notification } from 'antd';



type Props = {}

const Hero = (props: Props) => {
    const [api, contextHolder] = notification.useNotification();

const openNotification = (pauseOnHover: boolean) => () => {
  api.open({
    message: 'We’re Almost Ready 🚀',
    description: (
      <div className="space-y-3">
        <p className="text-sm text-gray-700">
          Our app is currently in the final stages of development. 
          Be among the first to get exclusive early access when we launch!
        </p>
        <div>
          <button
            type="button"
            className="bg-[#68123D] py-2.5 px-6 rounded-full font-semibold text-white hover:bg-[#4e0e2e] transition"
            onClick={() =>
              window.open('https://forms.gle/tMw4ekeeRNUYehub9', '_blank', 'noopener')
            }
          >
            Join the Waitlist
          </button>
        </div>
      </div>
    ),
    showProgress: true,
    pauseOnHover,
  });
};
  return (
       <div className='flex md:mt-20 mt-10 flex-col items-center p-4' id='home'>
        <div className='lg:w-2xl'>
        <h1 className='font-bold md:text-5xl text-3xl  text-center tracking-[-1] mb-10'>Digitizing Nigeria’s Trusted Way of Saving</h1>
        <p className='font-medium text-xl tracking-[-1.5%] text-center'>Group savings, reimagined. Padi-Pay makes àjọ smarter — with AI insights, investments, crowdfunding, and seamless transfers.</p>
        </div> 
        
            {/* buttons row: add relative z-20 so it's above decorative overlays */}
            <div className="flex md:flex-row flex-col gap-10 mt-10 items-center relative z-20">
      {contextHolder}

             <button
               className="cursor-pointer"
              onClick={openNotification(true)}
             >
                <div
                className="flex max-w-48 h-12 px-3 gap-2 rounded-xl items-center justify-center bg-black text-white dark:text-black dark:bg-white sm:gap-3 sm:h-14"
                >
                <svg viewBox="0 0 384 512" className="w-5 sm:w-7">
                    <path
                    d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
                    fill="currentColor"
                    ></path>
                </svg>
                <div>
                    <div className="text-[.5rem] sm:text-xs text-left">Download on the</div>
                    <div className="text-lg font-semibold font-sans -mt-1 sm:text-2xl">
                    App Store
                    </div>
                </div>
                </div>
            </button>

            <button
              className="cursor-pointer"
              onClick={openNotification(true)}
            >
                <div
                className="flex max-w-48 h-12 px-3 gap-2 rounded-xl items-center justify-center bg-black text-white dark:text-black dark:bg-white sm:h-14"
                >
                <svg viewBox="30 336.7 120.9 129.2" className="w-5 sm:w-7">
                    <path
                    d="M119.2,421.2c15.3-8.4,27-14.8,28-15.3c3.2-1.7,6.5-6.2,0-9.7  c-2.1-1.1-13.4-7.3-28-15.3l-20.1,20.2L119.2,421.2z"
                    fill="#FFD400"
                    ></path>
                    <path
                    d="M99.1,401.1l-64.2,64.7c1.5,0.2,3.2-0.2,5.2-1.3  c4.2-2.3,48.8-26.7,79.1-43.3L99.1,401.1L99.1,401.1z"
                    fill="#FF3333"
                    ></path>
                    <path
                    d="M99.1,401.1l20.1-20.2c0,0-74.6-40.7-79.1-43.1  c-1.7-1-3.6-1.3-5.3-1L99.1,401.1z"
                    fill="#48FF48"
                    ></path>
                    <path
                    d="M99.1,401.1l-64.3-64.3c-2.6,0.6-4.8,2.9-4.8,7.6  c0,7.5,0,107.5,0,113.8c0,4.3,1.7,7.4,4.9,7.7L99.1,401.1z"
                    fill="#3BCCFF"
                    ></path>
                </svg>
                <div>
                    <div className="text-[.5rem] sm:text-xs text-left">GET IT ON</div>
                    <div className="text-sm font-semibold font-sans -mt-1 sm:text-xl">
                    Google Play
                    </div>
                </div>
                </div>
            </button>

            </div>
            {/*  */}
       


       <div className="relative"> {/* Make parent relative */}

{/* smaller screens */}

          {/* Feature Cards */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center mt-10">
            <div className="bg-white h-40 w-72 flex flex-col justify-around items-center p-6 border border-[#F2F5F8] rounded-3xl">
              <BiSolidGroup className="text-[#68123D] h-5 w-5 bg-[#FFEBF4] rounded-full p-2 h-10 w-10" />
              <p className="font-bold text-lg text-[#2B303B] text-center">Save Together with Group Savings</p>
            </div>

            <div className="bg-white h-40 w-72 flex flex-col justify-around items-center p-6 border border-[#F2F5F8] rounded-3xl">
              <div className="flex items-center justify-center rounded-full p-2 bg-[#FFEBF4] h-10 w-10">
                <BiTransfer className="text-[#68123D] h-5 w-5" />
              </div>
              <p className="font-bold text-lg text-[#2B303B] text-center">Seamless Transfers & Bill Payments</p>
            </div>

            <div className="bg-white h-40 w-72 flex flex-col justify-around items-center p-6 border border-[#F2F5F8] rounded-3xl">
              <div className="flex items-center justify-center rounded-full p-2 bg-[#FFEBF4] h-10 w-10">
                <BiLineChart className="text-[#68123D] h-5 w-5" />
              </div>
              <p className="font-bold text-lg text-[#2B303B] text-center">Find Investments & Invest With Confidence</p>
            </div>

            <div className="bg-white h-40 w-72 flex flex-col justify-around items-center p-6 border border-[#F2F5F8] rounded-3xl">
              <Image src="/Timer.png" alt="timer" width={50} height={50} />
              <p className="font-bold text-lg text-[#2B303B] text-center">AI-Powered Financial Insights</p>
            </div>

            <div className="bg-white h-40 w-72 flex flex-col justify-around items-center p-6 border border-[#F2F5F8] rounded-3xl">
              <RiHandCoinFill className="text-[#68123D] h-5 w-5 bg-[#FFEBF4] rounded-full p-2 h-10 w-10" />
              <p className="font-bold text-lg text-[#2B303B] text-center">CrowdFund for Your Business</p>
            </div>

           
          </div>
{/* ends here */}

{/* large screen view */}
 <div className="hidden xl:flex flex-row justify-around items-center max-w-screen overflow-hidden mt-10">
  <div className="w-[500px] h-[300px]  lg:relative">
    <Image
      src="/Vector 3.png"
      alt="vector"
      fill
      className="object-contain ml-86"

    />
  </div>

  <div className="w-[800px] h-[500px] relative">
    <Image
      src="/Hero-img.png"
      alt="Hero Image"
      fill
      className="object-contain ml-20"
    />
  </div>

  <div className="w-[500px] h-[300px] relative">
    <Image
      src="/Vector 4.png"
      alt="vector"
      fill
      className="object-contain -ml-80"
    />
  </div>
</div>
<div className='w-fit object-contain hidden xl:block overflow-x-hidden pointer-events-none'>

  {/* ✨ Make this absolute and position it */}
  <div className='lg:absolute top-0 left-0 w-full my-5 lg:my-0 flex justify-center'>
    <div className='lg:relative flex flex-col gap-5  lg:mt-[-8rem]'>
      <div className='bg-white h-40 w-fit flex flex-col lg:mt-50 lg:-ml-50 justify-around items-center p-6 border border-[#F2F5F8] rounded-3xl'>
        <div className="flex items-center justify-center rounded-full p-2 bg-[#FFEBF4] h-10 w-10">
          <BiTransfer className='text-[#68123D] h-5 w-5' />
        </div>
        <p className='font-bold text-lg tracking-[-1.5%] text-[#2B303B] text-center w-44'>Seamless Transfers & Bill Payments</p>
      </div>

      <div className='bg-white h-40 w-fit flex flex-col lg:-ml-50 justify-around items-center p-6 border border-[#F2F5F8] rounded-3xl lg:mt-10'>
        <div className="flex items-center justify-center rounded-full p-2 bg-[#FFEBF4] h-10 w-10">
          <BiLineChart className='text-[#68123D] h-5 w-5' />
        </div>
        <p className='font-bold text-lg text-[#2B303B] text-center w-44'>Find Investments & Invest With Confidence</p>
      </div>
{/* ÷ */}

      <div className='bg-white h-40 w-fit flex flex-col justify-around items-center p-6 border border-[#F2F5F8] rounded-3xl lg:-mt-40 lg:ml-72'>
        <Image src="/Timer.png" alt='timer' width={50} height={50} />
        <p className='font-bold text-lg text-[#2B303B] text-center w-44'>AI-Powered Financial Insights</p>
      </div>
      {/*  */}
        <div className='bg-white h-40 w-fit flex flex-col xl:absolute left-96 -translate-x-1 top-0 z-20 mt-40 justify-around items-center p-6 border border-[#F2F5F8] rounded-3xl '>
        <div className="flex items-center justify-center rounded-full p-2 bg-[#FFEBF4] h-10 w-10">
          <RiHandCoinFill className='text-[#68123D] h-5 w-5' />
        </div>
        <p className='font-bold text-lg text-[#2B303B] text-center w-44'>CrowdFund for Your Business</p>
      </div>
    </div>
  </div>
         <div className='bg-white h-40 w-fit flex flex-col lg:-mt-72 xl:absolute lg:ml-[65rem] justify-around items-center p-6 border border-[#F2F5F8] rounded-3xl '>
        <div className="flex items-center justify-center rounded-full p-2 bg-[#FFEBF4] h-10 w-10">
          <BiSolidGroup className='text-[#68123D] h-5 w-5' />
        </div>
        <p className='font-bold text-lg text-[#2B303B] text-center w-44'>Save Together with Group Savings</p>
      </div>

</div>

</div>
    </div>
  )
}

export default Hero


