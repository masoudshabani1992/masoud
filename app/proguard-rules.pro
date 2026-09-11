# Keep API models (Gson reflection)
-keep class com.manoosh.app.core.network.** { *; }
-keep class com.manoosh.app.domain.** { *; }
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepattributes RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations

# Gson
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Retrofit / OkHttp
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# Coil
-dontwarn coil3.**
-keep class coil.** { *; }

# Room
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *

# Hilt
-keep class dagger.hilt.** { *; }
-keep class javax.inject.** { *; }
