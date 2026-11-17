package com.smartalarm.app;
import android.content.*; import android.os.PowerManager;
public class AlarmReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) {
        PowerManager pm = (PowerManager) c.getSystemService(Context.POWER_SERVICE);
        if (pm != null) pm.newWakeLock(PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP | PowerManager.ON_AFTER_RELEASE, "SmartAlarm:WL").acquire(10000);
        Intent l = new Intent(c, MainActivity.class);
        l.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        l.putExtra("ALARM_FIRED", true);
        c.startActivity(l);
    }
}