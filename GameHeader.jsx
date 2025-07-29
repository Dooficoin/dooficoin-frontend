import { useState } from 'react'
import { 
  Sword, 
  ShoppingBag, 
  Package, 
  Map, 
  Trophy, 
  User, 
  Pickaxe, 
  Sparkles,
  LogOut,
  Menu,
  X,
  Coins,
  Settings
} from 'lucide-react'

export function GameHeader({ player, activeTab, onTabChange, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const tabs = [
    { id: 'arena', label: 'Arena', icon: Sword },
    { id: 'scenarios', label: 'Cenários', icon: Map },
    { id: 'shop', label: 'Loja', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventário', icon: Package },
    { id: 'cards', label: 'Cartas', icon: Sparkles },
    { id: 'mining', label: 'Mineração', icon: Pickaxe },
    { id: 'leaderboard', label: 'Ranking', icon: Trophy },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'admin', label: 'Admin', icon: Settings, adminOnly: true }
  ]

  const formatBalance = (balance) => {
    const num = parseFloat(balance || 0)
    if (num === 0) return '0'
    if (num < 0.000001) {
      return num.toExponential(2)
    }
    return num.toFixed(6)
  }

  return (
    <header className="bg-gray-800 shadow-lg border-b border-purple-500">
      <div className="container mx-auto px-4">
        {/* Desktop Header */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-purple-400 flex items-center">
              <Coins className="w-8 h-8 mr-2 text-yellow-500" />
              DoofiCoin Game
            </div>
          </div>

          {/* Player Stats */}
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Jogador:</span>
              <span className="font-semibold text-purple-300">{player.username}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Nível:</span>
              <span className="font-semibold text-green-400">{player.level}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Fase:</span>
              <span className="font-semibold text-blue-400">{player.current_phase || 1}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Saldo:</span>
              <span className="font-semibold text-yellow-400">
                {formatBalance(player.wallet_balance)} DOOF
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Vida:</span>
              <div className="w-20 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${player.health || 100}%` }}
                />
              </div>
              <span className="text-red-400 text-xs">{player.health || 100}/100</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logout Button (Desktop) */}
          <button
            onClick={onLogout}
            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex space-x-1 py-2">
          {tabs.map((tab) => {
            if (tab.adminOnly && !player.is_admin) return null
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            {/* Mobile Player Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Jogador:</span>
                <span className="font-semibold text-purple-300">{player.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Nível:</span>
                <span className="font-semibold text-green-400">{player.level}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Fase:</span>
                <span className="font-semibold text-blue-400">{player.current_phase || 1}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Vida:</span>
                <span className="text-red-400">{player.health || 100}/100</span>
              </div>
              <div className="col-span-2 flex items-center justify-between">
                <span className="text-gray-400">Saldo:</span>
                <span className="font-semibold text-yellow-400">
                  {formatBalance(player.wallet_balance)} DOOF
                </span>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="grid grid-cols-2 gap-2">
              {tabs.map((tab) => {
                if (tab.adminOnly && !player.is_admin) return null
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Mobile Logout */}
            <button
              onClick={onLogout}
              className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

