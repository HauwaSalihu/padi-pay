import React from 'react'
import Image from 'next/image'

type Props = {}

function Footer({}: Props) {
  return (
    <footer className='flex flex-col gap-5 container mx-auto px-10 py-10 mt-10' id='footer'>
      <Image src="logo.svg" alt='logo' height={47} width={280} />
      <div className='flex flex-col md:flex-row justify-between gap-4 mt-6'>
        <p className='font-medium text-lg tracking-[-1.1%] text-[#2B303B]'>Digitizing Nigeria’s Traditional Savings Culture</p>
        <p className='font-medium text-lg tracking-[-1.1%] text-[#2B303B]'>© 2025 Padi-Pay. All rights reserved.</p>
      </div>
      <h1 className='font-bold md:text-9xl text-5xl text-center lg:text-[200px] xl:text-[250px]  tracking-[-1%] text-[#F2F5F8]'>Padi - Pay</h1>
    </footer>
  )
}

export default Footer