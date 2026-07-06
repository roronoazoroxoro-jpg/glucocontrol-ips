import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Footer } from "@/components/Footer";

export default function RegistroPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate-500">Cargando...</div>}>
        <AuthForm mode="register" />
      </Suspense>
      <Footer />
    </div>
  );
}
