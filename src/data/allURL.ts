export const URLs = {
  // TODO: Replace with your application's URLs
  // Example:
  // login: 'https://your-app.example.com/login',
  // dashboard: 'https://your-app.example.com/dashboard',
  login: process.env.BASE_URL ? `${process.env.BASE_URL}/login` : 'http://localhost:3000/login',
  dashboard: process.env.BASE_URL ? `${process.env.BASE_URL}/dashboard` : 'http://localhost:3000/dashboard',
};
