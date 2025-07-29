import { useState, useEffect } from 'react'
import { Package, Sword, Shield, Gem, Star, Filter, Search } from 'lucide-react'

export function Inventory({ player, token, onPlayerUpdate }) {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRarity, setSelectedRarity] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', label: 'Todos', icon: Package },
    { id: 'weapon', label: 'Armas', icon: Sword },
    { id: 'armor', label: 'Armaduras', icon: Shield },
    { id: 'accessory', label: 'Acessórios', icon: Gem },
    { id: 'collectible', label: 'Colecionáveis', icon: Star },
    { id: 'special', label: 'Especiais', icon: Star }
  ]

  const rarities = [
    { id: 'all', label: 'Todas', color: '#9CA3AF' },
    { id: 'common', label: 'Comum', color: '#9CA3AF' },
    { id: 'rare', label: 'Raro', color: '#3B82F6' },
    { id: 'epic', label: 'Épico', color: '#8B5CF6' },
    { id: 'legendary', label: 'Lendário', color: '#F59E0B' },
    { id: 'mythic', label: 'Mítico', color: '#EF4444' }
  ]

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setInventory(data.inventory || [])
      }
    } catch (error) {
      console.error('Erro ao carregar inventário:', error)
    } finally {
      setLoading(false)
    }
  }

  const equipItem = async (inventoryItemId) => {
    try {
      const response = await fetch(`/api/inventory/${inventoryItemId}/equip`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setInventory(prev => prev.map(item => 
          item.id === inventoryItemId 
            ? { ...item, is_equipped: !item.is_equipped }
            : item
        ))
        onPlayerUpdate(data.player)
      }
    } catch (error) {
      console.error('Erro ao equipar item:', error)
    }
  }

  const sellItem = async (inventoryItemId) => {
    if (!confirm('Tem certeza que deseja vender este item?')) return

    try {
      const response = await fetch(`/api/inventory/${inventoryItemId}/sell`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setInventory(prev => prev.filter(item => item.id !== inventoryItemId))
        onPlayerUpdate(data.player)
        alert(`Item vendido por ${data.sale_price} DOOF!`)
      }
    } catch (error) {
      console.error('Erro ao vender item:', error)
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.item.item_type === selectedCategory
    const matchesRarity = selectedRarity === 'all' || item.item.rarity === selectedRarity
    const matchesSearch = searchTerm === '' || 
      item.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesRarity && matchesSearch
  })

  const getItemIcon = (itemType) => {
    switch (itemType) {
      case 'weapon': return <Sword className="w-5 h-5" />
      case 'armor': return <Shield className="w-5 h-5" />
      case 'accessory': return <Gem className="w-5 h-5" />
      default: return <Star className="w-5 h-5" />
    }
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
          <Package className="w-8 h-8 mr-3 text-purple-400" />
          Inventário
        </h1>
        <p className="text-gray-400">
          Gerencie seus itens, equipamentos e colecionáveis
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">{inventory.length}</p>
            <p className="text-gray-400 text-sm">Total de Itens</p>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {inventory.filter(item => item.is_equipped).length}
            </p>
            <p className="text-gray-400 text-sm">Equipados</p>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {inventory.filter(item => ['legendary', 'mythic'].includes(item.item.rarity)).length}
            </p>
            <p className="text-gray-400 text-sm">Raros+</p>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {inventory.reduce((sum, item) => sum + item.quantity, 0)}
            </p>
            <p className="text-gray-400 text-sm">Quantidade Total</p>
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
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              )
            })}
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
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredInventory.map((inventoryItem) => {
          const item = inventoryItem.item
          
          return (
            <div
              key={inventoryItem.id}
              className={`bg-gray-800 rounded-lg p-4 border-2 transition-all hover:scale-105 ${
                inventoryItem.is_equipped 
                  ? 'border-green-500 bg-green-900/20' 
                  : 'border-gray-600 hover:border-purple-500'
              }`}
              style={{ borderTopColor: item.rarity_color }}
            >
              {/* Item Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getItemIcon(item.item_type)}
                  <span 
                    className="text-sm font-medium"
                    style={{ color: item.rarity_color }}
                  >
                    {item.rarity_display}
                  </span>
                </div>
                {inventoryItem.quantity > 1 && (
                  <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    x{inventoryItem.quantity}
                  </div>
                )}
              </div>

              {/* Item Info */}
              <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>

              {/* Item Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Nível Req.:</span>
                  <span className="text-blue-300">{item.required_level}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Fase Req.:</span>
                  <span className="text-purple-300">{item.required_phase}</span>
                </div>
                {item.current_price !== '0' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Valor:</span>
                    <span className="text-yellow-300">{parseFloat(item.current_price).toFixed(6)} DOOF</span>
                  </div>
                )}
              </div>

              {/* Item Attributes */}
              {Object.keys(item.attributes).length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-400 text-xs mb-2">Atributos:</p>
                  <div className="space-y-1">
                    {Object.entries(item.attributes).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="text-gray-300">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {['weapon', 'armor', 'accessory'].includes(item.item_type) && (
                  <button
                    onClick={() => equipItem(inventoryItem.id)}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      inventoryItem.is_equipped
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {inventoryItem.is_equipped ? 'Desequipar' : 'Equipar'}
                  </button>
                )}
                
                {item.is_sellable && (
                  <button
                    onClick={() => sellItem(inventoryItem.id)}
                    className="flex-1 py-2 px-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Vender
                  </button>
                )}
              </div>

              {/* Equipped Badge */}
              {inventoryItem.is_equipped && (
                <div className="mt-2 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Equipado
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            {inventory.length === 0 ? 'Inventário vazio' : 'Nenhum item encontrado'}
          </h3>
          <p className="text-gray-500">
            {inventory.length === 0 
              ? 'Derrote monstros e complete cenários para obter itens!'
              : 'Tente ajustar os filtros de busca.'
            }
          </p>
        </div>
      )}
    </div>
  )
}

