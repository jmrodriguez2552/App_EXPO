import {
  Text,
  View,
  StyleSheet,
  ImageSourcePropType,
  Platform,
} from "react-native";
import ImageViewer from "../../../components/ImageViewer";
import Button from "../../../components/Button";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect, useRef } from "react";
import CircleButton from "../../../components/CircleButton";
import IconButton from "../../../components/IconButton";
import EmojiPicker from "../../../components/EmojiPicker";
import EmojiList from "../../../components/EmojiList";
import EmojiSticker from "../../../components/EmojiSticker";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as MediaLibrary from "expo-media-library/legacy";
import ViewShot, { captureRef, ViewShotRef  } from "react-native-view-shot";

const PlaceholderImage = require("@/assets/images/background-image.png");

export default function Index() {
  const [permissionResponse, requestPermission] =
    ImagePicker.useMediaLibraryPermissions();

  const imageRef = useRef<ViewShotRef>(null);

  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined,
  );
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [pickedEmoji, setPickedEmoji] = useState<
    ImageSourcePropType | undefined
  >(undefined);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowAppOptions(true);
    } else {
      alert("Debes de seleccionar una imagen.");
    }
  };

  const onReset = () => {
    setShowAppOptions(false);
  };

  const onAddSticker = () => {
    setIsModalVisible(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const onSaveImageAsync = async () => {
    if (Platform.OS !== "web") {
      try {
        const localUri = await captureRef(imageRef, {
          height: 440,
          quality: 1,
        });

        await MediaLibrary.saveToLibraryAsync(localUri);
        if (localUri) {
          alert("Saved!");
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        const dataUrl = await captureRef(imageRef, {
          format: "jpg",
          quality: 0.9,
          width: 320,
          height: 440,
          result:'data-uri',
        });

        let link = document.createElement("a");
        link.download = 'sticker-smash.jpg';
        link.href = dataUrl;
        link.click();

        console.log("Imagen guardada en:", dataUrl);
        alert("¡Captura guardada con éxito!");
        
      } catch (e) {
        console.error("Error al capturar:", e);
      }
    }
  };

  useEffect(() => {
    if (!permissionResponse?.granted) {
      requestPermission();
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <ViewShot ref={imageRef} options={{format: 'jpg', quality: 0.9 }}>
            <ImageViewer
              imgSource={PlaceholderImage}
              selectedImage={selectedImage}
            />
            {pickedEmoji && (
              <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />
            )}
          </ViewShot>
        </View>
        {showAppOptions ? (
          <View style={styles.optionsContainer}>
            <View style={styles.optionsRow}>
              <IconButton icon="refresh" label="Reset" onPress={onReset} />
              <CircleButton onPress={onAddSticker} />
              <IconButton
                icon="save-alt"
                label="Save"
                onPress={onSaveImageAsync}
              />
            </View>
          </View>
        ) : (
          <View style={styles.footerContainer}>
            <Button
              theme="primary"
              label="Elige una foto"
              onPress={pickImageAsync}
            ></Button>
            <Button
              label="Usar foto"
              onPress={() => setShowAppOptions(true)}
            ></Button>
          </View>
        )}
        <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
          <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
        </EmojiPicker>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: "center",
  },
  optionsContainer: {
    position: "absolute",
    bottom: 80,
  },
  optionsRow: {
    alignItems: "center",
    flexDirection: "row",
  },
});
