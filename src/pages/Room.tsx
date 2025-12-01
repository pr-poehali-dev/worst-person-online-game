import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Room as RoomType, Player, Submission } from '@/types/game';
import { getRandomCondition, getRandomAction, getRandomCards, actionCards } from '@/data/gameCards';
import { toast } from 'sonner';
import { roomService } from '@/services/roomService';

const Room = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [myCards, setMyCards] = useState<string[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [timer, setTimer] = useState(15);
  const [votedFor, setVotedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      navigate('/');
      return;
    }

    const loadRoom = async () => {
      try {
        const storedPlayer = localStorage.getItem('currentPlayer');
        if (!storedPlayer) {
          navigate('/');
          return;
        }

        const roomData = await roomService.getRoom(code);
        setRoom(roomData);
        setCurrentPlayer(JSON.parse(storedPlayer));
        
        if (roomData.phase === 'playing') {
          setMyCards(getRandomCards(5, actionCards));
        }
      } catch (error) {
        toast.error('Комната не найдена');
        navigate('/');
      }
    };

    loadRoom();

    const interval = setInterval(loadRoom, 2000);
    return () => clearInterval(interval);
  }, [code, navigate]);

  useEffect(() => {
    if (room?.phase === 'playing' && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [room?.phase, timer]);

  const handleStartGame = async () => {
    if (!room || !currentPlayer || !code) return;

    const condition = getRandomCondition();
    const updatedRoom = {
      ...room,
      phase: 'playing' as const,
      currentRound: 1,
      currentCondition: condition,
      submissions: []
    };

    try {
      await roomService.updateRoom(code, updatedRoom);
      setRoom(updatedRoom);
      setMyCards(getRandomCards(5, actionCards));
      toast.success('Игра начинается!');
    } catch (error) {
      toast.error('Не удалось начать игру');
    }
  };

  const handleSelectCard = async (card: string) => {
    if (!room || !currentPlayer || selectedCard || !code) return;
    
    setSelectedCard(card);
    
    const submission: Submission = {
      playerId: currentPlayer.id,
      actionCard: card
    };

    const updatedRoom = {
      ...room,
      submissions: [...room.submissions, submission]
    };

    try {
      await roomService.updateRoom(code, updatedRoom);
      setRoom(updatedRoom);
      toast.success('Карта сыграна!');
    } catch (error) {
      toast.error('Не удалось сыграть карту');
      setSelectedCard(null);
    }
  };

  const handleVote = async (playerId: string) => {
    if (!room || votedFor || !code) return;

    setVotedFor(playerId);
    
    const updatedPlayers = room.players.map(p => 
      p.id === playerId ? { ...p, score: p.score + 2 } : p
    );

    const updatedRoom = {
      ...room,
      players: updatedPlayers,
      phase: room.currentRound >= (room.maxScore / 2) ? 'finished' as const : 'playing' as const,
      currentRound: room.currentRound + 1,
      currentCondition: getRandomCondition(),
      submissions: []
    };

    try {
      await roomService.updateRoom(code, updatedRoom);
      setRoom(updatedRoom);
      setSelectedCard(null);
      setVotedFor(null);
      setTimer(15);
      setMyCards(getRandomCards(5, actionCards));
    } catch (error) {
      toast.error('Не удалось проголосовать');
      setVotedFor(null);
    }
  };

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      toast.success('Код комнаты скопирован!');
    }
  };

  if (!room || !currentPlayer) {
    return null;
  }

  const isHost = currentPlayer.id === room.hostId;
  const submittedCount = room.submissions.length;
  const totalPlayers = room.players.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
            <Icon name="ArrowLeft" size={20} />
            Выйти
          </Button>
          
          <div className="flex items-center gap-4">
            <Card className="px-4 py-2">
              <div className="flex items-center gap-2">
                <Icon name="Hash" size={20} className="text-primary" />
                <span className="font-bold text-xl">{room.code}</span>
                <Button size="sm" variant="ghost" onClick={handleCopyCode}>
                  <Icon name="Copy" size={16} />
                </Button>
              </div>
            </Card>

            <Badge variant="outline" className="px-4 py-2 text-lg">
              <Icon name="Trophy" size={18} className="mr-2 text-accent" />
              до {room.maxScore} очков
            </Badge>
          </div>
        </div>

        {room.phase === 'lobby' && (
          <div className="space-y-6">
            <Card className="border-4 border-primary/30">
              <CardHeader>
                <CardTitle className="text-3xl text-center">Лобби игры</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {room.players.map((player) => (
                    <Card key={player.id} className="border-2 hover:border-primary/50 transition-all">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-3">
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={player.avatar} />
                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="text-center">
                            <p className="font-bold text-lg">{player.name}</p>
                            {player.id === room.hostId && (
                              <Badge variant="secondary" className="mt-1">
                                <Icon name="Crown" size={14} className="mr-1" />
                                Хост
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {isHost && (
                  <Button 
                    onClick={handleStartGame}
                    disabled={room.players.length < 2}
                    className="w-full h-16 text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent"
                  >
                    <Icon name="Play" size={28} className="mr-2" />
                    Начать игру {room.players.length < 2 && `(нужно минимум 2 игрока)`}
                  </Button>
                )}

                {!isHost && (
                  <div className="text-center text-muted-foreground">
                    Ожидаем начала игры от хоста...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {room.phase === 'playing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="px-4 py-2 text-lg">
                  Раунд {room.currentRound}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {submittedCount}/{totalPlayers} выбрали карту
                </div>
              </div>
              
              {!selectedCard && (
                <div className="flex items-center gap-2">
                  <Icon name="Clock" size={20} className="text-destructive" />
                  <span className="text-2xl font-bold text-destructive">{timer}с</span>
                </div>
              )}
            </div>

            <Card className="border-4 border-accent/40 card-shine">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Карта условия</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-accent/20 to-secondary/20 p-8 rounded-xl text-center">
                  <p className="text-3xl font-bold">{room.currentCondition}</p>
                </div>
              </CardContent>
            </Card>

            {!selectedCard ? (
              <>
                <h3 className="text-2xl font-bold text-center">Выбери карту действия</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {myCards.map((card, index) => (
                    <Card 
                      key={index}
                      className="cursor-pointer border-2 hover:border-primary hover:scale-105 transition-all duration-300 card-shine"
                      onClick={() => handleSelectCard(card)}
                    >
                      <CardContent className="p-6">
                        <p className="text-center font-semibold">{card}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="border-4 border-primary/40 pulse-glow">
                <CardHeader>
                  <CardTitle className="text-center text-2xl">Твоя комбинация</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-8 rounded-xl text-center space-y-4">
                    <p className="text-2xl font-bold">{selectedCard}</p>
                    <p className="text-xl text-muted-foreground">{room.currentCondition}</p>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-lg text-muted-foreground">Ожидаем остальных игроков...</p>
                    <Progress value={(submittedCount / totalPlayers) * 100} className="mt-4" />
                  </div>
                </CardContent>
              </Card>
            )}

            {submittedCount === totalPlayers && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-center">Кто бы мог это сделать?</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {room.players.map((player) => (
                    <Card 
                      key={player.id}
                      className={`cursor-pointer border-4 transition-all duration-300 ${
                        votedFor === player.id 
                          ? 'border-accent scale-105 shadow-2xl' 
                          : 'border-secondary/20 hover:border-secondary/60 hover:scale-105'
                      }`}
                      onClick={() => handleVote(player.id)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-3">
                          <Avatar className="w-24 h-24">
                            <AvatarImage src={player.avatar} />
                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="text-center">
                            <p className="font-bold text-xl">{player.name}</p>
                            <Badge variant="outline" className="mt-2">
                              {player.score} очков
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {room.phase === 'finished' && (
          <Card className="border-4 border-accent/40">
            <CardHeader>
              <div className="text-center space-y-4">
                <Icon name="Trophy" size={80} className="mx-auto text-accent animate-bounce-slow" />
                <CardTitle className="text-4xl">Игра окончена!</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {room.players
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <Card key={player.id} className={`border-2 ${index === 0 ? 'border-accent/60 bg-accent/10' : ''}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl font-bold text-muted-foreground">#{index + 1}</span>
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={player.avatar} />
                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-bold text-xl">{player.name}</p>
                          </div>
                          <Badge variant="outline" className="text-xl px-4 py-2">
                            {player.score} очков
                          </Badge>
                          {index === 0 && <Icon name="Crown" size={32} className="text-accent" />}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              <Button 
                onClick={() => navigate('/')}
                className="w-full mt-6 h-14 text-xl font-bold bg-gradient-to-r from-primary to-accent"
              >
                На главную
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6 border-2 border-muted">
          <CardHeader>
            <CardTitle className="text-xl">Игроки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {room.players.map((player) => (
                <div key={player.id} className="flex items-center gap-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={player.avatar} />
                    <AvatarFallback>{player.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{player.name}</p>
                    <p className="text-sm text-muted-foreground">{player.score} очков</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Room;