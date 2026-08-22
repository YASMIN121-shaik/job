const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
  ],

  methods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: true,
};

module.exports = corsOptions;