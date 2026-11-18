package com.smartalarm.app;
import android.app.*; import android.content.*; import android.graphics.PixelFormat;
import android.media.AudioManager; import android.net.Uri;
import android.os.*; import android.provider.Settings; import android.view.*; import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public static boolean isAlarmRinging = false;
    public static boolean strictLock = false;
    public static int savedVol = 60;
    private Handler lockHandler = new Handler(Looper.getMainLooper());
    private Runnable guardTask;
    private View edgeShieldTop, edgeShieldBottom;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        try {
            if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(true); setTurnScreenOn(true); }
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().addJavascriptInterface(new Bridge(), "AndroidLock");
            }
            startGuardLoop();
            checkFireIntent(getIntent());
        } catch (Throwable ignored) {}
    }

    private void toggleEdgeShields(boolean enable) {
        try {
            WindowManager wm = (WindowManager) getSystemService(Context.WINDOW_SERVICE);
            if (wm == null) return;
            if (!enable) {
                if (edgeShieldTop != null) { wm.removeView(edgeShieldTop); edgeShieldTop = null; }
                if (edgeShieldBottom != null) { wm.removeView(edgeShieldBottom); edgeShieldBottom = null; }
                return;
            }
            if (Build.VERSION.SDK_INT >= 23 && !Settings.canDrawOverlays(this)) return;
            int type = Build.VERSION.SDK_INT >= 26 ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY : WindowManager.LayoutParams.TYPE_PHONE;
            int flags = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN;

            if (edgeShieldTop == null) {
                edgeShieldTop = new View(this);
                edgeShieldTop.setBackgroundColor(0x01000000);
                WindowManager.LayoutParams pTop = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 90, type, flags, PixelFormat.TRANSLUCENT);
                pTop.gravity = Gravity.TOP;
                wm.addView(edgeShieldTop, pTop);
            }
            if (edgeShieldBottom == null) {
                edgeShieldBottom = new View(this);
                edgeShieldBottom.setBackgroundColor(0x01000000);
                WindowManager.LayoutParams pBot = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 110, type, flags, PixelFormat.TRANSLUCENT);
                pBot.gravity = Gravity.BOTTOM;
                wm.addView(edgeShieldBottom, pBot);
            }
        } catch (Throwable ignored) {}
    }

    private void bringBackNow() {
        try {
            if (isAlarmRinging && strictLock) {
                setVol(savedVol);
                applyImmersive(true);
                ActivityManager am = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
                if (am != null) am.moveTaskToFront(getTaskId(), ActivityManager.MOVE_TASK_WITH_HOME);
                Intent back = new Intent(this, MainActivity.class);
                back.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(back);
            }
        } catch (Throwable ignored) {}
    }
    private void startGuardLoop() {
        guardTask = new Runnable() {
            @Override public void run() {
                if (isAlarmRinging && strictLock) {
                    setVol(savedVol);
                    applyImmersive(true);
                    if (!hasWindowFocus()) bringBackNow();
                }
                lockHandler.postDelayed(this, 120);
            }
        };
        lockHandler.postDelayed(guardTask, 120);
    }

    @Override protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        try { setIntent(i); checkFireIntent(i); } catch (Throwable ignored) {}
    }

    private void checkFireIntent(Intent i) {
        try {
            if (i != null && i.getBooleanExtra("ALARM_FIRED", false)) {
                i.removeExtra("ALARM_FIRED");
                String payload = getSharedPreferences("sa_prefs", MODE_PRIVATE).getString("next_payload", "{}");
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().postDelayed(() -> {
                        try { getBridge().getWebView().evaluateJavascript("if(window.onNativeWake) window.onNativeWake(" + payload + ");", null); } catch (Throwable ignored) {}
                    }, 500);
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
            am.setStreamVolume(AudioManager.STREAM_RING, (int)Math.round(am.getStreamMaxVolume(AudioManager.STREAM_RING)*(p/100.0)), 0);
        } catch (Throwable ignored) {}
    }

    private void applyImmersive(boolean lock) {
        try {
            View decor = getWindow().getDecorView();
            if (lock) {
                decor.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                );
            } else { decor.setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE); }
        } catch (Throwable ignored) {}
    }

    @Override public void onBackPressed() { if (!isAlarmRinging || !strictLock) super.onBackPressed(); }
    @Override public boolean dispatchKeyEvent(KeyEvent e) {
        try {
            int c = e.getKeyCode();
            if (isAlarmRinging && strictLock && (
                c == KeyEvent.KEYCODE_BACK || c == KeyEvent.KEYCODE_HOME || c == KeyEvent.KEYCODE_APP_SWITCH ||
                c == KeyEvent.KEYCODE_VOLUME_DOWN || c == KeyEvent.KEYCODE_VOLUME_UP || c == KeyEvent.KEYCODE_VOLUME_MUTE
            )) {
                setVol(savedVol);
                return true;
            }
        } catch (Throwable ignored) {}
        return super.dispatchKeyEvent(e);
    }

    @Override public void onPause() { super.onPause(); bringBackNow(); }
    @Override public void onStop() { super.onStop(); bringBackNow(); }
    @Override public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (isAlarmRinging && strictLock) { applyImmersive(true); if (!hasFocus) bringBackNow(); }
    }

    public class Bridge {
        @JavascriptInterface public void setRinging(boolean s) { setRinging(s, savedVol, false); }
        @JavascriptInterface public void setRinging(boolean s, int v) { setRinging(s, v, false); }
        @JavascriptInterface public void setRinging(boolean s, int v, boolean lock) {
            isAlarmRinging = s; savedVol = v; strictLock = (s && lock);
            runOnUiThread(() -> {
                if (s) setVol(v);
                applyImmersive(isAlarmRinging && strictLock);
                toggleEdgeShields(isAlarmRinging && strictLock);
            });
        }
        @JavascriptInterface public void setVolume(int v) { savedVol = v; runOnUiThread(() -> setVol(v)); }
        @JavascriptInterface public boolean canDrawOverlays() {
            try { return Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(MainActivity.this); } catch (Throwable t) { return true; }
        }
        @JavascriptInterface public void requestOverlayPermission() {
            
        }
        @JavascriptInterface public void scheduleNextAlarm(long ms) { String cur = getSharedPreferences("sa_prefs", MODE_PRIVATE).getString("next_payload", "{}"); scheduleNextAlarmWithData(ms, cur); }
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