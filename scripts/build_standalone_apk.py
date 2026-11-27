import os
import shutil
import subprocess

BUILD_DIR = r"D:\Antigravity\ATTENDANCE\standalone-apk-build"
SDK_DIR = r"D:\Antigravity\ATTENDANCE\tools\android-sdk"
JDK_DIR = r"D:\Antigravity\ATTENDANCE\tools\jdk-17"
OUT_DIR = r"D:\Antigravity\ATTENDANCE\admin-dashboard\out"

AAPT2 = os.path.join(SDK_DIR, "build-tools", "34.0.0", "aapt2.exe")
D8 = os.path.join(SDK_DIR, "build-tools", "34.0.0", "d8.bat")
ZIPALIGN = os.path.join(SDK_DIR, "build-tools", "34.0.0", "zipalign.exe")
APKSIGNER = os.path.join(SDK_DIR, "build-tools", "34.0.0", "apksigner.bat")
ANDROID_JAR = os.path.join(SDK_DIR, "platforms", "android-34", "android.jar")
JAVAC = os.path.join(JDK_DIR, "bin", "javac.exe")
KEYTOOL = os.path.join(JDK_DIR, "bin", "keytool.exe")

os.environ["JAVA_HOME"] = JDK_DIR
os.environ["PATH"] = os.path.join(JDK_DIR, "bin") + ";" + os.environ["PATH"]

def build():
    if os.path.exists(BUILD_DIR):
        shutil.rmtree(BUILD_DIR)
    os.makedirs(BUILD_DIR, exist_ok=True)
    
    res_dir = os.path.join(BUILD_DIR, "res")
    values_dir = os.path.join(res_dir, "values")
    mipmap_dir = os.path.join(res_dir, "mipmap-hdpi")
    assets_dir = os.path.join(BUILD_DIR, "assets", "www")
    src_dir = os.path.join(BUILD_DIR, "src", "com", "omsairam", "attendancereport")
    obj_dir = os.path.join(BUILD_DIR, "obj")
    dex_dir = os.path.join(BUILD_DIR, "dex")
    
    os.makedirs(values_dir, exist_ok=True)
    os.makedirs(mipmap_dir, exist_ok=True)
    os.makedirs(assets_dir, exist_ok=True)
    os.makedirs(src_dir, exist_ok=True)
    os.makedirs(obj_dir, exist_ok=True)
    os.makedirs(dex_dir, exist_ok=True)
    
    print("1. Copying Web App assets into APK...")
    shutil.copytree(OUT_DIR, assets_dir, dirs_exist_ok=True)
    
    # Copy icons
    icon_src = r"D:\Antigravity\ATTENDANCE\admin-dashboard\public\icon-192.png"
    shutil.copyfile(icon_src, os.path.join(mipmap_dir, "ic_launcher.png"))
    shutil.copyfile(icon_src, os.path.join(mipmap_dir, "ic_launcher_round.png"))
    
    # 2. Write Android resources
    with open(os.path.join(values_dir, "strings.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <string name="app_name">Attendance Report</string>\n</resources>\n')
        
    with open(os.path.join(values_dir, "colors.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="primary">#2563EB</color>\n</resources>\n')
        
    with open(os.path.join(values_dir, "styles.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <style name="AppTheme" parent="android:Theme.Material.Light.NoActionBar">\n        <item name="android:statusBarColor">#2563EB</item>\n    </style>\n</resources>\n')
        
    # 3. Write AndroidManifest.xml
    manifest_path = os.path.join(BUILD_DIR, "AndroidManifest.xml")
    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.omsairam.attendancereport"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:theme="@style/AppTheme"
        android:allowBackup="true"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
''')

    # 4. Write MainActivity.java
    java_file = os.path.join(src_dir, "MainActivity.java")
    with open(java_file, "w", encoding="utf-8") as f:
        f.write('''package com.omsairam.attendancereport;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.content.pm.PackageManager;
import android.graphics.Color;
import java.io.InputStream;

public class MainActivity extends Activity {
    private WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.parseColor("#2563EB"));
        }

        mWebView = new WebView(this);
        setContentView(mWebView);

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);
        settings.setTextZoom(100);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }
        });

        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String path = request.getUrl().getPath();
                if (path != null && path.startsWith("/_next/")) {
                    try {
                        String assetPath = "www" + path;
                        String mime = "application/javascript";
                        if (assetPath.endsWith(".css")) mime = "text/css";
                        else if (assetPath.endsWith(".png")) mime = "image/png";
                        else if (assetPath.endsWith(".json")) mime = "application/json";
                        InputStream stream = getAssets().open(assetPath);
                        return new WebResourceResponse(mime, "UTF-8", stream);
                    } catch (Exception ignored) {}
                }
                return super.shouldInterceptRequest(view, request);
            }
        });

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{
                    android.Manifest.permission.ACCESS_FINE_LOCATION,
                    android.Manifest.permission.ACCESS_COARSE_LOCATION
                }, 101);
            }
        }

        mWebView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
