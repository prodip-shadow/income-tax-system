import Hero from "@/components/home/Hero";
import YearwiseTaxRules from "@/components/home/YearwiseTaxRules";
import CalculationWorkflow from "@/components/home/CalculationWorkflow";
import CTA from "@/components/home/CTA";

const Home = () => {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <YearwiseTaxRules />
      <CalculationWorkflow />
      <CTA />
    </main>
  );
};

export default Home;