import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Alert, Nav, Tab } from 'react-bootstrap';
import { FaSave, FaTimes, FaCamera, FaImage, FaLink } from 'react-icons/fa';
import axiosClient from '../../services/axiosClient';

const BrandModal = ({ show, handleClose, brand, refreshData }) => {
    const isEdit = !!brand;
    const fileInputRef = useRef(null);
    const [error, setError] = useState('');
    const [imageMode, setImageMode] = useState('upload'); // 'upload' hoặc 'link'

    // --- CÁCH CỨ (ADMIN PROFILE STYLE) ---
    // Khởi tạo state MỘT LẦN DUY NHẤT dựa vào prop 'brand' truyền vào
    // Khi prop 'key' ở cha thay đổi -> Component này bị hủy và tạo lại -> State được nạp lại mới
    const [formData, setFormData] = useState(() => {
        if (brand) {
            return {
                name: brand.name || '',
                description: brand.description || '',
                imageUrl: brand.imageUrl || '',
                isActive: brand.isActive !== undefined ? brand.isActive : true
            };
        }
        // Mặc định cho thêm mới
        return {
            name: '',
            description: '',
            imageUrl: '',
            isActive: true
        };
    });

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const formPayload = new FormData();
            formPayload.append('avatar', file);
            const res = await axiosClient.post('/auth/upload-avatar', formPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.success) {
                setFormData(prev => ({ ...prev, imageUrl: res.avatarUrl }));
            }
        } catch {
            setError("Lỗi upload ảnh.");
        }
    };

    const handleImageUrlChange = (url) => {
        setFormData(prev => ({ ...prev, imageUrl: url }));
    };

    const validateImageUrl = (url) => {
        if (!url) return true; // Cho phép để trống
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setError("Vui lòng nhập tên thương hiệu");
            return;
        }

        if (imageMode === 'link' && formData.imageUrl && !validateImageUrl(formData.imageUrl)) {
            setError("Link ảnh không hợp lệ");
            return;
        }

        try {
            if (isEdit) {
                await axiosClient.put(`/brands/${brand._id}`, formData);
            } else {
                await axiosClient.post('/brands', formData);
            }
            refreshData();
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered className="eco-modal">
            <Modal.Header className="border-0 bg-light">
                <Modal.Title className="fw-bold text-success">
                    {isEdit ? 'Cập nhật thương hiệu' : 'Thêm thương hiệu mới'}
                </Modal.Title>
                <button className="icon-btn border-0 ms-auto" onClick={handleClose}><FaTimes/></button>
            </Modal.Header>
            <Modal.Body className="p-4">
                {error && <Alert variant="danger">{error}</Alert>}

                {/* Chọn Ảnh Đại Diện */}
                <div className="text-center mb-4">
                    <div className="category-img-preview border rounded-3 d-flex align-items-center justify-content-center mx-auto position-relative bg-light overflow-hidden"
                        style={{width: '120px', height: '120px', borderStyle: 'dashed !important'}}>
                        {formData.imageUrl ? (
                            <img src={formData.imageUrl} alt="Preview" className="w-100 h-100 object-fit-cover" />
                        ) : (
                            <FaImage size={40} className="text-secondary opacity-50"/>
                        )}
                    </div>
                    <small className="text-muted mt-2 d-block">Logo thương hiệu</small>

                    {/* Tab chọn cách upload */}
                    <Tab.Container activeKey={imageMode} onSelect={(k) => setImageMode(k)}>
                        <Nav variant="pills" className="justify-content-center mt-3 mb-3" style={{fontSize: '0.875rem'}}>
                            <Nav.Item>
                                <Nav.Link eventKey="upload" className="px-3 py-1">
                                    <FaCamera className="me-1"/> Upload
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="link" className="px-3 py-1">
                                    <FaLink className="me-1"/> Link
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>

                        <Tab.Content>
                            <Tab.Pane eventKey="upload">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => fileInputRef.current.click()}
                                    className="rounded-pill"
                                >
                                    <FaCamera className="me-1"/> Chọn file ảnh
                                </Button>
                                <input type="file" ref={fileInputRef} className="d-none" onChange={handleImageChange} accept="image/*"/>
                            </Tab.Pane>

                            <Tab.Pane eventKey="link">
                                <Form.Control
                                    type="url"
                                    placeholder="Nhập link logo (https://...)"
                                    value={formData.imageUrl}
                                    onChange={(e) => handleImageUrlChange(e.target.value)}
                                    className="mt-2"
                                    style={{maxWidth: '300px', margin: '0 auto'}}
                                />
                                <Form.Text className="text-muted">
                                    Nhập URL trực tiếp của logo thương hiệu
                                </Form.Text>
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </div>

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small text-secondary">TÊN THƯƠNG HIỆU</Form.Label>
                        <Form.Control type="text" className="modern-input" value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Ví dụ: Nike, Adidas..."/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small text-secondary">MÔ TẢ</Form.Label>
                        <Form.Control as="textarea" rows={3} className="modern-input" value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small text-secondary">TRẠNG THÁI</Form.Label>
                        <Form.Select className="modern-input"
                            value={formData.isActive ? "true" : "false"}
                            onChange={(e) => setFormData({...formData, isActive: e.target.value === "true"})}
                        >
                            <option value="true">Hiển thị (Active)</option>
                            <option value="false">Ẩn (Hidden)</option>
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0 pe-4 pb-4">
                <Button variant="light" onClick={handleClose} className="rounded-pill px-4">Hủy</Button>
                <Button variant="success" onClick={handleSubmit} className="rounded-pill px-4 fw-bold shadow-sm">
                    <FaSave className="me-2"/> Lưu lại
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BrandModal;