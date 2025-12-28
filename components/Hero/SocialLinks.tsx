"use client";

import Link from "next/link";
import { FaTelegramPlane, FaLinkedinIn, FaInstagram } from "react-icons/fa";

export default function SocialLinks() {
  return (
    <section className="absolute right-6 top-1/2 -translate-y-1/2 z-50 px-24">
      <div className="flex flex-col gap-4 items-center">
        <Link
          href="https://telegram.me/yourusername"
          target="_blank"
          aria-label="Telegram"
          className="text-white hover:opacity-70 transition"
        >
          <FaTelegramPlane size={22} />
        </Link>

        <Link
          href="https://linkedin.com/in/yourusername"
          target="_blank"
          aria-label="LinkedIn"
          className="text-white hover:opacity-70 transition"
        >
          <FaLinkedinIn size={22} />
        </Link>

        <Link
          href="https://instagram.com/yourusername"
          target="_blank"
          aria-label="Instagram"
          className="text-white hover:opacity-70 transition"
        >
          <FaInstagram size={22} />
        </Link>
      </div>
    </section>
  );
}
