"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { pushApi } from "@/services/api";

// Faqat Android (Capacitor) ilovasida ishlaydi — brauzerda hech narsa qilmaydi.
// Push ruxsatini so'raydi, FCM token olinganda backendga ro'yxatdan o'tkazadi.
export function usePushRegistration(adminToken: string | null) {
  useEffect(() => {
    if (!adminToken || !Capacitor.isNativePlatform()) return;

    let cancelled = false;

    const registrationListener = PushNotifications.addListener("registration", async (token) => {
      if (cancelled) return;
      try {
        await pushApi.register(token.value, adminToken);
      } catch (err) {
        console.error("Push token registratsiyasi muvaffaqiyatsiz:", err);
      }
    });

    const errorListener = PushNotifications.addListener("registrationError", (err) => {
      console.error("Push registration xato:", err);
    });

    (async () => {
      let status = await PushNotifications.checkPermissions();
      if (status.receive === "prompt") {
        status = await PushNotifications.requestPermissions();
      }
      if (status.receive !== "granted" || cancelled) return;

      await PushNotifications.register();
    })();

    return () => {
      cancelled = true;
      registrationListener.then((listener) => listener.remove());
      errorListener.then((listener) => listener.remove());
    };
  }, [adminToken]);
}
