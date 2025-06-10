import { SafeAreaView } from "react-native-safe-area-context";

import { ReactNode } from 'react';
import { KeyboardAvoidingView } from "react-native";

interface ContainerProps {
  children: ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <SafeAreaView className="flex-1 w-full p-5 justify-start items-center dark:bg-black">
      {children}
    </SafeAreaView>
  );
}