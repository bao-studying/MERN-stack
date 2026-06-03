import mongoose from "mongoose";

const { Schema } = mongoose;

const BlogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "https://placehold.co/600x400?text=Blog+Post",
    },
    // === THÊM 2 TRƯỜNG MỚI ===
    coverImage: {
      type: String,
      default: "",
    },
    midImage: {
      type: String,
      default: "",
    },
    // ========================
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    authorName: {
      type: String,
      trim: true,
      default: "Admin",
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware cho slug
BlogSchema.pre("save", async function () {
  if (this.title && (!this.slug || this.isModified("title"))) {
    let slugBase = this.title
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    this.slug = slugBase || `blog-${Date.now()}`;
  }
});

export default mongoose.model("Blog", BlogSchema);
