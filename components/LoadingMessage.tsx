import { useEffect, useState } from "react";
import { Text } from "react-native";

export function LoadingMessage() {
    const [dots, setDots] = useState(".");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length < 3 ? prev + "." : "."))
        }, 400);

        return () => clearInterval(interval);
    }, []);

    return (
        <Text className="text-black opacity-70 text-xl">{dots}</Text>
    );
}