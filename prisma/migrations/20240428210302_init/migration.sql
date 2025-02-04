-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'PRODUCT_MANAGER', 'DELIVERYPARTNER');

-- CreateTable
CREATE TABLE "User" (
    "firebaseId" TEXT NOT NULL,
    "address" VARCHAR(255),
    "phoneNumber" VARCHAR(20),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "avatar" TEXT DEFAULT '/uploads/avatar2.png',

    CONSTRAINT "User_pkey" PRIMARY KEY ("firebaseId")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "brand" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "product_image_url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skin_type" TEXT NOT NULL,
    "stock_quantity" INTEGER NOT NULL,
    "isFavourite" BOOLEAN NOT NULL DEFAULT false,
    "isCart" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category_image_url" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "cartId" SERIAL NOT NULL,
    "totalPrice" DOUBLE PRECISION,
    "firebaseId" TEXT NOT NULL,
    "orderId" INTEGER,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("cartId")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "itemId" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cartId" INTEGER NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("itemId")
);

-- CreateTable
CREATE TABLE "SkinProfile" (
    "profileId" SERIAL NOT NULL,
    "skinType" TEXT NOT NULL,
    "firebaseId" TEXT,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),

    CONSTRAINT "SkinProfile_pkey" PRIMARY KEY ("profileId")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "itemId" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("itemId")
);

-- CreateTable
CREATE TABLE "Address" (
    "addressId" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "firebaseId" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("addressId")
);

-- CreateTable
CREATE TABLE "Order" (
    "orderId" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "firebaseId" TEXT NOT NULL,
    "addressId" INTEGER,
    "phoneNumber" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "Shipping" (
    "shippingId" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "shippingDate" TIMESTAMP(3) NOT NULL,
    "orderId" INTEGER NOT NULL,
    "deliveryPartnerId" INTEGER,

    CONSTRAINT "Shipping_pkey" PRIMARY KEY ("shippingId")
);

-- CreateTable
CREATE TABLE "DeliveryPartner" (
    "deliveryPartnerId" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "DeliveryPartner_pkey" PRIMARY KEY ("deliveryPartnerId")
);

-- CreateTable
CREATE TABLE "ProductManager" (
    "productMangerId" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "loginStatus" BOOLEAN NOT NULL,

    CONSTRAINT "ProductManager_pkey" PRIMARY KEY ("productMangerId")
);

-- CreateTable
CREATE TABLE "Admin" (
    "adminId" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "loginStatus" BOOLEAN NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("adminId")
);

-- CreateTable
CREATE TABLE "UserFavorite" (
    "id" SERIAL NOT NULL,
    "firebaseId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "UserFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedCartItem" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "firebaseId" TEXT NOT NULL,

    CONSTRAINT "SavedCartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RecommendedProducts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_DeliveryPartnerToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AdminToProductManager" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AdminToDeliveryPartner" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AdminToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_orderId_key" ON "Cart"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductManager_email_key" ON "ProductManager"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_RecommendedProducts_AB_unique" ON "_RecommendedProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_RecommendedProducts_B_index" ON "_RecommendedProducts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DeliveryPartnerToUser_AB_unique" ON "_DeliveryPartnerToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_DeliveryPartnerToUser_B_index" ON "_DeliveryPartnerToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AdminToProductManager_AB_unique" ON "_AdminToProductManager"("A", "B");

-- CreateIndex
CREATE INDEX "_AdminToProductManager_B_index" ON "_AdminToProductManager"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AdminToDeliveryPartner_AB_unique" ON "_AdminToDeliveryPartner"("A", "B");

-- CreateIndex
CREATE INDEX "_AdminToDeliveryPartner_B_index" ON "_AdminToDeliveryPartner"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AdminToUser_AB_unique" ON "_AdminToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_AdminToUser_B_index" ON "_AdminToUser"("B");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_firebaseId_fkey" FOREIGN KEY ("firebaseId") REFERENCES "User"("firebaseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("cartId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkinProfile" ADD CONSTRAINT "SkinProfile_firebaseId_fkey" FOREIGN KEY ("firebaseId") REFERENCES "User"("firebaseId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_firebaseId_fkey" FOREIGN KEY ("firebaseId") REFERENCES "User"("firebaseId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_firebaseId_fkey" FOREIGN KEY ("firebaseId") REFERENCES "User"("firebaseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("addressId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipping" ADD CONSTRAINT "Shipping_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipping" ADD CONSTRAINT "Shipping_deliveryPartnerId_fkey" FOREIGN KEY ("deliveryPartnerId") REFERENCES "DeliveryPartner"("deliveryPartnerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_firebaseId_fkey" FOREIGN KEY ("firebaseId") REFERENCES "User"("firebaseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecommendedProducts" ADD CONSTRAINT "_RecommendedProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecommendedProducts" ADD CONSTRAINT "_RecommendedProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "SkinProfile"("profileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeliveryPartnerToUser" ADD CONSTRAINT "_DeliveryPartnerToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "DeliveryPartner"("deliveryPartnerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeliveryPartnerToUser" ADD CONSTRAINT "_DeliveryPartnerToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("firebaseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToProductManager" ADD CONSTRAINT "_AdminToProductManager_A_fkey" FOREIGN KEY ("A") REFERENCES "Admin"("adminId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToProductManager" ADD CONSTRAINT "_AdminToProductManager_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductManager"("productMangerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToDeliveryPartner" ADD CONSTRAINT "_AdminToDeliveryPartner_A_fkey" FOREIGN KEY ("A") REFERENCES "Admin"("adminId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToDeliveryPartner" ADD CONSTRAINT "_AdminToDeliveryPartner_B_fkey" FOREIGN KEY ("B") REFERENCES "DeliveryPartner"("deliveryPartnerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToUser" ADD CONSTRAINT "_AdminToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Admin"("adminId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToUser" ADD CONSTRAINT "_AdminToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("firebaseId") ON DELETE CASCADE ON UPDATE CASCADE;
