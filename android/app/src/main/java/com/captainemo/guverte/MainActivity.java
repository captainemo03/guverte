package com.captainemo.guverte;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private GuverteBillingBridge billingBridge;
    private GuverteAdsBridge adsBridge;
    private GuverteDiagnosticsBridge diagnosticsBridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getBridge() != null && getBridge().getWebView() != null) {
            GuverteDiagnosticsBridge.installCrashHandler(getApplicationContext());
            billingBridge = new GuverteBillingBridge(this, getBridge().getWebView());
            getBridge().getWebView().addJavascriptInterface(billingBridge, "GuverteBillingNative");
            adsBridge = new GuverteAdsBridge(this, getBridge().getWebView());
            getBridge().getWebView().addJavascriptInterface(adsBridge, "GuverteAdsNative");
            diagnosticsBridge = new GuverteDiagnosticsBridge(this, getBridge().getWebView());
            getBridge().getWebView().addJavascriptInterface(diagnosticsBridge, "GuverteDiagnosticsNative");
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
