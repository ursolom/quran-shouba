export const colors = {
  background: "#FFFBEF",

  primary: "#5C7B37",
  primarySoft: "#0F9D58",
  green: "#0F9D58",

  white: "#FFFFFF",
  black: "#000000",
  gold: "#FFD700",
  opacity: {
    header: 0.6,
    button: 1,
  },
  border: "rgba(255, 255, 255, 0.2)",
  surface: "rgba(255, 255, 255, 0.1)",
} as const;

export const withOpacity = (color: string, opacity: number) => {
  if (!color.startsWith("#") || color.length !== 7) {
    return color;
  }

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
