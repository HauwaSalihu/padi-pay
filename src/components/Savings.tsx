import React from 'react'
import Image from 'next/image';

type Props = {}

function Savings({}: Props) {
  return (
    <div className='pt-28 bg-white pb-24 container mx-auto '>
        <div className='flex flex-col md:flex-row gap-20 m-5'>
            <h1 className='font-bold text-5xl tracking-[-1%] w-full md:w-[50%] text-[#181B25]'>Save Smarter and Build your Finances</h1>
            <p className='font-medium text-xl tracking-[-1.5%] w-full md:w-[50%] text-[#2B303B]'>Build the habit of saving with less effort and more results. Whether you're planning for emergencies, travel, rent, or long-term goals, our platform offers flexible saving options designed around your lifestyle while you earn more</p>
        </div>
        <div className='flex flex-col md:flex-row gap-10 mt-10 m-5'>
          <div className='bg-[#F0F7FF] border-[#F5F7FA] flex flex-col gap-5 border rounded-2xl px-5 pt-5 pb-0 relative'>
            <div className='flex flex-col gap-6'>
              <h2 className='font-bold text-3xl tracking-[-0.5%] text-[#181B25]'>Fixed Savings</h2>
              <p className='font-normal text-lg text-[#2B303B]'>Lock your funds, save with disciple and earn interest on your savings</p>
            </div>
            <div className="flex justify-end w-full">
              <Image src="/Group 284.png" alt='fixed' width={250} height={250} className="object-contain max-w-full" />
            </div>
          </div>
          {/*  */}
          <div className='bg-[#FFF9F0] border-[#F5F7FA] flex flex-col gap-5 border rounded-2xl px-5 pt-5 pb-0  relative'>
            <div className='flex flex-col gap-6'>
              <h2 className='font-bold text-3xl tracking-[-0.5%] text-[#181B25]'>Target Savings</h2>
              <p className='font-normal text-lg text-[#2B303B]'>Set your financial goals and reach them by saving daily, weekly, or monthly </p>
            </div>
            <div className="flex justify-end w-full">
              <Image src="/Group 283.png" alt='fixed' width={250} height={250} className="object-contain max-w-full" />
            </div>
          </div>
          {/*  */}
          <div className='bg-[#F7F5FF] border-[#F5F7FA] flex flex-col gap-5 border rounded-2xl px-5 pt-5 pb-0 relative'>
            <div className='flex flex-col gap-6'>
              <h2 className='font-bold text-3xl tracking-[-0.5%] text-[#181B25]'>Spend & Save</h2>
              <p className='font-normal text-lg text-[#2B303B]'>Turn your expenses into income by saving a percentage every time you spend</p>
            </div>
            <div className="flex justify-end w-full">
              <Image src="/Group 289.png" alt='fixed' width={250} height={250} className="object-contain max-w-full" />
            </div>
          </div>
        </div>
    </div>
  )
}

export default Savings