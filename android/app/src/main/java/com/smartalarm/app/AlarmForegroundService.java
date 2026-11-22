package com.smartalarm.app;
import android.app.*; import android.content.*; import android.os.*;
import androidx.core.app.NotificationCompat;

public class AlarmForegroundService extends Service {
    private PowerManager.WakeLock wakeLock;

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null && (wakeLock == null || !wakeLock.isHeld())) {
                wakeLock = pm.newWakeLock(
                    PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP | PowerManager.ON_AFTER_RELEASE,
                    "SmartAlarm:FgWakeLock"
                );
                wakeLock.acquire(10 * 60 * 1000L);
            }
        } catch (Throwable ignored) {}

        String chId = "smart_alarm_fg_v4";
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26 && nm != null) {
            NotificationChannel ch = new NotificationChannel(chId, "Активный будильник", NotificationManager.IMPORTANCE_HIGH);
            ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            ch.setSound(null, null);
            ch.setBypassDnd(true);
            nm.createNotificationChannel(ch);
        }

        Intent full = new Intent(this, MainActivity.class);
        full.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        full.putExtra("ALARM_FIRED", true);

        PendingIntent pi = PendingIntent.getActivity(this, 3003, full, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Notification n = new NotificationCompat.Builder(this, chId)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("⏰ Будильник сработал")
            .setContentText("Нажмите, чтобы открыть экран будильника")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .setFullScreenIntent(pi, true)
            .setOngoing(true)
            .build();

        startForeground(888, n);

        try { startActivity(full); } catch (Throwable ignored) {}
        return START_STICKY;
    }

    @Override public void onDestroy() {
        try { if (wakeLock != null && wakeLock.isHeld()) wakeLock.release(); } catch (Throwable ignored) {}
        super.onDestroy();
    }

    @Override public IBinder onBind(Intent intent) { return null; }
}