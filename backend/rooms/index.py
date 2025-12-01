"""
Business: Управление игровыми комнатами - создание, вход, синхронизация состояния
Args: event - dict с httpMethod, body, queryStringParameters, pathParams
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с данными комнаты
"""

import json
from typing import Dict, Any, List

rooms_storage: Dict[str, Any] = {}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    if method == 'POST':
        try:
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'create':
                code = body_data.get('code')
                room_data = body_data.get('room')
                rooms_storage[code] = room_data
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'room': room_data}),
                    'isBase64Encoded': False
                }
            
            elif action == 'join':
                code = body_data.get('code')
                player = body_data.get('player')
                
                if code not in rooms_storage:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Комната не найдена'}),
                        'isBase64Encoded': False
                    }
                
                room = rooms_storage[code]
                room['players'].append(player)
                rooms_storage[code] = room
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'room': room}),
                    'isBase64Encoded': False
                }
            
            elif action == 'update':
                code = body_data.get('code')
                room_data = body_data.get('room')
                
                if code not in rooms_storage:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Комната не найдена'}),
                        'isBase64Encoded': False
                    }
                
                rooms_storage[code] = room_data
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'room': room_data}),
                    'isBase64Encoded': False
                }
                
        except Exception as e:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    if method == 'GET':
        query_params = event.get('queryStringParameters') or {}
        code = query_params.get('code')
        
        if not code:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Код комнаты не указан'}),
                'isBase64Encoded': False
            }
        
        if code not in rooms_storage:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Комната не найдена'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'room': rooms_storage[code]}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Метод не поддерживается'}),
        'isBase64Encoded': False
    }
