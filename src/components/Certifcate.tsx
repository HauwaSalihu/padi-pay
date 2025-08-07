import React from 'react'
import { RiBankLine } from 'react-icons/ri';
import { PiLightning } from 'react-icons/pi';
import { GoShieldCheck } from 'react-icons/go';

type Props = {}

const Certifcate = (props: Props) => {
  return (
    <div className="m-4 sm:m-8 md:m-10">
      <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#181B25] text-center">
        Your Money Is Safe With Us
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2 sm:p-4 max-w-7xl mx-auto mt-6 sm:mt-10">
        <div className="rounded-3xl border flex flex-col items-center gap-3 sm:gap-5 justify-center p-3 sm:p-6 border-[#CACFD8]">
          <RiBankLine className="w-10 h-10 sm:w-12 sm:h-12 text-[#68123D]" />
          <h2 className="font-bold text-lg sm:text-xl text-center tracking-tight">
            CBN Verified & Regulated
          </h2>
          <p className="text-center text-sm sm:text-base">
            We're fully verified by the Central Bank of Nigeria. That means every feature on Padi-Pay is built with regulatory compliance and your financial safety in mind.
          </p>
        </div>
        <div className="rounded-3xl border flex flex-col items-center gap-3 sm:gap-5 justify-center p-3 sm:p-6 border-[#CACFD8]">
          <PiLightning className="w-10 h-10 sm:w-12 sm:h-12 text-[#68123D]" />
          <h2 className="font-bold text-lg sm:text-xl text-center tracking-tight">
            Safe, Instant Transfers
          </h2>
          <p className="text-center text-sm sm:text-base">
            Send and receive money securely across accounts, with real-time processing and fraud protection baked in. Whether it's savings or withdrawals, your money moves safely.
          </p>
        </div>
        <div className="rounded-3xl border flex flex-col items-center gap-3 sm:gap-5 justify-center p-3 sm:p-6 border-[#CACFD8]">
          <GoShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-[#68123D]" />
          <h2 className="font-bold text-lg sm:text-xl text-center tracking-tight">
            Bank-Level Data Encryption
          </h2>
          <p className="text-center text-sm sm:text-base">
            We use 256-bit SSL encryption and partner with PCI-DSS compliant processors to keep your information airtight. From your cards to your bank data—everything is encrypted and secured.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Certifcate