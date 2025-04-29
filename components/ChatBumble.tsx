import { View, Text } from 'react-native';

interface Props {
  text: string;
  isUser?: boolean;
}

export function ChatBumble({ text, isUser }: Props) {
  return (
    <View
      className={`${isUser ? 'self-end bg-zinc-200 dark:bg-zinc-900' : 'self-start '} 
      max-w-60 rounded-xl px-4 py-2 text-white text-lg dark:text-zinc-900`}>
      <Text className="text-zinc-900 dark:text-white">{text}</Text>
    </View>
  );
}
