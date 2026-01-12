# BeautyMate Backend

Welcome to the backend repository of BeautyMate, an innovative skincare and beauty application aimed at transforming how individuals engage with skincare products. This backend is written in TypeScript (Node.js + Express), and uses Prisma with PostgreSQL.

## About BeautyMate

BeautyMate stands at the forefront of innovation in the skincare and beauty domain, offering a transformative mobile application experience. The project aims to reshape how individuals engage with and select skincare products by leveraging cutting-edge technologies, particularly a sophisticated deep learning model.

## Features

- Accurate identification of users' skin types using a deep learning model
- Personalized skincare recommendations tailored to each user's needs
- Seamless image upload for skin analysis
- Comprehensive catalog of skincare products
- Virtual shopping cart, order placement, and real-time order tracking

## Technologies Used

- **Node.js**: Backend server environment
- **TypeScript**: Static typing + safer refactors
- **Prisma**: ORM (Object-Relational Mapping) for database interaction
- **PostgreSQL**: Relational database management system
- **Flutter**: Framework for cross-platform mobile app development
- **Deep Learning Model**: Sophisticated model for skin type identification
- **GitHub**: Version control and collaboration platform

## Getting Started

To get started with the BeautyMate backend:

1. Clone this repository to your local machine.
2. Install Node.js (LTS recommended).
3. Create a `.env` file (example values you likely need: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`).
4. Run `npm install`.
5. Run `npm run prisma:migrate` to apply database migrations.

### Run (development)

- `npm run dev`

### Run (production-like)

- `npm run build`
- `npm start`

## Contributing

Contributions are welcome! If you'd like to contribute to BeautyMate, please fork this repository, make your changes, and submit a pull request. Be sure to follow our [contributing guidelines](CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

If you have any questions or suggestions regarding BeautyMate, feel free to contact us at [masym32@gmail.com](mailto:masym32@gmail.com).
