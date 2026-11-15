package com.smartalarm.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Constants;

public class MainActivity extends BridgeActivity {

    private static final int OVERLAY_PERMISSION_REQUEST_CODE = 1234;
    private static final String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        BridgeActivity.setStartLockTaskOnCreate(true);

        // Check SYSTEM_ALERT_WINDOW permission
        if (!SettingsCanDrawOverlays(this)) {
            // Request the permission - open system settings
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getPackageName()));
            startActivity(intent);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Check if overlay permission is now granted, if not show UI hint
        if (!SettingsCanDrawOverlays(this)) {
            // Show hint on main screen - could be a toast or UI element
            Log.d(TAG, "Overlay permission not granted, showing hint");
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        // Bring app to foreground when user tries to minimize
        try {
            startLockTask();
        } catch (Exception e) {
            Log.e(TAG, "Failed to start lock task", e);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (!hasFocus) {
            // User tried to go to recent apps or minimize - bring app back
            try {
                startLockTask();
            } catch (Exception e) {
                Log.e(TAG, "Failed to restart lock task", e);
            }
        }
    }

    // Helper method to check overlay permission
    private boolean SettingsCanDrawOverlays(Activity activity) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return Settings.canDrawOverlays(activity);
        }
        return true; // Pre-M allows all
    }

    // Method to be called from JavaScript/Capacitor to check/show overlay hint
    public boolean isOverlayPermissionGranted() {
        return SettingsCanDrawOverlays(this);
    }
}
