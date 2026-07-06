import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface TimeSlot {
  iso: string;
  label: string;
}

/**
 * Human-in-the-loop scheduling card rendered inside the CopilotKit chat.
 */
export function TimePickerCard({
  topic,
  attendee,
  onPick,
  onCancel,
}: {
  topic: string;
  attendee?: string;
  onPick: (slot: TimeSlot) => void;
  onCancel: () => void;
}) {
  const slots = useMemo(() => generateSlots(), []);
  const [done, setDone] = useState<TimeSlot | "cancelled" | null>(null);

  if (done) return null;

  return (
    <Card className="mx-auto my-2 w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-base capitalize">{topic}</CardTitle>
        {attendee ? <CardDescription>with {attendee}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Pick a time</p>
        <div className="grid grid-cols-2 gap-2">
          {slots.map((slot) => (
            <Button
              key={slot.iso}
              variant="outline"
              className="h-auto py-2.5 text-sm font-medium"
              onClick={() => {
                setDone(slot);
                onPick(slot);
              }}
            >
              {slot.label}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={() => {
            setDone("cancelled");
            onCancel();
          }}
        >
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}

function generateSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  for (let day = 1; day <= 2; day++) {
    for (const hour of [10, 14]) {
      const d = new Date(now);
      d.setDate(now.getDate() + day);
      d.setHours(hour, 0, 0, 0);
      slots.push({
        iso: d.toISOString(),
        label: d.toLocaleString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
      });
    }
  }
  return slots;
}
