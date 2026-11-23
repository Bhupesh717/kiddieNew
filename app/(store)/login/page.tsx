import type { Metadata } from "next";
import { StoreLoginForm } from "@/components/store-login-form";

export const metadata: Metadata = {
  title: "Customer Sign In",
  description: "Sign in to your KiddieQuick customer account.",
};

export default function StoreLoginPage() {
  return <StoreLoginForm />;
}
