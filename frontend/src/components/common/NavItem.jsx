import { NavLink } from "react-router";

const NavItem = ({ to, children }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative px-1 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-emerald-600"
            : "text-slate-500 hover:text-slate-900"
        }`
      }
    >
      {children}
    </NavLink>
  );
};

export default NavItem;