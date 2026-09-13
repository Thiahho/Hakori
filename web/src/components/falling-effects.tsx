"use client";

import { usePathname } from "next/navigation";
import { FallingParticles, type FallingVariant } from "@/components/falling-particles";
import { MountainClouds } from "@/components/mountain-clouds";

export function FallingEffects() {
  const pathname = usePathname();

  if (!pathname || pathname.startsWith("/admin")) return null;

  // The katana product page has its own hover slash trail instead of particles.
  if (pathname.startsWith("/producto/katana-oversize")) return null;

  if (pathname.startsWith("/producto/montefuji-oversize")) {
    return (
      <>
        <MountainClouds />
        <FallingParticles variant="snow" />
      </>
    );
  }

  const variant: FallingVariant = pathname.startsWith("/producto/torii-oversize")
    ? "momiji"
    : "sakura";

  return <FallingParticles variant={variant} />;
}
