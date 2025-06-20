import type { ImageSourcePropType } from "react-native";

export interface ContextItem {
    id: number;
    imageSource: ImageSourcePropType;
    title: string;
    text: string;
    description: string;
}