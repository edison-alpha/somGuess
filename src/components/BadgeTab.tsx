import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import voyager from '../img/voyager.png';
import titan from '../img/titan.png';
import starter from '../img/Starter.png';
import scout from '../img/scout.png';
import pinnacle from '../img/pinnacle.png';
import mvp from '../img/MVP.png';
import masterGuess from '../img/master guess.png';
import legend from '../img/legend.png';
import guessexplorer from '../img/som.png';
import guardiant from '../img/guardiant.png';
import explorer from '../img/explorer.png';
import elite from '../img/elite.png';
import catalyst from '../img/catalyst.png';

import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundGradientAnimation } from './ui/background-gradient-animation';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { readContract } from '@wagmi/core';
import { BADGE_CONTRACT_ADDRESS, BADGE_CONTRACT_ABI } from '../lib/web3';
import { somniaTestnet } from '../lib/web3';

const BADGE_COUNT = 12; 
const badgeImages = [
  starter,      // 1
  explorer,     // 2
  scout,        // 3
  guardiant,    // 4
  elite,        // 5
  catalyst,     // 6
  voyager,      // 7
  pinnacle,     // 8
  titan,        // 9
  masterGuess,  // 10
  legend,       // 11
  mvp           // 12
];

const badgeNames = [
  'Starter',        // 1
  'Explorer',       // 2
  'Scout',          // 3
  'Guardiant',      // 4
  'Elite',          // 5
  'Catalyst',       // 6
  'Voyager',        // 7
  'Pinnacle',       // 8
  'Titan',          // 9
  'Master Guess',   // 10
  'Legend Guess',   // 11
  'MVP Guess'       // 12
];

const badgeDescriptions = [
  'User completing 1-3 transactions in Somnia Guess.',
  'User completing 4-8 transactions in Somnia Guess.',
  'User completing 9-12 transactions in Somnia Guess.',
  'User completing 13-16 transactions in Somnia Guess.',
  'User completing 17-20 transactions in Somnia Guess.',
  'User completing 21-25 transactions in Somnia Guess.',
  'User completing 26-30 transactions in Somnia Guess.',
  'User completing 31-36 transactions in Somnia Guess.',
  'User completing 37-41 transactions in Somnia Guess.',
  'User completing 42-49 transactions in Somnia Guess.',
  'User completing 50-60 transactions in Somnia Guess.',
  'User completing 60+ transactions in Somnia Guess.'
];

const badgeThresholds = [
  3,  // Starter: 1-3 tx
  8,  // Explorer: 4-8 tx
  12, // Scout: 9-12 tx
  16, // Guardiant: 13-16 tx
  20, // Elite: 17-20 tx
  25, // Catalyst: 21-25 tx
  30, // Voyager: 26-30 tx
  36, // Pinnacle: 31-36 tx
  41, // Titan: 37-41 tx
  49, // Master Guess: 42-49 tx
  60, // Legend Guess: 50-60 tx
  61  // MVP Guess: 60+ tx
];

interface BadgeProps {
  badgeNumber: number;
  completedTx: number;
  onMint?: (badgeNumber: number) => void;
}

interface BadgeUIProps extends BadgeProps {
  eligible: boolean;
  minted: boolean;
}

