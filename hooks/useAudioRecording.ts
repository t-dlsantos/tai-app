import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  useAudioRecorder,
  RecordingPresets,
  AudioModule,
} from 'expo-audio';

export function useAudioRecording() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURI, setAudioURI] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  async function requestPermission() {
    const status = await AudioModule.requestRecordingPermissionsAsync();
    if (!status.granted) {
      Alert.alert('Permissão para usar o microfone foi negada');
    }
  }

  async function startRecording() {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  }

  async function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordingTime(0);

    await audioRecorder.stop();
    setAudioURI(audioRecorder.uri);
    return audioRecorder.uri;
  }

  async function cancelRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordingTime(0);

    await audioRecorder.stop();
    setAudioURI(null);
  }

  useEffect(() => {
    requestPermission();
  }, []);

  return {
    isRecording,
    audioURI,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}