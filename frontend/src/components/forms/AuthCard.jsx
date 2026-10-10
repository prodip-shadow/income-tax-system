const AuthCard = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {subtitle}
        </p>
      </div>

      {children}
    </div>
  );
};

export default AuthCard;