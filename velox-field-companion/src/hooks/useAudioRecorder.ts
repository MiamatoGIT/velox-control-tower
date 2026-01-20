import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

export const useAudioRecorder = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); 
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (e) { console.error(e); }
    })();
  }, []);

  // Audio Level Monitor
  useEffect(() => {
    if (!recording) return;
    const interval = setInterval(async () => {
      try {
        const status = await recording.getStatusAsync();
        if (status.isRecording && status.metering !== undefined) {
           const db = status.metering;
           const level = Math.max(0, (db + 160) / 160); 
           setAudioLevel(level);
        }
      } catch (e) {}
    }, 100);
    return () => clearInterval(interval);
  }, [recording]);

  const toggleRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        setIsRecording(false);
        setRecordingUri(uri);
        setAudioLevel(0);
      } catch (error) { console.error(error); }
    } else {
      try {
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
        setIsRecording(true);
        setRecordingUri(null);
      } catch (error) { Alert.alert("Error", "Check microphone permissions"); }
    }
  };

  // ✅ THIS FIXES THE CRASH
  const resetRecording = () => {
      setRecording(null);
      setIsRecording(false);
      setRecordingUri(null);
      setAudioLevel(0);
  };

  return { isRecording, toggleRecording, resetRecording, audioLevel, recordingUri };
};