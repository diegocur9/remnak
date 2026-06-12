"use client";

import Link from "next/link";
import { useTransition } from "react";
import { LayoutDashboard, LogOut, ShoppingBag, User } from "lucide-react";

import { logoutAction } from "@/app/(auth)/actions";
import { Avatar, initialsFromName } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  fullName: string | null;
  home: string;
  isProvider: boolean;
}

export function UserMenu({ fullName, home, isProvider }: UserMenuProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-11 w-11 items-center justify-center rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Abrir menú de cuenta"
      >
        <Avatar>{initialsFromName(fullName)}</Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-ink">
            {fullName ?? "Mi cuenta"}
          </span>
          <span className="text-xs font-normal text-texto-suave">
            {isProvider ? "Proveedor" : "Comprador"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={home}>
            {isProvider ? (
              <LayoutDashboard className="text-texto-suave" />
            ) : (
              <ShoppingBag className="text-texto-suave" />
            )}
            {isProvider ? "Mi panel" : "Mi cuenta"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`${home}`}>
            <User className="text-texto-suave" />
            Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isPending}
          onSelect={(e) => {
            e.preventDefault();
            startTransition(() => {
              void logoutAction();
            });
          }}
          className="text-error focus:bg-error/10"
        >
          <LogOut />
          {isPending ? "Cerrando sesión…" : "Cerrar sesión"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
