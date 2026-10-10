require("dotenv").config();

const app = require("./app");
const pool = require("./database/connection");

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        const connection = await pool.getConnection();

        console.log("✅ MySQL Connected Successfully");

        connection.release();

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📡  http://localhost:${PORT}`);
        });

    } catch (error) {

        console.error("❌ Database Connection Failed");
        console.error(error.message);

        process.exit(1);

    }
}

startServer();