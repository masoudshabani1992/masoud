package com.manoosh.app.feature.navigation

import android.net.Uri
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.outlined.GridView
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.navArgument
import com.manoosh.app.R
import com.manoosh.app.core.common.fa
import com.manoosh.app.core.session.UserPrefs
import com.manoosh.app.data.repository.CartRepository
import com.manoosh.app.feature.addresses.AddressesScreen
import com.manoosh.app.feature.auth.AuthOtpScreen
import com.manoosh.app.feature.auth.AuthPhoneScreen
import com.manoosh.app.feature.browse.BrowseScreen
import com.manoosh.app.feature.cart.CartScreen
import com.manoosh.app.feature.categories.CategoriesScreen
import com.manoosh.app.feature.checkout.CheckoutScreen
import com.manoosh.app.feature.checkout.OrderSuccessScreen
import com.manoosh.app.feature.favorites.FavoritesScreen
import com.manoosh.app.feature.home.HomeScreen
import com.manoosh.app.feature.orders.OrderDetailScreen
import com.manoosh.app.feature.orders.OrdersScreen
import com.manoosh.app.feature.payment.PaymentWebViewScreen
import com.manoosh.app.feature.product.ProductScreen
import com.manoosh.app.feature.profile.ProfileScreen
import com.manoosh.app.feature.search.SearchScreen
import com.manoosh.app.feature.settings.SettingsScreen
import com.manoosh.app.feature.splash.SplashScreen
import com.manoosh.app.feature.web.WebScreen
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import androidx.lifecycle.viewModelScope

// ---------- Deep links ----------

sealed interface PendingDeepLink {
    data class ProductId(val id: Long) : PendingDeepLink
    data class ProductSlug(val slug: String) : PendingDeepLink
}

// ---------- Routes ----------

object Routes {
    const val SPLASH = "splash"
    const val HOME = "home"
    const val CATEGORIES = "categories"
    const val BROWSE = "browse"
    const val PRODUCT = "product"
    const val PRODUCT_SLUG = "productSlug"
    const val SEARCH = "search"
    const val CART = "cart"
    const val CHECKOUT = "checkout"
    const val PAYMENT = "payment"
    const val ORDER_SUCCESS = "orderSuccess"
    const val AUTH_PHONE = "authPhone"
    const val AUTH_OTP = "authOtp"
    const val PROFILE = "profile"
    const val ORDERS = "orders"
    const val ORDER_DETAIL = "orderDetail"
    const val FAVORITES = "favorites"
    const val ADDRESSES = "addresses"
    const val SETTINGS = "settings"
    const val WEB = "web"

    fun browse(categoryId: Long? = null, title: String = "", onSale: Boolean = false, query: String = ""): String =
        "$BROWSE?categoryId=${categoryId ?: -1}&title=${Uri.encode(title)}&onSale=$onSale&query=${Uri.encode(query)}"

    fun product(id: Long) = "$PRODUCT/$id"
    fun productSlug(slug: String) = "$PRODUCT_SLUG/${Uri.encode(slug)}"
    fun payment(orderId: Long, url: String, key: String) =
        "$PAYMENT?orderId=$orderId&url=${Uri.encode(url)}&key=${Uri.encode(key)}"
    fun orderSuccess(orderId: Long) = "$ORDER_SUCCESS/$orderId"
    fun authOtp(phone: String) = "$AUTH_OTP/${Uri.encode(phone)}"
    fun orderDetail(id: Long) = "$ORDER_DETAIL/$id"
    fun web(title: String, url: String) = "$WEB?title=${Uri.encode(title)}&url=${Uri.encode(url)}"
}

// ---------- Shared VMs ----------

@HiltViewModel
class MainViewModel @Inject constructor(cartRepository: CartRepository) : ViewModel() {
    val cartCount: StateFlow<Int> = cartRepository.count.stateIn(
        scope = kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.Main.immediate + kotlinx.coroutines.SupervisorJob()),
        started = SharingStarted.Eagerly,
        initialValue = 0
    )

    init {
        // Warm up the cart so the badge is correct on first paint.
        viewModelScopeCompat().launch { cartRepository.refresh() }
    }

    private fun viewModelScopeCompat() =
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.Main.immediate + kotlinx.coroutines.SupervisorJob())
}

@HiltViewModel
class ThemeViewModel @Inject constructor(userPrefs: UserPrefs) : ViewModel() {
    val theme: StateFlow<Int> = userPrefs.themeFlow.stateIn(
        scope = kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.Main.immediate + kotlinx.coroutines.SupervisorJob()),
        started = SharingStarted.Eagerly,
        initialValue = 0
    )
}

// ---------- Bottom nav ----------

private data class BottomItem(
    val route: String,
    val labelRes: Int,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
)

