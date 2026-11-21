package com.smartalarm.app;
import android.app.*; import android.content.*; import android.os.*;
import androidx.core.app.NotificationCompat;

public class AlarmReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) {
        try {
            PowerManager pm = (PowerManager) c.getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                PowerManager.WakeLock wl = pm.newWakeLock(
                    PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP | PowerManager.ON_AFTER_RELEASE,
                    "SmartAlarm:LockScreenWake"
                );
                wl.acquire(30000);
            }
        } catch (Throwable ignored) {}

        try {
            Intent full = new Intent(c, MainActivity.class);
            full.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
            full.putExtra("ALARM_FIRED", true);

            PendingIntent pi = PendingIntent.getActivity(
                c, 2002, full, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            String chId = "smart_alarm_lockscreen_v3";
            if (Build.VERSION.SDK_INT >= 26 && nm != null) {
                NotificationChannel ch = new NotificationChannel(chId, "Будильник поверх блокировки", NotificationManager.IMPORTANCE_HIGH);
                ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                ch.setSound(null, null);
                ch.enableVibration(true);
                ch.setBypassDnd(true);
                nm.createNotificationChannel(ch);
            }

            if (nm != null) {
                Notification n = new NotificationCompat.Builder(c, chId)
                    .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                    .setContentTitle("Будильник")
                    .setContentText("Нажмите, чтобы открыть экран будильника")
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setCategory(NotificationCompat.CATEGORY_ALARM)
                    .setVisibility(Notification.VISIBILITY_PUBLIC)
                    .setFullScreenIntent(pi, true)
                    .setOngoing(true)
                    .setAutoCancel(true)
                    .build();
                nm.notify(777, n);
            }

            c.startActivity(full);
        } catch (Throwable ignored) {}
    }
}