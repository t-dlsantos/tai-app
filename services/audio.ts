const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function sendAudio(uri: string) {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: 'audio.m4a',
      type: 'audio/m4a',
    } as any);

    const response = await fetch("https://" + API_URL + '/audio/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Erro ao enviar áudio:', error);
    throw error;
  }
}
