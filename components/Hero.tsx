import { View, Text, Image } from "react-native";

import Logo from 'assets/logo.png';

export function Hero() {
    return (
        <View className="w-full h-52 bg-[#896FCB] p-2 items-center rounded-lg flex-row">
            <Text className="text-white font-semibold text-3xl w-48">
                Aprenda com situações reais
            </Text>
            <Image source={Logo} className="justify-self-end"/>
        </View>
    );
}