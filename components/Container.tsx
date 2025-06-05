import { SafeAreaView } from "react-native-safe-area-context";

import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <SafeAreaView className="flex-1 w-full p-6 justify-center items-center dark:bg-black">
      {children}
    </SafeAreaView>
  );
}