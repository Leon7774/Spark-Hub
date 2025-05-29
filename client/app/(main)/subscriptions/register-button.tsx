import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import EnhancedRegistrationForm from "./register-subscription"; // Updated import

const RegisterButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger onClick={() => setOpen(true)}>
            <Button className="mb-2">Register Session/Plan</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader className="pt-5">
              <DialogTitle>Register Session or Purchase Plan</DialogTitle>
              <DialogDescription>
                Start a customer session or purchase a subscription plan for a
                customer.
              </DialogDescription>
            </DialogHeader>
            <EnhancedRegistrationForm
              dialogOpen={open}
              dialogOpenSet={setOpen}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RegisterButton;
