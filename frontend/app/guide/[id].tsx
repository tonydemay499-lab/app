import React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";

import { makeStyles, useTheme } from "@/src/theme";
import { Txt, Button, BackHeader, Ionicons, space, radius, fonts } from "@/src/ui";
import { GUIDES, MASK_IMAGE } from "@/src/content";

export default function GuideDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const guide = GUIDES.find((g) => g.id === id);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/guides"));

  if (!guide) {
    return (
      <View style={styles.root}>
        <BackHeader title="Guide introuvable" onBack={back} topInset={insets.top} />
        <View style={{ padding: space.lg }}>
          <Button title="Retour aux guides" onPress={back} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root} testID="guide-detail-screen">
      <BackHeader title={guide.title} onBack={back} topInset={insets.top} />
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: insets.bottom + space.xl }}>
        {guide.id === "masque" || guide.id === "ppc" ? (
          <Image source={MASK_IMAGE} style={styles.image} contentFit="cover" transition={300} />
        ) : null}
        <Txt variant="body" testID="guide-intro">{guide.intro}</Txt>

        {guide.steps.map((s, i) => (
          <View key={s.title} style={styles.step} testID={`guide-step-${i}`}>
            <View style={styles.num}>
              <Txt style={styles.numText}>{i + 1}</Txt>
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="h3">{s.title}</Txt>
              <Txt variant="body" style={{ marginTop: space.xs }}>{s.text}</Txt>
            </View>
          </View>
        ))}

        {guide.tips?.length ? (
          <View style={styles.tips}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm, marginBottom: space.sm }}>
              <Ionicons name="bulb" size={26} color={colors.brandPrimary} />
              <Txt variant="h3" style={{ color: colors.onBrandTertiary }}>Conseils</Txt>
            </View>
            {guide.tips.map((t) => (
              <View key={t} style={{ flexDirection: "row", gap: space.sm, marginTop: space.sm }}>
                <Ionicons name="checkmark-circle" size={22} color={colors.brandPrimary} style={{ marginTop: 3 }} />
                <Txt variant="body" style={{ flex: 1, color: colors.onBrandTertiary }}>{t}</Txt>
              </View>
            ))}
          </View>
        ) : null}

        {guide.warning ? (
          <View style={styles.warn} testID="guide-warning">
            <Ionicons name="warning" size={28} color={colors.error} />
            <Txt variant="body" style={{ flex: 1 }}>{guide.warning}</Txt>
          </View>
        ) : null}

        <Button testID="guide-ask-assistant-button" title="Poser une question" icon="chatbubbles" variant="secondary" onPress={() => router.push({ pathname: "/chat", params: { q: `J'ai une question sur : ${guide.title}` } })} />
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  image: { height: 190, borderRadius: radius.lg, backgroundColor: c.surfaceTertiary },
  step: { flexDirection: "row", gap: space.lg, backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: c.border, padding: space.lg },
  num: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.brandPrimary, alignItems: "center", justifyContent: "center" },
  numText: { fontFamily: fonts.extrabold, fontSize: 20, color: c.onBrandPrimary },
  tips: { backgroundColor: c.brandTertiary, borderRadius: radius.lg, padding: space.lg },
  warn: { flexDirection: "row", gap: space.md, backgroundColor: c.errorTint, borderRadius: radius.lg, padding: space.lg },
}));