private val bottomItems = listOf(
    BottomItem(Routes.HOME, R.string.nav_home, Icons.Filled.Home, Icons.Outlined.Home),
    BottomItem(Routes.CATEGORIES, R.string.nav_categories, Icons.Filled.GridView, Icons.Outlined.GridView),
    BottomItem(Routes.CART, R.string.nav_cart, Icons.Filled.ShoppingCart, Icons.Outlined.ShoppingCart),
    BottomItem(Routes.PROFILE, R.string.nav_profile, Icons.Filled.Person, Icons.Outlined.Person)
)

// ---------- Scaffold + NavHost ----------

@Composable
fun AppScaffold(
    navController: NavHostController,
    deepLink: PendingDeepLink?,
    onDeepLinkConsumed: () -> Unit
) {
    val mainVm: MainViewModel = hiltViewModel()
    val cartCount by mainVm.cartCount.collectAsStateWithLifecycle()

    LaunchedEffect(deepLink) {
        deepLink?.let {
            when (it) {
                is PendingDeepLink.ProductId -> navController.navigate(Routes.product(it.id))
                is PendingDeepLink.ProductSlug -> navController.navigate(Routes.productSlug(it.slug))
            }
            onDeepLinkConsumed()
        }
    }

    val backStack by navController.currentBackStackEntryAsState()
    val currentRoute = backStack?.destination?.route
    val showBottomBar = currentRoute in listOf(Routes.HOME, Routes.CATEGORIES, Routes.CART, Routes.PROFILE)

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    bottomItems.forEach { item ->
                        val selected = currentRoute == item.route
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                navController.navigate(item.route) {
                                    popUpTo(Routes.HOME) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = {
                                if (item.route == Routes.CART && cartCount > 0) {
                                    BadgedBox(badge = { Badge { Text(cartCount.fa()) } }) {
                                        Icon(if (selected) item.selectedIcon else item.unselectedIcon, contentDescription = null)
                                    }
                                } else {
                                    Icon(if (selected) item.selectedIcon else item.unselectedIcon, contentDescription = null)
                                }
                            },
                            label = { Text(stringResource(item.labelRes)) }
                        )
                    }
                }
            }
        }
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = Routes.SPLASH,
            modifier = Modifier.padding(padding)
        ) {
            composable(Routes.SPLASH) {
                SplashScreen(onDone = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.SPLASH) { inclusive = true }
                    }
                })
            }
            composable(Routes.HOME) {
                HomeScreen(
                    onProductClick = { navController.navigate(Routes.product(it)) },
                    onBrowse = { id, title, onSale -> navController.navigate(Routes.browse(id, title, onSale)) },
                    onSearchClick = { navController.navigate(Routes.SEARCH) },
                    onOpenUrl = { title, url -> navController.navigate(Routes.web(title, url)) }
                )
            }
            composable(Routes.CATEGORIES) {
                CategoriesScreen(
                    onBrowse = { id, title -> navController.navigate(Routes.browse(id, title)) },
                    onSearchClick = { navController.navigate(Routes.SEARCH) }
                )
            }
            composable(
                route = "${Routes.BROWSE}?categoryId={categoryId}&title={title}&onSale={onSale}&query={query}",
                arguments = listOf(
                    navArgument("categoryId") { type = NavType.LongType; defaultValue = -1L },
                    navArgument("title") { type = NavType.StringType; defaultValue = "" },
                    navArgument("onSale") { type = NavType.BoolType; defaultValue = false },
                    navArgument("query") { type = NavType.StringType; defaultValue = "" }
                )
            ) {
                BrowseScreen(
                    onBack = { navController.popBackStack() },
                    onProductClick = { navController.navigate(Routes.product(it)) }
                )
            }
            composable(
                route = "${Routes.PRODUCT}/{id}",
                arguments = listOf(navArgument("id") { type = NavType.LongType })
            ) { entry ->
                ProductScreen(
                    productId = entry.arguments?.getLong("id") ?: 0L,
                    slug = null,
                    onBack = { navController.popBackStack() },
                    onProductClick = { navController.navigate(Routes.product(it)) },
                    onCartClick = { navController.navigate(Routes.CART) },
                    onLoginClick = { navController.navigate(Routes.AUTH_PHONE) }
                )
            }
            composable(
                route = "${Routes.PRODUCT_SLUG}/{slug}",
                arguments = listOf(navArgument("slug") { type = NavType.StringType })
            ) { entry ->
                ProductScreen(
                    productId = 0L,
                    slug = entry.arguments?.getString("slug"),
                    onBack = { navController.popBackStack() },
                    onProductClick = { navController.navigate(Routes.product(it)) },
                    onCartClick = { navController.navigate(Routes.CART) },
                    onLoginClick = { navController.navigate(Routes.AUTH_PHONE) }
                )
            }
            composable(Routes.SEARCH) {
                SearchScreen(
                    onBack = { navController.popBackStack() },
                    onProductClick = { navController.navigate(Routes.product(it)) },
                    onSubmitQuery = { q -> navController.navigate(Routes.browse(query = q)) }
                )
            }
            composable(Routes.CART) {
                CartScreen(
                    onProductClick = { navController.navigate(Routes.product(it)) },
                    onCheckout = { navController.navigate(Routes.CHECKOUT) },
                    onBrowse = { navController.navigate(Routes.browse(title = "")) },
                    onLoginClick = { navController.navigate(Routes.AUTH_PHONE) }
                )
            }
            composable(Routes.CHECKOUT) {
                CheckoutScreen(
                    onBack = { navController.popBackStack() },
                    onPaid = { orderId -> navController.navigate(Routes.orderSuccess(orderId)) },
                    onPayOnline = { orderId, url, key -> navController.navigate(Routes.payment(orderId, url, key)) },
                    onLoginClick = { navController.navigate(Routes.AUTH_PHONE) }
                )
            }
            composable(
                route = "${Routes.PAYMENT}?orderId={orderId}&url={url}&key={key}",
                arguments = listOf(
                    navArgument("orderId") { type = NavType.LongType; defaultValue = 0L },
                    navArgument("url") { type = NavType.StringType; defaultValue = "" },
                    navArgument("key") { type = NavType.StringType; defaultValue = "" }
                )
            ) {
                PaymentWebViewScreen(
                    onBack = { navController.popBackStack() },
                    onSuccess = { orderId ->
                        navController.navigate(Routes.orderSuccess(orderId)) {
                            popUpTo(Routes.CART) { inclusive = false }
                        }
                    }
                )
            }
            composable(
                route = "${Routes.ORDER_SUCCESS}/{orderId}",
                arguments = listOf(navArgument("orderId") { type = NavType.LongType })
            ) { entry ->
                OrderSuccessScreen(
                    orderId = entry.arguments?.getLong("orderId") ?: 0L,
                    onTrackOrder = { navController.navigate(Routes.ORDERS) },
                    onHome = {
                        navController.navigate(Routes.HOME) {
                            popUpTo(Routes.HOME) { inclusive = true }
                        }
                    }
                )
            }
            composable(Routes.AUTH_PHONE) {
                AuthPhoneScreen(
                    onBack = { navController.popBackStack() },
                    onCodeSent = { phone -> navController.navigate(Routes.authOtp(phone)) }
                )
            }
            composable(
                route = "${Routes.AUTH_OTP}/{phone}",
                arguments = listOf(navArgument("phone") { type = NavType.StringType })
            ) { entry ->
                AuthOtpScreen(
                    phone = entry.arguments?.getString("phone").orEmpty(),
                    onBack = { navController.popBackStack() },
                    onVerified = {
                        navController.navigate(Routes.PROFILE) {
                            popUpTo(Routes.HOME) { inclusive = false }
                        }
                    }
                )
            }
            composable(Routes.PROFILE) {
                ProfileScreen(
                    onLoginClick = { navController.navigate(Routes.AUTH_PHONE) },
                    onOrders = { navController.navigate(Routes.ORDERS) },
                    onFavorites = { navController.navigate(Routes.FAVORITES) },
                    onAddresses = { navController.navigate(Routes.ADDRESSES) },
                    onSettings = { navController.navigate(Routes.SETTINGS) },
                    onOpenUrl = { title, url -> navController.navigate(Routes.web(title, url)) }
                )
            }
            composable(Routes.ORDERS) {
                OrdersScreen(
                    onBack = { navController.popBackStack() },
                    onOrderClick = { navController.navigate(Routes.orderDetail(it)) },
                    onLoginClick = { navController.navigate(Routes.AUTH_PHONE) }
                )
            }
            composable(
                route = "${Routes.ORDER_DETAIL}/{id}",
                arguments = listOf(navArgument("id") { type = NavType.LongType })
            ) { entry ->
                OrderDetailScreen(
                    orderId = entry.arguments?.getLong("id") ?: 0L,
                    onBack = { navController.popBackStack() },
                    onPay = { id, url, key -> navController.navigate(Routes.payment(id, url, key)) }
                )
            }
            composable(Routes.FAVORITES) {
                FavoritesScreen(
                    onBack = { navController.popBackStack() },
                    onProductClick = { navController.navigate(Routes.product(it)) }
                )
            }
            composable(Routes.ADDRESSES) {
                AddressesScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.SETTINGS) {
                SettingsScreen(
                    onBack = { navController.popBackStack() },
                    onOpenUrl = { title, url -> navController.navigate(Routes.web(title, url)) }
                )
            }
            composable(
                route = "${Routes.WEB}?title={title}&url={url}",
                arguments = listOf(
                    navArgument("title") { type = NavType.StringType; defaultValue = "" },
                    navArgument("url") { type = NavType.StringType; defaultValue = "" }
                )
            ) {
                WebScreen(onBack = { navController.popBackStack() })
            }
        }
    }
}
