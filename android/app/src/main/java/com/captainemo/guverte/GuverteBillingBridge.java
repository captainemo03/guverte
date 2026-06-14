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
    private static final String ADS_REMOVAL_PRODUCT_ID = "remove_ads";
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
        final String safeProductId = normalizeProductId(productId);
        connect(() -> queryAndLaunchPurchase(safeProductId));
    }

    @JavascriptInterface
    public void restorePremium() {
        connect(() -> queryOwnedProduct(PREMIUM_PRODUCT_ID));
    }

    @JavascriptInterface
    public void restoreProduct(String productId) {
        final String safeProductId = normalizeProductId(productId);
        connect(() -> queryOwnedProduct(safeProductId));
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

    private void queryOwnedProduct(String productId) {
        QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.INAPP)
                .build();
        billingClient.queryPurchasesAsync(params, (billingResult, purchases) -> {
            if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                sendResult(false, "", "Satin alma geri yuklenemedi: " + billingResult.getDebugMessage());
                return;
            }
            Purchase purchase = findKnownPurchase(purchases, productId);
            if (purchase == null) {
                sendResult(false, "", "Bu Google Play hesabinda satin alma bulunamadi: " + productId);
                return;
            }
            handlePurchase(purchase, productId);
        });
    }

    @Override
    public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
            Purchase premium = findKnownPurchase(purchases, PREMIUM_PRODUCT_ID);
            if (premium != null) {
                handlePurchase(premium, PREMIUM_PRODUCT_ID);
                return;
            }
            Purchase adsRemoval = findKnownPurchase(purchases, ADS_REMOVAL_PRODUCT_ID);
            if (adsRemoval != null) {
                handlePurchase(adsRemoval, ADS_REMOVAL_PRODUCT_ID);
                return;
            }
            sendResult(false, "", "Satin alma listesinde tanimli urun yok.");
            return;
        }
        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            sendResult(false, "", "Satin alma iptal edildi.");
            return;
        }
        sendResult(false, "", "Satin alma basarisiz: " + billingResult.getDebugMessage());
    }

    private Purchase findKnownPurchase(List<Purchase> purchases, String productId) {
        if (purchases == null) return null;
        for (Purchase purchase : purchases) {
            if (purchase.getProducts().contains(productId)
                    && purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                return purchase;
            }
        }
        return null;
    }

    private void handlePurchase(Purchase purchase, String productId) {
        if (!purchase.isAcknowledged()) {
            AcknowledgePurchaseParams acknowledgeParams = AcknowledgePurchaseParams.newBuilder()
                    .setPurchaseToken(purchase.getPurchaseToken())
                    .build();
            billingClient.acknowledgePurchase(acknowledgeParams, billingResult -> {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    sendResult(true, purchase.getPurchaseToken(), productId, "");
                } else {
                    sendResult(false, "", "Satin alma onaylanamadi: " + billingResult.getDebugMessage());
                }
            });
        } else {
            sendResult(true, purchase.getPurchaseToken(), productId, "");
        }
    }

    private String normalizeProductId(String productId) {
        if (ADS_REMOVAL_PRODUCT_ID.equals(productId)) return ADS_REMOVAL_PRODUCT_ID;
        if (PREMIUM_PRODUCT_ID.equals(productId)) return PREMIUM_PRODUCT_ID;
        return PREMIUM_PRODUCT_ID;
    }

    private void sendResult(boolean ok, String token, String message) {
        sendResult(ok, token, "", message);
    }

    private void sendResult(boolean ok, String token, String productId, String message) {
        String json = "{\"ok\":" + ok
                + ",\"purchaseToken\":\"" + escapeJson(token) + "\""
                + ",\"productId\":\"" + escapeJson(productId) + "\""
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
