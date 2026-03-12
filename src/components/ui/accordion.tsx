import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Komponen Root Accordion.
 * Berfungsi sebagai pembungkus utama untuk seluruh item accordion.
 * Komponen ini langsung mengekspor Root dari Radix UI.
 */
const Accordion = AccordionPrimitive.Root;

/**
 * Komponen AccordionItem.
 * Mewakili satu bagian yang dapat dilipat/dibuka di dalam Accordion.
 * Secara default menambahkan garis batas bawah (border-b) untuk pemisah antar item.
 */
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item 
    ref={ref} 
    className={cn("border-b", className)} 
    {...props} 
  />
));
AccordionItem.displayName = "AccordionItem";

/**
 * Komponen AccordionTrigger.
 * Berfungsi sebagai tombol (header) yang diklik pengguna untuk membuka/menutup konten.
 * Sudah dilengkapi dengan ikon ChevronDown yang akan berputar 180 derajat secara otomatis
 * ketika state accordion sedang terbuka (open).
 */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
        // Selector khusus: Memutar ikon SVG di dalamnya sebesar 180 derajat jika state-nya 'open'
        "[&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      {/* Ikon panah (Chevron) dengan animasi transisi yang halus */}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

/**
 * Komponen AccordionContent.
 * Berfungsi sebagai wadah penampung konten yang akan disembunyikan/ditampilkan.
 * Dilengkapi dengan animasi 'accordion-down' saat dibuka dan 'accordion-up' saat ditutup
 * berdasarkan atribut `data-state` bawaan Radix UI.
 */
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    {/* Inner div untuk memberikan padding pada konten tanpa mengganggu animasi height/overflow */}
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };