import mongoose from "mongoose";
import slugify from "slugify";

const { Schema } = mongoose;

const BrandSchema = new Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    description: {type: String},
    imageUrl: {type: String},
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

BrandSchema.pre("save", async function () {
    // Nếu tên (name) có thay đổi, cập nhật lại slug
    if (this.isModified("name")) {
        // Tạo slug từ tên (ví dụ: "Nike" -> "nike")
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    // Trong async function của Mongoose, không cần gọi next()
});

export default mongoose.model("Brand", BrandSchema);