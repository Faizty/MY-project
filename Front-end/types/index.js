// Example object structures in JavaScript (you can use these as defaults or mock data)

// Product
const product = {
  id: "",
  name: "",
  description: "",
  fullDescription: "",
  price: 0,
  discount: 0,
  image: "",
  images: [],
  category: "",
  brand: "",
  rating: 0,
  reviews: 0,
  stock: 0,
  createdAt: "",
  seller: "",
  specifications: [{ name: "", value: "" }],
  colors: ["Black"], // Optional, default
  features: []       // Optional, default
};

// Message
const message = {
  id: "",
  sellerId: "",
  buyerId: "",
  buyerName: "",
  productId: "",
  message: "",
  timestamp: "",
  isSellerReply: false
};

// Order
const order = {
  id: "",
  customerId: "",
  customerName: "",
  sellerId: "",
  products: [
    {
      id: "",
      name: "",
      price: 0,
      quantity: 0,
      image: ""
    }
  ],
  totalPrice: 0,
  status: "pending",
  createdAt: "",
  updatedAt: ""
};
