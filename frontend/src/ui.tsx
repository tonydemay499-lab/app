import React from "react";
import { Pressable, Text, TextProps, View, ViewStyle, StyleProp, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import Ionicons from "@react-native-vector-icons/ionicons";
import { makeStyles, useTheme } from "@/src/theme";

export const fonts = {
  regular: "PJ-Regular",
  semibold: "PJ-SemiBold",
  bold: "PJ-Bold",
  extrabold: "PJ-ExtraBold",
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };
export const radius = { sm: 8, md: 16, lg: 24, pill: 999 };

type Variant = "title" | "h2" | "h3" | "body" | "label" | "caption";

export function Txt({ variant = "body", style, ...rest }: TextProps & { variant?: Variant }) {
  const styles = useTxtStyles();
  return <Text {...rest} style={[styles[variant], style]} />;
}

const useTxtStyles = makeStyles((c) => ({
  title: { fontFamily: fonts.extrabold, fontSize: 30, lineHeight: 38, color: c.onSurface, letterSpacing: -0.5 },
  h2: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 31, color: c.onSurface },
  h3: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 27, color: c.onSurface },
  body: { fontFamily: fonts.regular, fontSize: 18, lineHeight: 27, color: c.onSurface },
  label: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 23, color: c.onSurface },
  caption: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: c.muted },
}));

type IconName = React.ComponentProps<typeof Ionicons>["name"];
export type { IconName };
export { Ionicons };

export function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  testID,
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  icon?: IconName;
  testID?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useBtnStyles();
  const { colors } = useTheme();
  const fg =
    variant === "primary" ? colors.onBrandPrimary : variant === "secondary" ? colors.onBrandTertiary : colors.brandPrimary;
  return (
    <Pressable
      testID={testID}
      disabled={disabled || loading}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={24} color={fg} /> : null}
          <Text style={[styles.text, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const useBtnStyles = makeStyles((c) => ({
  base: {
    minHeight: 58,
    borderRadius: radius.md,
    paddingHorizontal: space.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  primary: { backgroundColor: c.brandPrimary },
  secondary: { backgroundColor: c.brandTertiary },
  ghost: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: c.brandPrimary },
  text: { fontFamily: fonts.bold, fontSize: 18 },
}));

export function Card({ children, style, testID }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; testID?: string }) {
  const styles = useCardStyles();
  return (
    <View testID={testID} style={[styles.card, style]}>
      {children}
    </View>
  );
}

const useCardStyles = makeStyles((c) => ({
  card: {
    backgroundColor: c.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    padding: space.lg + 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
}));

export function IconBadge({ name, size = 56, tone = "brand" }: { name: IconName; size?: number; tone?: "brand" | "warning" | "error" }) {
  const { colors } = useTheme();
  const bg = tone === "brand" ? colors.brandTertiary : tone === "warning" ? colors.warningTint : colors.errorTint;
  const fg = tone === "brand" ? colors.brandPrimary : tone === "warning" ? colors.warning : colors.error;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 3.2, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <Ionicons name={name} size={size * 0.5} color={fg} />
    </View>
  );
}

export function ListRow({
  icon,
  title,
  subtitle,
  onPress,
  testID,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
  testID?: string;
}) {
  const styles = useRowStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceTertiary }]}
    >
      <IconBadge name={icon} />
      <View style={{ flex: 1 }}>
        <Txt variant="label">{title}</Txt>
        {subtitle ? <Txt variant="caption">{subtitle}</Txt> : null}
      </View>
      <Ionicons name="chevron-forward" size={26} color={colors.muted} />
    </Pressable>
  );
}

const useRowStyles = makeStyles((c) => ({
  row: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: c.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
  },
}));

export function BackHeader({ title, onBack, topInset, right }: { title: string; onBack: () => void; topInset: number; right?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        paddingTop: topInset + space.sm,
        paddingBottom: space.md,
        paddingHorizontal: space.lg,
        flexDirection: "row",
        alignItems: "center",
        gap: space.sm,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
      }}
    >
      <Pressable
        testID="header-back-button"
        onPress={onBack}
        hitSlop={8}
        style={({ pressed }) => ({
          width: 52,
          height: 52,
          borderRadius: 26,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: pressed ? colors.brandTertiary : colors.surfaceTertiary,
        })}
      >
        <Ionicons name="arrow-back" size={28} color={colors.onSurfaceTertiary} />
      </Pressable>
      <Txt variant="h3" style={{ flex: 1 }} numberOfLines={2}>
        {title}
      </Txt>
      {right}
    </View>
  );
}
