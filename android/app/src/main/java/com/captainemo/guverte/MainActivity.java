package com.captainemo.guverte;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private GuverteBillingBridge billingBridge;
    private GuverteAdsBridge adsBridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getBridge() != null && getBridge().getWebView() != null) {
            billingBridge = new GuverteBillingBridge(this, getBridge().getWebView());
            getBridge().getWebView().addJavascriptInterface(billingBridge, "GuverteBillingNative");
            adsBridge = new GuverteAdsBridge(this, getBridge().getWebView());
            getBridge().getWebView().addJavascriptInterface(adsBridge, "GuverteAdsNative");
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
        super.onDestroy();
    }
}
