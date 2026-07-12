package com.captainemo.guverte;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "GuverteMain";
    private GuverteBillingBridge billingBridge;
    private GuverteAdsBridge adsBridge;
    private GuverteDiagnosticsBridge diagnosticsBridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getBridge() != null && getBridge().getWebView() != null) {
            GuverteDiagnosticsBridge.installCrashHandler(getApplicationContext());
            try {
                billingBridge = new GuverteBillingBridge(this, getBridge().getWebView());
                getBridge().getWebView().addJavascriptInterface(billingBridge, "GuverteBillingNative");
            } catch (Exception e) {
                Log.e(TAG, "Billing bridge could not be initialized", e);
            }
            try {
                adsBridge = new GuverteAdsBridge(this, getBridge().getWebView());
                getBridge().getWebView().addJavascriptInterface(adsBridge, "GuverteAdsNative");
            } catch (Exception e) {
                Log.e(TAG, "Ads bridge could not be initialized", e);
            }
            try {
                diagnosticsBridge = new GuverteDiagnosticsBridge(this, getBridge().getWebView());
                getBridge().getWebView().addJavascriptInterface(diagnosticsBridge, "GuverteDiagnosticsNative");
            } catch (Exception e) {
                Log.e(TAG, "Diagnostics bridge could not be initialized", e);
            }
        }
    }

    @Override
    public void onDestroy() {
        if (billingBridge != null) {
            billingBridge.destroy();
            billingBridge = null;
        }
        if (adsBridge != null) {
            adsBridge.destroy();
            adsBridge = null;
        }
        diagnosticsBridge = null;
        super.onDestroy();
    }
}
