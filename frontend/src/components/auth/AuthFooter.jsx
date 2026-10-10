import { Link } from "react-router";

const AuthFooter = ({
  text,
  link,
  linkText,
}) => {
  return (
    <p className="mt-6 text-center text-sm text-slate-500">
      {text}{" "}
      <Link
        to={link}
        className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
      >
        {linkText}
      </Link>
    </p>
  );
};

export default AuthFooter;