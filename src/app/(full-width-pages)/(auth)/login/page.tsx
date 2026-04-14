import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login Page",
};

export default function SignIn() {
  return <SignInForm />;
}
