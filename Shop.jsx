import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Sword, Shield, Crown, Coins } from 'lucide-react'

export function Shop({ player, onPlayerUpdate }) {
  const [loading, setLoading] = useState(false)

  // Dados simulados de equipamentos
  const weapons = [
    { id: 1, name: 'Espada Básica', power: 5, price: 0.0000001, description: 'Uma espada simples, mas eficaz.' },
    { id: 2, name: 'Machado de Guerra', power: 10, price: 0.0000005, description: 'Um machado pesado que causa dano extra.' },
    { id: 3, name: 'Adaga Envenenada', power: 15, price: 0.000001, description: 'Uma adaga rápida com veneno que causa dano ao longo do tempo.' },
    { id: 4, name: 'Espada Lendária', power: 25, price: 0.00001, description: 'Uma espada forjada por deuses antigos.' },
  ]

  const armors = [
    { id: 5, name: 'Armadura de Couro', defense: 5, price: 0.0000001, description: 'Proteção básica para aventureiros iniciantes.' },
    { id: 6, name: 'Cota de Malha', defense: 10, price: 0.0000005, description: 'Oferece boa proteção contra ataques físicos.' },
    { id: 7, name: 'Armadura de Placas', defense: 15, price: 0.000001, description: 'Armadura pesada que oferece excelente proteção.' },
    { id: 8, name: 'Armadura Divina', defense: 25, price: 0.00001, description: 'Forjada com materiais celestiais, quase impenetrável.' },
  ]

  const accessories = [
    { id: 9, name: 'Anel da Sorte', effect: 'Aumenta chance de crítico', price: 0.0000002, description: 'Um anel que traz sorte nas batalhas.' },
    { id: 10, name: 'Amuleto de Vida', effect: 'Regeneração de HP', price: 0.0000005, description: 'Regenera vida lentamente durante o combate.' },
    { id: 11, name: 'Colar de Mana', effect: 'Aumenta poder mágico', price: 0.000001, description: 'Amplifica seus poderes mágicos.' },
    { id: 12, name: 'Coroa do Rei', effect: 'Todos atributos +10', price: 0.00002, description: 'Um item lendário que pertenceu a um rei antigo.' },
  ]

  const buyItem = async (item) => {
    setLoading(true)
    
    // Simulação de compra - em um jogo real, isso seria uma chamada de API
    setTimeout(() => {
      // Verificar se o jogador tem dinheiro suficiente
      if (player.dooficoin_balance >= item.price) {
        // Atualizar o saldo do jogador
        const updatedPlayer = {
          ...player,
          dooficoin_balance: player.dooficoin_balance - item.price
        }
        
        // Se for uma arma, aumentar o poder do jogador
        if (item.power) {
          updatedPlayer.power += item.power
        }
        
        // Atualizar o estado do jogador
        onPlayerUpdate(updatedPlayer)
        
        alert(`Item ${item.name} comprado com sucesso!`)
      } else {
        alert('Saldo insuficiente para comprar este item!')
      }
      
      setLoading(false)
    }, 1000)
  }

  const renderItems = (items) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <Card key={item.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">{item.name}</CardTitle>
              <CardDescription className="text-gray-400">
                {item.power && `Poder: +${item.power}`}
                {item.defense && `Defesa: +${item.defense}`}
                {item.effect && `Efeito: ${item.effect}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">{item.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Badge variant="outline" className="flex items-center">
                <Coins className="w-4 h-4 mr-1 text-yellow-500" />
                {item.price.toFixed(10)} DOOF
              </Badge>
              <Button 
                onClick={() => buyItem(item)} 
                disabled={loading || player.dooficoin_balance < item.price}
                size="sm"
              >
                Comprar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <ShoppingBag className="w-6 h-6 mr-2 text-purple-400" />
          Loja de Equipamentos
        </h2>
        <Badge variant="outline" className="text-lg flex items-center">
          <Coins className="w-5 h-5 mr-2 text-yellow-500" />
          {player.dooficoin_balance.toFixed(10)} DOOF
        </Badge>
      </div>

      <Tabs defaultValue="weapons" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-900">
          <TabsTrigger value="weapons" className="text-white flex items-center">
            <Sword className="w-4 h-4 mr-2" />Armas
          </TabsTrigger>
          <TabsTrigger value="armors" className="text-white flex items-center">
            <Shield className="w-4 h-4 mr-2" />Armaduras
          </TabsTrigger>
          <TabsTrigger value="accessories" className="text-white flex items-center">
            <Crown className="w-4 h-4 mr-2" />Acessórios
          </TabsTrigger>
        </TabsList>
        <TabsContent value="weapons" className="mt-4">
          {renderItems(weapons)}
        </TabsContent>
        <TabsContent value="armors" className="mt-4">
          {renderItems(armors)}
        </TabsContent>
        <TabsContent value="accessories" className="mt-4">
          {renderItems(accessories)}
        </TabsContent>
      </Tabs>
    </div>
  )
}

