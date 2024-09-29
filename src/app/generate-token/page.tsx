/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import withWallet from "@/components/withWallet";
import { pinata } from "@/lib/config";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import {
  TOKEN_2022_PROGRAM_ID,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  ExtensionType,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { toast } from "@/hooks/use-toast";
import { validateImage } from "@/lib/utils";

const GenerateToken: React.FC = () => {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenSupply, setTokenSupply] = useState<number>();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [associatedTokenAccount, setAssociatedTokenAccount] =
    useState<PublicKey | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    } else {
      setImagePreview(null);
    }
  };

  // Cleanup the object URL when the component unmounts or when a new file is selected
  useEffect(() => {
    return () => {
      if (imagePreview) {
        // console.log("cleaup called");

        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      selectedImage === null ||
      publicKey === null ||
      tokenSupply === undefined ||
      tokenSupply <= 0
    ) {
      toast({
        description: "Fill all the details correctly",
        variant: "destructive",
      });
      return;
    }

    // const isValidImage = await validateImage(selectedImage);
    // if (!isValidImage) {
    //   toast({
    //     description:
    //       "Image must be square (512x512 or 1024x1024) and under 100kb",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    try {
      setIsLoading(true);
      setResult(null);

      const uploadImage = await pinata.upload.file(selectedImage);
      const signedUrlImage = await pinata.gateways.convert(
        uploadImage.IpfsHash
      );
      const mintKeypair = Keypair.generate();
      const metadataToUpload = {
        name: tokenName,
        symbol: tokenSymbol,
        description:
          "This is an example fungible token for demonstration purposes.",
        image: signedUrlImage,
      };
      const upload = await pinata.upload.json(metadataToUpload);

      const signedUrl = await pinata.gateways.convert(upload.IpfsHash);
      console.log("Metadata URL :", signedUrl);

      const metadata = {
        mint: mintKeypair.publicKey,
        name: tokenName,
        symbol: tokenSymbol,
        uri: signedUrl,
        additionalMetadata: [],
      };

      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

      const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen
      );

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: mintLen,
          lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
          mintKeypair.publicKey,
          publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          9,
          publicKey,
          null,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          mint: mintKeypair.publicKey,
          metadata: mintKeypair.publicKey,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
          mintAuthority: publicKey,
          updateAuthority: publicKey,
        })
      );

      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.partialSign(mintKeypair);
      await sendTransaction(transaction, connection);

      toast({
        description: "Token Mint Account with metadata has been created🎉",
      });

      const associatedToken = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      toast({
        description: "Associated token account created🎉",
      });

      setAssociatedTokenAccount(associatedToken);

      const transaction2 = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          associatedToken,
          publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        )
      );

      await sendTransaction(transaction2, connection);

      if (tokenSupply === undefined) {
        console.log("Token supply undefined");
        return;
      }

      const transaction3 = new Transaction().add(
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedToken,
          publicKey,
          tokenSupply * LAMPORTS_PER_SOL,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      await sendTransaction(transaction3, connection);

      setResult(
        `Token "${tokenName}" (${tokenSymbol}) created successfully with a supply of ${tokenSupply}`
      );

      toast({
        description: "Success🎉 Check your wallet ",
      });
    } catch (error) {
      console.log(error);
      toast({
        description: "Something went wrong!!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedImage(null);
      setImagePreview(null);
      setTokenName("");
      setTokenSupply(0);
      setTokenSymbol("");
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
          Generate Solana Token
        </motion.h1>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg"
        >
          <div className="mb-4">
            <label htmlFor="tokenName" className="block mb-2">
              Token Name
            </label>
            <input
              type="text"
              id="tokenName"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 rounded text-white border-none outline-none"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="tokenSymbol" className="block mb-2">
              Token Symbol
            </label>
            <input
              type="text"
              id="tokenSymbol"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 rounded text-white border-none outline-none"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="tokenSupply" className="block mb-2">
              Token Supply
            </label>
            <input
              type="number"
              id="tokenSupply"
              value={tokenSupply || 0}
              onChange={(e) => setTokenSupply(Number(e.target.value))}
              required
              className="w-full px-3 py-2 bg-gray-700 rounded text-white border-none outline-none"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="tokenImage" className="block mb-2">
              Token Image
            </label>
            <input
              type="file"
              id="tokenImage"
              accept="image/*"
              required
              onChange={handleImageChange}
              className="w-full px-3 py-2 bg-gray-700 rounded text-white border-none outline-none"
            />
          </div>

          {imagePreview && (
            <div className="mb-6">
              <img
                src={imagePreview}
                alt="Selected Token"
                className="w-[250px] h-[250px] mx-auto rounded"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors disabled:bg-purple-800 disabled:cursor-wait "
          >
            {isLoading ? "Generating..." : "Generate Token"}
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
            {
              <>
                <p className="text-blue-600 font-bold">
                  Associated token account address :{" "}
                  {associatedTokenAccount && associatedTokenAccount.toString()}
                </p>
                <br />
              </>
            }
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
};

export default withWallet(GenerateToken);
