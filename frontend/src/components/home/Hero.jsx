import { ShieldCheck, Calculator, FileText } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import Container from "@/components/common/Container";

const Hero = () => {
  return (
    <section className="border-b border-slate-200 bg-white">
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">



          {/* Heading */}
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Calculate Your Income Tax
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            An automated, rule-based tax system for taxpayers in Bangladesh.
            Track your income streams, claim business deductions, calculate category-specific tax-free thresholds,
            apply investment tax rebates, and enforce area minimum tax rules accurately.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12  px-6 text-base flex items-center " asChild>
              <Link to="/dashboard/tax-calculation"  className='inline-flex items-center'>
                <Calculator className="mr-2 h-6 w-6" />
                Calculate Tax
              </Link>
            </Button>

            <Button variant="outline" size="lg" className="h-12 px-6 text-base" asChild>
              <Link to="#how-it-works" className='inline-flex items-center'>
                <FileText className="mr-2 h-5 w-5" />
                How It Works
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
