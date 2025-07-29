import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Map, 
  Ghost, 
  Sparkles, 
  Settings, 
  Shield, 
  DollarSign,
  LineChart
} from 'lucide-react'

export function AdminDashboard({ token }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'items', label: 'Itens', icon: Package },
    { id: 'scenarios', label: 'Cenários', icon: Map },
    { id: 'monsters', label: 'Monstros', icon: Ghost },
    { id: 'cards', label: 'Cartas', icon: Sparkles },
    { id: 'adsense', label: 'AdSense', icon: DollarSign },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ]

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        const error = await response.json()
        alert(`Erro ao carregar estatísticas do dashboard: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas do dashboard:', error)
      alert('Erro ao carregar estatísticas do dashboard')
    } finally {
      setLoadingStats(false)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingStats ? (
              <div className="col-span-full flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <>
                <StatCard title="Total de Usuários" value={stats.total_users} icon={Users} color="text-blue-400" />
                <StatCard title="Usuários Ativos" value={stats.active_users} icon={Users} color="text-green-400" />
                <StatCard title="Total de Itens" value={stats.total_items} icon={Package} color="text-yellow-400" />
                <StatCard title="Total de Cenários" value={stats.total_scenarios} icon={Map} color="text-purple-400" />
                <StatCard title="Total de Monstros" value={stats.total_monsters} icon={Ghost} color="text-red-400" />
                <StatCard title="Total de Cartas" value={stats.total_cards} icon={Sparkles} color="text-pink-400" />
                <StatCard title="Total de Transações" value={stats.total_transactions} icon={DollarSign} color="text-green-400" />
                <StatCard title="DoofiCoin Minerado" value={`${parseFloat(stats.total_dooficoin_mined).toFixed(6)} DOOF`} icon={LineChart} color="text-yellow-400" />
                <StatCard title="Logs de Segurança" value={stats.total_security_logs} icon={Shield} color="text-orange-400" />
              </>
            )}
          </div>
        )
      case 'users':
        return <UsersManagement token={token} />
      case 'items':
        return <ItemsManagement token={token} />
      case 'scenarios':
        return <ScenariosManagement token={token} />
      case 'monsters':
        return <MonstersManagement token={token} />
      case 'cards':
        return <CardsManagement token={token} />
      case 'adsense':
        return <AdSenseManagement token={token} />
      case 'security':
        return <SecurityLogsManagement token={token} />
      case 'settings':
        return <AdminSettings token={token} />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-gray-800 p-4 lg:p-6 shadow-lg lg:shadow-xl border-r border-purple-500/20">
        <h1 className="text-3xl font-bold text-purple-400 mb-6 flex items-center">
          <LayoutDashboard className="w-8 h-8 mr-3" />
          Admin Panel
        </h1>
        <nav>
          <ul className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-purple-700 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="mb-8">
          <h2 className="text-4xl font-extrabold text-white mb-2">
            {tabs.find(tab => tab.id === activeTab)?.label}
          </h2>
          <p className="text-gray-400">
            Gerencie e monitore todos os aspectos do DoofiCoin Game.
          </p>
        </div>
        {renderContent()}
      </main>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-md border border-purple-500/20 flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
      <Icon className={`w-12 h-12 ${color} opacity-70`} />
    </div>
  )
}
