// Client & health
export {
  apiFetch,
  checkBackendHealth,
  setMaintenanceModeCallback,
  type ApiError,
} from "./client";

// Auth
export {
  loginApi,
  registerApi,
  sendVerificationCodeApi,
  confirmEmailApi,
  getProfileApi,
  updateProfileApi,
  changePasswordApi,
  forgotPasswordApi,
  resetPasswordApi,
  refreshTokenApi,
  registerAdminApi,
  type AuthUser,
  type AuthResponse,
  type ProfileResponse,
} from "./auth";

// Payments
export {
  createCulqiOrderApi,
  createCulqiChargeApi,
  getPaymentStatusApi,
  createCulqiRefundApi,
  createPaymentPreferenceApi,
  type CulqiOrderResponse,
  type CulqiChargePayload,
  type CulqiChargeResponse,
  type PaymentStatusResponse,
  type CulqiRefundPayload,
  type CulqiRefundResponse,
  type CreatePreferenceResponse,
} from "./payments";

// Orders
export {
  createOrderApi,
  listOrdersApi,
  getOrderApi,
  updateOrderStatusApi,
  cancelOrderApi,
  updatePaymentMethodApi,
  getOrderWithDetailsApi,
  getOrderByNumberApi,
  getMyOrderByNumberApi,
  type OrderDto,
  type CreateOrderItemPayload,
  type CreateOrderPayload,
  type ListOrdersResponse,
  type OrderEstadoPedido,
  type OrderDetailDto,
} from "./orders";

// Notifications
export {
  getOrderNotificationsApi,
  sendNotificationApi,
  sendTestNotificationApi,
  type NotificationDto,
  type TipoNotificacion,
} from "./notifications";

// Reports
export {
  getSalesStatsApi,
  getSalesReportApi,
  getTopProductsApi,
  getProductSalesApi,
  type SalesStatsResponse,
  type SalesReportItem,
  type SalesReportResponse,
  type TopProduct,
  type ProductSalesReport,
} from "./reports";

// Categories
export {
  listCategoriesApi,
  getCategoryByIdApi,
  listCategoriesPublicApi,
  createCategoryApi,
  updateCategoryApi,
  toggleCategoryActiveApi,
  deleteCategoryApi,
  type CategoryDto,
  type CreateCategoryPayload,
} from "./categories";

// Products (admin + public + images)
export {
  listProductsApi,
  countProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  updateProductStockApi,
  uploadProductImageApi,
  deleteImageApi,
  reorderImageApi,
  getProductsPublicApi,
  getProductByIdApi,
  type ProductDto,
  type CreateProductPayload,
  type ProductImageDto,
  type ProductWithImagesDto,
} from "./products";

// Addresses
export {
  getAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultAddressApi,
  type AddressDto,
} from "./addresses";
