import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useTheme } from "@/src/theme";
import { Card, Txt, Button, IconBadge, space } from "@/src/ui";
import { useData, parseKey } from "@/src/store";
import { epworthLabel } from "@/src/questionnaire";

export function SurveyCard({ testID = "survey-card" }: { testID?: string }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { surveys, surveyDueIn } = useData();
  const last = surveys[0];
  const due = surveyDueIn <= 0;

  return (
    <Card testID={testID}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, marginBottom: space.md }}>
        <IconBadge name="clipboard" size={48} tone={due ? "warning" : "brand"} />
        <View style={{ flex: 1 }}>
          <Txt variant="h3">Mon ressenti</Txt>
          <Txt variant="caption" testID={`${testID}-status`}>
            {due ? "Questionnaire de la semaine à remplir" : `Prochain questionnaire dans ${surveyDueIn} jour${surveyDueIn > 1 ? "s" : ""}`}
          </Txt>
        </View>
      </View>
      {last ? (
        <Txt variant="body" style={{ color: colors.onSurfaceSecondary, marginBottom: space.md }}>
          Dernier ({format(parseKey(last.date), "d MMMM", { locale: fr })}) : ressenti {last.wellbeing} %, somnolence {last.epworth}/24 –{" "}
          {epworthLabel(last.epworth).label.toLowerCase()}
        </Txt>
      ) : (
        <Txt variant="body" style={{ color: colors.onSurfaceSecondary, marginBottom: space.md }}>
          Chaque semaine, 2 minutes pour dire comment vous vous sentez depuis le début du traitement.
        </Txt>
      )}
      {due ? (
        <Button testID={`${testID}-start-button`} title="Répondre au questionnaire" icon="clipboard" onPress={() => router.push("/questionnaire")} />
      ) : null}
      <Button testID={`${testID}-bilan-button`} title="Mon bilan" icon="document-text" variant="ghost" style={{ marginTop: due ? space.sm : 0 }} onPress={() => router.push("/bilan")} />
    </Card>
  );
}
