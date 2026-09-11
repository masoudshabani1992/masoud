package com.manoosh.app.core.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddShoppingCart
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.manoosh.app.R
import com.manoosh.app.domain.Product

@Composable
fun ProductCard(
    product: Product,
    onClick: () -> Unit,
    onAdd: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = modifier
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
            ) {
                AsyncImage(
                    model = product.mainImage,
                    contentDescription = product.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.matchParentSize()
                )
                if (product.discountPercent > 0) {
                    DiscountBadge(
                        product.discountPercent,
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .padding(8.dp)
                    )
                }
                if (!product.inStock) {
                    Box(
                        modifier = Modifier
                            .matchParentSize()
                            .background(Color.Black.copy(alpha = 0.45f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            stringResource(R.string.out_of_stock),
                            color = Color.White,
                            style = MaterialTheme.typography.labelLarge
                        )
                    }
                }
            }
            Column(modifier = Modifier.padding(8.dp)) {
                Text(
                    product.name,
                    style = MaterialTheme.typography.bodySmall,
                    maxLines = 2,
                    minLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                if (product.reviewCount > 0) {
                    RatingRow(product.rating, product.reviewCount, modifier = Modifier.padding(top = 2.dp))
                } else {
                    Spacer(Modifier.height(16.dp))
                }
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    PriceText(
                        minor = product.priceMinor,
                        regularMinor = product.regularMinor,
                        minorUnit = product.minorUnit,
                        suffix = product.currencySuffix,
                        modifier = Modifier.weight(1f)
                    )
                    if (onAdd != null && product.inStock && product.purchasable) {
                        IconButton(
                            onClick = onAdd,
                            colors = IconButtonDefaults.iconButtonColors(
                                containerColor = MaterialTheme.colorScheme.primaryContainer,
                                contentColor = MaterialTheme.colorScheme.onPrimaryContainer
                            ),
                            modifier = Modifier.size(34.dp)
                        ) {
                            Icon(Icons.Filled.AddShoppingCart, contentDescription = stringResource(R.string.add_to_cart))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ProductGrid(
    products: List<Product>,
    onProductClick: (Product) -> Unit,
    onAdd: ((Product) -> Unit)? = null,
    onRemove: ((Product) -> Unit)? = null,
    hasMore: Boolean = false,
    isLoadingMore: Boolean = false,
    onLoadMore: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = modifier,
        contentPadding = PaddingValues(12.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(products, key = { it.id }) { product ->
            ProductCard(
                product = product,
                onClick = { onProductClick(product) },
                onAdd = onAdd?.let { { it(product) } },
                onRemove = onRemove?.let { { it(product) } }
            )
        }
        if (hasMore) {
            item(span = { GridItemSpan(2) }) {
                Box(Modifier.fillMaxWidth().padding(8.dp), contentAlignment = Alignment.Center) {
                    if (isLoadingMore) CircularProgressIndicator(modifier = Modifier.size(28.dp))
                    else Spacer(Modifier.height(8.dp))
                }
                LaunchedEffect(products.size) { onLoadMore() }
            }
        }
    }
}

@Composable
fun ProductRail(
    title: String,
    products: List<Product>,
    onProductClick: (Product) -> Unit,
    onAdd: ((Product) -> Unit)? = null,
    onSeeAll: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    if (products.isEmpty()) return
    Column(modifier = modifier) {
        SectionHeader(title = title, onSeeAll = onSeeAll)
        LazyRow(
            contentPadding = PaddingValues(horizontal = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(products, key = { it.id }) { product ->
                ProductCard(
                    product = product,
                    onClick = { onProductClick(product) },
                    onAdd = onAdd?.let { { it(product) } },
                    modifier = Modifier.width(160.dp)
                )
            }
        }
    }
}
