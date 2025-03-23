import axios from "axios";
import { useEffect, useState } from "react";
import { FaBoxOpen, FaGavel, FaMoneyBillWave } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProductDetails() {
  const { id } = useParams(); // ✅ Get product ID from URL
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [bidHistory, setBidHistory] = useState([]); // Stores bidding history
  const [currentBid, setCurrentBid] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [bidderName, setBidderName] = useState("");
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds timer

  // ✅ Fetch product details & bid history from backend
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/products/${id}`)
      .then((response) => {
        console.log("✅ Product Data:", response.data);
        setProduct(response.data);
        setCurrentBid(response.data.highestBid || response.data.price);
        setBidHistory(response.data.bids || []);
      })
      .catch((error) => {
        console.error("❌ Error fetching product details:", error);
        setProduct(null);
      });
  }, [id]);

  // ✅ Handle Bid Submission
  const handleBidSubmit = async (e) => {
    e.preventDefault();
    const bidValue = parseFloat(bidAmount);

    // Basic validation
    if (!bidderName.trim()) {
      toast.error("Please enter your name!");
      return;
    }
    if (isNaN(bidValue) || bidValue <= currentBid) {
      toast.error("Bid must be higher than the current highest bid!");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/products/${id}/bid`, {
        bidderName,
        bidAmount: bidValue,
      });

      if (response.data.success) {
        toast.success("🎉 Bid placed successfully!");
        setCurrentBid(bidValue); // Update bid instantly
        setBidHistory([...bidHistory, { bidderName, bidAmount: bidValue }]); // Add to history
        setBidAmount(""); // Clear input field
        setBidderName(""); // Clear name field
        setTimeLeft(30); // Reset timer
      } else {
        toast.error("❌ Bid failed. Try again!");
      }
    } catch (error) {
      console.error("❌ Error placing bid:", error);
      toast.error("❌ Failed to place bid. Please try again!");
    }
  };

  // ✅ Countdown Timer Effect (Redirects to Payment Page)
  useEffect(() => {
    if (timeLeft === 0) {
      toast.success("⏳ Auction ended! Redirecting to payment...");
      setTimeout(() => navigate(`/payment/${id}`), 2000); // Redirect after 2 sec
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, navigate, id]);

  if (!product) {
    return <h2 className="text-center mt-5 text-danger">Product not found!</h2>;
  }

  return (
    <div className="container mt-5">
      <ToastContainer />
      <h2 className="text-center"><FaBoxOpen className="text-primary" /> {product.name}</h2>
      <div className="card shadow-lg border-0 mt-4 p-4">
        <img 
          src={`http://localhost:5000${product.imageUrl}`} 
          className="card-img-top rounded" 
          alt={product.name} 
          style={{ maxWidth: "500px", display: "block", margin: "auto" }} 
        />
        <div className="card-body">
          <h4 className="text-dark fw-bold text-center">
            Price: <span className="text-success">${product.price}</span>
          </h4>
          <h6 className="text-muted text-center">Category: {product.category}</h6>
          <p className="text-center mt-3">{product.description}</p>

          {/* 🔹 Bidding Section */}
          <hr />
          <h4 className="text-center text-primary"><FaGavel className="me-2" /> Bidding Section</h4>
          <h5 className="text-center text-success">
            <FaMoneyBillWave className="me-2" /> Current Highest Bid: ${currentBid}
          </h5>
          <h6 className="text-center text-danger fw-bold">⏳ Time Left: {timeLeft}s</h6>

          <form onSubmit={handleBidSubmit} className="mt-3 text-center">
            <input
              type="text"
              className="form-control w-50 d-inline mb-2"
              placeholder="Enter your name"
              value={bidderName}
              onChange={(e) => setBidderName(e.target.value)}
              required
            />
            <input
              type="number"
              className="form-control w-50 d-inline"
              placeholder="Enter your bid"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary ms-2">Place Bid</button>
          </form>

          {/* 🔹 Bid History */}
          <hr />
          <h5 className="text-center text-secondary">📜 Bidding History</h5>
          <ul className="list-group">
            {bidHistory.length > 0 ? (
              bidHistory.map((bid, index) => (
                <li key={index} className="list-group-item">
                  <strong>{bid.bidderName}</strong> - ${bid.bidAmount}
                </li>
              ))
            ) : (
              <li className="list-group-item text-center text-muted">No bids yet</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
