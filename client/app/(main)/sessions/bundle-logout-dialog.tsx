import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { differenceInMinutes, format } from "date-fns";
import { customerSchema, Session } from "@/lib/schemas";
import { difference } from "next/dist/build/utils";
import { log } from "console";
import { se } from "date-fns/locale";

export default function BundleLogoutDialog({
  session,
  isOpen,
  onClose,
  onConfirm,
}: {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const sub = session.subscription;
  const totalTime =
    sub?.time_left != null
      ? sub.time_left -
        differenceInMinutes(new Date(Date.now()), session.start_time)
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Bundle Logout</DialogTitle>
        </DialogHeader>
        <div>
          <p>
            <strong>Customer: </strong>
            {session.customer?.first_name} {session.customer?.last_name}
          </p>
        </div>

        <div className="space-y-2">
          {sub?.days_left != null && (
            <p>
              <strong>Days Left:</strong> {sub.days_left}
            </p>
          )}
          {sub?.time_left != null && (
            <p>
              <strong>Time Left: </strong>
              {Math.floor(totalTime / 60)}h {totalTime % 60}m
            </p>
          )}
          {sub?.expiry_date && (
            <p>
              <strong>Expiry Date:</strong>{" "}
              {format(new Date(sub.expiry_date), "PPP")}
            </p>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
