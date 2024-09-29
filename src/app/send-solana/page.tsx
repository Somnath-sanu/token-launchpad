/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import withWallet from "@/components/withWallet";

import { useToast } from "@/hooks/use-toast";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

function SendSolana() {
  const [recipientAddress, setRecipientAddress] = useState<PublicKey | null>(
    null
  );

  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (publicKey === null || recipientAddress === null) return;

    console.log({
      recipientAddress,
      publicKey,
    });

    //@ts-ignore

    if (recipientAddress === publicKey?.toBase58()) {
      toast({
        description: "Please enter recipient address",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsLoading(true);
      setResult(null);

      const balance = await connection.getBalance(publicKey);

      if (balance / LAMPORTS_PER_SOL < Number(amount)) {
        toast({
          description: "Insufficient balance",
          variant: "destructive",
        });
        return;
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,

          toPubkey: recipientAddress,
          lamports: Number(amount) * LAMPORTS_PER_SOL,
        })
      );

      await sendTransaction(transaction, connection);

      setResult(`Successfully sent ${amount} SOL to ${recipientAddress}`);
    } catch (error) {
      console.log(error);

      toast({
        description: "Something went wrong!!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setAmount("");
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
          Send Solana
        </motion.h1>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg"
        >
          <div className="mb-4">
            <label htmlFor="recipientAddress" className="block mb-2">
              Recipient Address
            </label>

            <input
              type="text"
              id="recipientAddress"
              //@ts-ignore
              value={recipientAddress || ""}
              //@ts-ignore
              onChange={(e) => setRecipientAddress(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 rounded text-white"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="amount" className="block mb-2">
              Amount (SOL)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              step="0.000000001" // Allows input with up to 9 decimal places
              min="0"
              className="w-full px-3 py-2 bg-gray-700 rounded text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors disabled:bg-purple-800 "
          >
            {isLoading ? "Sending..." : "Send SOL"}
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

export default withWallet(SendSolana);
