import { uploadFile } from "../services/upload.service.js";

export const upload = async (req, res) => {
  try {
    const result = await uploadFile(req.file);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};