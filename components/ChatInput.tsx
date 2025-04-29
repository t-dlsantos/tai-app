import { Dispatch, SetStateAction } from 'react';

import { TextInput, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

interface Props {
  handleSendMessage: () => void;
  newMessage: string;
  setNewMessage: Dispatch<SetStateAction<string>>;
}

export function ChatInput({ handleSendMessage, newMessage, setNewMessage }: Props) {
  return (
    <View className="min-h-9 w-full flex-row items-center rounded-2xl bg-zinc-200 p-2 dark:bg-zinc-900">
      <TextInput
        placeholder="Start typing..."
        placeholderTextColor={'gray'}
        className="flex-1 text-black dark:text-white"
        multiline={true}
        value={newMessage}
        onChangeText={setNewMessage}
      />
      <TouchableOpacity onPress={handleSendMessage}>
        <Ionicons name="send" color="gray" size={18} />
      </TouchableOpacity>
    </View>
  );
}
