import { useColorScheme } from "nativewind";
import { Button, View } from "react-native";

export default function Profile() {
    const { toggleColorScheme } = useColorScheme();

    return (
        <View className="flex-1 justify-center items-center">
            <Button title='change' onPress={toggleColorScheme}/>
        </View>
    );
}