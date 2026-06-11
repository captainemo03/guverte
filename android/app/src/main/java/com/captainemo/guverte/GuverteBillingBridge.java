package com.captainemo.guverte;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import java.util.ArrayList;
import java.util.List;

public class GuverteBillingBridge implements PurchasesUpdatedListener {
    private static final String PREMIUM_PRODUCT_ID = "premium_full_pack";
    private final Activity activity;
    private final WebView webView;
    private final BillingClient billingClient;

    public GuverteBillingBridge(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
        this.billingClient = BillingClient.newBuilder(activity)
                .setListener(this)
                .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
                .build();
        connect(null);
    }

    @JavascriptInterface
    public void purchasePremium(String productId) {
        final String safeProductId = PREMIUM_PRODUCT_ID.equals(productId) ? productId : PREMIUM_PRODUCT_ID;
        connect(() -> queryAndLaunchPurchase(safeProductId));
    }

    @JavascriptInterface
    public void restorePremium() {
        connect(this::queryOwnedPremium);
    }

    private void connect(Runnable onReady) {
        if (billingClient.isReady()) {
            if (onReady != null) activity.runOnUiThread(onReady);
            return;
        }
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    if (onReady != null) activity.runOnUiThread(onReady);
                } else {
                    sendResult(false, "", "Google Play Billing hazir degil: " + billingResult.getDebugMessage());
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                sendResult(false, "", "Google Play Billing baglantisi koptu. Tekrar dene.");
            }
        });
    }

    private void queryAndLaunchPurchase(String productId) {
        List<QueryProductDetailsParams.Product> products = new ArrayList<>();
        products.add(QueryProductDetailsParams.Product.newBuilder()
                .setProductId(productId)
                .setProductType(BillingClient.ProductType.INAPP)
                .build());

        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(products)
                .build();

        billingClient.queryProductDetailsAsync(params, (billingResult, productDetailsResult) -> {
            if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                sendResult(false, "", "Urun sorgulanamadi: " + billingResult.getDebugMessage());
                return;
            }
            List<ProductDetails> productDetailsList = productDetailsResult == null ? null : productDetailsResult.getProductDetailsList();
            if (productDetailsList == null || productDetailsList.isEmpty()) {
                sendResult(false, "", "Premium urunu Play Console'da bulunamadi. Product ID: " + productId);
                return;
            }
            ProductDetails details = productDetailsList.get(0);
            List<BillingFlowParams.ProductDetailsParams> flowProducts = new ArrayList<>();
            flowProducts.add(BillingFlowParams.ProductDetailsParams.newBuilder()
                    .setProductDetails(details)
                    .build());

            BillingFlowParams flowParams = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(flowProducts)
                    .build();
            BillingResult launchResult = billingClient.launchBillingFlow(activity, flowParams);
            if (launchResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                sendResult(false, "", "Odeme ekrani acilamadi: " + launchResult.getDebugMessage());
            }
        });
    }

    private void queryOwnedPremium() {
        QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.INAPP)
                .build();
        billingClient.queryPurchasesAsync(params, (billingResult, purchases) -> {
            if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                sendResult(false, "", "Satin alma geri yuklenemedi: " + billingResult.getDebugMessage());
                return;
            }
            Purchase premium = findPremiumPurchase(purchases);
            if (premium == null) {
                sendResult(false, "", "Bu Google Play hesabinda premium satin alma bulunamadi.");
                return;
            }
            handlePurchase(premium);
        });
    }

    @Override
    public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
            Purchase premium = findPremiumPurchase(purchases);
            if (premium != null) {
                handlePurchase(premium);
                return;
            }
            sendResult(false, "", "Satin alma listesinde premium paket yok.");
            return;
        }
        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            sendResult(false, "", "Satin alma iptal edildi.");
            return;
        }
        sendResult(false, "", "Satin alma basarisiz: " + billingResult.getDebugMessage());
    }

    private Purchase findPremiumPurchase(List<Purchase> purchases) {
        if (purchases == null) return null;
        for (Purchase purchase : purchases) {
            if (purchase.getProducts().contains(PREMIUM_PRODUCT_ID)
                    && purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                return purchase;
            }
        }
        return null;
    }

    private void handlePurchase(Purchase purchase) {
        if (!purchase.isAcknowledged()) {
            AcknowledgePurchaseParams acknowledgeParams = AcknowledgePurchaseParams.newBuilder()
                    .setPurchaseToken(purchase.getPurchaseToken())
                    .build();
            billingClient.acknowledgePurchase(acknowledgeParams, billingResult -> {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    sendResult(true, purchase.getPurchaseToken(), "");
                } else {
                    sendResult(false, "", "Satin alma onaylanamadi: " + billingResult.getDebugMessage());
                }
            });
        } else {
            sendResult(true, purchase.getPurchaseToken(), "");
        }
    }

    private void sendResult(boolean ok, String token, String message) {
        String json = "{\"ok\":" + ok
                + ",\"purchaseToken\":\"" + escapeJson(token) + "\""
                + ",\"message\":\"" + escapeJson(message) + "\"}";
        String script = "window.__guverteBillingNativeResult && window.__guverteBillingNativeResult(" + json + ");";
        activity.runOnUiThread(() -> webView.evaluateJavascript(script, null));
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
        if (billingClient.isReady()) {
            billingClient.endConnection();
        }
    }
}
