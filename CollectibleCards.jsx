import { useState, useEffect } from 'react'
import { Sparkles, Star, Trophy, Filter, Search, Grid, List } from 'lucide-react'

export function CollectibleCards({ player, token }) {
  const [cards, setCards] = useState([])
  const [allCards, setAllCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSeries, setSelectedSeries] = useState('all')
  const [selectedRarity, setSelectedRarity] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showOnlyOwned, setShowOnlyOwned] = useState(false)

  const rarities = [
    { id: 'all', label: 'Todas', color: '#9CA3AF' },
    { id: 'common', label: 'Comum', color: '#9CA3AF' },
    { id: 'rare', label: 'Raro', color: '#3B82F6' },
    { id: 'epic', label: 'Épico', color: '#8B5CF6' },
    { id: 'legendary', label: 'Lendário', color: '#F59E0B' },
    { id: 'mythic', label: 'Mítico', color: '#EF4444' }
  ]

  useEffect(() => {
    fetchPlayerCards()
    fetchAllCards()
  }, [])

  const fetchPlayerCards = async () => {
    try {
      const response = await fetch('/api/cards/collection', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCards(data.cards || [])
      }
    } catch (error) {
      console.error('Erro ao carregar cartas do jogador:', error)
    }
  }

  const fetchAllCards = async () => {
    try {
      const response = await fetch('/api/cards/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAllCards(data.cards || [])
      }
    } catch (error) {
      console.error('Erro ao carregar todas as cartas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlayerCard = (cardId) => {
    return cards.find(c => c.card_id === cardId)
  }

  const getUniqueSeries = () => {
    const series = new Set(allCards.map(card => card.card_series))
    return Array.from(series)
  }

  const filteredCards = allCards.filter(card => {
    const playerCard = getPlayerCard(card.id)
    const matchesSeries = selectedSeries === 'all' || card.card_series === selectedSeries
    const matchesRarity = selectedRarity === 'all' || card.rarity === selectedRarity
    const matchesSearch = searchTerm === '' || 
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesOwned = !showOnlyOwned || playerCard
    
    return matchesSeries && matchesRarity && matchesSearch && matchesOwned
  })

  const getCollectionStats = () => {
    const totalCards = allCards.length
    const ownedCards = allCards.filter(card => getPlayerCard(card.id)).length
    const completionPercentage = totalCards > 0 ? (ownedCards / totalCards) * 100 : 0
    
    const rarityStats = rarities.slice(1).map(rarity => {
      const totalOfRarity = allCards.filter(card => card.rarity === rarity.id).length
      const ownedOfRarity = allCards.filter(card => 
        card.rarity === rarity.id && getPlayerCard(card.id)
      ).length
      
      return {
        ...rarity,
        total: totalOfRarity,
        owned: ownedOfRarity,
        percentage: totalOfRarity > 0 ? (ownedOfRarity / totalOfRarity) * 100 : 0
      }
    })

    return { totalCards, ownedCards, completionPercentage, rarityStats }
  }

  const stats = getCollectionStats()

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
          <Sparkles className="w-8 h-8 mr-3 text-purple-400" />
          Cartas Colecionáveis
        </h1>
        <p className="text-gray-400">
          Colecione cartas únicas de cada cenário e país do mundo
        </p>
      </div>

      {/* Collection Stats */}
      <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/20">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
          Estatísticas da Coleção
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Progresso Geral</span>
              <span className="text-white font-semibold">
                {stats.ownedCards}/{stats.totalCards} ({stats.completionPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Rarity Breakdown */}
          <div className="space-y-2">
            {stats.rarityStats.map((rarity) => (
              <div key={rarity.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: rarity.color }}
                  />
                  <span className="text-gray-400">{rarity.label}:</span>
                </div>
                <span className="text-white">
                  {rarity.owned}/{rarity.total} ({rarity.percentage.toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/20">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar cartas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Series Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSeries('all')}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                selectedSeries === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Todas as Séries
            </button>
            {getUniqueSeries().map((series) => (
              <button
                key={series}
                onClick={() => setSelectedSeries(series)}
                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedSeries === series
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {series}
              </button>
            ))}
          </div>

          {/* Rarity Filter */}
          <div className="flex flex-wrap gap-2">
            {rarities.map((rarity) => (
              <button
                key={rarity.id}
                onClick={() => setSelectedRarity(rarity.id)}
                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedRarity === rarity.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                style={selectedRarity === rarity.id ? {} : { borderLeft: `3px solid ${rarity.color}` }}
              >
                {rarity.label}
              </button>
            ))}
          </div>

          {/* View Options */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowOnlyOwned(!showOnlyOwned)}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                showOnlyOwned
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Apenas Minhas
            </button>
            
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-md transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Cards Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCards.map((card) => {
            const playerCard = getPlayerCard(card.id)
            const isOwned = !!playerCard
            
            return (
              <div
                key={card.id}
                className={`relative bg-gray-800 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  isOwned 
                    ? 'border-green-500 shadow-lg shadow-green-500/20' 
                    : 'border-gray-600 opacity-60'
                }`}
              >
                {/* Card Header */}
                <div 
                  className="h-32 bg-gradient-to-br from-purple-600 to-blue-600 relative"
                  style={{ backgroundColor: card.background_color }}
                >
                  <div className="absolute inset-0 bg-black/40" />
                  
                  {/* Card Number */}
                  <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                    #{card.full_number}
                  </div>
                  
                  {/* Rarity */}
                  <div 
                    className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: card.rarity_color, color: 'white' }}
                  >
                    {card.rarity_display}
                  </div>
                  
                  {/* Owned Badge */}
                  {isOwned && (
                    <div className="absolute bottom-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      {playerCard.quantity > 1 ? `x${playerCard.quantity}` : 'Possuída'}
                    </div>
                  )}
                  
                  {/* Series Icon */}
                  <div className="absolute bottom-2 left-2 text-white text-2xl">
                    <Sparkles className="w-8 h-8" />
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-1">{card.name}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{card.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Série:</span>
                      <span className="text-purple-300">{card.card_series}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Fase:</span>
                      <span className="text-blue-300">{card.available_in_phase}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Drop Rate:</span>
                      <span className="text-yellow-300">{(card.drop_rate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Not Owned Overlay */}
                {!isOwned && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">Não Possuída</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-purple-500/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-white">Carta</th>
                  <th className="px-4 py-3 text-left text-white">Série</th>
                  <th className="px-4 py-3 text-left text-white">Raridade</th>
                  <th className="px-4 py-3 text-left text-white">Fase</th>
                  <th className="px-4 py-3 text-left text-white">Quantidade</th>
                  <th className="px-4 py-3 text-left text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card) => {
                  const playerCard = getPlayerCard(card.id)
                  const isOwned = !!playerCard
                  
                  return (
                    <tr 
                      key={card.id} 
                      className={`border-t border-gray-700 ${!isOwned ? 'opacity-60' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: card.rarity_color }}
                          />
                          <div>
                            <p className="text-white font-medium">{card.name}</p>
                            <p className="text-gray-400 text-sm">#{card.full_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-purple-300">{card.card_series}</td>
                      <td className="px-4 py-3">
                        <span 
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: card.rarity_color, color: 'white' }}
                        >
                          {card.rarity_display}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-blue-300">{card.available_in_phase}</td>
                      <td className="px-4 py-3 text-white">
                        {isOwned ? playerCard.quantity : 0}
                      </td>
                      <td className="px-4 py-3">
                        {isOwned ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-600 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Possuída
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-300">
                            Não Possuída
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Nenhuma carta encontrada
          </h3>
          <p className="text-gray-500">
            Tente ajustar os filtros ou complete mais cenários para desbloquear novas cartas.
          </p>
        </div>
      )}
    </div>
  )
}

