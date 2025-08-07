import React from 'react'
import { GoDotFill } from 'react-icons/go';
import Image from 'next/image';

type Props = {}

function AI({}: Props) {
  return (
    <div className='flex flex-col container mx-auto' id='ai'>
        <div className='flex flex-col md:flex-row items-center justify-center gap-10 container mx-auto pt-28 pb-24 px-5'>
            <h2 className='tracking-[-1%] md:w-[50%] font-bold text-5xl text-[#181B25]'>
                AI-powered Financial Guidance
            </h2>
            <p className='tracking-[-1.5%] md:w-[50%] font-medium text-xl text-[#2B303B]'>
                Our AI helps you make smarter money decisions by analyzing your unique financial habits. Get real-time, personalized tips for saving more, investing wisely, managing debt, and planning for taxes, so you can build the future you want.
            </p>
        </div>
        <div className='bg-[#F5F7FA] rounded-3xl container p-6 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10'>
            <div className='grid grid-cols-1 md:grid-cols-2 items-center w-full md:w-[70%] justify-between gap-10'>
               <div className='flex flex-col  justify-center gap-5'>
                 <div className='rounded-4xl h-10 w-10 border-4 border-[#FFEBF4] bg-[#FFEBF4] flex flex-col items-center justify-center'>
                    <GoDotFill className='text-[#68123D] h-14 w-14' />
                </div>
                <h3 className='font-bold tracking-[-1.5%] text-2xl text-[#181B25]'>Personalized Financial  Tips</h3>
                <p className='font-medium text-[16px] tracking-[-1.1%] text-[#525866]'>Get tailored tips to improve your finances based on your unique habits. Whether you're saving, spending, or investing, our AI analyzes your activity to provide actionable advice.</p>
               </div>
               <div className='flex flex-col  justify-center gap-5'>
                 <div className='rounded-4xl h-10 w-10 border-4 border-[#EBF1FF] bg-[#EBF1FF] flex flex-col items-center justify-center'>
                    <GoDotFill className='text-[#122368] h-14 w-14' />
                </div>
                <h3 className='font-bold tracking-[-1.5%] text-2xl text-[#181B25]'>Smart Expense Tracking</h3>
                <p className='font-medium text-[16px] tracking-[-1.1%] text-[#525866]'>Track your income and expenses effortlessly with real-time analytics. Understand where your money goes and spot trends that help you take control of your financial future.</p>
               </div>
               <div className='flex flex-col  justify-center gap-5'>
                 <div className='rounded-4xl h-10 w-10 border-4 border-[#E0FAEC] bg-[#E0FAEC] flex flex-col items-center justify-center'>
                    <GoDotFill className='text-[#0B4627] h-14 w-14' />
                </div>
                <h3 className='font-bold tracking-[-1.5%] text-2xl text-[#181B25]'>Intelligent Investment Insights</h3>
                <p className='font-medium text-[16px] tracking-[-1.1%] text-[#525866]'>Not sure where to put your money? Our AI reviews your financial behavior and suggests investment opportunities that match your risk level and long-term goals—so you can grow with confidence. </p>
               </div>
               <div className='flex flex-col  justify-center gap-5'>
                 <div className='rounded-4xl h-10 w-10 border-4 border-[#EFEBFF] bg-[#EFEBFF] flex flex-col items-center justify-center'>
                    <GoDotFill className='text-[#351A75] h-14 w-14' />
                </div>
                <h3 className='font-bold tracking-[-1.5%] text-2xl text-[#181B25]'>Debt Management Support</h3>
                <p className='font-medium text-[16px] tracking-[-1.1%] text-[#525866]'>Tackle debt the smart way. Our AI analyzes your income, expenses, and liabilities to suggest realistic repayment plans, helping you pay off debt faster without overwhelming your budget.</p>
               </div>
            </div>

            <div className='w-full md:w-[30%] bg-white px-16 pt-16 pb-0 rounded-3xl flex items-center justify-center h-[300px] md:h-[500px]'>
                <Image
                  src="/Group 303.svg"
                  alt='AI'
                  width={300}
                  height={500}
                  className='object-contain h-full w-auto'
                  priority
                />
            </div>
        </div>
    </div>
  )
}

export default AI