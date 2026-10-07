import React, { useEffect, useState } from "react";
import { ScrollView, View, Pressable, Modal, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import Animated, { FadeInDown } from "react-native-reanimated";

import { makeStyles, useTheme } from "@/src/theme";
import { usesNativeTabs } from "@/src/navigation";
import { Txt, Card, Button, IconBadge, Ionicons, space, radius, fonts } from "@/src/ui";
import { useData, FEELINGS, Feeling, formatHours, dateKey, parseKey } from "@/src/store";

export default function Suivi() {
  const insets = useSafeAreaInsets();
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ add?: string }>();
  const { ready, logs, deleteLog } = useData();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (params.add === "1") {
      setOpen(true);
      router.setParams({ add: undefined });
    }
  }, [params.add, router]);

  const last7 = logs.slice(0, 7);
  const avg = last7.length ? last7.reduce((s, l) => s + l.hours, 0) / last7.length : 0;
  const okNights = last7.filter((l) => l.hours >= 4).length;

  return (
    <View style={styles.root} testID="suivi-screen">
      <View style={[styles.header, { paddingTop: insets.top + space.md }]}>
        <Txt variant="title">Mon suivi</Txt>
        <Txt variant="caption">Heures d'utilisation et ressenti</Txt>
      </View>

      {!ready ? (
        <ActivityIndicator size="large" color={colors.brandPrimary} style={{ marginTop: space.xxxl }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: bottomChrome + 110 }}>
          {logs.length === 0 ? (
            <Card testID="suivi-empty" style={{ alignItems: "center", paddingVertical: space.xxl }}>
              <IconBadge name="calendar" size={80} />
              <Txt variant="h3" style={{ marginTop: space.lg, textAlign: "center" }}>
                Vous n'avez pas encore entré de suivi.
              </Txt>
              <Txt variant="body" style={{ textAlign: "center", marginTop: space.sm, color: colors.muted }}>
                Chaque matin, notez vos heures. Cela vous aide, ainsi que votre médecin.
              </Txt>
            </Card>
          ) : (
            <>
              <Card testID="suivi-summary">
                <Txt variant="label" style={{ color: colors.muted }}>Mes 7 dernières nuits</Txt>
                <View style={styles.summaryRow}>
                  <View style={{ flex: 1 }}>
                    <Txt style={styles.big} testID="suivi-average">{formatHours(Math.round(avg * 2) / 2)}</Txt>
                    <Txt variant="caption">en moyenne</Txt>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt style={styles.big} testID="suivi-ok-nights">{okNights}/{last7.length}</Txt>
                    <Txt variant="caption">nuits de 4 h ou plus</Txt>
                  </View>
                </View>
              </Card>
              <Txt variant="h3" style={{ marginTop: space.sm }}>Historique</Txt>
              {logs.map((l, i) => (
                <Animated.View key={l.id} entering={FadeInDown.delay(Math.min(i, 8) * 50)}>
                  <View style={styles.logRow} testID={`log-row-${l.date}`}>
                    <View style={{ flex: 1 }}>
                      <Txt variant="label" style={{ textTransform: "capitalize" }}>
                        {format(parseKey(l.date), "EEEE d MMMM", { locale: fr })}
                      </Txt>
                      <View style={styles.logMeta}>
                        <Txt style={[styles.hours, { color: l.hours >= 4 ? colors.brandPrimary : colors.warning }]}>{formatHours(l.hours)}</Txt>
                        <Ionicons name={FEELINGS[l.feeling].icon} size={22} color={colors.muted} />
                        <Txt variant="caption">{FEELINGS[l.feeling].label}</Txt>
                      </View>
                    </View>
                    <Pressable
                      testID={`log-delete-${l.date}`}
                      accessibilityLabel="Supprimer"
                      onPress={() => deleteLog(l.id)}
                      style={({ pressed }) => [styles.delBtn, pressed && { backgroundColor: colors.errorTint }]}
                    >
                      <Ionicons name="trash-outline" size={24} color={colors.error} />
                    </Pressable>
                  </View>
                </Animated.View>
              ))}
            </>
          )}
        </ScrollView>
      )}

      <View style={[styles.cta, { bottom: bottomChrome + space.lg }]}>
        <Button testID="suivi-add-night-button" title="Ajouter ma nuit" icon="add-circle" onPress={() => setOpen(true)} />
      </View>

      <AddNightSheet visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}

function AddNightSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { saveLog } = useData();
  const [dayOffset, setDayOffset] = useState(0);
  const [hours, setHours] = useState(7);
  const [feeling, setFeeling] = useState<Feeling>("bien");

  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
  const days = [0, 1, 2].map((o) => ({ o, label: o === 0 ? "Cette nuit" : o === 1 ? "Hier" : format(subDays(new Date(), o), "EEEE d", { locale: fr }) })).map((d) => ({ ...d, label: cap(d.label) }));

  const save = async () => {
    await saveLog({ date: dateKey(subDays(new Date(), dayOffset)), hours, feeling });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setDayOffset(0);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} testID="add-night-backdrop" />
      <View style={styles.sheet} testID="add-night-sheet">
        <ScrollView contentContainerStyle={{ padding: space.xl, paddingTop: space.md, paddingBottom: insets.bottom + space.lg }}>
        <View style={styles.grabber} />
        <Txt variant="h2">Ajouter ma nuit</Txt>

        <Txt variant="label" style={styles.fieldLabel}>Quelle nuit ?</Txt>
        <View style={styles.choiceRow}>
          {days.map((d) => (
            <Pressable
              key={d.o}
              testID={`add-night-day-${d.o}`}
              onPress={() => setDayOffset(d.o)}
              style={[styles.choice, dayOffset === d.o && styles.choiceOn]}
            >
              <Txt variant="label" style={{ color: dayOffset === d.o ? colors.onBrandPrimary : colors.onSurface }}>{d.label}</Txt>
            </Pressable>
          ))}
        </View>

        <Txt variant="label" style={styles.fieldLabel}>Heures d'utilisation</Txt>
        <View style={styles.stepper}>
          <Pressable testID="add-night-hours-minus" onPress={() => setHours((h) => Math.max(0, h - 0.5))} style={styles.stepBtn}>
            <Ionicons name="remove" size={32} color={colors.onBrandTertiary} />
          </Pressable>
          <Txt style={styles.stepValue} testID="add-night-hours-value">{formatHours(hours)}</Txt>
          <Pressable testID="add-night-hours-plus" onPress={() => setHours((h) => Math.min(14, h + 0.5))} style={styles.stepBtn}>
            <Ionicons name="add" size={32} color={colors.onBrandTertiary} />
          </Pressable>
        </View>

        <Txt variant="label" style={styles.fieldLabel}>Comment vous sentez-vous ?</Txt>
        <View style={styles.choiceRow}>
          {(Object.keys(FEELINGS) as Feeling[]).map((f) => (
            <Pressable key={f} testID={`add-night-feeling-${f}`} onPress={() => setFeeling(f)} style={[styles.feel, feeling === f && styles.choiceOn]}>
              <Ionicons name={FEELINGS[f].icon} size={30} color={feeling === f ? colors.onBrandPrimary : colors.brandPrimary} />
              <Txt variant="label" style={{ color: feeling === f ? colors.onBrandPrimary : colors.onSurface }}>{FEELINGS[f].label}</Txt>
            </Pressable>
          ))}
        </View>

        <Button testID="add-night-save-button" title="Enregistrer" icon="checkmark-circle" style={{ marginTop: space.xl }} onPress={save} />
        <Button testID="add-night-cancel-button" title="Annuler" variant="ghost" style={{ marginTop: space.sm }} onPress={onClose} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  header: { paddingHorizontal: space.lg, paddingBottom: space.md, borderBottomWidth: 1, borderBottomColor: c.divider, backgroundColor: c.surface },
  summaryRow: { flexDirection: "row", marginTop: space.md, gap: space.lg },
  big: { fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 40, color: c.brandPrimary },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 84,
    backgroundColor: c.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    gap: space.md,
  },
  logMeta: { flexDirection: "row", alignItems: "center", gap: space.sm, marginTop: space.xs },
  hours: { fontFamily: fonts.bold, fontSize: 20, marginRight: space.sm },
  delBtn: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  cta: { position: "absolute", left: space.lg, right: space.lg },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { maxHeight: "92%", backgroundColor: c.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  grabber: { alignSelf: "center", width: 48, height: 5, borderRadius: 3, backgroundColor: c.borderStrong, marginBottom: space.lg },
  fieldLabel: { marginTop: space.xl, marginBottom: space.md, color: c.muted },
  choiceRow: { flexDirection: "row", gap: space.sm },
  choice: { flex: 1, minHeight: 56, borderRadius: radius.md, borderWidth: 1.5, borderColor: c.borderStrong, alignItems: "center", justifyContent: "center", paddingHorizontal: space.xs },
  choiceOn: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary },
  feel: { flex: 1, minHeight: 84, borderRadius: radius.md, borderWidth: 1.5, borderColor: c.borderStrong, alignItems: "center", justifyContent: "center", gap: space.xs },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: c.surfaceTertiary, borderRadius: radius.lg, padding: space.sm },
  stepBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: c.brandTertiary, alignItems: "center", justifyContent: "center" },
  stepValue: { fontFamily: fonts.extrabold, fontSize: 34, color: c.onSurface },
}));
