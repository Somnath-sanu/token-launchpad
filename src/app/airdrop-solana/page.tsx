"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import withWallet from "@/components/withWallet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useLimit } from "@/lib/store";

function AirdropSolana() {
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const { connected, publicKey } = useWallet();

  const { connection } = useConnection();

  const router = useRouter();

  const { toast } = useToast();

  const { count, setCount } = useLimit();
  //TODO: use Database and cron-job

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (count > 3) {
      toast({
        description: "Limit Reached",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsLoading(true);
      setResult(null);

      await connection.requestAirdrop(publicKey!, amount * LAMPORTS_PER_SOL);

      setResult(`Successfully airdropped ${amount} SOL`);
      setCount(1);
    } catch (error) {
      console.log(error);
      toast({
        description:
          "You've either reached your airdrop limit today or the airdrop faucet has run dry",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!connected) {
    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-center"
        >
          Airdrop Solana
        </motion.h1>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg"
        >
          <div className="mb-4">
            <label htmlFor="walletAddress" className="block mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              id="walletAddress"
              value={`${publicKey?.toBase58()?.slice(0, 10)}...`}
              required
              className="w-full px-3 py-2 bg-gray-700 rounded select-none
               text-gray-500 cursor-not-allowed"
              disabled
              readOnly
            />
          </div>

          <div className="mb-6">
            <Select
              onValueChange={(value) => setAmount(Number(value))}
              required
            >
              <SelectTrigger className="w-[180px] bg-gray-700 border-none outline-none">
                <SelectValue placeholder="Amount" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-none outline-none">
                <SelectGroup className="bg-gray-800 border-none outline-none text-white font-semibold">
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2.5">2.5</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <button
            type="submit"
            disabled={isLoading || count > 3}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors disabled:bg-purple-800 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Airdrop SOL"}
          </button>
        </motion.form>

        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-8 text-center text-green-400"
          >
            {result}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center animate-pulse"
        >
          <Link
            href="/"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default withWallet(AirdropSolana);
