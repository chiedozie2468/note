import React from "react";
import NewDocumentButton from "./NewDocumentButton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";

export default function Sidebar() {
  const menuOptions = (
    <>
      <NewDocumentButton />

      {/* My Documents */}
      {/* Lists.. */}
      
      {/* shared with me */}
      {/* list.. */}
    </>
  );

  return (
    <div className="relative bg-gray-200 p-2 md:p-5">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger>
            <MenuIcon size={40} className="rounded-lg p-2 hover:opacity-30" />
          </SheetTrigger>

          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle className="text-center">Menu</SheetTitle>

              <div>{menuOptions}</div>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden md:block">{menuOptions}</div>
    </div>
  );
}
