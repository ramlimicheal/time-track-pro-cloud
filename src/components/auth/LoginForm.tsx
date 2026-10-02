import { AuthForm } from "./AuthForm";

// Legacy callers now use the same server-backed authentication.
export function LoginForm(_props: { userType: "employee" | "admin" }) {
  return <AuthForm />;
}
