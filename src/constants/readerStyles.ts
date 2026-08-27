import { colors, withOpacity } from "./colors";

export const readerStyles = {
  panel: {
    backgroundColor: withOpacity(colors.primary, 0.95),
  },

  iconButton: {
    width: 44,
    height: 44,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: withOpacity(colors.primarySoft, 0.48),
    borderRadius: 22,

    elevation: 4,

    shadowColor: colors.black,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  border: {
    borderWidth: 1,
    borderColor: colors.border,
  },
} as const;
