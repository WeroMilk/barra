"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/Auth/AuthGuard";
import LogoutButton from "@/components/Auth/LogoutButton";
import { demoAuth } from "@/lib/demoAuth";
import { movementsService } from "@/lib/movements";

export default function SetBarNamePage() {
  const [barName, setBarName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = demoAuth.getCurrentUser();
    if (user?.barName) setBarName(user.barName);
  }, []);

  const handleContinue = () => {
    const name = barName.trim();
    if (!name) {
      alert("Por favor ingresa el nombre de tu bar");
      return;
    }
    const oldName = demoAuth.getCurrentUser()?.barName ?? "";
    demoAuth.updateBarName(name);
    movementsService.add({
      type: "bar_name_change",
      bottleId: "_",
      bottleName: "Nombre del bar",
      newValue: 0,
      userName: demoAuth.getCurrentUser()?.name ?? "Usuario",
      description: oldName ? `«${oldName}» → «${name}»` : `Nombre del bar: «${name}»`,
    });
    router.push("/select-bottles");
  };

  return (
    <AuthGuard>
      <div
        className="relative min-h-[100dvh] min-h-screen bg-apple-bg p-4 flex items-center justify-center safe-area-x overflow-hidden"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Sombras naranjas con blur (mismo efecto que login) */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="login-orb-1 absolute w-[min(80vw,320px)] h-[min(80vw,320px)] rounded-full bg-[#E67E22] opacity-20 blur-[80px] -left-[10%] top-[5%]" />
          <div className="login-orb-2 absolute w-[min(60vw,260px)] h-[min(60vw,260px)] rounded-full bg-[#E67E22] opacity-25 blur-[70px] right-[0%] top-[30%]" />
          <div className="login-orb-3 absolute w-[min(70vw,280px)] h-[min(70vw,280px)] rounded-full bg-[#D35400] opacity-[0.15] blur-[90px] left-[20%] bottom-[10%]" />
          <div className="login-orb-4 absolute w-[min(50vw,220px)] h-[min(50vw,220px)] rounded-full bg-[#E67E22] opacity-20 blur-[60px] right-[15%] bottom-[25%]" />
          <div className="login-orb-5 absolute w-[min(55vw,240px)] h-[min(55vw,240px)] rounded-full bg-[#EB984E] opacity-[0.18] blur-[75px] left-[5%] top-[40%]" />
          <div className="login-orb-6 absolute w-[min(65vw,270px)] h-[min(65vw,270px)] rounded-full bg-[#D35400] opacity-[0.12] blur-[85px] right-[25%] top-[10%]" />
        </div>

        <div className="relative z-10 max-w-md w-full">
          <div className="bg-apple-surface/95 backdrop-blur-sm rounded-3xl shadow-xl border border-apple-border p-6 sm:p-8 relative">
            <div className="absolute top-4 right-4">
              <LogoutButton showText={false} />
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-semibold text-apple-text mb-2">
                Nombre de tu bar
              </h1>
              <p className="text-apple-text2 text-sm">
                Este nombre se mostrará siempre debajo del título &quot;Barra&quot; en la barra.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-apple-text mb-2">
                  Nombre del bar
                </label>
                <input
                  id="set-bar-name"
                  name="barName"
                  type="text"
                  value={barName}
                  onChange={(e) => setBarName(e.target.value)}
                  placeholder="Ej: Bar El Patrón"
                  className="w-full px-4 py-3 bg-apple-surface2 border border-apple-border rounded-xl text-apple-text placeholder-apple-text2 focus:outline-none focus:ring-2 focus:ring-apple-accent focus:border-transparent"
                />
              </div>

              <button
                onClick={handleContinue}
                disabled={!barName.trim()}
                className="w-full bg-apple-accent hover:bg-apple-accent/90 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar al inventario
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
