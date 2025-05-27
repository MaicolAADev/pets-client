"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthUser } from "@/app/context/AuthContext";

export default function HeaderAuth() {
  const { user } = useAuthUser();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white py-4 shadow-sm"
    >
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3"
          >
            <motion.span
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="h-3 w-3 bg-orange-500 rounded-full"
            />
            <span className="text-lg font-semibold text-gray-900">
              ¡Bienvenido {user?.fullName || " Usuario"}!
            </span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
