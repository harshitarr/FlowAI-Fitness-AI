"use client";

import { useState } from "react";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import {  HomeIcon, UserIcon, ZapIcon , HeartPlus, Sparkles  } from "lucide-react";
import { FiMenu, FiX } from "react-icons/fi";
import Link from "next/link";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { isSignedIn } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-md border-b border-border py-3 shadow-sm"
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        
        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Link href="/" className="flex items-center gap-2">
              <div className="p-1 bg-secondary-foreground/20 rounded-md">
                <HeartPlus  className="w-5 h-5 text-secondary-foreground" />
              </div>
            <span className="text-xl font-bold font-mono">
              <span className="text-primary">Flow</span>.AI
            </span>
          </Link>
        </motion.div>

        {/* DESKTOP NAVIGATION */}
        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="hidden md:flex items-center gap-5"
        >
          {isSignedIn ? (
            <>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors duration-300"
              >
                <HomeIcon size={16} />
                <span>Home</span>
              </Link>

              <Link
                href="/generate-program"
                className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors duration-300"
              >
                <Sparkles size={16} />
                <span>Generate</span>
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors duration-300"
              >
                <UserIcon size={16} />
                <span>Profile</span>
              </Link>

              <Button
                asChild
                variant="outline"
                className="ml-2 border-primary/50 text-primary hover:bg-primary hover:text-white transition-colors duration-300"
              >
                <Link href="/generate-program">Get Started</Link>
              </Button>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8",
                    },
                  }}
                  aria-label="User menu"
                />
              </motion.div>
            </>
          ) : (
            <>
              <SignInButton>
                <Button
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary hover:text-white transition-colors duration-300"
                >
                  Sign In
                </Button>
              </SignInButton>

              <SignUpButton>
                <Button className="bg-primary text-white hover:bg-primary/90 transition-colors duration-300">
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          )}
        </motion.nav>

        {/* MOBILE MENU ICON */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
            className="text-foreground focus:outline-none"
          >
            {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="md:hidden bg-background/90 backdrop-blur-md border-t border-border px-4 py-4"
          >
            <div className="flex flex-col items-center justify-center space-y-4">
            {isSignedIn ? (
              <>
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>

                <Link
                  href="/generate-program"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Generate
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Profile
                </Link>

                <Button
                  asChild
                  variant="outline"
                  className="w-full border-primary/50 text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <Link href="/generate-program" onClick={() => setMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>

                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8",
                    },
                  }}
                  aria-label="User menu"
                />
              </>
            ) : (
              <>
                <SignInButton>
                  <Button
                    variant="outline"
                    className="w-full border-primary/50 text-primary hover:bg-primary hover:text-white transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </Button>
                </SignInButton>

                <SignUpButton>
                  <Button
                    className="w-full bg-primary text-white hover:bg-primary/90 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign Up
                  </Button>
                </SignUpButton>
              </>
            )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
