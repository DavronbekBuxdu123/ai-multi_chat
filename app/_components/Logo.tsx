"use client";
import { motion, Variants } from "framer-motion";
import React from "react";

export const DavaLogo: React.FC = () => {
  // Variantlar uchun Variants turini belgilaymiz
  const pointVariants: Variants = {
    animate: {
      scale: [1, 1.3, 1],
      opacity: [0.6, 1, 0.6],
    },
  };

  return (
    <div className="flex items-center gap-3 group cursor-pointer select-none">
      {/* Logotip belgisi (Neural Icon) */}
      <div className="relative flex items-center justify-center w-11 h-11">
        {/* Orqa fondagi yumshoq nuri */}
        <div className="absolute inset-0 bg-blue-500 blur-[15px] opacity-0 dark:opacity-30 rounded-full transition-opacity group-hover:dark:opacity-50" />

        {/* Asosiy Neyron SVG */}
        <svg
          viewBox="0 0 100 100"
          className="relative w-full h-full drop-shadow-[0_2px_5px_rgba(59,130,246,0.1)] dark:drop-shadow-[0_0_10px_rgba(59,130,246,0.7)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 1. Neyron aloqalari */}
          <motion.path
            d="M20 70C30 50 40 30 50 15M50 15C60 30 70 50 80 70M20 70H80M50 45L80 70M50 45L20 70M50 15L50 45"
            stroke="url(#neural-gradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90 dark:opacity-100"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              ease: "easeInOut",
            }}
          />

          {/* 2. Neyron nuqtalari */}
          {/* Yuqori nuqta */}
          <motion.circle
            cx="50"
            cy="15"
            r="7"
            className="fill-blue-700 dark:fill-blue-400"
            variants={pointVariants}
            animate="animate"
            transition={{
              delay: 0,
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Markaziy nuqta */}
          <motion.circle
            cx="50"
            cy="45"
            r="7"
            className="fill-blue-600 dark:fill-blue-500"
            variants={pointVariants}
            animate="animate"
            transition={{
              delay: 0.5,
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Pastki chap nuqta */}
          <motion.circle
            cx="20"
            cy="70"
            r="7"
            className="fill-blue-800 dark:fill-blue-600"
            variants={pointVariants}
            animate="animate"
            transition={{
              delay: 1,
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Pastki o'ng nuqta */}
          <motion.circle
            cx="80"
            cy="70"
            r="7"
            className="fill-blue-800 dark:fill-blue-600"
            variants={pointVariants}
            animate="animate"
            transition={{
              delay: 1.5,
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <defs>
            <linearGradient
              id="neural-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Matn qismi */}
      <h1 className="text-3xl font-extrabold tracking-tighter transition-colors duration-300">
        <span className="text-neutral-950 dark:text-white">Dava</span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-400 dark:from-blue-400 dark:to-blue-100">
          Ai
        </span>
      </h1>
    </div>
  );
};
