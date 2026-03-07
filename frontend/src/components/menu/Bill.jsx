import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTotalPrice } from "../../redux/slices/cartSlice";
import { addOrder } from "../../https";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";

const Bill = ({ order }) => {
  const dispatch = useDispatch();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);

  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

  const [paymentMethod, setPaymentMethod] = useState();
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState();

  const orderMutation = useMutation({
    mutationFn: addOrder,
    onSuccess: (resData) => {
      const { data } = resData.data;

      setOrderInfo(data);

      enqueueSnackbar("Order Placed!", { variant: "success" });

      dispatch(removeCustomer());
      dispatch(removeAllItems());

      setShowInvoice(true);
    },
    onError: () => {
      enqueueSnackbar("Order Failed!", { variant: "error" });
    },
  });

  const handlePlaceOrder = () => {
    if (!paymentMethod) {
      enqueueSnackbar("Please select payment method!", {
        variant: "warning",
      });
      return;
    }

    if (cartData.length === 0) {
      enqueueSnackbar("Please add items to order!", {
        variant: "warning",
      });
      return;
    }

    const orderData = {
      customerDetails: {
        name: customerData.customerName,
        phone: customerData.customerPhone,
        guests: customerData.guests,
      },
      orderStatus: "In Progress",
      bills: {
        total,
        tax,
        totalWithTax: totalPriceWithTax,
      },
      items: cartData,
      tableId: customerData.table?.tableId,
      paymentMethod,
    };

    orderMutation.mutate(orderData);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold text-lg mb-4">Bill Details</h3>
      
      {/* Bill Items Summary */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Subtotal</span>
          <span className="text-white font-medium">₹{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Tax ({taxRate}%)</span>
          <span className="text-white font-medium">₹{tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-700 my-2 pt-2">
          <div className="flex justify-between text-base">
            <span className="text-white font-semibold">Total</span>
            <span className="text-yellow-400 font-bold">₹{totalPriceWithTax.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-2">
        <p className="text-gray-400 text-xs">Select Payment Method</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPaymentMethod("Cash")}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition ${
              paymentMethod === "Cash"
                ? "bg-yellow-400 text-black"
                : "bg-[#262626] text-gray-400 hover:bg-[#2f2f2f] border border-gray-700"
            }`}
          >
            Cash
          </button>

          <button
            onClick={() => setPaymentMethod("Online")}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition ${
              paymentMethod === "Online"
                ? "bg-yellow-400 text-black"
                : "bg-[#262626] text-gray-400 hover:bg-[#2f2f2f] border border-gray-700"
            }`}
          >
            Online
          </button>
        </div>
      </div>

      {/* Place Order Button */}
      <button
        onClick={handlePlaceOrder}
        disabled={orderMutation.isPending}
        className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition disabled:opacity-50 mt-4"
      >
        {orderMutation.isPending ? "Placing Order..." : "Place Order"}
      </button>

      {/* Invoice Modal */}
      {showInvoice && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}
    </div>
  );
};

export default Bill;