const Badge: React.FC<BadgeUIProps> = ({ badgeNumber, eligible, minted, onMint }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative"
    >
      <Card className="relative flex flex-col items-center justify-center px-8 py-6 bg-gradient-to-br from-[#181f3a]/80 via-[#33396C]/60 to-[#0f172a]/90 border border-[#33396C] rounded-2xl shadow-2xl w-full max-w-sm min-h-[192px] mx-auto overflow-hidden transition-transform duration-200">
        <img
          src={badgeImages[badgeNumber - 1]}
          alt={badgeNames[badgeNumber - 1]}
          className="max-w-full max-h-38 object-contain shadow-xl mb-3"
          style={{ aspectRatio: '1/1', background: 'transparent' }}
        />
        <div className="text-sm text-white/80 mb-3 text-center min-h-[38px]">
          {badgeDescriptions[badgeNumber - 1]}
        </div>
        <Button
          className="w-full bg-gradient-to-br from-purple-700 via-blue-700 to-emerald-600 text-white font-bold rounded-xl py-3 px-6 shadow-2xl hover:from-purple-600 hover:to-emerald-500 transition-all duration-200 text-base tracking-wide border-0 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          disabled={!eligible || minted}
          onClick={() => {
            if (eligible && !minted && onMint) onMint(badgeNumber);
          }}
        >
          {minted ? 'Complete' : eligible ? 'Mint Badge' : 'Locked'}
        </Button>
        {(!eligible || minted) && (
          <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-br from-black/80 via-[#181f3a]/80 to-[#33396C]/80 rounded-2xl flex flex-col items-center justify-center z-20 border-2 border-purple-900/40">
            {minted ? (
              // SVG centang hijau
              <svg className="w-10 h-10 text-emerald-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              // SVG kunci
              <svg className="w-10 h-10 text-white/60 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 17a2 2 0 002-2v-2a2 2 0 00-2-2 2 2 0 00-2 2v2a2 2 0 002 2zm6-2V9a6 6 0 10-12 0v6" />
              </svg>
            )}
            <span className="text-sm text-slate-300">
              {minted
                ? 'Mint Complete'
                : `Complete ${badgeThresholds[badgeNumber - 1]} tx to unlock`}
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  );
};


const BadgeTab: React.FC = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [completedTx, setCompletedTx] = useState<number>(0);

  const [eligibles, setEligibles] = useState<boolean[]>(Array(BADGE_COUNT).fill(false));
  const [hasMinted, setHasMinted] = useState<boolean[]>(Array(BADGE_COUNT).fill(false));
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch eligibility and minted status from contract
  const fetchEligibilityAndMinted = async (addr: string) => {
    setLoading(true);
    try {
      // Prepare all eligibility calls
      const eligiblePromises = Array.from({ length: BADGE_COUNT }, (_, i) =>
        publicClient.readContract({
          address: BADGE_CONTRACT_ADDRESS,
          abi: BADGE_CONTRACT_ABI,
          functionName: 'isEligibleForBadge',
          args: [addr as `0x${string}`, i],
        }).then(
          (res) => Boolean(res),
          () => false
        )
      );
      // Prepare all minted calls
      const mintedPromises = Array.from({ length: BADGE_COUNT }, (_, i) =>
        publicClient.readContract({
          address: BADGE_CONTRACT_ADDRESS,
          abi: BADGE_CONTRACT_ABI,
          functionName: 'hasMintedBadge',
          args: [addr as `0x${string}`, i],
        }).then(
          (res) => Boolean(res),
          () => false
        )
      );
      // Run all in parallel
      const [eligibleArr, mintedArr] = await Promise.all([
        Promise.all(eligiblePromises),
        Promise.all(mintedPromises)
      ]);
      setEligibles(eligibleArr);
      setHasMinted(mintedArr);
    } catch (error) {
      console.error('Error fetching eligibility/minted:', error);
    }
    setLoading(false);
  };

  // Fungsi mint badge
  const handleMintBadge = async (badgeNumber: number) => {
    if (!address || !walletClient) return;
    setLoading(true);
    try {
      // Mint badge via wallet client (Metamask)
      // badgeType dimulai dari 0
      const tx = await walletClient.writeContract({
        address: BADGE_CONTRACT_ADDRESS,
        abi: BADGE_CONTRACT_ABI,
        functionName: 'mintBadge',
        args: [badgeNumber - 1],
        account: address as `0x${string}`,
        chain: somniaTestnet,
      });
      // Refresh status setelah mint
      await fetchEligibilityAndMinted(address);
    } catch (error) {
      console.error('Error minting badge:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!address || !publicClient) return;
    fetchEligibilityAndMinted(address);
  }, [address, publicClient]);

  return (
    <BackgroundGradientAnimation>
      <Navbar />
      <div className="min-h-screen w-full flex flex-col items-center py-10 font-sans">
      <div className="w-full max-w-3xl flex flex-col items-center mb-10 px-4">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight font-display">Guessis OnChain Badge</h1>
          <div className="text-lg text-white/80 mb-2 text-center max-w-xl font-normal">Play Somnia Guess, complete transactions, unlock exclusive badge rewards!</div>
          <div className="flex flex-col items-center gap-1 mt-2">
            <span className="text-sm text-white/60 font-normal">Powered by</span>
            <div className="flex items-center gap-2">
              <img src={guessexplorer} alt="Somnia Guess Logo" className="w-6 h-6" />
              <span className="text-lg font-bold text-white font-display">Somnia Guess</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-white/60 font-normal">Follow on</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1227" className="w-4 h-4 text-white/80" fill="currentColor">
                <path d="M1142 0H893.7L600 396.7 306.3 0H58L491.7 591.7 0 1267h248.3l351.7-485.3L951.7 1267H1200L708.3 591.7 1142 0ZM300.7 112.7h98.3l500.3 701.3h-98.3L300.7 112.7ZM180.7 1154.7l-61.3-86.7L600 491.7l61.3 86.7-480.6 576.3ZM899.3 1127.3l-500.3-701.3h98.3l500.3 701.3h-98.3ZM1019.3 72.3l61.3 86.7L600 735.3l-61.3-86.7L1019.3 72.3Z"/>
              </svg>
              <a href="https://x.com/somguess" target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-400 hover:underline font-bold">@somguess</a>
            </div>
          </div>
        </div>
        <div className="w-full max-w-5xl flex flex-col md:flex-row md:items-center md:justify-between px-4 mb-10 gap-6">
          <div className="flex items-center gap-4 mb-2 md:mb-0">
            <h2 className="text-xl font-bold text-white font-display">My Badge Collection</h2>
            <span className="text-white/60 text-lg font-medium">({hasMinted.filter(Boolean).length}/{BADGE_COUNT})</span>
          </div>
          <div className="flex flex-row gap-3 overflow-x-auto pb-2">
            {Array.from({ length: BADGE_COUNT }).map((_, idx) => (
              hasMinted[idx] ? (
                <div key={idx} className="w-14 h-14 bg-white/0 border-2 border-emerald-400 rounded-xl flex items-center justify-center shadow overflow-hidden">
                  <img src={badgeImages[idx]} alt={`Badge ${idx + 1}`} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div key={idx} className="w-14 h-14 bg-white/5 border-2 border-white/20 rounded-xl flex items-center justify-center opacity-60 overflow-hidden">
                  {/* Empty for uncollected badge */}
                </div>
              )
            ))}
          </div>
        </div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl px-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08
              }
            }
          }}
        >
          {Array.from({ length: BADGE_COUNT }).map((_, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 16 } }
              }}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(0,255,255,0.12)' }}
              whileTap={{ scale: 0.98 }}
            >
          <Badge
            badgeNumber={idx + 1}
            completedTx={completedTx}
            eligible={eligibles[idx]}
            minted={hasMinted[idx]}
            onMint={handleMintBadge}
          />
            </motion.div>
          ))}
        </motion.div>
      </div>
      <Footer />
    </BackgroundGradientAnimation>
  );
};

export default BadgeTab;