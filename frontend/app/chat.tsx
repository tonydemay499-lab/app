import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, View, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { fetch as expoFetch } from "expo/fetch";
import * as Haptics from "expo-haptics";

import { makeStyles, useTheme } from "@/src/theme";
import { Txt, BackHeader, Ionicons, space, radius, fonts } from "@/src/ui";
import { SUGGESTED_QUESTIONS } from "@/src/content";
import { storage } from "@/src/utils/storage";

const API = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;
const SESSION_KEY = "mo2_chat_session";

type Msg = { id: string; role: "user" | "assistant"; content: string };

async function getSessionId() {
  const existing = await storage.getItem(SESSION_KEY, "");
  if (existing) return String(existing);
  const id = `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await storage.setItem(SESSION_KEY, id);
  return id;
}

export default function Chat() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const [session, setSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<Msg>>(null);
  const autoSent = useRef(false);

  const back = () => (router.canGoBack() ? router.back() : router.replace("/assistant"));

  const send = useCallback(
    async (text: string, sid: string) => {
      const t = text.trim();
      if (!t) return;
      setError(null);
      setInput("");
      setSending(true);
      Haptics.selectionAsync().catch(() => {});
      const botId = `b-${Date.now()}`;
      setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", content: t }, { id: botId, role: "assistant", content: "" }]);
      try {
        const res = await expoFetch(`${API}/chat/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
          body: JSON.stringify({ session_id: sid, message: t }),
        });
        if (!res.ok || !res.body) throw new Error("bad response");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const parts = buf.split("\n\n");
          buf = parts.pop() ?? "";
          for (const p of parts) {
            const line = p.trim();
            if (!line.startsWith("data:")) continue;
            const data = JSON.parse(line.slice(5).trim());
            if (data.delta) {
              setMessages((m) => m.map((x) => (x.id === botId ? { ...x, content: x.content + data.delta } : x)));
            } else if (data.error) {
              setError(data.error);
            }
          }
        }
      } catch {
        setError("Connexion impossible. Vérifiez internet puis réessayez.");
      } finally {
        setMessages((m) => m.filter((x) => !(x.id === botId && !x.content)));
        setSending(false);
      }
    },
    [],
  );

  useEffect(() => {
    (async () => {
      const sid = await getSessionId();
      setSession(sid);
      try {
        const res = await fetch(`${API}/chat/${sid}/messages`);
        const data: { id: string; role: "user" | "assistant"; content: string }[] = await res.json();
        setMessages(data.map((d) => ({ id: d.id, role: d.role, content: d.content })));
      } catch {
        // history unavailable: start empty
      }
      setLoading(false);
      if (params.q && !autoSent.current) {
        autoSent.current = true;
        send(String(params.q), sid);
      }
    })();
  }, [params.q, send]);

  const clear = async () => {
    if (!session) return;
    await fetch(`${API}/chat/${session}`, { method: "DELETE" }).catch(() => {});
    setMessages([]);
  };

  return (
    <View style={styles.root} testID="chat-screen">
      <BackHeader
        title="Assistant Médical o2"
        onBack={back}
        topInset={insets.top}
        right={
          messages.length ? (
            <Pressable testID="chat-clear-button" onPress={clear} hitSlop={8} style={styles.iconBtn} accessibilityLabel="Nouvelle conversation">
              <Ionicons name="refresh" size={26} color={colors.onSurfaceTertiary} />
            </Pressable>
          ) : null
        }
      />
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brandPrimary} />
            <Txt variant="caption" style={{ marginTop: space.md }}>Connexion à l'assistant...</Txt>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{ padding: space.lg, gap: space.md, flexGrow: 1 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View testID="chat-empty" style={{ gap: space.md }}>
                <View style={[styles.bubble, styles.bot]}>
                  <Txt variant="body">
                    Bonjour, je suis l'assistant Médical o2. Comment puis-je vous aider avec votre PPC ou votre ventilation aujourd'hui ?
                  </Txt>
                </View>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <Pressable key={q} testID={`chat-suggestion-${i}`} onPress={() => session && send(q, session)} style={styles.chip}>
                    <Txt variant="label" style={{ color: colors.onBrandTertiary }}>{q}</Txt>
                  </Pressable>
                ))}
              </View>
            }
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.role === "user" ? styles.user : styles.bot]} testID={`chat-msg-${item.role}`}>
                {item.content ? (
                  <Txt variant="body" style={{ color: item.role === "user" ? colors.onBrandPrimary : colors.onSurface }}>{item.content}</Txt>
                ) : (
                  <ActivityIndicator color={colors.brandPrimary} testID="chat-typing" />
                )}
              </View>
            )}
            ListFooterComponent={
              error ? (
                <View style={styles.error} testID="chat-error">
                  <Ionicons name="alert-circle" size={24} color={colors.error} />
                  <Txt variant="body" style={{ flex: 1 }}>{error}</Txt>
                </View>
              ) : null
            }
          />
        )}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + space.sm }]}>
          <TextInput
            testID="chat-input"
            value={input}
            onChangeText={setInput}
            placeholder="Écrivez votre question..."
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
            maxLength={2000}
          />
          <Pressable
            testID="chat-send-button"
            accessibilityLabel="Envoyer"
            disabled={!input.trim() || sending || !session}
            onPress={() => session && send(input, session)}
            style={({ pressed }) => [styles.send, (!input.trim() || sending) && { opacity: 0.45 }, pressed && { transform: [{ scale: 0.95 }] }]}
          >
            {sending ? <ActivityIndicator color={colors.onBrandPrimary} /> : <Ionicons name="send" size={26} color={colors.onBrandPrimary} />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  iconBtn: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: c.surfaceTertiary },
  bubble: { maxWidth: "88%", borderRadius: radius.lg, paddingHorizontal: space.lg, paddingVertical: space.md },
  user: { alignSelf: "flex-end", backgroundColor: c.brandPrimary, borderBottomRightRadius: radius.sm },
  bot: { alignSelf: "flex-start", backgroundColor: c.surfaceSecondary, borderWidth: 1, borderColor: c.border, borderBottomLeftRadius: radius.sm },
  chip: { alignSelf: "flex-start", backgroundColor: c.brandTertiary, borderRadius: radius.md, paddingHorizontal: space.lg, minHeight: 52, justifyContent: "center" },
  error: { flexDirection: "row", gap: space.sm, alignItems: "center", backgroundColor: c.errorTint, padding: space.md, borderRadius: radius.md, marginTop: space.md },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: c.divider, backgroundColor: c.surface },
  input: {
    flex: 1,
    minHeight: 56,
    maxHeight: 140,
    backgroundColor: c.surfaceTertiary,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingTop: 15,
    paddingBottom: 15,
    fontFamily: fonts.regular,
    fontSize: 18,
    color: c.onSurface,
  },
  send: { width: 56, height: 56, borderRadius: 28, backgroundColor: c.brandPrimary, alignItems: "center", justifyContent: "center" },
}));
