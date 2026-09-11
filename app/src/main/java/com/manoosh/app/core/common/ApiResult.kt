package com.manoosh.app.core.common

import com.google.gson.Gson
import com.google.gson.JsonObject
import java.io.IOException
import retrofit2.HttpException

sealed interface ApiResult<out T> {
    data class Success<T>(val data: T) : ApiResult<T>
    data class Error(val message: String, val isNetwork: Boolean = false, val code: Int? = null) : ApiResult<Nothing>

    val isSuccess: Boolean get() = this is Success
    fun getOrNull(): T? = (this as? Success)?.data
    fun <R> map(transform: (T) -> R): ApiResult<R> = when (this) {
        is Success -> Success(transform(data))
        is Error -> this
    }
}

private val gsonLenient = Gson()

suspend fun <T> safeCall(block: suspend () -> T): ApiResult<T> {
    return try {
        ApiResult.Success(block())
    } catch (e: HttpException) {
        ApiResult.Error(friendlyHttpMessage(e), isNetwork = false, code = e.code())
    } catch (e: IOException) {
        ApiResult.Error(e.message ?: "network", isNetwork = true)
    } catch (e: Exception) {
        ApiResult.Error(e.message ?: "unknown")
    }
}

private fun friendlyHttpMessage(e: HttpException): String {
    return try {
        val body = e.response()?.errorBody()?.string()
        if (!body.isNullOrBlank()) {
            val obj = gsonLenient.fromJson(body, JsonObject::class.java)
            obj?.get("message")?.asString?.takeIf { it.isNotBlank() } ?: "خطای سرور (${e.code()})"
        } else {
            "خطای سرور (${e.code()})"
        }
    } catch (_: Exception) {
        "خطای سرور (${e.code()})"
    }
}
