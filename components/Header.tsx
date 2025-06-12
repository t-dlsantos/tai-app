import { View } from 'react-native';

import { Logo } from './Logo';

import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';

interface Props {
    showBackButton?: boolean;
}

export function Header({ showBackButton }: Props) {
    return (
        <View className='w-full flex-row justify-between items-center mb-9'>
            {showBackButton &&
                <Ionicons name='arrow-back' size={22} color={'gray'} onPress={() => router.replace('/home')}/>
            }
            <Logo />
        </View>
    );
}