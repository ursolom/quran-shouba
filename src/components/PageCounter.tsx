import { StyleSheet, Text, View } from "react-native";

interface PageCounterProps {
  currentPage: number;
  totalPages: number;
}

export default function PageCounter({ currentPage, totalPages }: PageCounterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {currentPage + 1} / {totalPages}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
