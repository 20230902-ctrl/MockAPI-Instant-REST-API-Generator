const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); 

// Kết nối tới Database Supabase sử dụng thông tin từ file .env
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. Endpoint phục vụ Frontend: Tạo mới một API giả lập
app.post('/api/create-mock', async (req, res) => {
    const { path, data } = req.body;

    if (!path || !data) {
        return res.status(400).json({ error: "Thiếu thông tin đường dẫn hoặc dữ liệu JSON" });
    }

    // Lưu dữ liệu vào bảng mock_endpoints trên Supabase
    const { data: insertedData, error } = await supabase
        .from('mock_endpoints')
        .insert([{ endpoint_path: path.toLowerCase(), json_data: data }])
        .select();

    if (error) {
        console.error(error);
        return res.status(500).json({ error: "Đường dẫn này đã tồn tại hoặc database bị lỗi" });
    }

    res.json({ 
        message: "Tạo API thành công!", 
        mockUrl: `http://localhost:${process.env.PORT}/get-mock/${path.toLowerCase()}` 
    });
});

// 2. Endpoint động: Lấy dữ liệu giả lập dựa vào đường dẫn (path)
app.get('/get-mock/:path', async (req, res) => {
    const { path } = req.params;

    // Truy vấn dữ liệu từ database
    const { data, error } = await supabase
        .from('mock_endpoints')
        .select('json_data')
        .eq('endpoint_path', path.toLowerCase())
        .single();

    if (error || !data) {
        return res.status(404).json({ error: "Không tìm thấy API này!" });
    }

    // Trả về dữ liệu JSON gốc mà người dùng đã lưu
    res.json(data.json_data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend Server đang chạy tại port ${PORT}`));