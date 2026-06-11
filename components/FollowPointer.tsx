import React from "react";
import { motion } from "framer-motion";
import stringToColor from "@/lib/stringToColor";

export default function FollowPointer({
  x,
  y,
  info,
}: {
  x: number;
  y: number;
  info: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const color = stringToColor(info.email || "1");

  return (
    <motion.div
      className="absolute z-50 pointer-events-none"
      style={{
        top: y,
        left: x,
      }}
      initial={{ scale: 1, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Sleek SVG Cursor Arrow */}
      <svg
        stroke={color}
        fill={color}
        strokeWidth="1"
        viewBox="0 0 16 16"
        className="h-5 w-5 drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
      </svg>

      {/* Beautiful Name Badge */}
      <motion.div
        style={{
          backgroundColor: color,
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="translate-x-3 translate-y-0.5 px-2.5 py-0.5 text-white font-medium whitespace-nowrap text-[11px] rounded-full rounded-tl-none shadow-md"
      >
        {info.name || info.email}
      </motion.div>
    </motion.div>
  );
}
