import {
  Calculator,
  FileCheck2,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import Container from "@/components/common/Container";

const stats = [
  {
    icon: Wallet,
    value: "Income",
    title: "Track Your Income",
  },
  {
    icon: Calculator,
    value: "Tax",
    title: "Calculate Tax",
  },
  {
    icon: FileCheck2,
    value: "Filing",
    title: "Manage Tax Filing",
  },
  {
    icon: ShieldCheck,
    value: "Secure",
    title: "Protected Information",
  },
];

const Stats = () => {
  return (
    <section className="border-b border-slate-200 bg-white">
      <Container className="py-16 sm:py-20">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-emerald-600">
            Platform
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Built for Tax Management
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-500">
            Keep your financial information organized from income tracking
            to tax filing.
          </p>
        </div>

        {/* Items */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-slate-50 p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-900 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>

                <p className="mt-5 text-xl font-bold text-slate-900">
                  {item.value}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {item.title}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default Stats;