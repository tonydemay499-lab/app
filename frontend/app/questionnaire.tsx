import React, { useState } from "react";
import { ScrollView, View, Pressable, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";

import { makeStyles, useTheme } from "@/src/theme";
import { Txt, BackHeader, Button, IconBadge, Ionicons, space, radius, fonts } from "@/src/ui";
import { QUESTIONS, computeScores, epworthLabel } from "@/src/questionnaire";
import { CONTACT_PHONE, CONTACT_TEL } from "@/src/content";
import { useData, Survey } from "@/src/store";

export default function Questionnaire() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { saveSurvey } = useData();
  const [step, setStep] = useState(-1); // -1 = intro
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Survey | null>(null);

  const exit = () => (router.canGoBack() ? router.back() : router.replace("/suivi"));
  const back = () => (step <= -1 || result ? exit() : setStep(step - 1));

  const choose = async (idx: number) => {
    Haptics.selectionAsync().catch(() => {});
    const q = QUESTIONS[step];
    const next = { ...answers, [q.id]: idx };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 200);
    } else {
      const saved = await saveSurvey({ ...computeScores(next), answers: next });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setResult(saved);
    }
  };

  if (result) {
    const ep = epworthLabel(result.epworth);
    return (
      <View style={styles.root} testID="questionnaire-result">
        <BackHeader title="Merci !" onBack={exit} topInset={insets.top} />
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: insets.bottom + space.xl }}>
          <Txt variant="body">Vos réponses sont enregistrées sur votre téléphone. Elles serviront à votre bilan tous les 3 mois.</Txt>
          <View style={styles.scoreCard}>
            <Txt variant="label" style={{ color: colors.muted }}>Mon ressenti</Txt>
            <Txt style={styles.score} testID="result-wellbeing">{result.wellbeing} %</Txt>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${result.wellbeing}%` }]} />
            </View>
          </View>
          <View style={styles.scoreCard}>
            <Txt variant="label" style={{ color: colors.muted }}>Score de somnolence (Epworth)</Txt>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, marginTop: space.sm }}>
              <IconBadge name={ep.tone === "brand" ? "checkmark-circle" : "alert-circle"} size={48} tone={ep.tone} />
              <View style={{ flex: 1 }}>
                <Txt style={styles.scoreSm} testID="result-epworth">{result.epworth} / 24</Txt>
                <Txt variant="label">{ep.label}</Txt>
              </View>
            </View>
            {ep.tone !== "brand" ? (
              <Txt variant="body" style={{ marginTop: space.md }}>
                Parlez-en à votre médecin ou à votre technicien lors de votre prochain rendez-vous.
              </Txt>
            ) : null}
          </View>
          {result.issue ? (
            <View style={styles.issue}>
              <Ionicons name="bulb" size={26} color={colors.brandPrimary} />
              <View style={{ flex: 1, gap: space.sm }}>
                <Txt variant="body">Gêne signalée : {result.issue}. Consultez nos solutions simples.</Txt>
                <Button testID="result-problems-guide-button" title="Voir les solutions" variant="ghost" onPress={() => router.replace("/guide/problemes")} />
              </View>
            </View>
          ) : null}
          <Button testID="result-bilan-button" title="Voir mon bilan des 3 mois" icon="document-text" onPress={() => router.replace("/bilan")} />
          <Button testID="result-call-button" title={`Appeler le ${CONTACT_PHONE}`} icon="call" variant="secondary" onPress={() => Linking.openURL(CONTACT_TEL)} />
        </ScrollView>
      </View>
    );
  }

  if (step === -1) {
    return (
      <View style={styles.root} testID="questionnaire-intro">
        <BackHeader title="Questionnaire de la semaine" onBack={exit} topInset={insets.top} />
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: insets.bottom + space.xl }}>
          <IconBadge name="clipboard" size={80} />
          <Txt variant="h2">Comment vous sentez-vous avec votre traitement ?</Txt>
          <Txt variant="body">
            {QUESTIONS.length} questions, environ 2 minutes. Une réponse en un seul appui. Vos réponses restent sur votre téléphone et
            préparent votre bilan tous les 3 mois avec Médical o2.
          </Txt>
          <Button testID="questionnaire-start-button" title="Commencer" icon="play" onPress={() => setStep(0)} />
        </ScrollView>
      </View>
    );
  }

  const q = QUESTIONS[step];
  const firstEpworth = QUESTIONS.findIndex((x) => x.section === "epworth");
  return (
    <View style={styles.root} testID="questionnaire-screen">
      <BackHeader title={q.section === "epworth" ? "Somnolence dans la journée" : "Mon ressenti"} onBack={back} topInset={insets.top} />
      <View style={styles.progressWrap}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${((step + 1) / QUESTIONS.length) * 100}%` }]} />
        </View>
        <Txt variant="caption" testID="questionnaire-progress">Question {step + 1} sur {QUESTIONS.length}</Txt>
      </View>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: insets.bottom + space.xl }}>
        <Animated.View key={q.id} entering={FadeIn.duration(250)} style={{ gap: space.md }}>
          {q.section === "epworth" ? (
            <Txt variant="body" style={{ color: colors.muted }}>
              {step === firstEpworth ? "Dernière partie. " : ""}Quel est le risque de vous assoupir dans cette situation ?
            </Txt>
          ) : null}
          <Txt variant="h2" testID="questionnaire-question">{q.text}</Txt>
          {q.options.map((o, i) => {
            const selected = answers[q.id] === i;
            return (
              <Pressable
                key={o.label}
                testID={`questionnaire-option-${i}`}
                onPress={() => choose(i)}
                style={({ pressed }) => [styles.option, selected && styles.optionOn, pressed && { opacity: 0.85 }]}
              >
                <Txt variant="label" style={{ flex: 1, color: selected ? colors.onBrandPrimary : colors.onSurface }}>{o.label}</Txt>
                <Ionicons name={selected ? "radio-button-on" : "radio-button-off"} size={28} color={selected ? colors.onBrandPrimary : colors.brandPrimary} />
              </Pressable>
            );
          })}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  progressWrap: { paddingHorizontal: space.lg, paddingTop: space.md, gap: space.xs },
  track: { height: 10, borderRadius: 5, backgroundColor: c.surfaceTertiary, overflow: "hidden" },
  fill: { height: 10, borderRadius: 5, backgroundColor: c.brandPrimary },
  option: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: c.borderStrong,
    backgroundColor: c.surfaceSecondary,
  },
  optionOn: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary },
  scoreCard: { backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: c.border, padding: space.lg + 4 },
  score: { fontFamily: fonts.extrabold, fontSize: 40, lineHeight: 48, color: c.brandPrimary, marginVertical: space.sm },
  scoreSm: { fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 34, color: c.onSurface },
  issue: { flexDirection: "row", gap: space.md, backgroundColor: c.brandTertiary, borderRadius: radius.lg, padding: space.lg },
}));
