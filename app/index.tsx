import { useState } from 'react';

import { useColorScheme } from 'nativewind';

import { View, Button, TextInput } from 'react-native';

import { CarouselContexts } from '~/components/CarouselContexts';
import { Logo } from '~/components/Logo';
import { Container } from '~/components/Container';

export default function Home() {
  const { toggleColorScheme } = useColorScheme();

  return (
    <Container>
      <Logo />
      <CarouselContexts />
      <Button title='change' onPress={toggleColorScheme}/>
    </Container>
  );
}
