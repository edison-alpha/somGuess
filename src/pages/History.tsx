import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Construction } from 'lucide-react';

const History: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 hover:bg-black/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Game</span>
              </Button>
              <h1 className="text-3xl font-bold text-white">Game History</h1>
            </div>
          </div>

          {/* Coming Soon Card */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-12 text-center">
              <div className="text-white/80 mb-6">
                <Construction className="w-20 h-20 mx-auto mb-6 text-purple-400" />
                <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
                <p className="text-lg mb-4">Game History feature is under development</p>
                <p className="text-white/60">
                  We're working hard to bring you detailed game statistics and history tracking.
                  <br />
                  Stay tuned for the next update!
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-white/50 mt-8">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Wait for next update</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default History;
