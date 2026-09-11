package com.manoosh.app.core.session

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.Preferences
import androidx.datastore.preferences.preferencesDataStore
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

private val Context.appDataStore by preferencesDataStore(name = "manoosh_prefs")

@Module
@InstallIn(SingletonComponent::class)
object StorageModule {

    @Provides
    @Singleton
    fun provideDataStore(@ApplicationContext context: Context): DataStore<Preferences> =
        context.appDataStore

    @Provides
    @Singleton
    fun provideGson(): Gson = GsonBuilder().setLenient().create()
}
