const baseURL = "http://localhost:3000";

const app = Vue.createApp({
  data() {
    return {
      orders: [],
      restaurant_code: "",
      order_status: "awaiting_confirmation",
      selected_order: null,
      showCancelModal: false,
      cancellationReason: "",
    };
  },
  methods: {
    async getOrders() {
      try {
        const statusQuery =
          this.order_status === "all" ? "" : `?status=${this.order_status}`;

        const response = await fetch(
          `${baseURL}/api/v1/restaurants/${this.restaurant_code}/orders${statusQuery}`
        );

        const data = await response.json();

        if (response.status === 200) {
          this.selected_order = null;
          this.orders = data;
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error("Erro ao buscar pedidos: ", error);
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    formatOrderStatus(status) {
      switch (status) {
        case "awaiting_confirmation":
          return "Aguardando confirmação";
        case "preparing":
          return "Preparando";
        case "canceled":
          return "Cancelado";
        case "ready":
          return "Pronto";
        case "delivered":
          return "Entregue";
        default:
          return status;
      }
    },

    statusClass(status) {
      switch (status) {
        case "awaiting_confirmation":
          return "status-awaiting";
        case "preparing":
          return "status-preparing";
        case "canceled":
          return "status-canceled";
        case "ready":
          return "status-ready";
        case "delivered":
          return "status-delivered";
        default:
          return "";
      }
    },

    backToOrders() {
      this.selected_order = null;
    },

    async viewOrder(order) {
      try {
        const response = await fetch(
          `${baseURL}/api/v1/restaurants/${this.restaurant_code}/orders/${order.code}`
        );

        if (response.status === 200) {
          const data = await response.json();

          this.selected_order = data;
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do pedido: ", error);
      }
    },

    async handleReady(order) {
      try {
        const response = await fetch(
          `${baseURL}/api/v1/restaurants/${this.restaurant_code}/orders/${order.code}/ready`,
          {
            method: "PATCH",
          }
        );

        const data = await response.json();

        if (response.status === 200) {
          this.getOrders();
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error("Erro ao marcar pedido como pronto: ", error);
      }
    },

    async handlePreparing(order) {
      try {
        const response = await fetch(
          `${baseURL}/api/v1/restaurants/${this.restaurant_code}/orders/${order.code}/preparing`,
          {
            method: "PATCH",
          }
        );

        const data = await response.json();

        if (response.status === 200) {
          this.getOrders();
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error("Erro ao aceitar pedido: ", error);
      }
    },

    async handleCancel(order) {
      try {
        const response = await fetch(
          `${baseURL}/api/v1/restaurants/${this.restaurant_code}/orders/${order.code}/cancel`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ reason: this.cancellationReason }),
          }
        );

        const data = await response.json();

        if (response.status == 200) {
          alert("Pedido cancelado com sucesso!");
          this.selected_order.status = "canceled";
          this.cancellationReason = "";
          this.closeCancelModal();
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error("Erro ao cancelar pedido: ", error);
      }
    },

    openCancelModal() {
      this.showCancelModal = true;
    },

    closeCancelModal() {
      this.showCancelModal = false;
      this.cancellationReason = "";
    },
  },
});

app.mount("#app");
