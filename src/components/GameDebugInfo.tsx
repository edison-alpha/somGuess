import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GameDebugInfoProps {
  gameState: any;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  gamePhase: string;
}

export function GameDebugInfo({ 
  gameState, 
  isPending, 
  isConfirming, 
  isConfirmed, 
  gamePhase 
}: GameDebugInfoProps) {
  return (
    <Card className="mt-4 bg-slate-800/50 border-slate-600">
      <CardHeader>
        <CardTitle className="text-sm text-slate-300">Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Game Phase:</span>
          <Badge variant="outline">{gamePhase}</Badge>
        </div>
        <div className="flex justify-between">
          <span>Is Playing:</span>
          <Badge variant={gameState.isPlaying ? "default" : "secondary"}>
            {gameState.isPlaying ? "Yes" : "No"}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Is Waiting:</span>
          <Badge variant={gameState.isWaiting ? "default" : "secondary"}>
            {gameState.isWaiting ? "Yes" : "No"}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Transaction:</span>
          <div className="flex gap-1">
            <Badge variant={isPending ? "destructive" : "secondary"} className="text-xs">
              Pending: {isPending ? "Yes" : "No"}
            </Badge>
            <Badge variant={isConfirming ? "destructive" : "secondary"} className="text-xs">
              Confirming: {isConfirming ? "Yes" : "No"}
            </Badge>
            <Badge variant={isConfirmed ? "default" : "secondary"} className="text-xs">
              Confirmed: {isConfirmed ? "Yes" : "No"}
            </Badge>
          </div>
        </div>
        {gameState.txHash && (
          <div className="flex justify-between">
            <span>TX Hash:</span>
            <span className="text-blue-400 font-mono text-xs break-all">
              {gameState.txHash.substring(0, 10)}...{gameState.txHash.substring(gameState.txHash.length - 8)}
            </span>
          </div>
        )}
        {gameState.selectedNumber && (
          <div className="flex justify-between">
            <span>Selected Number:</span>
            <Badge variant="outline">{gameState.selectedNumber}</Badge>
          </div>
        )}
        <div className="flex justify-between">
          <span>Bet Amount:</span>
          <Badge variant="outline">{gameState.betAmount} STT</Badge>
        </div>
        {gameState.gameResult && (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Game Result:</span>
              <Badge variant={gameState.gameResult.isWinner ? "default" : "destructive"}>
                {gameState.gameResult.isWinner ? "Winner" : "Loser"}
              </Badge>
            </div>
            {gameState.gameResult.actualNumber && (
              <div className="flex justify-between">
                <span>Winning Number:</span>
                <Badge variant="outline">{gameState.gameResult.actualNumber}</Badge>
              </div>
            )}
            {gameState.gameResult.payout > 0 && (
              <div className="flex justify-between">
                <span>Payout:</span>
                <Badge variant="default">{gameState.gameResult.payout.toFixed(3)} STT</Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
