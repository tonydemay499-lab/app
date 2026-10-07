import React, { useState } from "react";
import { ScrollView, View, Pressable, LayoutAnimation } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { makeStyles, useTheme } from "@/src/theme";
import { Txt, BackHeader, Button, Ionicons, space, radius } from "@/src/ui";
import { FAQ } from "@/src/content";

export default function FaqScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const [open, setOpen] = useState<number | null>(0);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));

  return (
    <View style={styles.root} testID="faq-screen">
      <BackHeader title="Questions fréquentes" onBack={back} topInset={insets.top} />
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: insets.bottom + space.xl }}>
        {FAQ.map((f, i) => {
          const isOpen = open === i;
          return (
            <Pressable
              key={f.q}
              testID={`faq-item-${i}`}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setOpen(isOpen ? null : i);
              }}
              style={[styles.item, isOpen && { borderColor: colors.brandPrimary }]}
            >
              <View style={styles.qRow}>
                <Txt variant="label" style={{ flex: 1 }}>{f.q}</Txt>
                <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={26} color={colors.brandPrimary} />
              </View>
              {isOpen ? (
                <Txt variant="body" style={{ marginTop: space.md, color: colors.onSurfaceSecondary }} testID={`faq-answer-${i}`}>
                  {f.a}
                </Txt>
              ) : null}
            </Pressable>
          );
        })}
        <Txt variant="caption" style={{ marginTop: space.md, textAlign: "center" }}>Vous ne trouvez pas votre réponse ?</Txt>
        <Button testID="faq-ask-assistant-button" title="Demander à l'assistant" icon="chatbubbles" onPress={() => router.push("/chat")} />
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  item: { backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1.5, borderColor: c.border, padding: space.lg, minHeight: 64 },
  qRow: { flexDirection: "row", alignItems: "center", gap: space.md },
}));
