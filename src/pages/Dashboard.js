import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((response) => {
        setAuctions(response.data);
      })
      .catch((error) => console.error("❌ Error fetching auctions:", error.message));
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">
        <i className="fas fa-gavel text-primary"></i> Ongoing Auctions
      </h2>

      <div className="row">
        {auctions.map((auction) => (
          <div className="col-md-6 col-lg-4 mb-4" key={auction._id}>
            <div className="card shadow-sm border-0">
              <img 
                src={auction.imageUrl.startsWith("/") ? `http://localhost:5000${auction.imageUrl}` : auction.imageUrl}
                className="card-img-top" 
                alt={auction.name} 
              />
              <div className="card-body">
                <h5 className="card-title">{auction.name}</h5>
                <p className="card-text text-success fw-bold">
                  ${auction.startingPrice}
                </p>
                {/* 🔹 Updated Link to ProductDetails.js */}
                <Link to={`/product/${auction._id}`} className="btn btn-outline-primary">
                  <i className="fas fa-eye"></i> View Auction
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
