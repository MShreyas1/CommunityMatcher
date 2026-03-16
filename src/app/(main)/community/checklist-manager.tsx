"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardList, Plus, X, Loader2 } from "lucide-react";
import { addChecklistItem, removeChecklistItem } from "@/actions/community";

interface ChecklistItem {
  id: string;
  label: string;
  order: number;
}

interface ChecklistManagerProps {
  items: ChecklistItem[];
}

export function ChecklistManager({ items }: ChecklistManagerProps) {
  const [label, setLabel] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;

    startTransition(async () => {
      const result = await addChecklistItem(label.trim());
      if (result.error) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : Object.values(result.error).flat().join(", ");
        toast.error(errorMsg);
        return;
      }
      toast.success("Item added!");
      setLabel("");
    });
  }

  function handleRemove(itemId: string) {
    startTransition(async () => {
      const result = await removeChecklistItem(itemId);
      if (result.error) {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Something went wrong"
        );
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="size-5" />
          Your Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Add qualities you care about. Vetters can optionally check these off when suggesting profiles for you.
        </p>
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            type="text"
            placeholder="e.g. Good sense of humor"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="flex-1"
            maxLength={100}
          />
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
          </Button>
        </form>
        {items.length > 0 && (
          <div className="space-y-1.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2"
              >
                <span className="text-sm">{item.label}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  disabled={isPending}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
