import { Link } from "react-router";
import { Landmark } from "lucide-react";

const Logo = () => {
  return (
    <Link
      to="/"
      className="group flex items-center gap-3"
      aria-label="IncomeTax Filing System"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 transition-colors group-hover:bg-emerald-700">
        <Landmark className="h-5 w-5" />
      </div>

      <div className="leading-none">
        <h1 className="text-lg font-bold tracking-tight text-slate-900">
          IncomeTax
        </h1>

        <p className="mt-1 text-[11px] font-medium text-slate-500">
          Filing System
        </p>
      </div>
    </Link>
  );
};

export default Logo;