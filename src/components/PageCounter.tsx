import { Text, View } from "react-native";

interface PageCounterProps {
  currentPage: number;
  totalPages: number;
}

export default function PageCounter({ currentPage, totalPages }: PageCounterProps) {
  return (
    <View className="rounded-2xl bg-black/50 px-3 py-1.5">
      <Text className="text-sm font-semibold text-white">
        {currentPage} / {totalPages}
      </Text>
    </View>
  );
}
