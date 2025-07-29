import { useState, useEffect } from 'react'
import { Map, MapPin, Globe, Building, Landmark, Zap, Users, Trophy, Star } from 'lucide-react'

export function Scenarios({ player, token, onPlayerUpdate }) {
  const [scenarios, setScenarios] = useState([])
  const [playerProgress, setPlayerProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [countries, setCountries] = useState([])

  useEffect(() => {
    fetchScenarios()
    fetchPlayerProgress()
    fetchCountries()
  }, [])

  const fetchScenarios = async () => {
    try {
      const response = await fetch('/api/scenarios/list?per_page=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setScenarios(data.scenarios)
      }
    } catch (error) {
      console.error('Erro ao carregar cenários:', error)
    }
  }

  const fetchPlayerProgress = async () => {
    try {
      const response = await fetch('/api/scenarios/player-progress', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPlayerProgress(data.completed_scenarios.concat(data.in_progress_scenarios))
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/scenarios/countries')
      if (response.ok) {
        const data = await response.json()
        setCountries(data.countries)
      }
    } catch (error) {
      console.error('Erro ao carregar países:', error)
    }
  }

  const startScenario = async (scenarioId) => {
    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Cenário iniciado: ${data.scenario.name}`)
        fetchPlayerProgress()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao iniciar cenário:', error)
      alert('Erro ao iniciar cenário')
    }
  }

  const getScenarioTypeIcon = (type) => {
    switch (type) {
      case 'country': return <Globe className="w-5 h-5" />
      case 'capital': return <Building className="w-5 h-5" />
      case 'city': return <MapPin className="w-5 h-5" />
      case 'landmark': return <Landmark className="w-5 h-5" />
      default: return <Map className="w-5 h-5" />
    }
  }

  const getProgressForScenario = (scenarioId) => {
    return playerProgress.find(p => p.scenario_id === scenarioId)
  }

  const filteredScenarios = selectedCountry === 'all' 
    ? scenarios 
    : scenarios.filter(s => s.country === selectedCountry)

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
          <Map className="w-8 h-8 mr-3 text-purple-400" />
          Cenários do Mundo
        </h1>
        <p className="text-gray-400">
          Explore cenários únicos ao redor do mundo e enfrente diferentes tipos de monstros
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Fase Atual</p>
              <p className="text-2xl font-bold text-blue-400">{player.current_phase || 1}</p>
            </div>
            <Star className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Cenários Completos</p>
              <p className="text-2xl font-bold text-green-400">
                {playerProgress.filter(p => p.is_completed).length}
              </p>
            </div>
            <Trophy className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Monstros Derrotados</p>
              <p className="text-2xl font-bold text-red-400">
                {playerProgress.reduce((sum, p) => sum + p.monsters_defeated, 0)}
              </p>
            </div>
            <Zap className="w-8 h-8 text-red-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completações Perfeitas</p>
              <p className="text-2xl font-bold text-yellow-400">
                {playerProgress.filter(p => p.is_perfect).length}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Country Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCountry('all')}
          className={`px-4 py-2 rounded-md transition-colors ${
            selectedCountry === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Todos os Países
        </button>
        {countries.map((country) => (
          <button
            key={country.name}
            onClick={() => setSelectedCountry(country.name)}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedCountry === country.name
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {country.name} ({country.scenario_count})
          </button>
        ))}
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenarios.map((scenario) => {
          const progress = getProgressForScenario(scenario.id)
          const isAccessible = scenario.phase_number <= (player.current_phase || 1)
          const isCompleted = progress?.is_completed
          const isPerfect = progress?.is_perfect

          return (
            <div
              key={scenario.id}
              className={`bg-gray-800 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                isCompleted 
                  ? 'border-green-500/50 bg-green-900/20' 
                  : isAccessible 
                    ? 'border-purple-500/50 hover:border-purple-400' 
                    : 'border-gray-600 opacity-60'
              }`}
            >
              {/* Scenario Header */}
              <div 
                className="h-32 bg-gradient-to-br from-purple-600 to-blue-600 relative"
                style={{ backgroundColor: scenario.ambient_color }}
              >
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute top-4 left-4 flex items-center space-x-2 text-white">
                  {getScenarioTypeIcon(scenario.scenario_type)}
                  <span className="text-sm font-medium">
                    {scenario.scenario_type.charAt(0).toUpperCase() + scenario.scenario_type.slice(1)}
                  </span>
                </div>
                <div className="absolute top-4 right-4 text-white">
                  <div className="bg-black/60 px-2 py-1 rounded text-sm">
                    Fase {scenario.phase_number}
                  </div>
                </div>
                {isCompleted && (
                  <div className="absolute bottom-4 right-4">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${
                      isPerfect ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'
                    }`}>
                      <Trophy className="w-4 h-4" />
                      <span>{isPerfect ? 'Perfeito' : 'Completo'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Scenario Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-1">{scenario.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{scenario.description}</p>
                
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-400">País:</span>
                  <span className="text-purple-300">{scenario.country}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-400">Monstros:</span>
                  <span className="text-red-300">{scenario.total_monsters}</span>
                </div>

                {/* Progress Bar */}
                {progress && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">Progresso:</span>
                      <span className="text-blue-300">
                        {progress.monsters_defeated}/{progress.total_monsters_required}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => startScenario(scenario.id)}
                  disabled={!isAccessible}
                  className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                    !isAccessible
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : isCompleted
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {!isAccessible 
                    ? 'Bloqueado' 
                    : isCompleted 
                      ? 'Jogar Novamente' 
                      : progress 
                        ? 'Continuar' 
                        : 'Iniciar Cenário'
                  }
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredScenarios.length === 0 && (
        <div className="text-center py-12">
          <Map className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Nenhum cenário encontrado
          </h3>
          <p className="text-gray-500">
            Tente selecionar um país diferente ou aguarde novos cenários.
          </p>
        </div>
      )}
    </div>
  )
}

