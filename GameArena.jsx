import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Swords, Skull, Target, Zap, Heart } from 'lucide-react'

export function GameArena({ player, onPlayerUpdate }) {
  const [monstersInPhase, setMonstersInPhase] = useState(300)
  const [currentPhase, setCurrentPhase] = useState(1)
  const [loading, setLoading] = useState(false)

  const killMonster = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/game/player/${player.id}/kill-monster`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        onPlayerUpdate(data.player)
        
        // Verificar se completou a fase
        if (data.player.monsters_killed % monstersInPhase === 0) {
          setCurrentPhase(prev => prev + 1)
          setMonstersInPhase(prev => Math.floor(prev * 1.25)) // 25% mais monstros
        }
      }
    } catch (error) {
      console.error('Erro ao matar monstro:', error)
    } finally {
      setLoading(false)
    }
  }

  const selfEliminate = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/game/player/${player.id}/self-eliminate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        onPlayerUpdate(data.player)
      }
    } catch (error) {
      console.error('Erro na auto-eliminação:', error)
    } finally {
      setLoading(false)
    }
  }

  const die = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/game/player/${player.id}/die`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        onPlayerUpdate(data.player)
      }
    } catch (error) {
      console.error('Erro ao morrer:', error)
    } finally {
      setLoading(false)
    }
  }

  const monstersKilledInPhase = player.monsters_killed % monstersInPhase
  const progressPercentage = (monstersKilledInPhase / monstersInPhase) * 100

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status da Fase */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-400" />
              Fase {currentPhase}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white">
            <p className="text-sm text-gray-400 mb-2">
              Monstros mortos: {monstersKilledInPhase}/{monstersInPhase}
            </p>
            <Progress value={progressPercentage} className="w-full h-3 bg-gray-700" />
            <p className="text-xs text-gray-500 mt-2">
              Próxima fase: {Math.floor(monstersInPhase * 1.25)} monstros
            </p>
          </CardContent>
        </Card>

        {/* Estatísticas do Jogador */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Skull className="w-5 h-5 mr-2 text-red-400" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white">
            <div className="space-y-2">
              <p className="text-sm">Total de monstros mortos: {player.monsters_killed}</p>
              <p className="text-sm">Auto-eliminações: {player.self_eliminations}</p>
              <p className="text-sm">Nível: {player.level}</p>
            </div>
          </CardContent>
        </Card>

        {/* Poder Especial */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Poder Especial
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white">
            <p className="text-sm text-gray-400 mb-2">
              Poder: {player.power}%
            </p>
            <Progress value={player.power} className="w-full h-3 bg-gray-700" />
            <p className="text-xs text-gray-500 mt-2">
              {player.power >= 100 ? 'Pronto para usar!' : 'Mate mais monstros para carregar'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações de Combate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={killMonster}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white h-16 text-lg"
        >
          <Swords className="w-6 h-6 mr-2" />
          {loading ? 'Matando...' : 'Matar Monstro'}
        </Button>

        <Button
          onClick={selfEliminate}
          disabled={loading}
          className="bg-yellow-600 hover:bg-yellow-700 text-white h-16 text-lg"
        >
          <Target className="w-6 h-6 mr-2" />
          {loading ? 'Eliminando...' : 'Auto-Eliminação (+0.00000000000001 DOOF)'}
        </Button>

        <Button
          onClick={die}
          disabled={loading}
          variant="destructive"
          className="h-16 text-lg"
        >
          <Skull className="w-6 h-6 mr-2" />
          {loading ? 'Morrendo...' : 'Morrer (Perder Moedas)'}
        </Button>
      </div>

      {/* Informações da Arena */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-400" />
            Regras da Arena
          </CardTitle>
        </CardHeader>
        <CardContent className="text-white">
          <ul className="space-y-2 text-sm">
            <li>• Mate monstros para ganhar XP e subir de nível</li>
            <li>• Auto-eliminação ganha 0.00000000000001 DOOF</li>
            <li>• A cada 100 monstros mortos, sua vida e poder são restaurados</li>
            <li>• Ao morrer, você perde todas as moedas da partida atual</li>
            <li>• Cada fase tem 25% mais monstros que a anterior</li>
            <li>• Mate outros jogadores para ganhar 20% de suas moedas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

