import React, { useEffect, useRef } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatBumble } from '~/components/ChatBumble';
import { Message } from '~/types/Message';

interface Props {
  messages: Message[];
}

export function ChatContainer({ messages }: Props) {
  const flatListRef = useRef<FlatList>(null);
  
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  return (
    <SafeAreaView className="w-full flex-1 dark:bg-black">
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => ( 
          <ChatBumble
            content={item.content}
            role={item.role}
            loading={item.loading}
          />
        )}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ref={flatListRef}
      />
    </SafeAreaView>
  );
}
