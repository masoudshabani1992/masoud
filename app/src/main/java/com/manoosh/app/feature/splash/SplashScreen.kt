package com.manoosh.app.feature.splash

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.manoosh.app.R
import com.manoosh.app.core.ui.theme.ManooshYellow
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(onDone: () -> Unit) {
    LaunchedEffect(Unit) {
        delay(1400)
        onDone()
    }
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Image(
                painter = painterResource(R.drawable.brand_wordmark),
                contentDescription = "مانوش",
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 48.dp),
                contentScale = ContentScale.FillWidth
            )
            Spacer(Modifier.height(24.dp))
            Text(
                "فروشگاه محصولات ارگانیک",
                style = MaterialTheme.typography.titleMedium,
                color = ManooshYellow
            )
        }
    }
}
