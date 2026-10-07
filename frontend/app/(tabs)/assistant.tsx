import React from "react";
import { ScrollView, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { makeStyles, useTheme } from "@/src/theme";
import { usesNativeTabs } from "@/src/navigation";
import { Txt, Card, Button, IconBadge, Ionicons, space, radius } from "@/src/ui";
import { SUGGESTED_QUESTIONS } from "@/src/content";

export default function Assistant() {
  const insets = useSafeAreaInsets();
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.root} testID="assistant-screen">
      <View style={[styles.header, { paddingTop: insets.top + space.md }]}>
        <Txt variant="title">Assistant</Txt>
        <Txt variant="caption">Une question sur votre matériel ?</Txt>
      </View>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: bottomChrome + space.xl }}>
        <Card>
          <View style={{ flexDirection: "row", gap: space.md, alignItems: "center" }}>
            <IconBadge name="chatbubbles" />
            <Txt variant="h3" style={{ flex: 1 }}>Assistant Médical o2</Txt>
          </View>
          <Txt variant="body" style={{ marginTop: space.md }}>
            Bonjour, je réponds à vos questions sur votre PPC, votre ventilation, votre masque et leur entretien.
          </Txt>
          <Button testID="assistant-open-chat-button" title="Écrire ma question" icon="create" style={{ marginTop: space.lg }} onPress={() => router.push("/chat")} />
        </Card>

        <Txt variant="h3" style={{ marginTop: space.sm }}>Questions rapides</Txt>
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <Pressable
            key={q}
            testID={`assistant-suggestion-${i}`}
            onPress={() => router.push({ pathname: "/chat", params: { q } })}
            style={({ pressed }) => [styles.suggest, pressed && { backgroundColor: colors.brandTertiary }]}
          >
            <Txt variant="label" style={{ flex: 1 }}>{q}</Txt>
            <Ionicons name="arrow-forward-circle" size={30} color={colors.brandPrimary} />
          </Pressable>
        ))}

        <View style={styles.urgent} testID="assistant-emergency-card">
          <Ionicons name="warning" size={28} color={colors.error} />
          <Txt variant="body" style={{ flex: 1 }}>
            En cas d'urgence (forte gêne respiratoire, malaise), appelez le <Txt variant="label" style={{ color: colors.error }}>15</Txt>.
            L'assistant ne remplace pas votre médecin. Médical o2 : 04 28 41 01 10.
          </Txt>
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  header: { paddingHorizontal: space.lg, paddingBottom: space.md, borderBottomWidth: 1, borderBottomColor: c.divider, backgroundColor: c.surface },
  suggest: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.md,
    backgroundColor: c.surfaceSecondary,
    borderWidth: 1,
    borderColor: c.border,
  },
  urgent: { flexDirection: "row", gap: space.md, padding: space.lg, borderRadius: radius.md, backgroundColor: c.errorTint, marginTop: space.md },
}));
