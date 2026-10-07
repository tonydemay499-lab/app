import React, { useEffect, useState } from "react";
import { View, Linking, AppState } from "react-native";
import { useTheme } from "@/src/theme";
import { Card, Txt, Button, IconBadge, space } from "@/src/ui";
import { useData } from "@/src/store";
import { getPermissionState, requestPermission, notificationsSupported, PermissionState, REMINDER_HOUR } from "@/src/notifications";

export function ReminderCard() {
  const { colors } = useTheme();
  const { notifEnabled, setNotifEnabled } = useData();
  const [perm, setPerm] = useState<PermissionState>("undetermined");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!notificationsSupported) return;
    const refresh = () => getPermissionState().then(setPerm);
    refresh();
    const sub = AppState.addEventListener("change", (s) => s === "active" && refresh());
    return () => sub.remove();
  }, []);

  if (!notificationsSupported) {
    return (
      <Card testID="reminder-card">
        <Txt variant="label">Rappels sur le téléphone</Txt>
        <Txt variant="caption">Disponibles dans l'application installée sur votre téléphone.</Txt>
      </Card>
    );
  }

  const active = notifEnabled && perm === "granted";

  const enable = async () => {
    setBusy(true);
    const res = await requestPermission();
    setPerm(res);
    if (res === "granted") await setNotifEnabled(true);
    setBusy(false);
  };

  return (
    <Card testID="reminder-card">
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
        <IconBadge name={active ? "notifications" : "notifications-outline"} size={48} />
        <View style={{ flex: 1 }}>
          <Txt variant="h3">Rappel chaque matin</Txt>
          <Txt variant="caption" testID="reminder-status">
            {active
              ? `Activé : entretien à ${REMINDER_HOUR} h, questionnaire de la semaine à ${REMINDER_HOUR + 1} h`
              : `Recevez une notification à ${REMINDER_HOUR} h pour l'entretien et chaque semaine pour le questionnaire`}
          </Txt>
        </View>
      </View>

      {perm === "blocked" ? (
        <>
          <Txt variant="body" style={{ marginTop: space.md, color: colors.muted }}>
            Les notifications sont désactivées pour cette application. Activez-les dans les réglages du téléphone.
          </Txt>
          <Button testID="reminder-open-settings-button" title="Ouvrir les réglages" icon="settings" variant="ghost" style={{ marginTop: space.md }} onPress={() => Linking.openSettings()} />
        </>
      ) : active ? (
        <Button testID="reminder-disable-button" title="Désactiver les rappels" variant="ghost" style={{ marginTop: space.md }} onPress={() => setNotifEnabled(false)} />
      ) : (
        <>
          {perm === "denied" ? (
            <Txt variant="body" style={{ marginTop: space.md, color: colors.muted }}>
              Sans autorisation, nous ne pouvons pas vous rappeler l'entretien de votre bulle, cuve et tuyau.
            </Txt>
          ) : null}
          <Button testID="reminder-enable-button" title="Activer les rappels" icon="notifications" loading={busy} style={{ marginTop: space.md }} onPress={enable} />
        </>
      )}
    </Card>
  );
}
