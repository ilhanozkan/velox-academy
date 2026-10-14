import RegisterForm from "@/components/Auth/RegisterForm";

export const metadata = {
  title: "Hesap Oluştur",
  description: "Velox Academy'de ücretsiz hesap oluşturun",
};

// `next`: where to go after signing in (set by the auth guard).
const RegisterPage = ({ searchParams }) => <RegisterForm next={searchParams?.next} />;

export default RegisterPage;
