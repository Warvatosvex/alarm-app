package com.smartalarm.app;
import android.app.*; import android.content.*; import android.media.AudioManager; import android.net.Uri;
import android.os.*; import android.provider.Settings; import android.view.*; import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public static boolean isAlarmRinging = false;
    public static int savedVol = 50;
    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(true); setTurnScreenOn(true); }
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 23 && !Settings.canDrawOverlays(this))
            startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName())));
        getBridge().getWebView().addJavascriptInterface(new Bridge(), "AndroidLock");
    }
    public void setVol(int pct) {
        AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        if (am == null) return;
        int p = Math.max(0, Math.min(100, pct));
        am.setStreamVolume(AudioManager.STREAM_ALARM, (int)Math.round(am.getStreamMaxVolume(AudioManager.STREAM_ALARM)*(p/100.0)), 0);
        am.setStreamVolume(AudioManager.STREAM_MUSIC, (int)Math.round(am.getStreamMaxVolume(AudioManager.STREAM_MUSIC)*(p/100.0)), 0);
    }
    @Override public void onBackPressed() { if (!isAlarmRinging) super.onBackPressed(); }
    @Override public boolean dispatchKeyEvent(KeyEvent e) {
        int c = e.getKeyCode();
        if (isAlarmRinging && (c == KeyEvent.KEYCODE_BACK || c == KeyEvent.KEYCODE_VOLUME_DOWN || c == KeyEvent.KEYCODE_HOME)) return true;
        return super.dispatchKeyEvent(e);
    }
    @Override protected void onPause() {
        super.onPause();
        if (isAlarmRinging) { ActivityManager am = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE); if (am != null) am.moveTaskToFront(getTaskId(), 0); }
    }
    public class Bridge {
        @JavascriptInterface public void setRinging(boolean s) { setRinging(s, savedVol); }
        @JavascriptInterface public void setRinging(boolean s, int v) {
            isAlarmRinging = s; savedVol = v;
            runOnUiThread(() -> { if (s) { setVol(v); try { startLockTask(); } catch (Exception ignored) {} } else { try { stopLockTask(); } catch (Exception ignored) {} } });
        }
        @JavascriptInterface public void setVolume(int v) { savedVol = v; runOnUiThread(() -> setVol(v)); }
        @JavascriptInterface public boolean canDrawOverlays() { return Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(MainActivity.this); }
        @JavascriptInterface public void requestOverlayPermission() { if (Build.VERSION.SDK_INT >= 23) startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()))); }
        @JavascriptInterface public void scheduleNextAlarm(long ms) {
            AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
            PendingIntent pi = PendingIntent.getBroadcast(MainActivity.this, 1001, new Intent(MainActivity.this, AlarmReceiver.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            if (am != null) { if (ms <= 0) am.cancel(pi); else am.setAlarmClock(new AlarmManager.AlarmClockInfo(ms, pi), pi); }
        }
    }
}