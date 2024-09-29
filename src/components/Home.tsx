"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="container mx-auto px-4 py-16"
      >
        <h1 className="text-5xl font-bold mb-8 text-center">
          Solana Token Launchpad
        </h1>
        <p className="text-xl mb-12 text-center">
          Create and manage your own Solana tokens with ease
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="Generate Token"
            description="Create your own Solana token with custom metadata"
            link="/generate-token"
          />
          <FeatureCard
            title="Airdrop Solana"
            description="Receive Solana tokens for testing and development"
            link="/airdrop-solana"
          />
          <FeatureCard
            title="Send Solana"
            description="Transfer Solana tokens to other wallets"
            link="/send-solana"
          />
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: [
            "radial-gradient(circle, rgba(39,39,42,1) 0%, rgba(0,0,0,1) 100%)",
            "radial-gradient(circle, rgba(55,65,81,1) 0%, rgba(0,0,0,1) 100%)",
            "radial-gradient(circle, rgba(39,39,42,1) 0%, rgba(0,0,0,1) 100%)",
          ],
        }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      />
    </div>
  );
}

function FeatureCard({
  title,
  description,
  link,
}: {
  title: string;
  description: string;
  link: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800 p-6 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <p className="mb-4">{description}</p>
      <Link
        href={link}
        className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
      >
        Get Started
      </Link>
    </motion.div>
  );
}
