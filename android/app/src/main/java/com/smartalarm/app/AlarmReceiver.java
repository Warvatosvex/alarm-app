package com.smartalarm.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.PowerManager;
import android.util.Log;

public class AlarmReceiver extends BroadcastReceiver {

    private static final String TAG = "AlarmReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        Log.d(TAG, "AlarmReceiver received action: " + action);

        if (action != null && action.equals("com.smartalarm.app.ACTION_SHOW_ALARM")) {
            // Create an intent to show the main activity with the alarm
            Intent showIntent = new Intent(context, MainActivity.class);
            showIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
            showIntent.putExtra("isAlarmRinging", true);
            showIntent.putExtra("alarm-data", intent.getExtras());

            // Wake up the device
            PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            if (powerManager != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    powerManager.wakeUp(System.currentTimeMillis());
                } else {
                    powerManager.wakeUp(System.currentTimeMillis(), PowerManager.ACQUIRE_CAUSES_WAKEUP | PowerManager.ON_AFTER_RELEASE, null);
                }
            }

            // Start the activity
            context.startActivity(showIntent);
        }
    }

    public static void setAlarm(Context context, long triggerAtMillis, String alarmData) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        Intent intent = new Intent(context, AlarmReceiver.class);
        intent.setAction("com.smartalarm.app.ACTION_SHOW_ALARM");
        // Put alarm data into the intent
        if (alarmData != null) {
            intent.putExtras(alarmData);
        }

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                0,
                intent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );

        // Use exact alarm if available
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            alarmManager.setExactAlarmClock(
                    new AlarmManager.ExactAlarmClockRequest(
                            triggerAtMillis,
                            pendingIntent,
                            null // options
                    )
            );
        } else {
            // Fallback for older Android versions
            alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
            );
        }
    }

    public static void cancelAlarm(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        Intent intent = new Intent(context, AlarmReceiver.class);
        intent.setAction("com.smartalarm.app.ACTION_SHOW_ALARM");
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                0,
                intent,
                PendingIntent.FLAG_IMMUTABLE
        );
        alarmManager.cancel(pendingIntent);
    }
}