''')

    print("2. Compiling Android resources with aapt2...")
    compiled_res = os.path.join(BUILD_DIR, "compiled_res.zip")
    subprocess.check_call([AAPT2, "compile", "--dir", res_dir, "-o", compiled_res])

    print("3. Linking APK with aapt2...")
    unaligned_apk = os.path.join(BUILD_DIR, "app-unaligned.apk")
    subprocess.check_call([
        AAPT2, "link",
        "-I", ANDROID_JAR,
        compiled_res,
        "--manifest", manifest_path,
        "-A", os.path.join(BUILD_DIR, "assets"),
        "-o", unaligned_apk,
        "--auto-add-overlay"
    ])

    print("4. Compiling Java sources...")
    subprocess.check_call([
        JAVAC,
        "-cp", ANDROID_JAR,
        "-d", obj_dir,
        java_file
    ])

    print("5. Converting bytecode to classes.dex with d8...")
    class_dir = os.path.join(obj_dir, "com", "omsairam", "attendancereport")
    class_files = [os.path.join(class_dir, f) for f in os.listdir(class_dir) if f.endswith(".class")]
    subprocess.check_call([
        D8,
        "--lib", ANDROID_JAR,
        "--output", dex_dir
    ] + class_files)

    print("6. Adding classes.dex to APK...")
    import zipfile
    dex_file = os.path.join(dex_dir, "classes.dex")
    with zipfile.ZipFile(unaligned_apk, "a") as apk_zip:
        apk_zip.write(dex_file, "classes.dex")

    print("7. Aligning APK with zipalign...")
    aligned_apk = os.path.join(BUILD_DIR, "app-aligned.apk")
    subprocess.check_call([ZIPALIGN, "-p", "-f", "4", unaligned_apk, aligned_apk])

    print("8. Generating Keystore & Signing APK with apksigner...")
    keystore = os.path.join(BUILD_DIR, "release.jks")
    if not os.path.exists(keystore):
        subprocess.check_call([
            KEYTOOL, "-genkeypair", "-v",
            "-keystore", keystore,
            "-alias", "attendance",
            "-keyalg", "RSA",
            "-keysize", "2048",
            "-validity", "10000",
            "-storepass", "android",
            "-keypass", "android",
            "-dname", "CN=Attendance Report, OU=HR, O=OMSAIRAM, L=City, ST=State, C=IN"
        ])

    final_apk = os.path.join(BUILD_DIR, "AttendanceReport.apk")
    subprocess.check_call([
        APKSIGNER, "sign",
        "--ks", keystore,
        "--ks-pass", "pass:android",
        "--key-pass", "pass:android",
        "--v1-signing-enabled", "true",
        "--v2-signing-enabled", "true",
        "--v3-signing-enabled", "true",
        "--out", final_apk,
        aligned_apk
    ])

    print(f"9. Verifying signed APK: {final_apk}")
    subprocess.check_call([APKSIGNER, "verify", "--verbose", final_apk])

    size = os.path.getsize(final_apk)
    print(f"SUCCESS! Workable APK Generated: {size} bytes ({size / (1024*1024):.2f} MB)")

    targets = [
        r"D:\Antigravity\ATTENDANCE\AttendanceReport.apk",
        r"D:\Antigravity\ATTENDANCE\admin-dashboard\public\AttendanceReport.apk",
        r"D:\Antigravity\ATTENDANCE\android-app\AttendanceReport.apk"
    ]
    for target in targets:
        shutil.copyfile(final_apk, target)
        print(f"Copied to: {target}")

if __name__ == "__main__":
    build()
