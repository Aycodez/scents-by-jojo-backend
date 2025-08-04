import Product from "../models/product.mjs";

export const createProduct = async (req, res) => {
  try {
    const imageUrls = await req.files.map((file) => ({
      url: file.path,
      alt: file.originalname,
    }));

    const product = new Product({
      ...req.body,
      images: imageUrls,
    });

    await product.save();

    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });

    const updatedFields = req.body;
    const existingImage = product.images?.[0];
    const newFile = req.files?.[0];

    // If a new image was uploaded
    if (newFile) {
      const newImageUrl = newFile.path;

      if (!existingImage || existingImage.url !== newImageUrl) {
        // // Delete old image from Cloudinary
        // if (existingImage?.public_id) {
        //   await cloudinary.uploader.destroy(existingImage.public_id);
        // }

        // Replace with new image
        product.images = [
          {
            url: newImageUrl,
            public_id: newFile.filename,
          },
        ];
      }
    }

    // Update other fields
    Object.assign(product, updatedFields);

    await product.save();

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find().skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};
