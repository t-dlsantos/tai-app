import { View, Text } from 'react-native';

export interface MessageProps {
  id: string;
  role: 'user' | 'assistant' | 'other_user';
  sender: string;
  content: string;
  error?: boolean;
}

export function ChatMessage({ message }: { message: MessageProps }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isOtherUser = message.role === 'other_user';

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
