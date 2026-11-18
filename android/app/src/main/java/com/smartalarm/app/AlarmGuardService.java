package com.smartalarm.app;
import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.view.accessibility.AccessibilityEvent;

public class AlarmGuardService extends AccessibilityService {
    @Override public void onAccessibilityEvent(AccessibilityEvent event) {
        if (MainActivity.isAlarmRinging && MainActivity.strictLock) {
            CharSequence pkg = event.getPackageName();
            if (pkg != null && !pkg.toString().equals(getPackageName())) {
                performGlobalAction(GLOBAL_ACTION_BACK);
                Intent i = new Intent(this, MainActivity.class);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                startActivity(i);
            }
        }
    }
    @Override public void onInterrupt() {}
}