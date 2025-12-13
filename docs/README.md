# Quote Invoice Application

## Overview
The Quote Invoice Application is a web application designed to manage quotes, invoicing, scheduling, client lists, and product lists. It features a Node.js backend and a frontend built using HTMX or Vue.js, providing a seamless user experience.

## Features
- **Quotes Management**: Create, update, and retrieve quotes.
- **Invoicing**: Manage invoices, including creation and updates.
- **Client Management**: Add, update, and retrieve client information.
- **Product Management**: Manage product data, including adding and updating products.
- **Scheduling**: Create and manage schedules for appointments and tasks.
- **OAuth2 Authentication**: Secure user authentication and authorization.

## Project Structure
```
quote-invoice-app
├── src
│   ├── server.ts
│   ├── auth
│   │   ├── oauth2.ts
│   │   └── middleware.ts
│   ├── controllers
│   │   ├── quotes.ts
│   │   ├── invoices.ts
│   │   ├── clients.ts
│   │   ├── products.ts
│   │   └── scheduling.ts
│   ├── routes
│   │   ├── auth.ts
│   │   ├── quotes.ts
│   │   ├── invoices.ts
│   │   ├── clients.ts
│   │   ├── products.ts
│   │   └── scheduling.ts
│   ├── models
│   │   ├── Quote.ts
│   │   ├── Invoice.ts
│   │   ├── Client.ts
│   │   ├── Product.ts
│   │   └── User.ts
│   ├── types
│   │   └── index.ts
│   └── utils
│       └── index.ts
├── public
│   ├── index.html
│   ├── js
│   │   └── htmx.min.js
│   ├── css
│   │   └── styles.css
│   └── components
│       ├── quotes.html
│       ├── invoices.html
│       ├── clients.html
│       ├── products.html
│       └── scheduling.html
├── datas
│   └── .gitkeep
├── docs
│   └── README.md
├── configs
│   ├── database.ts
│   └── oauth2.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions
1. **Clone the Repository**: 
   ```
   git clone <repository-url>
   cd quote-invoice-app
   ```

2. **Install Dependencies**: 
   ```
   npm install
   ```

3. **Configure Environment Variables**: 
   Create a `.env` file in the root directory and set the necessary environment variables for database connection and OAuth2 credentials.

4. **Run the Application**: 
   ```
   npm start
   ```

5. **Access the Application**: 
   Open your browser and navigate to `http://localhost:10001` (or the port specified in your configuration).

## Usage Guidelines
- Use the navigation menu to access different sections of the application.
- Follow the prompts to create and manage quotes, invoices, clients, and products.
- Ensure you are authenticated to access protected routes.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.