import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2">
          <Logo />
          <p className="text-sm text-stone-500">Sign in to see your codes.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
