import React, { useEffect, useState } from "react";
import API from "../api";
import "./Gallery.css";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [purchased, setPurchased] = useState({});
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [activeTab, setActiveTab] = useState("free");

  const currentUserEmail = localStorage.getItem("email");

  useEffect(() => {
    API.get("/photos/all").then((res) => setPhotos(res.data));
  }, []);

  const handleDownload = async (id, fileName) => {
    const res = await API.get(`/photos/download/${id}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/photos/delete/${id}`, { params: { email: currentUserEmail } });
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      alert("Delete failed: " + (error.response?.data || error.message));
    }
  };

  const handleBuy = async (photo) => {
    try {
      const res = await API.post("/payment/create-order", {
        amount: photo.price * 100,
      });
      const order = res.data;

      const options = {
        key: "rzp_test_rnpC0YHsfjwTHS",
        amount: order.amount,
        currency: "INR",
        name: "Stock Photo App",
        description: `Buy ${photo.fileName}`,
        order_id: order.id,
        handler: function (response) {
          alert("✅ Payment successful!");
          setPurchased((prev) => ({ ...prev, [photo.id]: true }));
        },
        prefill: {
          email: currentUserEmail,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("Payment failed");
    }
  };

  const filteredPhotos = photos.filter((p) =>
    activeTab === "free" ? !p.isPremium : p.isPremium
  );

  return (
    <div className="gallery-container">
      <h1 className="gallery-title">Your Gallery</h1>

      {/* Tabs */}
      <div className="tab-selector">
        <button
          className={activeTab === "free" ? "tab active" : "tab"}
          onClick={() => setActiveTab("free")}
        >
          Free
        </button>
        <button
          className={activeTab === "premium" ? "tab active" : "tab"}
          onClick={() => setActiveTab("premium")}
        >
          Premium
        </button>
      </div>

      <div className="gallery-grid">
        {filteredPhotos.map((p) => (
          <div key={p.id} className="photo-card">
            {p.isPremium && <div className="premium-badge">Premium</div>}

            <img
              src={`${API.defaults.baseURL}/photos/view/${p.id}`}
              alt={p.fileName}
              onClick={() => setPreviewPhoto(`${API.defaults.baseURL}/photos/view/${p.id}`)}
            />

            <p>{p.fileName} by {p.uploadedBy}</p>

            <div className="photo-buttons">
              {p.isPremium ? (
                purchased[p.id] ? (
                  <button onClick={() => handleDownload(p.id, p.fileName)}>Download</button>
                ) : (
                  <button onClick={() => handleBuy(p)}>💰 Buy ₹{p.price}</button>
                )
              ) : (
                <button onClick={() => handleDownload(p.id, p.fileName)}>Download</button>
              )}

              {p.uploadedBy === currentUserEmail && (
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {previewPhoto && (
        <div className="modal-overlay" onClick={() => setPreviewPhoto(null)}>
          <div className="modal-content">
            <img src={previewPhoto} alt="Preview" />
          </div>
        </div>
      )}
    </div>
  );
}
