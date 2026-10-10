import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthFooter from "@/components/auth/AuthFooter";
import RegisterForm from "@/components/auth/RegisterForm";

const Register = () => {
  return (
    <AuthCard>
      <AuthHeader
        title="Create Account"
        subtitle="Join Income Tax Filing System."
      />

      <RegisterForm />

      <AuthFooter
        text="Already have an account?"
        linkText="Sign In"
        link="/login"
      />
    </AuthCard>
  );
};

export default Register;