import React, { useState } from "react";
import { FaCreditCard, FaUniversity, FaGooglePay, FaPhone, FaTimes, FaLock } from "react-icons/fa";
import { SiPhonepe } from "react-icons/si";

const FakePaymentModal = ({ onClose, onSuccess, amount }) => {
  const [method, setMethod] = useState("card");
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [netBankingBank, setNetBankingBank] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "number") {
      let formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formatted.length > 19) formatted = formatted.slice(0, 19);
      setCardDetails({ ...cardDetails, number: formatted });
      return;
    }
    
    if (name === "expiry") {
      let formatted = value.replace(/\//g, '');
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
      }
      setCardDetails({ ...cardDetails, expiry: formatted });
      return;
    }
    
    if (name === "cvv") {
      if (value.length <= 4) {
        setCardDetails({ ...cardDetails, cvv: value });
      }
      return;
    }
    
    setCardDetails({ ...cardDetails, [name]: value });
  };

  const upiApps = [
    { id: "gpay", name: "Google Pay", icon: <FaGooglePay size={24} />, color: "#4285F4" },
    { id: "phonepe", name: "PhonePe", icon: <SiPhonepe size={22} />, color: "#5F259F" },
    { id: "paytm", name: "Paytm", icon: "💰", color: "#00BAF2" },
    { id: "other", name: "Other UPI", icon: <FaUniversity size={20} />, color: "#6B7280" },
  ];

  const banks = [
    { id: "sbi", name: "State Bank of India", code: "SBIN" },
    { id: "hdfc", name: "HDFC Bank", code: "HDFC" },
    { id: "icici", name: "ICICI Bank", code: "ICIC" },
    { id: "axis", name: "Axis Bank", code: "UTIB" },
    { id: "kotak", name: "Kotak Mahindra Bank", code: "KKBK" },
    { id: "yes", name: "Yes Bank", code: "YESB" },
  ];

  const handlePay = () => {
    // Validate based on method
    if (method === "upi") {
      if (selectedUpiApp === "other" && !upiId) {
        alert("Please enter UPI ID");
        return;
      }
    } else if (method === "card") {
      if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 16) {
        alert("Please enter valid card number");
        return;
      }
      if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
        alert("Please enter valid expiry date");
        return;
      }
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        alert("Please enter valid CVV");
        return;
      }
      if (!cardDetails.name) {
        alert("Please enter card holder name");
        return;
      }
    } else if (method === "netbanking") {
      if (!netBankingBank) {
        alert("Please select a bank");
        return;
      }
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      // Call onSuccess FIRST, then close the modal
      onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-white text-xl font-bold">Razorpay</h2>
            <p className="text-blue-200 text-sm mt-1">Secure Payment Gateway</p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-700 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Amount Display */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Amount to Pay</span>
            <span className="text-2xl font-bold text-gray-800">₹{amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="px-6 py-4">
          <div className="flex gap-2 border-b border-gray-200 mb-4">
            <button
              onClick={() => setMethod("card")}
              className={`pb-3 px-4 text-sm font-medium transition relative ${
                method === "card"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaCreditCard className="inline mr-2 text-sm" />
              Card
            </button>
            <button
              onClick={() => setMethod("upi")}
              className={`pb-3 px-4 text-sm font-medium transition relative ${
                method === "upi"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaGooglePay className="inline mr-2 text-sm" />
              UPI
            </button>
            <button
              onClick={() => setMethod("netbanking")}
              className={`pb-3 px-4 text-sm font-medium transition relative ${
                method === "netbanking"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaUniversity className="inline mr-2 text-sm" />
              Net Banking
            </button>
          </div>

          {/* Card Form */}
          {method === "card" && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  name="number"
                  value={cardDetails.number}
                  onChange={handleCardChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiry"
                    value={cardDetails.expiry}
                    onChange={handleCardChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleCardChange}
                    placeholder="123"
                    maxLength="4"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Card Holder Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={cardDetails.name}
                  onChange={handleCardChange}
                  placeholder="AS PER CARD"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                />
              </div>
            </div>
          )}

          {/* UPI Form */}
          {method === "upi" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {upiApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedUpiApp(app.id)}
                    className={`p-3 rounded-xl border-2 transition flex items-center justify-center gap-2 ${
                      selectedUpiApp === app.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {typeof app.icon === "string" ? (
                      <span className="text-xl">{app.icon}</span>
                    ) : (
                      app.icon
                    )}
                    <span className="text-sm font-medium">{app.name}</span>
                  </button>
                ))}
              </div>

              {selectedUpiApp === "other" && (
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@bankname"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">e.g., 9876543210@apl</p>
                </div>
              )}

              {selectedUpiApp !== "other" && (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm">
                    You will be redirected to {upiApps.find(a => a.id === selectedUpiApp)?.name} app to complete payment
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Net Banking Form */}
          {method === "netbanking" && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Select Your Bank
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {banks.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => setNetBankingBank(bank.id)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition flex justify-between items-center ${
                        netBankingBank === bank.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-gray-700 font-medium">{bank.name}</span>
                      {netBankingBank === bank.id && (
                        <span className="text-blue-500 text-sm">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-black font-semibold py-3 rounded-lg transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : `Pay ₹${amount.toLocaleString()}`}
          </button>

          {/* Security Footer */}
          <div className="mt-4 text-center flex items-center justify-center gap-2 text-xs text-gray-400">
            <FaLock size={12} />
            <span>100% Secure Payments</span>
            <span>•</span>
            <span>Powered by Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FakePaymentModal;