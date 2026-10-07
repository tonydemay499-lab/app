import React from "react";
import { ScrollView, View, Share, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { format, subMonths, addMonths } from "date-fns";
import { fr } from "date-fns/locale";

import { makeStyles, useTheme } from "@/src/theme";
import { Txt, BackHeader, Button, Card, space, radius, fonts } from "@/src/ui";
import { epworthLabel } from "@/src/questionnaire";
import { CONTACT_PHONE, CONTACT_TEL } from "@/src/content";
import { useData, formatHours, dateKey, parseKey } from "@/src/store";

const fmt = (k: string) => format(parseKey(k), "d MMMM yyyy", { locale: fr });

export default function Bilan() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { logs, surveys } = useData();
  const back = () => (router.canGoBack() ? router.back() : router.replace("/suivi"));

  const from = dateKey(subMonths(new Date(), 3));
  const nights = logs.filter((l) => l.date >= from);
  const sv = surveys.filter((s) => s.date >= from).slice().reverse(); // oldest first
  const avgHours = nights.length ? nights.reduce((a, l) => a + l.hours, 0) / nights.length : 0;
  const okPct = nights.length ? Math.round((nights.filter((l) => l.hours >= 4).length / nights.length) * 100) : 0;
  const first = sv[0];
  const last = sv[sv.length - 1];
  const issues = sv.reduce<Record<string, number>>((acc, s) => (s.issue ? { ...acc, [s.issue]: (acc[s.issue] ?? 0) + 1 } : acc), {});
  const issueList = Object.entries(issues).sort((a, b) => b[1] - a[1]);

  const allDates = [...logs.map((l) => l.date), ...surveys.map((s) => s.date)].sort();
  const start = allDates[0];
  let nextBilan: Date | null = null;
  if (start) {
    nextBilan = addMonths(parseKey(start), 3);
    while (nextBilan < new Date()) nextBilan = addMonths(nextBilan, 3);
  }

  const share = () => {
    const lines = [
      "Bilan patient – Médical o2 Provence",
      `Période : du ${fmt(from)} au ${fmt(dateKey())}`,
      "",
      `Nuits notées : ${nights.length}`,
      `Utilisation moyenne : ${formatHours(Math.round(avgHours * 2) / 2)} par nuit`,
      `Nuits de 4 h ou plus : ${okPct} %`,
      "",
      `Questionnaires remplis : ${sv.length}`,
      first ? `Ressenti : ${first.wellbeing} % (${fmt(first.date)}) → ${last.wellbeing} % (${fmt(last.date)})` : "",
      first ? `Somnolence Epworth : ${first.epworth}/24 → ${last.epworth}/24 (${epworthLabel(last.epworth).label})` : "",
      issueList.length ? `Gênes signalées : ${issueList.map(([k, n]) => `${k} (${n} fois)`).join(", ")}` : "Gênes signalées : aucune",
    ].filter((l) => l !== "");
    Share.share({ message: lines.join("\n") }).catch(() => {});
  };

  return (
    <View style={styles.root} testID="bilan-screen">
      <BackHeader title="Mon bilan des 3 mois" onBack={back} topInset={insets.top} />
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: insets.bottom + space.xl }}>
        <Txt variant="body" style={{ color: colors.muted }}>
          Du {fmt(from)} à aujourd'hui. À montrer ou envoyer à votre technicien Médical o2 lors de votre bilan.
        </Txt>
        {nextBilan ? (
          <View style={styles.next} testID="bilan-next-date">
            <Txt variant="label" style={{ color: colors.onBrandTertiary }}>
              Prochain bilan conseillé : {format(nextBilan, "d MMMM yyyy", { locale: fr })}
            </Txt>
          </View>
        ) : null}

        <Card testID="bilan-usage-card">
          <Txt variant="h3">Utilisation de l'appareil</Txt>
          <View style={styles.statsRow}>
            <Stat value={String(nights.length)} label="nuits notées" testID="bilan-nights" />
            <Stat value={formatHours(Math.round(avgHours * 2) / 2)} label="en moyenne" testID="bilan-avg" />
            <Stat value={`${okPct} %`} label="nuits ≥ 4 h" testID="bilan-ok" />
          </View>
        </Card>

        <Card testID="bilan-survey-card">
          <Txt variant="h3">Ressenti et somnolence</Txt>
          {first ? (
            <>
              <Txt variant="caption" style={{ marginTop: space.xs }}>{sv.length} questionnaire{sv.length > 1 ? "s" : ""} rempli{sv.length > 1 ? "s" : ""}</Txt>
              <View style={styles.statsRow}>
                <Stat value={`${last.wellbeing} %`} label={sv.length > 1 ? `ressenti (début : ${first.wellbeing} %)` : "ressenti"} testID="bilan-wellbeing" />
                <Stat value={`${last.epworth}/24`} label={sv.length > 1 ? `Epworth (début : ${first.epworth})` : "Epworth"} testID="bilan-epworth" />
              </View>
              <View style={styles.chart} testID="bilan-chart">
                {sv.slice(-12).map((s) => (
                  <View key={s.id} style={styles.barCol}>
                    <View style={[styles.bar, { height: Math.max(6, s.wellbeing * 0.9) }]} />
                  </View>
                ))}
              </View>
              <Txt variant="caption">Évolution du ressenti, questionnaire par questionnaire</Txt>
              <Txt variant="label" style={{ marginTop: space.md }}>Gênes signalées</Txt>
              <Txt variant="body">{issueList.length ? issueList.map(([k, n]) => `${k} (${n} fois)`).join(", ") : "Aucune"}</Txt>
            </>
          ) : (
            <>
              <Txt variant="body" style={{ marginTop: space.sm }}>Aucun questionnaire rempli sur cette période.</Txt>
              <Button testID="bilan-start-survey-button" title="Répondre au questionnaire" icon="clipboard" style={{ marginTop: space.md }} onPress={() => router.push("/questionnaire")} />
            </>
          )}
        </Card>

        <Button testID="bilan-share-button" title="Partager mon bilan" icon="share-social" onPress={share} />
        <Button testID="bilan-call-button" title={`Appeler le ${CONTACT_PHONE}`} icon="call" variant="secondary" onPress={() => Linking.openURL(CONTACT_TEL)} />
      </ScrollView>
    </View>
  );
}

function Stat({ value, label, testID }: { value: string; label: string; testID: string }) {
  const styles = useStyles();
  return (
    <View style={{ flex: 1 }}>
      <Txt style={styles.statValue} testID={testID}>{value}</Txt>
      <Txt variant="caption">{label}</Txt>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  next: { backgroundColor: c.brandTertiary, borderRadius: radius.md, padding: space.lg },
  statsRow: { flexDirection: "row", gap: space.md, marginTop: space.md },
  statValue: { fontFamily: fonts.extrabold, fontSize: 26, lineHeight: 32, color: c.brandPrimary },
  chart: { flexDirection: "row", alignItems: "flex-end", gap: space.xs, height: 100, marginTop: space.lg, marginBottom: space.xs, overflow: "hidden" },
  barCol: { flex: 1, maxWidth: 28, justifyContent: "flex-end" },
  bar: { borderRadius: 6, backgroundColor: c.brandPrimary },
}));
