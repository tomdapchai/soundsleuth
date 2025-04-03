import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
const Header = () => {
    return (
        <header className="w-full p-2 flex justify-between items-center top-0 left-0">
            <div className="font-2xl font-bold">Playlist creator</div>
            <ul className="flex justify-between items-center space-x-2">
                <li>
                    <Link href="/" className="hover:underline">
                        Home
                    </Link>
                </li>
                <li>
                    <Link href="/about" className="hover:underline">
                        About
                    </Link>
                </li>
                <li>
                    <Link href="/contact" className="hover:underline">
                        Contact
                    </Link>
                </li>
            </ul>
            <div className="flex justify-between items-center space-x-2">
                <Button>
                    <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button>Sign up</Button>
            </div>
        </header>
    );
};

export default Header;
