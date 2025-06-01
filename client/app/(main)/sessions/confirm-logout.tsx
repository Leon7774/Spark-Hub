"use client";

import { useState, useEffect } from "react";
import { differenceInMinutes } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Session } from "@/lib/schemas";

interface ConfirmLogoutDialogProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmLogoutDialog({
  session,
  isOpen,
  onClose,
  onConfirm,
}: ConfirmLogoutDialogProps) {
  const [totalBill, setTotalBill] = useState<number>(0);
  const [hoursUsed, setHoursUsed] = useState<number>(0);

  useEffect(() => {
    if (session && session.plan?.type === "hourly") {
      const startTime = new Date(session.start_time);
      const now = new Date();
      const minutesUsed = differenceInMinutes(now, startTime);
      const hours = Math.ceil(minutesUsed / 60); // Round up to the nearest hour
      setHoursUsed(hours);
      setTotalBill(hours * (session.plan.price || 0));
    }
  }, [session]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Logout</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {session.plan?.type === "hourly" ? (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Session Duration: {hoursUsed} hour{hoursUsed !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  Rate: ₱{session.plan.price}/hour
                </p>
                <div className="border-t pt-2">
                  <p className="font-semibold">
                    Total Bill: ₱{totalBill.toFixed(2)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p>Are you sure you want to end this session?</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            {session.plan?.type === "hourly" ? "Confirm & Pay" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
