import { View, Text } from 'react-native';
import { useUserId } from '~/hooks/useUserId';

export interface MessageProps {
  id: string;
  role: 'user' | 'assistant' | 'other_user';
  sender: number;
  content: string;
  error?: boolean;
}

export function ChatMessage({ message }: { message: MessageProps }) {
  const userId = useUserId()
  
  const isUser = String(message.sender) === String(userId);
  const isAssistant = message.role === 'assistant';
  const isOtherUser = !isUser && !isAssistant;

  const alignmentClass = isAssistant
    ? 'self-center'
    : isUser
      ? 'self-end bg-zinc-200'
      : 'self-start';
      
  return (
    <View className='w-full flex-col'>
      {(isAssistant || isOtherUser) && (
        <Text className="mb-1 text-sm text-gray-500">{message.sender}</Text>
      )}
      <View
        className={`max-w-60 rounded-xl px-4 py-2 ${alignmentClass}`}
      >
        <Text className="text-lg text-black">{message.content}</Text>
      </View>
    </View>
  );
}
