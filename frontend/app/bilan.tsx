import React, { useMemo, useState } from "react";
import { ScrollView, View, Share, Linking, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { format, addMonths, addDays, differenceInCalendarDays } from "date-fns";
import { fr } from "date-fns/locale";

import { makeStyles, useTheme } from "@/src/theme";
import { Txt, BackHeader, Button, Card, Ionicons, space, radius, fonts } from "@/src/ui";
import { epworthLabel } from "@/src/questionnaire";
import { CONTACT_PHONE, CONTACT_TEL } from "@/src/content";
import { useData, formatHours, dateKey, parseKey } from "@/src/store";

const fmt = (k: string) => format(parseKey(k), "d MMMM yyyy", { locale: fr });

export default function Bilan() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { logs, surveys, settings, updateSettings } = useData();
  const [editOpen, setEditOpen] = useState(false);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/suivi"));

  const today = dateKey();
  const earliest = [...logs.map((l) => l.date), ...surveys.map((s) => s.date)].sort()[0] ?? today;
  const startKey = settings.treatmentStart ?? earliest;

  // Bilan schedule: first at 3 months after treatment start, then every 6 months.
  const periods = useMemo(() => {
    const start = parseKey(startKey);
    const list: { from: string; to: string; label: string }[] = [];
    let a = start;
    let b = addMonths(start, 3);
    let i = 0;
    while (dateKey(a) <= today && i < 40) {
      list.push({ from: dateKey(a), to: dateKey(b), label: i === 0 ? "3 premiers mois" : `Mois ${3 + (i - 1) * 6} à ${3 + i * 6}` });
      a = b;
      b = addMonths(b, 6);
      i++;
    }
    return list;
  }, [startKey, today]);

  const defaultIdx = (() => {
    const cur = periods.length - 1;
    if (cur > 0 && differenceInCalendarDays(new Date(), parseKey(periods[cur].from)) < 30) return cur - 1;
    return cur;
  })();
  const [picked, setPicked] = useState<number | null>(null);
  const idx = Math.min(picked ?? defaultIdx, periods.length - 1);
  const period = periods[idx];
  const from = period.from;
  const toExcl = period.to;
  const ended = toExcl <= today;
  const nextBilan = periods[periods.length - 1].to;

  const nights = logs.filter((l) => l.date >= from && l.date < toExcl);
  const sv = surveys.filter((s) => s.date >= from && s.date < toExcl).slice().reverse(); // oldest first
  const avgHours = nights.length ? nights.reduce((a, l) => a + l.hours, 0) / nights.length : 0;
  const okPct = nights.length ? Math.round((nights.filter((l) => l.hours >= 4).length / nights.length) * 100) : 0;
  const first = sv[0];
  const last = sv[sv.length - 1];
  const issues = sv.reduce<Record<string, number>>((acc, s) => (s.issue ? { ...acc, [s.issue]: (acc[s.issue] ?? 0) + 1 } : acc), {});
  const issueList = Object.entries(issues).sort((a, b) => b[1] - a[1]);


  const share = () => {
    const lines = [
      "Bilan patient – Médical o2 Provence",
      `Début du traitement : ${fmt(startKey)}`,
      `Période : ${period.label}, du ${fmt(from)} au ${fmt(ended ? dateKey(addDays(parseKey(toExcl), -1)) : today)}`,
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
      <BackHeader title="Mon bilan" onBack={back} topInset={insets.top} />
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: insets.bottom + space.xl }}>
        <Card testID="bilan-start-card">
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
            <View style={{ flex: 1 }}>
              <Txt variant="caption">Début du traitement</Txt>
              <Txt variant="h3" testID="bilan-start-date">{fmt(startKey)}</Txt>
            </View>
            <Pressable testID="bilan-edit-start-button" onPress={() => setEditOpen(true)} style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.8 }]}>
              <Ionicons name="create" size={22} color={colors.onBrandTertiary} />
              <Txt variant="label" style={{ color: colors.onBrandTertiary }}>Modifier</Txt>
            </Pressable>
          </View>
          {!settings.treatmentStart ? (
            <Txt variant="caption" style={{ marginTop: space.sm }}>Date estimée d'après vos premières saisies. Indiquez la vraie date.</Txt>
          ) : null}
        </Card>

        <View style={styles.next} testID="bilan-next-date">
          <Txt variant="label" style={{ color: colors.onBrandTertiary }}>
            Prochain bilan : {fmt(nextBilan)} ({periods.length === 1 ? "bilan des 3 premiers mois" : "bilan des 6 mois"})
          </Txt>
          <Txt variant="caption" style={{ color: colors.onBrandTertiary }}>Un premier bilan à 3 mois, puis un bilan tous les 6 mois.</Txt>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }} style={{ flexGrow: 0 }}>
          {periods.map((p, i) => (
            <Pressable key={p.from} testID={`bilan-period-${i}`} onPress={() => setPicked(i)} style={[styles.chip, i === idx && styles.chipOn]}>
              <Txt variant="label" style={{ color: i === idx ? colors.onBrandPrimary : colors.onSurface }}>
                {p.label}{p.to > today ? " (en cours)" : ""}
              </Txt>
            </Pressable>
          ))}
        </ScrollView>
        <Txt variant="body" style={{ color: colors.muted }} testID="bilan-period-range">
          Du {fmt(from)} {ended ? `au ${fmt(dateKey(addDays(parseKey(toExcl), -1)))}` : "jusqu'à aujourd'hui"}. À montrer ou envoyer à votre technicien Médical o2.
        </Txt>

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
      <StartDateSheet
        visible={editOpen}
        initial={startKey}
        onClose={() => setEditOpen(false)}
        onSave={(k) => {
          updateSettings({ treatmentStart: k });
          setPicked(null);
          setEditOpen(false);
        }}
      />
    </View>
  );
}

