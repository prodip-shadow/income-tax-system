import { Outlet } from "react-router";

const AuthLayout = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full">
        <Outlet />
      </div>
    </main>
  );
};

export default AuthLayout;