import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
// import { onAuthStateChanged, User } from "firebase/auth";
// import { auth } from "@/path/to/firebase"

export default function RootLayout() {
  // const [user, setUser] = useState<User | null>(null);
  // const [ready, setReady] = useState(false);
  // const router = useRouter();
  // const segments = useSegments();

  // useEffect(() => {
  //   return onAuthStateChanged(AuthenticatorAssertionResponse, (u) => {
  //     setUser(u);
  //     setReady(true);
  //   });
  // }, []);

  // useEffect(() => {
  //   if (!ready) return;

  //   const onAuthScreen = !segments[0] || segments[0] === "login";
    
  //   if (!user && !onAuthScreen) router.replace("/login");
  //   if (user && onAuthScreen) router.replace("/dashboard");
  //   }, [user, ready, segments])

  //   if (!ready) return null;

  return <Stack screenOptions={{ headerShown: false }}/>;
}
