import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "შესვლა" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="adm-card w-full max-w-[380px] p-8">
        <Logo className="mb-6" />
        <h1 className="mb-5 text-[20px] font-bold">ადმინ პანელი</h1>
        <LoginForm />
      </div>
    </main>
  );
}
