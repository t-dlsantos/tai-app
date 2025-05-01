import { View, Text, ActivityIndicator } from 'react-native';
import { Message } from '~/types/Message';

export function ChatBumble({ content, role, error, sources, loading }: Message) {
  return (
    <View
      className={`${role === 'user' ? 'self-end bg-zinc-200 dark:bg-zinc-900' : 'self-start'} 
      max-w-60 rounded-xl px-4 py-2 text-lg text-white dark:text-zinc-900`}>
      {loading ? (
        <ActivityIndicator color={"gray"} />
      ) : (
        <Text className="text-zinc-900 dark:text-white">{content}</Text>
      )}
    </View>
  );
}
