import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { GameMode } from '@/types/game';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [maxScore, setMaxScore] = useState('15');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [roomCodeError, setRoomCodeError] = useState('');

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      toast.error('Введите ваше имя');
      return;
    }

    const code = generateRoomCode();
    const room = {
      code,
      hostId: 'player-1',
      players: [{
        id: 'player-1',
        name: playerName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${playerName}`,
        score: 0,
        isReady: false
      }],
      gameMode,
      maxScore: parseInt(maxScore),
      currentRound: 0,
      phase: 'lobby' as const,
      submissions: []
    };

    localStorage.setItem('currentRoom', JSON.stringify(room));
    localStorage.setItem('currentPlayer', JSON.stringify(room.players[0]));
    
    setIsCreateDialogOpen(false);
    navigate(`/room/${code}`);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      toast.error('Введите ваше имя');
      return;
    }

    if (!roomCode.trim()) {
      toast.error('Введите код комнаты');
      return;
    }

    const storedRoom = localStorage.getItem(`room_${roomCode.toUpperCase()}`);
    
    if (!storedRoom) {
      setRoomCodeError('Комната не найдена');
      return;
    }

    const room = JSON.parse(storedRoom);
    const newPlayer = {
      id: `player-${room.players.length + 1}`,
      name: playerName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${playerName}`,
      score: 0,
      isReady: false
    };

    room.players.push(newPlayer);
    localStorage.setItem(`room_${roomCode.toUpperCase()}`, JSON.stringify(room));
    localStorage.setItem('currentPlayer', JSON.stringify(newPlayer));
    
    navigate(`/room/${roomCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12 animate-scale-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Icon name="Skull" size={48} className="text-primary animate-wiggle" />
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              Самый Ужасный Человек
            </h1>
            <Icon name="Flame" size={48} className="text-accent animate-float" />
          </div>
          <p className="text-xl text-muted-foreground font-medium">
            Узнай, кто из твоих друзей готов на самые безумные поступки! 🎭
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-4 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl card-shine">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon name="Plus" size={32} className="text-primary" />
                <CardTitle className="text-3xl">Создать комнату</CardTitle>
              </div>
              <CardDescription className="text-base">
                Создай игру и пригласи друзей по коду
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name" className="text-base font-semibold">Твоё имя</Label>
                <Input
                  id="create-name"
                  placeholder="Введи своё имя"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="text-lg h-12 border-2"
                />
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
                    disabled={!playerName.trim()}
                  >
                    <Icon name="Sparkles" size={24} className="mr-2" />
                    Создать игру
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Настройки игры</DialogTitle>
                    <DialogDescription>
                      Выбери режим и количество очков для победы
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Режим игры</Label>
                      <RadioGroup value={gameMode} onValueChange={(value) => setGameMode(value as GameMode)}>
                        <div className="flex items-center space-x-2 p-4 border-2 rounded-lg hover:bg-accent/10 cursor-pointer">
                          <RadioGroupItem value="classic" id="classic" />
                          <Label htmlFor="classic" className="flex-1 cursor-pointer">
                            <div className="font-semibold">Классический</div>
                            <div className="text-sm text-muted-foreground">Каждый выбирает карту действия к общему условию</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-4 border-2 rounded-lg hover:bg-accent/10 cursor-pointer">
                          <RadioGroupItem value="random" id="random" />
                          <Label htmlFor="random" className="flex-1 cursor-pointer">
                            <div className="font-semibold">Рандом</div>
                            <div className="text-sm text-muted-foreground">Условие и действие выпадают автоматически</div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="maxScore" className="text-base font-semibold">Играть до скольки очков?</Label>
                      <Input
                        id="maxScore"
                        type="number"
                        min="5"
                        max="50"
                        value={maxScore}
                        onChange={(e) => setMaxScore(e.target.value)}
                        className="text-lg h-12 border-2"
                      />
                    </div>

                    <Button 
                      onClick={handleCreateRoom}
                      className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-accent"
                    >
                      Создать комнату
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="border-4 border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl card-shine">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon name="Users" size={32} className="text-secondary" />
                <CardTitle className="text-3xl">Войти в комнату</CardTitle>
              </div>
              <CardDescription className="text-base">
                Присоединись к игре по коду от друга
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="join-name" className="text-base font-semibold">Твоё имя</Label>
                <Input
                  id="join-name"
                  placeholder="Введи своё имя"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="text-lg h-12 border-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-code" className="text-base font-semibold">Код комнаты</Label>
                <Input
                  id="room-code"
                  placeholder="Введи код"
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value.toUpperCase());
                    setRoomCodeError('');
                  }}
                  className="text-lg h-12 border-2 uppercase"
                  maxLength={6}
                />
                {roomCodeError && (
                  <p className="text-xs text-destructive">{roomCodeError}</p>
                )}
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg"
                onClick={handleJoinRoom}
                disabled={!playerName.trim() || !roomCode.trim()}
              >
                <Icon name="LogIn" size={24} className="mr-2" />
                Присоединиться
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-4 border-accent/20 animate-bounce-slow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon name="Info" size={28} className="text-accent" />
              <CardTitle className="text-2xl">Как играть?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎴</span>
              <div>
                <strong className="text-lg">Классический режим:</strong>
                <p className="text-muted-foreground">На столе появляется карта условия. Каждый игрок выбирает свою карту действия. Все голосуют за самую смешную комбинацию и выбирают, кто бы мог это сделать!</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎲</span>
              <div>
                <strong className="text-lg">Рандом режим:</strong>
                <p className="text-muted-foreground">Комбинация условия и действия выпадает автоматически. Все просто голосуют, кто бы мог это исполнить!</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <strong className="text-lg">Очки:</strong>
                <p className="text-muted-foreground">+1 балл если твою комбинацию выбрали как самую смешную, +2 балла если тебя выбрали как человека который может это исполнить</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