function StartDateSheet({ visible, initial, onClose, onSave }: { visible: boolean; initial: string; onClose: () => void; onSave: (k: string) => void }) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const [date, setDate] = useState(parseKey(initial));
  React.useEffect(() => {
    if (visible) setDate(parseKey(initial));
  }, [visible, initial]);
  const clamp = (d: Date) => (d > new Date() ? new Date() : d);
  const rows: { key: string; label: string; value: string; minus: () => void; plus: () => void }[] = [
    { key: "day", label: "Jour", value: format(date, "d"), minus: () => setDate(clamp(addDays(date, -1))), plus: () => setDate(clamp(addDays(date, 1))) },
    { key: "month", label: "Mois", value: format(date, "MMMM", { locale: fr }), minus: () => setDate(clamp(addMonths(date, -1))), plus: () => setDate(clamp(addMonths(date, 1))) },
    { key: "year", label: "Année", value: format(date, "yyyy"), minus: () => setDate(clamp(addMonths(date, -12))), plus: () => setDate(clamp(addMonths(date, 12))) },
  ];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} testID="start-date-backdrop" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]} testID="start-date-sheet">
        <Txt variant="h2">Début du traitement</Txt>
        <Txt variant="body" style={{ color: colors.muted, marginBottom: space.md }}>Date de la première nuit avec votre appareil.</Txt>
        {rows.map((r) => (
          <View key={r.key} style={styles.dateRow}>
            <Txt variant="label" style={{ width: 70, color: colors.muted }}>{r.label}</Txt>
            <Pressable testID={`start-date-${r.key}-minus`} onPress={r.minus} style={styles.stepBtn}>
              <Ionicons name="remove" size={26} color={colors.onBrandTertiary} />
            </Pressable>
            <Txt style={styles.dateValue} testID={`start-date-${r.key}-value`}>{r.value}</Txt>
            <Pressable testID={`start-date-${r.key}-plus`} onPress={r.plus} style={styles.stepBtn}>
              <Ionicons name="add" size={26} color={colors.onBrandTertiary} />
            </Pressable>
          </View>
        ))}
        <Button testID="start-date-save-button" title="Enregistrer" icon="checkmark-circle" style={{ marginTop: space.lg }} onPress={() => onSave(dateKey(date))} />
        <Button testID="start-date-cancel-button" title="Annuler" variant="ghost" style={{ marginTop: space.sm }} onPress={onClose} />
      </View>
    </Modal>
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
  next: { backgroundColor: c.brandTertiary, borderRadius: radius.md, padding: space.lg, gap: space.xs },
  editBtn: { flexDirection: "row", alignItems: "center", gap: space.xs, minHeight: 48, paddingHorizontal: space.md, borderRadius: radius.md, backgroundColor: c.brandTertiary },
  chip: { flexShrink: 0, height: 44, paddingHorizontal: space.lg, borderRadius: radius.pill, borderWidth: 1.5, borderColor: c.borderStrong, justifyContent: "center", backgroundColor: c.surfaceSecondary },
  chipOn: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { backgroundColor: c.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: space.xl },
  dateRow: { flexDirection: "row", alignItems: "center", gap: space.sm, minHeight: 68 },
  stepBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: c.brandTertiary, alignItems: "center", justifyContent: "center" },
  dateValue: { flex: 1, textAlign: "center", fontFamily: fonts.bold, fontSize: 22, color: c.onSurface, textTransform: "capitalize" },
  statsRow: { flexDirection: "row", gap: space.md, marginTop: space.md },
  statValue: { fontFamily: fonts.extrabold, fontSize: 26, lineHeight: 32, color: c.brandPrimary },
  chart: { flexDirection: "row", alignItems: "flex-end", gap: space.xs, height: 100, marginTop: space.lg, marginBottom: space.xs, overflow: "hidden" },
  barCol: { flex: 1, maxWidth: 28, justifyContent: "flex-end" },
  bar: { borderRadius: 6, backgroundColor: c.brandPrimary },
}));
