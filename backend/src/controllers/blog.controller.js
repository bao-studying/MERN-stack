import Blog from "../models/blog.js";

export const getAllBlogs = async (req, res) => {
  try {
    const { limit = 10, sort = "-createdAt" } = req.query;
    const blogs = await Blog.find({ status: "published" })
      .sort(sort)
      .limit(Number(limit));

    return res.status(200).json({ success: true, blogs });
  } catch (error) {
    console.error("getAllBlogs error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể tải danh sách blog.",
    });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog không tìm thấy.",
      });
    }
    return res.status(200).json({ success: true, blog });
  } catch (error) {
    console.error("getBlogById error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể tải bài viết.",
    });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, imageUrl, status = "published" } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề và nội dung là bắt buộc.",
      });
    }

    const blog = await Blog.create({
      title,
      excerpt,
      content,
      imageUrl,
      status,
      author: req.user._id,
      authorName: req.user.name || req.user.email || "Admin",
      publishedAt: new Date(),
    });

    return res.status(201).json({ success: true, blog });
  } catch (error) {
    console.error("createBlog error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể tạo bài blog.",
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const blog = await Blog.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog không tồn tại.",
      });
    }

    return res.status(200).json({ success: true, blog });
  } catch (error) {
    console.error("updateBlog error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật bài blog.",
    });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog không tồn tại.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Blog đã được xóa.",
    });
  } catch (error) {
    console.error("deleteBlog error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể xóa bài blog.",
    });
  }
};
