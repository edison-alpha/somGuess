import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWriteContract, useAccount, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import { GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI, somniaTestnet } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

export const ContractTester: React.FC = () => {
  const { address } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const { toast } = useToast();
  const [testNumber, setTestNumber] = useState('7');
  const [testBetAmount, setTestBetAmount] = useState('0.01');

  // Get contract balance
  const { data: contractBalance } = useBalance({
    address: GAME_CONTRACT_ADDRESS,
    chainId: somniaTestnet.id,
  });

  // Valid bet amounts according to your contract
  const validBetAmounts = ['0.01', '0.05', '0.1', '0.25', '0.5', '1.0'];

  const testContract = async () => {
    if (!address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      const numberInt = parseInt(testNumber);
      
      // Validate number range (1-10 for your contract)
      if (numberInt < 1 || numberInt > 10) {
        toast({
          title: "Invalid Number",
          description: "Number must be between 1 and 10",
          variant: "destructive",
        });
        return;
      }

      // Validate bet amount
      if (!validBetAmounts.includes(testBetAmount)) {
        toast({
          title: "Invalid Bet Amount",
          description: "Bet amount must be 0.01, 0.05, 0.1, 0.25, 0.5, or 1.0 STT",
          variant: "destructive",
        });
        return;
      }

      const betWei = parseEther(testBetAmount);
      
      console.log('Testing contract with:');
      console.log('- Number:', numberInt);
      console.log('- Bet amount:', testBetAmount, 'STT');
      console.log('- Bet wei:', betWei.toString());
      console.log('- Address:', address);
      console.log('- Contract:', GAME_CONTRACT_ADDRESS);

      await writeContract({
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_CONTRACT_ABI,
        functionName: 'guessNumber',
        args: [BigInt(numberInt)],
        value: betWei,
        account: address,
        chain: somniaTestnet,
      });

      toast({
        title: "Test Transaction Sent",
        description: "Check console for details",
      });
    } catch (error: any) {
      console.error('Test transaction failed:', error);
      toast({
        title: "Test Failed",
        description: error.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-black/20 border-white/10">
      <CardHeader>
        <CardTitle className="text-sm text-white">Contract Tester</CardTitle>
        <div className="text-xs text-muted-foreground">
          Contract Balance: {contractBalance ? `${parseFloat(contractBalance.formatted).toFixed(4)} STT` : 'Loading...'}
        </div>
        {contractBalance && parseFloat(contractBalance.formatted) < 2 && (
          <div className="text-xs text-red-400 font-semibold">
            ⚠️ Contract balance too low! Minimum 2 STT needed for 1.0 STT bets.
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="testNumber" className="text-xs text-muted-foreground">
            Number (1-10)
          </Label>
          <Input
            id="testNumber"
            type="number"
            min="1"
            max="10"
            value={testNumber}
            onChange={(e) => setTestNumber(e.target.value)}
            className="bg-black/20 border-white/20 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="testBetAmount" className="text-xs text-muted-foreground">
            Bet Amount (STT)
          </Label>
          <select
            id="testBetAmount"
            value={testBetAmount}
            onChange={(e) => setTestBetAmount(e.target.value)}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 text-white rounded-md"
          >
            {validBetAmounts.map((amount) => (
              <option key={amount} value={amount} className="bg-black text-white">
                {amount} STT
              </option>
            ))}
          </select>
        </div>
        
        <Button
          onClick={testContract}
          disabled={isPending || !address}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isPending ? "Testing..." : "Test Contract"}
        </Button>
        
        <div className="text-xs text-muted-foreground">
          This will send a real transaction. Your contract accepts numbers 1-10 and specific bet amounts only.
          <br />
          <strong>Contract needs minimum {parseFloat(testBetAmount) * 2} STT balance for this bet.</strong>
        </div>
      </CardContent>
    </Card>
  );
};
