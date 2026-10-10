import AuthCard from "@/components/auth/AuthCard";
import AuthFooter from "@/components/auth/AuthFooter";
import AuthHeader from "@/components/auth/AuthHeader";
import LoginForm from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <AuthCard>
      <AuthHeader
        title="Welcome Back"
        subtitle="Sign in to access your Income Tax dashboard."
      />

      <LoginForm />

      <AuthFooter
        text="Don't have an account?"
        link="/register"
        linkText="Create Account"
      />
    </AuthCard>
  );
};

export default Login;