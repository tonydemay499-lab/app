import React from "react";
import { ScrollView, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { makeStyles, useTheme } from "@/src/theme";
import { Txt, BackHeader, IconBadge, Ionicons, space, radius } from "@/src/ui";
import { useData } from "@/src/store";

const freqLabel = (d: number) => (d === 1 ? "Chaque jour" : d === 7 ? "Chaque semaine" : "Chaque mois");

export default function Entretien() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { tasks, markDone } = useData();
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));

  return (
    <View style={styles.root} testID="entretien-screen">
      <BackHeader title="Rappels d'entretien" onBack={back} topInset={insets.top} />
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: insets.bottom + space.xl }}>
        <Txt variant="body" style={{ color: colors.muted }}>
          Appuyez sur « Fait » quand la tâche est terminée. Le rappel reviendra au bon moment.
        </Txt>
        {tasks.map((t) => (
          <View key={t.id} style={[styles.task, t.due && styles.taskDue]} testID={`task-${t.id}`}>
            <Pressable style={styles.taskMain} onPress={() => router.push(`/guide/${t.guideId}`)} testID={`task-guide-${t.id}`}>
              <IconBadge name={t.icon} size={48} tone={t.due ? "warning" : "brand"} />
              <View style={{ flex: 1 }}>
                <Txt variant="label">{t.title}</Txt>
                <Txt variant="caption">{freqLabel(t.freqDays)}</Txt>
                <Txt variant="caption" testID={`task-status-${t.id}`} style={{ color: t.due ? colors.warning : colors.brandPrimary, fontWeight: "600" }}>
                  {t.due ? "À faire" : `Dans ${t.dueIn} jour${t.dueIn > 1 ? "s" : ""}`}
                </Txt>
              </View>
            </Pressable>
            {t.due ? (
              <Pressable
                testID={`task-done-${t.id}`}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                  markDone(t.id);
                }}
                style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.8 }]}
              >
                <Ionicons name="checkmark" size={24} color={colors.onBrandPrimary} />
                <Txt variant="label" style={{ color: colors.onBrandPrimary }}>Fait</Txt>
              </Pressable>
            ) : (
              <Ionicons name="checkmark-done-circle" size={36} color={colors.brandPrimary} />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  task: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: c.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    padding: space.md,
    paddingLeft: space.lg,
    minHeight: 92,
  },
  taskDue: { borderColor: c.warning, borderWidth: 1.5 },
  taskMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: space.md },
  doneBtn: { flexDirection: "row", alignItems: "center", gap: space.xs, backgroundColor: c.brandPrimary, minHeight: 56, paddingHorizontal: space.lg, borderRadius: radius.md },
}));
