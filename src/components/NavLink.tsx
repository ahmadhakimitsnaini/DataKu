import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// NavLinkCompatProps: Interface untuk mendukung prop class kustom (active/pending)
interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string; // Class default
  activeClassName?: string; // Class saat rute sedang aktif
  pendingClassName?: string; // Class saat rute dalam proses loading (transitions)
}

/**
 * NavLink: Komponen navigasi yang otomatis mendeteksi status aktif rute.
 * Sangat berguna untuk menu Sidebar agar otomatis tersorot saat diklik.
 */
const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        // Fungsi callback bawaan React Router untuk menentukan class secara dinamis
        className={({ isActive, isPending }) =>
          cn(
            className,
            isActive && activeClassName,
            isPending && pendingClassName,
          )
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
