import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BetInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  disabled?: boolean;
}

export function BetInput({ value, onChange, min, max, disabled = false }: BetInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const adjustBet = (delta: number) => {
    const newValue = Math.max(min, Math.min(max, value + delta));
    setInputValue(newValue.toString());
    onChange(newValue);
  };

  const quickBets = [0.001, 0.01, 0.1, 1, 5];

  return (
    <Card className="bg-gradient-card border-2 border-border shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold bg-gradient-gaming bg-clip-text text-transparent">
          Place Your Bet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bet Amount Input */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustBet(-0.001)}
            disabled={disabled || value <= min}
            className="border-neon-purple/50 hover:border-neon-purple hover:bg-neon-purple/10"
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              type="number"
              step="0.001"
              min={min}
              max={max}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={disabled}
              className={cn(
                "text-center font-mono text-lg",
                "bg-input border-border focus:border-neon-cyan focus:ring-neon-cyan/50",
                "hover:border-neon-purple/50 transition-all duration-300"
              )}
              placeholder="0.001"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              STT
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustBet(0.001)}
            disabled={disabled || value >= max}
            className="border-neon-purple/50 hover:border-neon-purple hover:bg-neon-purple/10"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Quick Bet Buttons */}
        <div className="grid grid-cols-5 gap-2">
          {quickBets.map((amount) => (
            <motion.div key={amount} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={value === amount ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setInputValue(amount.toString());
                  onChange(amount);
                }}
                disabled={disabled}
                className={cn(
                  "text-xs font-medium transition-all duration-300",
                  value === amount 
                    ? "bg-gradient-gaming border-neon-purple shadow-neon" 
                    : "border-border hover:border-neon-purple/50 hover:bg-neon-purple/10"
                )}
              >
                {amount}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Bet Info */}
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">
            Min: {min} STT • Max: {max} STT
          </p>
          <p className="text-sm font-medium text-neon-green">
            Potential Win: {(value * 2).toFixed(3)} STT
          </p>
        </div>
      </CardContent>
    </Card>
  );
}