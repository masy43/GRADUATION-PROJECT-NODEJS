const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
const httpStatusCode = require("../utils/httpStatusText");

const prisma = new PrismaClient();

exports.recommendProducts = asyncHandler(async (req, res) => {
  const { firebaseId } = req.params;

  const skinProfile = await prisma.skinProfile.findUnique({
    where: { firebaseId: firebaseId },
    include: { User: true, recommendations: true },
  });

  if (!skinProfile || skinProfile.firebaseId !== firebaseId) {
    return res.status(404).json({ error: "Skin profile not found or invalid" });
  }

  const skinType = skinProfile.skinType.toLowerCase();

  let recommendedProducts = [];
  switch (skinType) {
    case "oily":
    case "acne":
    case "oily s":
      recommendedProducts = await prisma.product.findMany({
        where: {
          skin_type: {
            in: ["Oily", "Acne", "Oily S"],
          },
        },
      });
      break;
    case "dry":
    case "dry s":
      recommendedProducts = await prisma.product.findMany({
        where: { skin_type: { in: ["Dry", "Dry S"] } },
      });
      break;
    case "normal":
    case "normal s":
      recommendedProducts = await prisma.product.findMany({
        where: { skin_type: { in: ["Normal", "Normal S"] } },
      });
      break;
    case "combination":
    case "combinational s":
      recommendedProducts = await prisma.product.findMany({
        where: { skin_type: { in: ["Combination", "Combinational S"] } },
      });
      break;
    default:
      return res
        .status(400)
        .json({ error: "Invalid skin type in the profile" });
  }

  const responseData = {
    products: recommendedProducts.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      product_image_url: product.product_image_url,
    })),
  };

  return res.status(200).json({
    status: httpStatusCode.Success,
    skinType:skinType,
    data: responseData,
  });
});
