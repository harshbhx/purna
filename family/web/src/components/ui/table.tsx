import * as React from "react";
import { cn } from "@/lib/utils";

/** On narrow screens the wrapper scrolls sideways, so it is a labelled region keyboard users can focus and scroll. */
export function Table({ className, label, ...props }: React.TableHTMLAttributes<HTMLTableElement> & { label: string }) {
  return (
    <div role="region" aria-label={label} tabIndex={0} className="relative w-full overflow-x-auto rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      <table className={cn("w-full caption-bottom border-collapse text-sm tabular-nums", className)} {...props} />
    </div>
  );
}
export const TableHeader = (p: React.HTMLAttributes<HTMLTableSectionElement>) => <thead {...p} />;
export const TableBody = ({ className, ...p }: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className={cn("[&_tr:last-child]:border-0", className)} {...p} />;
export const TableRow = ({ className, ...p }: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={cn("border-b border-border/70 transition-colors hover:bg-muted/50", className)} {...p} />;
export const TableHead = ({ className, ...p }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th scope="col" className={cn("h-10 px-3.5 text-right align-middle text-[13px] font-medium whitespace-nowrap text-muted-foreground first:text-left", className)} {...p} />
);
export const TableCell = ({ className, ...p }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("px-3.5 py-2.5 text-right align-middle whitespace-nowrap first:text-left", className)} {...p} />
);
export const TableCaption = ({ className, ...p }: React.HTMLAttributes<HTMLTableCaptionElement>) => <caption className={cn("sr-only", className)} {...p} />;
