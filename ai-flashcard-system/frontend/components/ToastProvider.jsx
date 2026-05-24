"use client";

// Wraps react-hot-toast's <Toaster> with the function-as-child render prop.
// Lives in a client component so the layout (a Server Component) can mount it
// without serializing a function across the boundary.

import { Toaster } from "react-hot-toast";
import ToastShell from "./ToastShell";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      // Push the container down so toasts appear vertically centered.
      containerStyle={{ top: "40vh" }}
      toastOptions={{
        duration: 4000,
        // We render every toast through ToastShell, so disable the
        // built-in style and let the shell own the look.
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
          margin: 0,
        },
      }}
    >
      {(t) => <ToastShell t={t} />}
    </Toaster>
  );
}
