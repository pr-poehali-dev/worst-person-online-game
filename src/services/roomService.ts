import { Room } from '@/types/game';

const API_URL = 'https://functions.poehali.dev/e6fca4f7-80ae-4b88-97e1-a62289332237';

export const roomService = {
  async createRoom(code: string, room: Room): Promise<Room> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create',
        code,
        room
      })
    });

    if (!response.ok) {
      throw new Error('Не удалось создать комнату');
    }

    const data = await response.json();
    return data.room;
  },

  async joinRoom(code: string, player: any): Promise<Room> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'join',
        code,
        player
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Комната не найдена');
    }

    const data = await response.json();
    return data.room;
  },

  async getRoom(code: string): Promise<Room> {
    const response = await fetch(`${API_URL}?code=${code}`);

    if (!response.ok) {
      throw new Error('Комната не найдена');
    }

    const data = await response.json();
    return data.room;
  },

  async updateRoom(code: string, room: Room): Promise<Room> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update',
        code,
        room
      })
    });

    if (!response.ok) {
      throw new Error('Не удалось обновить комнату');
    }

    const data = await response.json();
    return data.room;
  }
};
