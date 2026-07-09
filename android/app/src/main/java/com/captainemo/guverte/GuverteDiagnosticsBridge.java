package com.captainemo.guverte;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.PrintWriter;
import java.io.StringWriter;

public final class GuverteDiagnosticsBridge {
    private static final String PREFS = "guverte_release_diagnostics";
    private static final String WEB_LOGS = "web_logs";
    private static final String NATIVE_CRASH = "native_crash";
    private static final int MAX_WEB_LOGS = 24;
    private static boolean crashHandlerInstalled = false;

    private final Activity activity;
    private final WebView webView;
    private final SharedPreferences preferences;

    public GuverteDiagnosticsBridge(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
        this.preferences = activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    public static synchronized void installCrashHandler(Context context) {
        if (crashHandlerInstalled) return;
        crashHandlerInstalled = true;
        final Context appContext = context.getApplicationContext();
        final Thread.UncaughtExceptionHandler previous = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((thread, error) -> {
            StringWriter writer = new StringWriter();
            error.printStackTrace(new PrintWriter(writer));
            JSONObject crash = new JSONObject();
            try {
                crash.put("time", System.currentTimeMillis());
                crash.put("thread", thread.getName());
                crash.put("type", error.getClass().getSimpleName());
                crash.put("message", String.valueOf(error.getMessage()));
                crash.put("stack", writer.toString().substring(0, Math.min(writer.toString().length(), 12000)));
            } catch (JSONException ignored) {
            }
            appContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                    .edit()
                    .putString(NATIVE_CRASH, crash.toString())
                    .apply();
            if (previous != null) previous.uncaughtException(thread, error);
        });
    }

    @JavascriptInterface
    public void recordWebDiagnostic(String json) {
        if (json == null || json.trim().isEmpty()) return;
        synchronized (GuverteDiagnosticsBridge.class) {
            JSONArray current = readArray(preferences.getString(WEB_LOGS, "[]"));
            JSONArray next = new JSONArray();
            try {
                next.put(new JSONObject(json));
            } catch (JSONException error) {
                next.put(json);
            }
            for (int index = 0; index < Math.min(current.length(), MAX_WEB_LOGS - 1); index++) {
                next.put(current.opt(index));
            }
            preferences.edit().putString(WEB_LOGS, next.toString()).apply();
        }
    }

    @JavascriptInterface
    public void getStatus() {
        JSONObject status = new JSONObject();
        try {
            status.put("platform", "android");
            status.put("sdk", Build.VERSION.SDK_INT);
            status.put("manufacturer", Build.MANUFACTURER);
            status.put("model", Build.MODEL);
            status.put("webDiagnosticCount", readArray(preferences.getString(WEB_LOGS, "[]")).length());
            String crash = preferences.getString(NATIVE_CRASH, "");
            status.put("previousNativeCrash", !crash.isEmpty());
            if (!crash.isEmpty()) status.put("nativeCrash", new JSONObject(crash));
            status.put("versionName", activity.getPackageManager()
                    .getPackageInfo(activity.getPackageName(), 0).versionName);
        } catch (Exception error) {
            try {
                status.put("statusError", error.getClass().getSimpleName());
            } catch (JSONException ignored) {
            }
        }
        final String script = "window.__guverteDiagnosticsNativeStatus && "
                + "window.__guverteDiagnosticsNativeStatus(" + status + ");";
        activity.runOnUiThread(() -> webView.evaluateJavascript(script, null));
    }

    @JavascriptInterface
    public void clearDiagnostics() {
        preferences.edit().remove(WEB_LOGS).remove(NATIVE_CRASH).apply();
        getStatus();
    }

    private static JSONArray readArray(String raw) {
        try {
            return new JSONArray(raw == null ? "[]" : raw);
        } catch (JSONException error) {
            return new JSONArray();
        }
    }
}
