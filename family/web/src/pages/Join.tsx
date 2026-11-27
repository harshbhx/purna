import { useEffect, useState } from "react";
import { Logo } from "@/components/purna/logo";
import { setKey, takeFragment } from "@/lib/api";

export function Join() {
  const [msg, setMsg] = useState("Opening the family page…");
  useEffect(() => {
    const k = takeFragment("k");
    if (k && setKey(k)) location.replace("/");
    else setMsg(k ? "This browser won’t save the link (private mode?). Open it in a normal window." : "This invite link is missing its key. Ask your family to copy it again.");
  }, []);
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-surface px-5 text-center">
      <Logo />
      <p id="out" className="m-0 text-lg text-muted-foreground">{msg}</p>
    </main>
  );
}
