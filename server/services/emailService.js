// Mock Email Service
// Since setting up a real SMTP provider like SendGrid or Nodemailer requires credentials,
// this mock service simulates sending an email by printing to the server console.

const sendOrderConfirmation = async (email, orderDetails) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("\n" + "=".repeat(50));
            console.log("✉️  MOCK EMAIL SENT ✉️");
            console.log("=".repeat(50));
            console.log(`To: ${email}`);
            console.log(`Subject: Order Confirmation - ${orderDetails.tracking_number}`);
            console.log(`\nDear Customer,`);
            console.log(`Thank you for your order! Your payment was successful.`);
            console.log(`Tracking Number: ${orderDetails.tracking_number}`);
            console.log(`Total Amount: ${orderDetails.total_amount} RWF`);
            console.log(`Status: PAID`);
            console.log(`\nYou can track your order using your tracking number.`);
            console.log("=".repeat(50) + "\n");
            
            resolve(true);
        }, 1000); // Simulate network delay
    });
};

const sendWelcomeEmail = async (email, name) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("\n" + "=".repeat(50));
            console.log("✉️  MOCK EMAIL SENT ✉️");
            console.log("=".repeat(50));
            console.log(`To: ${email}`);
            console.log(`Subject: Welcome to E&J Bloomtech!`);
            console.log(`\nHi ${name},`);
            console.log(`Welcome to our store! We are so happy to have you.`);
            console.log(`Enjoy exploring our products and exclusive deals.`);
            console.log("=".repeat(50) + "\n");
            
            resolve(true);
        }, 1000);
    });
};

module.exports = {
    sendOrderConfirmation,
    sendWelcomeEmail
};
