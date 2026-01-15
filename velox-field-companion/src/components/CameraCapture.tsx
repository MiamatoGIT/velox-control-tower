import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { VELOX_COLORS } from '../theme/colors';

interface CameraCaptureProps {
  onPhotoTaken: (uri: string) => void;
  onClose: () => void;
}

export const CameraCapture = ({ onPhotoTaken, onClose }: CameraCaptureProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{color:'#fff', marginBottom: 20}}>Camera Access Needed</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}><Text>GRANT PERMISSION</Text></TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      if (photoData?.uri) setPhoto(photoData.uri);
    }
  };

  const confirmPhoto = () => {
    if (photo) onPhotoTaken(photo);
  };

  return (
    <Modal animationType="slide" transparent={false} visible={true}>
      <View style={styles.container}>
        {photo ? (
          // PREVIEW SCREEN
          <View style={styles.preview}>
            <Image source={{ uri: photo }} style={styles.previewImg} />
            <View style={styles.controls}>
              <TouchableOpacity onPress={() => setPhoto(null)} style={styles.btnRetake}>
                <Text style={styles.btnText}>RETAKE</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmPhoto} style={styles.btnSave}>
                <Text style={styles.btnText}>USE PHOTO</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // CAMERA SCREEN
          <CameraView style={styles.camera} ref={cameraRef} facing="back">
            <View style={styles.overlay}>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>CANCEL</Text>
              </TouchableOpacity>
              <View style={styles.bottomBar}>
                <TouchableOpacity onPress={takePicture} style={styles.shutterBtn}>
                  <View style={styles.shutterInner} />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between', padding: 20 },
  closeBtn: { marginTop: 40, alignSelf: 'flex-start', padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8 },
  closeText: { color: '#fff', fontWeight: 'bold' },
  bottomBar: { alignItems: 'center', marginBottom: 30 },
  shutterBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: VELOX_COLORS.primary },
  
  preview: { flex: 1 },
  previewImg: { flex: 1 },
  controls: { flexDirection: 'row', height: 100, backgroundColor: '#000', justifyContent: 'space-around', alignItems: 'center' },
  btnRetake: { padding: 15 },
  btnSave: { padding: 15, backgroundColor: VELOX_COLORS.primary, borderRadius: 8 },
  btn: { padding: 15, backgroundColor: VELOX_COLORS.primary, borderRadius: 8 },
  btnText: { fontWeight: 'bold' }
});