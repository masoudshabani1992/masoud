package com.manoosh.app.core.network

import com.google.gson.Gson
import com.manoosh.app.BuildConfig
import com.manoosh.app.core.common.Config
import com.manoosh.app.core.session.CartSessionManager
import com.manoosh.app.core.session.SessionManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

@Singleton
class CartSessionInterceptor @Inject constructor(
    private val sessions: CartSessionManager
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var request = chain.request()
        sessions.cartKey?.let { key ->
            request = request.newBuilder().header("Cart-Key", key).build()
        }
        sessions.nonce?.let { nonce ->
            request = request.newBuilder().header("Nonce", nonce).build()
        }
        val response = chain.proceed(request)
        val key = response.header("Cart-Key")
        val nonce = response.header("Nonce")
        if (key != null || nonce != null) sessions.update(key, nonce)
        return response
    }
}

@Singleton
class AuthInterceptor @Inject constructor(
    private val session: SessionManager
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val path = request.url.encodedPath
        val needsAuth = path.contains("/wc/v3") ||
            path.contains("/wp/v2/users/me") ||
            path.contains("/manoosh/v1/orders")
        if (!needsAuth) return chain.proceed(request)
        val header = session.basicAuthHeader() ?: return chain.proceed(request)
        return chain.proceed(request.newBuilder().header("Authorization", header).build())
    }
}

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttp(
        cartSessionInterceptor: CartSessionInterceptor,
        authInterceptor: AuthInterceptor
    ): OkHttpClient {
        val builder = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(cartSessionInterceptor)
            .addInterceptor(authInterceptor)
        if (BuildConfig.DEBUG) {
            builder.addInterceptor(
                HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BASIC)
            )
        }
        return builder.build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(client: OkHttpClient, gson: Gson): Retrofit =
        Retrofit.Builder()
            .baseUrl(Config.apiBase())
            .client(client)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()

    @Provides
    @Singleton
    fun provideStoreApi(retrofit: Retrofit): StoreApi = retrofit.create(StoreApi::class.java)

    @Provides
    @Singleton
    fun provideWcV3Api(retrofit: Retrofit): WcV3Api = retrofit.create(WcV3Api::class.java)

    @Provides
    @Singleton
    fun provideManooshApi(retrofit: Retrofit): ManooshApi = retrofit.create(ManooshApi::class.java)
}
