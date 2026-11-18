package com.smartalarm.app;
import android.app.*; import android.content.*; import android.media.AudioManager; import android.net.Uri;
import android.os.*; import android.provider.Settings; import android.view.*; import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public static boolean isAlarmRinging = false;
    public static boolean strictLock = true;
    public static int savedVol = 50;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        wakeScreen();
        if (Build.VERSION.SDK_INT >= 23 && !Settings.canDrawOverlays(this))
            startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName())));
        getBridge().getWebView().addJavascriptInterface(new Bridge(), "AndroidLock");
        checkFireIntent(getIntent());
    }
    private void wakeScreen() {
        if (Build.VERSION.SDK_INT >= 27) {
            setShowWhenLocked(true); setTurnScreenOn(true);
            KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
            if (km != null) km.requestDismissKeyguard(this, null);
        }
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);
    }
    @Override protected void onNewIntent(Intent intent) { super.onNewIntent(intent); setIntent(intent); wakeScreen(); checkFireIntent(intent); }
    private void checkFireIntent(Intent intent) {
        if (intent != null && intent.getBooleanExtra("ALARM_FIRED", false)) {
            intent.removeExtra("ALARM_FIRED");
            String payload = getSharedPreferences("sa_prefs", MODE_PRIVATE).getString("next_payload", "{}");
            isAlarmRinging = true;
            getBridge().getWebView().postDelayed(() ->
                getBridge().getWebView().evaluateJavascript("if(window.onNativeWake) window.onNativeWake(" + payload + ");", null), 600);
        }
    }
    public void setVol(int pct) {
        AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        if (am == null) return;
        int p = Math.max(0, Math.min(100, pct));
        am.setStreamVolume(AudioManager.STREAM_ALARM, (int)Math.round(am.getStreamMaxVolume(AudioManager.STREAM_ALARM)*(p/100.0)), 0);
        am.setStreamVolume(AudioManager.STREAM_MUSIC, (int)Math.round(am.getStreamMaxVolume(AudioManager.STREAM_MUSIC)*(p/100.0)), 0);
    }
    @Override public void onBackPressed() { if (!isAlarmRinging || !strictLock) super.onBackPressed(); }
    @Override public boolean dispatchKeyEvent(KeyEvent e) {
        int c = e.getKeyCode();
        if (isAlarmRinging && strictLock && (c == KeyEvent.KEYCODE_BACK || c == KeyEvent.KEYCODE_VOLUME_DOWN || c == KeyEvent.KEYCODE_HOME)) return true;
        return super.dispatchKeyEvent(e);
    }
    @Override public void onPause() {
        super.onPause();
        if (isAlarmRinging && strictLock) { ActivityManager am = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE); if (am != null) am.moveTaskToFront(getTaskId(), 0); }
    }
    public class Bridge {
        @JavascriptInterface public void setRinging(boolean s) { setRinging(s, savedVol, true); }
        @JavascriptInterface public void setRinging(boolean s, int v) { setRinging(s, v, true); }
        @JavascriptInterface public void setRinging(boolean s, int v, boolean lock) {
            isAlarmRinging = s; savedVol = v; strictLock = lock;
            runOnUiThread(() -> { if (s) { setVol(v); if (strictLock) try { startLockTask(); } catch (Exception ignored) {} } else { try { stopLockTask(); } catch (Exception ignored) {} } });
        }
        @JavascriptInterface public void setVolume(int v) { savedVol = v; runOnUiThread(() -> setVol(v)); }
        @JavascriptInterface public boolean canDrawOverlays() { return Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(MainActivity.this); }
        @JavascriptInterface public void requestOverlayPermission() { if (Build.VERSION.SDK_INT >= 23) startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()))); }
        @JavascriptInterface public void scheduleNextAlarm(long ms) { scheduleNextAlarmWithData(ms, "{}"); }
        @JavascriptInterface public void scheduleNextAlarmWithData(long ms, String json) {
            getSharedPreferences("sa_prefs", MODE_PRIVATE).edit().putString("next_payload", json).apply();
            AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
            PendingIntent pi = PendingIntent.getBroadcast(MainActivity.this, 1001, new Intent(MainActivity.this, AlarmReceiver.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            if (am != null) { if (ms <= 0) am.cancel(pi); else am.setAlarmClock(new AlarmManager.AlarmClockInfo(ms, pi), pi); }
        }
    }
}