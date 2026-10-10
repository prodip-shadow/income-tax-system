import { ShieldCheck, UserCheck } from "lucide-react";
import Container from "@/components/common/Container";

const categories = [
  { name: "General", threshold: "BDT 375,000", description: "Standard individual taxpayers" },
  { name: "Women", threshold: "BDT 425,000", description: "Female individual taxpayers" },
  { name: "Senior Citizen", threshold: "BDT 425,000", description: "Taxpayers aged 65 years and above" },
  { name: "Physically Challenged", threshold: "BDT 500,000", description: "Taxpayers with registered physical disabilities" },
  { name: "Third Gender", threshold: "BDT 500,000", description: "Third gender individual taxpayers" },
  { name: "Freedom Fighter", threshold: "BDT 525,000", description: "Gazetted war-wounded freedom fighters" },
  { name: "July Warrior", threshold: "BDT 525,000", description: "Recognized July uprising participants" },
];

const BangladeshTaxFocus = () => {
  return (
    <section className="border-b border-slate-200 bg-white py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            National Tax Policy Integration
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Database-Driven Bangladesh Tax Rules
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Our platform directly integrates dynamic tax policies stored in the system database. Tax-free thresholds and slab structures automatically adapt to taxpayer profiles and assessment years.
          </p>
        </div>

        {/* Category Threshold Table / Grid */}
        <div className="mt-12">
          <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6">
            Active Taxpayer Exemption Categories (Tax Year 2026-27)
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:bg-white hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</span>
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <h4 className="mt-2 text-base font-bold text-slate-900">{cat.name}</h4>
                <p className="mt-1 text-xs text-slate-500">{cat.description}</p>
                <div className="mt-3 border-t border-slate-200 pt-2 flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-slate-500">Tax-Free:</span>
                  <span className="text-sm font-bold text-slate-900">{cat.threshold}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disability Dependent Additional Exemption */}
        <div className="mt-8 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-sm font-bold text-emerald-900">Disabled Child Dependent Exemption</h4>
            <p className="mt-0.5 text-xs text-emerald-700">
              Parents or legal guardians of disabled children receive an additional BDT 50,000 tax-free exemption per dependent.
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs">
            +BDT 50,000 / dependent
          </span>
        </div>
      </Container>
    </section>
  );
};

export default BangladeshTaxFocus;
