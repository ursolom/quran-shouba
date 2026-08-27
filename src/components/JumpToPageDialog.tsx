import { useState } from "react";
import { Keyboard, Modal, Pressable, Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

interface JumpToPageDialogProps {
  visible: boolean;
  totalPages: number;
  onJump: (pageIndex: number) => void;
  onClose: () => void;
}

export default function JumpToPageDialog({
  visible,
  totalPages,
  onJump,
  onClose,
}: JumpToPageDialogProps) {
  const [input, setInput] = useState("");

  const handleJump = (): void => {
    const pageNumber = parseInt(input, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      Keyboard.dismiss();
      onJump(pageNumber - 1);
      setInput("");
    }
  };

  const handleClose = (): void => {
    Keyboard.dismiss();
    setInput("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        className="flex-1 items-center justify-center bg-black/50"
        onPress={handleClose}
      >
        <Pressable
          className="w-[280px] rounded-xl bg-white p-5"
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="mb-4 text-center text-lg font-semibold">
            Jump to Page
          </Text>
          <TextInput
            className="mb-4 rounded-lg border border-gray-200 p-3 text-center text-base"
            keyboardType="numeric"
            value={input}
            onChangeText={setInput}
            placeholder={`1 - ${totalPages}`}
            placeholderTextColor="#999"
            autoFocus
            onSubmitEditing={handleJump}
          />
          <View className="flex-row justify-end gap-2">
            <Pressable className="rounded-lg px-4 py-2" onPress={handleClose}>
              <Text className="text-base text-gray-500">Cancel</Text>
            </Pressable>
            <Pressable
              className="rounded-lg bg-blue-500 px-4 py-2"
              onPress={handleJump}
            >
              <Text className="text-base text-white">Go</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
