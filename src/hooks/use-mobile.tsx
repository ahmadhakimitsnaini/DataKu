import * as React from "react";

// Titik batas lebar layar untuk perangkat mobile (768px)
const MOBILE_BREAKPOINT = 768;

/**
 * Hook kustom untuk mendeteksi apakah perangkat saat ini adalah mobile.
 * Berguna untuk kondisional rendering berbasis lebar layar.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Membuat media query listener
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Fungsi untuk memperbarui state saat ukuran layar berubah
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    mql.addEventListener("change", onChange);
    
    // Set nilai awal saat komponen pertama kali dimuat
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Membersihkan listener saat komponen tidak lagi digunakan (unmount)
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}