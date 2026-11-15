package com.smartalarm.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.KeyEvent;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public static volatile boolean isAlarmRinging = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        }
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            try {
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()));
                startActivity(intent);
            } catch (Exception ignored) {}
        }

        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().addJavascriptInterface(new Object() {
                @JavascriptInterface
                public boolean hasOverlayPermission() {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        return Settings.canDrawOverlays(MainActivity.this);
                    }
                    return true;
                }

                @JavascriptInterface
                public void openOverlaySettings() {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        try {
                            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()));
                            startActivity(intent);
                        } catch (Exception ignored) {}
                    }
                }

                @JavascriptInterface
                public void setRinging(boolean active) {
                    isAlarmRinging = active;
                    runOnUiThread(() -> {
                        if (active) {
                            maxVolume();
                            try { startLockTask(); } catch (Exception ignored) {}
                        } else {
                            try { stopLockTask(); } catch (Exception ignored) {}
                        }
                    });
                }

                @JavascriptInterface
                public void scheduleAlarm(long triggerAtMillis) {
                    try {
                        AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
                        Intent intent = new Intent(MainActivity.this, AlarmReceiver.class);
                        PendingIntent pi = PendingIntent.getBroadcast(
                            MainActivity.this,
                            1001,
                            intent,
                            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                        );
                        if (am != null) {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                                AlarmManager.AlarmClockInfo info = new AlarmManager.AlarmClockInfo(triggerAtMillis, pi);
                                am.setAlarmClock(info, pi);
                            } else {
                                am.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi);
                            }
                        }
                    } catch (Exception ignored) {}
                }
            }, "AndroidLock");
        }

        checkAlarmIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        checkAlarmIntent(intent);
    }

    private void checkAlarmIntent(Intent intent) {
        if (intent != null && intent.getBooleanExtra("trigger_alarm", false)) {
            isAlarmRinging = true;
            maxVolume();
            if (this.bridge != null && this.bridge.getWebView() != null) {
                this.bridge.getWebView().post(() ->
                    this.bridge.getWebView().evaluateJavascript("if(window.triggerNativeAlarm) window.triggerNativeAlarm();", null)
                );
            }
        }
    }

    private void maxVolume() {
        try {
            AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
            if (am != null) {
                am.setStreamVolume(AudioManager.STREAM_MUSIC, am.getStreamMaxVolume(AudioManager.STREAM_MUSIC), 0);
                am.setStreamVolume(AudioManager.STREAM_ALARM, am.getStreamMaxVolume(AudioManager.STREAM_ALARM), 0);
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onBackPressed() {
        if (isAlarmRinging) {
            maxVolume();
            return;
        }
        super.onBackPressed();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (isAlarmRinging && (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN || keyCode == KeyEvent.KEYCODE_BACK)) {
            maxVolume();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (isAlarmRinging && !hasFocus) {
            maxVolume();
            Intent intent = new Intent(this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
            startActivity(intent);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (isAlarmRinging) {
            maxVolume();
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (isAlarmRinging) {
            maxVolume();
            Intent intent = new Intent(this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
            startActivity(intent);
        }
    }
}
