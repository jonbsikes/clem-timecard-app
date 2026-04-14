"use client";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  message?: string;
  className?: string;
};

export default function ConfirmButton({
  children,
  message = "Are you sure?",
  className,
}: Props) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
