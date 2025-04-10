"use client";

import React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
    const { isAuthenticated, logout } = useAuth();
    const [isOpen, setIsOpen] = React.useState(false);

    const navItems = [
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 w-full items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="font-bold text-xl md:text-2xl">
                        Playlist Creator
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList>
                        {navItems.map((item) => (
                            <NavigationMenuItem key={item.href}>
                                <Link href={item.href} legacyBehavior passHref>
                                    <NavigationMenuLink
                                        className={navigationMenuTriggerStyle()}>
                                        {item.label}
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Auth Buttons - Desktop */}
                <div className="hidden md:flex items-center gap-4">
                    {isAuthenticated ? (
                        <Button variant="outline" onClick={logout}>
                            Logout
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" asChild>
                                <Link href="/sign-in">Sign in</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/sign-up">Sign up</Link>
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <div className="flex flex-col gap-6 pt-6">
                            <nav className="flex flex-col gap-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="text-lg font-medium transition-colors hover:text-primary"
                                        onClick={() => setIsOpen(false)}>
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                            <div className="flex flex-col gap-2 mt-auto">
                                {isAuthenticated ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            logout();
                                            setIsOpen(false);
                                        }}>
                                        Logout
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            asChild
                                            onClick={() => setIsOpen(false)}>
                                            <Link href="/sign-in">Sign in</Link>
                                        </Button>
                                        <Button
                                            asChild
                                            onClick={() => setIsOpen(false)}>
                                            <Link href="/sign-up">Sign up</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
};

export default Header;
