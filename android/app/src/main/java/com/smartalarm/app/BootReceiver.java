package com.smartalarm.app;
import android.app.*; import android.content.*; import android.os.*;

public class BootReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) {
        try {
            SharedPreferences sp = c.getSharedPreferences("sa_prefs", Context.MODE_PRIVATE);
            long nextTs = sp.getLong("next_ts", 0L);
            if (nextTs > System.currentTimeMillis()) {
                AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
                PendingIntent pi = PendingIntent.getBroadcast(c, 1001, new Intent(c, AlarmReceiver.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                if (am != null) {
                    if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextTs, pi);
                    else am.setAlarmClock(new AlarmManager.AlarmClockInfo(nextTs, pi), pi);
                }
            }
        } catch (Throwable ignored) {}
    }
}