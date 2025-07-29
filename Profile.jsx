import { useState, useEffect } from 'react'
import { User, Edit, Save, X, Eye, EyeOff, Shield, Wallet, Trophy, Star } from 'lucide-react'

export function Profile({ player, token, onPlayerUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [showWallet, setShowWallet] = useState(false)
  const [formData, setFormData] = useState({
    username: player.username || '',
    email: player.email || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [loading, setLoading] = useState(false)
  const [playerStats, setPlayerStats] = useState(null)

  useEffect(() => {
    fetchPlayerStats()
  }, [])

  const fetchPlayerStats = async () => {
    try {
      const response = await fetch('/api/profile/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPlayerStats(data.stats)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      alert('As senhas não coincidem!')
      return
    }

    setLoading(true)
    
    try {
      const updateData = {
        username: formData.username,
        email: formData.email
      }

      if (formData.new_password) {
        updateData.current_password = formData.current_password
        updateData.new_password = formData.new_password
      }

      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const data = await response.json()
        onPlayerUpdate(data.player)
        setIsEditing(false)
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }))
        alert('Perfil atualizado com sucesso!')
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      alert('Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      username: player.username || '',
      email: player.email || '',
      current_password: '',
      new_password: '',
      confirm_password: ''
    })
    setIsEditing(false)
  }

  const formatBalance = (balance) => {
    const num = parseFloat(balance || 0)
    if (num === 0) return '0'
    if (num < 0.000001) {
      return num.toExponential(6)
    }
    return num.toFixed(12)
  }

  const getPlayerLevel = () => {
    return player.level || 1
  }

  const getNextLevelProgress = () => {
    // Assumindo que cada nível precisa de 100 pontos de experiência
    const currentExp = (player.monsters_killed || 0) + (player.players_killed || 0) * 5
    const currentLevelExp = (getPlayerLevel() - 1) * 100
    const nextLevelExp = getPlayerLevel() * 100
    const progress = ((currentExp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
    return Math.min(100, Math.max(0, progress))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
          <User className="w-8 h-8 mr-3 text-purple-400" />
          Perfil do Jogador
        </h1>
        <p className="text-gray-400">
          Gerencie suas informações pessoais e veja suas estatísticas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-400" />
                Informações Pessoais
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Nome de Usuário</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-white font-medium mb-4">Alterar Senha (opcional)</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Senha Atual</label>
                      <input
                        type="password"
                        name="current_password"
                        value={formData.current_password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Nova Senha</label>
                      <input
                        type="password"
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Confirmar Nova Senha</label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Nome de Usuário</label>
                  <p className="text-white text-lg">{player.username}</p>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Email</label>
                  <p className="text-white text-lg">{player.email}</p>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Membro desde</label>
                  <p className="text-white text-lg">
                    {new Date(player.created_at || Date.now()).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Wallet Info */}
          <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Wallet className="w-6 h-6 mr-2 text-yellow-400" />
                Carteira DoofiCoin
              </h2>
              <button
                onClick={() => setShowWallet(!showWallet)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                {showWallet ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showWallet ? 'Ocultar' : 'Mostrar'}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Saldo Atual</label>
                <p className="text-2xl font-bold text-yellow-400">
                  {showWallet ? `${formatBalance(player.wallet_balance)} DOOF` : '••••••••••••'}
                </p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Endereço da Carteira</label>
                <p className="text-white font-mono text-sm bg-gray-700 p-2 rounded">
                  {showWallet ? (player.wallet_address || 'Não configurado') : '••••••••••••••••••••••••••••••••••••••••'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Level Progress */}
          <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-purple-400" />
              Progresso de Nível
            </h3>
            
            <div className="text-center space-y-4">
              <div>
                <p className="text-3xl font-bold text-purple-400 mb-2">
                  Nível {getPlayerLevel()}
                </p>
                <p className="text-gray-400 text-sm">
                  Fase {player.current_phase || 1}
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Progresso</span>
                  <span className="text-white text-sm">
                    {getNextLevelProgress().toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getNextLevelProgress()}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Game Stats */}
          <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
              Estatísticas de Jogo
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Monstros Mortos:</span>
                <span className="text-white font-semibold">{player.monsters_killed || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Jogadores Mortos:</span>
                <span className="text-white font-semibold">{player.players_killed || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Mortes:</span>
                <span className="text-white font-semibold">{player.deaths || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Vida Atual:</span>
                <span className="text-red-400 font-semibold">{player.health || 100}/100</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Poder:</span>
                <span className="text-blue-400 font-semibold">{player.power || 0}/100</span>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          {playerStats && (
            <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20">
              <h3 className="text-lg font-bold text-white mb-4">
                Estatísticas Avançadas
              </h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Cenários Completos:</span>
                  <span className="text-green-400 font-semibold">
                    {playerStats.scenarios_completed || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Itens Coletados:</span>
                  <span className="text-blue-400 font-semibold">
                    {playerStats.items_collected || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Cartas Colecionadas:</span>
                  <span className="text-purple-400 font-semibold">
                    {playerStats.cards_collected || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Tempo Jogado:</span>
                  <span className="text-yellow-400 font-semibold">
                    {Math.floor((playerStats.play_time_minutes || 0) / 60)}h {(playerStats.play_time_minutes || 0) % 60}m
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

