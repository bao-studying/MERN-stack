import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    // Cập nhật cách lấy kết quả từ Resend
    const { data, error } = await resend.emails.send({
      from: "BaoPo <onboarding@resend.dev>",
      to: options.email,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error("❌ Resend API trả về lỗi:", error);
      return null;
    }

    console.log("✅ Email sent API Success. ID:", data.id);
    return data;
  } catch (err) {
    console.error("❌ Lỗi hệ thống gửi mail:", err);
  }
};

export default sendEmail;
