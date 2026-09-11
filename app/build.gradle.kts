import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
    alias(libs.plugins.hilt)
    alias(libs.plugins.ksp)
}

// Read optional overrides from local.properties (see local.properties.example).
val localProps = Properties().apply {
    val file = rootProject.file("local.properties")
    if (file.exists()) file.inputStream().use(::load)
}
val baseUrl: String = localProps.getProperty("manoosh.baseUrl", "https://manooshorganic.com").trimEnd('/')
val wcKey: String = localProps.getProperty("manoosh.wcKey", "")
val wcSecret: String = localProps.getProperty("manoosh.wcSecret", "")

android {
    namespace = "com.manoosh.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.manoosh.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        buildConfigField("String", "BASE_URL", "\"$baseUrl\"")
        buildConfigField("String", "WC_CONSUMER_KEY", "\"$wcKey\"")
        buildConfigField("String", "WC_CONSUMER_SECRET", "\"$wcSecret\"")
    }

    signingConfigs {
        create("release") {
            // Filled from environment variables on CI (see .github/workflows/android.yml).
            // For local release builds, define these in ~/.gradle/gradle.properties.
            storeFile = System.getenv("KEYSTORE_PATH")?.let { file(it) }
            storePassword = System.getenv("KEYSTORE_PASSWORD")
            keyAlias = System.getenv("KEY_ALIAS")
            keyPassword = System.getenv("KEY_PASSWORD")
        }
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            isMinifyEnabled = false
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // Only sign when a keystore is actually provided (CI / local release setup).
            if (System.getenv("KEYSTORE_PATH") != null) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation(libs.core.ktx)
    implementation(libs.lifecycle.runtime.ktx)
    implementation(libs.lifecycle.viewmodel.compose)
    implementation(libs.lifecycle.viewmodel.ktx)
    implementation(libs.lifecycle.runtime.compose)
    implementation(libs.activity.compose)
    implementation(libs.splashscreen)
    implementation(libs.browser)
    implementation(libs.webkit)

    // Compose
    implementation(platform(libs.compose.bom))
    implementation(libs.compose.ui)
    implementation(libs.compose.ui.graphics)
    implementation(libs.compose.ui.tooling.preview)
    implementation(libs.compose.material3)
    implementation(libs.compose.material.icons)
    implementation(libs.compose.foundation.pager)
    implementation(libs.navigation.compose)
    implementation(libs.hilt.navigation.compose)

    // Hilt (via kapt)
    implementation(libs.hilt.android)
    kapt(libs.hilt.compiler)

    // Room (via KSP)
    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.compiler)

    // Storage
    implementation(libs.datastore.preferences)
    implementation(libs.security.crypto)

    // Network
    implementation(libs.retrofit)
    implementation(libs.retrofit.gson)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.gson)

    // Images & coroutines
    implementation(libs.coil.compose)
    implementation(libs.coroutines.android)

    testImplementation(libs.junit)
}

ksp {
    arg("room.generateKotlin", "true")
}
