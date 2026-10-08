import LoginForm from "@/components/Auth/LoginForm";

export const metadata = {
  title: "Giriş Yap",
  description: "Velox Academy hesabınıza giriş yapın",
};

// `next`: where to go after signing in (set by the auth guard).
const LoginPage = ({ searchParams }) => <LoginForm next={searchParams?.next} />;

export default LoginPage;
