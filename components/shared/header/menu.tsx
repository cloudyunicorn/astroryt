import React from 'react';
import Modetoggle from './mode-toggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlignJustify, UserPen } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import UserButton from "./user-button";

const Menu = () => {
  return (
    <div className="flex justify-end gap-3 p-5">
      <nav className="hidden md:flex w-full max-w-xs gap-1">
        <Modetoggle />
        <UserButton />
      </nav>
      <nav className="md:hidden flex items-center gap-2">
        <Modetoggle />
        <Sheet>
          <SheetTrigger className="align-middle">
            <AlignJustify />
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start">
            <SheetTitle>Menu</SheetTitle>
            <Button asChild variant="ghost">
              <Link href="/new-group">
                <UserPen /> Profile
              </Link>
            </Button>
            <UserButton />
            <SheetDescription></SheetDescription>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
