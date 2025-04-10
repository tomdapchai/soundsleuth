import React from "react";

const Footer = () => {
    return (
        <div className="w-full flex flex-col justify-center items-center">
            <footer className="p-4 text-slate-500 text-center">
                &copy; {new Date().getFullYear()} Playlist Creator. All rights
                reserved.
            </footer>
        </div>
    );
};

export default Footer;
