import { useState, useEffect } from 'react'
import { Trophy, Medal, Crown, Star, TrendingUp, Users } from 'lucide-react'

export function Leaderboard({ player, token }) {
  const [leaderboards, setLeaderboards] = useState({
    level: [],
    monsters: [],
    players_killed: []
  })
  const [activeTab, setActiveTab] = useState('level')
  const [loading, setLoading] = useState(true)

  const tabs = [
    { id: 'level', label: 'Nível', icon: Star },
    { id: 'monsters', label: 'Monstros', icon: Trophy },
    { id: 'players_killed', label: 'PvP', icon: Crown }
  ]

  useEffect(() => {
    fetchLeaderboards()
  }, [])

  const fetchLeaderboards = async () => {
    try {
      const promises = tabs.map(tab => 
        fetch(`/api/level/leaderboard/${tab.id}?limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json())
      )

      const results = await Promise.all(promises)
      
      setLeaderboards({
        level: results[0].leaderboard || [],
        monsters: results[1].leaderboard || [],
        players_killed: results[2].leaderboard || []
      })
    } catch (error) {
      console.error('Erro ao carregar leaderboards:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">#{position}</span>
    }
  }

  const getRankBadge = (position) => {
    if (position <= 3) {
      const colors = {
        1: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
        2: 'bg-gradient-to-r from-gray-300 to-gray-500',
        3: 'bg-gradient-to-r from-amber-600 to-amber-800'
      }
      return colors[position]
    }
    return 'bg-gray-700'
  }

  const getStatLabel = (tab) => {
    switch (tab) {
      case 'level':
        return 'Nível'
      case 'monsters':
        return 'Monstros Mortos'
      case 'players_killed':
        return 'Jogadores Mortos'
      default:
        return 'Pontos'
    }
  }

  const getStatValue = (entry, tab) => {
    switch (tab) {
      case 'level':
        return entry.level
      case 'monsters':
        return entry.monsters_killed
      case 'players_killed':
        return entry.players_killed
      default:
        return 0
    }
  }

  const findPlayerRank = (leaderboard) => {
    return leaderboard.findIndex(entry => entry.username === player.username) + 1
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  const currentLeaderboard = leaderboards[activeTab]
  const playerRank = findPlayerRank(currentLeaderboard)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
          <Trophy className="w-8 h-8 mr-3 text-yellow-400" />
          Ranking Global
        </h1>
        <p className="text-gray-400">
          Veja os melhores jogadores em diferentes categorias
        </p>
      </div>

      {/* Player Stats */}
      <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Users className="w-6 h-6 mr-2 text-purple-400" />
          Sua Posição
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tabs.map((tab) => {
            const rank = findPlayerRank(leaderboards[tab.id])
            const Icon = tab.icon
            
            return (
              <div key={tab.id} className="bg-gray-700 rounded-lg p-4 text-center">
                <Icon className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <p className="text-gray-400 text-sm">{tab.label}</p>
                <p className="text-2xl font-bold text-white">
                  {rank > 0 ? `#${rank}` : 'N/A'}
                </p>
                <p className="text-gray-400 text-xs">
                  {getStatValue({ 
                    level: player.level, 
                    monsters_killed: player.monsters_killed || 0,
                    players_killed: player.players_killed || 0
                  }, tab.id)} {getStatLabel(tab.id).toLowerCase()}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Leaderboard */}
      <div className="bg-gray-800 rounded-lg border border-purple-500/20 overflow-hidden">
        <div className="bg-gray-700 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Ranking por {getStatLabel(activeTab)}
          </h3>
        </div>

        <div className="divide-y divide-gray-700">
          {currentLeaderboard.map((entry, index) => {
            const position = index + 1
            const isCurrentPlayer = entry.username === player.username
            
            return (
              <div
                key={entry.username}
                className={`flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors ${
                  isCurrentPlayer ? 'bg-purple-900/30 border-l-4 border-purple-500' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getRankBadge(position)}`}>
                    {getRankIcon(position)}
                  </div>

                  {/* Player Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-bold ${isCurrentPlayer ? 'text-purple-300' : 'text-white'}`}>
                        {entry.username}
                      </h4>
                      {isCurrentPlayer && (
                        <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                          Você
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      Nível {entry.level} • Fase {entry.current_phase || 1}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {getStatValue(entry, activeTab).toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {getStatLabel(activeTab)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {currentLeaderboard.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Nenhum dado disponível
            </h3>
            <p className="text-gray-500">
              O ranking será atualizado conforme os jogadores progridem.
            </p>
          </div>
        )}
      </div>

      {/* Player Rank Info */}
      {playerRank > 0 && playerRank > 10 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/20">
          <div className="text-center">
            <p className="text-gray-400 mb-2">
              Você está na posição <span className="text-purple-400 font-bold">#{playerRank}</span> no ranking de {getStatLabel(activeTab).toLowerCase()}
            </p>
            <p className="text-gray-500 text-sm">
              Continue jogando para subir no ranking!
            </p>
          </div>
        </div>
      )}

      {/* Ranking Info */}
      <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20">
        <h3 className="text-lg font-bold text-white mb-4">
          Como Funciona o Ranking
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">Nível</span>
            </div>
            <p className="text-gray-400">
              Baseado no nível atual do jogador. Suba de nível matando monstros e outros jogadores.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-medium">Monstros</span>
            </div>
            <p className="text-gray-400">
              Total de monstros eliminados em todos os cenários e batalhas.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-red-400" />
              <span className="text-white font-medium">PvP</span>
            </div>
            <p className="text-gray-400">
              Jogadores eliminados em combate PvP. Ganhe 20% das moedas do adversário.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

