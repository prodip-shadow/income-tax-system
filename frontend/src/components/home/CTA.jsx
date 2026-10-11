import { Calculator, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import Container from "@/components/common/Container";

const CTA = () => {
  return (
    <section className="bg-slate-900 py-16 sm:py-20 text-white">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to calculate your tax?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Get an instant, accurate calculation breakdown based on your reported income streams, business deductions, and taxpayer profile.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12 px-6 text-base bg-white text-slate-900 hover:bg-slate-100" asChild>
              <Link to="/dashboard/tax-calculation" className='inline-flex items-center'>
                <Calculator className="mr-2 h-5 w-5 text-slate-900" />
                Start Tax Calculation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            Database-backed calculation · Immutable calculation history · Bangladesh Tax Act compliant
          </p>
        </div>
      </Container>
    </section>
  );
};

export default CTA;
