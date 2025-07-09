import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import somImage from '@/img/som.png';

interface BetInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  disabled?: boolean;
}

export function BetInput({ value, onChange, min, max, disabled = false }: BetInputProps) {
  // Valid bet amounts according to your smart contract
  const validBetAmounts = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0];
  
  const [inputValue, setInputValue] = useState(value.toString());

  const handleInputChange = (newValue: string) => {
    const numValue = parseFloat(newValue);
    // Only allow valid bet amounts
    if (!isNaN(numValue) && validBetAmounts.includes(numValue)) {
      setInputValue(newValue);
      onChange(numValue);
    }
  };

  const adjustBet = (direction: 'up' | 'down') => {
    const currentIndex = validBetAmounts.indexOf(value);
    let newIndex;
    
    if (direction === 'up' && currentIndex < validBetAmounts.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'down' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else {
      return; // No change needed
    }
    
    const newValue = validBetAmounts[newIndex];
    setInputValue(newValue.toString());
    onChange(newValue);
  };

  const quickBets = validBetAmounts;

  return (
    <Card className="bg-transparent p-0 shadow-none border-0">
        <CardTitle className="text-base font-bold text-white text-center mb-2">
          Place Your Bet
        </CardTitle>
      <CardContent className="space-y-2">
        {/* Bet Amount Input */}
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustBet('down')}
            disabled={disabled || validBetAmounts.indexOf(value) <= 0}
            className={cn(
              "relative border-2 overflow-hidden group rounded-lg transition-all duration-500 h-8 w-8",
              "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 border-slate-600/50",
              "hover:border-slate-500/70",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale"
            )}
          >
            {/* Som background pattern */}
            <div 
              className="absolute inset-0 opacity-10 bg-repeat bg-center"
              style={{
                backgroundImage: `url('${somImage}')`,
                backgroundSize: '10px 10px'
              }}
            />
            <Minus className="h-3 w-3 relative z-10" />
          </Button>
          
          <div className="flex-1 relative">
            <select
              value={value}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value);
                setInputValue(newValue.toString());
                onChange(newValue);
              }}
              disabled={disabled}
              className={cn(
                "w-full text-center font-mono text-base relative",
                "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800",
                "border-2 border-slate-600/50 rounded-lg",
                "focus:border-neon-cyan focus:ring-neon-cyan/50",
                "hover:border-neon-purple/50 transition-all duration-300",
                "text-white appearance-none h-8 px-6",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale"
              )}
            >
              {validBetAmounts.map((amount) => (
                <option key={amount} value={amount} className="bg-black text-white">
                  {amount} STT
                </option>
              ))}
            </select>
            {/* Som logo in input */}
            <div 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-center bg-no-repeat bg-contain opacity-60 pointer-events-none"
              style={{
                backgroundImage: `url('${somImage}')`
              }}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              STT
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustBet('up')}
            disabled={disabled || validBetAmounts.indexOf(value) >= validBetAmounts.length - 1}
            className={cn(
              "relative border-2 overflow-hidden group rounded-lg transition-all duration-500 h-8 w-8",
              "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 border-slate-600/50",
              "hover:border-slate-500/70",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale"
            )}
          >
            {/* Som background pattern */}
            <div 
              className="absolute inset-0 opacity-10 bg-repeat bg-center"
              style={{
                backgroundImage: `url('${somImage}')`,
                backgroundSize: '10px 10px'
              }}
            />
            <Plus className="h-3 w-3 relative z-10" />
          </Button>
        </div>

        {/* Quick Bet Buttons */}
        <div className="grid grid-cols-3 gap-1">
          {quickBets.map((amount) => (
            <div key={amount}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInputValue(amount.toString());
                  onChange(amount);
                }}
                disabled={disabled}
                className={cn(
                  "relative h-12 w-full overflow-hidden group rounded-lg transition-all duration-500",
                  "border-2 flex items-center justify-center text-xs font-bold",
                  // Base styling dengan crypto theme seperti GameCard
                  "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 border-slate-600/50",
                  // Hover effects
                  "hover:border-slate-500/70",
                  // Disabled state
                  disabled && "cursor-not-allowed opacity-50 grayscale",
                  // Selected state dengan neon effect
                  value === amount && [
                    "border-neon-purple/80 bg-gradient-to-br from-purple-900/50 via-blue-900/40 to-purple-900/50",
                    "animate-pulse-neon"
                  ],
                  // Default state
                  value !== amount && "hover:border-neon-purple/50 hover:bg-neon-purple/10"
                )}
              >
                {/* Som background pattern dengan warna asli */}
                <div 
                  className="absolute inset-0 opacity-10 bg-repeat bg-center"
                  style={{
                    backgroundImage: `url('${somImage}')`,
                    backgroundSize: '15px 15px'
                  }}
                />
                
                {/* Crypto-themed border pattern */}
                <div className="absolute inset-1 border border-slate-700/50 rounded-md bg-gradient-to-br from-slate-800/50 to-slate-900/50" />
                
                {/* Subtle glow effect untuk crypto theme */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent opacity-50" />
                
                {/* Som image in corners dengan warna asli */}
                <div 
                  className="absolute top-1 left-1 w-2 h-2 bg-center bg-no-repeat bg-contain opacity-80"
                  style={{
                    backgroundImage: `url('${somImage}')`
                  }}
                />
                <div 
                  className="absolute bottom-1 right-1 w-2 h-2 bg-center bg-no-repeat bg-contain opacity-80 rotate-180"
                  style={{
                    backgroundImage: `url('${somImage}')`
                  }}
                />
                
                {/* Selected state overlay */}
                {value === amount && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-lg" />
                )}
                
                {/* Main amount display */}
                <span className={cn(
                  "relative z-10 transition-all duration-300",
                  "text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-300",
                  "font-bold tracking-wide text-xs",
                  // Selected state
                  value === amount && "from-neon-cyan via-neon-purple to-neon-pink animate-glow"
                )}>
                  {amount}
                </span>
              </Button>
            </div>
          ))}
        </div>

        {/* Bet Info */}
        <div className="text-center space-y-0">
          <p className="text-xs text-muted-foreground">
            Valid amounts: 0.01, 0.05, 0.1, 0.25, 0.5, 1.0 STT
          </p>
          <p className="text-xs font-medium text-neon-green">
            Potential Win: {(value * 2).toFixed(2)} STT
          </p>
        </div>
      </CardContent>
    </Card>
  );
}