import React from "react";
import { ScrollView, View, ActivityIndicator, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Animated, { FadeInDown } from "react-native-reanimated";

import { makeStyles, useTheme } from "@/src/theme";
import { usesNativeTabs } from "@/src/navigation";
import { Txt, Card, Button, ListRow, IconBadge, Ionicons, space, radius, fonts } from "@/src/ui";
import { HERO_IMAGE, CONTACT_PHONE, CONTACT_TEL } from "@/src/content";
import { useData, FEELINGS, formatHours, dateKey } from "@/src/store";

export default function Home() {
  const insets = useSafeAreaInsets();
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { ready, logs, tasks, markDone } = useData();

  const last = logs[0];
  const week = logs.filter((l) => (Date.now() - new Date(l.date).getTime()) / 86400000 <= 7);
  const avg = week.length ? week.reduce((s, l) => s + l.hours, 0) / week.length : 0;
  const dueTasks = tasks.filter((t) => t.due);
  const nextTask = tasks[0];
  const loggedToday = logs.some((l) => l.date === dateKey());

  if (!ready) {
    return (
      <View style={[styles.root, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.brandPrimary} />
        <Txt variant="caption" style={{ marginTop: space.md }}>Chargement des données...</Txt>
      </View>
    );
  }

  return (
    <View style={styles.root} testID="home-screen">
      <View style={[styles.header, { paddingTop: insets.top + space.md }]}>
        <View style={styles.logo}>
          <Ionicons name="leaf" size={22} color={colors.onBrandPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt style={styles.brandName}>Médical o2</Txt>
          <Txt variant="caption" style={{ textTransform: "capitalize" }}>
            {format(new Date(), "EEEE d MMMM", { locale: fr })}
          </Txt>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: bottomChrome + space.xl }}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.hero}>
          <Image source={HERO_IMAGE} style={{ position: "absolute", width: "100%", height: "100%" }} contentFit="cover" transition={300} />
          <LinearGradient colors={["transparent", "rgba(44,54,49,0.85)"]} locations={[0.15, 0.85]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
          <View style={{ padding: space.xl }}>
            <Txt variant="h2" style={{ color: colors.onSurfaceInverse }}>Bonjour,</Txt>
            <Txt variant="body" style={{ color: colors.onSurfaceInverse }}>
              Nous vous accompagnons chaque jour avec votre PPC ou ventilation.
            </Txt>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <Card testID="home-contact-card">
            <View style={styles.cardHead}>
              <IconBadge name="call" size={48} />
              <View style={{ flex: 1 }}>
                <Txt variant="h3">Contacter Médical o2</Txt>
                <Txt variant="caption">Une question, un souci avec votre matériel ?</Txt>
              </View>
            </View>
            <Button testID="home-call-button" title={`Appeler le ${CONTACT_PHONE}`} icon="call" onPress={() => Linking.openURL(CONTACT_TEL)} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Card testID="home-night-card">
            <View style={styles.cardHead}>
              <IconBadge name="moon" size={48} />
              <Txt variant="h3" style={{ flex: 1 }}>Ma dernière nuit</Txt>
            </View>
            {last ? (
              <>
                <View style={styles.statRow}>
                  <Txt testID="home-last-hours" style={styles.bigStat}>{formatHours(last.hours)}</Txt>
                  <View style={styles.feelPill}>
                    <Ionicons name={FEELINGS[last.feeling].icon} size={22} color={colors.onBrandTertiary} />
                    <Txt variant="label" style={{ color: colors.onBrandTertiary }}>{FEELINGS[last.feeling].label}</Txt>
                  </View>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.min(100, (last.hours / 8) * 100)}%`, backgroundColor: last.hours >= 4 ? colors.brandPrimary : colors.warning }]} />
                </View>
                <Txt variant="caption" style={{ marginTop: space.sm }}>
                  {last.hours >= 4 ? "Objectif atteint (4 h minimum). Bravo !" : "Objectif : au moins 4 h par nuit."}
                  {week.length > 1 ? `  Moyenne 7 jours : ${formatHours(Math.round(avg * 2) / 2)}` : ""}
                </Txt>
                {!loggedToday ? (
                  <Button testID="home-add-night-button" title="Ajouter ma nuit" icon="add-circle" variant="secondary" style={{ marginTop: space.lg }} onPress={() => router.push("/suivi?add=1")} />
                ) : null}
              </>
            ) : (
              <>
                <Txt variant="body" style={{ marginBottom: space.lg }}>
                  Notez chaque matin combien d'heures vous avez utilisé votre appareil.
                </Txt>
                <Button testID="home-start-tracking-button" title="Commencer mon suivi" icon="add-circle" onPress={() => router.push("/suivi?add=1")} />
              </>
            )}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Card testID="home-maintenance-card">
            <View style={styles.cardHead}>
              <IconBadge name="sparkles" size={48} tone={dueTasks.length ? "warning" : "brand"} />
              <View style={{ flex: 1 }}>
                <Txt variant="h3">Rappels d'entretien</Txt>
                <Txt variant="caption" testID="home-due-count">
                  {dueTasks.length ? `${dueTasks.length} tâche${dueTasks.length > 1 ? "s" : ""} à faire` : "Tout est à jour"}
                </Txt>
              </View>
            </View>
            {nextTask ? (
              <View style={styles.taskBox}>
                <Txt variant="label">{nextTask.title}</Txt>
                <Txt variant="caption">
                  {nextTask.due ? "À faire aujourd'hui" : `Prochaine fois dans ${nextTask.dueIn} jour${nextTask.dueIn > 1 ? "s" : ""}`}
                </Txt>
                {nextTask.due ? (
                  <Button
                    testID="home-task-done-button"
                    title="C'est fait"
                    icon="checkmark-circle"
                    style={{ marginTop: space.md }}
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                      markDone(nextTask.id);
                    }}
                  />
                ) : null}
              </View>
            ) : null}
            <Button testID="home-see-maintenance-button" title="Voir tous les rappels" variant="ghost" style={{ marginTop: space.md }} onPress={() => router.push("/entretien")} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ gap: space.md }}>
          <Txt variant="h3" style={{ marginTop: space.sm }}>Besoin d'aide ?</Txt>
          <ListRow testID="home-assistant-link" icon="chatbubbles" title="Poser une question" subtitle="À l'assistant Médical o2" onPress={() => router.push("/chat")} />
          <ListRow testID="home-faq-link" icon="help-circle" title="Questions fréquentes" subtitle="Les réponses aux questions courantes" onPress={() => router.push("/faq")} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    backgroundColor: c.surface,
    borderBottomWidth: 1,
    borderBottomColor: c.divider,
  },
  logo: { width: 44, height: 44, borderRadius: 14, backgroundColor: c.brandPrimary, alignItems: "center", justifyContent: "center" },
  brandName: { fontFamily: fonts.extrabold, fontSize: 22, color: c.brandPrimary },
  hero: { height: 210, borderRadius: radius.lg, overflow: "hidden", justifyContent: "flex-end", backgroundColor: c.surfaceInverse },
  cardHead: { flexDirection: "row", alignItems: "center", gap: space.md, marginBottom: space.lg },
  statRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space.md },
  bigStat: { fontFamily: fonts.extrabold, fontSize: 40, lineHeight: 48, color: c.onSurface },
  feelPill: { flexDirection: "row", alignItems: "center", gap: space.xs, backgroundColor: c.brandTertiary, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill },
  track: { height: 12, borderRadius: 6, backgroundColor: c.surfaceTertiary, overflow: "hidden" },
  fill: { height: 12, borderRadius: 6 },
  taskBox: { backgroundColor: c.surfaceTertiary, borderRadius: radius.md, padding: space.lg },
}));
