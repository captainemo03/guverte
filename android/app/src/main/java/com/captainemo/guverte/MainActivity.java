package com.captainemo.guverte;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private GuverteBillingBridge billingBridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getBridge() != null && getBridge().getWebView() != null) {
            billingBridge = new GuverteBillingBridge(this, getBridge().getWebView());
            getBridge().getWebView().addJavascriptInterface(billingBridge, "GuverteBillingNative");
        }
    }

    @Override
    public void onDestroy() {
        if (billingBridge != null) {
            billingBridge.destroy();
            billingBridge = null;
        }
        super.onDestroy();
    }
}
