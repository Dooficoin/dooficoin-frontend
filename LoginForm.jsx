import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Coins, User, Mail, Gamepad2 } from 'lucide-react'

export function LoginForm({ onLogin }) {
  const [loginData, setLoginData] = useState({ username: '', email: '' })
  const [registerData, setRegisterData] = useState({ username: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Primeiro, tentar encontrar o usuário
      const userResponse = await fetch('/api/users')
      const userData = await userResponse.json()
      
      let user = userData.find(u => 
        u.username === loginData.username || u.email === loginData.email
      )

      if (!user) {
        setError('Usuário não encontrado')
        return
      }

      // Verificar se o jogador existe
      const playerResponse = await fetch(`/api/game/player/${user.id}`)
      
      if (playerResponse.ok) {
        const playerData = await playerResponse.json()
        onLogin(playerData.player)
      } else {
        // Criar jogador se não existir
        const createPlayerResponse = await fetch('/api/game/player/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id
          })
        })

        if (createPlayerResponse.ok) {
          const newPlayerData = await createPlayerResponse.json()
          onLogin(newPlayerData.player)
        } else {
          setError('Erro ao criar jogador')
        }
      }
    } catch (error) {
      setError('Erro de conexão')
      console.error('Erro no login:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Criar usuário
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData)
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        
        // Criar jogador
        const playerResponse = await fetch('/api/game/player/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userData.id
          })
        })

        if (playerResponse.ok) {
          const playerData = await playerResponse.json()
          onLogin(playerData.player)
        } else {
          setError('Erro ao criar jogador')
        }
      } else {
        const errorData = await userResponse.json()
        setError(errorData.error || 'Erro ao criar usuário')
      }
    } catch (error) {
      setError('Erro de conexão')
      console.error('Erro no registro:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coins className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
            Dooficoin Game
          </h1>
          <p className="text-gray-300">Entre na arena e comece a ganhar!</p>
        </div>

        <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center flex items-center justify-center space-x-2">
              <Gamepad2 className="w-5 h-5" />
              <span>Acesso ao Jogo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="login" className="text-white">Entrar</TabsTrigger>
                <TabsTrigger value="register" className="text-white">Registrar</TabsTrigger>
              </TabsList>

              {/* Login */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username" className="text-gray-300">
                      Usuário ou Email
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Digite seu usuário ou email"
                        value={loginData.username}
                        onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                        className="pl-10 bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Entrando...' : 'Entrar no Jogo'}
                  </Button>
                </form>
              </TabsContent>

              {/* Registro */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username" className="text-gray-300">
                      Nome de Usuário
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Escolha um nome de usuário"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                        className="pl-10 bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-gray-300">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Digite seu email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                        className="pl-10 bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Criando Conta...' : 'Criar Conta e Jogar'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Informações sobre o jogo */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Como Funciona:</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Mate monstros para ganhar XP e subir de nível</li>
                <li>• Auto-eliminação ganha 0.00000000000001 DOOF</li>
                <li>• A cada 100 monstros, restaure vida e poder</li>
                <li>• Compre equipamentos para ficar mais forte</li>
                <li>• Conecte sua carteira para receber Dooficoin</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

