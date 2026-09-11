package com.manoosh.app.data.repository

import com.manoosh.app.core.common.ApiResult
import com.manoosh.app.core.common.Constants
import com.manoosh.app.core.common.safeCall
import com.manoosh.app.core.network.ManooshApi
import com.manoosh.app.core.network.OtpRequestBody
import com.manoosh.app.core.network.OtpResponse
import com.manoosh.app.core.network.OtpVerifyBody
import com.manoosh.app.core.session.SessionManager
import com.manoosh.app.core.session.SessionState
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow

@Singleton
class AuthRepository @Inject constructor(
    private val api: ManooshApi,
    private val session: SessionManager
) {
    val sessionFlow: Flow<SessionState> = session.sessionFlow

    suspend fun requestOtp(rawPhone: String): ApiResult<OtpResponse> {
        val phone = Constants.normalizePhone(rawPhone)
        if (!Constants.isValidIranMobile(phone)) {
            return ApiResult.Error("invalid_mobile")
        }
        return safeCall { api.otpRequest(OtpRequestBody(phone)) }
    }

    suspend fun verifyOtp(rawPhone: String, code: String): ApiResult<SessionState> {
        val phone = Constants.normalizePhone(rawPhone)
        val res = safeCall { api.otpVerify(OtpVerifyBody(phone, code.trim())) }
        return when (res) {
            is ApiResult.Success -> {
                val body = res.data
                if (!body.success) {
                    ApiResult.Error(body.message ?: "کد تایید نامعتبر است")
                } else {
                    val appPassword = body.appPassword
                    val username = body.username
                    val user = body.user
                    if (appPassword.isNullOrBlank() || username.isNullOrBlank() || user == null) {
                        ApiResult.Error("پاسخ سرور نامعتبر است")
                    } else {
                        session.saveWpLogin(username)
                        session.saveSession(
                            userId = user.id,
                            userName = user.name?.takeIf { it.isNotBlank() } ?: phone,
                            phone = user.phone?.takeIf { it.isNotBlank() } ?: phone,
                            customerId = body.customerId ?: 0L,
                            wpLogin = username,
                            appPassword = appPassword
                        )
                        ApiResult.Success(
                            SessionState(
                                loggedIn = true,
                                userId = user.id,
                                userName = user.name ?: phone,
                                phone = phone,
                                customerId = body.customerId ?: 0L
                            )
                        )
                    }
                }
            }
            is ApiResult.Error -> res
        }
    }

    suspend fun logout() = session.logout()
}
