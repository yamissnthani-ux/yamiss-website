const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const fs = require("fs");

const app = express();
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}
function verifyPassword(password, storedPassword) {
  if (!storedPassword) {
    return false;
  }

  // Support older passwords that were saved as normal text
  if (!storedPassword.includes(":")) {
    return password === storedPassword;
  }

  const [salt, storedHash] = storedPassword.split(":");

  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return hash === storedHash;
}
app.use(cors());
app.use(express.json({ limit: "20mb" }));
const frontendPath = path.join(__dirname, "..", "dist");

app.use(express.static(frontendPath));

// Temporary storage for payments while we are testing
const pendingPayments = new Map();
const businessesFile = path.join(__dirname, "data", "businesses.json");
function getBusinesses() {
  return JSON.parse(fs.readFileSync(businessesFile, "utf8"));
}

function saveBusinesses(businesses) {
  fs.writeFileSync(
    businessesFile,
    JSON.stringify(businesses, null, 2)
  );
}

app.get("/", (req, res) => {
  res.send("Yamiss payment server is running");
});
// Prepare a PayChangu Drop-in payment
app.post("/api/prepare-payment", (req, res) => {
  try {
    const { amount, business, email } = req.body;

    if (!amount || !business || !email) {
      return res.status(400).json({
        message: "Amount, business details and email are required"
      });
    }

    const txRef = `YAMISS-${Date.now()}`;

    pendingPayments.set(txRef, {
  business: {
    ...business,
    ownerPassword: hashPassword(business.ownerPassword)
  },
  amount: Number(amount),
  status: "pending"
});

    res.json({
      tx_ref: txRef
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to prepare payment"
    });
  }
});
// Create PayChangu payment
app.post("/api/create-payment", async (req, res) => {

  try {
    console.log("PREPARE PAYMENT DATA:", req.body);
    const { amount, business } = req.body;

    if (!amount || !business) {
      return res.status(400).json({
        message: "Amount and business details are required"
      });
    }

    const txRef = `YAMISS-${Date.now()}`;

    // Remember the business until payment is verified
    pendingPayments.set(txRef, {
      business,
      amount: Number(amount),
      status: "pending"
    });

    const response = await fetch("https://api.paychangu.com/payment", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: String(amount),
        currency: "MWK",
        tx_ref: txRef,
       callback_url: "https://yamiss-website.onrender.com/api/payment-callback",
return_url: "https://yamiss-website.onrender.com/",
        customization: {
          title: "Yamiss Advertising",
          description: `Advertising payment for ${business.name}`
        }
      })
    });

    const data = await response.json();
    console.log("PayChangu response:", data);

    if (!response.ok) {
      pendingPayments.delete(txRef);
      return res.status(response.status).json(data);
    }

    res.json({
      checkout_url: data.data.checkout_url,
      tx_ref: txRef
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to create payment",
      error: error.message
    });
  }
});

// PayChangu sends the customer here after payment
app.get("/api/payment-callback", async (req, res) => {
  try {
    const txRef = req.query.tx_ref;

    if (!txRef) {
      return res.status(400).send("Missing transaction reference");
    }

    const payment = pendingPayments.get(txRef);

    if (!payment) {
      return res.status(404).send("Payment not found");
    }

    // Verify payment directly with PayChangu
    const response = await fetch(
      `https://api.paychangu.com/verify-payment/${txRef}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
          Accept: "application/json"
        }
      }
    );

    const data = await response.json();

    if (
      response.ok &&
      data.status === "success" &&
      data.data &&
      data.data.status === "success" &&
      data.data.currency === "MWK" &&
      Number(data.data.amount) >= payment.amount
    ) {
      payment.status = "paid";
      payment.transaction = data.data;
      const businesses = getBusinesses();

const durationDays = {
  "3000": 5,
  "6000": 10,
  "9000": 15
};

const expiresAt = new Date();
expiresAt.setDate(
  expiresAt.getDate() + durationDays[payment.business.duration]
);
businesses.push({
  ...payment.business,
  txRef: txRef,
  paidAt: new Date().toISOString(),
  expiresAt: expiresAt.toISOString(),
  status: "active"
});

saveBusinesses(businesses);

      pendingPayments.set(txRef, payment);

      return res.redirect(
        `http://localhost:5173/?payment=success&tx_ref=${txRef}`
      );
    }

    payment.status = "failed";
    pendingPayments.set(txRef, payment);

    return res.redirect(
      `http://localhost:5173/?payment=failed&tx_ref=${txRef}`
    );

  } catch (error) {
    console.error(error);

    res.status(500).send("Payment verification failed");
  }
});
app.get("/api/businesses", (req, res) => {
  const businesses = getBusinesses();
  const now = new Date();

  const activeBusinesses = businesses.filter((business) => {
  return business.status === "active";
});

  res.json(activeBusinesses);
});

// Frontend checks payment status
app.get("/api/payment-status/:txRef", (req, res) => {
  
  const payment = pendingPayments.get(req.params.txRef);

  if (!payment) {
    return res.status(404).json({
      message: "Payment not found"
    });
  }

  res.json(payment);
});
app.post("/api/owner-login", (req, res) => {
  console.log("OWNER LOGIN REQUEST RECEIVED");
  try { 
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const businesses = getBusinesses();

    const business = businesses.find(
      (item) => item.email === email
    );

    if (!business || !business.ownerPassword) {
      return res.status(401).json({
       message: "EMAIL OR SAVED PASSWORD NOT FOUND"
      });
    }

    const validPassword = verifyPassword(
      password,
      business.ownerPassword
    );
    console.log("Password received:", password);
console.log("Stored password:", business.ownerPassword);
console.log("Password valid:", validPassword);

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

   const { ownerPassword, ...safeBusiness } = business;

res.json({
  message: "Login successful",
  business: safeBusiness
});
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Login failed"
    });
  }
});

const PORT = process.env.PORT || 5000;
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Yamiss server running on port ${PORT}`);
});
setInterval(() => {}, 1000);