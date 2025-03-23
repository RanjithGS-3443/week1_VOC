import axios from "axios";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaCreditCard, FaDollarSign, FaUser } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PaymentPage() {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [winner, setWinner] = useState(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCVV] = useState("");

  // ✅ Fetch product & highest bid details
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/products/${id}`)
      .then((response) => {
        const productData = response.data;
        setProduct(productData);

        if (productData.bids.length > 0) {
          const highestBid = productData.bids[productData.bids.length - 1]; // Get last bid
          setWinner(highestBid);
        } else {
          toast.error("❌ No bids found! Redirecting to home...");
          setTimeout(() => navigate("/"), 2000);
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching product details:", error);
        toast.error("❌ Failed to load product. Redirecting...");
        setTimeout(() => navigate("/"), 2000);
      });
  }, [id, navigate]);

  // ✅ Handle Payment Submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    // Validate card details
    if (cardNumber.length !== 16 || !expiryDate || cvv.length !== 3) {
      toast.error("❌ Invalid payment details!");
      return;
    }

    try {
      // Mock payment processing
      toast.success("✅ Payment Successful! Redirecting...");
      setTimeout(() => navigate(`/payment-success/${id}`), 2000);
    } catch (error) {
      console.error("❌ Payment Error:", error);
      toast.error("❌ Payment failed. Try again!");
    }
  };

  if (!product || !winner) {
    return <h2 className="text-center mt-5 text-danger">Loading Payment Details...</h2>;
  }

  return (
    <div className="container mt-5">
      <ToastContainer />
      <h2 className="text-center text-primary">
        <FaCreditCard className="me-2" /> Payment for {product.name}
      </h2>
      <div className="card shadow-lg border-0 mt-4 p-4">
        <h4 className="text-center">
          <FaUser className="me-2 text-success" /> Winner: <strong>{winner.bidderName}</strong>
        </h4>
        <h5 className="text-center text-danger">
          <FaDollarSign className="me-2" /> Final Amount: ${winner.bidAmount}
        </h5>

        {/* Payment Form */}
        <form onSubmit={handlePaymentSubmit} className="mt-4">
          <div className="mb-3">
            <label className="form-label fw-bold">Card Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter 16-digit card number"
              maxLength="16"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            />
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Expiry Date</label>
              <input
                type="month"
                className="form-control"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">CVV</label>
              <input
                type="password"
                className="form-control"
                placeholder="3-digit CVV"
                maxLength="3"
                value={cvv}
                onChange={(e) => setCVV(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-success w-100 mt-3">
            <FaCheckCircle className="me-2" /> Pay ${winner.bidAmount}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PaymentPage;
