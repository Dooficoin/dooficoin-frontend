import { useState, useEffect } from 'react'
import { Pickaxe, Zap, Clock, TrendingUp, Play, Pause, BarChart3 } from 'lucide-react'

export function Mining({ player, token, onPlayerUpdate }) {
  const [miningStatus, setMiningStatus] = useState(null)
  const [miningStats, setMiningStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    fetchMiningStatus()
    fetchMiningStats()
    
    // Update timer every second
    const interval = setInterval(() => {
      if (miningStatus?.is_mining && miningStatus?.end_time) {
        const now = new Date()
        const endTime = new Date(miningStatus.end_time)
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
        setTimeRemaining(remaining)
        
        if (remaining === 0) {
          fetchMiningStatus()
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [miningStatus?.is_mining])

  const fetchMiningStatus = async () => {
    try {
      const response = await fetch('/api/mining/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMiningStatus(data)
        
        if (data.end_time) {
          const now = new Date()
          const endTime = new Date(data.end_time)
          const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
          setTimeRemaining(remaining)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar status de mineração:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMiningStats = async () => {
    try {
      const response = await fetch('/api/mining/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMiningStats(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas de mineração:', error)
    }
  }

  const startMining = async () => {
    try {
      const response = await fetch('/api/mining/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMiningStatus(data.session)
        onPlayerUpdate(data.player)
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao iniciar mineração:', error)
      alert('Erro ao iniciar mineração')
    }
  }

  const stopMining = async () => {
    try {
      const response = await fetch('/api/mining/stop', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMiningStatus(data.session)
        onPlayerUpdate(data.player)
        fetchMiningStats()
        alert(`Mineração concluída! Você ganhou ${data.reward.amount} DOOF`)
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao parar mineração:', error)
      alert('Erro ao parar mineração')
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const formatDoofiCoin = (amount) => {
    const num = parseFloat(amount || 0)
    if (num === 0) return '0'
    if (num < 0.000001) {
      return num.toExponential(6)
    }
    return num.toFixed(12)
  }

  const getMiningLevel = () => {
    if (!miningStats) return 1
    const totalSessions = miningStats.total_sessions
    return Math.floor(totalSessions / 10) + 1
  }

  const getNextLevelProgress = () => {
    if (!miningStats) return 0
    const totalSessions = miningStats.total_sessions
    const currentLevelSessions = totalSessions % 10
    return (currentLevelSessions / 10) * 100
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
          <Pickaxe className="w-8 h-8 mr-3 text-purple-400" />
          Mineração de DoofiCoin
        </h1>
        <p className="text-gray-400">
          Mine DoofiCoin automaticamente e aumente seus ganhos ao longo do tempo
        </p>
      </div>

      {/* Mining Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Zap className="w-6 h-6 mr-2 text-yellow-400" />
            Status da Mineração
          </h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            miningStatus?.is_mining 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-600 text-gray-300'
          }`}>
            {miningStatus?.is_mining ? 'Ativa' : 'Inativa'}
          </div>
        </div>

        {miningStatus?.is_mining ? (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Progresso da Mineração</span>
                <span className="text-white font-semibold">
                  {formatTime(timeRemaining)} restantes
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${miningStatus.duration_minutes > 0 
                      ? ((miningStatus.duration_minutes * 60 - timeRemaining) / (miningStatus.duration_minutes * 60)) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>

            {/* Mining Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Recompensa Estimada</p>
                <p className="text-yellow-400 font-bold text-lg">
                  {formatDoofiCoin(miningStatus.estimated_reward)} DOOF
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Duração</p>
                <p className="text-blue-400 font-bold text-lg">
                  {miningStatus.duration_minutes} minutos
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Iniciado em</p>
                <p className="text-purple-400 font-bold text-lg">
                  {new Date(miningStatus.start_time).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Stop Button */}
            <div className="text-center">
              <button
                onClick={stopMining}
                disabled={timeRemaining > 0}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  timeRemaining > 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <Pause className="w-5 h-5 inline mr-2" />
                {timeRemaining > 0 ? 'Aguarde...' : 'Coletar Recompensa'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-gray-400">
              <Pickaxe className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>A mineração está parada. Inicie uma nova sessão para começar a ganhar DoofiCoin!</p>
            </div>
            
            <button
              onClick={startMining}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
            >
              <Play className="w-5 h-5 inline mr-2" />
              Iniciar Mineração
            </button>
          </div>
        )}
      </div>

      {/* Mining Statistics */}
      {miningStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats Overview */}
          <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
              Estatísticas Gerais
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total de Sessões:</span>
                <span className="text-white font-semibold">{miningStats.total_sessions}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Minerado:</span>
                <span className="text-yellow-400 font-semibold">
                  {formatDoofiCoin(miningStats.total_mined)} DOOF
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Tempo Total:</span>
                <span className="text-blue-400 font-semibold">
                  {Math.floor(miningStats.total_time_minutes / 60)}h {miningStats.total_time_minutes % 60}m
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Média por Sessão:</span>
                <span className="text-green-400 font-semibold">
                  {formatDoofiCoin(miningStats.average_per_session)} DOOF
                </span>
              </div>
            </div>
          </div>

          {/* Mining Level */}
          <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
              Nível de Mineração
            </h3>
            
            <div className="text-center space-y-4">
              <div>
                <p className="text-3xl font-bold text-purple-400 mb-2">
                  Nível {getMiningLevel()}
                </p>
                <p className="text-gray-400 text-sm">
                  Mineradores de nível mais alto ganham mais DoofiCoin
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Progresso para o próximo nível</span>
                  <span className="text-white text-sm">
                    {miningStats.total_sessions % 10}/10 sessões
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getNextLevelProgress()}%` }}
                  />
                </div>
              </div>
              
              <div className="text-sm text-gray-400">
                <p>Bônus atual: +{(getMiningLevel() - 1) * 10}% de recompensa</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mining Tips */}
      <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-green-400" />
          Dicas de Mineração
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
              <p className="text-gray-300">
                A mineração fica mais eficiente conforme você sobe de nível
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
              <p className="text-gray-300">
                Cada sessão de mineração dura exatamente 10 minutos
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
              <p className="text-gray-300">
                Você pode iniciar uma nova sessão assim que a anterior terminar
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
              <p className="text-gray-300">
                A recompensa é calculada automaticamente baseada no seu nível
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

