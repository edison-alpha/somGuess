import { createClient } from '@supabase/supabase-js';

// Note: These would typically come from environment variables
// For now, using placeholder values - user needs to connect Supabase integration
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface GameResult {
  id: string;
  user_address: string;
  username?: string;
  bet_amount: number;
  chosen_number: number;
  winning_number: number;
  is_winner: boolean;
  payout: number;
  tx_hash: string;
  created_at: string;
}

export interface User {
  id: string;
  address: string;
  username?: string;
  total_games: number;
  total_winnings: number;
  total_losses: number;
  created_at: string;
  updated_at: string;
}

export interface Leaderboard {
  address: string;
  username?: string;
  total_winnings: number;
  games_won: number;
  games_played: number;
  win_rate: number;
}

// Database Functions
export const getUserProfile = async (address: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('address', address.toLowerCase())
    .single();

  return { data, error };
};

export const createOrUpdateUser = async (address: string, username?: string) => {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      address: address.toLowerCase(),
      username,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error };
};

export const saveGameResult = async (gameResult: Omit<GameResult, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('game_results')
    .insert({
      ...gameResult,
      user_address: gameResult.user_address.toLowerCase(),
    })
    .select()
    .single();

  return { data, error };
};

export const getGameHistory = async (address: string, limit = 50) => {
  const { data, error } = await supabase
    .from('game_results')
    .select('*')
    .eq('user_address', address.toLowerCase())
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
};

export const getLeaderboard = async (timeframe: 'all' | 'weekly' | 'daily' = 'all', limit = 100) => {
  let query = supabase
    .from('game_results')
    .select(`
      user_address,
      username,
      bet_amount,
      is_winner,
      payout,
      created_at
    `);

  // Apply time filters
  if (timeframe === 'weekly') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    query = query.gte('created_at', weekAgo.toISOString());
  } else if (timeframe === 'daily') {
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    query = query.gte('created_at', dayAgo.toISOString());
  }

  const { data, error } = await query;

  if (error) return { data: null, error };

  // Process data to create leaderboard
  const leaderboardMap = new Map<string, Leaderboard>();

  data?.forEach((game) => {
    const existing = leaderboardMap.get(game.user_address) || {
      address: game.user_address,
      username: game.username,
      total_winnings: 0,
      games_won: 0,
      games_played: 0,
      win_rate: 0,
    };

    existing.games_played += 1;
    if (game.is_winner) {
      existing.games_won += 1;
      existing.total_winnings += game.payout;
    }
    existing.win_rate = (existing.games_won / existing.games_played) * 100;

    leaderboardMap.set(game.user_address, existing);
  });

  const leaderboard = Array.from(leaderboardMap.values())
    .sort((a, b) => b.total_winnings - a.total_winnings)
    .slice(0, limit);

  return { data: leaderboard, error: null };
};