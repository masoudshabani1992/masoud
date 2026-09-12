package com.manoosh.app.core.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.unit.dp

/**
 * Corner radius for all product/banner images across the app.
 * Brand requirement: 5px rounded image corners.
 */
val ImageShape = RoundedCornerShape(5.dp)

/** Top-only variant for images sitting at the top of a card. */
val ImageTopShape = RoundedCornerShape(topStart = 5.dp, topEnd = 5.dp)
