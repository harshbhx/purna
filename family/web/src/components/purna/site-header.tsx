// Marketing header: transparent over the hero, a frosted bar once you scroll. On phones the links fold into a menu.
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#read", label: "Reading a session" },
  { href: "#families", label: "Families" },
  { href: "#therapists", label: "Therapists" },
  { href: "#research", label: "Research" },
];

export function SiteHeader({ onExample }: { onExample: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={cn("sticky top-0 z-40 transition-[background,box-shadow,border] duration-300", scrolled ? "border-b border-border/70 bg-background/80 backdrop-blur-xl backdrop-saturate-150" : "border-b border-transparent")}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <a href="#top" className="no-underline" aria-label="Purna, back to top"><Logo /></a>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-[15px] text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-foreground">{l.label}</a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="outline" size="sm"><a href="#code" className="no-underline">I have a code</a></Button>
          <Button size="sm" onClick={onExample}>See an example</Button>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu"><Menu /></Button>
          </DialogTrigger>
          <DialogContent className="top-3 translate-y-0 data-[state=open]:animate-[fade-in_160ms_ease-out]">
            <DialogTitle className="sr-only">Menu</DialogTitle>
            <DialogDescription className="sr-only">Links to each part of the page</DialogDescription>
            <Logo />
            <nav aria-label="Mobile" className="flex flex-col">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-border py-3.5 text-lg font-medium text-foreground no-underline last:border-0">{l.label}</a>
              ))}
            </nav>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline"><a href="#code" onClick={() => setOpen(false)} className="no-underline">I have a code</a></Button>
              <Button onClick={() => { setOpen(false); onExample(); }}>See an example</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
