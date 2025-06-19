import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Upload.css";

function UploadForm() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [email, setEmail] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setLoggedInEmail(storedEmail);
      setEmail(storedEmail);
    }
  }, []);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || !email) {
      alert("Please select file(s) and enter an email");
      return;
    }

    if (email !== loggedInEmail) {
      alert("You can only upload with your own logged-in email.");
      return;
    }

    if (isPremium && (!price || isNaN(price))) {
      alert("Please enter a valid price for a premium image.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file); // matches backend MultipartFile[] files
    });
    formData.append("email", email);
    formData.append("isPremium", isPremium);
    if (isPremium) {
      formData.append("price", price);
    }

    try {
      await axios.post("http://localhost:8080/api/photos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Upload successful!");
      navigate("/gallery");
    } catch (error) {
      alert("Upload failed.");
      console.error("Upload error:", error);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-box">
        <h2 className="upload-title">Upload Photos</h2>

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="file-input"
        />

        {selectedFiles.length > 0 && (
          <div className="file-preview">
            <ul>
              {selectedFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}

        <input
          type="email"
          value={email}
          disabled
          className="email-input"
        />

        <div className="premium-toggle">
          <label>
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
            />{" "}
            Mark as Premium
          </label>
        </div>

        {isPremium && (
          <input
            type="number"
            placeholder="Enter price (in INR)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="price-input"
          />
        )}

        <button onClick={handleUpload} className="upload-button">
          Upload
        </button>

        <button
          onClick={() => navigate("/gallery")}
          className="upload-button"
          style={{ marginTop: "10px", backgroundColor: "#6c757d" }}
        >
          Go to Gallery
        </button>
      </div>
    </div>
  );
}

export default UploadForm;
