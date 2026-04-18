import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PricingTable } from "@clerk/nextjs";
import { ReactNode } from "react";

function PricingModal({ children }: { children: ReactNode }) {
  return (
    <div>
      <Dialog>
        <DialogTrigger className="w-full">
          <div>{children}</div>
        </DialogTrigger>
        <DialogContent className="md:min-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-center mb-4 text-xl font-extrabold">
              Upgrade Plan
            </DialogTitle>
            <DialogDescription>
              <PricingTable />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PricingModal;
