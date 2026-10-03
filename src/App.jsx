import { useState, useEffect } from "react";
const PAYCHANGU_PUBLIC_KEY ="PUB-TEST-SWqizBf7CVBhvA6zr4vFfAIokc8BkwTc"
import "./App.css";

function App() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
const [loginPassword, setLoginPassword] = useState("");
  const [showOwnerDashboard, setShowOwnerDashboard] = useState(false);
  const [showEditBusiness, setShowEditBusiness] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [submittedBusinesses, setSubmittedBusinesses] = useState([]);
  useEffect(() => {
  fetch("http://localhost:5000/api/businesses")
    .then((response) => response.json())
    .then((data) => {
      setSubmittedBusinesses(data);
    })
    .catch((error) => {
      console.error("Could not load businesses:", error);
    });
}, []);
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const payment = params.get("payment");
  const txRef = params.get("tx_ref");

  if (payment === "success" && txRef) {
    fetch(`/api/payment-status/${txRef}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "paid" && data.business) {
          setSubmittedBusinesses((previous) => [
            ...previous,
            {
              ...data.business,
              txRef: txRef
            }
          ]);

          alert("Payment successful! Your business is now active.");
        }
      })
      .catch((error) => {
        console.error(error);
      });
      fetch("/api/businesses")
  .then((response) => response.json())
  .then((data) => {
    setSubmittedBusinesses(data);
  })
  .catch((error) => {
    console.error(error);
  });
  }
}, []);
useEffect(() => {
  if (!showCheckout || !paymentReference || !email || !duration) {
    return;
  }

  if (!window.PayChangu) {
    console.error("PayChangu checkout script is not loaded");
    return;
  }

  const checkout = window.PayChangu.mountCheckoutForm({
    target: "#paychangu-checkout",
    publicKey: PAYCHANGU_PUBLIC_KEY,
    formKey: "yamiss-business-advertising",
    email: email,
    amount: Number(duration),
    paymentReference: paymentReference,
    type: "standard",
    config: {
      name: "Yamiss Advertising",
      currency: "MWK",
      show_amount: false
    },
    onSuccess(payment) {
      console.log("Payment successful:", payment);
    },
    onError(error) {
      console.error("Payment error:", error);
    }
  });

  return () => {
    if (checkout && checkout.unmount) {
      checkout.unmount();
    }
  };
}, [showCheckout, paymentReference, email, duration]);
  
  const businesses = [
  {
    name: "Mika Restaurant",
    category: "Restaurants",
    location: "Lilongwe",
  },
  {
    name: "Malawi Fashion Shop",
    category: "Fashion",
    location: "Blantyre",
  },
  {
    name: "Tech Zone",
    category: "Electronics",
    location: "Mzuzu",
  },
  {
    name: "Yamiss Auto Services",
    category: "Automotive",
    location: "Lilongwe",
  },
];

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          <span>Y</span>amiss
        </div>

        <nav>
          <a href="#home">Home</a>
          <a href="#businesses">Businesses</a>
          <a href="#categories">Categories</a>
          <a href="#discussions">Discussions</a>
        </nav>

        <div className="nav-buttons">
          <button
  className="login-btn"
  onClick={() => setShowLogin(true)}
>
  Log in
</button>
         onClick={() => {
  if (selectedBusiness) {
    setShowOwnerDashboard(true);
  } else {
    setShowLogin(true);
  }
}}
          <button className="add-btn" onClick={() => setShowForm(true)}>
  Advertise
</button>
        </div>
      </header>
      {showLogin && (
  <section className="login-form">
    <h2>Log in</h2>

    

    <input
  type="email"
  placeholder="Email address"
  value={loginEmail}
  onChange={(e) => setLoginEmail(e.target.value)}
/>
<input
  type="password"
  placeholder="Password"
  value={loginPassword}
  onChange={(e) => setLoginPassword(e.target.value)}
/>

    <button
  onClick={async () => {
    try {
      const response = await fetch("http://localhost:5000/api/owner-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      alert("Login successful!");
      console.log("Owner business:", data.business);
      setSelectedBusiness(data.business);
setShowOwnerDashboard(true);
setShowLogin(false);
    } catch (error) {
      console.error(error);
      alert("Could not connect to the server");
    }
  }}
>
  Log in
</button>

    <button
      onClick={() => setShowLogin(false)}
    >
      Cancel
    </button>
  </section>
)}
     {showOwnerDashboard && (
  <section className="owner-dashboard">
    <h2>My Business</h2>

    {selectedBusiness ? (
      <div className="owner-business-card">
      {selectedBusiness.image && (
  <img
    src={selectedBusiness.image}
    alt={selectedBusiness.name}
    className="owner-business-image"
  />
)}

        <h3>{selectedBusiness.name}</h3>

        <p>
          <strong>Category:</strong> {selectedBusiness.category}
        </p>

        <p>
          <strong>Location:</strong> {selectedBusiness.location}
        </p>

        <p>
          <strong>Phone:</strong> {selectedBusiness.phone}
        </p>

        <p>
          <strong>WhatsApp:</strong> {selectedBusiness.whatsapp || "Not provided"}
        </p>
        <p>
  <strong>Description:</strong>{" "}
  {selectedBusiness.description || "Not provided"}
</p>

        <p>
          <strong>Status:</strong> {selectedBusiness.status}
        </p>

        <p>
  <strong>Advertising:</strong>{" "}
  {selectedBusiness.duration === "3000"
    ? "5 days"
    : selectedBusiness.duration === "6000"
    ? "10 days"
    : selectedBusiness.duration === "9000"
    ? "15 days"
    : "Not available"}
</p>

        <p>
          <strong>Expires:</strong>{" "}
          {selectedBusiness.expiresAt
            ? new Date(selectedBusiness.expiresAt).toLocaleDateString()
            : "Not available"}
        </p>
        <button
 onClick={() => setShowEditBusiness(true)}
>
  Edit Business
</button>
<button
  onClick={() => alert("Edit business coming next")}
>
  Edit Business
</button>

        <button
          onClick={() => setShowOwnerDashboard(false)}
        >
          Close
        </button>

      </div>
    ) : (
      <p>No business information found.</p>
    )}
  </section>
)}
{showEditBusiness && selectedBusiness && (
  <section className="edit-business-form">
    <h2>Edit Business</h2>

    <input
      type="text"
      value={selectedBusiness.name}
      onChange={(e) =>
        setSelectedBusiness({
          ...selectedBusiness,
          name: e.target.value
        })
      }
    />

    <input
      type="text"
      value={selectedBusiness.location}
      onChange={(e) =>
        setSelectedBusiness({
          ...selectedBusiness,
          location: e.target.value
        })
      }
    />

    <input
      type="text"
      value={selectedBusiness.phone}
      onChange={(e) =>
        setSelectedBusiness({
          ...selectedBusiness,
          phone: e.target.value
        })
      }
    />

    <textarea
      value={selectedBusiness.description || ""}
      onChange={(e) =>
        setSelectedBusiness({
          ...selectedBusiness,
          description: e.target.value
        })
      }
    />

    <button onClick={() => setShowEditBusiness(false)}>
      Save Changes
    </button>

    <button onClick={() => setShowEditBusiness(false)}>
      Cancel
    </button>
  </section>
)}

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="welcome">WELCOME TO YAMISS</p>

            <h1>
              Discover businesses
              <br />
              <span>around you.</span>
            </h1>

            <p className="hero-text">
              Find shops, restaurants, services and businesses in Malawi.
              Discover new places and connect with businesses easily.
            </p>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search for a business..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select>
                <option>All categories</option>
                <option>Restaurants</option>
                <option>Fashion</option>
                <option>Beauty</option>
                <option>Electronics</option>
                <option>Automotive</option>
                <option>Accommodation</option>
                <option>Other services</option>
              </select>

              <button
  onClick={() => {
    const results = [...businesses, ...submittedBusinesses].filter((business) =>
      business.name.toLowerCase().includes(search.toLowerCase()) ||
      business.category.toLowerCase().includes(search.toLowerCase()) ||
      business.location.toLowerCase().includes(search.toLowerCase())
    );

    alert(
      results.length > 0
        ? results.map((business) => `${business.name} - ${business.location}`).join("\n")
        : "No businesses found."
    );
  }}
>
  Search
</button>
            </div>
          </div>
        </section>
       <section className="section" id="businesses">
  <div className="marketplace-layout">

    {/* Filters */}
    <aside className="business-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        <button onClick={() => setSearch("")}>Clear All</button>
      </div>

      <div className="filter-group">
        <h4>Category</h4>

        <button onClick={() => setSearch("")}>
          All Categories
        </button>

        <button onClick={() => setSearch("Restaurant")}>
          Restaurant
        </button>

        <button onClick={() => setSearch("Fashion")}>
          Fashion
        </button>

        <button onClick={() => setSearch("Beauty")}>
          Beauty & Salon
        </button>

        <button onClick={() => setSearch("Electronics")}>
          Electronics
        </button>

        <button onClick={() => setSearch("Automotive")}>
          Automotive
        </button>

        <button onClick={() => setSearch("Accommodation")}>
          Accommodation
        </button>

        <button onClick={() => setSearch("Agriculture")}>
          Agriculture
        </button>
      </div>

      <div className="filter-group">
        <h4>Location</h4>

        <button onClick={() => setSearch("Lilongwe")}>
          Lilongwe
        </button>

        <button onClick={() => setSearch("Blantyre")}>
          Blantyre
        </button>

        <button onClick={() => setSearch("Mzuzu")}>
          Mzuzu
        </button>

        <button onClick={() => setSearch("Zomba")}>
          Zomba
        </button>

        <button onClick={() => setSearch("Kasungu")}>
          Kasungu
        </button>
      </div>
    </aside>

    {/* Businesses */}
    <div className="business-results">

      <div className="business-results-header">
        <div>
          <p className="small-title">YAMISS</p>
          <h2>Businesses around you</h2>
          <p>Discover businesses and services in Malawi.</p>
        </div>
      </div>

      <div className="business-grid">
        {submittedBusinesses
          .filter(
            (business) =>
              business.status === "active" &&
              new Date(business.expiresAt) > new Date()
          )
          .map((business, index) => (
            <div
              className="business-card"
              key={business.txRef || index}
            >

              {business.image ? (
  <img
    src={business.image}
    alt={business.name}
    className="business-image"
  />
) : (
  <div className="business-image business-image-placeholder">
    No image
  </div>
)}

              <div className="business-card-content">

                <div className="business-status">
                  Active
                </div>

                <h3>{business.name}</h3>

                <p className="business-category">
                  {business.category}
                </p>

                <p className="business-location">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"
                    />
                  </svg>

                  <span>{business.location}</span>
                </p>

                <p className="business-description">
                  {business.description}
                </p>

                <div className="business-actions">

                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="call-button"
                      aria-label="Call"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          d="M6.6 10.8c1.4 2.8 3.7 5.1 6.5 6.5l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.3 21 3 12.7 3 2.8c0-.6.4-1 1-1h3.6c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1l-2.3 2.1z"
                        />
                      </svg>
                    </a>
                  )}

                  {business.whatsapp && (
                    <a
                      href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-button"
                      aria-label="WhatsApp"
                    >
                      <svg
                        viewBox="0 0 448 512"
                        width="23"
                        height="23"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          d="M380.9 97.1C339-1.5 223.1-42.2 124.5 0 29.2 41-17.2 151.5 1.2 252.3L0 256l-15.4 56.4 57.9-15.2c28.8 15.8 61.2 24.1 94.7 24.1h.1c110.6 0 200.6-90 200.6-200.6 0-53.5-20.8-103.8-58.5-141.6zM224.3 338.5h-.1c-29.6 0-58.6-7.9-84-22.9l-6-3.6-34.4 9 9.2-33.5-3.9-6.1c-16.2-25.7-24.7-55.4-24.7-85.9 0-89 72.5-161.5 161.6-161.5 43.1 0 83.6 16.8 114.1 47.3 30.5 30.5 47.3 71 47.3 114.1-.1 89.1-72.6 161.6-161.1 161.6zm88.2-121.1c-4.8-2.4-28.4-14-32.8-15.6-4.4-1.6-7.6-2.4-10.8 2.4-3.2 4.8-12.4 15.6-15.2 18.8-2.8 3.2-5.6 3.6-10.4 1.2-4.8-2.4-20.3-7.5-38.6-23.9-14.3-12.8-23.9-28.5-26.7-33.3-2.8-4.8-.3-7.4 2.1-9.8 2.2-2.2 4.8-5.6 7.2-8.4 2.4-2.8 3.2-4.8 4.8-8 .8-1.6.4-6-1.6-8.4-2-2.4-10.8-26-14.8-35.6-3.9-9.4-7.9-8.1-10.8-8.2-2.8-.1-6-.1-9.2-.1-3.2 0-8.4 1.2-12.8 6-4.4 4.8-16.8 16.4-16.8 40s17.2 46.4 19.6 49.6c2.4 3.2 33.8 51.6 81.8 72.3 11.4 4.9 20.3 7.8 27.2 10 11.4 3.6 21.8 3.1 30 1.9 9.2-1.4 28.4-11.6 32.4-22.8 4-11.2 4-20.8 2.8-22.8-1.2-2-4.4-3.2-9.2-5.6z"
                        />
                      </svg>
                    </a>
                  )}

                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  </div>
</section> 

        <section className="section" id="categories">
          <div className="section-heading">
            <div>
              <p className="small-title">EXPLORE</p>
              <h2>Popular categories</h2>
            </div>
            <a href="#businesses">View all →</a>
          </div>

          <div className="category-grid">
            <div className="category-card">
              <div className="category-icon">🍽️</div>
              <h3>Restaurants</h3>
              <p>Find places to eat</p>
            </div>

            <div className="category-card">
              <div className="category-icon">👕</div>
              <h3>Fashion</h3>
              <p>Clothes and accessories</p>
            </div>

            <div className="category-card">
              <div className="category-icon">💇</div>
              <h3>Beauty</h3>
              <p>Salons and beauty services</p>
            </div>

            <div className="category-card">
              <div className="category-icon">📱</div>
              <h3>Electronics</h3>
              <p>Phones and technology</p>
            </div>

            <div className="category-card">
              <div className="category-icon">🚗</div>
              <h3>Automotive</h3>
              <p>Cars and car services</p>
            </div>

            <div className="category-card">
              <div className="category-icon">🏨</div>
              <h3>Accommodation</h3>
              <p>Hotels and lodges</p>
            </div>
          </div>
        </section>

        <section className="section businesses" id="businesses">
          <div className="section-heading">
            <div>
              <p className="small-title">DISCOVER</p>
              <h2>Featured businesses</h2>
            </div>
            <a href="#businesses">See more →</a>
          </div>

          <div className="business-grid">
            <div className="business-card">
              <div className="business-image">🏪</div>

              <div className="business-info">
                <span className="tag">SHOP</span>
                <h3>Your Business Could Be Here</h3>
                <p>📍 Malawi</p>
                <p className="description">
                  Advertise your business and reach more customers.
                </p>
                <button className="view-btn">View business</button>
              </div>
            </div>

            <div className="business-card">
              <div className="business-image">🍴</div>

              <div className="business-info">
                <span className="tag">RESTAURANT</span>
                <h3>Your Restaurant Could Be Here</h3>
                <p>📍 Malawi</p>
                <p className="description">
                  Put your business in front of people looking for you.
                </p>
                <button className="view-btn">View business</button>
              </div>
            </div>

            <div className="business-card">
              <div className="business-image">💼</div>

              <div className="business-info">
                <span className="tag">SERVICE</span>
                <h3>Promote Your Business</h3>
                <p>📍 Malawi</p>
                <p className="description">
                  Create your business profile on Yamiss.
                </p>
                <button className="view-btn">View business</button>
              </div>
            </div>
          </div>
        </section>

        <section className="advertise" id="advertise">
          <div>
            <p className="small-title">FOR BUSINESS OWNERS</p>
            <h2>Want more customers?</h2>
            <p>
              Add your business to Yamiss and let customers discover what you
              offer.
            </p>
          </div>

          <button className="advertise-button" onClick={() => setShowForm(true)}>
            Add your business →
          </button>
        </section>

        <section className="section" id="discussions">
          <div className="section-heading">
            <div>
              <p className="small-title">COMMUNITY</p>
              <h2>Discussions</h2>
            </div>
            <a href="#discussions">View discussions →</a>
          </div>

          <div className="discussion-card">
            <div className="discussion-icon">💬</div>

            <div>
              <h3>Join the Yamiss community</h3>
              <p>
                Ask questions, share recommendations and talk about businesses
                in your area.
              </p>
            </div>

            <button>Join discussion</button>
          </div>
        </section>
        {showForm && (
  <div className="business-form">
    <h2>Add Your Business</h2>

    <input
  type="text"
  placeholder="Business name"
  value={businessName}
  onChange={(e) => setBusinessName(e.target.value)}
  required
/>
    <input
  type="file"
  accept="image/*"
  multiple
  onChange={(e) => {
  const selectedImages = Array.from(e.target.files);
  setImages(selectedImages);
  setImage(selectedImages[0] || null);
}}
/>
   <select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  required
>
  <option value="">Select business category</option>
  <option>Restaurant</option>
  <option>Fashion</option>
  <option>Beauty & Salon</option>
  <option>Electronics</option>
  <option>Automotive</option>
  <option>Accommodation</option>
  <option>Grocery & Supermarket</option>
  <option>Construction</option>
  <option>Agriculture</option>
  <option>Transport</option>
  <option>Other</option>
</select>
    <select
  value={location}
  onChange={(e) => setLocation(e.target.value)}
  required
>
  <option value="">Select location</option>
  <option>Lilongwe</option>
  <option>Blantyre</option>
  <option>Mzuzu</option>
  <option>Zomba</option>
  <option>Kasungu</option>
  <option>Mangochi</option>
  <option>Salima</option>
  <option>Balaka</option>
  <option>Karonga</option>
  <option>Mzimba</option>
  <option>Dedza</option>
  <option>Ntcheu</option>
  <option>Mulanje</option>
  <option>Thyolo</option>
  <option>Chiradzulu</option>
  <option>Other</option>
</select>
   <input
  type="tel"
  placeholder="Phone number (e.g. 0999 123 456)"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  required
/>
<input
  type="email"
  placeholder="Email address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>
<input
  type="password"
  placeholder="Create a password"
  value={ownerPassword}
  onChange={(e) => setOwnerPassword(e.target.value)}
  required
/>
<input
  type="text"
  placeholder="WhatsApp number (optional)"
  value={whatsapp}
  onChange={(e) => setWhatsapp(e.target.value)}
/>
    <textarea
  placeholder="Describe your business"
  rows="5"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  required
></textarea>
<select
  value={duration}
  onChange={(e) => setDuration(e.target.value)}
  required
>
  <option value="">Select advertising duration</option>
  <option value="3000">5 days — MWK 3,000</option>
  <option value="6000">10 days — MWK 6,000</option>
  <option value="9000">15 days — MWK 9,000</option>
</select>

  
<button
  type="button"
onClick={async () => {
  try {
    const business = {
  name: businessName,
  category: category,
  location: location,
  phone: phone,
  whatsapp: whatsapp,
  description: description,
  duration: duration,
  email: email,
  ownerPassword: ownerPassword,
  image: image
  ? await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(image);
    })
  : null,

images: await Promise.all(
  images.map(
    (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      })
  )
),
};
    const response = await fetch("/api/create-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: duration,
        business: business
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Could not create payment");
      return;
    }

    window.location.href = data.checkout_url;

  } catch (error) {
    console.error(error);
    alert("Could not connect to the payment server");
  }
}}
>
  Submit Business
</button>
{showCheckout && (
  <div id="paychangu-checkout"></div>
)}
    <button
      type="button"
      onClick={() => setShowForm(false)}
    >
      Cancel
    </button>
  </div>
)}
      </main>

      <footer>
        <div className="footer-logo">Yamiss</div>
        <p>Discover. Connect. Grow.</p>

        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#businesses">Businesses</a>
          <a href="#categories">Categories</a>
          <a href="#discussions">Discussions</a>
          <a href="#advertise">Advertise</a>
        </div>

        <p className="copyright">
          © 2026 Yamiss. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;