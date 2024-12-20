"use client"; //todo
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@nextui-org/navbar";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";

export const Navbar = () => {
  return (
    <NextUINavbar>
      <NavbarContent>
        <NavbarBrand>
          <Link href="/">🐧 Productive Penguin</Link>
        </NavbarBrand>
        <NavbarItem>
          <Link href="/todos">Todos</Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/settings">Settings</Link>
        </NavbarItem>
        <NavbarItem>
          <Button>Sign in</Button>
        </NavbarItem>
      </NavbarContent>
    </NextUINavbar>
  );
};
