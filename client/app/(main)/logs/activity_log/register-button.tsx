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
import RegisterCustomerForm from "./register-log";

export const RegisterButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Custom Log</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="pt-5">
              <DialogTitle>Create Custom Log</DialogTitle>
              <DialogDescription>
                Make a custom log here. Enter the action details.
              </DialogDescription>
            </DialogHeader>
            <RegisterCustomerForm
              dialogOpen={open}
              dialogOpenSet={setOpen}
            ></RegisterCustomerForm>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
export default RegisterButton;
