import React, { useEffect, useState } from "react";
import { View, Linking, AppState, Switch, Pressable } from "react-native";
import { useTheme } from "@/src/theme";
import { Card, Txt, Button, IconBadge, Ionicons, space, radius, fonts } from "@/src/ui";
import { useData } from "@/src/store";
import { getPermissionState, requestPermission, notificationsSupported, PermissionState, formatTime } from "@/src/notifications";

export function ReminderCard() {
  const { colors } = useTheme();
  const { notifEnabled, setNotifEnabled, settings, updateSettings } = useData();
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
          <Txt variant="h3">Mes rappels</Txt>
          <Txt variant="caption" testID="reminder-status">
            {active ? `Activés, à ${formatTime(settings.time)}` : "Une notification pour l'entretien et le questionnaire, à l'heure de votre choix"}
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
        <>
          <Txt variant="label" style={{ marginTop: space.lg, marginBottom: space.sm }}>Heure des rappels</Txt>
          <View style={rowStyle(colors.surfaceTertiary)}>
            <Pressable testID="reminder-time-minus" accessibilityLabel="Plus tôt" onPress={() => updateSettings({ time: Math.max(6 * 60, settings.time - 30) })} style={stepStyle(colors.brandTertiary)}>
              <Ionicons name="remove" size={28} color={colors.onBrandTertiary} />
            </Pressable>
            <Txt testID="reminder-time-value" style={{ fontFamily: fonts.extrabold, fontSize: 28, color: colors.onSurface }}>{formatTime(settings.time)}</Txt>
            <Pressable testID="reminder-time-plus" accessibilityLabel="Plus tard" onPress={() => updateSettings({ time: Math.min(22 * 60, settings.time + 30) })} style={stepStyle(colors.brandTertiary)}>
              <Ionicons name="add" size={28} color={colors.onBrandTertiary} />
            </Pressable>
          </View>
          <Txt variant="label" style={{ marginTop: space.lg, marginBottom: space.xs }}>Je veux être prévenu pour</Txt>
          {([
            ["entretien", "L'entretien du matériel", "Les jours où une tâche est à faire"],
            ["questionnaire", "Le questionnaire de la semaine", "Une fois par semaine"],
          ] as const).map(([key, label, sub]) => (
            <View key={key} style={{ flexDirection: "row", alignItems: "center", gap: space.md, minHeight: 64 }}>
              <View style={{ flex: 1 }}>
                <Txt variant="body">{label}</Txt>
                <Txt variant="caption">{sub}</Txt>
              </View>
              <Switch
                testID={`reminder-switch-${key}`}
                value={settings[key]}
                onValueChange={(v) => updateSettings({ [key]: v })}
                trackColor={{ true: colors.brandPrimary, false: colors.borderStrong }}
                thumbColor={colors.surfaceSecondary}
              />
            </View>
          ))}
          <Button testID="reminder-disable-button" title="Désactiver les rappels" variant="ghost" style={{ marginTop: space.md }} onPress={() => setNotifEnabled(false)} />
        </>
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

const rowStyle = (bg: string) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "space-between" as const,
  backgroundColor: bg,
  borderRadius: radius.lg,
  padding: space.sm,
});
const stepStyle = (bg: string) => ({ width: 56, height: 56, borderRadius: 28, backgroundColor: bg, alignItems: "center" as const, justifyContent: "center" as const });
