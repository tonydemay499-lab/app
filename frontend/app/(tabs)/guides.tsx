import React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { makeStyles } from "@/src/theme";
import { usesNativeTabs } from "@/src/navigation";
import { Txt, ListRow, space } from "@/src/ui";
import { GUIDES } from "@/src/content";

export default function Guides() {
  const insets = useSafeAreaInsets();
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const router = useRouter();
  const styles = useStyles();

  const section = (cat: "utilisation" | "entretien") =>
    GUIDES.filter((g) => g.category === cat).map((g) => (
      <ListRow key={g.id} testID={`guide-item-${g.id}`} icon={g.icon} title={g.title} subtitle={g.subtitle} onPress={() => router.push(`/guide/${g.id}`)} />
    ));

  return (
    <View style={styles.root} testID="guides-screen">
      <View style={[styles.header, { paddingTop: insets.top + space.md }]}>
        <Txt variant="title">Guides</Txt>
        <Txt variant="caption">Pas à pas, à votre rythme</Txt>
      </View>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: bottomChrome + space.xl }}>
        <Txt variant="h3" style={styles.sectionTitle}>Utilisation</Txt>
        {section("utilisation")}
        <Txt variant="h3" style={styles.sectionTitle}>Entretien</Txt>
        {section("entretien")}
        <Txt variant="h3" style={styles.sectionTitle}>Outils</Txt>
        <ListRow testID="guides-reminders-link" icon="alarm" title="Mes rappels d'entretien" subtitle="Cocher ce que j'ai fait" onPress={() => router.push("/entretien")} />
        <ListRow testID="guides-faq-link" icon="help-circle" title="Questions fréquentes" subtitle="8 réponses simples" onPress={() => router.push("/faq")} />
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  header: { paddingHorizontal: space.lg, paddingBottom: space.md, borderBottomWidth: 1, borderBottomColor: c.divider, backgroundColor: c.surface },
  sectionTitle: { marginTop: space.md, color: c.onSurfaceTertiary },
}));
