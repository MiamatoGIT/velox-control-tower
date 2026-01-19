import { useState } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

export const useAudioRecorder = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); 
  const [recordingUri, setRecordingUri] = useState<string | null>(null); // ✅ NEW: Store file path
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.metering) {
            const db = status.metering;
            setAudioLevel(Math.max(0, (db + 60) * 2.5)); 
          }
        },
        100
      );
      setRecording(recording);
      setIsRecording(true);
      setRecordingUri(null); // Reset previous recording
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    setAudioLevel(0);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); 
    setRecordingUri(uri); // ✅ Capture the file path
    setRecording(null);
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  return { isRecording, toggleRecording, audioLevel, recordingUri };
};