import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";
import { usesNativeTabs } from "@/src/navigation";
import { useTheme } from "@/src/theme";
import { Ionicons, fonts } from "@/src/ui";

export default function TabsLayout() {
  const { colors } = useTheme();

  if (usesNativeTabs) {
    return (
      <NativeTabs tintColor={colors.brandPrimary}>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon sf="house.fill" />
          <NativeTabs.Trigger.Label>Accueil</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="guides">
          <NativeTabs.Trigger.Icon sf="book.fill" />
          <NativeTabs.Trigger.Label>Guides</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="suivi">
          <NativeTabs.Trigger.Icon sf="chart.bar.fill" />
          <NativeTabs.Trigger.Label>Suivi</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="assistant">
          <NativeTabs.Trigger.Icon sf="bubble.left.and.bubble.right.fill" />
          <NativeTabs.Trigger.Label>Assistant</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surfaceSecondary,
          borderTopColor: colors.border,
          ...(Platform.OS === "web" ? { height: 64 } : {}),
        },
        tabBarItemStyle: { alignSelf: "center" },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 13 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Accueil", tabBarButtonTestID: "tab-accueil", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} /> }}
      />
      <Tabs.Screen
        name="guides"
        options={{ title: "Guides", tabBarButtonTestID: "tab-guides", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "book" : "book-outline"} size={26} color={color} /> }}
      />
      <Tabs.Screen
        name="suivi"
        options={{ title: "Suivi", tabBarButtonTestID: "tab-suivi", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={26} color={color} /> }}
      />
      <Tabs.Screen
        name="assistant"
        options={{ title: "Assistant", tabBarButtonTestID: "tab-assistant", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={26} color={color} /> }}
      />
    </Tabs>
  );
}
