import axiosClient from "./axiosClient";

const orderApi = {
    // --- CLIENT ---
    createOrder: (data) => {
        return axiosClient.post('/orders', data);
    },
    getMyOrders: () => {
        return axiosClient.get('/orders/my-orders'); // Lưu ý: Backend đã đổi route này thành /my-orders
    },
    getOrderById: (orderId) => {
        return axiosClient.get(`/orders/${orderId}`);
    },

    // --- ADMIN ---
    getAllOrders: (params) => {
        // params: { page, limit, status }
        return axiosClient.get('/orders/admin/all', { params });
    },
    updateOrderStatus: (orderId, status) => {
        return axiosClient.put(`/orders/admin/${orderId}/status`, { status });
    }
};

export default orderApi;