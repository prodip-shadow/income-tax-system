import {
  Wallet,
  Receipt,
  UserRound,
  TrendingUp,
  ShieldCheck,
  History,
  Lock,
  Sliders,
} from "lucide-react";
import Container from "@/components/common/Container";

const features = [
  {
    icon: Wallet,
    title: "Income Management",
    description: "Record and categorize multiple income sources including salary, house property rent, business, agriculture, capital gains, and financial assets.",
  },
  {
    icon: Receipt,
    title: "Expense & Deduction Tracking",
    description: "Maintain comprehensive records of deductible business expenses and categorize tax-exempt financial activities.",
  },
  {
    icon: UserRound,
    title: "Taxpayer Profile System",
    description: "Store demographic information, age, gender, freedom fighter status, and location to automatically apply eligible tax benefits.",
  },
  {
    icon: TrendingUp,
    title: "Investment Tax Rebate",
    description: "Calculate allowable investment limits (15% of income up to BDT 7.5L cap) and apply allowable 10% tax rebate rates automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Minimum Tax Calculation",
    description: "Enforce area-based minimum tax requirements (Dhaka/Chattogram BDT 5,000, other city corporations BDT 4,000, outside city corporations BDT 3,000).",
  },
  {
    icon: History,
    title: "Calculation History",
    description: "Access historically immutable tax calculation logs with detailed slab breakdowns, breakdown summaries, and audit records.",
  },
  {
    icon: Lock,
    title: "Secure Authentication",
    description: "JWT-based authentication, password hashing, and role-based access control protecting user income data.",
  },
  {
    icon: Sliders,
    title: "Admin Rule Management",
    description: "Comprehensive admin portal for managing tax rules, progressive slabs, category thresholds, and minimum tax area rules.",
  },
];

const KeyFeatures = () => {
  return (
    <section className="border-b border-slate-200 bg-slate-50 py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            System Features
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Project Capabilities & Core Features
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Built specifically for Bangladesh tax processing with complete compliance, auditability, and administrative rule controls.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default KeyFeatures;
