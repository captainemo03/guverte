package com.captainemo.guverte;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.annotation.NonNull;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.ump.ConsentInformation;
import com.google.android.ump.ConsentRequestParameters;
import com.google.android.ump.FormError;
import com.google.android.ump.UserMessagingPlatform;

public class GuverteAdsBridge {
    private static final long MIN_SHOW_INTERVAL_MS = 90_000L;

    private final Activity activity;
    private final WebView webView;
    private final ConsentInformation consentInformation;
    private InterstitialAd interstitialAd;
    private boolean adsRemoved;
    private boolean sdkInitialized;
    private boolean adLoading;
    private boolean destroyed;
    private long lastShownAt;

    public GuverteAdsBridge(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
        this.consentInformation = UserMessagingPlatform.getConsentInformation(activity);
        initializeAds();
    }

    @JavascriptInterface
    public void initializeAds() {
        if (destroyed || adsRemoved) return;
        activity.runOnUiThread(this::requestConsentAndInitialize);
    }

    @JavascriptInterface
    public void setAdsRemoved(boolean removed) {
        activity.runOnUiThread(() -> {
            adsRemoved = removed;
            if (removed) {
                interstitialAd = null;
                sendEvent("disabled", false, "remove_ads aktif");
            } else if (sdkInitialized) {
                loadInterstitial();
            }
        });
    }

    @JavascriptInterface
    public void showInterstitial(String reason) {
        final String safeReason = sanitizeReason(reason);
        activity.runOnUiThread(() -> showInterstitialOnMainThread(safeReason));
    }

    @JavascriptInterface
    public void showPrivacyOptions() {
        activity.runOnUiThread(() ->
                UserMessagingPlatform.showPrivacyOptionsForm(activity, formError -> {
                    if (formError != null) {
                        sendEvent("privacy_error", false, formError.getMessage());
                        return;
                    }
                    sendEvent("privacy_closed", true, "");
                    if (consentInformation.canRequestAds()) initializeMobileAds();
                }));
    }

    @JavascriptInterface
    public void getStatus() {
        activity.runOnUiThread(() -> sendEvent(
                "status",
                sdkInitialized && !adsRemoved,
                adsRemoved ? "remove_ads aktif" : interstitialAd != null ? "hazir" : "yukleniyor"));
    }

    private void requestConsentAndInitialize() {
        ConsentRequestParameters params = new ConsentRequestParameters.Builder().build();
        consentInformation.requestConsentInfoUpdate(
                activity,
                params,
                () -> UserMessagingPlatform.loadAndShowConsentFormIfRequired(activity, formError -> {
                    if (formError != null) sendEvent("consent_warning", false, formError.getMessage());
                    if (consentInformation.canRequestAds()) initializeMobileAds();
                    else sendEvent("consent_required", false, "Reklam izni bekleniyor");
                }),
                requestConsentError -> {
                    sendEvent("consent_warning", false, requestConsentError.getMessage());
                    if (consentInformation.canRequestAds()) initializeMobileAds();
                });
    }

    private void initializeMobileAds() {
        if (sdkInitialized || adsRemoved || destroyed) return;
        sdkInitialized = true;
        MobileAds.initialize(activity, initializationStatus -> {
            sendEvent("initialized", true, "");
            loadInterstitial();
        });
    }

    private void loadInterstitial() {
        if (!sdkInitialized || adsRemoved || adLoading || interstitialAd != null || destroyed) return;
        adLoading = true;
        InterstitialAd.load(
                activity,
                BuildConfig.ADMOB_INTERSTITIAL_AD_UNIT_ID,
                new AdRequest.Builder().build(),
                new InterstitialAdLoadCallback() {
                    @Override
                    public void onAdLoaded(@NonNull InterstitialAd loadedAd) {
                        adLoading = false;
                        interstitialAd = loadedAd;
                        sendEvent("loaded", true, "");
                    }

                    @Override
                    public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                        adLoading = false;
                        interstitialAd = null;
                        sendEvent("load_failed", false, loadAdError.getMessage());
                    }
                });
    }

    private void showInterstitialOnMainThread(String reason) {
        if (adsRemoved) {
            sendEvent("blocked", false, "remove_ads aktif");
            return;
        }
        if (!sdkInitialized || !consentInformation.canRequestAds()) {
            initializeAds();
            sendEvent("not_ready", false, "Reklam izni veya SDK hazir degil");
            return;
        }
        long now = System.currentTimeMillis();
        if (now - lastShownAt < MIN_SHOW_INTERVAL_MS) {
            sendEvent("cooldown", false, "Reklamlar cok sik gosterilmez");
            return;
        }
        if (interstitialAd == null) {
            loadInterstitial();
            sendEvent("not_ready", false, "Reklam yukleniyor");
            return;
        }

        InterstitialAd adToShow = interstitialAd;
        interstitialAd = null;
        adToShow.setFullScreenContentCallback(new FullScreenContentCallback() {
            @Override
            public void onAdDismissedFullScreenContent() {
                sendEvent("dismissed", true, reason);
                loadInterstitial();
            }

            @Override
            public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                sendEvent("show_failed", false, adError.getMessage());
                loadInterstitial();
            }

            @Override
            public void onAdShowedFullScreenContent() {
                lastShownAt = System.currentTimeMillis();
                sendEvent("shown", true, reason);
            }
        });
        adToShow.show(activity);
    }

    private void sendEvent(String type, boolean ok, String message) {
        if (destroyed) return;
        String json = "{\"type\":\"" + escapeJson(type)
                + "\",\"ok\":" + ok
                + ",\"message\":\"" + escapeJson(message) + "\"}";
        String script = "window.__guverteAdsNativeEvent && window.__guverteAdsNativeEvent(" + json + ");";
        activity.runOnUiThread(() -> {
            if (!destroyed) webView.evaluateJavascript(script, null);
        });
    }

    private String sanitizeReason(String reason) {
        if ("month_end".equals(reason)) return reason;
        if ("contract_end".equals(reason)) return reason;
        if ("sim_exit".equals(reason)) return reason;
        return "safe_point";
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }

    public void destroy() {
        destroyed = true;
        interstitialAd = null;
    }
}
