package com.smartalarm.app;
import android.app.*; import android.content.*; import android.media.AudioManager; import android.net.Uri;
import android.os.*; import android.provider.Settings; import android.view.*; import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public static boolean isAlarmRinging = false;
    public static boolean strictLock = false;
    public static int savedVol = 50;
    private long lastFrontTs = 0;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        try {
            wakeScreen();
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().addJavascriptInterface(new Bridge(), "AndroidLock");
            }
            checkFireIntent(getIntent());
        } catch (Throwable ignored) {}
    }

    private void wakeScreen() {
        try {
            if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(true); setTurnScreenOn(true); }
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        } catch (Throwable ignored) {}
    }

    @Override protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        try { setIntent(i); wakeScreen(); checkFireIntent(i); } catch (Throwable ignored) {}
    }

    private void checkFireIntent(Intent i) {
        try {
            if (i != null && i.getBooleanExtra("ALARM_FIRED", false)) {
                i.removeExtra("ALARM_FIRED");
                String payload = getSharedPreferences("sa_prefs", MODE_PRIVATE).getString("next_payload", "{}");
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().postDelayed(() -> {
                        try { getBridge().getWebView().evaluateJavascript("if(window.onNativeWake) window.onNativeWake(" + payload + ");", null); } catch (Throwable ignored) {}
                    }, 600);
                }
            }
        } catch (Throwable ignored) {}
    }

    public void setVol(int pct) {
        try {
            AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
            if (am == null) return;
            int p = Math.max(0, Math.min(100, pct));
            am.setStreamVolume(AudioManager.STREAM_ALARM, (int)Math.round(am.getStreamMaxVolume(AudioManager.STREAM_ALARM)*(p/100.0)), 0);
            am.setStreamVolume(AudioManager.STREAM_MUSIC, (int)Math.round(am.getStreamMaxVolume(AudioManager.STREAM_MUSIC)*(p/100.0)), 0);
        } catch (Throwable ignored) {}
    }

    private void forceFront() {
        try {
            long now = System.currentTimeMillis();
            if (isAlarmRinging && strictLock && (now - lastFrontTs > 600)) {
                lastFrontTs = now;
                ActivityManager am = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
                if (am != null) am.moveTaskToFront(getTaskId(), 0);
            }
        } catch (Throwable ignored) {}
    }

    @Override public void onBackPressed() { if (!isAlarmRinging || !strictLock) super.onBackPressed(); }
    @Override public boolean dispatchKeyEvent(KeyEvent e) {
        try {
            int c = e.getKeyCode();
            if (isAlarmRinging && strictLock && (c == KeyEvent.KEYCODE_BACK || c == KeyEvent.KEYCODE_VOLUME_DOWN || c == KeyEvent.KEYCODE_HOME || c == KeyEvent.KEYCODE_APP_SWITCH)) return true;
        } catch (Throwable ignored) {}
        return super.dispatchKeyEvent(e);
    }
    @Override public void onPause() { super.onPause(); forceFront(); }
    @Override public void onWindowFocusChanged(boolean hasFocus) { super.onWindowFocusChanged(hasFocus); if (!hasFocus) forceFront(); }

    public class Bridge {
        @JavascriptInterface public void setRinging(boolean s) { setRinging(s, savedVol, false); }
        @JavascriptInterface public void setRinging(boolean s, int v) { setRinging(s, v, false); }
        @JavascriptInterface public void setRinging(boolean s, int v, boolean lock) {
            isAlarmRinging = s; savedVol = v; strictLock = lock;
            runOnUiThread(() -> { if (s) setVol(v); });
        }
        @JavascriptInterface public void setVolume(int v) { savedVol = v; runOnUiThread(() -> setVol(v)); }
        @JavascriptInterface public boolean canDrawOverlays() {
            try { return Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(MainActivity.this); } catch (Throwable t) { return true; }
        }
        @JavascriptInterface public void requestOverlayPermission() {
            try { if (Build.VERSION.SDK_INT >= 23) startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()))); } catch (Throwable ignored) {}
        }
        @JavascriptInterface public void scheduleNextAlarm(long ms) { scheduleNextAlarmWithData(ms, "{}"); }
        @JavascriptInterface public void scheduleNextAlarmWithData(long ms, String json) {
            try {
                getSharedPreferences("sa_prefs", MODE_PRIVATE).edit().putString("next_payload", json).apply();
                AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
                PendingIntent pi = PendingIntent.getBroadcast(MainActivity.this, 1001, new Intent(MainActivity.this, AlarmReceiver.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                if (am != null) {
                    if (ms <= 0) am.cancel(pi);
                    else if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, ms, pi);
                    else am.setAlarmClock(new AlarmManager.AlarmClockInfo(ms, pi), pi);
                }
            } catch (Throwable ignored) {}
        }
    }
}