import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Certifcate from "@/components/Certifcate";
import AjoCard from "@/components/AjoCard";
import Savings from "@/components/Savings";
import CrowdFund from "@/components/CrowdFund";
import Invest from "@/components/Invest";
import AI from "@/components/AI";
import Last from "@/components/Last";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-[linear-gradient(180deg,_#FFCCE5_10%,_#FFF2F9_0%,_#FFFFFF_0%)] pt-[20px]">
      {/* Navbar OUTSIDE the gradient wrapper */}
      <Navbar />
      <div className="bg-[linear-gradient(180deg,_#FFCCE5_0%,_#FFF2F9_50%,_#FFFFFF_100%)] pt-[10px]">
        <Hero />
      </div>
      <Certifcate />
      <AjoCard />
      <Savings />
      <CrowdFund />
      <Invest />
      <AI />
      <Last />
      <Footer />
    </div>
  );
}
