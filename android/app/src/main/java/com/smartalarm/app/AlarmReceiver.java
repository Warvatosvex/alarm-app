package com.smartalarm.app;
import android.content.*; import android.os.*;

public class AlarmReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) {
        Intent svc = new Intent(c, AlarmForegroundService.class);
        try {
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(svc);
            else c.startService(svc);
        } catch (Throwable ignored) {}
    }
}