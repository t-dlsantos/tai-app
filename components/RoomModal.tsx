import { useState } from 'react';
import { View, Modal, TouchableOpacity, Text, Share, TextInput } from 'react-native';

export function RoomModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [roomName, setRoomName] = useState('');

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my room: ${roomName}`,
        title: 'Share Room',
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white dark:bg-gray-800 w-[90%] rounded-2xl p-6 shadow-lg">
          <Text className="text-xl font-bold mb-4 text-center dark:text-white">
            Criar Sala
          </Text>

          <TextInput
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-5 dark:text-white"
            placeholder="Digite o nome da sala"
            placeholderTextColor="#9CA3AF"
            value={roomName}
            onChangeText={setRoomName}
          />

          <View className="flex-row justify-between w-full gap-4">
            <TouchableOpacity
              className="flex-1 bg-red-500 p-3 rounded-lg"
              onPress={onClose}
            >
              <Text className="text-white font-bold text-center">Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-green-500 p-3 rounded-lg"
              onPress={handleShare}
            >
              <Text className="text-white font-bold text-center">Compartilhar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
