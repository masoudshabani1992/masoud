package com.manoosh.app.core.ui.components

import android.text.method.LinkMovementMethod
import android.widget.TextView
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowLeft
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Inbox
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.text.HtmlCompat
import com.manoosh.app.R
import com.manoosh.app.core.common.fa
import com.manoosh.app.core.common.formatCountdown
import com.manoosh.app.core.common.formatMoney
import com.manoosh.app.core.ui.theme.OfferRed
import kotlinx.coroutines.delay

// ---------- Top bar ----------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ManooshTopBar(
    title: String,
    onBack: (() -> Unit)? = null,
    actions: @Composable () -> Unit = {}
) {
    TopAppBar(
        title = { Text(title, style = MaterialTheme.typography.titleMedium) },
        navigationIcon = {
            if (onBack != null) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.back))
                }
            }
        },
        actions = { actions() }
    )
}

// ---------- Search ----------

@Composable
fun HomeSearchBar(onClick: () -> Unit, modifier: Modifier = Modifier) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surfaceVariant,
        modifier = modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Filled.Search, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.width(8.dp))
            Text(
                stringResource(R.string.search_hint),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

// ---------- Section header ----------

@Composable
fun SectionHeader(
    title: String,
    onSeeAll: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        if (onSeeAll != null) {
            TextButton(onClick = onSeeAll) {
                Text(stringResource(R.string.see_all))
                Icon(Icons.AutoMirrored.Filled.KeyboardArrowLeft, contentDescription = null)
            }
        }
    }
}

// ---------- Price ----------

@Composable
fun PriceText(
    minor: Long?,
    regularMinor: Long?,
    minorUnit: Int,
    suffix: String,
    modifier: Modifier = Modifier,
    large: Boolean = false
) {
    Column(modifier = modifier, horizontalAlignment = Alignment.End) {
        if (regularMinor != null && minor != null && regularMinor > minor && minor > 0) {
            Text(
                text = formatMoney(regularMinor, minorUnit, suffix),
                style = MaterialTheme.typography.bodySmall.copy(
                    textDecoration = TextDecoration.LineThrough,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                ),
                maxLines = 1
            )
        }
        Text(
            text = formatMoney(minor, minorUnit, suffix),
            style = if (large) MaterialTheme.typography.titleLarge else MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@Composable
fun DiscountBadge(percent: Int, modifier: Modifier = Modifier) {
    if (percent <= 0) return
    Surface(
        color = OfferRed,
        contentColor = Color.White,
        shape = RoundedCornerShape(8.dp),
        modifier = modifier
    ) {
        Text(
            text = "٪${percent.fa()}",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}

// ---------- Rating ----------

@Composable
fun RatingRow(rating: Float, reviewCount: Int, modifier: Modifier = Modifier) {
    Row(modifier = modifier, verticalAlignment = Alignment.CenterVertically) {
        Icon(
            Icons.Filled.Star,
            contentDescription = null,
            tint = Color(0xFFF5A623),
            modifier = Modifier.size(14.dp)
        )
        Spacer(Modifier.width(4.dp))
        Text(
            text = String.format("%.1f", rating).replace('.', '/'),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        if (reviewCount > 0) {
            Text(
                text = " (${reviewCount.fa()})",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

// ---------- Quantity stepper ----------

@Composable
fun QuantityStepper(
    quantity: Int,
    maxQty: Int,
    onChange: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        IconButton(
            onClick = { if (quantity < maxQty) onChange(quantity + 1) },
            modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.primaryContainer)
        ) {
            Icon(Icons.Filled.Add, contentDescription = null)
        }
        Text(
            quantity.fa(),
            style = MaterialTheme.typography.titleMedium,
            modifier = Modifier.width(32.dp),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        IconButton(
            onClick = { if (quantity > 0) onChange(quantity - 1) },
            modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.primaryContainer)
        ) {
            Icon(Icons.Filled.Remove, contentDescription = null)
        }
    }
}

// ---------- Countdown ----------

@Composable
fun CountdownChip(deadlineMillis: Long, modifier: Modifier = Modifier) {
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(Unit) {
        while (true) {
            delay(1000)
            now = System.currentTimeMillis()
        }
    }
    val remaining = ((deadlineMillis - now) / 1000).coerceAtLeast(0)
    Surface(color = OfferRed, contentColor = Color.White, shape = RoundedCornerShape(8.dp), modifier = modifier) {
        Text(
            formatCountdown(remaining),
            style = MaterialTheme.typography.labelLarge,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
        )
    }
}

// ---------- Loading skeletons ----------

@Composable
fun ShimmerBox(modifier: Modifier = Modifier) {
    val transition = rememberInfiniteTransition(label = "shimmer")
    val alpha by transition.animateFloat(
        initialValue = 0.35f,
        targetValue = 0.9f,
        animationSpec = infiniteRepeatable(tween(900), RepeatMode.Reverse),
        label = "alpha"
    )
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = alpha))
    )
}

@Composable
fun LoadingGrid(modifier: Modifier = Modifier) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = modifier.fillMaxSize(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(12.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(6) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                ShimmerBox(Modifier.fillMaxWidth().height(150.dp))
                ShimmerBox(Modifier.fillMaxWidth().height(14.dp))
                ShimmerBox(Modifier.fillMaxWidth(0.6f).height(14.dp))
            }
        }
    }
}

@Composable
fun LoadingBox(modifier: Modifier = Modifier) {
    Box(modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator()
    }
}

// ---------- Empty / error states ----------

@Composable
fun EmptyState(
    title: String,
    hint: String = "",
    icon: ImageVector = Icons.Filled.Inbox,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(icon, contentDescription = null, modifier = Modifier.size(64.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(12.dp))
        Text(title, style = MaterialTheme.typography.titleMedium)
        if (hint.isNotEmpty()) {
            Spacer(Modifier.height(4.dp))
            Text(hint, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        if (actionLabel != null && onAction != null) {
            Spacer(Modifier.height(16.dp))
            Button(onClick = onAction) { Text(actionLabel) }
        }
    }
}

@Composable
fun ErrorState(
    message: String,
    isNetwork: Boolean,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(32.dp)
            .clickable { onRetry() },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            if (isNetwork) Icons.Filled.CloudOff else Icons.Filled.ErrorOutline,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.error
        )
        Spacer(Modifier.height(12.dp))
        Text(
            if (isNetwork) stringResource(R.string.error_network) else message.ifBlank { stringResource(R.string.error_server) },
            style = MaterialTheme.typography.bodyLarge
        )
        Spacer(Modifier.height(16.dp))
        OutlinedButton(onClick = onRetry) { Text(stringResource(R.string.retry)) }
    }
}

// ---------- HTML text ----------

@Composable
fun HtmlText(
    html: String,
    modifier: Modifier = Modifier,
    style: TextStyle = MaterialTheme.typography.bodyMedium,
    color: Color = MaterialTheme.colorScheme.onSurface
) {
    val colorInt = color.toArgb()
    val sizeSp = style.fontSize.value
    AndroidView(
        modifier = modifier.fillMaxWidth(),
        factory = { ctx ->
            TextView(ctx).apply {
                movementMethod = LinkMovementMethod.getInstance()
                setLineSpacing(8f, 1.15f)
            }
        },
        update = { tv ->
            tv.text = HtmlCompat.fromHtml(html, HtmlCompat.FROM_HTML_MODE_LEGACY)
            tv.setTextColor(colorInt)
            tv.textSize = sizeSp
        }
    )
}
