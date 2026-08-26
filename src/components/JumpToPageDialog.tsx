import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
} from "react-native";

interface JumpToPageDialogProps {
  visible: boolean;
  totalPages: number;
  onJump: (page: number) => void;
  onClose: () => void;
}

export default function JumpToPageDialog({
  visible,
  totalPages,
  onJump,
  onClose,
}: JumpToPageDialogProps) {
  const [input, setInput] = useState("");

  const handleJump = () => {
    const page = parseInt(input, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      Keyboard.dismiss();
      onJump(page - 1);
      setInput("");
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setInput("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Jump to Page</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={input}
            onChangeText={setInput}
            placeholder={`1 - ${totalPages}`}
            placeholderTextColor="#999"
            autoFocus
            onSubmitEditing={handleJump}
          />
          <View style={styles.buttons}>
            <Pressable style={styles.button} onPress={handleClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={handleJump}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                Go
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: 280,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    color: "#666",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  primaryButtonText: {
    color: "#fff",
  },
});
