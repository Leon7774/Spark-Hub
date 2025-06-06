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
import RegisterPlanForm from "./register-plan";
import { Plus } from "lucide-react";

export const RegisterButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="mb-2">
              <Plus></Plus>
              Create Session Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="pt-5">
              <DialogTitle>Create Subscription Plan</DialogTitle>
              <DialogDescription>
                Make a subscription plan here. Enter the details below.
              </DialogDescription>
            </DialogHeader>
            <RegisterPlanForm
              dialogOpen={open}
              dialogOpenSet={setOpen}
            ></RegisterPlanForm>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
export default RegisterButton;
