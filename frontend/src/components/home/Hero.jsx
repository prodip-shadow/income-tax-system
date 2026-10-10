import { ShieldCheck, Calculator, FileText } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import Container from "@/components/common/Container";

const Hero = () => {
  return (
    <section className="border-b border-slate-200 bg-white">
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Bangladesh Income Tax Calculation System
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Calculate Your Income Tax with Confidence
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            An automated, rule-based tax system for taxpayers in Bangladesh.
            Track your income streams, claim business deductions, calculate category-specific tax-free thresholds,
            apply investment tax rebates, and enforce area minimum tax rules accurately.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12 px-6 text-base" asChild>
              <Link to="/dashboard/tax-calculation">
                <Calculator className="mr-2 h-5 w-5" />
                Calculate Tax
              </Link>
            </Button>

            <Button variant="outline" size="lg" className="h-12 px-6 text-base" asChild>
              <a href="#how-it-works">
                <FileText className="mr-2 h-5 w-5" />
                How It Works
              </a>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;