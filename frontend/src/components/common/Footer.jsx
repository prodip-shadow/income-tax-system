import { Link } from "react-router";

import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        {/* Brand */}
        <div>
          <Logo />

          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
            A secure platform to manage income, expenses, tax calculations
            and tax filings with confidence.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Quick Links
          </h3>

          <div className="mt-4 space-y-3">
            <Link
              to="/"
              className="block text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              Home
            </Link>

            <Link
              to="/login"
              className="block text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="block text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Resources
          </h3>

          <div className="mt-4 space-y-3 text-sm text-slate-500">
            <p>Privacy Policy</p>
            <p>Terms & Conditions</p>
            <p>Documentation</p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          © 2026 IncomeTax. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;