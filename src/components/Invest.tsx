import React from 'react'
import Image from 'next/image'

type Props = {}

const Invest = (props: Props) => {
  return (
    <div className="bg-[#F5F7FA] flex flex-col md:flex-row rounded-3xl container mx-auto ">
      <div className="flex flex-col items-center justify-between w-full md:w-[50%] gap-40 p-4 md:p-10 lg:p-20 max-w-[1440px] mx-auto">
        <h1 className="font-bold text-4xl text-[#181B25] tracking-[-1%]">
          Invest & Grow Your Money With Confidence
        </h1>
        <p className="font-medium tracking-[-1.5%] text-xl text-[#2B303B]">
          Browse investment options matched to your risk appetite. Track performance, diversify your portfolio, and unlock wealth-building opportunities, all from your dashboard. It’s investing made simple, smart, and secure.
        </p>
      </div>
      {/* Images Section */}
      <div className="w-full md:w-[50%] h-[100%] hidden md:flex flex-row items-stretch relative justify-between gap-4 mt-10 md:mt-0">
        {/* First Image: align to top */}
        <div className="flex flex-col justify-start absolute top-20 w-1/2">
          <div className="relative w-full h-[40vw] max-w-[328px] min-h-[180px] md:h-[350px] lg:h-[620px]"  >
            <Image
              src="/Group 298.png"
              alt="savings"
              fill
              className="object-contain img-fluid"
             
            />
          </div>
        </div>
        {/* Second Image: align to bottom */}
        <div className="flex flex-col justify-end absolute -bottom-[420px] left-40 w-1/2">
          <div className="relative w-full h-[40vw] max-h-[620px] min-h-[180px] md:h-[350px] lg:h-[620px]">
            <Image
              src="/Group 299.png"
              alt="savings"
              fill
              className="object-contain img-fluid"
           
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Invest