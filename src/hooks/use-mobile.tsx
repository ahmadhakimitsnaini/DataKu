import * as React from "react";

/**
 * Nilai ambang batas (breakpoint) dalam piksel untuk menentukan tampilan mobile.
 * Umumnya menggunakan standar 768px (MD pada Tailwind CSS).
 */
const MOBILE_BREAKPOINT = 768;

/**
 * Hook useIsMobile
 * Digunakan untuk mendeteksi secara real-time apakah pengguna sedang mengakses
 * aplikasi melalui perangkat dengan layar kecil (mobile).
 */
export function useIsMobile() {
  // State untuk menyimpan status apakah tampilan saat ini adalah mobile
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    // Membuat MediaQueryList untuk memantau perubahan ukuran layar
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Fungsi handler yang akan dijalankan setiap kali ukuran viewport berubah
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Menambahkan event listener 'change' pada media query
    mql.addEventListener("change", onChange);

    // Melakukan pengecekan awal saat komponen pertama kali dimuat (mount)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Membersihkan event listener saat komponen dilepas (unmount) untuk mencegah memory leak
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Mengembalikan nilai boolean (dipaksa menjadi boolean dengan !!)
  return !!isMobile;
}
