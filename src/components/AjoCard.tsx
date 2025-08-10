import React from 'react'
import Image from 'next/image'

type Props = {}

function AjoCard({}: Props) {
  return (
    <section className='bg-[#F0FFF7]' id='savings'>
      <div className='flex flex-col md:flex-row items-center justify-between gap-10 p-4 md:p-10 lg:p-20 max-w-[1440px] mx-auto'>
        <div className='flex flex-col items-center justify-center max-w-3xl gap-5 p-4'>
          <h1 className='font-bold text-2xl lg:text-5xl text-[#181B25] text-center md:text-left'>
            Àjò, Adashe, Opa, Group Contributions Made Easy
          </h1>
          <div className='font-medium text-base  lg:text-xl tracking-tighter flex flex-col gap-5 text-[#2B303B] text-center md:text-left'>
            <p>
              Start a savings group with your friends, family, or work people or join one on the app. Everybody contributes. One person collects each round. Simple.
            </p>
            <p>
              You already trust the traditional Ajo, Adashe, or Opa. We’ve made it smarter, safer, and seamless. No more stress or chasing people or risking your money. Everything is clear, easy to manage and track.
            </p>
            <b>
              No need for you to take a loan when you can easily start a contribution with others and raise money.
            </b>
          </div>
        </div>
        <div className="relative flex flex-col items-center w-full max-w-[500px]">
          <Image
            src="/ajo.png"
            alt="ajo"
            width={500}
            height={500}
            className="w-full max-w-[500px] h-auto"
            priority
          />
          <div className="absolute
          right-0 top-0 translate-x-1 -translate-y-1/4 w-full
          flex gap-20 md:gap-20  justify-center">
            <Image
              src="/ToggleCard2.png"
              alt="toggle2"
              width={200}
              height={200}
              className="w-1/3 max-w-[200px] h-auto"
            />
            <Image
              src="/ToggleCard1.png"
              alt="toggle1"
              width={200}
              height={200}
              className="w-1/3 max-w-[200px] h-auto"
            />
          </div>
          <Image
            src="/ToggleCard3.png"
            alt="toggle3"
            width={200}
            height={200}
            className="absolute -bottom-10 right-5 translate-x-1/12 w-1/3"
          />
        </div>
      </div>
      <div className='flex flex-col md:flex-row items-center mx-auto  container justify-center gap-4'>
        <div className='border-t-2 bg-[#FFFFFF] m-5 md:m-0 flex flex-col gap-5 items-center border-r-2 border-l-2 border rounded-tl-2xl rounded-tr-2xl border-[#D0FBE9] p-5'>
            <div className='flex flex-col gap-5'>
                <h2 className='font-bold text-xl tracking-[-1.5%] text-[#181B25] '>Create Your Own Group</h2>
                <p className='font-medium text-[14px] tracking-[-0.6%] text-[#181B25] '>Start a new group and invite others with a simple link. Pick how often you want to contribute, daily, weekly, or monthly. and invite others to join with your link.</p>
            </div>
            <Image src="/Group-1.png" alt='group' height={375.81} width={180}/>
        </div>
        {/*  */}
          <div className='border-t-2 bg-[#FFFFFF] m-5 md:m-0 flex flex-col gap-5 items-center border-r-2 border-l-2 border rounded-tl-2xl rounded-tr-2xl border-[#D0FBE9] p-5'>
            <div className='flex flex-col gap-5'>
                <h2 className='font-bold text-xl tracking-[-1.5%] text-[#181B25] '>Join a Contribution Group</h2>
                <p className='font-medium text-[14px] tracking-[-0.6%] text-[#181B25] '>Find a group contributing towards an amount you want and join, and when its your turn to pack, funds are paid directly to your wallet, fast and smooth.</p>
            </div>
            <Image src="/Group 287.png" alt='group' height={375.81} width={180}/>
        </div>
        {/*  */}
          <div className='border-t-2 bg-[#FFFFFF] m-5 md:m-0 flex flex-col gap-5 items-center border-r-2 border-l-2 rounded-tl-2xl rounded-tr-2xl border border-[#D0FBE9] p-5'>
            <div className='flex flex-col gap-5'>
                <h2 className='font-bold text-xl tracking-[-1.5%] text-[#181B25] '>Verified Members Only</h2>
                <p className='font-medium text-[14px] tracking-[-0.6%] text-[#181B25] '>No funny stories. Everyone joining is verified. We check their income to be sure they can pay their contributions and ensure peace of mind for everyone.</p>
            </div>
            <Image src="/Group 294.png" alt='group' height={375.81} width={180}/>
        </div>
        {/*  */}
          <div className='border-t-2 bg-[#FFFFFF] m-5 md:m-0 flex flex-col gap-5 items-center border-r-2 border-l-2 rounded-tl-2xl rounded-tr-2xl border border-[#D0FBE9] p-5'>
            <div className='flex flex-col gap-5'>
                <h2 className='font-bold text-xl tracking-[-1.5%] text-[#181B25] '>Full Transparency</h2>
                <p className='font-medium text-[14px] tracking-[-0.6%] text-[#181B25] '>You get to see who has paid, who’s next, and how much has gone in. There is no confusion as everyone in the group stays updated.</p>
            </div>
            <Image src="/Group 292.png" alt='group' height={375.81} width={180}/>
        </div>
      </div>
    </section>
  )
}

export default AjoCard