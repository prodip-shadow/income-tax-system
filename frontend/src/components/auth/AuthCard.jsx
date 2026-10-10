const AuthCard = ({ children }) => {
  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {children}
    </div>
  );
};

export default AuthCard;