import {
  Wallet,
  Receipt,
  Calculator,
} from "lucide-react";

import FeatureCard from "./FeatureCard";
import Container from "@/components/common/Container";

const features = [
  {
    icon: Wallet,
    title: "Income Management",
    description:
      "Track every income source in one organized place for easier financial management.",
  },
  {
    icon: Receipt,
    title: "Expense Tracking",
    description:
      "Record and organize your expenses to keep your financial information accurate.",
  },
  {
    icon: Calculator,
    title: "Automatic Tax Calculation",
    description:
      "Calculate your tax using the configured tax rules and calculation system.",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="border-b border-slate-200 bg-slate-50"
    >
      <Container className="py-16 sm:py-20">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-emerald-600">
            Features
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything You Need
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-500 sm:text-lg">
            Simple tools designed to make income tax management easier.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              {...feature}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Features;