"use client";

import React, { useEffect, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";

export default function Splash() {
  const [show, setShow] = useState(false);
  const { isSignedIn } = useUser();

  useEffect(() => {
    try {
      const seen = localStorage.getItem("seenSplash_v1");
      if (!seen) setShow(true);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      try {
        localStorage.removeItem("seenSplash_v1");
        setShow(true);
      } catch (e) {}
    }
  }, [isSignedIn]);

  const close = () => {
    try {
      localStorage.setItem("seenSplash_v1", "1");
    } catch (e) {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />

      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="mx-auto w-full max-w-4xl rounded-3xl bg-white/10 p-8 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Welcome</h1>
              <p className="mt-2 max-w-xl text-lg text-white/90">
                Collaborate in real-time, create documents, and invite teammates.
                Sign in to save your work or continue as a guest.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <SignInButton mode="modal">
                  <Button size="lg">Sign in</Button>
                </SignInButton>
                <Button variant="ghost" size="lg" onClick={close}>
                  Continue as guest
                </Button>
              </div>
            </div>

            <div className="mt-4 flex shrink-0 items-center gap-4 sm:mt-0">
              <div className="hidden rounded-2xl bg-white/8 p-6 text-center text-white/90 sm:block">
                <div className="text-6xl">✨</div>
                <p className="mt-2 text-sm">Start creating</p>
              </div>

              <button
                aria-label="Close welcome"
                onClick={close}
                className="rounded-md bg-white/12 px-4 py-2 text-sm text-white/90 hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
