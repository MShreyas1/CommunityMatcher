"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/actions/verification";
import { toast } from "sonner";

export function EmailVerificationBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (dismissed) return null;

  function handleResend() {
    startTransition(async () => {
      const result = await resendVerificationEmail();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Verification email sent! Check your inbox.");
      }
    });
  }

  return (
    <div className="relative bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
      <AlertTriangle className="size-5 text-amber-500 shrink-0" />
      <p className="text-sm text-amber-200 flex-1">
        Your email is not verified. Please check your inbox or{" "}
        <Button
          variant="link"
          className="text-amber-400 hover:text-amber-300 p-0 h-auto font-semibold"
          onClick={handleResend}
          disabled={isPending}
        >
          {isPending ? "sending..." : "resend verification email"}
        </Button>
        .
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-500/60 hover:text-amber-500 transition-colors"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
