import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatStatusProps {
  isConnected: boolean;
  isWaiting: boolean;
  isThinking: boolean;
  isCurrentUserTurn: boolean;
  currentTurn: string | null;
  participants: string[];
  mode: 'solo' | 'group';
  error: string | null;
  onReconnect?: () => void;
}

export function ChatStatus({
  isConnected,
  isWaiting,
  isThinking,
  isCurrentUserTurn,
  currentTurn,
  participants,
  mode,
  error,
  onReconnect
}: ChatStatusProps) {
  const getStatusText = () => {
    if (error) return 'Erro de conexão';
    if (!isConnected) return 'Conectando...';
    if (isWaiting) return 'Aguardando participantes...';
    if (isThinking) return 'IA está pensando...';
    if (isCurrentUserTurn) return 'Sua vez!';
    if (currentTurn) return `Vez de: ${currentTurn}`;
    return 'Pronto';
  };

  const getStatusColor = () => {
    if (error || !isConnected) return '#ef4444';
    if (isWaiting) return '#f59e0b';
    if (isThinking) return '#3b82f6';
    if (isCurrentUserTurn) return '#10b981';
    return '#6b7280';
  };

  const getStatusIcon = () => {
    if (error || !isConnected) return 'warning';
    if (isWaiting) return 'time';
    if (isThinking) return 'brain';
    if (isCurrentUserTurn) return 'checkmark-circle';
    return 'ellipse';
  };

  return (
    <View className="w-full bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-2">
            <Ionicons 
              name={getStatusIcon() as any} 
              size={16} 
              color={getStatusColor()} 
            />
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getStatusText()}
            </Text>
          </View>
          
          {mode === 'group' && participants.length > 0 && (
            <View className="flex-row items-center gap-1 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
              <Ionicons name="people" size={14} color="#6b7280" />
              <Text className="text-xs text-gray-600 dark:text-gray-300">
                {participants.length}
              </Text>
            </View>
          )}
        </View>
        
        {error && onReconnect && (
          <TouchableOpacity 
            onPress={onReconnect}
            className="flex-row items-center gap-1 bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded"
          >
            <Ionicons name="refresh" size={14} color="#dc2626" />
            <Text className="text-xs text-red-600 dark:text-red-400">Reconectar</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <View className="mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          <Text className="text-sm text-red-600 dark:text-red-400">
            {error}
          </Text>
        </View>
      )}
    </View>
  );
} 