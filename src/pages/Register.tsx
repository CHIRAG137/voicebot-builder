import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

const Register = () => {
  return (
    <AuthLayout 
      title="Create account" 
      subtitle="Get started with your new account"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;