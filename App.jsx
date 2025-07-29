import { useState, useEffect } from 'react'
import './App.css'
import { LoginForm } from './components/LoginForm'
import { GameHeader } from './components/GameHeader'
import { GameArena } from './components/GameArena'
import { Shop } from './components/Shop'
import { Inventory } from './components/Inventory'
import { Scenarios } from './components/Scenarios'
import { Leaderboard } from './components/Leaderboard'
import { AdminDashboard } from './components/AdminDashboard'
import { Mining } from './components/Mining'
import { CollectibleCards } from './components/CollectibleCards'
import { Profile } from './components/Profile'

function App() {
  const [player, setPlayer] = useState(null)
  const [activeTab, setActiveTab] = useState('arena')
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token && !player) {
      // Verificar se o token ainda é válido e carregar dados do jogador
      fetchPlayerData()
    }
  }, [token])

  const fetchPlayerData = async () => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPlayer(data.player)
      } else {
        // Token inválido, fazer logout
        handleLogout()
      }
    } catch (error) {
      console.error('Erro ao carregar dados do jogador:', error)
      handleLogout()
    }
  }

  const handleLogin = (playerData, authToken) => {
    setPlayer(playerData)
    setToken(authToken)
    localStorage.setItem('token', authToken)
  }

  const handleLogout = () => {
    setPlayer(null)
    setToken(null)
    localStorage.removeItem('token')
    setActiveTab('arena')
  }

  const handlePlayerUpdate = (updatedPlayer) => {
    setPlayer(updatedPlayer)
  }

  if (!player) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <GameHeader 
        player={player} 
        activeTab={activeTab}
        onTabChange={setActiveTab} 
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto py-6 px-4">
        {activeTab === 'arena' && (
          <GameArena 
            player={player} 
            token={token}
            onPlayerUpdate={handlePlayerUpdate} 
          />
        )}
        {activeTab === 'scenarios' && (
          <Scenarios 
            player={player} 
            token={token}
            onPlayerUpdate={handlePlayerUpdate} 
          />
        )}
        {activeTab === 'shop' && (
          <Shop 
            player={player} 
            token={token}
            onPlayerUpdate={handlePlayerUpdate} 
          />
        )}
        {activeTab === 'inventory' && (
          <Inventory 
            player={player} 
            token={token}
            onPlayerUpdate={handlePlayerUpdate} 
          />
        )}
        {activeTab === 'cards' && (
          <CollectibleCards 
            player={player} 
            token={token}
          />
        )}
        {activeTab === 'mining' && (
          <Mining 
            player={player} 
            token={token}
            onPlayerUpdate={handlePlayerUpdate} 
          />
        )}
        {activeTab === 'leaderboard' && (
          <Leaderboard 
            player={player} 
            token={token}
          />
        )}
        {activeTab === 'profile' && (
          <Profile 
            player={player} 
            token={token}
            onPlayerUpdate={handlePlayerUpdate} 
          />
        )}
        {activeTab === 'admin' && player.is_admin && (
          <AdminDashboard 
            token={token}
          />
        )}
      </main>
    </div>
  )
}

export default App

