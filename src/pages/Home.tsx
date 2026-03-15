import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, GameRecord, User } from '../lib/api';
import { Trophy, Swords, Bot, Medal, History } from 'lucide-react';

export function Home() {
  const { user, token } = useAuth();
  const [games, setGames] = useState<GameRecord[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return;
        const [gamesData, leaderboardData] = await Promise.all([
          api.getMyGames(token).catch(() => []),
          api.getLeaderboard().catch(() => [])
        ]);
        setGames(gamesData);
        setLeaderboard(leaderboardData.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Main Content Area */}
          <div className="w-full md:w-2/3 space-y-8">
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4a843]/5 blur-[80px] rounded-full pointer-events-none" />
              <h2 className="text-4xl font-black uppercase italic tracking-tight mb-2 relative z-10">
                Welcome back, <span className="text-[#d4a843]">{user.username}</span>
              </h2>
              <p className="text-gray-400 font-medium mb-8 relative z-10">
                Your current ELO standing is <strong className="text-white text-xl">{user.elo}</strong>
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                <Link to="/game" className="group bg-[#0a0a0a] border border-[#2a2a2a] hover:border-[#d4a843]/50 rounded-2xl p-6 transition-all hover:bg-[#1a1a1a] flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#d4a843]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Swords className="w-8 h-8 text-[#d4a843]" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg uppercase tracking-wider">Play vs Friend</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Multiplayer Match</p>
                  </div>
                </Link>
                
                <Link to="/game" className="group bg-[#0a0a0a] border border-[#2a2a2a] hover:border-[#d4a843]/50 rounded-2xl p-6 transition-all hover:bg-[#1a1a1a] flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#d4a843]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bot className="w-8 h-8 text-[#d4a843]" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg uppercase tracking-wider">Play vs Bot</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Practice Mode</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-[#141414] border border-[#2a2a2a] rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <History className="text-[#d4a843] w-6 h-6" />
                <h3 className="font-black text-xl uppercase italic tracking-wide">Recent Matches</h3>
              </div>
              
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-[#2a2a2a] rounded-xl" />
                  ))}
                </div>
              ) : games.length > 0 ? (
                <div className="space-y-3">
                  {games.map(game => {
                    const isWin = game.winnerId === user.id;
                    const isDraw = !game.winnerId && game.status !== 'playing';
                    const opponentName = game.whiteId === user.id 
                      ? (game.black?.username || `Opponent (${game.blackId.substring(0, 4)})`)
                      : (game.white?.username || `Opponent (${game.whiteId.substring(0, 4)})`);

                    return (
                      <div key={game.id} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#2a2a2a]">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${isWin ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : isDraw ? 'bg-yellow-500' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                          <div>
                            <p className="font-bold text-sm">
                              vs {opponentName}
                            </p>
                            <p className="text-xs text-gray-500">{new Date(game.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest border border-[#2a2a2a] px-3 py-1 rounded-full text-gray-400">
                          {game.status === 'playing' ? 'In Progress' : (isWin ? 'Victory' : isDraw ? 'Draw' : 'Defeat')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm font-bold uppercase tracking-widest">No matches found</p>
                  <p className="text-xs mt-1">Your journey begins when you play your first game.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="w-full md:w-1/3 bg-[#141414] border border-[#2a2a2a] rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="text-[#d4a843] w-6 h-6" />
              <h3 className="font-black text-xl uppercase italic tracking-wide">Leaderboard</h3>
            </div>

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-[#2a2a2a] rounded-xl" />
                ))}
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-xl border border-[#2a2a2a]">
                    <div className="flex items-center gap-3">
                      <span className={`font-black w-6 text-center ${index === 0 ? 'text-[#d4a843]' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-700' : 'text-gray-600'}`}>
                        {index + 1}
                      </span>
                      <span className="font-bold">{player.username}</span>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-[#d4a843] bg-[#d4a843]/10 px-2 py-1 rounded-md">
                      {player.elo}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Medal className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Leaderboard Empty</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
